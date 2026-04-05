"""
Core data models and API schemas for the Habit Bank application.

This module defines the structure of the data using SQLModel, which combines
SQLAlchemy and Pydantic. It includes table models for Users, Habits, Target
Phases, and Habit Logs.

It also defines the Pydantic schemas used for API request and response validation,
ensuring a clear separation between the database representation and the API
interface. This helps in preventing data leakage and provides a clear contract
for the API.
"""
import uuid
from datetime import date, datetime, timezone
from typing import Optional, List

from pydantic import BaseModel
from sqlalchemy import Index, Column, JSON
from sqlmodel import Field, Relationship, SQLModel

# ==============================================================================
# Database Table Models
# ==============================================================================
# These models define the database schema and are used by SQLAlchemy/SQLModel
# to interact with the database.
# ==============================================================================

class UserBase(SQLModel):
    """Base model for a user, containing shared properties."""
    username: str = Field(index=True, unique=True)
    daily_buffers: dict = Field(
        default_factory=dict, 
        sa_column=Column(JSON),
        description="Named time deductions in seconds (e.g., {'Sleep': 28800, 'Chores': 7200})."
    )
    day_start_hour: int = Field(default=0, description="The hour (0-23) when the user's day starts.")
    week_start_day: int = Field(default=0, description="The day (0-6, 0=Monday) when the user's week starts.")
    fill_direction: str = Field(default="start_date", description="Direction to fill deficits: 'start_date' or 'today'.")
    timezone_offset: int = Field(default=0, description="Timezone offset in minutes from UTC (e.g., 330 for IST).")

class User(UserBase, table=True):
    """Represents a user in the database."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    habits: List["Habit"] = Relationship(back_populates="user", cascade_delete=True)
    feedbacks: List["Feedback"] = Relationship(back_populates="user", cascade_delete=True)

class HabitBase(SQLModel):
    """Base model for a habit, containing shared properties."""
    name: str = Field(index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    is_stacked: bool = Field(default=False, description="If true, allows debt/buffer to accumulate.")
    priority: int = Field(default=100, description="Lower number means higher priority.")
    start_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    base_unit_name: str = Field(default="seconds", description="The smallest unit for tracking this habit.")
    unit_hierarchy: dict = Field(
        default_factory=dict,
        sa_column=Column(JSON),
        description="Defines conversion rates between different units (e.g., {'minutes': {'seconds': 60}})."
    )
    mark_off_unit: str = Field(description="The primary unit used for logging progress.")
    display_unit: Optional[str] = Field(default=None, description="The unit preferred for UI display.")
    color: Optional[str] = Field(default=None, description="A hex color code for UI theming.")
    frequency_type: str = Field(default="daily", description="Frequency type: daily, weekly, monthly.")
    frequency_count: int = Field(default=1, description="Number of times per frequency period.")

class Habit(HabitBase, table=True):    """Represents a habit in the database, linked to a user."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    user: User = Relationship(back_populates="habits")
    target_phases: List["TargetPhase"] = Relationship(back_populates="habit", cascade_delete=True)
    habit_logs: List["HabitLog"] = Relationship(back_populates="habit", cascade_delete=True)

class TargetPhaseBase(SQLModel):
    """
    Base model for a target phase, defining a goal for a specific period.
    A habit can have multiple target phases over its lifetime.
    """
    habit_id: uuid.UUID = Field(foreign_key="habit.id", index=True)
    start_date: date
    end_date: Optional[date] = Field(default=None, description="If null, the phase continues indefinitely.")
    target_value: float
    unit: str = Field(default="seconds", description="The unit this target_value was defined in.")

