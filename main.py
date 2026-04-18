from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import strategy, forecast, simulation

app = FastAPI(title="PitCast API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(strategy.router, prefix="/api/strategy", tags=["strategy"])
app.include_router(forecast.router, prefix="/api/forecast", tags=["forecast"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["simulation"])

@app.get("/")
def root():
    return {"status": "ok", "service": "PitCast API"}

@app.get("/api/circuits")
def get_circuits():
    return {
        "circuits": [
            {"id": "monaco",      "name": "Monaco",       "flag": "MC", "country": "Monaco",      "laps": 78,  "length_km": 3.337},
            {"id": "silverstone", "name": "Silverstone",  "flag": "GB", "country": "UK",           "laps": 52,  "length_km": 5.891},
            {"id": "monza",       "name": "Monza",        "flag": "IT", "country": "Italy",        "laps": 53,  "length_km": 5.793},
            {"id": "suzuka",      "name": "Suzuka",       "flag": "JP", "country": "Japan",        "laps": 53,  "length_km": 5.807},
            {"id": "melbourne",   "name": "Melbourne",    "flag": "AU", "country": "Australia",    "laps": 58,  "length_km": 5.278},
            {"id": "spa",         "name": "Spa",          "flag": "BE", "country": "Belgium",      "laps": 44,  "length_km": 7.004},
            {"id": "interlagos",  "name": "Interlagos",   "flag": "BR", "country": "Brazil",       "laps": 71,  "length_km": 4.309},
        ]
    }
