from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from . import database
from .models import User, Department, Chat, Message
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your Vue.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security configurations
SECRET_KEY = "your-secret-key-here"  # Change this to a secure secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic model for user signup
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department_id: Optional[int] = None
    role: Optional[str] = "user"

# Pydantic models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str

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

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@app.post("/signup/")
async def signup(user: UserCreate, db: Session = Depends(database.get_db)):
    # Check if email already exists
    print("checkpoint1")
    existing_user = db.query(User).filter(User.email == user.email).first()
    print("checkpoint2")
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create new user
    try:
        # Hash the password
        hashed_password = pwd_context.hash(user.password)
        
        # Create new user object
        db_user = User(
            name=user.name,
            email=user.email,
            password=hashed_password,
            department_id=user.department_id,
            role=user.role
        )
        
        # Add to database
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return {"message": "User created successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating user: {str(e)}"
        )

@app.post("/login/", response_model=Token)
async def login(login_request: LoginRequest, db: Session = Depends(database.get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == login_request.email).first()
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(login_request.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.user_id}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": user.name
    }

@app.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(database.get_db)
):
    # Find the user in the database
    db_user = db.query(User).filter(User.user_id == user_id).first()
    
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Check if email is being updated and if it's already taken
    if user_update.email and user_update.email != db_user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )
    
    try:
        # Update user fields if they are provided
        if user_update.name is not None:
            db_user.name = user_update.name
        
        if user_update.email is not None:
            db_user.email = user_update.email
            
        if user_update.password is not None:
            db_user.password = pwd_context.hash(user_update.password)
            
        if user_update.department_id is not None:
            # Optionally verify that the department exists
            # department = db.query(Department).filter(
            #     Department.department_id == user_update.department_id
            # ).first()
            # if not department:
            #     raise HTTPException(
            #         status_code=404,
            #         detail="Department not found"
            #     )
            db_user.department_id = user_update.department_id
            
        if user_update.role is not None:
            db_user.role = user_update.role
        
        # Commit the changes to the database
        db.commit()
        db.refresh(db_user)
        
        # Return the updated user information
        return {
            "message": "User updated successfully",
            "user": {
                "user_id": db_user.user_id,
                "name": db_user.name,
                "email": db_user.email,
                "department_id": db_user.department_id,
                "role": db_user.role
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while updating user: {str(e)}"
        )
    
@app.get("/users/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    try:
        users = db.query(User).offset(skip).limit(limit).all()
        return users
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving users: {str(e)}"
        )

# Get specific user by ID endpoint
@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(database.get_db)):
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
        print("checkpoint4")
        return user
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving user: {str(e)}"
        )
    
# @app.post("/chat/{user_id}", response_model=ChatResponse)
# async def create_chat(
#     user_id: int,
#     db: Session = Depends(database.get_db)
# ):
#     new_chat = Chat(
#         user_id=user_id,
#         title="New Chat"
#     )
#     db.add(new_chat)
#     db.commit()
#     db.refresh(new_chat)
#     return new_chat

# @app.get("/chat/{user_id}/{chat_id}", response_model=ChatResponse)
# async def get_chat(
#     user_id: int,
#     chat_id: int,
#     db: Session = Depends(database.get_db)
# ):
#     chat = db.query(Chat).filter(
#         Chat.conversation_id == chat_id,
#         Chat.user_id == user_id
#     ).first()
#     if not chat:
#         raise HTTPException(status_code=404, detail="Chat not found")
#     return chat

@app.get("/chat/history/{user_id}", response_model=List[ChatResponse])
async def get_chat_history(
    user_id: int,
    db: Session = Depends(database.get_db)
):
    try:
        chats = db.query(Chat).filter(
            Chat.user_id == user_id
        ).order_by(Chat.updated_at.desc()).all()
        return chats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")

# @app.post("/chat/{user_id}/{chat_id}/message/", response_model=MessageResponse)
# async def create_message(
#     user_id: int,
#     chat_id: int,
#     message: MessageCreate,
#     db: Session = Depends(database.get_db)
# ):
#     chat = db.query(Chat).filter(
#         Chat.conversation_id == chat_id,
#         Chat.user_id == user_id
#     ).first()
#     if not chat:
#         raise HTTPException(status_code=404, detail="Chat not found")

#     new_message = Message(
#         conversation_id=chat_id,
#         content=message.content,
#         role=message.role
#     )
#     db.add(new_message)
    
#     # Update chat title if it's the first message
#     if message.role == "user" and len(chat.messages) == 0:
#         chat.title = message.content[:30] + "..." if len(message.content) > 30 else message.content
    
#     chat.updated_at = datetime.utcnow()
#     db.commit()
#     db.refresh(new_message)
#     return new_message

# @app.delete("/chat/{user_id}/{chat_id}")
# async def delete_chat(
#     user_id: int,
#     chat_id: int,
#     db: Session = Depends(database.get_db)
# ):
#     chat = db.query(Chat).filter(
#         Chat.conversation_id == chat_id,
#         Chat.user_id == user_id
#     ).first()
#     if not chat:
#         raise HTTPException(status_code=404, detail="Chat not found")
    
#     db.delete(chat)
#     db.commit()
#     return {"message": "Chat deleted successfully"}


@app.post("/chat/{user_id}", response_model=ChatResponse)
async def create_chat(user_id: int, db: Session = Depends(database.get_db)):
    new_chat = Chat(user_id=user_id, title="New Chat")
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat

@app.get("/chat/{user_id}/{chat_id}", response_model=ChatResponse)
async def get_chat(user_id: int, chat_id: int, db: Session = Depends(database.get_db)):
    chat = db.query(Chat).filter(
        Chat.conversation_id == chat_id,
        Chat.user_id == user_id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

# @app.get("/chat/history/{user_id}", response_model=List[ChatResponse])
# async def get_chat_history(user_id: int, db: Session = Depends(database.get_db)):
#     chats = db.query(Chat).filter(
#         Chat.user_id == user_id
#     ).order_by(Chat.updated_at.desc()).all()
#     return chats

@app.post("/chat/{user_id}/{chat_id}/message", response_model=MessageResponse)
async def create_message(
    user_id: int,
    chat_id: int,
    message: MessageCreate,
    db: Session = Depends(database.get_db)
):
    chat = db.query(Chat).filter(
        Chat.conversation_id == chat_id,
        Chat.user_id == user_id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    new_message = Message(
        conversation_id=chat_id,
        content=message.content,
        role=message.role
    )
    db.add(new_message)

    # Update chat title if it's the first message
    if message.role == "user" and len(chat.messages) == 0:
        chat.title = message.content[:30] + "..." if len(message.content) > 30 else message.content

    chat.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(new_message)
    return new_message

@app.delete("/chat/{user_id}/{chat_id}")
async def delete_chat(user_id: int, chat_id: int, db: Session = Depends(database.get_db)):
    chat = db.query(Chat).filter(
        Chat.conversation_id == chat_id,
        Chat.user_id == user_id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted successfully"}

@app.delete("/chat/history/{user_id}")
async def delete_chat_history(user_id: int, db: Session = Depends(get_db)):
    try:
        # Delete all chats and associated messages for the user
        db.query(Message).filter(Message.conversation_id.in_(
            db.query(Chat.conversation_id).filter(Chat.user_id == user_id)
        )).delete(synchronize_session=False)

        db.query(Chat).filter(Chat.user_id == user_id).delete(synchronize_session=False)
        db.commit()
        return {"message": "Chat history deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting chat history: {str(e)}")