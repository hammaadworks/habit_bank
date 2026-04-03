import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from app.database import engine
from app.routers import habits, dashboard, users, waitlist, testimonials, feedback, admin
from app.core.logger import setup_logging, set_debug_level
from app.core.deeplogger import set_deep_logging

# Initialize Logging
setup_logging()

# Check for --deeplogged flag in command line arguments
if "--deeplogged" in sys.argv:
    set_deep_logging(True)
    set_debug_level()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    A lifespan context manager for the FastAPI application.

    This context manager ensures that the database tables are created when the
    application starts up. It's a modern alternative to startup events in FastAPI.
    
    Args:
        app (FastAPI): The FastAPI application instance.
    """
    # Create all database tables based on SQLModel metadata
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(
    title="Habit Bank API", 
    lifespan=lifespan,
    description="An API for tracking habits and managing habit-related data, built with FastAPI."
)

# Configure Cross-Origin Resource Sharing (CORS)
# This allows the frontend (running on a different domain/port) to communicate
# with this API. The current configuration is permissive and allows all origins,
# methods, and headers, which is suitable for development but should be
# restricted in a production environment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include modular routers for different parts of the API
app.include_router(habits.router)
app.include_router(dashboard.router)
app.include_router(users.router)
app.include_router(waitlist.router)
app.include_router(testimonials.router)
app.include_router(feedback.router)
app.include_router(admin.router)


@app.get("/")
def root():
    """
    Root endpoint for the Habit Bank API.

    Provides a simple welcome message to indicate that the API is running.
    
    Returns:
        dict: A welcome message.
    """
    return {"message": "Welcome to Habit Bank API"}
