import numpy as np
from typing import List, Dict, Optional

CONSTRUCTORS = [
    {"id": "red_bull",     "name": "Red Bull Racing", "color": "#3671C6", "pts": 618, "wins": 18, "strength": 0.92},
    {"id": "ferrari",      "name": "Ferrari",          "color": "#E8002D", "pts": 502, "wins": 8,  "strength": 0.78},
    {"id": "mercedes",     "name": "Mercedes",         "color": "#27F4D2", "pts": 448, "wins": 4,  "strength": 0.72},
    {"id": "mclaren",      "name": "McLaren",          "color": "#FF8000", "pts": 371, "wins": 3,  "strength": 0.65},
    {"id": "aston_martin", "name": "Aston Martin",     "color": "#358C75", "pts": 206, "wins": 0,  "strength": 0.50},
    {"id": "alpine",       "name": "Alpine",           "color": "#0093CC", "pts": 120, "wins": 0,  "strength": 0.42},
    {"id": "williams",     "name": "Williams",         "color": "#37BEDD", "pts": 28,  "wins": 0,  "strength": 0.30},
    {"id": "haas",         "name": "Haas",             "color": "#B6BABD", "pts": 12,  "wins": 0,  "strength": 0.25},
]

REMAINING_RACES = [
    "Singapore", "Japan", "Qatar", "Mexico", "USA", "Brazil", "Las Vegas", "Abu Dhabi"
]

POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]

def simulate_race(constructors: List[dict], scenarios: Dict[str, str] = None) -> Dict[str, int]:
    scenarios = scenarios or {}
    points_earned = {c["id"]: 0 for c in constructors}
    strengths = {c["id"]: c["strength"] for c in constructors}

    for cid, scenario in scenarios.items():
        if scenario == "dnf":
            strengths[cid] = 0.0
        elif scenario == "boost":
            strengths[cid] = min(1.0, strengths.get(cid, 0.5) * 1.25)
        elif scenario == "penalty":
            strengths[cid] = max(0, strengths.get(cid, 0.5) * 0.6)

    # Each constructor fields 2 cars
    car_strengths = []
    car_teams = []
    for c in constructors:
        s = strengths[c["id"]]
        noise1 = max(0, s + np.random.normal(0, 0.08))
        noise2 = max(0, s + np.random.normal(0, 0.10))
        car_strengths.extend([noise1, noise2])
        car_teams.extend([c["id"], c["id"]])

    # Sort by strength descending = finishing order
    order = sorted(range(len(car_strengths)), key=lambda i: car_strengths[i], reverse=True)
    pos = 0
    for car_idx in order:
        if pos < len(POINTS_TABLE):
            points_earned[car_teams[car_idx]] += POINTS_TABLE[pos]
        pos += 1

    return points_earned

def forecast_season(scenarios: Dict[str, str] = None, n_simulations: int = 500) -> List[dict]:
    scenarios = scenarios or {}
    constructors = [dict(c) for c in CONSTRUCTORS]
    remaining = len(REMAINING_RACES)

    # Run Monte Carlo
    all_outcomes = {c["id"]: [] for c in constructors}

    for _ in range(n_simulations):
        sim_pts = {c["id"]: c["pts"] for c in constructors}
        for race_idx in range(remaining):
            race_scenarios = scenarios if race_idx < 3 else {}
            earned = simulate_race(constructors, race_scenarios)
            for cid in sim_pts:
                sim_pts[cid] += earned[cid]
        for cid in all_outcomes:
            all_outcomes[cid].append(sim_pts[cid])

    results = []
    for c in constructors:
        sims = all_outcomes[c["id"]]
        mean_pts = np.mean(sims)
        p10 = np.percentile(sims, 10)
        p90 = np.percentile(sims, 90)
        wins = sum(1 for i in range(n_simulations)
                   if all_outcomes[c["id"]][i] == max(all_outcomes[cid][i] for cid in all_outcomes))
        results.append({
            "id": c["id"],
            "name": c["name"],
            "color": c["color"],
            "current_pts": c["pts"],
            "projected_pts": round(mean_pts),
            "p10": round(p10),
            "p90": round(p90),
            "title_probability": round(wins / n_simulations * 100, 1),
        })

    results.sort(key=lambda x: x["current_pts"], reverse=True)
    for i, r in enumerate(results):
        r["position"] = i + 1
    return results

def get_trajectory(scenarios: Dict[str, str] = None) -> List[dict]:
    scenarios = scenarios or {}
    constructors = [dict(c) for c in CONSTRUCTORS]
    top4 = [c for c in constructors if c["strength"] >= 0.65]
    trajectory = []

    pts = {c["id"]: c["pts"] for c in top4}
    trajectory.append({"race": "Now", **{c["id"]: pts[c["id"]] for c in top4}})

    for i, race in enumerate(REMAINING_RACES):
        race_scenarios = scenarios if i < 3 else {}
        earned = simulate_race(top4, race_scenarios)
        for cid in pts:
            pts[cid] += earned[cid]
        trajectory.append({"race": race, **{c["id"]: round(pts[c["id"]]) for c in top4}})

    return trajectory

def get_constructors():
    return CONSTRUCTORS
