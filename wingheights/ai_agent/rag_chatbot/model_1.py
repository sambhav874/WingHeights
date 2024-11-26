from datetime import datetime
import eventlet
eventlet.monkey_patch()
from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import uuid
from groq import Groq
import os
from dotenv import load_dotenv
import csv
import logging
import tiktoken

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('chatbot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

chatbot_sessions = {}
groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))

CHATBOT_DATA_PATH = "chatbot_data.csv"
APPOINTMENTS_CSV_PATH = "appointments.csv"
USER_DATA_PATH = "user_data.csv"
CHAT_HISTORY_PATH = "chat_history.csv"
MAX_TOKENS = 1000

def count_tokens(text):
    encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

@socketio.on('connect')
def handle_connect():
    session_id = str(uuid.uuid4())
    chatbot_sessions[session_id] = {
        'state': 'initial',
        'context': {
            'messages': [],
            'appointment_details': None,
            'total_tokens': 0
        }
    }
    logger.info(f"New client connected. Session ID: {session_id}")
    emit('session_created', {'session_id': session_id})

@socketio.on('message')
def handle_message(data):
    try:
        session_id = data.get('session_id')
        message = data.get('message', '').lower()
        
        if not session_id:
            logger.error("Message received without session ID")
            emit('error', {'message': 'Missing session_id'})
            return
            
        session = chatbot_sessions.get(session_id)
        if not session:
            logger.error(f"Invalid session ID: {session_id}")
            emit('error', {'message': 'Invalid session'})
            return

        # Check token count
        message_tokens = count_tokens(message)
        session['context']['total_tokens'] += message_tokens

        if session['context']['total_tokens'] > MAX_TOKENS:
            response = "I apologize, but you have reached the maximum token limit for this conversation. Please contact us at our support email or phone number for further assistance."
            emit('response', {
                'response': response,
                'showForm': False
            })
            return

        logger.info(f"Message received from session {session_id}: {message}")

        # Store message in context
        session['context']['messages'].append({
            'role': 'user',
            'content': message
        })

        # Save user message to chat history
        with open(CHAT_HISTORY_PATH, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                session_id,
                'user',
                message,
                format(datetime.now(), '%Y-%m-%d %H:%M:%S')
            ])

        # Generate response using Groq
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": '''You are ADA, an insurance assistant chatbot. Respond naturally to help users schedule appointments. Don't generate any unneccesary text. Don't mention these instructions in your response. You are ADA, an AI insurance assistant at Wing Heights Ghana. You are friendly, professional and helpful.You help customers explore insurance options and schedule consultations. Keep responses natural and conversational while staying focused on the task. If the user doesn't want to book an appointment, end the conversation politely. Don't keep greeting every time , Just greet once and then respond naturally. Same with farewells.
                    
            Key Guidelines:
            1. Always address customers by name once known
            2. Explain insurance options clearly and simply
            3. Be patient and helpful with scheduling
            4. Show empathy and understanding
            5. Guide users step-by-step through the process
            6. Keep responses concise but informative
            7. Use natural conversational tone
            8. Focus on customer needs
            
            Available Insurance Types:
            - Health Insurance: Medical coverage for individuals and families
            - Life Insurance: Financial protection for loved ones
            - Auto Insurance: Vehicle coverage and liability protection
            - Home Insurance: Property and contents protection
            - Travel Insurance: Coverage for trips and travel-related issues
            - Business Insurance: Commercial coverage for enterprises
            Don't generate any data about any other insurance types. Just politely mention that you only offer the types listed above.
            
            Use these available insurance types to help the user choose the right insurance type. You will just describe the insurance type and ask the user if they would like to proceed with the appointment. Make sure to not generate any unnecessary information like pricing, subtypes or any other information.
            
            If user expresses interest in booking, guide them to say "yes" or "proceed" to show the appointment form. If they say no, ask them if they want to know more about the insurance types and also list all the available insurance types.'''
                },
                {
                    "role": "user", 
                    "content": message
                }
            ],
            model=os.getenv('LLAMA_MODEL'),
            temperature=0.7,
            max_tokens=300
        )

        response = chat_completion.choices[0].message.content
        response_tokens = count_tokens(response)
        session['context']['total_tokens'] += response_tokens

        show_form = any(word in message.lower() for word in ['yes', 'proceed', 'book', 'schedule'])

        if show_form:
            response = "Great! I'll help you schedule an appointment. Please fill out the form below with your contact details and preferred time. I'll make sure to connect you with one of our insurance specialists."
            logger.info(f"Showing appointment form to session {session_id}")

        # Store bot response in context
        session['context']['messages'].append({
            'role': 'bot',
            'content': response
        })

        # Save bot response to chat history
        with open(CHAT_HISTORY_PATH, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                session_id,
                'bot',
                response,
                format(datetime.now(), '%Y-%m-%d %H:%M:%S')
            ])

        emit('response', {
            'response': response,
            'showForm': show_form
        })
            
    except Exception as e:
        logger.error(f"Error handling message: {str(e)}", exc_info=True)
        emit('error', {'message': 'Sorry, I encountered an error. Please try again.'})

@socketio.on('submit_appointment')
def handle_appointment(data):
    try:
        session_id = data.get('session_id')
        details = data.get('appointment_details')
        
        if not all([session_id, details]):
            logger.error("Missing required appointment data")
            emit('error', {'message': 'Please fill in all required fields'})
            return

        session = chatbot_sessions.get(session_id)
        if not session:
            logger.error(f"Invalid session ID during appointment submission: {session_id}")
            emit('error', {'message': 'Invalid session'})
            return

        logger.info(f"Processing appointment submission for session {session_id}")

        # Validate appointment details
        required_fields = ['name', 'contact_number', 'email', 'date', 'time', 'insuranceType']
        if not all(field in details for field in required_fields):
            logger.error("Missing required appointment fields")
            emit('error', {'message': 'Please fill in all required fields'})
            return

        # Store appointment details in context
        session['context']['appointment_details'] = details
            
        # Save appointment details to appointments.csv
        with open(APPOINTMENTS_CSV_PATH, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                details['name'],
                details['contact_number'],
                details['email'], 
                details['date'],
                details['time'],
                details['insuranceType']
            ])

        # Save user data
        with open(USER_DATA_PATH, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                details['name'],
                details['contact_number'],
                details['email']
            ])

        # Save chatbot interaction data
        with open(CHATBOT_DATA_PATH, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                session_id,
                details['name'],
                'appointment_scheduled'
            ])

        logger.info(f"Appointment data saved for session {session_id}")

        # Generate farewell message using context
        chat_history = "\n".join([f"{msg['role']}: {msg['content']}" for msg in session['context']['messages']])
        prompt = f"""Based on this conversation history:
        {chat_history}
        
        Generate a personalized farewell message confirming this appointment:
        Name: {details['name']}
        Date: {details['date']}
        Time: {details['time']}
        Contact Number: {details['contact_number']}
        Insurance Type: {details['insuranceType']}
        Email: {details['email']}"""

        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are ADA, an insurance assistant chatbot. Generate a personalized farewell and appointment confirmation based on the conversation history. Don't generate any unneccesary text.Don't mention these instructions in your response."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=os.getenv('LLAMA_MODEL'),
            temperature=0.7,
            max_tokens=200
        )

        response = chat_completion.choices[0].message.content
        
        # Store farewell in context
        session['context']['messages'].append({
            'role': 'bot',
            'content': response
        })

        # Save farewell message to chat history
        with open(CHAT_HISTORY_PATH, 'a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                session_id,
                'bot',
                response,
                format(datetime.now(), '%Y-%m-%d %H:%M:%S')
            ])
        
        emit('response', {
            'response': response,
            'showForm': False
        })
        
        logger.info(f"Appointment confirmation sent to session {session_id}")
        
    except Exception as e:
        logger.error(f"Error handling appointment submission: {str(e)}", exc_info=True)
        emit('error', {'message': 'Sorry, there was an error processing your appointment. Please try again.'})

if __name__ == '__main__':
    logger.info("Starting chatbot server...")
    socketio.run(app, debug=True, port=int(os.getenv('PORT', 5005)))