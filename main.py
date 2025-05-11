from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model to validate request body
class MessagePart(BaseModel):
    text: str

class NewMessage(BaseModel):
    role: str
    parts: List[MessagePart]

class RunRequest(BaseModel):
    app_name: str
    user_id: str
    session_id: str
    new_message: NewMessage

@app.post("/run")
async def run_app(request: RunRequest):
    print(f"Received request for app '{request.app_name}' from user '{request.user_id}'")
    print(f"Session ID: {request.session_id}")
    print(f"Message: {request.new_message.parts[0].text}")

    # Simulated response (you can replace this with actual logic)
    return {
        "status": "success",
        "reply": f"Hello, you said: '{request.new_message.parts[0].text}'"
    }