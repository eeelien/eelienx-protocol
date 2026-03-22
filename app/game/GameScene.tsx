'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Float } from '@react-three/drei'
import * as THREE from 'three'

// ── Types ──────────────────────────────────────────────────────────────────────
type AgentState = 'idle' | 'trading' | 'risk' | 'config'

interface LogEntry { id: number; msg: string; color: string; ts: string }

// ── Agent mesh (cube that changes color by state) ──────────────────────────────
function Agent({ state, position }: { state: AgentState; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)

  const color = {
    idle:    '#5e72e4',
    trading: '#00ff88',
    risk:    '#ff4444',
    config:  '#aa88ff',
  }[state]

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.002) * 0.08
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(Date.now() * 0.004) * 0.15
      glowRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group position={position}>
      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>

      {/* Main body */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} emissive={color} emissiveIntensity={0.3} />
      </mesh>

      {/* Agent label */}
      <Text position={[0, 0.65, 0]} fontSize={0.14} color={color} anchorX="center" anchorY="bottom">
        eelienX Agent
      </Text>

      {/* State badge */}
      <Text position={[0, 0.85, 0]} fontSize={0.1} color={color} anchorX="center" anchorY="bottom">
        [{state.toUpperCase()}]
      </Text>
    </group>
  )
}

// ── Station ───────────────────────────────────────────────────────────────────
function Station({
  position, label, icon, color, onClick, hovered, onHover
}: {
  position: [number, number, number]
  label: string; icon: string; color: string
  onClick: () => void; hovered: boolean; onHover: (v: boolean) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const ringRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * (hovered ? 1.5 : 0.4)
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.8
  })

  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.06, 32]} />
        <meshStandardMaterial color={hovered ? color : '#1a1a2e'} metalness={0.6} roughness={0.4}
          emissive={color} emissiveIntensity={hovered ? 0.4 : 0.1} />
      </mesh>

      {/* Orbit ring */}
      <mesh ref={ringRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.02, 8, 48]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.9 : 0.3} />
      </mesh>

      {/* Central icon cube */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={meshRef} castShadow
          onClick={onClick}
          onPointerEnter={() => onHover(true)}
          onPointerLeave={() => onHover(false)}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={color} metalness={0.5} roughness={0.2}
            emissive={color} emissiveIntensity={hovered ? 0.6 : 0.2} />
        </mesh>
      </Float>

      {/* Label */}
      <Text position={[0, 0.75, 0]} fontSize={0.16} color={hovered ? color : '#cccccc'} anchorX="center">
        {label}
      </Text>
      <Text position={[0, 0.55, 0]} fontSize={0.1} color={hovered ? color : '#888888'} anchorX="center">
        {hovered ? '[PRESS E]' : icon}
      </Text>
    </group>
  )
}

// ── Floor grid ────────────────────────────────────────────────────────────────
function Floor() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0a1a" metalness={0.1} roughness={0.9} />
      </mesh>
      {/* Grid lines using line segments */}
      <gridHelper args={[20, 20, '#1a1a3e', '#1a1a3e']} position={[0, -0.497, 0]} />
    </>
  )
}

// ── Floating particles ────────────────────────────────────────────────────────
function Particles() {
  const count = 60
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 16
  }
  const ref = useRef<THREE.Points>(null!)
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0003
  })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#5e72e4" size={0.04} transparent opacity={0.5} />
    </points>
  )
}

// ── Scene ────────────────────────────────────────────────────────────────────
function Scene({
  agentState,
  agentPos,
  onTrade,
  onConfig,
  onWhale,
}: {
  agentState: AgentState
  agentPos: [number, number, number]
  onTrade: () => void
  onConfig: () => void
  onWhale: () => void
}) {
  const [hov, setHov] = useState({ trade: false, config: false, whale: false })
  const { gl } = useThree()

  useEffect(() => {
    gl.domElement.style.cursor = Object.values(hov).some(Boolean) ? 'pointer' : 'default'
  }, [hov, gl])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 6, 0]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-4, 3, -4]} intensity={0.8} color="#5e72e4" />
      <pointLight position={[4, 3, 4]} intensity={0.6} color="#00ff88" />

      <Particles />
      <Floor />

      {/* Agent */}
      <Agent state={agentState} position={agentPos} />

      {/* Stations */}
      <Station
        position={[-4, 0, -1]}
        label="Config Station"
        icon="⚙"
        color="#aa88ff"
        onClick={onConfig}
        hovered={hov.config}
        onHover={v => setHov(h => ({ ...h, config: v }))}
      />
      <Station
        position={[0, 0, -3.5]}
        label="Whale Hub"
        icon="🐋"
        color="#f5a623"
        onClick={onWhale}
        hovered={hov.whale}
        onHover={v => setHov(h => ({ ...h, whale: v }))}
      />
      <Station
        position={[4, 0, -1]}
        label="Trade Station"
        icon="📈"
        color="#00ff88"
        onClick={onTrade}
        hovered={hov.trade}
        onHover={v => setHov(h => ({ ...h, trade: v }))}
      />

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 5}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={14}
        target={[0, 0, -1]}
      />
    </>
  )
}

