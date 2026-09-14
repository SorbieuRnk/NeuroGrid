from app.db.session import get_db
from app.models.demand_response import Consumer
from app.schemas.consumer_schema import ConsumerCreate, ConsumerResponse
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/consumers", tags=["Consumer Management"])

@router.post("/", response_model=ConsumerResponse, status_code=status.HTTP_201_CREATED)
async def register_consumer(payload: ConsumerCreate, db: AsyncSession = Depends(get_db)):
    """Registers a new household consumer into the demand-response registry."""
    # Check if consumer with same phone already exists
    existing = await db.execute(select(Consumer).where(Consumer.phone == payload.phone))
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Consumer with phone {payload.phone} is already registered."
        )

    new_consumer = Consumer(
        phone=payload.phone.strip(),
        household_name=payload.household_name.strip(),
        current_kw=round(payload.current_kw, 3),
        reward_preference=payload.reward_preference.strip()
    )

    db.add(new_consumer)
    await db.commit()
    await db.refresh(new_consumer)
    return new_consumer


@router.get("/", response_model=list[ConsumerResponse])
async def list_consumers(db: AsyncSession = Depends(get_db)):
    """Retrieves all registered consumers and their baseline metrics."""
    result = await db.execute(select(Consumer).order_by(Consumer.id.asc()))
    return result.scalars().all()


@router.delete("/{phone}", status_code=status.HTTP_200_OK)
async def delete_consumer(phone: str, db: AsyncSession = Depends(get_db)):
    """Removes a household from the demand-response registry."""
    result = await db.execute(select(Consumer).where(Consumer.phone == phone))
    consumer = result.scalars().first()

    if not consumer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Consumer with phone {phone} not found."
        )

    await db.delete(consumer)
    await db.commit()
    return {"status": "deleted", "phone": phone}