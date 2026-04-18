import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CircuitSelector from './components/CircuitSelector'
import PitStrategy from './components/PitStrategy'
import Championship from './components/Championship'
import RaceSim from './components/RaceSim'
import { fetchCircuits } from './api'

const DEFAULT_CONDITIONS = { trackTemp: 42, rainPct: 12, currentLap: 0 }

export default function App() {
  const [tab, setTab] = useState('strategy')
  const [circuits, setCircuits] = useState([])
  const [selectedCircuit, setSelectedCircuit] = useState('monaco')
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS)

  useEffect(() => {
    fetchCircuits().then(d => setCircuits(d.circuits || []))
  }, [])

  const showSidebar = tab !== 'championship'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={tab} onTabChange={setTab} />
      <Hero />

      <div style={{
        flex: 1, display: 'flex', gap: 0,
        padding: 20, alignItems: 'flex-start',
        maxWidth: '100%', overflow: 'hidden',
      }}>
        {showSidebar && (
          <div style={{ marginRight: 16 }}>
            <CircuitSelector
              circuits={circuits}
              selected={selectedCircuit}
              onSelect={setSelectedCircuit}
              conditions={conditions}
              onConditions={setConditions}
            />
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          {tab === 'strategy' && (
            <PitStrategy
              circuit={selectedCircuit}
              circuits={circuits}
              conditions={conditions}
            />
          )}
          {tab === 'championship' && <Championship />}
          {tab === 'simulation' && (
            <RaceSim
              circuit={selectedCircuit}
              circuits={circuits}
              conditions={conditions}
            />
          )}
        </div>
      </div>

      <footer style={{
        borderTop: '1px solid var(--border)', padding: '14px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text3)',
      }}>
        <span>PITCAST · F1 Strategy Platform</span>
        <span>Data: Ergast API · OpenF1 · © 2025</span>
      </footer>
    </div>
  )
}
