import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.task_routes import router as task_router
from api.expense_routes import router as expense_router
from api.auth_routes import router as auth_router
from database import initialize_indexes
from dotenv import load_dotenv
import os

load_dotenv()

# Configure basic logging for the application
logging.basicConfig(level=logging.INFO)

app = FastAPI()

@app.on_event("startup")
def startup_event():
    from core.redis_client import init_redis
    init_redis()
    initialize_indexes()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(task_router)
app.include_router(expense_router)

@app.get("/")
def root():
    return {"message": "Task Manager API is running!"}