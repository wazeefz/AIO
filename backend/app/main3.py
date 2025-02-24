import os
import glob
import fitz
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from pymongo import MongoClient
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_google_genai import ChatGoogleGenerativeAI
import google.generativeai as genai
from google.generativeai import embed_content
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from langchain.chains import RetrievalQA
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
from . import database
from .models import User, Department, Chat, Message

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security configurations
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Load environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGODB_ATLAS_CLUSTER_URI = os.getenv("MONGODB_ATLAS_CLUSTER_URI")

# Initialize MongoDB client
client = MongoClient(MONGODB_ATLAS_CLUSTER_URI)

# Define database and collection names
DB_NAME = "test_db"
COLLECTION_NAME = "test_collection_pdf"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "text-index-pdf"

# Get MongoDB collection
MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]


# Initialize Google Generative AI model and embeddings
llm_model = ChatGoogleGenerativeAI(model="gemini-1.5-flash", api_key=GEMINI_API_KEY)

# Initialize vector store
vector_store = None

def init_vector_store():
    global vector_store
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=GEMINI_API_KEY
    )
    vector_store = MongoDBAtlasVectorSearch(
        collection=MONGODB_COLLECTION,
        embedding=embeddings,
        index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
    )
    return vector_store

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department_id: Optional[int] = None
    role: Optional[str] = "user"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_id: int

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    department_id: Optional[int] = None
    role: Optional[str] = None

class DepartmentResponse(BaseModel):
    department_id: int
    department_name: str

    class Config:
        orm_mode = True

class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    department_id: Optional[int]
    role: Optional[str]
    department: Optional[DepartmentResponse]
    created_at: datetime

    class Config:
        orm_mode = True

class MessageCreate(BaseModel):
    content: str
    role: str

class MessageResponse(BaseModel):
    message_id: int
    content: str
    role: str
    created_at: datetime

    class Config:
        orm_mode = True

class ChatResponse(BaseModel):
    conversation_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse]

    class Config:
        orm_mode = True

class ChatListResponse(BaseModel):
    conversation_id: int
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class PDFMetadata(BaseModel):
    filename: str
    page_count: int
    text_chunks: Dict[int, Dict[int, str]]
    chunk_count: int

class SearchResult(BaseModel):
    filename: str
    page_num: int
    chunk_num: int
    text: str
    similarity: float

class QuestionRequest(BaseModel):
    question: str
    pdf_file: Optional[str] = None

class Answer(BaseModel):
    question: str
    answer: str
    sources: List[Dict[str, str]]
    confidence: float

# Add these new models for ask-question functionality
class QuestionRequest(BaseModel):
    question: str
    pdf_file: Optional[str] = None

class Answer(BaseModel):
    question: str
    answer: str
    sources: List[Dict[str, str]]
    confidence: float

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_text_embedding(text: str) -> list:
    try:
        embedding = embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document",
        )
        return embedding.get('embedding', [])
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

def get_text_chunks(text: str, chunk_size: int = 1000, overlap: int = 100) -> dict:
    if not text:
        return {}
    if overlap > chunk_size:
        raise ValueError("Overlap cannot be larger than chunk size")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap
    )
    chunks = text_splitter.split_text(text)
    return {i+1: chunk for i, chunk in enumerate(chunks)}


def get_relevant_chunks(question: str, pdf_metadata_path: str, top_k: int = 3) -> List[Dict]:
    try:
        df = pd.read_pickle(pdf_metadata_path)
        if df.empty or 'embedding' not in df.columns:
            return []
        
        question_embedding = get_text_embedding(question)
        if not question_embedding:
            return []
        
        df['similarity'] = df['embedding'].apply(
            lambda x: np.dot(x, question_embedding) / 
            (np.linalg.norm(x) * np.linalg.norm(question_embedding)))
        
        top_chunks = df.nlargest(top_k, 'similarity')
        
        return [
            {
                "text": row['text'],
                "page": row['page_num'],
                "filename": row['filename'],
                "similarity": float(row['similarity'])
            }
            for _, row in top_chunks.iterrows()
        ]
    except Exception as e:
        print(f"Error getting relevant chunks: {e}")
        return []
        
def format_context(chunks: List[Dict]) -> str:
    if not chunks:
        return "No relevant context found."
    context = "Context from the document:\n\n"
    for i, chunk in enumerate(chunks, 1):
        context += f"[{i}] Page {chunk['page']}: {chunk['text']}\n\n"
    return context

