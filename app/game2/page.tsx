'use client'
import { useState, useEffect, useRef } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────
type Screen = 'home' | 'manual' | 'copy' | 'executing' | 'result'
type TradeResult = { profit: number; action: string; message: string; win: boolean }

// ── Mock chart data ────────────────────────────────────────────────────────────
function MiniChart({ color }: { color: string }) {
  const points = [42, 38, 45, 40, 48, 44, 52, 47, 55, 50, 58, 53, 62, 57, 61]
  const h = 60; const w = 200
  const min = Math.min(...points); const max = Math.max(...points)
  const pts = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - ((v - min) / (max - min)) * h}`)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 60 }}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <polygon points={`${pts.join(' ')} ${w},${h} 0,${h}`} fill={color} opacity="0.1" />
    </svg>
  )
}

// ── Sound engine (Web Audio API — no files needed) ────────────────────────────
function playSound(type: 'coin' | 'lose' | 'click' | 'execute') {
  if (typeof window === 'undefined') return
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const now = ctx.currentTime

    if (type === 'coin') {
      // Mario-style coin: quick ascending beeps
      const freqs = [523, 659, 784, 1047]
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'square'; osc.frequency.setValueAtTime(f, now + i * 0.08)
        gain.gain.setValueAtTime(0.15, now + i * 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.12)
        osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.15)
      })
    } else if (type === 'lose') {
      // Sad descending trombone-ish
      const freqs = [392, 349, 311, 261]
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(f, now + i * 0.18)
        gain.gain.setValueAtTime(0.12, now + i * 0.18)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.25)
        osc.start(now + i * 0.18); osc.stop(now + i * 0.18 + 0.28)
      })
    } else if (type === 'click') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'; osc.frequency.setValueAtTime(880, now)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
      osc.start(now); osc.stop(now + 0.1)
    } else if (type === 'execute') {
      // Power-up ascending sweep
      const osc = ctx.createOscillator(); const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(300, now)
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4)
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
      osc.start(now); osc.stop(now + 0.5)
    }
  } catch { /* AudioContext blocked */ }
}

// ── Money rain ─────────────────────────────────────────────────────────────────
function MoneyRain() {
  const coins = Array.from({ length: 18 }, (_, i) => i)
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {coins.map(i => (
        <div key={i} className="absolute text-2xl animate-bounce"
          style={{
            left: `${(i * 5.5) % 100}%`,
            top: `-${Math.random() * 20}%`,
            animationDelay: `${(i * 0.15) % 1.5}s`,
            animationDuration: `${0.6 + (i % 4) * 0.2}s`,
            animation: `fall ${1 + (i % 3) * 0.4}s linear ${(i * 0.12) % 1.2}s infinite`,
          }}>
          💰
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0%   { transform: translateY(-60px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.3; }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%     { transform: translateX(-8px) rotate(-2deg); }
          75%     { transform: translateX(8px) rotate(2deg); }
        }
        @keyframes pop {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 20px currentColor; }
          50%     { box-shadow: 0 0 50px currentColor; }
        }
      `}</style>
    </div>
  )
}

// ── NPC Dialog Box ────────────────────────────────────────────────────────────
function NPCDialog({ text, speaker = '🤖 Agente', color = '#5e72e4' }: { text: string; speaker?: string; color?: string }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const t = setInterval(() => {
      setDisplayed(text.slice(0, ++i))
      if (i >= text.length) clearInterval(t)
    }, 28)
    return () => clearInterval(t)
  }, [text])
  return (
    <div className="rounded-2xl border-2 p-4 relative" style={{ borderColor: `${color}50`, background: `${color}0D` }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{speaker.split(' ')[0]}</span>
        <span className="font-mono text-xs font-bold" style={{ color }}>{speaker.split(' ').slice(1).join(' ')}</span>
        <span className="ml-auto text-xs animate-pulse" style={{ color: `${color}80` }}>▮</span>
      </div>
      <p className="font-mono text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.80)' }}>{displayed}<span className="animate-pulse">|</span></p>
    </div>
  )
}

