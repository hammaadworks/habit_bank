import pytest
from datetime import datetime, timezone, timedelta
from sqlmodel import Session

from app.database import engine
from app.models import HabitLog

def test_habit_state_analytics(client, db_session):
    # Create user
    user_resp = client.post("/users/", json={"username": "analytics_user"})
    user_id = user_resp.json()["id"]

    # Create habit starting 10 days ago
    start_date = (datetime.now(timezone.utc).date() - timedelta(days=10)).isoformat()
    
    resp = client.post(
        "/habits/",
        json={
            "name": "Reading", 
            "start_date": start_date, 
            "base_unit_name": "pages", 
            "mark_off_unit": "pages",
            "user_id": user_id
        }
    )
    habit_id = resp.json()["id"]
    
    # Phase
    client.post(
        f"/habits/{habit_id}/phases/",
        json={
            "habit_id": habit_id,
            "start_date": start_date,
            "target_value": 10
        }
    )
    
    # Log some past data by directly inserting (API only allows today)
    import uuid
    habit_uuid = uuid.UUID(habit_id)
    # Log 15 pages for last 5 days
    for i in range(5):
        d = (datetime.now(timezone.utc).date() - timedelta(days=i+1))
        db_session.add(HabitLog(habit_id=habit_uuid, logged_date=d, value=15))
    db_session.commit()
        
    # Get state
    resp = client.get(f"/habits/{habit_id}/state")
    assert resp.status_code == 200
    data = resp.json()
    
    # Lifetime Effort in pages
    assert data["totalLifetimeSeconds"] == 75 # 5 days * 15 pages
    
    # Check that basic metrics are present
    assert "todayDeficit" in data
    assert "historicalDebt" in data
    assert "futureBuffer" in data
