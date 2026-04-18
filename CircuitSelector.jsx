const FLAGS = {
  monaco: '🇲🇨', silverstone: '🇬🇧', monza: '🇮🇹',
  suzuka: '🇯🇵', melbourne: '🇦🇺', spa: '🇧🇪', interlagos: '🇧🇷',
}

const s = {
  sidebar: {
    width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16,
  },
  card: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '14px 12px',
  },
  label: {
    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 11,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'var(--text3)', marginBottom: 10,
  },
  item: {
    display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
    borderRadius: 7, cursor: 'pointer', transition: 'all 0.12s',
    border: '1px solid transparent', fontSize: 13,
  },
  itemActive: {
    background: 'var(--red-dim)', border: '1px solid rgba(232,0,13,0.25)',
    color: 'var(--text)',
  },
  itemDefault: { color: 'var(--text2)' },
  flag: { fontSize: 16, lineHeight: 1 },
  sliderWrap: { marginBottom: 12 },
  sliderLabel: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6, fontSize: 12, color: 'var(--text2)',
  },
  sliderVal: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' },
  slider: { width: '100%', accentColor: 'var(--red)', cursor: 'pointer' },
}

export default function CircuitSelector({ circuits, selected, onSelect, conditions, onConditions }) {
  return (
    <div style={s.sidebar}>
      <div style={s.card}>
        <div style={s.label}>Circuit</div>
        {circuits.map(c => (
          <div
            key={c.id}
            style={{ ...s.item, ...(selected === c.id ? s.itemActive : s.itemDefault) }}
            onClick={() => onSelect(c.id)}
          >
            <span style={s.flag}>{FLAGS[c.id] || '🏁'}</span>
            <span>{c.name}</span>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.label}>Conditions</div>
        <div style={s.sliderWrap}>
          <div style={s.sliderLabel}>
            <span>Track temp</span>
            <span style={s.sliderVal}>{conditions.trackTemp}°C</span>
          </div>
          <input
            type="range" min="20" max="65" step="1"
            value={conditions.trackTemp} style={s.slider}
            onChange={e => onConditions({ ...conditions, trackTemp: +e.target.value })}
          />
        </div>
        <div style={s.sliderWrap}>
          <div style={s.sliderLabel}>
            <span>Rain probability</span>
            <span style={s.sliderVal}>{conditions.rainPct}%</span>
          </div>
          <input
            type="range" min="0" max="100" step="1"
            value={conditions.rainPct} style={s.slider}
            onChange={e => onConditions({ ...conditions, rainPct: +e.target.value })}
          />
        </div>
        <div style={s.sliderWrap}>
          <div style={s.sliderLabel}>
            <span>Current lap</span>
            <span style={s.sliderVal}>{conditions.currentLap}</span>
          </div>
          <input
            type="range" min="0" max="70" step="1"
            value={conditions.currentLap} style={s.slider}
            onChange={e => onConditions({ ...conditions, currentLap: +e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
