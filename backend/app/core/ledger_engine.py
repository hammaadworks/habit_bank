from typing import List, Dict, Optional
from datetime import date, timedelta
from pydantic import BaseModel
from app.models import TargetPhase, HabitLog
from app.core.logger import get_logger
from app.core.deeplogger import deeplog

logger = get_logger(__name__)

class TimelineDay(BaseModel):
    date: str
    target: float
    physically_logged_today: float = 0
    allocated_to_this_day: float = 0
    is_full: bool = False
    # New fields for "time travel" clarity
    received_from_surplus: float = 0 # Amount this day got from other days' surpluses
    contributed_to_others: float = 0 # Amount this day's physical log contributed to other days' deficits or future buffer

class LedgerResult(BaseModel):
    timeline: List[TimelineDay]
    futureBuffer: float
    todayDeficit: float
    historicalDebt: float

class LedgerEngine:
    @staticmethod
    @deeplog
    def calculate_timeline(
        start_date: date,
        today: date,
        phases: List[TargetPhase],
        logs: List[HabitLog],
        fill_direction: str = "start_date",
        is_stacked: bool = True
    ) -> LedgerResult:
        logger.info(f"Calculating timeline: start={start_date}, today={today}, phases={len(phases)}, logs={len(logs)}, stacked={is_stacked}")
        # Sort phases by start date to ensure chronology
        phases = sorted(phases, key=lambda p: p.start_date)
        
        # 1. Build array of days based on start_date -> today
        timeline: List[TimelineDay] = []
        current_date = start_date
        
        # If start_date is in the future, the timeline will be empty for today's calculation.
        # This is expected behavior for "Starting Soon" habits.
        
        # Helper to find active phase target efficiently
        def get_target_for_date(d: date) -> float:
            active_target = 0.0
            for phase in phases:
                if phase.start_date <= d:
                    if phase.end_date is None or d <= phase.end_date:
                        active_target = phase.target_value
            return float(active_target)

        while current_date <= today:
            target = get_target_for_date(current_date)
            timeline.append(TimelineDay(
                date=current_date.isoformat(),
                target=target
            ))
            current_date += timedelta(days=1)
            
        # 2. Hash logs by date for O(1) lookup
        logs_by_date: Dict[str, float] = {}
        for log in logs:
            d_str = log.logged_date.isoformat()
            logs_by_date[d_str] = logs_by_date.get(d_str, 0.0) + float(log.value)
            
        future_buffer = 0.0
        oldest_unfilled_idx = 0
        
        # 3. The Single-Pass Waterfall Simulation O(N)
        for current_idx in range(len(timeline)):
            day = timeline[current_idx]
            day.physically_logged_today = logs_by_date.get(day.date, 0.0)
            
            if day.physically_logged_today > 0:
                logger.debug(f"[{day.date}] Processing physical log: {day.physically_logged_today}s")
            
            # Tracking what this day does with its physical log
            remaining_physical = day.physically_logged_today
            
            # Available to allocate today = physical + buffer carried over
            available_to_allocate = float(day.physically_logged_today) + float(future_buffer)
            
            # How much did we get from "surplus" (carried over buffer)?
            day.received_from_surplus = float(future_buffer)
            future_buffer = 0.0
            
            # STEP A: Fill Today First
            if available_to_allocate >= day.target:
                day.allocated_to_this_day = day.target
                day.is_full = True
                available_to_allocate -= day.target
            else:
                day.allocated_to_this_day = available_to_allocate
                day.is_full = False
                available_to_allocate = 0.0
                
            # STEP B: Fill Past Deficits based on fill_direction
            if is_stacked and available_to_allocate > 0.000001:
                # Decide iteration order
                if fill_direction == "today":
                    # Go from just before current_idx down to 0
                    past_indices = range(current_idx - 1, -1, -1)
                else:
                    # Go from oldest_unfilled_idx up to current_idx
                    past_indices = range(oldest_unfilled_idx, current_idx)
                
                for past_idx in past_indices:
                    if available_to_allocate <= 0.000001:
                        break
                        
                    past_day = timeline[past_idx]
                    if past_day.is_full:
                        if fill_direction == "start_date" and past_idx == oldest_unfilled_idx:
                            oldest_unfilled_idx += 1
                        continue
                        
                    deficit = past_day.target - past_day.allocated_to_this_day
                    if deficit > 0:
                        amount = min(available_to_allocate, deficit)
                        past_day.allocated_to_this_day += amount
                        past_day.received_from_surplus += amount
                        available_to_allocate -= amount
                        
                        if past_day.allocated_to_this_day >= past_day.target - 0.000001:
                            past_day.is_full = True
                            logger.debug(f"[{day.date}] Filled past deficit for {past_day.date}: +{amount}s")
                            if fill_direction == "start_date" and past_idx == oldest_unfilled_idx:
                                oldest_unfilled_idx += 1
            
            # STEP C: Fill Future (Buffer)
            if is_stacked and available_to_allocate > 0.000001:
                future_buffer = available_to_allocate
                logger.debug(f"[{day.date}] Carry over to future: {future_buffer}s")
            
            kept_by_today = min(day.physically_logged_today, day.allocated_to_this_day)
            day.contributed_to_others = max(0.0, day.physically_logged_today - kept_by_today)
                
        # 4. Calculate Final State Metrics
        if not timeline:
            return LedgerResult(timeline=[], futureBuffer=0.0, todayDeficit=0.0, historicalDebt=0.0)
            
        today_day = timeline[-1]
        today_deficit = max(0.0, today_day.target - today_day.allocated_to_this_day)
        
        historical_debt = 0.0
        for i in range(len(timeline) - 1):
            if not timeline[i].is_full:
                historical_debt += (timeline[i].target - timeline[i].allocated_to_this_day)
        
        logger.info(f"Timeline calculation complete. Final metrics: deficit={today_deficit}, debt={historical_debt}, buffer={future_buffer}")

        return LedgerResult(
            timeline=timeline,
            futureBuffer=float(future_buffer),
            todayDeficit=float(today_deficit),
            historicalDebt=float(historical_debt)
        )

    @staticmethod
    @deeplog
    def calculate_analytics(result: LedgerResult, today: date, logs: List[HabitLog] = None, timezone_offset: int = 0) -> dict:
        total_lifetime_seconds = sum(day.physically_logged_today for day in result.timeline)
        total_days = len(result.timeline)
        avg_work_per_day = total_lifetime_seconds / total_days if total_days > 0 else 0
        
        total_required = sum(day.target for day in result.timeline)
        effective_done = sum(day.allocated_to_this_day for day in result.timeline)
        progress_pct = min(100.0, (effective_done / total_required) * 100) if total_required > 0 else 0.0
        
        # 7-day velocity (excluding today to avoid partial data dragging the average down)
        past_7_days = result.timeline[-8:-1] if len(result.timeline) > 7 else result.timeline[:-1]
        expected_7d = sum(d.target for d in past_7_days)
        actual_7d = sum(d.physically_logged_today for d in past_7_days)
        
        velocity = actual_7d / expected_7d if expected_7d > 0 else (1.0 if actual_7d > 0 else 0.0)
        
        days_counted = len(past_7_days)
        avg_surplus_per_day = (actual_7d - expected_7d) / days_counted if days_counted > 0 else 0
        
        # Fallback to lifetime average if 7-day is not yielding a clearance date
        if avg_surplus_per_day <= 0 and total_days > 0:
            avg_surplus_per_day = (total_lifetime_seconds - total_required) / total_days

        projected_clearance = None
        if result.historicalDebt > 0.000001 and avg_surplus_per_day > 0.000001:
            days_to_clear = int(result.historicalDebt / avg_surplus_per_day)
            if days_to_clear < 3650:
                projected_clearance = (today + timedelta(days=days_to_clear)).isoformat()
                
        # Calculate Modal Completion Hour
        modal_hour = None
        if logs and len(logs) > 0:
            hours = []
            for log in logs:
                if log.created_at:
                    local_time = log.created_at + timedelta(minutes=timezone_offset)
                    hours.append(local_time.hour)
            if hours:
                from collections import Counter
                modal_hour = Counter(hours).most_common(1)[0][0]
            
        return {
            "totalLifetimeSeconds": total_lifetime_seconds,
            "avgWorkPerDay": round(avg_work_per_day, 2),
            "debtVelocity": round(velocity, 2),
            "projectedClearanceDate": projected_clearance,
            "progress_pct": round(progress_pct, 2),
            "modal_completion_hour": modal_hour
        }
