from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import Feedback, FeedbackCreate, FeedbackRead, User
from app.core.auth import verify_admin_token

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.get("/", response_model=List[FeedbackRead])
def list_feedback(
    session: Session = Depends(get_session),
    admin_token: str = Depends(verify_admin_token)
):
    """List all feedback (Admin endpoint)."""
    statement = select(Feedback, User.username).join(User)
    results = session.exec(statement).all()
    
    # Map results to FeedbackRead schema
    return [
        FeedbackRead(
            id=f.id,
            user_id=f.user_id,
            user_username=username,
            content=f.content,
            created_at=f.created_at
        ) for f, username in results
    ]

@router.post("/", response_model=Feedback)
def create_feedback(entry: FeedbackCreate, session: Session = Depends(get_session)):
    """User endpoint to submit feedback."""
    db_entry = Feedback.from_orm(entry)
    session.add(db_entry)
    session.commit()
    session.refresh(db_entry)
    return db_entry

@router.delete("/{feedback_id}")
def delete_feedback(
    feedback_id: uuid.UUID, 
    session: Session = Depends(get_session),
    admin_token: str = Depends(verify_admin_token)
):
    """Admin endpoint to delete feedback."""
    db_entry = session.get(Feedback, feedback_id)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Feedback not found")
    session.delete(db_entry)
    session.commit()
    return {"ok": True}
