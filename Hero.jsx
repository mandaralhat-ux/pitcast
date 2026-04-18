const s = {
  wrap: {
    padding: '52px 32px 40px',
    borderBottom: '1px solid var(--border)',
    position: 'relative', overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0, opacity: 0.035,
    backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  redLine: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3, background: 'var(--red)',
  },
  inner: { maxWidth: 820, position: 'relative' },
  eyebrow: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  eyebrowLine: { width: 28, height: 2, background: 'var(--red)' },
  eyebrowText: {
    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 11,
    letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--red)',
  },
  h1: {
    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 46,
    letterSpacing: '-0.01em', lineHeight: 1.05,
    color: 'var(--text)', marginBottom: 14,
  },
  h1Red: { color: 'var(--red)' },
  sub: {
    fontSize: 15, color: 'var(--text2)', lineHeight: 1.65,
    maxWidth: 540, marginBottom: 24,
  },
  badges: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  badge: {
    padding: '5px 12px', borderRadius: 20,
    border: '1px solid var(--border2)',
    fontSize: 11, fontFamily: 'var(--font-mono)',
    color: 'var(--text3)',
  },
}

export default function Hero() {
  return (
    <div style={s.wrap}>
      <div style={s.grid} />
      <div style={s.redLine} />
      <div style={s.inner}>
        <div style={s.eyebrow}>
          <div style={s.eyebrowLine} />
          <span style={s.eyebrowText}>F1 Strategy Intelligence</span>
        </div>
        <h1 style={s.h1}>
          Race smarter.<br />
          <span style={s.h1Red}>Win on strategy.</span>
        </h1>
        <p style={s.sub}>
          ML-powered pit stop optimization, real-time championship forecasting,
          and lap-by-lap race simulation — all in one platform.
        </p>
        <div style={s.badges}>
          {['OpenF1 · Live', 'XGBoost optimizer', 'Prophet forecasting', 'Monte Carlo sim'].map(b => (
            <span key={b} style={s.badge}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
