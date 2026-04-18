import { useState } from 'react'

const s = {
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    background: 'rgba(10,10,11,0.92)', backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 0,
    padding: '0 24px', height: 52,
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10, marginRight: 32,
    textDecoration: 'none',
  },
  logoIcon: {
    width: 28, height: 28, background: 'var(--red)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    clipPath: 'polygon(0 0, 85% 0, 100% 100%, 15% 100%)',
  },
  logoText: {
    fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 20,
    letterSpacing: '0.04em', color: 'var(--text)',
  },
  tabs: { display: 'flex', gap: 2, flex: 1 },
  tab: {
    padding: '0 16px', height: 52, border: 'none', background: 'none',
    fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13,
    letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
    color: 'var(--text3)', transition: 'color 0.15s', borderBottom: '2px solid transparent',
    display: 'flex', alignItems: 'center',
  },
  tabActive: { color: 'var(--text)', borderBottom: '2px solid var(--red)' },
  pill: {
    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6,
    padding: '4px 12px', border: '1px solid rgba(0,212,170,0.25)',
    borderRadius: 20, fontSize: 11, color: 'var(--teal)',
    fontFamily: 'var(--font-mono)',
  },
  dot: {
    width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)',
    animation: 'pulse-red 2s ease infinite',
  },
}

export default function Navbar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'strategy', label: 'Pit Strategy' },
    { id: 'championship', label: 'Championship' },
    { id: 'simulation', label: 'Race Sim' },
  ]
  return (
    <nav style={s.nav}>
      <a style={s.logo} href="#">
        <div style={s.logoIcon}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
            <polygon points="2,12 7,2 12,12" fill="white"/>
          </svg>
        </div>
        <span style={s.logoText}>PITCAST</span>
      </a>
      <div style={s.tabs}>
        {tabs.map(t => (
          <button
            key={t.id}
            style={{ ...s.tab, ...(activeTab === t.id ? s.tabActive : {}) }}
            onClick={() => onTabChange(t.id)}
          >{t.label}</button>
        ))}
      </div>
      <div style={s.pill}>
        <span style={s.dot} />
        OpenF1 · Live
      </div>
    </nav>
  )
}
