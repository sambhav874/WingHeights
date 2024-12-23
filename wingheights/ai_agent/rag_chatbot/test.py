import eventlet
eventlet.monkey_patch()
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import os
import csv
import ollama
import logging
from datetime import datetime
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.document_loaders import PyPDFLoader, DirectoryLoader
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('chat_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True,
    ping_timeout=300,
    ping_interval=60,
    async_mode='eventlet'
)

# Constants
DATA_PATH = os.getenv('DATA_PATH', 'data/')
DB_FAISS_PATH = os.getenv('DB_FAISS_PATH', 'vectorstores/db_faiss')
EMBEDDINGS_MODEL = os.getenv('EMBEDDINGS_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
LLAMA_MODEL = os.getenv('LLAMA_MODEL', 'llama3.2:1b')

required_env_vars = ['FLASK_ENV', 'FLASK_APP', 'PORT', 'DATA_PATH', 'DB_FAISS_PATH', 'EMBEDDINGS_MODEL', 'LLAMA_MODEL']
for var in required_env_vars:
    if os.getenv(var) is None:
        raise EnvironmentError(f"Required environment variable {var} is not set")

custom_prompt_template = """
You are an insurance agent of Wing Heights Ghana - An insurance provider.
Use the following pieces of information to answer the user's question.
Answer the question only if it is present in the given piece of information.
If you don't know the answer or the question is not related to the provided information, say: "I am an insurance agent and I can only provide insurance solutions offered by our company. Would you like to book an appointment to discuss your insurance needs?"

If the user wants to book an appointment, ask for the following details one by one:
1. Name
2. Contact Number
3. Email
4. Appointment Date
5. Insurance Type

After collecting all details, provide a summary of the appointment details.

If the user doesn't want to book an appointment, end the conversation politely.

For basic greetings, respond with short, friendly statements.

Context: {context}
Question: {question}

Helpful answer:
"""

def create_vector_db():
    if not os.path.exists(DATA_PATH) or not os.listdir(DATA_PATH):
        logger.warning(f"No PDF files found in {DATA_PATH}. Please add your PDF files and restart the application.")
        return None

    loader = DirectoryLoader(DATA_PATH, glob="*.pdf", loader_cls=PyPDFLoader)
    documents = loader.load()

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    texts = text_splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL, model_kwargs={"device": "cpu"})
    
    db = FAISS.from_documents(texts, embeddings)
    os.makedirs(os.path.dirname(DB_FAISS_PATH), exist_ok=True)
    db.save_local(DB_FAISS_PATH)
    logger.info(f"Vector store created and saved to {DB_FAISS_PATH}")
    return db

def load_vector_db():
    if not os.path.exists(DB_FAISS_PATH):
        logger.info("Vector store not found. Creating new vector store...")
        return create_vector_db()
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDINGS_MODEL, model_kwargs={"device": "cpu"})
    return FAISS.load_local(DB_FAISS_PATH, embeddings, allow_dangerous_deserialization=True)

def load_llm():
    def ollama_chat(query, context=""):
        try:
            response = ollama.chat(
                model=LLAMA_MODEL, 
                messages=[
                    {"role": "system", "content": custom_prompt_template.format(context=context, question=query)},
                    {"role": "user", "content": query}
                ]
            )
            if response and 'message' in response and 'content' in response['message']:
                return response['message']['content']
        except Exception as e:
            logger.error(f"Error in ollama_chat: {str(e)}")
        return "I apologize, but I couldn't process your request. How else can I assist you with our insurance services?"

    return ollama_chat

def retrieval_qa_chain(llm, db):
    retriever = db.as_retriever(search_kwargs={'k': 2})

    def qa_chain(query):
        try:
            docs = retriever.get_relevant_documents(query)
            context = "\n".join([doc.page_content for doc in docs])
            response = llm(query, context)
            return response
        except Exception as e:
            logger.error(f"Error in qa_chain: {str(e)}")
            return "I apologize, but I encountered an error processing your request."

    return qa_chain

# Initialize the components
try:
    db = load_vector_db()
    llm = load_llm()
    qa_chain = retrieval_qa_chain(llm, db)
    chat_sessions = {}
except Exception as e:
    logger.error(f"Error initializing components: {str(e)}")
    raise

