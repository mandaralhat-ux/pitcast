import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fetchForecast } from '../api'

const SCENARIOS = [
  { id: 'red_bull:dnf',     label: 'Red Bull DNF',     team: 'red_bull' },
  { id: 'ferrari:dnf',      label: 'Ferrari DNF',       team: 'ferrari' },
  { id: 'mercedes:boost',   label: 'Mercedes resurgence', team: 'mercedes' },
  { id: 'mclaren:boost',    label: 'McLaren upgrade',   team: 'mclaren' },
  { id: 'ferrari:penalty',  label: 'Ferrari penalty',   team: 'ferrari' },
]

function ConstructorRow({ c, maxPts }) {
  const barWidth = Math.round((c.current_pts / maxPts) * 100)
  const delta = c.projected_pts - c.current_pts
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
      borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)',
        width: 18, textAlign: 'right' }}>{c.position}</span>
      <span style={{ width: 3, height: 28, borderRadius: 2, background: c.color, flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: 'var(--text)', flex: '0 0 130px' }}>{c.name}</span>
      <div style={{ flex: 1, height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${barWidth}%`, height: '100%', background: c.color,
          borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 500,
        color: 'var(--text)', width: 46, textAlign: 'right' }}>{c.current_pts}</span>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', width: 54, textAlign: 'right',
        color: delta > 0 ? 'var(--teal)' : delta < 0 ? 'var(--red)' : 'var(--text3)' }}>
        {delta > 0 ? '+' : ''}{delta}
      </span>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', width: 42, textAlign: 'right',
        color: c.title_probability > 50 ? 'var(--amber)' : 'var(--text3)' }}>
        {c.title_probability}%
      </span>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)',
      borderRadius: 7, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      <div style={{ color: 'var(--text3)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {p.value} pts
        </div>
      ))}
    </div>
  )
}

export default function Championship() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeScenarios, setActiveScenarios] = useState([])

  useEffect(() => {
    setLoading(true)
    const scenarioStr = activeScenarios.join(',')
    fetchForecast(scenarioStr).then(d => {
      setData(d)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [activeScenarios])

  const toggleScenario = (id) => {
    setActiveScenarios(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Running Monte Carlo forecast...
      </div>
    </div>
  )

  if (!data) return null

  const { standings, trajectory } = data
  const maxPts = standings[0]?.current_pts || 1
  const top4 = standings.slice(0, 4)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Standings */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 11,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              Constructor Standings
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 10, fontFamily: 'var(--font-head)',
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              <span style={{ width: 46, textAlign: 'right' }}>PTS</span>
              <span style={{ width: 54, textAlign: 'right' }}>Proj.</span>
              <span style={{ width: 42, textAlign: 'right' }}>Title%</span>
            </div>
          </div>
          {standings.map(c => (
            <ConstructorRow key={c.id} c={c} maxPts={maxPts} />
          ))}
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            Proj. = projected end-of-season · Title% = championship win probability (n=500 simulations)
          </div>
        </div>

        {/* What-if */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16,
          display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
            What-if scenarios
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            Apply scenarios to see projected impact on the remaining {8} races.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SCENARIOS.map(sc => {
              const active = activeScenarios.includes(sc.id)
              return (
                <button key={sc.id} onClick={() => toggleScenario(sc.id)} style={{
                  padding: '6px 12px', borderRadius: 20, border: '1px solid',
                  borderColor: active ? 'rgba(232,0,13,0.5)' : 'var(--border2)',
                  background: active ? 'var(--red-dim)' : 'transparent',
                  color: active ? 'var(--red)' : 'var(--text2)',
                  fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: 'var(--font-body)',
                }}>
                  {sc.label}
                </button>
              )
            })}
          </div>
          {activeScenarios.length > 0 && (
            <div style={{ padding: 12, background: 'var(--red-dim)',
              border: '1px solid rgba(232,0,13,0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-head)', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 6 }}>
                Scenario active
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                {activeScenarios.map(id => SCENARIOS.find(s => s.id === id)?.label).join(' + ')} applied to next 3 races.
                Projections updated above.
              </div>
            </div>
          )}
          {/* Title probability summary */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>
              Title probability
            </div>
            {top4.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)', flex: '0 0 120px' }}>{c.name}</span>
                <div style={{ flex: 1, height: 4, background: 'var(--bg4)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${c.title_probability}%`, height: '100%',
                    background: c.color, borderRadius: 2, transition: 'width 0.5s' }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', width: 36,
                  textAlign: 'right', color: c.title_probability > 40 ? 'var(--amber)' : 'var(--text3)' }}>
                  {c.title_probability}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trajectory chart */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 11,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 }}>
          Points Trajectory — Remaining Season
          {activeScenarios.length > 0 && (
            <span style={{ color: 'var(--red)', marginLeft: 8 }}>· Scenario applied</span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trajectory} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
            <XAxis dataKey="race" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {top4.map(c => (
              <Line key={c.id} type="monotone" dataKey={c.id} stroke={c.color}
                strokeWidth={2} dot={false} name={c.name}
                activeDot={{ r: 4, fill: c.color }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
