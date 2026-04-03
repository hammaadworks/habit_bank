import pytest
from datetime import date
from app.core.ledger_engine import LedgerEngine
from app.models import TargetPhase, HabitLog
import uuid

def test_waterfall_allocation():
    habit_id = uuid.uuid4()
    start_date = date(2024, 1, 1)
    today = date(2024, 1, 3)
    
    phases = [
        TargetPhase(habit_id=habit_id, start_date=start_date, target_value=100)
    ]
    
    # Logs scenario:
    # 2024-01-01: Logged 0
    # 2024-01-02: Logged 250
    # 2024-01-03: Logged 0
    logs = [
        HabitLog(habit_id=habit_id, logged_date=date(2024, 1, 2), value=250)
    ]
    
    result = LedgerEngine.calculate_timeline(start_date, today, phases, logs)
    
    t1 = result.timeline[0] # 01-01
    t2 = result.timeline[1] # 01-02
    t3 = result.timeline[2] # 01-03
    
    # Walkthrough of algorithm:
    # 01-01: Needs 100, Logged 0. Buffer = 0. Allocated = 0.
    # 01-02: Needs 100, Logged 250.
    #   - Fill today (01-02): allocates 100. Surplus = 150.
    #   - Fill past (01-01): Needs 100, allocates 100. Surplus = 50. Pointer moves.
    #   - Fill future: Buffer = 50.
    # 01-03: Needs 100, Logged 0. Buffer = 50.
    #   - Fill today: allocates 50. Surplus = 0. Deficit = 50.
    
    assert t1.allocated_to_this_day == 100
    assert t1.is_full is True
    
    assert t2.allocated_to_this_day == 100
    assert t2.is_full is True
    
    assert t3.allocated_to_this_day == 50
    assert t3.is_full is False
    
    assert result.todayDeficit == 50
    assert result.historicalDebt == 0
    assert result.futureBuffer == 0

def test_waterfall_historical_debt():
    habit_id = uuid.uuid4()
    start_date = date(2024, 1, 1)
    today = date(2024, 1, 3)
    
    phases = [
        TargetPhase(habit_id=habit_id, start_date=start_date, target_value=100)
    ]
    
    logs = [
        HabitLog(habit_id=habit_id, logged_date=date(2024, 1, 2), value=50) # Very low
    ]
    
    result = LedgerEngine.calculate_timeline(start_date, today, phases, logs)
    
    assert result.timeline[0].allocated_to_this_day == 0 # 01-01
    assert result.timeline[1].allocated_to_this_day == 50 # 01-02
    assert result.timeline[2].allocated_to_this_day == 0 # 01-03
    
    # Deficit today (01-03) is 100
    assert result.todayDeficit == 100
    # Historical Debt is (01-01: 100) + (01-02: 50) = 150
    assert result.historicalDebt == 150

def test_non_stacked_habit():
    habit_id = uuid.uuid4()
    start_date = date(2024, 1, 1)
    today = date(2024, 1, 2)
    
    phases = [
        TargetPhase(habit_id=habit_id, start_date=start_date, target_value=100)
    ]
    
    # Day 1: Log 200 (surplus of 100)
    # Day 2: Log 0
    logs = [
        HabitLog(habit_id=habit_id, logged_date=date(2024, 1, 1), value=200)
    ]
    
    # Calculate WITH is_stacked=False
    result = LedgerEngine.calculate_timeline(start_date, today, phases, logs, is_stacked=False)
    
    t1 = result.timeline[0] # 01-01
    t2 = result.timeline[1] # 01-02
    
    assert t1.allocated_to_this_day == 100
    assert t1.is_full is True
    
    # Even though we logged 200 on Day 1, only 100 is allocated to Day 1.
    # The other 100 is NOT carried over to Day 2 because it's not stacked.
    assert t2.allocated_to_this_day == 0
    assert t2.is_full is False
    assert result.todayDeficit == 100
    assert result.futureBuffer == 0
    
    # Debt on Day 1 should be 0 because it's full, but if it weren't full, it wouldn't matter?
    # Actually, if is_stacked is False, does historicalDebt matter?
    # PRD says "Missed days do not reset progress; they accumulate as work owed."
    # But if is_stacked is False, maybe they DON'T accumulate?
    # Let's assume is_stacked=False means "Fresh start every day".
    
def test_non_stacked_historical_debt():
    habit_id = uuid.uuid4()
    start_date = date(2024, 1, 1)
    today = date(2024, 1, 2)
    
    phases = [
        TargetPhase(habit_id=habit_id, start_date=start_date, target_value=100)
    ]
    
    # Day 1: Log 0
    # Day 2: Log 200
    logs = [
        HabitLog(habit_id=habit_id, logged_date=date(2024, 1, 2), value=200)
    ]
    
    result = LedgerEngine.calculate_timeline(start_date, today, phases, logs, is_stacked=False)
    
    t1 = result.timeline[0]
    t2 = result.timeline[1]
    
    assert t1.allocated_to_this_day == 0
    assert t1.is_full is False
    
    # Day 2 fills today first
    assert t2.allocated_to_this_day == 100
    assert t2.is_full is True
    
    # Surplus from Day 2 (100) does NOT fill Day 1 because it's not stacked.
    assert t1.allocated_to_this_day == 0
    assert result.historicalDebt == 100
