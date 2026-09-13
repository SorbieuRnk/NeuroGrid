from fastapi import FastAPI
from app.routers import events

app = FastAPI(
    title="NeuroGrid API",
    description="Automated AI-driven demand-response system for energy management.",
    version="1.0.0"
)

app.include_router(events.router)

@app.get("/")
def health_check():
    return {"status": "NeuroGrid API is online and listening for webhooks."}

