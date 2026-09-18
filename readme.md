# NeuroGrid

AI-powered demand-response coordination for smart energy systems. This project combines a FastAPI backend, a React dashboard, and a live meter simulation flow to detect grid stress, target demand reduction, and verify compliance with randomized spot audits.

## Overview

NeuroGrid monitors environmental conditions and household telemetry, calculates a thermal grid deficit, generates a reduction strategy, dispatches customer alerts, and then audits whether households actually hold their load under target thresholds.

The app is designed around a real-time operator workflow:

- live weather and grid conditions
- household and meter tracking
- AI-generated strategy recommendations
- dispatch messaging
- verification and audit tracking
- dashboard visibility for operators

## Project structure

```text
NeuroGrid/
├── backend/
│   ├── app/
│   │   ├── db/
│   │   │   └── session.py
│   │   ├── models/
│   │   │   └── demand_response.py
│   │   ├── routers/
│   │   │   ├── consumers.py
│   │   │   ├── events.py
│   │   │   └── telemetry.py
│   │   ├── schemas/
│   │   │   ├── consumer_schema.py
│   │   │   └── llm_outputs.py
│   │   ├── services/
│   │   │   ├── llm_copywriter.py
│   │   │   ├── llm_strategist.py
│   │   │   ├── scheduler_instance.py
│   │   │   ├── scheduler.py
│   │   │   ├── twilio_client.py
│   │   │   ├── verifier.py
│   │   │   └── weather_service.py
│   │   └── main.py
│   ├── scripts/
│   │   └── simulate_meters.py
│   └── venv/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.jsx
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── dashboard/
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── .gitignore
├── readme.md
└── .vscode/
```

## Core workflow

1. Weather data is fetched from the backend services.
2. The system calculates a grid deficit using current temperature and humidity conditions.
3. A strategy engine identifies which consumers should be targeted and by how much.
4. The copywriter generates the message content for each household.
5. The event router dispatches the strategy and schedules randomized verification checks.
6. The dashboard reads the live statuses and shows progress, verified results, and failed audits.

## Backend

The backend is a FastAPI app and lives under `backend/app`.

### Key backend files

- `backend/app/main.py` — app startup, DB setup, scheduler startup, API registration
- `backend/app/routers/events.py` — trigger DR events, summarize history, expose dashboard state
- `backend/app/routers/telemetry.py` — accept smart meter readings
- `backend/app/routers/consumers.py` — register and list consumers
- `backend/app/models/demand_response.py` — consumer and dispatch models
- `backend/app/services/weather_service.py` — weather and load-forecast logic
- `backend/app/services/llm_strategist.py` — load reduction targeting logic
- `backend/app/services/llm_copywriter.py` — customer message drafting
- `backend/app/services/verifier.py` — randomly scheduled audit checks
- `backend/scripts/simulate_meters.py` — test meter stream for compliant and cheating households

## Frontend

The frontend is a Vite + React dashboard designed for grid operators.

### Frontend app files

- `frontend/src/App.jsx` — app entry point
- `frontend/src/pages/DashboardPage.jsx` — main dashboard screen
- `frontend/src/components/dashboard/` — summaries, tables, alerts, and dispatch data
- `frontend/src/components/common/` — shared UI elements like status badges and metrics
- `frontend/src/api/client.jsx` — API integration layer

## Tech stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL / async SQLAlchemy
- APScheduler
- Pydantic
- httpx
- python-dotenv

### Frontend

- React
- Vite
- JavaScript / JSX
- CSS

## Local setup

# Example .env needed for local development
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/neurogrid
GROQ_API_KEY=your_groq_api_key_here

### 1. Backend

From the project root:

```bash
cd backend
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

On macOS/Linux:

```bash
source venv/bin/activate
```

Install required Python packages. The repo does not currently include a committed requirements file, so install the libraries used by the app directly:

```bash
pip install fastapi uvicorn sqlalchemy asyncpg python-dotenv pydantic httpx apscheduler
```

Create a `.env` file inside `backend/` with a database URL similar to:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/neurogrid
```

Run the API:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

- http://localhost:8000
- Swagger docs: http://localhost:8000/docs

### 2. Frontend

From the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite app in the browser:

- http://localhost:5173

## Demo / simulation flow

A meter simulator is included for testing the DR loop.

```bash
cd backend
python scripts/simulate_meters.py
```

This streams synthetic household consumption so the app can emulate normal usage and cheating behavior.

To trigger a demand-response cycle manually:

```bash
curl http://localhost:8000/events/trigger
```

You can also review the event status and operational state from:

- `/events/history`
- `/events/dashboard-state`
- `/events/verification/{log_id}`

## API highlights

### Consumers

- `POST /consumers/` — register a consumer
- `GET /consumers/` — list registered consumers
- `DELETE /consumers/{phone}` — remove a consumer

### Telemetry

- `POST /telemetry/meter` — update live meter load for a household

### Events

- `GET /events/trigger` — execute a demand-response cycle
- `GET /events/history` — view dispatch history
- `GET /events/dashboard-state` — dashboard summary payload
- `GET /events/verification/{log_id}` — check audit progress

## Notes

- The current backend and frontend are already wired together for local development.
- The project uses an operator dashboard to view live demand-response events and verification outcomes.
- The design is intentionally focused on practical control-room usage rather than a generic marketing landing page.

## License

This project is currently structured as an internal demo and prototype repository without a formal license file in the root directory.