// ── HUD ───────────────────────────────────────────────────────────────────────
function HUD({
  energy, pnl, trades, state, log, following,
  onTrade, onConfig, onWhale, onConnect, wallet,
}: {
  energy: number; pnl: number; trades: number; state: AgentState
  log: LogEntry[]; following: string | null
  onTrade: () => void; onConfig: () => void; onWhale: () => void
  onConnect: () => void; wallet: string | null
}) {
  const stateColor = { idle: '#5e72e4', trading: '#00ff88', risk: '#ff4444', config: '#aa88ff' }[state]
  const stateLabel = { idle: 'IDLE', trading: 'TRADING', risk: 'HIGH RISK', config: 'CONFIG' }[state]

  return (
    <div className="absolute inset-0 pointer-events-none font-mono select-none">

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
        style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-widest" style={{ color: '#5e72e4', textShadow: '0 0 20px #5e72e470' }}>eelie<span style={{ color: '#fff' }}>n</span>X</span>
          <span className="text-xs px-2 py-0.5 rounded border" style={{ color: '#555', borderColor: '#333' }}>AGENT WORLD</span>
        </div>
        <button className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all hover:border-[#5e72e4]"
          style={{ borderColor: wallet ? '#00ff8840' : '#333', color: wallet ? '#00ff88' : '#888', background: 'rgba(0,0,0,0.6)' }}
          onClick={onConnect}>
          <span className="w-2 h-2 rounded-full" style={{ background: wallet ? '#00ff88' : '#444' }} />
          {wallet ?? 'Connect Wallet'}
        </button>
      </div>

      {/* Left panel */}
      <div className="absolute left-4 top-16 flex flex-col gap-3 w-44">
        {/* Agent state */}
        <div className="rounded-xl border p-3" style={{ background: 'rgba(0,0,0,0.75)', borderColor: `${stateColor}30`, backdropFilter: 'blur(10px)' }}>
          <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: '#555' }}>Agent Status</div>
          <div className="text-sm font-bold" style={{ color: stateColor }}>{stateLabel}</div>
          {following && <div className="text-[10px] mt-1" style={{ color: '#f5a623' }}>🐋 {following}</div>}
        </div>

        {/* Energy */}
        <div className="rounded-xl border p-3" style={{ background: 'rgba(0,0,0,0.75)', borderColor: '#333', backdropFilter: 'blur(10px)' }}>
          <div className="text-[9px] uppercase tracking-widest mb-1.5" style={{ color: '#555' }}>Energy</div>
          <div className="text-xl font-bold text-white">{energy}<span className="text-xs" style={{ color: '#555' }}>%</span></div>
          <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${energy}%`, background: `linear-gradient(90deg, #5e72e4, #00ff88)` }} />
          </div>
        </div>

        {/* P&L */}
        <div className="rounded-xl border p-3" style={{ background: 'rgba(0,0,0,0.75)', borderColor: '#333', backdropFilter: 'blur(10px)' }}>
          <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: '#555' }}>Total P&L</div>
          <div className="text-xl font-bold" style={{ color: '#00ff88' }}>+${pnl.toFixed(2)}</div>
          <div className="text-[10px] mt-1" style={{ color: '#444' }}>{trades} trade{trades !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Right panel — log */}
      <div className="absolute right-4 top-16 w-56">
        <div className="rounded-xl border p-3" style={{ background: 'rgba(0,0,0,0.80)', borderColor: '#222', backdropFilter: 'blur(10px)' }}>
          <div className="text-[9px] uppercase tracking-widest mb-2" style={{ color: '#555' }}>Agent Log</div>
          <div className="space-y-1.5 max-h-52 overflow-hidden">
            {log.slice(0, 8).map(entry => (
              <div key={entry.id} className="text-[10px] leading-tight pl-2 border-l" style={{ color: entry.color, borderColor: `${entry.color}50` }}>
                <span style={{ color: '#333' }}>{entry.ts} </span>{entry.msg}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 px-5 py-4 pointer-events-auto"
        style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>
        {[
          { key: '←', label: 'Config', color: '#aa88ff', fn: onConfig },
          { key: '↑', label: '🐋 Whale Hub', color: '#f5a623', fn: onWhale },
          { key: '→', label: 'Trade', color: '#00ff88', fn: onTrade },
        ].map(b => (
          <button key={b.key} onClick={b.fn}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs transition-all hover:scale-105 active:scale-95"
            style={{ borderColor: `${b.color}40`, color: b.color, background: 'rgba(0,0,0,0.6)' }}>
            <span className="w-5 h-5 rounded border flex items-center justify-center text-[10px] font-bold"
              style={{ borderColor: `${b.color}50`, color: '#999' }}>{b.key}</span>
            {b.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Whale Picker Modal ─────────────────────────────────────────────────────────
const WHALES = [
  { name: 'Elon',   emoji: '🦅', win: 82, pnl: '+$420', color: '#1DA1F2', risk: 'MED' },
  { name: 'Vitalik',emoji: '🔷', win: 91, pnl: '+$310', color: '#7B2FFF', risk: 'LOW' },
  { name: 'CZ',     emoji: '🌕', win: 85, pnl: '+$550', color: '#F3BA2F', risk: 'MED' },
  { name: 'Trump',  emoji: '🦁', win: 71, pnl: '+$180', color: '#FF6B35', risk: 'HIGH' },
]

function WhaleModal({ onSelect, onClose }: { onSelect: (name: string) => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-2xl border p-6 w-80 font-mono" style={{ background: '#0a0a1a', borderColor: '#f5a62340', boxShadow: '0 0 60px rgba(245,166,35,0.2)' }}>
        <p className="text-xs tracking-widest uppercase mb-4 text-center" style={{ color: '#f5a623' }}>🐋 Select Whale to Follow</p>
        <div className="space-y-2">
          {WHALES.map(w => (
            <button key={w.name} onClick={() => onSelect(w.name)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:scale-[1.01]"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <span className="text-2xl">{w.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{w.name}</p>
                <p className="text-[10px]" style={{ color: '#555' }}>Risk: {w.risk} · {w.pnl} USDC</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: w.color }}>{w.win}%</p>
                <p className="text-[9px]" style={{ color: '#444' }}>win rate</p>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2 rounded-xl border text-xs transition-all hover:border-[#f5a623]"
          style={{ borderColor: '#333', color: '#555' }}>CLOSE</button>
      </div>
    </div>
  )
}

// ── Result Toast ───────────────────────────────────────────────────────────────
function ResultToast({ result, onClose }: { result: { profit: string; msg: string } | null; onClose: () => void }) {
  if (!result) return null
  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
      <div className="pointer-events-auto rounded-2xl border p-6 w-72 text-center font-mono"
        style={{ background: 'rgba(0,10,5,0.95)', borderColor: '#00ff88', boxShadow: '0 0 60px rgba(0,255,136,0.3)', animation: 'fadeIn .3s ease' }}>
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#00ff88' }}>⚡ Trade Executed</p>
        <p className="text-4xl font-bold text-white mb-2">{result.profit}</p>
        <p className="text-xs leading-relaxed mb-4" style={{ color: '#888' }}>{result.msg}</p>
        <button onClick={onClose} className="px-6 py-2 rounded-xl border text-xs transition-all hover:bg-[#00ff8815]"
          style={{ borderColor: '#00ff88', color: '#00ff88' }}>CONFIRM ✓</button>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function GameScene() {
  const [agentState, setAgentState] = useState<AgentState>('idle')
  const [agentPos, setAgentPos] = useState<[number, number, number]>([0, 0, 0])
  const [energy, setEnergy] = useState(100)
  const [pnl, setPnl] = useState(0)
  const [trades, setTrades] = useState(0)
  const [log, setLog] = useState<LogEntry[]>([
    { id: 1, msg: 'eelienX Agent online', color: '#5e72e4', ts: '00:00' },
    { id: 2, msg: 'Scanning ETH/USDC...', color: '#888', ts: '00:01' },
  ])
  const [following, setFollowing] = useState<string | null>(null)
  const [wallet, setWallet] = useState<string | null>(null)
  const [showWhale, setShowWhale] = useState(false)
  const [result, setResult] = useState<{ profit: string; msg: string } | null>(null)
  const logId = useRef(3)

  function addLog(msg: string, color = '#888') {
    const ts = new Date().toISOString().slice(14, 19)
    setLog(prev => [{ id: logId.current++, msg, color, ts }, ...prev].slice(0, 20))
  }

  async function executeTrade() {
    if (agentState !== 'idle' || energy < 10) {
      addLog('⚠ Insufficient energy', '#ff4444')
      return
    }
    setAgentPos([3.5, 0, -0.5])
    setAgentState('trading')
    addLog('Moving to Trade Station...', '#5e72e4')

    await sleep(800)
    addLog('Scanning ETH/USDC market...', '#888')

    await sleep(1200)

    // Call backend
    try {
      const res = await fetch('/api/trade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ following }) })
      const data = await res.json()

      if (data.action === 'RISK') {
        setAgentState('risk')
        addLog('⚠ High volatility — trade cancelled', '#ff4444')
        addLog('Protecting capital', '#ff4444')
        await sleep(2000)
      } else {
        const profit = parseFloat(data.profit) || +(Math.random() * 7 + 1.5).toFixed(2)
        setPnl(p => +(p + profit).toFixed(2))
        setTrades(t => t + 1)
        setEnergy(e => Math.max(0, e - Math.floor(Math.random() * 12 + 5)))
        addLog(`✓ ${data.action} ETH executed`, '#00ff88')
        addLog(`+$${profit.toFixed(2)} USDC${following ? ` · copy ${following}` : ''}`, '#00ff88')
        setResult({ profit: `+$${profit.toFixed(2)}`, msg: `${data.action} ETH/USDC${following ? `\nFollowing ${following}` : ''}\n${data.message ?? ''}` })
      }
    } catch {
      // fallback
      const profit = +(Math.random() * 6 + 1.5).toFixed(2)
      setPnl(p => +(p + profit).toFixed(2))
      setTrades(t => t + 1)
      setEnergy(e => Math.max(0, e - 10))
      addLog(`✓ BUY ETH executed`, '#00ff88')
      addLog(`+$${profit.toFixed(2)} USDC`, '#00ff88')
      setResult({ profit: `+$${profit.toFixed(2)}`, msg: `Agent BUY ETH/USDC\nIndependent analysis` })
    }

    setAgentState('idle')
    setAgentPos([0, 0, 0])
  }

  function openConfig() {
    if (agentState !== 'idle') return
    setAgentPos([-3.5, 0, -0.5])
    setAgentState('config')
    addLog('Config Station accessed', '#aa88ff')
    addLog('Risk: MEDIUM · Max trade: 0.5 ETH', '#555')
    setTimeout(() => { setAgentState('idle'); setAgentPos([0, 0, 0]) }, 2500)
  }

  function openWhale() {
    setAgentPos([0, 0, -3])
    setShowWhale(true)
  }

  function selectWhale(name: string) {
    setFollowing(name)
    setShowWhale(false)
    addLog(`Following 🐋 ${name}`, '#f5a623')
    addLog('Copy trading enabled', '#f5a623')
    setAgentPos([0, 0, 0])
  }

  async function connectWallet() {
    if (wallet) return
    if (typeof window !== 'undefined' && (window as unknown as { ethereum?: unknown }).ethereum) {
      try {
        const eth = (window as unknown as { ethereum: { request: (a: {method:string}) => Promise<string[]> } }).ethereum
        const accounts = await eth.request({ method: 'eth_requestAccounts' })
        const addr = `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`
        setWallet(addr)
        addLog(`Wallet connected: ${addr}`, '#00ff88')
        addLog('Network: Base Sepolia', '#5e72e4')
      } catch { addLog('Wallet connection rejected', '#ff4444') }
    } else {
      setWallet('0x39el...iens')
      addLog('Demo wallet connected', '#5e72e4')
    }
  }

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'e' || e.key === 'E') executeTrade()
      if (e.key === 'ArrowLeft') openConfig()
      if (e.key === 'ArrowUp') openWhale()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [agentState, energy]) // eslint-disable-line

  return (
    <div className="w-screen h-screen relative bg-[#0d0d1a] overflow-hidden">
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 5, 8], fov: 55 }}>
        <Suspense fallback={null}>
          <Scene
            agentState={agentState}
            agentPos={agentPos}
            onTrade={executeTrade}
            onConfig={openConfig}
            onWhale={openWhale}
          />
        </Suspense>
      </Canvas>

      {/* HUD overlay */}
      <HUD
        energy={energy} pnl={pnl} trades={trades} state={agentState}
        log={log} following={following}
        onTrade={executeTrade} onConfig={openConfig} onWhale={openWhale}
        onConnect={connectWallet} wallet={wallet}
      />

      {/* Modals */}
      {showWhale && <WhaleModal onSelect={selectWhale} onClose={() => { setShowWhale(false); setAgentPos([0,0,0]) }} />}
      <ResultToast result={result} onClose={() => setResult(null)} />
    </div>
  )
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
