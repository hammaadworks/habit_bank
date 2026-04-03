"""
API router for managing users.

This module provides endpoints for creating, reading, and deleting users.
"""
import uuid
from typing import List

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.database import SessionDep
from app.models import User, UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserRead)
def create_user(user: UserCreate, session: SessionDep):
    """
    Creates a new user in the database.

    Args:
        user (UserCreate): The user data to create.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If a user with the same username already exists.

    Returns:
        UserRead: The newly created user's data.
    """
    db_user = User.model_validate(user)
    session.add(db_user)
    try:
        session.commit()
        session.refresh(db_user)
    except Exception:  # Catch potential integrity errors for unique constraints
        session.rollback()
        raise HTTPException(status_code=400, detail="Username already exists")
    return db_user


@router.get("/", response_model=List[UserRead])
def read_users(session: SessionDep):
    """
    Retrieves a list of all users.

    Args:
        session (SessionDep): The database session dependency.

    Returns:
        List[UserRead]: A list of all users.
    """
    return session.exec(select(User)).all()


@router.get("/{user_id}", response_model=UserRead)
def read_user(user_id: uuid.UUID, session: SessionDep):
    """
    Retrieves a single user by their ID.

    Args:
        user_id (uuid.UUID): The ID of the user to retrieve.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If no user with the given ID is found.

    Returns:
        UserRead: The requested user's data.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: uuid.UUID, session: SessionDep):
    """
    Deletes a user from the database.

    Args:
        user_id (uuid.UUID): The ID of the user to delete.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If no user with the given ID is found.
        
    Returns:
        None: A 204 No Content response on successful deletion.
    """
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return None

@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: uuid.UUID, user_update: UserUpdate, session: SessionDep):
    """
    Updates a user's data, including daily time buffers.

    Args:
        user_id (uuid.UUID): The ID of the user to update.
        user_update (UserUpdate): The new user data.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If the user is not found.

    Returns:
        UserRead: The updated user's data.
    """
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = user_update.model_dump(exclude_unset=True)
    for key, value in user_data.items():
        setattr(db_user, key, value)
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user
