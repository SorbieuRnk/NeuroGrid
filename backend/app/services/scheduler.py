from app.db.session import AsyncSessionLocal
from app.routers.events import run_demand_response_cycle
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

async def scheduled_job():
    async with AsyncSessionLocal() as db:
        await run_demand_response_cycle(db, force=False)
#change the minutes to make work normally
def start_scheduler():
    scheduler.add_job(scheduled_job, trigger="interval", minutes=450000, id="grid_monitor", replace_existing=True)
    scheduler.start()

def shutdown_scheduler():
    scheduler.shutdown(wait=False)