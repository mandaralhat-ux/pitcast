from fastapi import APIRouter, Query
from models.pit_optimizer import get_optimal_strategies, get_sc_curve

router = APIRouter()

@router.get("/recommend")
def recommend_strategy(
    circuit: str = Query("monaco"),
    laps: int = Query(78),
    track_temp: float = Query(42.0),
    rain_pct: float = Query(12.0),
    current_lap: int = Query(0),
):
    strategies = get_optimal_strategies(circuit, laps, track_temp, rain_pct, current_lap)
    sc_curve = get_sc_curve(circuit, laps, rain_pct)
    best = next((s for s in strategies if s["recommended"]), strategies[0])
    return {
        "circuit": circuit,
        "conditions": {"track_temp": track_temp, "rain_pct": rain_pct, "laps": laps},
        "strategies": strategies,
        "sc_curve": sc_curve,
        "summary": {
            "optimal_window": best["pit_window"],
            "recommended_strategy": best["name"],
            "ml_confidence": best["confidence"],
            "sc_peak_risk": max(p["probability"] for p in sc_curve),
        }
    }
