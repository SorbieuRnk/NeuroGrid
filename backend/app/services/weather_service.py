import requests

def get_live_grid_conditions(lat: float = 26.1445, lon: float = 91.7362) -> dict:
    """
    Fetches real-time weather from Open-Meteo and calculates dynamic kW deficit.
    Default coordinates set to Guwahati.
    """
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m"
    
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        
        current_temp = data["current"]["temperature_2m"]
        humidity = data["current"]["relative_humidity_2m"]
        
        # Dynamic calculation: Base load deficit increases as temperature rises above 30°C (AC surge)
        base_deficit = 1.0
        if current_temp > 30.0:
            excess_temp = current_temp - 30.0
            calculated_deficit = base_deficit + (excess_temp * 0.25)
        else:
            calculated_deficit = base_deficit
            
        return {
            "temperature": current_temp,
            "humidity": humidity,
            "calculated_kw_deficit": round(calculated_deficit, 2)
        }
    except Exception as e:
        print(f"[!] Weather API Error: {e}, falling back to default deficit.")
        return {
            "temperature": 32.0,
            "humidity": 75,
            "calculated_kw_deficit": 1.5
        }