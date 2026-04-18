# PitCast — F1 Strategy Intelligence Platform

A full-stack F1 strategy platform combining ML-powered pit stop optimization, championship forecasting, and lap-by-lap race simulation.

---

## Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Backend    | Python · FastAPI · NumPy                |
| ML Models  | XGBoost (pit optimizer) · Prophet-style Monte Carlo (forecaster) |
| Frontend   | React 18 · Vite · Recharts             |
| Data       | Ergast API · OpenF1 API                 |

---

## Project Structure

```
pitcast/
├── backend/
│   ├── main.py                    # FastAPI app, CORS, router registration
│   ├── requirements.txt
│   ├── models/
│   │   ├── pit_optimizer.py       # Tyre degradation + SC probability model
│   │   ├── championship_forecaster.py  # Monte Carlo standings projector
│   │   └── race_simulation.py     # Lap-by-lap race simulator
│   └── routers/
│       ├── strategy.py            # GET /api/strategy/recommend
│       ├── forecast.py            # GET /api/forecast/standings
│       └── simulation.py         # POST /api/simulation/run
└── frontend/
    ├── index.html
    ├── vite.config.js             # Proxy /api → localhost:8000
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx                # Root layout, tab routing
        ├── api.js                 # All fetch calls
        ├── index.css              # Global design tokens
        └── components/
            ├── Navbar.jsx
            ├── Hero.jsx
            ├── CircuitSelector.jsx
            ├── PitStrategy.jsx    # Strategy recommendations + SC curve
            ├── Championship.jsx   # Standings + what-if + trajectory chart
            └── RaceSim.jsx        # Race simulator + lap table
```

---

## Getting Started

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

---

## API Endpoints

### Strategy
```
GET /api/strategy/recommend
  ?circuit=monaco
  &laps=78
  &track_temp=42.0
  &rain_pct=12.0
  &current_lap=0
```
Returns top-5 ranked strategies with confidence scores and SC risk curve.

### Championship Forecast
```
GET /api/forecast/standings
  ?scenario=ferrari:dnf,red_bull:penalty
```
Scenario format: `{team_id}:{type}` where type is `dnf`, `boost`, or `penalty`.
Comma-separate multiple scenarios.

### Race Simulation
```
POST /api/simulation/run
{
  "circuit": "monaco",
  "total_laps": 78,
  "strategy": [
    {"compound": "soft", "laps": 29},
    {"compound": "hard", "laps": 49}
  ],
  "track_temp": 42.0,
  "rain_pct": 12.0,
  "starting_position": 5
}
```
Returns full lap-by-lap telemetry, pit laps, safety car events, and final position.

### Circuits
```
GET /api/circuits
```

---

## Features

### Pit Stop Optimizer
- Tyre degradation model per compound (soft/medium/hard) factoring track temperature
- Safety car probability curve using Poisson process calibrated per circuit
- Generates and ranks 1-stop and 2-stop strategies
- Undercut window detection with ML confidence score

### Championship Forecaster
- Monte Carlo simulation (n=500) over remaining races
- Constructor strength ratings tuned to current season form
- What-if scenarios: DNF, performance boost, penalty points
- Time-series trajectory chart for top 4 constructors
- Title win probability per constructor

### Race Simulator
- Configurable strategy (up to 3 stints)
- Lap-by-lap position tracking with noise model
- Safety car random events (Poisson, circuit-calibrated)
- Lap time trace with tire age degradation cliff
- Full lap table with position, tire, SC/pit events

---

## Extending with Live Data

To connect live Ergast/OpenF1 data, add a `data/data_pipeline.py`:

```python
import httpx

ERGAST_BASE = "https://ergast.com/api/f1"
OPENF1_BASE = "https://api.openf1.org/v1"

async def fetch_latest_results():
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{ERGAST_BASE}/current/results.json")
        return r.json()

async def fetch_live_timing(session_key: int):
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{OPENF1_BASE}/laps?session_key={session_key}")
        return r.json()
```

Then schedule `fetch_latest_results()` nightly with APScheduler and wire it into the forecaster.

---

## Circuit IDs

| ID           | Circuit      | Country    | Laps |
|--------------|--------------|------------|------|
| `monaco`     | Monaco       | Monaco     | 78   |
| `silverstone`| Silverstone  | UK         | 52   |
| `monza`      | Monza        | Italy      | 53   |
| `suzuka`     | Suzuka       | Japan      | 53   |
| `melbourne`  | Melbourne    | Australia  | 58   |
| `spa`        | Spa          | Belgium    | 44   |
| `interlagos` | Interlagos   | Brazil     | 71   |
