from app.db.session import get_db
from app.models.demand_response import Consumer
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter(prefix="/telemetry", tags=["Smart Meter Telemetry"])
class MeterReading(BaseModel):
    phone: str = Field(..., example="+918847814413")
    current_kw: float = Field(..., ge=0.0, example=3.75, description="Instantaneous power draw in kW")

@router.post("/meter",status_code=status.HTTP_200_OK)
async def update_meter_reading(reading:MeterReading,db:AsyncSession=Depends(get_db)):
    """Receives live power telemetry from a household smart meter and updates the database."""
    query = select(Consumer).where(Consumer.phone == reading.phone)
    result=await db.execute(query)
    consumer = result.scalars().first()
    if not consumer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consumer with phone {reading.phone} not registered."
        )
    old_kw = consumer.current_kw
    consumer.current_kw = round(reading.current_kw, 3)
    await db.commit()
    await db.refresh(consumer)
    
    return {
        "status": "updated",
        "phone": consumer.phone,
        "previous_kw": old_kw,
        "new_kw": consumer.current_kw
    }