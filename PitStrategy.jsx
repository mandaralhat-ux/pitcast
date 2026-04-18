import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { fetchStrategy } from '../api'

const TIRE_COLORS = { soft: '#E8000D', medium: '#F5C400', hard: '#ECECEC' }
const TIRE_LABELS = { soft: 'S', medium: 'M', hard: 'H' }

function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '14px 16px',
      borderLeft: accent ? `3px solid ${accent}` : '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-head)', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'var(--font-head)',
        color: accent || 'var(--text)', letterSpacing: '0.02em' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>{sub}</div>}
    </div>
  )
}

function TireDot({ compound, size = 10 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: TIRE_COLORS[compound] || '#888',
      border: compound === 'hard' ? '1px solid #666' : 'none',
      marginRight: 4, flexShrink: 0,
      verticalAlign: 'middle',
    }} />
  )
}

function StrategyRow({ s, index }) {
  const isRec = s.recommended
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 2fr 70px 70px 60px',
      alignItems: 'center', gap: 12, padding: '11px 14px',
      background: isRec ? 'rgba(232,0,13,0.07)' : 'transparent',
      border: isRec ? '1px solid rgba(232,0,13,0.2)' : '1px solid transparent',
      borderRadius: 8, marginBottom: 5, transition: 'all 0.15s',
    }}>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: isRec ? 600 : 400 }}>
          {s.name}
        </div>
        {isRec && (
          <span style={{
            fontSize: 9, fontFamily: 'var(--font-head)', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'var(--red)', color: '#fff',
            padding: '2px 6px', borderRadius: 4, marginTop: 3, display: 'inline-block',
          }}>Recommended</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {s.stints.map((st, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12 }}>
            {i > 0 && <span style={{ color: 'var(--text3)', margin: '0 2px' }}>→</span>}
            <TireDot compound={st.compound} />
            <span style={{ color: TIRE_COLORS[st.compound], fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
              {TIRE_LABELS[st.compound]}
            </span>
            <span style={{ color: 'var(--text3)', fontSize: 11 }}>{st.laps}L</span>
          </span>
        ))}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 13,
        color: s.delta === 0 ? 'var(--teal)' : s.delta < 3 ? 'var(--text2)' : 'var(--text3)',
        textAlign: 'right',
      }}>
        {s.delta === 0 ? 'BEST' : `+${s.delta}s`}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)',
          color: s.confidence >= 85 ? 'var(--teal)' : s.confidence >= 70 ? 'var(--amber)' : 'var(--text2)' }}>
          {s.confidence}%
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)' }}>conf.</div>
      </div>
      <div style={{
        fontSize: 11, fontFamily: 'var(--font-mono)', textAlign: 'right',
        color: s.sc_risk_at_pit > 35 ? 'var(--red)' : 'var(--text3)',
      }}>
        {s.sc_risk_at_pit}% SC
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border2)',
      borderRadius: 7, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 12,
    }}>
      <div style={{ color: 'var(--text3)', marginBottom: 4 }}>Lap {label}</div>
      <div style={{ color: 'var(--red)' }}>{payload[0]?.value?.toFixed(1)}% SC risk</div>
    </div>
  )
}

export default function PitStrategy({ circuit, circuits, conditions }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const circuitInfo = circuits.find(c => c.id === circuit) || {}

  useEffect(() => {
    setLoading(true)
    fetchStrategy({
      circuit,
      laps: circuitInfo.laps || 78,
      trackTemp: conditions.trackTemp,
      rainPct: conditions.rainPct,
      currentLap: conditions.currentLap,
    }).then(d => {
      setData(d)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [circuit, conditions])

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 8 }}>Computing strategies</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
          Running ML model...
        </div>
      </div>
    </div>
  )

  if (!data) return null

  const { summary, strategies, sc_curve } = data
  const optWindow = summary.optimal_window

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10 }}>
        <MetricCard
          label="Optimal pit window"
          value={`L${optWindow[0]}–${optWindow[1]}`}
          sub="Undercut window"
          accent="var(--red)"
        />
        <MetricCard
          label="SC peak risk"
          value={`${Math.round(summary.sc_peak_risk)}%`}
          sub="Safety car probability"
          accent={summary.sc_peak_risk > 35 ? 'var(--red)' : undefined}
        />
        <MetricCard
          label="ML confidence"
          value={`${summary.ml_confidence}%`}
          sub="Top strategy"
          accent="var(--teal)"
        />
        <MetricCard
          label="Total laps"
          value={circuitInfo.laps || '—'}
          sub={`${circuitInfo.length_km || '—'}km per lap`}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        {/* Strategy table */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 11,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              ML Strategy Recommendations
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text3)' }}>
              {['soft', 'medium', 'hard'].map(c => (
                <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TireDot compound={c} size={8} />
                  <span style={{ textTransform: 'capitalize' }}>{c}</span>
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 70px 70px 60px',
            gap: 12, padding: '0 14px 8px', fontSize: 10,
            fontFamily: 'var(--font-head)', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--text3)' }}>
            <span>Strategy</span><span>Compounds</span>
            <span style={{textAlign:'right'}}>Delta</span>
            <span style={{textAlign:'right'}}>Conf.</span>
            <span style={{textAlign:'right'}}>SC Risk</span>
          </div>
          {strategies.map((s, i) => <StrategyRow key={i} s={s} index={i} />)}
        </div>

        {/* SC Curve */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 14 }}>
            Safety Car Risk Curve
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={sc_curve} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="lap" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
                axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              {optWindow && (
                <>
                  <ReferenceLine x={optWindow[0]} stroke="rgba(232,0,13,0.3)" strokeDasharray="3 3" />
                  <ReferenceLine x={optWindow[1]} stroke="rgba(232,0,13,0.3)" strokeDasharray="3 3" label={{
                    value: 'Pit window', fill: 'var(--red)', fontSize: 10, fontFamily: 'var(--font-mono)',
                  }} />
                </>
              )}
              <Line type="monotone" dataKey="probability" stroke="var(--red)" strokeWidth={2}
                dot={false} activeDot={{ r: 4, fill: 'var(--red)' }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between',
            fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)' }}>
            <span>Lap 0</span>
            <span style={{ color: 'var(--red)' }}>Peak: {Math.round(summary.sc_peak_risk)}%</span>
            <span>Lap {circuitInfo.laps}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
