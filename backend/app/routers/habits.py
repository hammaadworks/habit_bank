"""
API router for managing habits, their target phases, and logs.

This module contains all the endpoints for CRUD operations on habits,
as well as their associated target phases and daily logs. It also provides
an endpoint to get the calculated state of a single habit.
"""
import uuid
from typing import List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.database import SessionDep
from app.models import (
    User,
    Habit,
    HabitCreate,
    HabitRead,
    HabitUpdate,
    TargetPhase,
    TargetPhaseCreate,
    TargetPhaseRead,
    HabitLog,
    HabitLogRead,
    HabitLogRequest,
    HabitStateRead,
)
from app.core.time_utils import get_current_logical_date
from app.core.unit_converter import UnitConverter
from app.core.ledger_engine import LedgerEngine
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/habits", tags=["habits"])

# --- Habit Metrics Endpoint ---

@router.get("/{habit_id}/state", response_model=HabitStateRead)
def get_habit_performance_metrics(habit_id: uuid.UUID, session: SessionDep):
    """
    Calculates deep-performance metrics for a specific protocol.

    Uses the LedgerEngine to analyze historical logs and project 
    future solvency based on current debt velocity.
    """
    habit = session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
        
    user = session.get(User, habit.user_id)
    today = get_current_logical_date(user)
    
    phases = session.exec(select(TargetPhase).where(TargetPhase.habit_id == habit_id)).all()
    logs = session.exec(select(HabitLog).where(HabitLog.habit_id == habit_id)).all()
    
    result = LedgerEngine.calculate_timeline(
        habit.start_date, 
        today, 
        list(phases), 
        list(logs),
        fill_direction=user.fill_direction if user else "start_date",
        is_stacked=habit.is_stacked
    )
    analytics = LedgerEngine.calculate_analytics(result, today)
    
    return HabitStateRead(
        habit_id=habit_id,
        todayDeficit=result.todayDeficit,
        historicalDebt=result.historicalDebt,
        futureBuffer=result.futureBuffer,
        todayTarget=result.timeline[-1].target if result.timeline else 0.0,
        totalLifetimeSeconds=analytics["totalLifetimeSeconds"],
        avgWorkPerDay=analytics["avgWorkPerDay"],
        debtVelocity=analytics["debtVelocity"],
        projectedClearanceDate=analytics["projectedClearanceDate"],
        display_unit=habit.display_unit or habit.mark_off_unit,
        mark_off_unit=habit.mark_off_unit,
        timeline=[d.model_dump() for d in result.timeline]
    )

# --- Habit CRUD Endpoints ---

@router.post("/", response_model=HabitRead)
def create_habit(habit: HabitCreate, session: SessionDep):
    """
    Creates a new habit.

    Validates the unit hierarchy to ensure it can be resolved to a time-based
    unit if provided.

    Args:
        habit (HabitCreate): The habit data to create.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If the unit hierarchy is invalid.

    Returns:
        HabitRead: The newly created habit.
    """
    logger.info(f"Creating habit: '{habit.name}' for user {habit.user_id}")
    if habit.unit_hierarchy:
        if not UnitConverter.validate_hierarchy(habit.unit_hierarchy, set(habit.unit_hierarchy.keys())):
            raise HTTPException(status_code=400, detail="Unit hierarchy must eventually resolve to a time base")

    db_habit = Habit.model_validate(habit)
    session.add(db_habit)
    session.commit()
    session.refresh(db_habit)
    return db_habit