def generate_prompt(question: str, chunks: List[Dict]) -> str:
    if not chunks:
        return f"Question: {question}\n\nNo relevant context found in the documents."
    context = format_context(chunks)
    return f"""Based on the following context, please answer the question. If the answer cannot be found in the context, say so.

{context}

Question: {question}

Please provide a clear and concise answer, citing the relevant parts of the context using the numbers in square brackets [].
"""

# User endpoints
@app.post("/signup/")
async def signup(user: UserCreate, db: Session = Depends(database.get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    try:
        hashed_password = pwd_context.hash(user.password)
        db_user = User(
            name=user.name,
            email=user.email,
            password=hashed_password,
            department_id=user.department_id,
            role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return {"message": "User created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred while creating user: {str(e)}")

@app.post("/login/", response_model=Token)
async def login(login_request: LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(User).filter(User.email == login_request.email).first()
    if not user or not verify_password(login_request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = create_access_token(data={"sub": user.email, "user_id": user.user_id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": user.name,
        "user_id": user.user_id
    }

@app.get("/users/", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    try:
        users = db.query(User).offset(skip).limit(limit).all()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving users: {str(e)}")

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# PDF endpoints
@app.post("/upload-pdf/", response_model=PDFMetadata)
async def upload_pdf(file: UploadFile = File(...)):
    try:
        pdf_dir = "pdf_files"
        os.makedirs(pdf_dir, exist_ok=True)
        file_path = os.path.join(pdf_dir, file.filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        try:
            doc = fitz.open(file_path)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid or corrupted PDF file: {str(e)}")
        num_pages = len(doc)
        metadata = {
            'filename': file.filename,
            'page_count': num_pages,
            'text_chunks': {},
            'embeddings': {}
        }
        text_data = []
        total_chunks = 0
        for page_num in range(num_pages):
            page = doc[page_num]
            text = page.get_text()
            chunks = get_text_chunks(text)
            chunk_embeddings = {
                chunk_num: get_text_embedding(chunk_text) 
                for chunk_num, chunk_text in chunks.items()
            }
            metadata['text_chunks'][page_num] = chunks
            metadata['embeddings'][page_num] = chunk_embeddings
            total_chunks += len(chunks)
            for chunk_num, chunk_text in chunks.items():
                if chunk_embeddings[chunk_num] is not None:
                    text_data.append({
                        'filename': file.filename,
                        'page_num': page_num + 1,
                        'chunk_num': chunk_num,
                        'text': chunk_text,
                        'embedding': chunk_embeddings[chunk_num]
                    })
        if text_data:
            df = pd.DataFrame(text_data)
            df.to_pickle(f"{pdf_dir}/{file.filename}_metadata.pkl")
        return {
            "filename": file.filename,
            "page_count": num_pages,
            "text_chunks": metadata['text_chunks'],
            "chunk_count": total_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.get("/list-pdfs/")
async def list_pdfs():
    pdf_dir = "pdf_files"
    if not os.path.exists(pdf_dir):
        return {"pdfs": []}
    try:
        pdf_files = [f for f in os.listdir(pdf_dir) if f.endswith('.pdf')]
        metadata_files = [f.replace('_metadata.pkl', '') for f in os.listdir(pdf_dir) if f.endswith('_metadata.pkl')]
        return {
            "pdfs": [
                {
                    "filename": pdf,
                    "processed": pdf in metadata_files
                }
                for pdf in pdf_files
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing PDFs: {str(e)}")

# Chat endpoints
@app.post("/chat/{user_id}", response_model=ChatResponse)
async def create_chat(user_id: int, db: Session = Depends(database.get_db)):
    new_chat = Chat(user_id=user_id, title="New Chat")
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat

@app.get("/chat/{user_id}/{chat_id}", response_model=ChatResponse)
async def get_chat(user_id: int, chat_id: int, db: Session = Depends(database.get_db)):
    chat = db.query(Chat).filter(Chat.conversation_id == chat_id, Chat.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@app.get("/chat/{user_id}", response_model=List[ChatListResponse])
def get_user_chats(user_id: int, db: Session = Depends(database.get_db)):
    try:
        chats = db.query(Chat).filter(Chat.user_id == user_id).order_by(Chat.updated_at.desc()).all()
        if not chats:
            return []
        return chats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/{user_id}/{chat_id}/messages", response_model=List[MessageResponse])
async def get_chat_messages(user_id: int, chat_id: int, db: Session = Depends(database.get_db)):
    try:
        chat = db.query(Chat).filter(Chat.conversation_id == chat_id, Chat.user_id == user_id).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        messages = db.query(Message).filter(Message.conversation_id == chat_id).order_by(Message.created_at).all()
        return messages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/{user_id}/{chat_id}/message", response_model=MessageResponse)
async def create_message(user_id: int, chat_id: int, message: MessageCreate, db: Session = Depends(database.get_db)):
    chat = db.query(Chat).filter(Chat.conversation_id == chat_id, Chat.user_id == user_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    new_message = Message(
        conversation_id=chat_id,
        content=message.content,
        role=message.role
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message

@app.get("/ask-question/", response_model=Answer)
async def ask_question(
    question: str = Query(..., description="Your question"),
    pdf_file: Optional[str] = Query(None, description="Optional: Specific PDF to search in"),
    user_id: Optional[int] = Query(None, description="Optional: User ID for chat history"),
    chat_id: Optional[int] = Query(None, description="Optional: Chat ID for saving response"),
    db: Session = Depends(database.get_db)
):
    try:
        pdf_dir = "pdf_files"
        metadata_files = [f for f in os.listdir(pdf_dir) if f.endswith('_metadata.pkl')]
        
        if pdf_file:
            metadata_files = [f for f in metadata_files if f.startswith(pdf_file)]
        
        if not metadata_files:
            raise HTTPException(
                status_code=404,
                detail="No processed PDFs found. Please upload a PDF first."
            )
        
        # Get relevant chunks from PDFs
        all_chunks = []
        for metadata_file in metadata_files:
            metadata_path = os.path.join(pdf_dir, metadata_file)
            chunks = get_relevant_chunks(question, metadata_path)
            all_chunks.extend(chunks)
        
        # Sort chunks by similarity and get top 3
        all_chunks.sort(key=lambda x: x['similarity'], reverse=True)
        top_chunks = all_chunks[:3]
        
        if not top_chunks:
            answer_text = "I couldn't find relevant information in the documents to answer your question."
            confidence = 0.0
        else:
            # Generate prompt and get model response
            prompt = generate_prompt(question, top_chunks)
            try:
                response = llm_model.invoke(prompt)
                answer_text = response.text
            except Exception as e:
                answer_text = "An error occurred while generating the response."
                confidence = 0.0
            confidence = sum(chunk['similarity'] for chunk in top_chunks) / len(top_chunks)
        
        # Save to chat history if user_id and chat_id are provided
        if user_id and chat_id:
            try:
                # Save user's question
                user_message = Message(
                    conversation_id=chat_id,
                    content=question,
                    role="user"
                )
                db.add(user_message)
                
                # Save AI's answer
                ai_message = Message(
                    conversation_id=chat_id,
                    content=answer_text,
                    role="assistant"
                )
                db.add(ai_message)
                
                # Update chat
                chat = db.query(Chat).filter(
                    Chat.conversation_id == chat_id,
                    Chat.user_id == user_id
                ).first()
                
                if chat:
                    chat.updated_at = datetime.utcnow()
                    if not chat.title or chat.title == "New Chat":
                        chat.title = question[:30] + "..." if len(question) > 30 else question
                
                db.commit()
            except Exception as e:
                print(f"Error saving to chat history: {e}")
                db.rollback()
        
        # Format sources
        sources = [
            {
                "file": chunk['filename'],
                "page": chunk['page'],
                "text": chunk['text'][:200] + "..." if len(chunk['text']) > 200 else chunk['text'],
                "similarity": chunk['similarity']
            }
            for chunk in top_chunks
        ]
        
        return Answer(
            question=question,
            answer=answer_text,
            sources=sources,
            confidence=confidence
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")
    
# Startup event
@app.on_event("startup")
async def startup_event():
    init_vector_store()
    try:
        vector_store.create_vector_search_index(dimensions=768)
        print("Vector Search Index Created!")
    except Exception as e:
        print(f"Vector Search Index already exists or error: {str(e)}")
        # Optionally, you can log the error or take other actions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)