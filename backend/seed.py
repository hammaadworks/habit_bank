import uuid
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, create_engine, SQLModel, select
from app.models import Habit, TargetPhase, HabitLog, User

# Fix path for local execution
engine = create_engine("sqlite:///habit_bank.db")

def seed():
    # Ensure tables exist
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Check if already seeded
        existing = session.exec(select(User)).first()
        if existing:
            print("Database already has data.")
            return

        u1 = User(
            username="admin",
            daily_buffers={"Sleep": 28800, "Chores": 7200} # 8h + 2h
        )

        session.add(u1)
        session.commit()
        session.refresh(u1)

        # Create a Habit: Quran Reading (Nested)
        # 1 juz = 20 pages, 1 page = 15 lines, 1 page = 300 seconds
        h1 = Habit(
            name="Quran Reading", 
            user_id=u1.id,
            priority=1, 
            base_unit_name="seconds",
            unit_hierarchy={
                "juz": {"pages": 20},
                "pages": {"lines": 15, "seconds": 300},
                "lines": {"seconds": 20}
            },
            mark_off_unit="lines",
            display_unit="pages",
            color="#14B8A6"
        )
        session.add(h1)

        # Create a Habit: Pushups (Simple)
        # 10 pushups = 180 seconds (3 mins)
        h2 = Habit(
            name="Pushups",
            user_id=u1.id,
            priority=2,
            base_unit_name="seconds",
            unit_hierarchy={"pushups": {"seconds": 18}},
            mark_off_unit="pushups",
            display_unit="pushups",
            color="#ef4444"
        )
        session.add(h2)
        session.commit()
        session.refresh(h1)
        session.refresh(h2)

        # Create Target Phases
        start = datetime.now(timezone.utc).date() - timedelta(days=30)
        # Target 1 juz/day = 20 pages * 300s = 6000s
        p1 = TargetPhase(habit_id=h1.id, start_date=start, target_value=6000)
        # Target 100 pushups/day = 100 * 18s = 1800s
        p2 = TargetPhase(habit_id=h2.id, start_date=start, target_value=1800)
        session.add(p1)
        session.add(p2)

        # Log some historical data for Quran (in lines)
        # 1 page = 15 lines. Target 20 pages = 300 lines.
        # Let's log 200 lines (deficit of 100 lines)
        for i in range(1, 5):
            log_date = datetime.now(timezone.utc).date() - timedelta(days=i)
            session.add(HabitLog(habit_id=h1.id, logged_date=log_date, value=200 * 20)) # 200 lines * 20s/line

        session.commit()
        print(f"Database seeded for {u1.username}")

if __name__ == "__main__":
    seed()
