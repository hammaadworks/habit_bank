import os
from fastapi import Header, HTTPException, status, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import SystemConfig

# Fallback in case DB is not initialized
DEFAULT_ADMIN_SECRET = os.getenv("ADMIN_SECRET_KEY", "habit-bank-admin-2026")

async def verify_admin_token(
    x_admin_token: str = Header(None),
    session: Session = Depends(get_session)
):
    """
    Dependency to verify an admin token against the database or environment fallback.
    """
    # Try to get from DB first
    statement = select(SystemConfig).where(SystemConfig.key == "admin_token")
    config = session.exec(statement).first()
    
    expected_token = config.value if config else DEFAULT_ADMIN_SECRET

    if not x_admin_token or x_admin_token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid Admin Token",
            headers={"WWW-Authenticate": "Admin-Token"},
        )
    return x_admin_token
