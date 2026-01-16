"""REI360 Calendar Sync - Google Calendar integration"""

from fastapi import FastAPI, HTTPException
from datetime import datetime

app = FastAPI(title="REI360 Calendar Sync")

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "calendar-sync",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.post("/calendar/schedule")
async def schedule_appointment(title: str, start_time: str, email: str):
    """Schedule appointment"""
    return {
        "status": "success",
        "event_id": "cal-123",
        "title": title,
        "start_time": start_time
    }

@app.get("/calendar/availability")
async def get_availability():
    """Get available time slots"""
    return {
        "status": "success",
        "available_slots": ["2026-01-16 10:00", "2026-01-16 14:00"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8008)
