"""
Database configuration and session management for the Habit Bank API.

This module sets up the database engine and provides a dependency injection
system for FastAPI to manage database sessions. It is designed to be flexible,
supporting PostgreSQL in production environments (via a DATABASE_URL environment
variable) and falling back to a local SQLite database for development and testing.
"""
import os
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, create_engine

# The database connection URL.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# app/database.py is in backend/app/, so we want backend/habit_bank.db
DB_PATH = os.path.join(os.path.dirname(BASE_DIR), "habit_bank.db")
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DB_PATH}")

# SQLite specific connection arguments.
# `check_same_thread=False` is required for SQLite when used with FastAPI,
# as FastAPI can run requests in different threads. This is not needed for
# PostgreSQL.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# The database engine is the core interface to the database.
# It is created once and used throughout the application's lifecycle.
engine = create_engine(DATABASE_URL, connect_args=connect_args)


def get_session():
    """
    Dependency to get a database session.

    This function is a generator that creates a new database session for each
    incoming request and ensures that the session is closed after the request
    is finished. This pattern is crucial for proper resource management.

    Yields:
        Session: A new SQLModel session.
    """
    with Session(engine) as session:
        yield session

# Type annotation for a database session dependency.
# This allows for clean and type-safe dependency injection in path operation
# functions. Instead of `db: Session = Depends(get_session)`, you can simply
# use `db: SessionDep`.
SessionDep = Annotated[Session, Depends(get_session)]
