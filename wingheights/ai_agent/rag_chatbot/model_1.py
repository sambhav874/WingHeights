from flask import Flask, request, jsonify
import csv
import requests
import sentencepiece as spm
from langchain.prompts import PromptTemplate
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.llms.base import LLM
import json
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

# Define paths
DB_FAISS_PATH = "vectorstores/db_faiss"

def count_tokens(text):
    return len(text.split())

custom_prompt_template = """
You are ADA, who is helping people in the insurance sector, so perform conversation and ask questions accordingly.
Use the following pieces of information to answer the user's question.
Answer the question only if it is present in the given piece of information.
If you don't know the answer, please just say that you don't know the answer.
But do answer basic greeting messages with a short statement.
Converse as if you are an insurance agent and ask questions accordingly.

Context: {context}
Question: {question}
Helpful answer:
"""

# Function to set the custom prompt
def set_custom_prompt():
    prompt = PromptTemplate(template=custom_prompt_template, input_variables=['context', 'question'])
    return prompt

# Custom LLM wrapper for query_ollama_v2
class OllamaLLM(LLM):
    def _call(self, prompt: str, stop=None):
        return query_ollama_v2(prompt)

    @property
    def _llm_type(self):
        return "custom_ollama_llm"

def query_ollama_v2(prompt):
    url = "http://localhost:11434/api/generate"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama3.1:8b",  # Use the appropriate model identifier
        "prompt": prompt
    }

    response = requests.post(url, headers=headers, json=data)

    try:
        responses = response.text.strip().split('\n')
        collected_responses = []

        for response_str in responses:
            try:
                parsed_response = json.loads(response_str)
                if parsed_response.get("response"):
                    collected_responses.append(parsed_response["response"])
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")

        final_output = ''.join(collected_responses)

        if final_output:
            return final_output.strip()
        else:
            return "I'm sorry, I don't know the answer."

    except ValueError as ve:
        print(f"JSON decoding error: {ve}")
        raise Exception(f"Ollama API call failed with invalid JSON. Response: {response.text}")

def retrieval_qa_chain(llm, prompt, db):
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=db.as_retriever(search_kwargs={'k': 2}),
        return_source_documents=True,
        chain_type_kwargs={'prompt': prompt}
    )
    return qa_chain

def qa_bot():
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    db = FAISS.load_local(DB_FAISS_PATH, embeddings, allow_dangerous_deserialization=True)
    
    # Use custom OllamaLLM wrapper for query_ollama_v2
    llm = OllamaLLM()

    qa_prompt = set_custom_prompt()
    qa = retrieval_qa_chain(llm, qa_prompt, db)
    
    return qa

def final_result(query):
    qa_result = qa_bot()
    prompt = f"Question: {query}"
    answer = query_ollama_v2(prompt)
    return answer

# Initialize token count
tokens_count = 0

@app.route('/chat', methods=['POST'])
def chat():
    global tokens_count
    
    if tokens_count > 2000:
        return jsonify({"error": "You have expired your tokens! Please speak to the customer care!"}), 403

    data = request.json
    query = data.get('query')
    
    if not query:
        return jsonify({"error": "No query provided"}), 400

    ques_tok = count_tokens(query)
    tokens_count += ques_tok

    try:
        answer = final_result(query)
        ans_tok = count_tokens(answer)
        tokens_count += ans_tok

        # Log the conversation
        with open('chatbot_data.csv', mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow([query, ques_tok, answer, ans_tok])

        return jsonify({
            "answer": answer,
            "tokens_used": {
                "question": ques_tok,
                "answer": ans_tok,
                "total": tokens_count
            }
        })

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)