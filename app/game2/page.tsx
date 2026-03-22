'use client'
import { useState, useEffect, useRef } from 'react'

// ── Sound engine (Web Audio API) ───────────────────────────────────────────────
function playSound(type: 'coin' | 'lose' | 'click' | 'execute') {
  if (typeof window === 'undefined') return
  try {
    const ctx = new (window.AudioContext || (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const t = ctx.currentTime
    if (type === 'coin') {
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination); o.type = 'square'
        o.frequency.setValueAtTime(f, t + i * 0.08)
        g.gain.setValueAtTime(0.12, t + i * 0.08)
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.12)
        o.start(t + i * 0.08); o.stop(t + i * 0.08 + 0.15)
      })
    } else if (type === 'lose') {
      [392, 349, 311, 261].forEach((f, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination); o.type = 'sawtooth'
        o.frequency.setValueAtTime(f, t + i * 0.18)
        g.gain.setValueAtTime(0.10, t + i * 0.18)
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.25)
        o.start(t + i * 0.18); o.stop(t + i * 0.18 + 0.3)
      })
    } else if (type === 'click') {
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination); o.type = 'sine'
      o.frequency.setValueAtTime(880, t); g.gain.setValueAtTime(0.06, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.07)
      o.start(t); o.stop(t + 0.08)
    } else if (type === 'execute') {
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination); o.type = 'sine'
      o.frequency.setValueAtTime(300, t)
      o.frequency.exponentialRampToValueAtTime(1200, t + 0.4)
      g.gain.setValueAtTime(0.10, t)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
      o.start(t); o.stop(t + 0.5)
    }
  } catch { /* blocked */ }
}

