from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from models.race_simulation import simulate_race

router = APIRouter()

class SimRequest(BaseModel):
    circuit: str = "monaco"
    total_laps: int = 78
    strategy: List[dict] = [
        {"compound": "soft",   "laps": 29},
        {"compound": "hard",   "laps": 49},
    ]
    track_temp: float = 42.0
    rain_pct: float = 12.0
    starting_position: int = 5

@router.post("/run")
def run_simulation(req: SimRequest):
    result = simulate_race(
        req.circuit, req.total_laps, req.strategy,
        req.track_temp, req.rain_pct, req.starting_position
    )
    return result
