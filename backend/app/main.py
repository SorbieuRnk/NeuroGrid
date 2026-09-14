from contextlib import asynccontextmanager

from app.db.session import AsyncSessionLocal, Base, engine
from app.models.demand_response import Consumer
from fastapi import FastAPI
from sqlalchemy import select

from app.routers import events, telemetry,consumers  

@asynccontextmanager
async def lifespan(app:FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        result=await session.execute(select(Consumer))
        if not result.scalars().first():
            test_users = [
                Consumer(phone="+918847814413", household_name="Apartment 4B", current_kw=4.8, reward_preference="Travel Vouchers"),
                Consumer(phone="+919876543210", household_name="Villa 12", current_kw=3.5, reward_preference="Electricity Bill Discount"),
                Consumer(phone="+919123456789", household_name="Unit 102", current_kw=1.2, reward_preference="Cashback")
            ]
            session.add_all(test_users)
            await session.commit()
            print('mock customers added')
    yield
    await engine.dispose()
app = FastAPI(
    title="NeuroGrid API",
    description="Automated AI-driven demand-response system for energy management.",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(consumers.router)
app.include_router(events.router)
app.include_router(telemetry.router)

@app.get("/")
def health_check():
    return {"status": "NeuroGrid API is online and listening for webhooks."}

