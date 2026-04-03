import pytest
import uuid

def test_create_habit(client):
    # Create user first
    user_resp = client.post("/users/", json={"username": "testuser"})
    user_id = user_resp.json()["id"]

    response = client.post(
        "/habits/",
        json={
            "name": "Pushups", 
            "user_id": user_id,
            "mark_off_unit": "Pushup",
            "base_unit_name": "seconds", 
            "unit_hierarchy": {"Pushup": {"seconds": 15}}
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Pushups"
    assert data["user_id"] == user_id

def test_create_target_phase(client):
    # Create user
    user_resp = client.post("/users/", json={"username": "phaseuser"})
    user_id = user_resp.json()["id"]

    habit_resp = client.post(
        "/habits/",
        json={
            "name": "Quran Reading", 
            "user_id": user_id, 
            "mark_off_unit": "pages",
            "base_unit_name": "seconds",
            "unit_hierarchy": {"pages": {"seconds": 60}} # Each page takes 60 seconds
        }
    )
    habit_id = habit_resp.json()["id"]
    
    response = client.post(
        f"/habits/{habit_id}/phases/",
        json={
            "habit_id": habit_id,
            "start_date": "2024-01-01",
            "target_value": 10,
            "unit": "pages"
        }
    )
    assert response.status_code == 200
    assert response.json()["target_value"] == 600 # 10 pages * 60 seconds = 600
