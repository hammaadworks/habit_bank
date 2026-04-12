"""
API router for the main user dashboard.

This module provides the endpoint to generate the dashboard agenda, which is
the primary view for users. It categorizes habits into different tiers based
on their current state of deficit and debt.
"""
from fastapi import APIRouter
from sqlmodel import select
from typing import List, Optional
from datetime import datetime, timezone, date
from pydantic import BaseModel
import uuid

from app.database import SessionDep
from app.models import Habit, TargetPhase, HabitLog, User
# TODO: Add docstrings to the LedgerEngine module and its methods.
from app.core.ledger_engine import LedgerEngine
from app.core.unit_converter import UnitConverter
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

class AgendaItem(BaseModel):
    """
    Represents a single habit item on the dashboard agenda.
    
    This model aggregates habit data with calculated analytics from the
    LedgerEngine to provide a snapshot of the habit's status.
    """
    habit_id: uuid.UUID
    name: str
    priority: int
    start_date: date
    base_unit_name: str
    unit_hierarchy: dict
    todayDeficit: float
    historicalDebt: float
    futureBuffer: float
    totalLifetimeSeconds: float
    avgWorkPerDay: float
    debtVelocity: float
    projectedClearanceDate: str | None = None
    progress_pct: float = 0.0
    modal_completion_hour: int | None = None
    received_from_surplus: float = 0
    contributed_to_others: float = 0
    todayTarget: float = 0
    display_unit: str | None = None
    mark_off_unit: str
    is_stacked: bool = False

class DashboardAgenda(BaseModel):
    """
    Defines the structure of the dashboard agenda response.
    
    Habits are categorized into three tiers:
    - Tier 1: Habits with a deficit for today. These are the most urgent.
    - Tier 2: Habits with historical debt but no deficit for today.
    - Completed: Habits with no deficit and no debt.
    """
    tier1: List[AgendaItem]
    tier2: List[AgendaItem]
    completed: List[AgendaItem]
    daily_quota_remaining_seconds: int

class HistoricalHabitState(BaseModel):
    habit_id: uuid.UUID
    name: str
    target: float
    physically_logged: float
    received_from_surplus: float
    total_allocated: float
    is_full: bool
    unit: str
    unit_hierarchy: dict

class TemporalSnapshot(BaseModel):
    date: str
    habits: List[HistoricalHabitState]

