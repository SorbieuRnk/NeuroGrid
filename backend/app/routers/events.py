from fastapi import APIRouter
from app.services.weather_service import get_live_grid_conditions
from app.services.llm_strategist import generate_demand_response_strategy
from app.services.llm_copywriter import draft_percentage_message

router = APIRouter(prefix="/events", tags=["Demand Response Events"])

@router.get("/trigger")
async def trigger_event():
    grid_data = get_live_grid_conditions()
    deficit = grid_data["calculated_kw_deficit"]
    
    # Household meter telemetry: total live draw per home
    household_telemetry = """
    User A: Phone +918847814413, Current Load: 4.8 kW, Preference: Travel Vouchers.
    User B: Phone +919876543210, Current Load: 3.2 kW, Preference: Electricity Bill Discount.
    User C: Phone +919123456789, Current Load: 1.1 kW, Preference: Cashback.
    """
    
    try:
        strategy = generate_demand_response_strategy(kw_deficit=deficit, user_profiles=household_telemetry)
        
        dispatched_messages = []
        for target in strategy.target_users:
            draft = draft_percentage_message(target)
            dispatched_messages.append({
                "to": draft.phone_number,
                "current_load_kw": target.current_kw,
                "reduction_target": f"{target.reduction_percent}%",
                "message": draft.message_body
            })
            
        return {
            "status": "success",
            "weather": grid_data,
            "curtailment_strategy": strategy.model_dump(),
            "messages": dispatched_messages
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}