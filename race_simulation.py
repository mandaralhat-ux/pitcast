import numpy as np
from typing import List, Dict

CIRCUIT_PROFILES = {
    "monaco":      {"sc_base": 0.34, "pit_loss": 22.5, "base_lap": 75.9},
    "silverstone": {"sc_base": 0.22, "pit_loss": 21.8, "base_lap": 87.1},
    "monza":       {"sc_base": 0.28, "pit_loss": 21.2, "base_lap": 81.3},
    "suzuka":      {"sc_base": 0.18, "pit_loss": 22.0, "base_lap": 91.5},
    "melbourne":   {"sc_base": 0.41, "pit_loss": 22.3, "base_lap": 84.1},
    "spa":         {"sc_base": 0.38, "pit_loss": 23.1, "base_lap": 104.2},
    "interlagos":  {"sc_base": 0.45, "pit_loss": 22.8, "base_lap": 71.0},
}

TIRE_DEG = {
    "soft":   {"base": 0.13, "cliff": 22},
    "medium": {"base": 0.07, "cliff": 35},
    "hard":   {"base": 0.035,"cliff": 50},
}

def simulate_race(
    circuit_id: str,
    total_laps: int,
    strategy: List[Dict],
    track_temp: float,
    rain_pct: float,
    starting_position: int = 1,
) -> dict:
    profile = CIRCUIT_PROFILES.get(circuit_id, CIRCUIT_PROFILES["monaco"])
    base_lap = profile["base_lap"]
    pit_loss = profile["pit_loss"]
    sc_base = profile["sc_base"] + rain_pct / 100 * 0.2

    lap_data = []
    current_lap = 1
    position = starting_position
    total_time = 0
    pit_laps_actual = []
    sc_laps = []
    tire_lap = 0
    stint_idx = 0
    current_compound = strategy[stint_idx]["compound"]
    stint_end = strategy[stint_idx]["laps"]

    while current_lap <= total_laps:
        # SC random event
        is_sc = np.random.random() < sc_base / total_laps
        if is_sc and current_lap > 3 and current_lap not in sc_laps:
            sc_laps.append(current_lap)

        in_sc = any(abs(current_lap - sc) < 4 for sc in sc_laps)

        # Tire deg
        deg = TIRE_DEG[current_compound]
        temp_factor = 1 + max(0, track_temp - 40) * 0.001
        tire_penalty = deg["base"] * temp_factor * tire_lap
        if tire_lap > deg["cliff"]:
            tire_penalty += (tire_lap - deg["cliff"]) * 0.3

        # Lap time
        lap_noise = np.random.normal(0, 0.2)
        if in_sc:
            lap_time = base_lap + 15 + lap_noise * 0.5
        else:
            lap_time = base_lap + tire_penalty + lap_noise

        # Pit stop
        pitted = False
        if tire_lap >= stint_end and stint_idx < len(strategy) - 1:
            lap_time += pit_loss
            pit_laps_actual.append(current_lap)
            stint_idx += 1
            current_compound = strategy[stint_idx]["compound"]
            stint_end = strategy[stint_idx]["laps"]
            tire_lap = 0
            pitted = True
        else:
            tire_lap += 1

        # Position change
        if in_sc:
            pos_delta = 0
        elif pitted:
            pos_delta = 2
        else:
            pos_delta = np.random.choice([-1, 0, 0, 0, 1], p=[0.1, 0.5, 0.25, 0.10, 0.05])
        position = max(1, min(20, position + pos_delta))

        total_time += lap_time
        lap_data.append({
            "lap": current_lap,
            "lap_time": round(lap_time, 3),
            "tire": current_compound,
            "tire_age": tire_lap,
            "position": position,
            "sc": in_sc,
            "pit": pitted,
        })
        current_lap += 1

    mins = int(total_time // 60)
    secs = total_time % 60
    return {
        "total_time": round(total_time, 3),
        "total_time_fmt": f"{mins}:{secs:06.3f}",
        "final_position": position,
        "pit_laps": pit_laps_actual,
        "sc_laps": sc_laps,
        "laps": lap_data,
    }