// ── HOME SCREEN ────────────────────────────────────────────────────────────────
function HomeScreen({ onMode }: { onMode: (m: 'manual' | 'copy') => void }) {
  const [blink, setBlink] = useState(true)
  useEffect(() => { const t = setInterval(() => setBlink(b => !b), 600); return () => clearInterval(t) }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6"
      style={{ background: 'linear-gradient(180deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a1a 100%)' }}>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({length: 30}).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width: 2, height: 2, left: `${(i*3.3)%100}%`, top: `${(i*7.1)%80}%`, opacity: 0.3 + (i%5)*0.1, animation: `blink-star ${1+i%3}s ${i%2}s infinite` }} />
        ))}
        <style>{`@keyframes blink-star { 0%,100%{opacity:0.2} 50%{opacity:0.8} }`}</style>
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8" style={{ animation: 'pop 0.6s ease' }}>
        <div className="text-7xl mb-3">🤖</div>
        <h1 className="font-mono font-black text-5xl mb-1" style={{ color: '#5e72e4', textShadow: '0 0 30px #5e72e470, 0 0 60px #5e72e430', letterSpacing: 4 }}>
          eelie<span style={{ color: '#fff' }}>n</span>X
        </h1>
        <p className="font-mono text-sm tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>AGENT TRADING WORLD</p>
      </div>

      {/* Blink "insert coin" */}
      <p className="font-mono text-sm mb-10 relative z-10" style={{ color: blink ? '#00ff88' : 'transparent', transition: 'color 0.1s' }}>
        ▶ SELECT YOUR MODE ◀
      </p>

      {/* Mode buttons */}
      <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
        <button onClick={() => { playSound('click'); onMode('manual') }}
          className="group relative overflow-hidden rounded-2xl border-2 px-8 py-5 font-mono font-bold text-base transition-all hover:scale-105 active:scale-95"
          style={{ borderColor: '#00ff88', color: '#00ff88', background: 'rgba(0,255,136,0.05)', textShadow: '0 0 10px #00ff8870' }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,255,136,0.08)' }} />
          🎮 MODO MANUAL
          <div className="font-normal text-xs mt-1 opacity-60">Tú decides · Agente analiza</div>
        </button>

        <button onClick={() => { playSound('click'); onMode('copy') }}
          className="group relative overflow-hidden rounded-2xl border-2 px-8 py-5 font-mono font-bold text-base transition-all hover:scale-105 active:scale-95"
          style={{ borderColor: '#f5a623', color: '#f5a623', background: 'rgba(245,166,35,0.05)', textShadow: '0 0 10px #f5a62370' }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(245,166,35,0.08)' }} />
          🐋 COPY TRADING
          <div className="font-normal text-xs mt-1 opacity-60">Copia a los mejores traders</div>
        </button>
      </div>

      <p className="font-mono text-xs mt-8 relative z-10" style={{ color: 'rgba(255,255,255,0.2)' }}>
        Powered by Bankr · Locus · Base
      </p>
    </div>
  )
}

// ── MANUAL MODE ────────────────────────────────────────────────────────────────
const AGENT_TIPS = [
  { condition: 'buy',  msg: 'ETH bajó 2.1% en 1h — momento de entrada detectado 📉→📈', risk: 'BAJO' },
  { condition: 'buy',  msg: 'Volumen alto + RSI oversold — oportunidad de acumulación', risk: 'MEDIO' },
  { condition: 'sell', msg: 'Precio cerca de resistencia — considera toma de ganancias', risk: 'BAJO' },
  { condition: 'sell', msg: '⚠ Alta volatilidad detectada — riesgo elevado en este momento', risk: 'ALTO' },
]