@router.patch("/{habit_id}", response_model=HabitRead)
def update_habit(habit_id: uuid.UUID, habit_update: HabitUpdate, session: SessionDep):
    """
    Updates an existing habit partially.

    Args:
        habit_id (uuid.UUID): The ID of the habit to update.
        habit_update (HabitUpdate): The partial data for the habit.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If the habit is not found or the unit hierarchy is invalid.

    Returns:
        HabitRead: The updated habit.
    """
    logger.info(f"Updating habit {habit_id}")
    db_habit = session.get(Habit, habit_id)
    if not db_habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    if habit_update.unit_hierarchy is not None:
        if habit_update.unit_hierarchy:
            if not UnitConverter.validate_hierarchy(habit_update.unit_hierarchy, set(habit_update.unit_hierarchy.keys())):
                raise HTTPException(status_code=400, detail="Unit hierarchy must eventually resolve to a time base")
            
            # Propagation: Re-calculate TargetPhases and logs if hierarchy changed
            if db_habit.unit_hierarchy != habit_update.unit_hierarchy:
                logger.info(f"Hierarchy change detected for habit {habit_id}. Propagating changes to phases and logs...")
                phases = session.exec(select(TargetPhase).where(TargetPhase.habit_id == habit_id)).all()
                for p in phases:
                    if p.unit and p.unit != db_habit.base_unit_name:
                        try:
                            # 1. Back to original value in its unit
                            old_mult = UnitConverter.to_base_units(1, p.unit, db_habit.unit_hierarchy, db_habit.base_unit_name)
                            if old_mult > 0:
                                original_val = p.target_value / old_mult
                                # 2. To new seconds value
                                new_mult = UnitConverter.to_base_units(1, p.unit, habit_update.unit_hierarchy, db_habit.base_unit_name)
                                p.target_value = float(original_val * new_mult)
                                session.add(p)
                        except ValueError:
                            pass 
                
                logs = session.exec(select(HabitLog).where(HabitLog.habit_id == habit_id)).all()
                for l in logs:
                    if l.unit and l.unit != db_habit.base_unit_name:
                        try:
                            old_mult = UnitConverter.to_base_units(1, l.unit, db_habit.unit_hierarchy, db_habit.base_unit_name)
                            if old_mult > 0:
                                original_val = l.value / old_mult
                                new_mult = UnitConverter.to_base_units(1, l.unit, habit_update.unit_hierarchy, db_habit.base_unit_name)
                                l.value = float(original_val * new_mult)
                                session.add(l)
                        except ValueError:
                            pass

    if habit_update.start_date is not None:
        old_start_date = db_habit.start_date
        new_start_date = habit_update.start_date
        logger.info(f"Start date change for habit {habit_id}: {old_start_date} -> {new_start_date}")
        
        phases = session.exec(select(TargetPhase).where(TargetPhase.habit_id == habit_id)).all()
        if not phases:
            # Create a default phase if none exists
            logger.info(f"No phases found for habit {habit_id}. Creating default phase at {new_start_date}")
            default_phase = TargetPhase(
                habit_id=habit_id,
                start_date=new_start_date,
                target_value=0, # Default to 0, user can update later
                unit=db_habit.base_unit_name
            )
            session.add(default_phase)
        else:
            # Adjust phases that were tied to the old start date
            for p in phases:
                if p.start_date == old_start_date:
                    logger.info(f"Adjusting phase {p.id} start_date to {new_start_date}")
                    p.start_date = new_start_date
                    session.add(p)

    habit_data = habit_update.model_dump(exclude_unset=True)
    for key, value in habit_data.items():
        setattr(db_habit, key, value)
    
    session.add(db_habit)
    session.commit()
    session.refresh(db_habit)
    return db_habit


@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: uuid.UUID, session: SessionDep):
    """
    Deletes a habit.

    Args:
        habit_id (uuid.UUID): The ID of the habit to delete.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If the habit is not found.
        
    Returns:
        None: A 204 No Content response on successful deletion.
    """
    habit = session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    session.delete(habit)
    session.commit()
    return None


@router.get("/", response_model=List[HabitRead])
def read_habits(session: SessionDep, user_id: Optional[uuid.UUID] = None):
    """
    Retrieves a list of habits, optionally filtered by user ID.

    Args:
        session (SessionDep): The database session dependency.
        user_id (Optional[uuid.UUID]): The ID of the user to filter by.

    Returns:
        List[HabitRead]: A list of habits.
    """
    statement = select(Habit)
    if user_id:
        statement = statement.where(Habit.user_id == user_id)
    habits = session.exec(statement).all()
    return habits


