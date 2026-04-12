from pydantic_ai import Agent, RunContext
from pydantic import BaseModel, ConfigDict
import uuid
from sqlmodel import Session

class HabitContext(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    user_id: uuid.UUID
    session: Session
    provider: str
    api_key: str
    ai_model: str | None = None
    ai_url: str | None = None

habit_agent = Agent(
    # We use a placeholder model here to prevent Pydantic AI from validating 
    # API keys at module import time. The real model (with BYOK) is 
    # provided at runtime in the chat router.
    'test',
    deps_type=HabitContext,
    instructions=(
        "You are the Habit Bank AI, a strict, elite assistant for a highly ambitious underachiever. "
        "Your goal is to help them achieve victory in this life and the next by managing their habits. "
        "Keep responses concise, actionable, and slightly gamified. "
        "Never apologize. Always use tools to fetch data or perform actions before confirming."
    )
)

@habit_agent.tool
async def query_agenda(ctx: RunContext[HabitContext]) -> str:
    """Fetch the user's current agenda, habits, and debt status for today."""
    from app.routers.dashboard import generate_daily_agenda_snapshot
    agenda = generate_daily_agenda_snapshot(session=ctx.deps.session, user_id=ctx.deps.user_id)
    return agenda.model_dump_json()

@habit_agent.tool
async def stage_create_habit(ctx: RunContext[HabitContext], name: str, target_value: float, target_unit: str, is_stacked: bool = False) -> dict:
    """
    Stage a new habit for creation. 
    Returns the parameters to the frontend so the user can confirm via a UI card.
    """
    return {
        "action": "create_habit",
        "name": name,
        "target_value": target_value,
        "target_unit": target_unit,
        "is_stacked": is_stacked
    }

@habit_agent.tool
async def stage_log_habit(ctx: RunContext[HabitContext], habit_id: str, amount: float, unit: str) -> dict:
    """
    Stage a habit logging event.
    Returns the parameters to the frontend so the user can confirm the log via a UI card.
    """
    return {
        "action": "log_habit",
        "habit_id": habit_id,
        "amount": amount,
        "unit": unit
    }
