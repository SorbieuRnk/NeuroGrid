from contextlib import asynccontextmanager

from app.db.session import AsyncSessionLocal, Base, engine
from app.models.demand_response import Consumer
from fastapi import FastAPI
from sqlalchemy import select,text
from app.services.scheduler import start_scheduler, shutdown_scheduler
from app.routers import events, telemetry,consumers  
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        # Run raw SQL to add columns safely without dropping anything:
        await conn.execute(
            text("""
            ALTER TABLE dispatch_logs 
            ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'PENDING',
            ADD COLUMN IF NOT EXISTS audits_completed INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS failed_reason VARCHAR(255);
            """)
        )
        await conn.run_sync(Base.metadata.create_all)


    start_scheduler()
    yield
    shutdown_scheduler()
    
    await engine.dispose()


app = FastAPI(
    title="NeuroGrid API",
    description="Automated AI-driven demand-response system for energy management.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vite/React/local HTML to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(consumers.router)
app.include_router(events.router)
app.include_router(telemetry.router)

@app.get("/")
def health_check():
    return {"status": "NeuroGrid API is online and listening for webhooks."}

