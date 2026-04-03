from datetime import datetime, date, timedelta, timezone
from app.models import User

def get_current_logical_date(user: User) -> date:
    """
    Calculates the current logical date for a user based on their 
    timezone offset and day start hour.
    """
    # 1. Get current UTC time
    now_utc = datetime.now(timezone.utc)
    
    # 2. Adjust to user's local time using their offset
    user_local_now = now_utc + timedelta(minutes=user.timezone_offset)
    
    # 3. If current local hour is before day_start_hour, it's still "yesterday"
    if user_local_now.hour < user.day_start_hour:
        return (user_local_now - timedelta(days=1)).date()
    
    return user_local_now.date()