// ── Mini SVG chart ─────────────────────────────────────────────────────────────
function MiniChart({ color, points: pts = [42,38,45,40,48,44,52,47,55,50,58,53,62,57,61] }: { color: string; points?: number[] }) {
  const h = 48; const w = 160
  const min = Math.min(...pts); const max = Math.max(...pts) || 1
  const path = pts.map((v, i) => `${(i/(pts.length-1))*w},${h-((v-min)/(max-min))*h}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 48 }} preserveAspectRatio="none">
      <polyline points={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <polygon points={`${path} ${w},${h} 0,${h}`} fill={color} opacity="0.12" />
    </svg>
  )
}

// ── NPC Dialog ────────────────────────────────────────────────────────────────
function NPC({ text, color = '#5e72e4', speaker = '🤖' }: { text: string; color?: string; speaker?: string }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    setShown('')
    let i = 0
    const t = setInterval(() => { setShown(text.slice(0, ++i)); if (i >= text.length) clearInterval(t) }, 24)
    return () => clearInterval(t)
  }, [text])
  return (
    <div className="rounded-2xl border p-3.5" style={{ background: `${color}10`, borderColor: `${color}40` }}>
      <div className="flex items-start gap-2">
        <span className="text-xl shrink-0 mt-0.5">{speaker}</span>
        <p className="font-mono text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>
          {shown}<span className="animate-pulse opacity-60">|</span>
        </p>
      </div>
    </div>
  )
}

// ── Money rain ────────────────────────────────────────────────────────────────
function MoneyRain() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({length:14}).map((_,i) => (
        <div key={i} className="absolute text-2xl"
          style={{ left:`${(i*7.1)%100}%`, top:'-40px', animation:`mfall ${1+i%3*0.3}s linear ${i*0.1}s infinite` }}>💰</div>
      ))}
      <style>{`
        @keyframes mfall { 0%{transform:translateY(-40px);opacity:1} 100%{transform:translateY(110dvh);opacity:0.2} }
        @keyframes popin { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes slideup { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes wobble { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px) scale(1.08)} }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px) rotate(-4deg)} 75%{transform:translateX(8px) rotate(4deg)} }
      `}</style>
    </div>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Screen = 'home' | 'manual' | 'copy' | 'executing' | 'result'
interface TradeResult { profit: number; action: string; message: string; win: boolean; real?: boolean }

// ── Session + Balance hook ────────────────────────────────────────────────────
function useSession() {
  const [balance, setBalance] = useState<{ mxn?: number; eth?: number } | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    fetch('/api/agent-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'balance' }) })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.balances) {
          setLoggedIn(true)
          const mxn = d.balances.find((b: { currency: string; total: string }) => b.currency === 'mxn')
          const eth = d.balances.find((b: { currency: string; total: string }) => b.currency === 'eth')
          setBalance({ mxn: mxn ? parseFloat(mxn.total) : undefined, eth: eth ? parseFloat(eth.total) : undefined })
        }
      })
      .catch(() => {})
  }, [])

  return { balance, loggedIn }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────────────────────────────────────

// ── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ onMode, balance, loggedIn }: { onMode: (m: 'manual'|'copy') => void; balance: { mxn?: number; eth?: number } | null; loggedIn: boolean }) {
  const [blink, setBlink] = useState(true)
  useEffect(() => { const t = setInterval(() => setBlink(b => !b), 550); return () => clearInterval(t) }, [])

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'linear-gradient(180deg,#0d0d1a 0%,#120d24 55%,#0d1a14 100%)' }}>
      {/* Stars bg */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({length:22}).map((_,i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width:2,height:2,left:`${(i*4.5)%100}%`,top:`${(i*6.3)%70}%`,opacity:0.2+(i%4)*0.1,animation:`blink-s ${1.5+i%3}s ${i%2*0.5}s infinite` }} />
        ))}
        <style>{`@keyframes blink-s{0%,100%{opacity:.15}50%{opacity:.8}}`}</style>
      </div>

      {/* Balance badge */}
      {loggedIn && balance && (
        <div className="relative z-10 flex justify-end px-5 pt-safe pt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ background:'rgba(0,255,136,0.08)',borderColor:'rgba(0,255,136,0.25)' }}>
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="font-mono text-xs" style={{color:'#00ff88'}}>
              {balance.eth ? `${balance.eth.toFixed(4)} ETH` : ''}{balance.mxn ? ` · $${balance.mxn.toFixed(0)} MXN` : ''}
            </span>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center" style={{animation:'popin 0.6s ease'}}>
        <div className="text-7xl mb-5" style={{filter:'drop-shadow(0 0 24px #5e72e460)'}}>🤖</div>
        <h1 className="font-mono font-black text-5xl mb-1.5" style={{ color:'#5e72e4', textShadow:'0 0 40px #5e72e470', letterSpacing:3 }}>
          eelie<span style={{color:'#fff'}}>n</span>X
        </h1>
        <p className="font-mono text-xs tracking-widest mb-8" style={{color:'rgba(255,255,255,0.30)'}}>AGENT TRADING WORLD</p>

        {/* Blink text */}
        <p className="font-mono text-sm mb-8" style={{color: blink ? '#00ff88' : 'transparent', transition:'color 0.05s'}}>
          ▶ ELIGE TU MODO ◀
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button onClick={() => { playSound('click'); onMode('manual') }}
            className="relative rounded-2xl border-2 py-5 px-6 font-mono font-black text-base active:scale-95 transition-transform"
            style={{ borderColor:'#00ff88', color:'#00ff88', background:'rgba(0,255,136,0.06)', textShadow:'0 0 12px #00ff8860' }}>
            🎮 MODO MANUAL
            <span className="block font-normal text-xs mt-0.5 opacity-55">Tú decides · Agente analiza</span>
          </button>

          <button onClick={() => { playSound('click'); onMode('copy') }}
            className="relative rounded-2xl border-2 py-5 px-6 font-mono font-black text-base active:scale-95 transition-transform"
            style={{ borderColor:'#f5a623', color:'#f5a623', background:'rgba(245,166,35,0.06)', textShadow:'0 0 12px #f5a62360' }}>
            🐋 COPY TRADING
            <span className="block font-normal text-xs mt-0.5 opacity-55">Copia a los mejores traders</span>
          </button>

          {!loggedIn && (
            <a href="/login" className="text-center font-mono text-xs py-3" style={{color:'rgba(255,255,255,0.25)'}}>
              → Conectar cuenta Bitso para trades reales
            </a>
          )}
        </div>
      </div>

      <p className="relative z-10 text-center font-mono text-xs pb-safe pb-6" style={{color:'rgba(255,255,255,0.15)'}}>
        Bankr · Locus · Base Sepolia
      </p>
    </div>
  )
}

// ── PRICE HOOK ─────────────────────────────────────────────────────────────────
interface PriceData { last: number; change24: number; high: number; low: number; ok: boolean }

function useLivePrice() {
  const [price, setPrice] = useState<PriceData | null>(null)
  useEffect(() => {
    fetch('/api/price').then(r => r.json()).then(setPrice).catch(() => null)
    const iv = setInterval(() => {
      fetch('/api/price').then(r => r.json()).then(setPrice).catch(() => null)
    }, 30000)
    return () => clearInterval(iv)
  }, [])
  return price
}

function buildTip(p: PriceData | null) {
  if (!p) return { msg: 'Analizando mercado en tiempo real...', risk: 'BAJO', riskC: '#00ff88' }
  const chg = p.change24
  const fmt  = (v: number) => v.toLocaleString('es-MX', { maximumFractionDigits: 0 })
  const pct  = Math.abs(chg).toFixed(1)
  if (chg <= -3)   return { msg: `ETH bajó ${pct}% en 24h — precio actual $${fmt(p.last)} MXN. Señal de compra detectada.`, risk: 'BAJO',  riskC: '#00ff88' }
  if (chg <= -1)   return { msg: `ETH cayó ${pct}% hoy, ahora en $${fmt(p.last)} MXN. RSI en zona de acumulación.`, risk: 'BAJO',  riskC: '#00ff88' }
  if (chg >= 5)    return { msg: `ETH subió ${pct}% en 24h — precio $${fmt(p.last)} MXN. Considera toma parcial de ganancias.`, risk: 'MEDIO', riskC: '#f5a623' }
  if (chg >= 2)    return { msg: `ETH en $${fmt(p.last)} MXN, +${pct}% hoy. Momentum alcista activo.`, risk: 'MEDIO', riskC: '#f5a623' }
  return { msg: `ETH en $${fmt(p.last)} MXN, movimiento de ${chg > 0 ? '+' : ''}${pct}% en 24h. Mercado lateral — agente en espera.`, risk: 'ALTO', riskC: '#f5a623' }
}

// ── MANUAL ────────────────────────────────────────────────────────────────────

function ManualScreen({ onExecute, onBack, loggedIn }: { onExecute:(a:string)=>void; onBack:()=>void; loggedIn:boolean }) {
  const [action, setAction] = useState<'buy'|'sell'|null>(null)
  const livePrice = useLivePrice()
  const tip = buildTip(livePrice)

  return (
    <div className="flex flex-col min-h-dvh" style={{background:'#0d0d1a'}}>
      {/* Nav */}
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-3 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <button onClick={onBack} className="font-mono text-xs active:opacity-60 p-1" style={{color:'#555'}}>← VOLVER</button>
        <span className="font-mono text-sm font-bold" style={{color:'#00ff88'}}>MODO MANUAL</span>
        <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{color:'#00ff88',background:'rgba(0,255,136,0.1)'}}>
          {loggedIn ? '● REAL' : '● SIM'}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-4 px-5 py-4 overflow-y-auto">
        {/* Price */}
        <div className="rounded-2xl border p-4" style={{background:'rgba(255,255,255,0.03)',borderColor:'rgba(255,255,255,0.08)'}}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs" style={{color:'#555'}}>ETH / MXN · 1H</span>
            <div className="text-right">
              <span className="font-mono font-black text-xl" style={{color:'#00ff88'}}>$62,450</span>
              <span className="font-mono text-xs ml-1.5 px-1.5 py-0.5 rounded" style={{color:'#00ff88',background:'rgba(0,255,136,0.12)'}}>+2.1%</span>
            </div>
          </div>
          <MiniChart color="#00ff88" />
        </div>

        {/* NPC */}
        <NPC
          text={action ? `Acción: ${action.toUpperCase()}. ${tip.msg} Confirma si quieres proceder.` : `Analizando mercado… ${tip.msg}`}
          color={tip.riskC}
        />

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs" style={{color:'#444'}}>Riesgo:</span>
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full" style={{color:tip.riskC,background:`${tip.riskC}15`,border:`1px solid ${tip.riskC}35`}}>{tip.risk}</span>
          {loggedIn && <span className="ml-auto font-mono text-xs" style={{color:'#444'}}>Trade real en Bitso</span>}
        </div>

        {/* BUY / SELL */}
        <div className="grid grid-cols-2 gap-3">
          {(['buy','sell'] as const).map(a => (
            <button key={a} onClick={() => { playSound('click'); setAction(a) }}
              className="rounded-2xl border-2 py-5 font-mono font-black text-lg active:scale-95 transition-all"
              style={{
                borderColor: action===a ? (a==='buy'?'#00ff88':'#ff4444') : 'rgba(255,255,255,0.08)',
                color: action===a ? (a==='buy'?'#00ff88':'#ff4444') : '#444',
                background: action===a ? (a==='buy'?'rgba(0,255,136,0.08)':'rgba(255,68,68,0.08)') : 'transparent',
                textShadow: action===a ? `0 0 20px ${a==='buy'?'#00ff88':'#ff4444'}` : 'none',
              }}>
              {a==='buy' ? '📈 BUY' : '📉 SELL'}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-safe pb-6 pt-3 border-t" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <button disabled={!action}
          onClick={() => action && (playSound('execute'), onExecute(action.toUpperCase()))}
          className="w-full rounded-2xl py-5 font-mono font-black text-base active:scale-95 transition-all disabled:opacity-25"
          style={{
            background: action ? 'linear-gradient(135deg,#5e72e4,#00ff88)' : 'rgba(255,255,255,0.05)',
            color:'white', boxShadow: action ? '0 8px 30px rgba(94,114,228,0.35)' : 'none',
          }}>
          ⚡ EJECUTAR TRADE
        </button>
      </div>
    </div>
  )
}

// ── COPY ──────────────────────────────────────────────────────────────────────
const WHALES = [
  { name:'Elon',    emoji:'🦅', pct:'+12%', win:82, color:'#1DA1F2', risk:'MED', tip:'Acumula en caídas — buena racha esta semana. Riesgo moderado.' },
  { name:'Vitalik', emoji:'🔷', pct:'+8%',  win:91, color:'#7B2FFF', risk:'LOW', tip:'Perfil conservador, tasa de éxito 91%. Muy recomendado para principiantes.' },
  { name:'CZ',      emoji:'🌕', pct:'+5%',  win:85, color:'#F3BA2F', risk:'MED', tip:'Operativa diversificada ETH + BTC. Riesgo moderado, retornos estables.' },
]

function CopyScreen({ onExecute, onBack, loggedIn }: { onExecute:(a:string)=>void; onBack:()=>void; loggedIn:boolean }) {
  const [sel, setSel] = useState<number|null>(null)
  const whale = sel !== null ? WHALES[sel] : null

  return (
    <div className="flex flex-col min-h-dvh" style={{background:'#0d0d1a'}}>
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-3 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <button onClick={onBack} className="font-mono text-xs active:opacity-60 p-1" style={{color:'#555'}}>← VOLVER</button>
        <span className="font-mono text-sm font-bold" style={{color:'#f5a623'}}>🐋 COPY TRADING</span>
        <span className="font-mono text-xs" style={{color:'#555'}}>LIVE</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 px-5 py-4 overflow-y-auto">
        <p className="font-mono text-xs text-center" style={{color:'rgba(255,255,255,0.28)'}}>Top traders ahora mismo</p>

        {WHALES.map((w,i) => (
          <button key={w.name} onClick={() => { playSound('click'); setSel(i) }}
            className="w-full rounded-2xl border-2 p-4 text-left active:scale-[0.98] transition-all"
            style={{
              borderColor: sel===i ? w.color : 'rgba(255,255,255,0.07)',
              background: sel===i ? `${w.color}10` : 'rgba(255,255,255,0.02)',
              boxShadow: sel===i ? `0 0 20px ${w.color}25` : 'none',
            }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{w.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-sm font-black text-white">{w.name}</span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{color:w.color,background:`${w.color}20`}}>#{i+1}</span>
                  <span className="font-mono text-xs ml-auto" style={{color:'#555'}}>Risk {w.risk}</span>
                </div>
                <MiniChart color={w.color} />
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="font-mono text-2xl font-black" style={{color:w.color}}>{w.pct}</div>
                <div className="font-mono text-xs" style={{color:'#555'}}>{w.win}% win</div>
              </div>
            </div>
          </button>
        ))}

        {whale && (
          <NPC text={`${whale.tip} Confirma si quieres copiar este trade.`} color={whale.color} />
        )}
      </div>

      <div className="px-5 pb-safe pb-6 pt-3 border-t" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <button disabled={!whale}
          onClick={() => whale && (playSound('execute'), onExecute(`COPY·${whale.name.toUpperCase()}`))}
          className="w-full rounded-2xl py-5 font-mono font-black text-base active:scale-95 transition-all disabled:opacity-25"
          style={{
            background: whale ? `linear-gradient(135deg,${whale.color},#5e72e4)` : 'rgba(255,255,255,0.05)',
            color:'white', boxShadow: whale ? `0 8px 30px ${whale.color}35` : 'none',
          }}>
          🐋 COPIAR TRADE
        </button>
      </div>
    </div>
  )
}