function ManualScreen({ onExecute, onBack }: { onExecute: (action: string) => void; onBack: () => void }) {
  const [action, setAction] = useState<'buy' | 'sell' | null>(null)
  const tip = AGENT_TIPS[Math.floor(Math.random() * AGENT_TIPS.length)]
  const riskColor = { BAJO: '#00ff88', MEDIO: '#f5a623', ALTO: '#ff4444' }[tip.risk] ?? '#888'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0d1a' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="font-mono text-xs" style={{ color: '#555' }}>← VOLVER</button>
        <span className="font-mono text-sm font-bold" style={{ color: '#00ff88' }}>MODO MANUAL</span>
        <span className="font-mono text-xs" style={{ color: '#333' }}>ETH/USDC</span>
      </div>

      <div className="flex-1 flex flex-col gap-4 p-6 max-w-md mx-auto w-full">

        {/* Chart */}
        <div className="rounded-2xl border p-4" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs" style={{ color: '#888' }}>ETH / USDC · 1H</span>
            <span className="font-mono text-lg font-bold" style={{ color: '#00ff88' }}>$3,241.50 <span className="text-xs text-green-400">+2.1%</span></span>
          </div>
          <MiniChart color="#00ff88" />
        </div>

        <NPCDialog text={action ? `Acción seleccionada: ${action.toUpperCase()}. ${tip.msg} Confirma si quieres proceder.` : `Analizando mercado… ${tip.msg}`} />
        <div className="flex items-center gap-2 px-1">
          <span className="font-mono text-xs" style={{ color: '#555' }}>Nivel de riesgo:</span>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: riskColor, background: `${riskColor}15`, border: `1px solid ${riskColor}40` }}>{tip.risk}</span>
        </div>

        {/* BUY / SELL */}
        <div className="grid grid-cols-2 gap-3">
          {(['buy', 'sell'] as const).map(a => (
            <button key={a} onClick={() => { playSound('click'); setAction(a) }}
              className="rounded-2xl border-2 py-4 font-mono font-black text-lg transition-all hover:scale-105 active:scale-95"
              style={{
                borderColor: action === a ? (a === 'buy' ? '#00ff88' : '#ff4444') : 'rgba(255,255,255,0.1)',
                color: action === a ? (a === 'buy' ? '#00ff88' : '#ff4444') : '#555',
                background: action === a ? (a === 'buy' ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,68,0.08)') : 'rgba(255,255,255,0.02)',
                textShadow: action === a ? `0 0 20px ${a === 'buy' ? '#00ff88' : '#ff4444'}` : 'none',
              }}>
              {a === 'buy' ? '📈 BUY' : '📉 SELL'}
            </button>
          ))}
        </div>

        {/* Execute */}
        <button
          disabled={!action}
          onClick={() => { if (action) { playSound('execute'); onExecute(action.toUpperCase()) } }}
          className="rounded-2xl py-5 font-mono font-black text-base transition-all disabled:opacity-30"
          style={{
            background: action ? 'linear-gradient(135deg, #5e72e4, #00ff88)' : 'rgba(255,255,255,0.05)',
            color: 'white', boxShadow: action ? '0 8px 30px rgba(94,114,228,0.4)' : 'none',
            transform: action ? 'scale(1)' : 'scale(0.98)',
          }}>
          ⚡ EJECUTAR TRADE
        </button>
      </div>
    </div>
  )
}

// ── COPY TRADING ───────────────────────────────────────────────────────────────
const WHALES = [
  { name: 'Elon',    emoji: '🦅', pct: '+12%', pnl: '+$1,240', win: 82, color: '#1DA1F2', risk: 'MED', tip: 'Este trader acumula en caídas — buena racha esta semana.' },
  { name: 'Vitalik', emoji: '🔷', pct: '+8%',  pnl: '+$820',   win: 91, color: '#7B2FFF', risk: 'LOW', tip: 'Perfil conservador, alta tasa de éxito. Recomendado.' },
  { name: 'CZ',      emoji: '🌕', pct: '+5%',  pnl: '+$510',   win: 85, color: '#F3BA2F', risk: 'MED', tip: 'Operativa diversificada ETH + BTC. Riesgo moderado.' },
]