class TargetPhase(TargetPhaseBase, table=True):
    """Represents a target phase for a habit in the database."""
    __table_args__ = (
        Index("ix_target_phase_habit_id_start_date", "habit_id", "start_date"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    habit: Habit = Relationship(back_populates="target_phases")

class HabitLogBase(SQLModel):
    """Base model for a log entry, representing an instance of a habit performed."""
    habit_id: uuid.UUID = Field(foreign_key="habit.id", index=True)
    logged_date: date = Field(index=True)
    value: float
    unit: str = Field(default="seconds", description="The unit this value was logged in.")

class HabitLog(HabitLogBase, table=True):
    """Represents a single log of a habit performed on a specific date."""
    __table_args__ = (
        Index("ix_habit_log_habit_id_logged_date", "habit_id", "logged_date"),
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    habit: Habit = Relationship(back_populates="habit_logs")


# ==============================================================================
# Pydantic API Schemas
# ==============================================================================
# These schemas define the shape of the data for API requests and responses.
# They are used by FastAPI for validation and serialization. Using separate
# schemas for API operations is a best practice to avoid exposing database
# model details.
# ==============================================================================

class UserCreate(UserBase):
    """Schema for creating a new user."""
    pass

class UserUpdate(BaseModel):
    """Schema for updating a user's data."""
    username: Optional[str] = None
    daily_buffers: Optional[dict] = None
    day_start_hour: Optional[int] = None
    week_start_day: Optional[int] = None
    fill_direction: Optional[str] = None
    timezone_offset: Optional[int] = None

class UserRead(UserBase):
    """Schema for reading a user's data."""
    id: uuid.UUID

class HabitCreate(HabitBase):
    """Schema for creating a new habit."""
    pass

class HabitUpdate(BaseModel):
    """Schema for updating an existing habit."""
    name: Optional[str] = None
    priority: Optional[int] = None
    start_date: Optional[date] = None
    is_stacked: Optional[bool] = None
    base_unit_name: Optional[str] = None
    unit_hierarchy: Optional[dict] = None
    mark_off_unit: Optional[str] = None
    display_unit: Optional[str] = None
    color: Optional[str] = None
    frequency_type: Optional[str] = None
    frequency_count: Optional[int] = None

class HabitRead(HabitBase):
    """Schema for reading a habit's data."""
    id: uuid.UUID

class TargetPhaseCreate(BaseModel):
    """Schema for creating a new target phase for a habit."""
    habit_id: uuid.UUID
    start_date: date
    end_date: Optional[date] = None
    target_value: float
    unit: Optional[str] = Field(default=None, description="The unit for target_value, will be converted to base units.")

class TargetPhaseRead(TargetPhaseBase):
    """Schema for reading a target phase's data."""
    id: uuid.UUID

class HabitLogCreate(HabitLogBase):
    """Schema for creating a new habit log via certain internal endpoints."""
    pass

class HabitLogRead(HabitLogBase):
    """Schema for reading a habit log's data."""
    id: uuid.UUID
    created_at: datetime

class HabitLogRequest(BaseModel):
    """Schema for creating a new habit log from user input, allows specifying units."""
    logged_date: date
    value: float
    unit: str

class TimelineDaySchema(BaseModel):
    """Represents the state of a single day in the habit timeline view."""
    date: str
    target: float
    physically_logged_today: float
    allocated_to_this_day: float
    is_full: bool
    received_from_surplus: float = 0
    contributed_to_others: float = 0

class HabitStateRead(BaseModel):
    """
    Represents the complete, calculated state of a habit for dashboard display.
    This is a read-only model that aggregates data to provide a snapshot.
    """
    habit_id: uuid.UUID
    todayDeficit: float
    historicalDebt: float
    futureBuffer: float
    todayTarget: float = 0.0
    totalLifetimeSeconds: float
    avgWorkPerDay: float
    debtVelocity: float
    projectedClearanceDate: Optional[str] = None
    display_unit: Optional[str] = None
    mark_off_unit: str
    timeline: List[TimelineDaySchema] = []

# ==============================================================================
# SaaS Selling Machine Models
# ==============================================================================

class WaitlistEntry(SQLModel, table=True):
    """Represents a potential lead in the SaaS waitlist."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: Optional[str] = None
    referral_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Testimonial(SQLModel, table=True):
    """Dynamic social proof for the landing page."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    author_name: str
    author_title: str
    content: str
    rating: int = Field(default=5)
    avatar_url: Optional[str] = None
    is_published: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WaitlistCreate(BaseModel):
    email: str
    name: Optional[str] = None

class TestimonialCreate(BaseModel):
    author_name: str
    author_title: str
    content: str
    rating: int = 5
    avatar_url: Optional[str] = None
    is_published: bool = False

class Feedback(SQLModel, table=True):
    """User feedback for the application."""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: User = Relationship(back_populates="feedbacks")

class FeedbackCreate(BaseModel):
    user_id: uuid.UUID
    content: str

class FeedbackRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    user_username: str
    content: str
    created_at: datetime

class SystemConfig(SQLModel, table=True):
    """System-wide configuration settings (e.g., admin credentials)."""
    key: str = Field(primary_key=True)
    value: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
