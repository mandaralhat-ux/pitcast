from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional
from models.championship_forecaster import forecast_season, get_trajectory, get_constructors

router = APIRouter()

class ScenarioRequest(BaseModel):
    scenarios: Optional[Dict[str, str]] = {}

@router.get("/standings")
def get_standings(scenario: str = ""):
    scenarios = {}
    if scenario:
        for part in scenario.split(","):
            if ":" in part:
                k, v = part.split(":", 1)
                scenarios[k.strip()] = v.strip()
    standings = forecast_season(scenarios)
    trajectory = get_trajectory(scenarios)
    return {"standings": standings, "trajectory": trajectory, "scenarios_applied": scenarios}

@router.get("/constructors")
def constructors():
    return {"constructors": get_constructors()}