function CopyScreen({ onExecute, onBack }: { onExecute: (action: string) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const whale = selected !== null ? WHALES[selected] : null

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0d0d1a' }}>
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="font-mono text-xs" style={{ color: '#555' }}>← VOLVER</button>
        <span className="font-mono text-sm font-bold" style={{ color: '#f5a623' }}>🐋 COPY TRADING</span>
        <span className="font-mono text-xs" style={{ color: '#333' }}>LIVE</span>
      </div>

      <div className="flex-1 flex flex-col gap-4 p-6 max-w-md mx-auto w-full">
        <p className="font-mono text-xs text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>Top traders ahora mismo — selecciona uno</p>

        {/* Whale list */}
        {WHALES.map((w, i) => (
          <button key={w.name} onClick={() => setSelected(i)}
            className="w-full rounded-2xl border-2 p-4 text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              borderColor: selected === i ? w.color : 'rgba(255,255,255,0.08)',
              background: selected === i ? `${w.color}10` : 'rgba(255,255,255,0.02)',
              boxShadow: selected === i ? `0 0 20px ${w.color}30` : 'none',
            }}>
            <div className="flex items-center gap-4">
              <span className="text-3xl">{w.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-white">{w.name}</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ color: w.color, background: `${w.color}20` }}>#{i+1}</span>
                </div>
                <MiniChart color={w.color} />
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="font-mono text-xl font-black" style={{ color: w.color }}>{w.pct}</div>
                <div className="font-mono text-xs" style={{ color: '#555' }}>{w.win}% win</div>
              </div>
            </div>
          </button>
        ))}

        {whale && (
          <>
            <NPCDialog text={`${whale.tip} P&L esta semana: ${whale.pnl}. Confirma si quieres copiar este trade.`} color={whale.color} />
          </>
        )}

        <button
          disabled={selected === null}
          onClick={() => { if (whale) { playSound('execute'); onExecute(`COPY·${whale.name.toUpperCase()}`) } }}
          className="rounded-2xl py-5 font-mono font-black text-base transition-all disabled:opacity-30"
          style={{
            background: whale ? `linear-gradient(135deg, ${whale.color}, #5e72e4)` : 'rgba(255,255,255,0.05)',
            color: 'white', boxShadow: whale ? `0 8px 30px ${whale.color}40` : 'none',
          }}>
          🐋 COPIAR TRADE
        </button>
      </div>
    </div>
  )
}