@router.get("/{habit_id}", response_model=HabitRead)
def read_habit(habit_id: uuid.UUID, session: SessionDep):
    """
    Retrieves a single habit by its ID.

    Args:
        habit_id (uuid.UUID): The ID of the habit to retrieve.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If the habit is not found.

    Returns:
        HabitRead: The requested habit.
    """
    habit = session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

# --- Target Phase CRUD Endpoints ---

@router.post("/{habit_id}/phases/", response_model=TargetPhaseRead)
def create_target_phase(habit_id: uuid.UUID, phase: TargetPhaseCreate, session: SessionDep):
    """
    Creates a new target phase for a habit.

    Converts the target value from the specified unit to the habit's base unit
    before saving.

    Args:
        habit_id (uuid.UUID): The ID of the habit to add the phase to.
        phase (TargetPhaseCreate): The target phase data.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If the habit is not found or the unit conversion fails.

    Returns:
        TargetPhaseRead: The newly created target phase.
    """
    habit = session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    target_in_seconds = phase.target_value
    if phase.unit:
        try:
            target_in_seconds = UnitConverter.to_base_units(
                phase.target_value, phase.unit, habit.unit_hierarchy, habit.base_unit_name
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    db_phase = TargetPhase(
        habit_id=habit_id,
        start_date=phase.start_date,
        end_date=phase.end_date,
        target_value=int(target_in_seconds),
        unit=phase.unit or habit.base_unit_name
    )
    session.add(db_phase)
    session.commit()
    session.refresh(db_phase)
    return db_phase


@router.put("/{habit_id}/phases/{phase_id}", response_model=TargetPhaseRead)
def update_target_phase(habit_id: uuid.UUID, phase_id: uuid.UUID, phase_update: TargetPhaseCreate, session: SessionDep):
    """
    Updates an existing target phase.

    Args:
        habit_id (uuid.UUID): The ID of the habit the phase belongs to.
        phase_id (uuid.UUID): The ID of the phase to update.
        phase_update (TargetPhaseCreate): The new data for the phase.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If the habit or phase is not found, or unit conversion fails.

    Returns:
        TargetPhaseRead: The updated target phase.
    """
    habit = session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    db_phase = session.get(TargetPhase, phase_id)
    if not db_phase or db_phase.habit_id != habit_id:
        raise HTTPException(status_code=404, detail="Phase not found")

    target_in_seconds = phase_update.target_value
    if phase_update.unit:
        try:
            target_in_seconds = UnitConverter.to_base_units(
                phase_update.target_value, phase_update.unit, habit.unit_hierarchy, habit.base_unit_name
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    db_phase.start_date = phase_update.start_date
    db_phase.end_date = phase_update.end_date
    db_phase.target_value = int(target_in_seconds)
    db_phase.unit = phase_update.unit or habit.base_unit_name
    
    session.add(db_phase)
    session.commit()
    session.refresh(db_phase)
    return db_phase


@router.delete("/{habit_id}/phases/{phase_id}", status_code=204)
def delete_target_phase(habit_id: uuid.UUID, phase_id: uuid.UUID, session: SessionDep):
    """
    Deletes a target phase.

    Args:
        habit_id (uuid.UUID): The ID of the habit the phase belongs to.
        phase_id (uuid.UUID): The ID of the phase to delete.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If the phase is not found or does not belong to the habit.
        
    Returns:
        None: A 204 No Content response on successful deletion.
    """
    db_phase = session.get(TargetPhase, phase_id)
    if not db_phase or db_phase.habit_id != habit_id:
        raise HTTPException(status_code=404, detail="Phase not found")
    
    session.delete(db_phase)
    session.commit()
    return None


@router.get("/{habit_id}/phases/", response_model=List[TargetPhaseRead])
def read_target_phases(habit_id: uuid.UUID, session: SessionDep):
    """
    Retrieves all target phases for a specific habit.

    Args:
        habit_id (uuid.UUID): The ID of the habit.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If the habit is not found.

    Returns:
        List[TargetPhaseRead]: A list of the habit's target phases.
    """
    habit = session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    phases = session.exec(
        select(TargetPhase).where(TargetPhase.habit_id == habit_id)
    ).all()
    return phases

# --- Habit Log CRUD Endpoints ---

@router.get("/{habit_id}/logs/today", response_model=List[HabitLogRead])
def read_today_logs(habit_id: uuid.UUID, session: SessionDep):
    """
    Retrieves all logs for a specific habit that were created today.

    Args:
        habit_id (uuid.UUID): The ID of the habit.
        session (SessionDep): The database session dependency.

    Returns:
        List[HabitLogRead]: A list of today's logs for the habit.
    """
    habit = session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    user = session.get(User, habit.user_id)
    today = get_current_logical_date(user)

    logs = session.exec(
        select(HabitLog)
        .where(HabitLog.habit_id == habit_id)
        .where(HabitLog.logged_date == today)
    ).all()
    return logs


@router.post("/{habit_id}/logs/", response_model=HabitLogRead)
def create_habit_log(habit_id: uuid.UUID, log_req: HabitLogRequest, session: SessionDep):
    """
    Creates a new log for a habit for the current day.

    This endpoint only allows logging for the current date and strictly
    enforces the habit's mark_off_unit.

    Args:
        habit_id (uuid.UUID): The ID of the habit to log against.
        log_req (HabitLogRequest): The log data, including value and unit.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If trying to log for a date other than today, if the
            habit is not found, if the unit does not match the mark_off_unit,
            or if the unit conversion fails.

    Returns:
        HabitLogRead: The newly created habit log.
    """
    logger.info(f"Logging {log_req.value} {log_req.unit} for habit {habit_id} on {log_req.logged_date}")
    habit = session.get(Habit, habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
        
    user = session.get(User, habit.user_id)
    today = get_current_logical_date(user)
    if log_req.logged_date != today:
        raise HTTPException(status_code=400, detail=f"Can only log for today ({today})")
        
    valid_units = UnitConverter.get_valid_units(habit.unit_hierarchy)

    if log_req.unit not in valid_units:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid unit '{log_req.unit}'. Must be one of the defined units for this habit."
        )

    try:
        base_value = UnitConverter.to_base_units(
            log_req.value, log_req.unit, habit.unit_hierarchy, habit.base_unit_name
        )
        if base_value > 86400:
             raise HTTPException(status_code=400, detail="Cannot log more than 24 hours for a single entry.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    db_log = HabitLog(
        habit_id=habit_id,
        logged_date=log_req.logged_date,
        value=float(base_value),
        unit=log_req.unit
    )
    session.add(db_log)
    session.commit()
    session.refresh(db_log)
    return db_log


@router.delete("/{habit_id}/logs/{log_id}", status_code=204)
def delete_habit_log(habit_id: uuid.UUID, log_id: uuid.UUID, session: SessionDep):
    """
    Deletes a habit log.

    This endpoint only allows deleting logs that were created today.

    Args:
        habit_id (uuid.UUID): The ID of the habit the log belongs to.
        log_id (uuid.UUID): The ID of the log to delete.
        session (SessionDep): The database session dependency.

    Raises:
        HTTPException: If the log is not found, does not belong to the habit,
            or was not created today.
            
    Returns:
        None: A 204 No Content response on successful deletion.
    """
    log = session.get(HabitLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
        
    if log.habit_id != habit_id:
        raise HTTPException(status_code=400, detail="Log does not belong to this habit")
    
    habit = session.get(Habit, habit_id)
    user = session.get(User, habit.user_id)
    today = get_current_logical_date(user)
    
    if log.logged_date != today:
        raise HTTPException(status_code=400, detail=f"Can only delete logs for today ({today})")
        
    session.delete(log)
    session.commit()
    return None
