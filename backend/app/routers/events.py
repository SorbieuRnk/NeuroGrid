from app.db.session import get_db
from app.models.demand_response import Consumer, DispatchLog
from app.services.llm_copywriter import draft_percentage_message
from app.services.llm_strategist import generate_demand_response_strategy
from app.services.weather_service import get_live_grid_conditions
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/events", tags=["Demand Response Events"])


GRID_DEFICIT=1.2 #kW


async def run_demand_response_cycle(db:AsyncSession,force:bool=False):
    grid_data = get_live_grid_conditions()
    deficit = grid_data["calculated_kw_deficit"]

    if deficit < GRID_DEFICIT and not force:
        return {"status": "normal_operation", "deficit": deficit}

    
    result = await db.execute(select(Consumer))
    consumers = result.scalars().all()

    if not consumers:
        return {"status": "no_active_consumers"}


    profiles_text = "\n".join([
        f"User: Phone {c.phone}, Current Load: {c.current_kw} kW, Preference: {c.reward_preference}."
        for c in consumers
    ])

    try:
        strategy = generate_demand_response_strategy(kw_deficit=deficit, user_profiles=profiles_text)
        consumer_map = {c.phone: c for c in consumers}
        dispatched_messages = []


        for target in strategy.target_users:
            draft = draft_percentage_message(target)
            consumer_record = consumer_map.get(target.phone_number)


            if consumer_record:
                log_entry = DispatchLog(
                    consumer_id=consumer_record.id,
                    temperature=grid_data["temperature"],
                    humidity=grid_data["humidity"],
                    calculated_kw_deficit=deficit,
                    baseline_kw=target.current_kw,
                    reduction_percent=target.reduction_percent,
                    target_reduction_kw=target.target_reduction_kw,
                    message_body=draft.message_body
                )
                db.add(log_entry)


            dispatched_messages.append({
                "to": draft.phone_number,
                "current_load_kw": target.current_kw,
                "reduction_target": f"{target.reduction_percent}%",
                "message": draft.message_body
            })

            await db.commit()
            
        return {
            "status": "success",
            "weather": grid_data,
            "curtailment_strategy": strategy.model_dump(),
            "messages": dispatched_messages
        }
    except Exception as e:
        db.rollback()
        return {"status": "error", "detail": str(e)}
    

@router.get("/trigger")
async def trigger_event(force: bool = True, db: AsyncSession = Depends(get_db)):
    """HTTP endpoint reusing the core function."""
    return await run_demand_response_cycle(db, force=force)




@router.get("/history")
async def get_dispatch_history(limit:int=10,db:AsyncSession=Depends(get_db)):
    """Fetches past demand-response events along with consumer details and cumulative savings."""
    query = (
        select(DispatchLog)
        .options(selectinload(DispatchLog.consumer))
        .order_by(DispatchLog.dispatched_at.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    logs=result.scalars().all()
    total_target_reduction_kw = sum(log.target_reduction_kw for log in logs)

    return {
        "record_count": len(logs),
        "total_potential_load_shed_kw": round(total_target_reduction_kw, 2),
        "history": [
            {
                "log_id": log.id,
                "phone": log.consumer.phone if log.consumer else None,
                "dispatched_at": log.dispatched_at.isoformat(),
                "baseline_kw": log.baseline_kw,
                "reduction_target": f"{log.reduction_percent}%",
                "curtailed_kw": log.target_reduction_kw,
                "temperature": log.temperature,
                "message": log.message_body
            }
            for log in logs
        ]
    }