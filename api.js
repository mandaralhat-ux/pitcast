const BASE = '/api'

export async function fetchCircuits() {
  const r = await fetch(`${BASE}/circuits`)
  return r.json()
}

export async function fetchStrategy({ circuit, laps, trackTemp, rainPct, currentLap = 0 }) {
  const params = new URLSearchParams({
    circuit, laps, track_temp: trackTemp, rain_pct: rainPct, current_lap: currentLap
  })
  const r = await fetch(`${BASE}/strategy/recommend?${params}`)
  return r.json()
}

export async function fetchForecast(scenario = '') {
  const params = scenario ? `?scenario=${encodeURIComponent(scenario)}` : ''
  const r = await fetch(`${BASE}/forecast/standings${params}`)
  return r.json()
}

export async function fetchConstructors() {
  const r = await fetch(`${BASE}/forecast/constructors`)
  return r.json()
}

export async function runSimulation({ circuit, totalLaps, strategy, trackTemp, rainPct, startingPosition }) {
  const r = await fetch(`${BASE}/simulation/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      circuit,
      total_laps: totalLaps,
      strategy,
      track_temp: trackTemp,
      rain_pct: rainPct,
      starting_position: startingPosition,
    })
  })
  return r.json()
}
