import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { runSimulation } from '../api'

const TIRE_COLORS = { soft: '#E8000D', medium: '#F5C400', hard: '#ECECEC' }
const COMPOUNDS = ['soft', 'medium', 'hard']

function TireSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 5 }}>
      {COMPOUNDS.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          padding: '5px 12px', borderRadius: 6, border: '1px solid',
          borderColor: value === c ? TIRE_COLORS[c] : 'var(--border)',
          background: value === c ? `${TIRE_COLORS[c]}22` : 'transparent',
          color: value === c ? TIRE_COLORS[c] : 'var(--text3)',
          fontSize: 12, fontFamily: 'var(--font-mono)', cursor: 'pointer',
          textTransform: 'capitalize', transition: 'all 0.15s',
        }}>{c}</button>
      ))}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)',
      borderRadius: 7, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      <div style={{ color: 'var(--text3)', marginBottom: 5 }}>Lap {label}</div>
      <div style={{ color: TIRE_COLORS[d?.tire] || 'var(--text)' }}>Tire: {d?.tire}</div>
      <div style={{ color: 'var(--text)' }}>P{d?.position}</div>
      <div style={{ color: 'var(--text2)' }}>{payload[0]?.value?.toFixed(3)}s</div>
      {d?.sc && <div style={{ color: 'var(--amber)' }}>Safety car</div>}
      {d?.pit && <div style={{ color: 'var(--teal)' }}>Pit stop</div>}
    </div>
  )
}

