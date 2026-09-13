import os
from fastapi import APIRouter
from app.services.weather_service import get_live_grid_conditions
from app.services.llm_strategist import generate_demand_response_strategy
from app.services.llm_copywriter import draft_whatsapp_message



router = APIRouter(prefix="/events", tags=["Demand Response Events"])

@router.get("/trigger")
async def trigger_event():
    # 1. Fetch live weather & compute real-time grid deficit
    grid_data = get_live_grid_conditions()
    dynamic_deficit = grid_data["calculated_kw_deficit"]
    
    print("\n--- Live Grid Telemetry ---")
    print(f"Temperature: {grid_data['temperature']}°C | Humidity: {grid_data['humidity']}%")
    print(f"Computed Target Deficit: {dynamic_deficit} kW\n")
    
    mock_database = """

    User A: Phone +918847814413, Appliances: [Water Pump (1.5kW), AC (2.0kW)], Preference: Travel Vouchers.
    User B: Phone +919999999999, Appliances: [EV Charger (7.0kW)], Preference: Bill Discount.
    User C: Phone +918847814413, Appliances: [Refrigerator (0.5kW), Water Pump (1.5kW), AC (2.0kW)], Preference: Travel Vouchers.
    """
    
    try:
        # 2. Pass the dynamic weather-driven deficit into the AI Strategist
        print("Consulting LangChain Strategist...")
        strategy = generate_demand_response_strategy(kw_deficit=dynamic_deficit, user_profiles=mock_database)
        
        # 3. Generate copy for target users
        results = []
        for user in strategy.target_users:
            draft = draft_whatsapp_message(user)
            print(f"Generated Draft for {draft.phone_number}: {draft.message_body}")
            results.append(draft.message_body)
            
        return {
            "status": "success",
            "weather": grid_data,
            "generated_messages": results
        }
        
    except Exception as e:
        print(f"\n[!] Pipeline Error: {e}")
        return {"status": "failed", "error": str(e)}