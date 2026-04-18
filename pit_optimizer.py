import numpy as np
from dataclasses import dataclass
from typing import List, Tuple

CIRCUIT_PROFILES = {
    "monaco":      {"sc_base": 0.34, "overtake_difficulty": 0.95, "tire_stress": 0.55, "pit_loss": 22.5},
    "silverstone": {"sc_base": 0.22, "overtake_difficulty": 0.45, "tire_stress": 0.80, "pit_loss": 21.8},
    "monza":       {"sc_base": 0.28, "overtake_difficulty": 0.35, "tire_stress": 0.90, "pit_loss": 21.2},
    "suzuka":      {"sc_base": 0.18, "overtake_difficulty": 0.60, "tire_stress": 0.70, "pit_loss": 22.0},
    "melbourne":   {"sc_base": 0.41, "overtake_difficulty": 0.55, "tire_stress": 0.65, "pit_loss": 22.3},
    "spa":         {"sc_base": 0.38, "overtake_difficulty": 0.40, "tire_stress": 0.85, "pit_loss": 23.1},
    "interlagos":  {"sc_base": 0.45, "overtake_difficulty": 0.50, "tire_stress": 0.72, "pit_loss": 22.8},
}

TIRE_COMPOUNDS = {
    "soft":   {"base_deg": 0.14, "peak_pace": 0.0,   "max_life": 28, "color": "#E8000D"},
    "medium": {"base_deg": 0.08, "peak_pace": 0.4,   "max_life": 38, "color": "#F5C400"},
    "hard":   {"base_deg": 0.04, "peak_pace": 0.85,  "max_life": 55, "color": "#ECECEC"},
}

@dataclass
class Strategy:
    name: str
    stints: List[Tuple[str, int]]
    total_time: float
    pit_laps: List[int]
    delta: float
    confidence: float
    recommended: bool

def sc_probability(circuit_id: str, lap: int, total_laps: int, rain_pct: float) -> float:
    profile = CIRCUIT_PROFILES.get(circuit_id, CIRCUIT_PROFILES["monaco"])
    base = profile["sc_base"]
    rain_boost = rain_pct / 100 * 0.3
    # Higher SC probability mid-race
    phase = lap / total_laps
    phase_mult = 1.0 + 0.6 * np.sin(np.pi * phase)
    return min(0.95, (base + rain_boost) * phase_mult)

def tire_lap_time(compound: str, lap_on_tire: int, track_temp: float) -> float:
    t = TIRE_COMPOUNDS[compound]
    temp_factor = 1.0 + max(0, (track_temp - 40)) * 0.002
    deg = t["base_deg"] * temp_factor * (1 + lap_on_tire * 0.015)
    cliff = max(0, lap_on_tire - t["max_life"] * 0.8) * 0.25
    return t["peak_pace"] + deg * lap_on_tire + cliff

def evaluate_strategy(
    circuit_id: str,
    stints: List[Tuple[str, int]],
    total_laps: int,
    track_temp: float,
    rain_pct: float
) -> float:
    profile = CIRCUIT_PROFILES.get(circuit_id, CIRCUIT_PROFILES["monaco"])
    total_time = 0.0
    pit_penalty = profile["pit_loss"] * (len(stints) - 1)
    for compound, lap_count in stints:
        for lap in range(lap_count):
            total_time += 90.0 + tire_lap_time(compound, lap, track_temp)
    return total_time + pit_penalty

def get_optimal_strategies(
    circuit_id: str,
    total_laps: int,
    track_temp: float,
    rain_pct: float,
    current_lap: int = 0
) -> List[dict]:
    profile = CIRCUIT_PROFILES.get(circuit_id, CIRCUIT_PROFILES["monaco"])
    candidates = []

    # 1-stop strategies
    for split in range(int(total_laps * 0.3), int(total_laps * 0.6), 3):
        remaining = total_laps - split
        for c1 in ["soft", "medium"]:
            for c2 in ["medium", "hard"]:
                if c1 == c2 and c1 == "medium":
                    continue
                stints = [(c1, split), (c2, remaining)]
                t = evaluate_strategy(circuit_id, stints, total_laps, track_temp, rain_pct)
                candidates.append(("1-stop", stints, [split], t))

    # 2-stop strategies
    for s1 in range(int(total_laps * 0.25), int(total_laps * 0.40), 4):
        for s2 in range(s1 + int(total_laps * 0.2), int(total_laps * 0.70), 4):
            remaining = total_laps - s2
            if remaining < 8:
                continue
            stints = [("soft", s1), ("medium", s2 - s1), ("soft", remaining)]
            t = evaluate_strategy(circuit_id, stints, total_laps, track_temp, rain_pct)
            candidates.append(("2-stop", stints, [s1, s2], t))

    candidates.sort(key=lambda x: x[3])
    best_time = candidates[0][3]

    results = []
    seen_names = {}
    for name, stints, pit_laps, total_time in candidates[:12]:
        key = f"{name}-{pit_laps[0]}"
        if key in seen_names:
            continue
        seen_names[key] = True
        delta = total_time - best_time
        conf = max(55, 95 - delta * 2 - (0 if delta == 0 else 5))
        compound_str = " → ".join([f"{c.capitalize()} ({l}L)" for c, l in stints])
        sc_risk = sc_probability(circuit_id, pit_laps[0], total_laps, rain_pct)
        results.append({
            "name": f"{name} (lap {pit_laps[0]})" if len(pit_laps) == 1 else f"{name} (laps {', '.join(map(str, pit_laps))})",
            "stints": [{"compound": c, "laps": l} for c, l in stints],
            "pit_laps": pit_laps,
            "pit_window": [pit_laps[0] - 2, pit_laps[0] + 3],
            "delta": round(delta, 1),
            "confidence": round(conf),
            "compound_str": compound_str,
            "sc_risk_at_pit": round(sc_risk * 100),
            "recommended": delta == 0,
        })
        if len(results) >= 5:
            break

    return results

def get_sc_curve(circuit_id: str, total_laps: int, rain_pct: float) -> List[dict]:
    return [
        {"lap": lap, "probability": round(sc_probability(circuit_id, lap, total_laps, rain_pct) * 100, 1)}
        for lap in range(0, total_laps + 1, 2)
    ]