@router.get("/agenda", response_model=DashboardAgenda)
def generate_daily_agenda_snapshot(session: SessionDep, user_id: Optional[uuid.UUID] = None):
    """
    Synthesizes a high-fidelity temporal snapshot of the user's habits.
    
    This engine fetches all active protocols, runs the Waterfall Allocation 
    algorithm via the LedgerEngine, and categorizes habits into urgency-based 
    tiers (Deficit, Debt, and Secured).
    """
    logger.info(f"Synthesizing agenda snapshot for user {user_id}")
    
    # Retrieve user for preferences
    user = session.get(User, user_id) if user_id else None
    from app.core.time_utils import get_current_logical_date
    today = get_current_logical_date(user) if user else datetime.now(timezone.utc).date()
    fill_direction = user.fill_direction if user else "start_date"
    
    statement = select(Habit)
    if user_id:
        statement = statement.where(Habit.user_id == user_id)
    habits = session.exec(statement).all()
    habit_ids = [h.id for h in habits]
    
    # Batch fetch phases and logs
    phases_by_habit = {h_id: [] for h_id in habit_ids}
    logs_by_habit = {h_id: [] for h_id in habit_ids}
    
    if habit_ids:
        all_phases = session.exec(select(TargetPhase).where(TargetPhase.habit_id.in_(habit_ids))).all()
        for p in all_phases:
            phases_by_habit[p.habit_id].append(p)
            
        all_logs = session.exec(select(HabitLog).where(HabitLog.habit_id.in_(habit_ids))).all()
        for l in all_logs:
            logs_by_habit[l.habit_id].append(l)

    tier1_items = []
    tier2_items = []
    completed_items = []
    total_habit_time_seconds = 0
    
    for habit in habits:
        phases = phases_by_habit[habit.id]
        logs = logs_by_habit[habit.id]
        
        # The LedgerEngine performs the core business logic of calculating the
        # habit's state over time.
        logger.debug(f"Calculating state for habit '{habit.name}' ({habit.id})")
        result = LedgerEngine.calculate_timeline(
            habit.start_date,
            today,
            phases,
            logs,
            fill_direction=user.fill_direction,
            is_stacked=habit.is_stacked,
            frequency_type=habit.frequency_type,
            frequency_count=habit.frequency_count
        )
        analytics = LedgerEngine.calculate_analytics(result, today, logs, user.timezone_offset if user else 0)
        
        # Calculate daily target in seconds for quota
        active_phase = next((p for p in phases if p.start_date <= today and (p.end_date is None or p.end_date >= today)), None)
        if active_phase and not habit.is_stacked:
            total_habit_time_seconds += active_phase.target_value

        item = AgendaItem(
            habit_id=habit.id,
            name=habit.name,
            priority=habit.priority,
            start_date=habit.start_date,
            base_unit_name=habit.base_unit_name,
            unit_hierarchy=habit.unit_hierarchy,
            todayDeficit=result.todayDeficit,
            historicalDebt=result.historicalDebt,
            futureBuffer=result.futureBuffer,
            totalLifetimeSeconds=analytics["totalLifetimeSeconds"],
            avgWorkPerDay=analytics["avgWorkPerDay"],
            debtVelocity=analytics["debtVelocity"],
            projectedClearanceDate=analytics["projectedClearanceDate"],
            progress_pct=analytics.get("progress_pct", 0.0),
            modal_completion_hour=analytics.get("modal_completion_hour"),
            received_from_surplus=result.timeline[-1].received_from_surplus if result.timeline else 0,
            contributed_to_others=result.timeline[-1].contributed_to_others if result.timeline else 0,
            todayTarget=result.timeline[-1].target if result.timeline else 0,
            display_unit=habit.display_unit or habit.mark_off_unit,
            mark_off_unit=habit.mark_off_unit,
            is_stacked=habit.is_stacked
        )
        
        # Categorize habits into tiers based on their state
        if item.todayDeficit > 0:
            tier1_items.append(item)
        elif item.historicalDebt > 0:
            tier2_items.append(item)
        else:
            completed_items.append(item)
            
    # Sort Tier 1: User-defined priority is primary, today's deficit is secondary.
    tier1_items.sort(key=lambda x: (x.priority, -x.todayDeficit))
    
    # Sort Tier 2: Only by the amount of historical debt.
    tier2_items.sort(key=lambda x: -x.historicalDebt)
    
    # Calculate Quota
    daily_quota_remaining_seconds = 86400 - total_habit_time_seconds
    if user and user.daily_buffers:
        buffer_seconds = sum(user.daily_buffers.values())
        daily_quota_remaining_seconds -= buffer_seconds

    return DashboardAgenda(
        tier1=tier1_items,
        tier2=tier2_items,
        completed=completed_items,
        daily_quota_remaining_seconds=int(daily_quota_remaining_seconds)
    )

@router.get("/snapshot", response_model=TemporalSnapshot)
def get_temporal_snapshot(date_str: str, session: SessionDep, user_id: Optional[uuid.UUID] = None):
    """
    Retrieves a snapshot of all habits for a specific historical date.
    """
    target_date = date.fromisoformat(date_str)
    
    statement = select(Habit)
    if user_id:
        statement = statement.where(Habit.user_id == user_id)
    
    habits = session.exec(statement).all()
    today = datetime.now(timezone.utc).date()
    
    snapshot_habits = []
    
    for habit in habits:
        phases = session.exec(select(TargetPhase).where(TargetPhase.habit_id == habit.id)).all()
        logs = session.exec(select(HabitLog).where(HabitLog.habit_id == habit.id)).all()
        
        # Calculate timeline up to today (or target_date if target_date > today, but usually it's past)
        calc_until = max(today, target_date)
        result = LedgerEngine.calculate_timeline(
            habit.start_date, 
            calc_until, 
            list(phases), 
            list(logs),
            is_stacked=habit.is_stacked,
            frequency_type=habit.frequency_type,
            frequency_count=habit.frequency_count
        )
        
        # Find the specific day in the timeline
        day_data = next((d for d in result.timeline if d.date == date_str), None)
        
        if day_data:
            snapshot_habits.append(HistoricalHabitState(
                habit_id=habit.id,
                name=habit.name,
                target=day_data.target,
                physically_logged=day_data.physically_logged_today,
                received_from_surplus=day_data.received_from_surplus,
                total_allocated=day_data.allocated_to_this_day,
                is_full=day_data.is_full,
                unit=habit.display_unit or habit.mark_off_unit,
                unit_hierarchy=habit.unit_hierarchy
            ))
            
    return TemporalSnapshot(date=date_str, habits=snapshot_habits)
