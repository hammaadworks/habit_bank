import pytest
from datetime import datetime, timezone

def test_today_only_logging(client):
    # Create user
    user_resp = client.post("/users/", json={"username": "log_user"})
    user_id = user_resp.json()["id"]

    # Create habit
    resp = client.post(
        "/habits/",
        json={
            "name": "Pushups", 
            "user_id": user_id,
            "mark_off_unit": "Pushup",
            "base_unit_name": "seconds", 
            "unit_hierarchy": {"Pushup": {"seconds": 15}}
        }
    )
    habit_id = resp.json()["id"]
    
    today = datetime.now(timezone.utc).date().isoformat()
    
    # Log today
    resp = client.post(
        f"/habits/{habit_id}/logs/",
        json={
            "logged_date": today,
            "value": 20,
            "unit": "Pushup"
        }
    )
    assert resp.status_code == 200
    assert resp.json()["value"] == 300 # 20 * 15
    
    # Try log past (should fail via API)
    resp = client.post(
        f"/habits/{habit_id}/logs/",
        json={
            "logged_date": "2024-01-01",
            "value": 10,
            "unit": "Pushup"
        }
    )
    assert resp.status_code == 400
