from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import WaitlistEntry, WaitlistCreate
from app.core.auth import verify_admin_token

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])

@router.post("/signup", response_model=WaitlistEntry)
def signup(entry: WaitlistCreate, session: Session = Depends(get_session)):
    """Add a new lead to the waitlist."""
    # Check if already exists
    statement = select(WaitlistEntry).where(WaitlistEntry.email == entry.email)
    existing = session.exec(statement).first()
    if existing:
        return existing
    
    db_entry = WaitlistEntry.from_orm(entry)
    session.add(db_entry)
    session.commit()
    session.refresh(db_entry)
    return db_entry

@router.get("/count")
def get_waitlist_count(session: Session = Depends(get_session)):
    """Return total number of signups for social proof."""
    statement = select(WaitlistEntry)
    results = session.exec(statement).all()
    return {"count": len(results)}

@router.get("/", response_model=List[WaitlistEntry])
def get_all_leads(
    offset: int = 0,
    limit: int = Query(default=100, lte=100),
    session: Session = Depends(get_session),
    admin_token: str = Depends(verify_admin_token)
):
    """Admin endpoint to list all leads."""
    statement = select(WaitlistEntry).offset(offset).limit(limit)
    return session.exec(statement).all()

@router.delete("/{lead_id}")
def delete_lead(
    lead_id: uuid.UUID, 
    session: Session = Depends(get_session),
    admin_token: str = Depends(verify_admin_token)
):
    """Admin endpoint to delete a lead from the waitlist."""
    db_entry = session.get(WaitlistEntry, lead_id)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Lead not found")
    session.delete(db_entry)
    session.commit()
    return {"ok": True}