// ── EXECUTING SCREEN ───────────────────────────────────────────────────────────
function ExecutingScreen({ action }: { action: string }) {
  const msgs = [
    '🤖 Agente conectando con el mercado...',
    '📡 Analizando condiciones ETH/USDC...',
    '⚡ Enviando orden al protocolo...',
    '🔗 Confirmando en Base Sepolia...',
  ]
  const [msgIdx, setMsgIdx] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const t1 = setInterval(() => setMsgIdx(i => Math.min(i + 1, msgs.length - 1)), 700)
    const t2 = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(180deg, #0d0d1a, #0a1a0d)' }}>
      <div className="text-center" style={{ animation: 'pop 0.4s ease' }}>
        <div className="text-6xl mb-6" style={{ animation: 'pulse 1s ease infinite' }}>⚡</div>
        <h2 className="font-mono font-black text-2xl mb-2" style={{ color: '#00ff88' }}>
          EJECUTANDO{dots}
        </h2>
        <p className="font-mono text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>{action}</p>
        <div className="space-y-2 text-left max-w-sm mx-auto w-full">
          {msgs.slice(0, msgIdx + 1).map((m, i) => (
            <div key={i} className="font-mono text-xs flex items-center gap-2"
              style={{ color: i < msgIdx ? '#2E7D6B' : '#00ff88', animation: 'slide-up 0.3s ease' }}>
              <span>{i < msgIdx ? '✓' : '▸'}</span> {m}
            </div>
          ))}
          {msgIdx >= 2 && (
            <div className="mt-3">
              <NPCDialog text="Procesando orden en la blockchain… Espera confirmación de Base Sepolia." color="#00ff88" speaker="🔗 Protocolo" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── RESULT SCREEN ──────────────────────────────────────────────────────────────
function ResultScreen({ result, onReplay }: { result: TradeResult; onReplay: () => void }) {
  const [show, setShow] = useState(false)
  useEffect(() => { setTimeout(() => setShow(true), 100); playSound(result.win ? 'coin' : 'lose') }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: result.win ? 'linear-gradient(180deg, #0d0d1a, #0a2a0d)' : 'linear-gradient(180deg, #0d0d1a, #2a0a0a)' }}>

      {result.win && <MoneyRain />}

      <div className="relative z-10 text-center" style={{ animation: show ? 'pop 0.5s ease' : 'none', opacity: show ? 1 : 0 }}>
        {/* Character */}
        <div className="text-8xl mb-4" style={{ animation: result.win ? 'bounce 0.8s ease infinite alternate' : 'shake 0.5s ease infinite', display: 'inline-block' }}>
          {result.win ? '🤩' : '😭'}
        </div>

        {/* Result */}
        <h2 className="font-mono font-black mb-2" style={{ fontSize: 'clamp(32px, 8vw, 56px)', color: result.win ? '#00ff88' : '#ff4444', textShadow: `0 0 40px ${result.win ? '#00ff88' : '#ff4444'}60` }}>
          {result.win ? `+${result.profit.toFixed(2)}%` : `-${Math.abs(result.profit).toFixed(2)}%`}
        </h2>

        <p className="font-mono text-lg font-bold mb-2" style={{ color: result.win ? '#00ff88' : '#ff4444' }}>
          {result.win ? '🚀 ¡GANASTE!' : '💸 Perdiste esta vez'}
        </p>

        <p className="font-mono text-sm mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {result.action} · {result.message}
        </p>

        {/* P&L badge */}
        <div className="inline-block rounded-2xl border-2 px-6 py-3 mb-8 mt-2"
          style={{ borderColor: result.win ? '#00ff88' : '#ff4444', background: result.win ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,68,0.08)' }}>
          <span className="font-mono text-2xl font-black" style={{ color: result.win ? '#00ff88' : '#ff4444' }}>
            {result.win ? '+' : '-'}${(Math.abs(result.profit) * 32.4).toFixed(2)} USDC
          </span>
        </div>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button onClick={() => { playSound('click'); onReplay() }}
            className="rounded-2xl py-4 font-mono font-black text-base transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #5e72e4, #00ff88)', color: 'white', boxShadow: '0 8px 30px rgba(94,114,228,0.4)' }}>
            🔄 JUGAR OTRA VEZ
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce { from{transform:translateY(0) scale(1)} to{transform:translateY(-20px) scale(1.1)} }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-10px) rotate(-5deg)} 75%{transform:translateX(10px) rotate(5deg)} }
      `}</style>
    </div>
  )
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
export default function Game2() {
  const [screen, setScreen] = useState<Screen>('home')
  const [tradeAction, setTradeAction] = useState('')
  const [result, setResult] = useState<TradeResult | null>(null)

  async function executeTrade(action: string) {
    setTradeAction(action)
    setScreen('executing')

    await sleep(2800)

    try {
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following: action.startsWith('COPY') ? action.split('·')[1] : null }),
      })
      const data = await res.json()
      const profit = parseFloat(data.profit) || +(Math.random() * 8 + 1).toFixed(2)
      const isRisk = data.action === 'RISK'
      setResult({
        action: data.action === 'RISK' ? action : data.action,
        profit: isRisk ? -(Math.random() * 3 + 0.5) : profit,
        message: data.message ?? 'Operación completada en Base Sepolia',
        win: !isRisk,
      })
    } catch {
      const profit = +(Math.random() * 8 + 1).toFixed(2)
      const win = Math.random() > 0.25
      setResult({
        action,
        profit: win ? profit : -profit * 0.4,
        message: win ? 'ETH dip recovery — trade exitoso' : 'Volatilidad alta — stop loss activado',
        win,
      })
    }
    setScreen('result')
  }

  if (screen === 'home')      return <HomeScreen onMode={m => setScreen(m)} />
  if (screen === 'manual')    return <ManualScreen onExecute={executeTrade} onBack={() => setScreen('home')} />
  if (screen === 'copy')      return <CopyScreen  onExecute={executeTrade} onBack={() => setScreen('home')} />
  if (screen === 'executing') return <ExecutingScreen action={tradeAction} />
  if (screen === 'result' && result) return <ResultScreen result={result} onReplay={() => { setResult(null); setScreen('home') }} />
  return null
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }
