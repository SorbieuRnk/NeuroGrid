⚡ NeuroGrid — Autonomous Demand-Response & Verification GridNeuroGrid is an end-to-end, AI-powered autonomous Demand-Response (DR) management platform for smart electrical grids. Built with inspiration from Schneider Electric's industrial design language, NeuroGrid dynamically senses meteorological stress, formulates behavioral curtailment strategies using LLMs, dispatches micro-targeted incentives, and audits load reductions using a 3-point randomized spot-audit engine to prevent consumer telemetry gaming.🏗️ Architecture Overview                                  [ Open-Meteo API ]
                                          │
                                 (Live Heat & Humidity)
                                          ▼
[ Smart Meter Telemetry ] ──▶ [ Real-Time Thermal Deficit Engine ]
                                          │
                               (Grid Deficit in kW)
                                          ▼
                              [ LLM Strategist Agent ]
                             (Target Selection & Quotas)
                                          │
                                          ▼
                             [ LLM Copywriter Agent ]
                            (Behavioral Alert Drafting)
                                          │
                         ┌────────────────┴────────────────┐
                         ▼                                 ▼
               [ Outbound SMS / Push ]       [ 3-Point Random Spot Auditor ]
              ("Cut 30% for Cashback")       (Surprise Checks in 45m Window)
                                                           │
                                                           ▼
                                           [ Verification State Machine ]
                                          (0/3 ➔ 1/3 ➔ 2/3 ➔ PASS / FAIL)
                                                           │
                                                           ▼
                                              [ Points Settlement Engine ]
⚡ Core Features1. Thermal Grid Deficit IngestionIngests real-time meteorological conditions (temperature, humidity) to calculate active thermal load strains on the local distribution transformer.Evaluates non-linear cooling demand spikes to quantify exact grid curtailment deficits ($kW$).2. Multi-Agent AI Strategy & CopywritingStrategist Agent: Analyzes live smart-meter draws, matches curtailment quotas to optimal consumer baselines, and respects user-preferred incentives (bill discounts, cashback, vouchers).Behavioral Copywriter Agent: Composes micro-targeted, urgency-driven alerts strictly constrained under 160 characters with robust Pydantic JSON validation.3. Anti-Gaming 3-Point Spot Audit EngineTraditional DR programs suffer from rebound spikes and gaming (consumers dropping load for 2 minutes and resuming heavy consumption).NeuroGrid generates 3 hidden, randomized audit timestamps across the DR event window using APScheduler.Only consumers who sustain their targeted curtailment beneath their dynamic threshold for all 3 spot checks transition to VERIFIED. Caught cheaters are immediately flagged as FAILED.4. Schneider Electric Operator Console (SPA)Ultra high-contrast, clean administrative UI (Schneider Green #3DCD58, Deep Charcoal #252525, Crisp White surfaces).Live telemetry polling (3-second cadence).Real-time audit status trackers (0/3, 1/3, 2/3, VERIFIED, FAILED).One-click manual grid emergency dispatch override.📂 Repository LayoutPlaintext├── backend/
│   ├── app/
│   │   ├── core/           # Database engine & async session configs
│   │   ├── models/         # SQLAlchemy 2.0 async ORM models (Consumers, DispatchLogs)
│   │   ├── routers/        # FastAPI endpoints (/consumers, /telemetry, /events)
│   │   ├── schemas/        # Pydantic validation models
│   │   ├── services/
│   │   │   ├── weather_service.py # Open-Meteo live condition ingestion
│   │   │   ├── llm_strategist.py  # LangChain + Groq strategy agent
│   │   │   ├── llm_copywriter.py  # LangChain + Groq behavioral SMS agent
│   │   │   ├── verifier.py        # 3-Point random spot audit scheduler
│   │   │   └── rewards.py         # Points settlement logic
│   │   └── main.py         # FastAPI application entrypoint & lifespan
│   ├── scripts/
│   │   └── simulate_meters.py # Multi-household live load & cheater simulator
│   └── requirements.txt
│
└── frontend/
    ├── public/
    │   └── neurogrid.svg   # Custom brand favicon
    ├── src/
    │   ├── api/
    │   │   └── client.js   # Centralized API fetch layer with env abstraction
    │   ├── components/
    │   │   ├── common/     # Header, MetricCard, StatusBadge
    │   │   └── dashboard/  # MetricsGrid, HouseholdTable, AuditTable, DispatchBanner
    │   ├── pages/
    │   │   └── DashboardPage.jsx # Operator console state orchestrator
    │   ├── App.jsx
    │   └── index.css       # Tailwind CSS directives
    ├── .env                # Local development variables
    ├── .env.production     # Production build variables
    ├── tailwind.config.js  # Schneider design tokens
    └── package.json
🛠️ Getting StartedPrerequisitesPython 3.10+Node.js 18+ & npmPostgreSQL instance running locally or hosted (Supabase / Neon)Groq API Key (console.groq.com)Backend SetupClone the repository:Bashgit clone https://github.com/yourusername/neurogrid.git
cd neurogrid/backend
Create and activate a virtual environment:Bashpython -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
Install dependencies:Bashpip install -r requirements.txt
Configure Environment Variables:Create a .env file inside backend/:Code snippetDATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/neurogrid
GROQ_API_KEY=gsk_your_groq_api_key_here
Initialize Database Schema & Run Server:Ensure PostgreSQL is running and the database neurogrid exists. The tables are generated automatically on startup:Bashuvicorn app.main:app --reload
Interactive OpenAPI docs will be available at http://localhost:8000/docs.Frontend SetupNavigate to the frontend directory:Bashcd ../frontend
Install Node dependencies:Bashnpm install
Configure Environment Variables:Create a .env file in frontend/:Code snippetVITE_API_BASE_URL=http://localhost:8000
Start Vite Development Server:Bashnpm run dev
Access the Operator Console at http://localhost:5173.🧪 Running an End-to-End SimulationLaunch the Smart Meter Telemetry Simulator:In a separate terminal, start continuous meter streaming:Bashcd backend
python scripts/simulate_meters.py
This streams concurrent telemetry for compliant households alongside non-compliant "cheater" households drawing excessive load.Trigger a Demand-Response Event:Open the React Console at http://localhost:5173 and click "DISPATCH DEMAND RESPONSE", or trigger via cURL:Bashcurl -X GET http://localhost:8000/events/trigger
Observe Automated Spot Audits:Review FastAPI logs to see the background scheduler register 3 surprise audit timestamps.Watch the React Operator Console update live as compliant users pass each spot check (1/3 $\to$ 2/3 $\to$ VERIFIED), while cheaters exceeding the curtailment ceiling are flagged as FAILED with exact violation details.📊 Database Schema HighlightsSQL-- Core Household Registry
CREATE TABLE consumers (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    household_name VARCHAR(100),
    current_kw FLOAT DEFAULT 0.0,
    reward_preference VARCHAR(50),
    reward_points INTEGER DEFAULT 0
);

-- Demand-Response Event & Audit Ledger
CREATE TABLE dispatch_logs (
    id SERIAL PRIMARY KEY,
    consumer_id INTEGER REFERENCES consumers(id),
    temperature FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    calculated_kw_deficit FLOAT NOT NULL,
    baseline_kw FLOAT NOT NULL,
    reduction_percent INTEGER NOT NULL,
    target_reduction_kw FLOAT NOT NULL,
    message_body TEXT NOT NULL,
    dispatched_at TIMESTAMP DEFAULT NOW(),
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    audits_completed INTEGER DEFAULT 0,
    failed_reason VARCHAR(255)
);
🔒 Security & Operational Best PracticesNo Secret Exposure: Frontend environment variables rely strictly on the VITE_ prefix and exclude database credentials, backend secrets, or LLM API keys.Resilient Parsing: The LLM extraction pipeline utilizes Pydantic aliases (AliasChoices) alongside JSON mode to safeguard against runtime parsing mismatches.Connection Pooling: Smart meter simulators use bounded connection pool limits and HTTP timeouts to avoid socket exhaustion during rapid telemetry bursts.📜 LicenseDistributed under the MIT License. See LICENSE for details.