export default function RaceSim({ circuit, circuits, conditions }) {
  const circuitInfo = circuits.find(c => c.id === circuit) || {}
  const totalLaps = circuitInfo.laps || 78

  const [stints, setStints] = useState([
    { compound: 'soft', laps: Math.round(totalLaps * 0.38) },
    { compound: 'hard', laps: Math.round(totalLaps * 0.62) },
  ])
  const [startPos, setStartPos] = useState(5)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)

  const totalStintLaps = stints.reduce((s, st) => s + st.laps, 0)
  const valid = Math.abs(totalStintLaps - totalLaps) <= 2

  const updateStint = (idx, field, val) => {
    setStints(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s))
  }

  const addStint = () => {
    if (stints.length >= 3) return
    const perStint = Math.round(totalLaps / (stints.length + 1))
    setStints(prev => [
      ...prev.map(s => ({ ...s, laps: perStint })),
      { compound: 'medium', laps: totalLaps - perStint * prev.length },
    ])
  }

  const removeStint = (idx) => {
    if (stints.length <= 2) return
    setStints(prev => {
      const next = prev.filter((_, i) => i !== idx)
      const totalAssigned = next.reduce((s, st) => s + st.laps, 0)
      next[next.length - 1].laps += (totalLaps - totalAssigned)
      return next
    })
  }

  const runSim = async () => {
    setRunning(true)
    setResult(null)
    try {
      const res = await runSimulation({
        circuit,
        totalLaps,
        strategy: stints,
        trackTemp: conditions.trackTemp,
        rainPct: conditions.rainPct,
        startingPosition: startPos,
      })
      setResult(res)
    } catch (e) {
      console.error(e)
    }
    setRunning(false)
  }

  const posData = result?.laps?.map(l => ({
    ...l,
    invPos: 21 - l.position,
  }))

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 14 }}>
        {/* Config panel */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16,
          display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
            Simulation Setup
          </div>

          <div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6,
              fontFamily: 'var(--font-head)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Starting position: P{startPos}
            </div>
            <input type="range" min="1" max="20" step="1" value={startPos}
              style={{ width: '100%', accentColor: 'var(--red)' }}
              onChange={e => setStartPos(+e.target.value)} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-head)',
                fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Strategy ({stints.length} stop{stints.length > 1 ? 's' : ''})
              </div>
              {stints.length < 3 && (
                <button onClick={addStint} style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 5, border: '1px solid var(--border2)',
                  background: 'transparent', color: 'var(--text3)', cursor: 'pointer',
                }}>+ Add stint</button>
              )}
            </div>
            {stints.map((st, i) => (
              <div key={i} style={{ marginBottom: 10, padding: 10, background: 'var(--bg3)',
                borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                    Stint {i + 1}
                  </span>
                  {stints.length > 2 && (
                    <button onClick={() => removeStint(i)} style={{
                      fontSize: 10, color: 'var(--red)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: '2px 4px',
                    }}>×</button>
                  )}
                </div>
                <TireSelector value={st.compound} onChange={v => updateStint(i, 'compound', v)} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', width: 50 }}>Laps:</span>
                  <input type="range" min="5" max={totalLaps - 5} step="1" value={st.laps}
                    style={{ flex: 1, accentColor: TIRE_COLORS[st.compound] }}
                    onChange={e => updateStint(i, 'laps', +e.target.value)} />
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text)', width: 28 }}>
                    {st.laps}
                  </span>
                </div>
              </div>
            ))}
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)',
              color: valid ? 'var(--teal)' : 'var(--red)' }}>
              Total: {totalStintLaps} / {totalLaps} laps {valid ? '✓' : `(${totalStintLaps > totalLaps ? 'over' : 'under'} by ${Math.abs(totalStintLaps - totalLaps)})`}
            </div>
          </div>

          <button onClick={runSim} disabled={running || !valid} style={{
            padding: '12px 0', background: valid ? 'var(--red)' : 'var(--bg4)',
            border: 'none', borderRadius: 8, cursor: valid ? 'pointer' : 'not-allowed',
            color: '#fff', fontFamily: 'var(--font-head)', fontWeight: 700,
            fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'all 0.15s', opacity: running ? 0.7 : 1,
          }}>
            {running ? 'Simulating...' : 'Run Race Simulation'}
          </button>
        </div>

        {/* Results */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          {!result && !running && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', gap: 10 }}>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="var(--border2)" strokeWidth="1.5"/>
                <polygon points="16,13 28,20 16,27" fill="var(--border2)"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 12, letterSpacing: '0.08em',
                textTransform: 'uppercase' }}>Configure strategy and run simulation</span>
            </div>
          )}
          {running && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', gap: 10 }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, letterSpacing: '0.1em',
                textTransform: 'uppercase' }}>Running {totalLaps}-lap simulation</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>Monte Carlo · lap-by-lap</div>
            </div>
          )}
          {result && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Final position', val: `P${result.final_position}`, accent: result.final_position <= 3 ? 'var(--amber)' : 'var(--text)' },
                  { label: 'Race time', val: result.total_time_fmt, accent: 'var(--text)' },
                  { label: 'Pit stops', val: result.pit_laps.length, accent: 'var(--teal)' },
                  { label: 'Safety cars', val: result.sc_laps.length, accent: result.sc_laps.length > 0 ? 'var(--amber)' : 'var(--text3)' },
                ].map((m, i) => (
                  <div key={i} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-head)',
                      fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'var(--font-head)',
                      color: m.accent }}>{m.val}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 10,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
                Lap time trace
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={result.laps} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="lap" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                    axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {result.pit_laps.map(l => (
                    <ReferenceLine key={l} x={l} stroke="rgba(0,212,170,0.3)" strokeDasharray="3 3" />
                  ))}
                  {result.sc_laps.map(l => (
                    <ReferenceLine key={l} x={l} stroke="rgba(245,166,35,0.3)" strokeDasharray="3 3" />
                  ))}
                  <Line type="monotone" dataKey="lap_time" stroke="var(--red)" strokeWidth={1.5}
                    dot={false} activeDot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10,
                fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
                <span><span style={{ color: 'var(--teal)' }}>——</span> Pit stop</span>
                <span><span style={{ color: 'var(--amber)' }}>——</span> Safety car</span>
                {result.pit_laps.length > 0 && <span>Pits: Laps {result.pit_laps.join(', ')}</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lap-by-lap table */}
      {result && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
            Lap-by-lap breakdown (first 25 laps)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12,
              fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ color: 'var(--text3)', fontSize: 10, fontFamily: 'var(--font-head)',
                  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {['Lap', 'Time', 'Tire', 'Age', 'Position', 'Event'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0 12px 8px 0',
                      borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.laps.slice(0, 25).map(l => (
                  <tr key={l.lap} style={{
                    background: l.pit ? 'rgba(0,212,170,0.05)' : l.sc ? 'rgba(245,166,35,0.05)' : 'transparent',
                  }}>
                    <td style={{ padding: '6px 12px 6px 0', color: 'var(--text2)' }}>{l.lap}</td>
                    <td style={{ padding: '6px 12px 6px 0', color: 'var(--text)' }}>{l.lap_time.toFixed(3)}</td>
                    <td style={{ padding: '6px 12px 6px 0', color: TIRE_COLORS[l.tire] }}>{l.tire}</td>
                    <td style={{ padding: '6px 12px 6px 0', color: 'var(--text3)' }}>{l.tire_age}</td>
                    <td style={{ padding: '6px 12px 6px 0', color: l.position <= 3 ? 'var(--amber)' : 'var(--text)' }}>
                      P{l.position}
                    </td>
                    <td style={{ padding: '6px 12px 6px 0' }}>
                      {l.pit && <span style={{ color: 'var(--teal)' }}>PIT STOP</span>}
                      {l.sc && !l.pit && <span style={{ color: 'var(--amber)' }}>SC</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