@socketio.on('connect')
def handle_connect():
    session_id = request.sid
    logger.info(f"Client connected: {session_id}")
    logger.debug(f"Connection headers: {request.headers}")
    
    chat_sessions[session_id] = {
        'appointment_details': {},
        'booking_confirmed': False,
        'awaiting_confirmation': False
    }
    join_room(session_id)
    emit('message', {'response': "Hello! I'm an AI assistant for Wing Heights Ghana Insurance. How can I help you today?"})

@socketio.on('disconnect')
def handle_disconnect():
    session_id = request.sid
    logger.info(f"Client disconnected: {session_id}")
    if session_id in chat_sessions:
        del chat_sessions[session_id]
    leave_room(session_id)

@socketio.on_error()
def error_handler(e):
    logger.error(f"SocketIO error: {str(e)}")
    emit('message', {'error': 'An internal error occurred'})

@socketio.on('message')
def handle_message(data):
    session_id = request.sid
    logger.info(f"Received message from {session_id}: {data}")
    
    user_input = data.get('message')
    
    if not user_input:
        logger.warning(f"Empty message received from {session_id}")
        emit('message', {'error': "No message provided"})
        return

    try:
        session = chat_sessions[session_id]

        if session['appointment_details'] and session['booking_confirmed']:
            appointment_fields = ["Name", "Contact Number", "Email", "Appointment Date", "Insurance Type"]
            current_field = appointment_fields[len(session['appointment_details'])]
            
            session['appointment_details'][current_field] = user_input

            if len(session['appointment_details']) < len(appointment_fields):
                next_field = appointment_fields[len(session['appointment_details'])]
                response = f"Thank you. Now, please provide your {next_field}:"
            else:
                summary = "Appointment Details:\n"
                for field in appointment_fields:
                    summary += f"{field}: {session['appointment_details'].get(field, 'Not provided')}\n"
                response = f"Thank you for providing all the details. Here's a summary of your appointment:\n\n{summary}\nWe look forward to assisting you!"
                
                try:
                    with open('appointment_details.csv', mode='a', newline='', encoding='utf-8') as file:
                        writer = csv.writer(file)
                        writer.writerow([session['appointment_details'].get(field, 'Not provided') for field in appointment_fields])
                except Exception as e:
                    logger.error(f"Error writing to CSV: {str(e)}")
                
                session['appointment_details'] = {}
                session['booking_confirmed'] = False
        elif session['awaiting_confirmation']:
            if user_input.lower() == 'yes':
                session['booking_confirmed'] = True
                session['appointment_details'] = {}
                response = "Great! Let's book an appointment. Please provide your Name:"
            elif user_input.lower() == 'no':
                response = "No problem. How else can I assist you with our insurance services?"
                session['appointment_details'] = {}
                session['booking_confirmed'] = False
            else:
                response = "I'm sorry, I didn't understand your response. Please answer with 'Yes' or 'No'. Would you like to book an appointment?"
            session['awaiting_confirmation'] = user_input.lower() not in ['yes', 'no']
        else:
            response = qa_chain(user_input)
            
            if "book an appointment" in response.lower():
                response += "\n\nWould you like to book an appointment? Please respond with 'Yes' or 'No'."
                session['awaiting_confirmation'] = True

        requires_input = session['awaiting_confirmation'] or (session['appointment_details'] and session['booking_confirmed'])
        token_count = len(response.split())
        max_tokens = 2000

        logger.info(f"Sending response to {session_id}: {response[:100]}...")
        emit('message', {
            "response": response,
            "requires_input": requires_input,
            "token_count": token_count,
            "max_tokens": max_tokens
        })
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}", exc_info=True)
        emit('message', {"error": str(e)})

if __name__ == "__main__":
    try:
        if not os.path.exists(DB_FAISS_PATH):
            logger.info("Vector store not found. Creating new vector store...")
            db = create_vector_db()
            if db is None:
                logger.error("Failed to create vector store.")
                exit(1)
                
        port = int(os.getenv('PORT', 5002))
        logger.info(f"Starting server on port {port}")
        socketio.run(
            app,
            debug=True,
            host='0.0.0.0',
            port=port,
            allow_unsafe_werkzeug=True
        )
    except Exception as e:
        logger.error(f"Server startup error: {str(e)}", exc_info=True)
        raise
