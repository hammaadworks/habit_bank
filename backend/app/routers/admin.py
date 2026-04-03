from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlmodel import Session, select
from app.core.auth import verify_admin_token
from app.database import get_session
from app.models import SystemConfig

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/verify")
async def verify_admin(token: str = Depends(verify_admin_token)):
    """Simple endpoint to verify admin token."""
    return {"status": "ok", "message": "Authenticated"}

@router.post("/token")
async def change_admin_token(
    new_token: str = Body(..., embed=True),
    token: str = Depends(verify_admin_token),
    session: Session = Depends(get_session)
):
    """Admin endpoint to update the authentication token."""
    statement = select(SystemConfig).where(SystemConfig.key == "admin_token")
    config = session.exec(statement).first()
    
    if not config:
        config = SystemConfig(key="admin_token", value=new_token)
    else:
        config.value = new_token
        config.updated_at = datetime.now(timezone.utc)
    
    session.add(config)
    session.commit()
    return {"status": "ok", "message": "Admin token updated successfully"}
