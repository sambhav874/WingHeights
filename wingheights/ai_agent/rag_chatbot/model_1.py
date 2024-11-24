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

@socketio.on('connect')
def handle_connect():
    session_id = str(uuid.uuid4())
    chatbot_sessions[session_id] = {
        'state': 'initial',
        'context': {
            'messages': [],
            'appointment_details': None
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

        logger.info(f"Message received from session {session_id}: {message}")

        # Store message in context
        session['context']['messages'].append({
            'role': 'user',
            'content': message
        })

        # Generate response using Groq
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are ADA, an insurance assistant chatbot. Respond naturally to help users schedule appointments. Don't generate any unneccesary text."
                },
                {
                    "role": "user", 
                    "content": message
                }
            ],
            model=os.getenv('LLAMA_MODEL'),
            temperature=0.7,
        )

        response = chat_completion.choices[0].message.content
        show_form = 'yes' in message.lower() or 'proceed' in message.lower()

        if show_form:
            response = "Please provide your details below to schedule the appointment."
            logger.info(f"Showing appointment form to session {session_id}")

        # Store bot response in context
        session['context']['messages'].append({
            'role': 'bot',
            'content': response
        })

        emit('response', {
            'response': response,
            'showForm': show_form
        })
            
    except Exception as e:
        logger.error(f"Error handling message: {str(e)}", exc_info=True)
        emit('error', {'message': str(e)})

@socketio.on('submit_appointment')
def handle_appointment(data):
    try:
        session_id = data.get('session_id')
        details = data.get('appointment_details')
        
        if not all([session_id, details]):
            logger.error("Missing required appointment data")
            emit('error', {'message': 'Missing required data'})
            return

        session = chatbot_sessions.get(session_id)
        if not session:
            logger.error(f"Invalid session ID during appointment submission: {session_id}")
            emit('error', {'message': 'Invalid session'})
            return

        logger.info(f"Processing appointment submission for session {session_id}")

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
        )

        response = chat_completion.choices[0].message.content
        
        # Store farewell in context
        session['context']['messages'].append({
            'role': 'bot',
            'content': response
        })
        
        emit('response', {
            'response': response,
            'showForm': False
        })
        
        logger.info(f"Appointment confirmation sent to session {session_id}")
        
    except Exception as e:
        logger.error(f"Error handling appointment submission: {str(e)}", exc_info=True)
        emit('error', {'message': str(e)})

if __name__ == '__main__':
    logger.info("Starting chatbot server...")
    socketio.run(app, debug=True, port=int(os.getenv('PORT', 5005)))