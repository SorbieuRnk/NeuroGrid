import asyncio
import random
import httpx

API_BASE = "http://localhost:8000"

# Target pool matching the seeded consumers
HOUSEHOLDS = [
    {"phone": "+918847814413", "name": "Apartment 4B", "behavior": "compliant"},
    {"phone": "+919876543210", "name": "Villa 12", "behavior": "compliant"},
    {"phone": "+919123456789", "name": "Unit 102", "behavior": "cheater"},  # Spikes load during audit
]

async def update_meter(client: httpx.AsyncClient, phone: str, load_kw: float):
    try:
        res = await client.post(f"{API_BASE}/telemetry/meter", json={"phone": phone, "current_kw": load_kw})
        if res.status_code == 200:
            print(f"📡 [Meter Telemetry] {phone} -> {load_kw:.2f} kW")
        else:
            print(f"⚠️ Failed to update {phone}: {res.text}")
    except Exception as e:
        print(f"❌ Connection error for {phone}: {e}")

async def run_simulation_cycle(duration_seconds: int = 120, tick_interval: int = 5):
    """
    Continuously streams fluctuating meter values.
    Compliant households throttle down; 'cheater' households spike load.
    """
    async with httpx.AsyncClient() as client:
        print("\n🚀 Starting Real-Time Household Smart Meter Simulator...")
        elapsed = 0

        while elapsed < duration_seconds:
            tasks = []
            for h in HOUSEHOLDS:
                # Normal baseline noise between 2.5 kW and 5.0 kW
                if h["behavior"] == "compliant":
                    # Simulated reduction: keeps load low (e.g., 1.0 - 2.0 kW)
                    kw = random.uniform(1.0, 2.1)
                else:
                    # Cheater behavior: keeps running heavy AC / geyser (e.g., 4.5 - 6.0 kW)
                    kw = random.uniform(4.5, 6.0)

                tasks.append(update_meter(client, h["phone"], round(kw, 2)))

            await asyncio.gather(*tasks)
            await asyncio.sleep(tick_interval)
            elapsed += tick_interval

if __name__ == "__main__":
    asyncio.run(run_simulation_cycle())