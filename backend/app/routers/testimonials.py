from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import Testimonial, TestimonialCreate
from app.core.auth import verify_admin_token

router = APIRouter(prefix="/testimonials", tags=["Testimonials"])

@router.get("/", response_model=List[Testimonial])
def list_testimonials(
    published_only: bool = True,
    session: Session = Depends(get_session)
):
    """List testimonials for the landing page."""
    statement = select(Testimonial)
    if published_only:
        statement = statement.where(Testimonial.is_published == True)
    return session.exec(statement).all()

@router.get("/all", response_model=List[Testimonial])
def list_all_testimonials(
    session: Session = Depends(get_session),
    admin_token: str = Depends(verify_admin_token)
):
    """Admin endpoint to list all testimonials."""
    return session.exec(select(Testimonial)).all()

@router.post("/", response_model=Testimonial)
def create_testimonial(entry: TestimonialCreate, session: Session = Depends(get_session)):
    """Public endpoint to submit a new testimonial (review)."""
    db_entry = Testimonial.from_orm(entry)
    # Ensure it's not published by default if coming from public
    db_entry.is_published = False 
    session.add(db_entry)
    session.commit()
    session.refresh(db_entry)
    return db_entry

@router.patch("/{testimonial_id}", response_model=Testimonial)
def update_testimonial(
    testimonial_id: uuid.UUID,
    is_published: Optional[bool] = None,
    session: Session = Depends(get_session),
    admin_token: str = Depends(verify_admin_token)
):
    """Update a testimonial (e.g., publish it)."""
    db_entry = session.get(Testimonial, testimonial_id)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    if is_published is not None:
        db_entry.is_published = is_published
    
    session.add(db_entry)
    session.commit()
    session.refresh(db_entry)
    return db_entry

@router.delete("/{testimonial_id}")
def delete_testimonial(
    testimonial_id: uuid.UUID, 
    session: Session = Depends(get_session),
    admin_token: str = Depends(verify_admin_token)
):
    """Admin endpoint to delete a testimonial."""
    db_entry = session.get(Testimonial, testimonial_id)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    session.delete(db_entry)
    session.commit()
    return {"ok": True}