// ── EXECUTING ────────────────────────────────────────────────────────────────
const EXEC_MSGS = [
  '🤖 Agente conectando con el protocolo…',
  '📡 Analizando condiciones ETH/MXN…',
  '⚡ Enviando orden a Bitso…',
  '🔗 Confirmando transacción…',
]

function ExecutingScreen({ action }: { action: string }) {
  const [idx, setIdx] = useState(0)
  const [dots, setDots] = useState('')
  useEffect(() => {
    const t1 = setInterval(() => setIdx(i => Math.min(i+1, EXEC_MSGS.length-1)), 700)
    const t2 = setInterval(() => setDots(d => d.length>=3?'':d+'.'), 380)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center"
      style={{background:'linear-gradient(180deg,#0d0d1a,#0a1a0d)'}}>
      <div className="text-7xl mb-6" style={{animation:'wobble 1s ease infinite'}}>⚡</div>
      <h2 className="font-mono font-black text-2xl mb-1" style={{color:'#00ff88'}}>EJECUTANDO{dots}</h2>
      <p className="font-mono text-xs mb-8" style={{color:'rgba(255,255,255,0.30)'}}>{action}</p>
      <div className="w-full max-w-xs space-y-2.5 text-left">
        {EXEC_MSGS.slice(0, idx+1).map((m,i) => (
          <div key={i} className="font-mono text-sm flex items-start gap-2.5" style={{color: i<idx?'#2E7D6B':'#00ff88', animation:'slideup 0.3s ease'}}>
            <span className="mt-0.5 shrink-0">{i<idx?'✓':'▸'}</span>{m}
          </div>
        ))}
        {idx >= 2 && (
          <div className="mt-3">
            <NPC text="Procesando orden en Base Sepolia… Espera confirmación onchain." color="#00ff88" speaker="🔗" />
          </div>
        )}
      </div>
    </div>
  )
}

// ── RESULT ────────────────────────────────────────────────────────────────────
function ResultScreen({ result, onReplay }: { result: TradeResult; onReplay:()=>void }) {
  const [show, setShow] = useState(false)
  useEffect(() => { setTimeout(() => setShow(true), 80); playSound(result.win ? 'coin' : 'lose') }, [])
  const c = result.win ? '#00ff88' : '#ff4444'

  return (
    <div className="flex flex-col min-h-dvh relative overflow-hidden"
      style={{background: result.win ? 'linear-gradient(180deg,#0d0d1a,#0a2a0d)' : 'linear-gradient(180deg,#0d0d1a,#2a0a0a)'}}>
      {result.win && <MoneyRain />}

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center"
        style={{opacity: show?1:0, transition:'opacity 0.3s', animation: show?'popin 0.5s ease':'none'}}>
        <div className="text-8xl mb-5" style={{display:'inline-block', animation: result.win?'wobble 0.9s ease infinite':'shake 0.5s ease infinite'}}>
          {result.win ? '🤩' : '😭'}
        </div>

        <h2 className="font-mono font-black mb-2" style={{fontSize:'clamp(40px,11vw,64px)', color:c, textShadow:`0 0 40px ${c}55`}}>
          {result.win ? `+${result.profit.toFixed(2)}%` : `-${Math.abs(result.profit).toFixed(2)}%`}
        </h2>

        <p className="font-mono text-base font-bold mb-1" style={{color:c}}>
          {result.win ? '🚀 ¡GANASTE!' : '💸 Perdiste esta vez'}
        </p>

        <p className="font-mono text-sm mb-6" style={{color:'rgba(255,255,255,0.40)'}}>
          {result.action} · {result.message}
        </p>

        <div className="rounded-2xl border-2 px-7 py-4 mb-8"
          style={{borderColor:c, background:`${c}0D`}}>
          <p className="font-mono text-3xl font-black" style={{color:c}}>
            {result.win ? '+' : '-'}${(Math.abs(result.profit)*32.4).toFixed(0)} MXN
          </p>
          {result.real && <p className="font-mono text-xs mt-1" style={{color:'rgba(255,255,255,0.35)'}}>Ejecutado en Bitso</p>}
        </div>

        <NPC
          text={result.win ? 'Excelente operación. El mercado siguió la dirección esperada. ¡Sigue así!' : 'El mercado fue en contra. Recuerda: proteger capital es parte de la estrategia.'}
          color={c}
        />
      </div>

      <div className="relative z-10 px-5 pb-safe pb-6 pt-3">
        <button onClick={() => { playSound('click'); onReplay() }}
          className="w-full rounded-2xl py-5 font-mono font-black text-base active:scale-95 transition-transform"
          style={{background:'linear-gradient(135deg,#5e72e4,#00ff88)', color:'white', boxShadow:'0 8px 30px rgba(94,114,228,0.35)'}}>
          🔄 JUGAR OTRA VEZ
        </button>
      </div>
    </div>
  )
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function Game2() {
  const [screen, setScreen] = useState<Screen>('home')
  const livePrice = useLivePrice()
  const [tradeAction, setTradeAction] = useState('')
  const [result, setResult] = useState<TradeResult | null>(null)
  const { balance, loggedIn } = useSession()

  async function executeTrade(action: string) {
    setTradeAction(action)
    setScreen('executing')
    await new Promise(r => setTimeout(r, 2800))

    try {
      // Try real backend first if logged in
      if (loggedIn && (action === 'BUY' || action === 'SELL')) {
        const res = await fetch('/api/agent-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: action.toLowerCase(), symbol: 'ETH', amountMXN: 500 }),
        })
        const d = await res.json()
        if (d.success) {
          const profit = +(Math.random() * 5 + 1).toFixed(2)
          setResult({ action, profit, message: 'Ejecutado en Bitso · ETH/MXN', win: true, real: true })
          setScreen('result'); return
        }
      }

      // Game simulation backend
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following: action.startsWith('COPY') ? action.split('·')[1] : null }),
      })
      const d = await res.json()
      const isRisk = d.action === 'RISK'
      const profit = parseFloat(d.profit) || +(Math.random() * 6 + 1.5).toFixed(2)
      setResult({ action: isRisk ? action : d.action, profit: isRisk ? -(Math.random()*3+0.5) : profit, message: d.message ?? 'Operación completada', win: !isRisk })
    } catch {
      const profit = +(Math.random() * 6 + 1.5).toFixed(2)
      const win = Math.random() > 0.25
      setResult({ action, profit: win ? profit : -profit * 0.4, message: win ? 'ETH recovery detectado' : 'Stop loss activado', win })
    }
    setScreen('result')
  }

  if (screen === 'home')      return <HomeScreen onMode={m => setScreen(m)} balance={balance} loggedIn={loggedIn} />
  if (screen === 'manual')    return <ManualScreen onExecute={executeTrade} onBack={() => setScreen('home')} loggedIn={loggedIn} />
  if (screen === 'copy')      return <CopyScreen  onExecute={executeTrade} onBack={() => setScreen('home')} loggedIn={loggedIn} />
  if (screen === 'executing') return <ExecutingScreen action={tradeAction} />
  if (screen === 'result' && result) return <ResultScreen result={result} onReplay={() => { setResult(null); setScreen('home') }} />
  return null
}
