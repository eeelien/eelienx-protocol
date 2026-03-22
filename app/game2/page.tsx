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

// ── PIXEL ART ALIEN ───────────────────────────────────────────────────────────
function PixelAlien({ state = 'idle', size = 1 }: { state?: 'idle' | 'win' | 'lose'; size?: number }) {
  const S = size * 4
  const green = '#39ff14', dark = '#1a7a00', eye = '#000'
  type Px = [number,number,number,number,string]
  const base: Px[] = [
    [3,0,1,2,dark],[8,0,1,2,dark],[2,1,1,1,green],[9,1,1,1,green],
    [1,2,10,1,green],[0,3,12,5,green],
    [1,4,2,2,eye],[9,4,2,2,eye],
    [5,6,2,1,dark],
    [1,8,10,3,green],[0,8,1,2,green],[11,8,1,2,green],
    [0,10,2,1,dark],[10,10,2,1,dark],
    [2,11,2,3,green],[8,11,2,3,green],
    [1,13,2,1,dark],[9,13,2,1,dark],
    [1,14,3,1,green],[8,14,3,1,green],
  ]
  const mouth: Px[] = state === 'win'
    ? [[2,7,1,1,'#fff'],[3,7,5,1,'#fff'],[7,7,1,1,'#fff']]
    : state === 'lose'
    ? [[3,7,5,1,'#555'],[3,8,1,1,'#555'],[7,8,1,1,'#555']]
    : [[2,7,1,1,'#0f0'],[3,7,5,1,'#0f0'],[7,7,1,1,'#0f0']]
  const pixels = [...base, ...mouth]
  const W = 12*S, H = 15*S
  const anim = state === 'win' ? 'alien-jump 0.45s ease infinite alternate'
             : state === 'lose' ? 'alien-sag 1.8s ease infinite alternate'
             : 'alien-bob 2s ease infinite alternate'
  return (
    <svg width={W} height={H} style={{ imageRendering:'pixelated', display:'block', animation: anim }}>
      {pixels.map(([x,y,w,h,fill],i) => <rect key={i} x={x*S} y={y*S} width={w*S} height={h*S} fill={fill} />)}
    </svg>
  )
}


// ── AVATAR HERO ───────────────────────────────────────────────────────────────
function AvatarHero({ state = 'idle', size = 120 }: { state?: 'idle'|'win'|'lose'; size?: number }) {
  const anim = state === 'win'  ? 'alien-jump 0.45s ease infinite alternate'
             : state === 'lose' ? 'alien-sag 1.8s ease infinite alternate'
             : 'alien-bob 2s ease infinite alternate'
  const glow = state === 'win'  ? '0 0 30px rgba(0,255,136,0.6), 0 0 60px rgba(0,255,136,0.3)'
             : state === 'lose' ? '0 0 20px rgba(255,68,68,0.4)'
             : '0 0 20px rgba(94,114,228,0.5), 0 0 40px rgba(94,114,228,0.2)'
  return (
    <div style={{ position:'relative', display:'inline-block', animation: anim }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        overflow:'hidden', border: '3px solid',
        borderColor: state==='win' ? '#00ff88' : state==='lose' ? '#ff4444' : '#5e72e4',
        boxShadow: glow,
        position:'relative',
      }}>
        <img src="/avatar.jpg" alt="39eliens"
          style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display='none' }}
        />
      </div>
      {state === 'win' && (
        <div style={{ position:'absolute', top:-8, right:-8, fontSize:20, animation:'alien-jump 0.4s ease infinite alternate' }}>🏆</div>
      )}
      {state === 'lose' && (
        <div style={{ position:'absolute', top:-8, right:-8, fontSize:20 }}>😢</div>
      )}
    </div>
  )
}

// ── PIXEL SPACESHIP ───────────────────────────────────────────────────────────
function PixelShip({ size = 1 }: { size?: number }) {
  const S = size * 4
  type Px = [number,number,number,number,string]
  const pixels: Px[] = [
    [4,0,4,2,'#7B2FFF'],[5,0,2,2,'#d0aaff'],
    [2,2,8,3,'#00ffff'],[0,3,12,2,'#00ffff'],[1,5,10,1,'#00ffff'],
    [0,4,2,3,'#0099cc'],[10,4,2,3,'#0099cc'],
    [3,6,2,2,'#f5a623'],[7,6,2,2,'#f5a623'],
    [4,7,1,1,'#fff'],[8,7,1,1,'#fff'],
  ]
  return (
    <svg width={12*S} height={8*S} style={{ imageRendering:'pixelated', display:'block',
      animation:'ship-patrol 6s linear infinite', filter:'drop-shadow(0 0 8px #00ffff90)' }}>
      {pixels.map(([x,y,w,h,fill],i) => <rect key={i} x={x*S} y={y*S} width={w*S} height={h*S} fill={fill} />)}
    </svg>
  )
}

// ── MONEY BURST (win) ─────────────────────────────────────────────────────────
function MoneyBurst() {
  const bills = ['💵','💰','💸','🤑','💵','💸','💰','🤑']
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
      {bills.map((b,i) => (
        <div key={i} style={{
          position:'absolute', left:`${8+i*11}%`, top:'-5%',
          fontSize:`${18+(i%3)*10}px`,
          animation:`bill-fall ${0.9+i*0.12}s ${i*0.08}s linear infinite`,
        }}>{b}</div>
      ))}
    </div>
  )
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
type Screen = 'home' | 'path' | 'plans' | 'command' | 'manual' | 'copy' | 'hodl' | 'hodlscreen' | 'stocks' | 'executing' | 'result'
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
function HomeScreen({ onMode, balance, loggedIn, wallet }: { onMode: (m: 'manual'|'copy'|'plans') => void; balance: { mxn?: number; eth?: number } | null; loggedIn: boolean; wallet: ReturnType<typeof useWallet> }) {
  const [blink, setBlink] = useState(true)
  useEffect(() => { const t = setInterval(() => setBlink(b => !b), 550); return () => clearInterval(t) }, [])

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'linear-gradient(180deg,#0d0d1a 0%,#120d24 55%,#0d1a14 100%)' }}>
      <style>{`
        @keyframes alien-bob  { from { transform: translateY(0); } to { transform: translateY(-6px); } }
        @keyframes alien-jump { from { transform: translateY(0) rotate(-5deg); } to { transform: translateY(-18px) rotate(5deg); } }
        @keyframes alien-sag  { from { transform: rotate(-3deg) translateY(0); } to { transform: rotate(3deg) translateY(4px); } }
        @keyframes ship-float { from { transform: translateX(-4px) translateY(-2px); } to { transform: translateX(4px) translateY(2px); } }
        @keyframes bill-fall  { 0% { transform: translateY(0) rotate(0deg); opacity:1; } 100% { transform: translateY(110vh) rotate(360deg); opacity:0; } }
      `}</style>
      {/* Universe background: static stars + warp burst from ship */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <style>{`
          @keyframes warp-star { 0%{opacity:0;transform:var(--t0)} 15%{opacity:1} 80%{opacity:0.6} 100%{opacity:0;transform:var(--t1)} }
          @keyframes ship-patrol { 0%{transform:translateX(-10px) translateY(0) rotate(-5deg)} 20%{transform:translateX(10px) translateY(-8px) rotate(5deg)} 40%{transform:translateX(-5px) translateY(-15px) rotate(0deg)} 60%{transform:translateX(15px) translateY(-5px) rotate(8deg)} 80%{transform:translateX(-10px) translateY(3px) rotate(-3deg)} 100%{transform:translateX(-10px) translateY(0) rotate(-5deg)} }
          @keyframes twinkle { 0%,100%{opacity:0.2} 50%{opacity:0.9} }
          @keyframes cursor-ship { }
        `}</style>
        {/* Static background stars — full universe coverage */}
        {Array.from({length:80}).map((_,i) => (
          <div key={`bg-${i}`} style={{
            position:'absolute',
            left:`${(i*7.3+i*i*0.11)%100}%`,
            top:`${(i*11.7+i*3.1)%100}%`,
            width: i%9===0?3:i%4===0?2:1.2,
            height: i%9===0?3:i%4===0?2:1.2,
            borderRadius:'50%',
            background: i%5===0?'rgba(180,200,255,0.9)':i%3===0?'rgba(255,255,220,0.7)':'rgba(200,220,255,0.6)',
            animation:`twinkle ${3+i%4}s ${(i*0.4)%4}s ease-in-out infinite`,
          }} />
        ))}
        {Array.from({length:55}).map((_,i) => {
          const angle = (i/55)*360
          const rad   = (angle*Math.PI)/180
          const vmax  = 65
          const dx0   = Math.cos(rad)*5, dy0 = Math.sin(rad)*5
          const dx1   = Math.cos(rad)*vmax*1.2, dy1 = Math.sin(rad)*vmax*1.2
          const dur   = 1.3 + (i%5)*0.3
          const delay = (i*0.065)%3.2
          const size  = i%7===0 ? 2.2 : 1.4
          return (
            <div key={i} style={{
              position:'absolute', left:'50%', top:'40%',
              width: size*0.6, height: size,
              borderRadius: 3,
              background: i%4===0?'rgba(150,180,255,0.95)':i%3===0?'rgba(255,255,200,0.7)':'rgba(210,225,255,0.8)',
              // @ts-ignore
              '--t0': `translate(calc(-50% + ${dx0}px), calc(-50% + ${dy0}px)) scaleX(1)`,
              '--t1': `translate(calc(-50% + ${dx1}px), calc(-50% + ${dy1}px)) scaleX(5)`,
              animation: `warp-star ${dur}s ${delay}s linear infinite`,
              pointerEvents: 'none',
            }} />
          )
        })}
      </div>

      {/* Avatar badge top-left */}
      <div className="fixed top-4 left-4 z-50" style={{filter:'drop-shadow(0 0 8px rgba(94,114,228,0.6))'}}>
        <div style={{width:40,height:40,borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(94,114,228,0.7)'}}>
          <img src="/avatar.jpg" alt="39eliens" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}} />
        </div>
      </div>
      {/* Wallet + Balance row */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-safe pt-4">
        <div /> {/* spacer */}
        <div className="flex items-center gap-2">
          {loggedIn && balance && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border" style={{ background:'rgba(0,255,136,0.08)',borderColor:'rgba(0,255,136,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="font-mono text-[10px]" style={{color:'#00ff88'}}>
                {balance.mxn ? `$${balance.mxn.toFixed(0)} MXN` : 'Bitso ✓'}
              </span>
            </div>
          )}
          {wallet.address ? (
            <button onClick={wallet.disconnect}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border active:scale-95 transition-all"
              style={{ background:'rgba(245,166,35,0.08)', borderColor:'rgba(245,166,35,0.30)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
              <span className="font-mono text-[10px]" style={{color:'#f5a623'}}>
                🦊 {wallet.short}{wallet.ethBalance ? ` · ${wallet.ethBalance} ETH` : ''}
              </span>
            </button>
          ) : (
            <button onClick={wallet.connect} disabled={wallet.connecting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border active:scale-95 transition-all disabled:opacity-50"
              style={{ background:'rgba(245,166,35,0.06)', borderColor:'rgba(245,166,35,0.25)' }}>
              <span className="font-mono text-[10px]" style={{color:'#f5a623'}}>
                {wallet.connecting ? '🦊 Conectando…' : '🦊 Conectar Wallet'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center" style={{animation:'popin 0.6s ease'}}>
        {/* Spaceship — leads the warp stars */}
        <div className="mb-3" style={{filter:'drop-shadow(0 0 20px rgba(94,114,228,0.9))',animation:'ship-patrol 6s linear infinite'}}>
          <PixelShip size={3} />
        </div>

        <h1 className="font-mono font-black text-4xl mb-0.5" style={{ color:'#5e72e4', textShadow:'0 0 40px #5e72e470', letterSpacing:2 }}>
          eelie<span style={{color:'#fff'}}>n</span>X <span style={{color:'rgba(255,255,255,0.5)',fontSize:'0.6em',letterSpacing:1}}>Protocol</span>
        </h1>
        <p className="font-mono text-xs tracking-widest mb-6" style={{color:'rgba(255,255,255,0.30)'}}>AGENT TRADING WORLD</p>

        {/* Ship guide */}
        <div className="flex items-center gap-3 mb-4">
          <PixelShip size={1} />
          <p className="font-mono text-sm" style={{color: blink ? '#00ffff' : 'rgba(0,255,255,0.3)', transition:'color 0.1s'}}>
            ▶ ELIGE TU MODO ◀
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button onClick={() => { playSound('click'); onMode('copy') }}
            className="relative rounded-2xl border-2 py-5 px-6 font-mono font-black text-base active:scale-95 transition-transform"
            style={{ borderColor:'#f5a623', color:'#f5a623', background:'rgba(245,166,35,0.06)', textShadow:'0 0 12px #f5a62360' }}>
            🐋 COPY TRADING
            <span className="block font-normal text-xs mt-0.5 opacity-55">Gana fácil copiando a los mejores traders 🏆</span>
          </button>

          <button onClick={() => { playSound('click'); onMode('manual') }}
            className="relative rounded-2xl border-2 py-5 px-6 font-mono font-black text-base active:scale-95 transition-transform"
            style={{ borderColor:'#00ff88', color:'#00ff88', background:'rgba(0,255,136,0.06)', textShadow:'0 0 12px #00ff8860' }}>
            🎮 MODO EXPERTO
            <span className="block font-normal text-xs mt-0.5 opacity-55">Dale órdenes a tu agente — él ejecuta las posiciones 🧠</span>
          </button>

          <a href="/academia" onClick={() => playSound('click')}
            className="relative rounded-2xl border-2 py-4 px-6 font-mono font-black text-base active:scale-95 transition-transform text-center block"
            style={{ borderColor:'#5e72e4', color:'#5e72e4', background:'rgba(94,114,228,0.06)', textShadow:'0 0 12px #5e72e460' }}>
            📊 ACADEMIA
            <span className="block font-normal text-xs mt-0.5 opacity-55">Aprende a analizar gráficas como los pros</span>
          </a>

          {/* Manual + Academia row */}
          <div className="flex gap-3 w-full">
            <button onClick={() => { playSound('click'); onMode('manual') }}
              className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl border active:scale-95 transition-all"
              style={{borderColor:'rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.04)'}}>
              <span className="text-xl">🎮</span>
              <span className="font-mono text-xs font-bold text-white">Manual</span>
              <span className="font-mono text-[9px]" style={{color:'rgba(255,255,255,0.35)'}}>Tú decides</span>
            </button>
            <a href="/academia"
              className="flex-1 flex flex-col items-center gap-1 py-4 rounded-2xl border active:scale-95 transition-all"
              style={{borderColor:'rgba(94,114,228,0.35)',background:'rgba(94,114,228,0.06)'}}>
              <span className="text-xl">📊</span>
              <span className="font-mono text-xs font-bold" style={{color:'#5e72e4'}}>Academia</span>
              <span className="font-mono text-[9px]" style={{color:'rgba(255,255,255,0.35)'}}>Aprende</span>
            </a>
          </div>
          {/* Plans button */}
          <button onClick={() => { playSound('click'); onMode('plans') }}
            className="w-full py-3 rounded-2xl border font-mono text-xs active:scale-95 transition-all"
            style={{borderColor:'rgba(0,255,136,0.20)',color:'rgba(255,255,255,0.50)',background:'transparent'}}>
            💳 Ver planes · Free / $99 Pro / $299 Autopilot
          </button>
          {!loggedIn && !wallet.address && (
            <a href="/login" className="text-center font-mono text-xs py-1" style={{color:'rgba(255,255,255,0.18)'}}>
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


// ── METAMASK WALLET HOOK ───────────────────────────────────────────────────────
function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [ethBalance, setEthBalance] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    // Restore from localStorage
    const saved = localStorage.getItem('eelienx_wallet')
    if (saved) {
      setAddress(saved)
      fetchBalance(saved)
    }
  }, [])

  const fetchBalance = async (addr: string) => {
    try {
      // Use public Ethereum RPC to get ETH balance
      const res = await fetch('https://cloudflare-eth.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc:'2.0', method:'eth_getBalance', params:[addr,'latest'], id:1 }),
      })
      const d = await res.json()
      if (d.result) {
        const wei = parseInt(d.result, 16)
        const eth = (wei / 1e18).toFixed(4)
        setEthBalance(eth)
      }
    } catch { /* silent */ }
  }

  const connect = async () => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    // Prefer MetaMask, fallback to any ethereum provider
    const eth = w.ethereum
    // Phantom injects window.ethereum too — any EIP-1193 provider works
    if (!eth) {
      alert('🦊 Necesitas una wallet Ethereum para conectar.\nInstala MetaMask: https://metamask.io\n\n(Phantom también funciona si activas su red Ethereum)')
      return
    }
    setConnecting(true)
    try {
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' })
      if (accounts[0]) {
        setAddress(accounts[0])
        localStorage.setItem('eelienx_wallet', accounts[0])
        fetchBalance(accounts[0])
        playSound('coin')
      }
    } catch { /* user rejected */ }
    finally { setConnecting(false) }
  }

  const disconnect = () => {
    setAddress(null)
    setEthBalance(null)
    localStorage.removeItem('eelienx_wallet')
  }

  const short = address ? `${address.slice(0,6)}…${address.slice(-4)}` : null

  return { address, ethBalance, connecting, connect, disconnect, short }
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


// ── PATH SELECTOR ─────────────────────────────────────────────────────────────
function PathScreen({ onPath, wallet, balance, loggedIn }: {
  onPath: (p: 'quick'|'long'|'manual'|'plans') => void
  wallet: ReturnType<typeof useWallet>; balance: { mxn?: number; eth?: number } | null; loggedIn: boolean
}) {
  const [blink, setBlink] = useState(true)
  useEffect(() => { const t = setInterval(() => setBlink(b => !b), 600); return () => clearInterval(t) }, [])
  return (
    <div className="flex flex-col min-h-dvh" style={{ background: 'linear-gradient(180deg,#0d0d1a 0%,#120d24 55%,#0d1a14 100%)' }}>
      {/* Universe background: static stars + warp burst from ship */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <style>{`
          @keyframes warp-star { 0%{opacity:0;transform:var(--t0)} 15%{opacity:1} 80%{opacity:0.6} 100%{opacity:0;transform:var(--t1)} }
          @keyframes ship-patrol { 0%{transform:translateX(-10px) translateY(0) rotate(-5deg)} 20%{transform:translateX(10px) translateY(-8px) rotate(5deg)} 40%{transform:translateX(-5px) translateY(-15px) rotate(0deg)} 60%{transform:translateX(15px) translateY(-5px) rotate(8deg)} 80%{transform:translateX(-10px) translateY(3px) rotate(-3deg)} 100%{transform:translateX(-10px) translateY(0) rotate(-5deg)} }
          @keyframes twinkle { 0%,100%{opacity:0.2} 50%{opacity:0.9} }
          @keyframes cursor-ship { }
        `}</style>
        {/* Static background stars — full universe coverage */}
        {Array.from({length:80}).map((_,i) => (
          <div key={`bg-${i}`} style={{
            position:'absolute',
            left:`${(i*7.3+i*i*0.11)%100}%`,
            top:`${(i*11.7+i*3.1)%100}%`,
            width: i%9===0?3:i%4===0?2:1.2,
            height: i%9===0?3:i%4===0?2:1.2,
            borderRadius:'50%',
            background: i%5===0?'rgba(180,200,255,0.9)':i%3===0?'rgba(255,255,220,0.7)':'rgba(200,220,255,0.6)',
            animation:`twinkle ${3+i%4}s ${(i*0.4)%4}s ease-in-out infinite`,
          }} />
        ))}
        {Array.from({length:55}).map((_,i) => {
          const angle = (i/55)*360
          const rad   = (angle*Math.PI)/180
          const vmax  = 65
          const dx0   = Math.cos(rad)*5, dy0 = Math.sin(rad)*5
          const dx1   = Math.cos(rad)*vmax*1.2, dy1 = Math.sin(rad)*vmax*1.2
          const dur   = 1.3 + (i%5)*0.3
          const delay = (i*0.065)%3.2
          const size  = i%7===0 ? 2.2 : 1.4
          return (
            <div key={i} style={{
              position:'absolute', left:'50%', top:'40%',
              width: size*0.6, height: size,
              borderRadius: 3,
              background: i%4===0?'rgba(150,180,255,0.95)':i%3===0?'rgba(255,255,200,0.7)':'rgba(210,225,255,0.8)',
              // @ts-ignore
              '--t0': `translate(calc(-50% + ${dx0}px), calc(-50% + ${dy0}px)) scaleX(1)`,
              '--t1': `translate(calc(-50% + ${dx1}px), calc(-50% + ${dy1}px)) scaleX(5)`,
              animation: `warp-star ${dur}s ${delay}s linear infinite`,
              pointerEvents: 'none',
            }} />
          )
        })}
      </div>

      {/* Avatar badge top-left */}
      <div className="fixed top-4 left-4 z-50" style={{filter:'drop-shadow(0 0 8px rgba(94,114,228,0.6))'}}>
        <div style={{width:40,height:40,borderRadius:'50%',overflow:'hidden',border:'2px solid rgba(94,114,228,0.7)'}}>
          <img src="/avatar.jpg" alt="39eliens" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}} />
        </div>
      </div>
      {/* Wallet badge */}
      <div className="relative z-10 flex justify-end px-5 pt-safe pt-4">
        {wallet.address ? (
          <button onClick={wallet.disconnect} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border"
            style={{ background:'rgba(245,166,35,0.08)', borderColor:'rgba(245,166,35,0.30)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
            <span className="font-mono text-[10px]" style={{color:'#f5a623'}}>🦊 {wallet.short}</span>
          </button>
        ) : (
          <div className="flex flex-col items-end gap-0.5">
            <button onClick={wallet.connect} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
              style={{ background:'rgba(245,166,35,0.06)', borderColor:'rgba(245,166,35,0.25)' }}>
              <span className="font-mono text-[10px]" style={{color:'#f5a623'}}>🦊 Conectar Wallet</span>
            </button>
            <span className="font-mono text-[8px]" style={{color:'rgba(255,255,255,0.25)'}}>Solo lectura · tus fondos están seguros 🔒</span>
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col items-center flex-1 px-6 text-center gap-4 overflow-y-auto py-4 pb-12">
        {/* Alien */}
        <div style={{filter:'drop-shadow(0 0 12px #39ff1460)'}}>
          <PixelShip size={2} />
        </div>
        <h1 className="font-mono font-black text-4xl mb-0.5" style={{ color:'#5e72e4', textShadow:'0 0 40px #5e72e470', letterSpacing:2 }}>
          eelie<span style={{color:'#fff'}}>n</span>X <span style={{color:'rgba(255,255,255,0.5)',fontSize:'0.6em',letterSpacing:1}}>Protocol</span>
        </h1>
        <p className="font-mono font-bold text-center px-4 leading-snug" style={{color:'#00ff88',fontSize:'0.85rem'}}>
          El agente que trabaja por tí.<br/><span style={{color:'rgba(255,255,255,0.7)'}}>Sólo conecta tu wallet y listo!! 🚀</span>
        </p>

        {/* Agent live status */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{background:'rgba(0,255,136,0.06)',border:'1px solid rgba(0,255,136,0.20)'}}>
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="font-mono text-[10px]" style={{color:'#00ff88'}}>Agente activo · ETH/MXN · Bankr · Locus · Base</span>
        </div>

        {/* Two big paths */}
        <div className="flex flex-col gap-4 w-full max-w-sm mt-2">
          <button onClick={() => { playSound('click'); onPath('quick') }}
            className="rounded-2xl border-2 py-4 px-5 text-left active:scale-95 transition-all"
            style={{ borderColor:'#f5a623', background:'rgba(245,166,35,0.06)' }}>
            <p className="font-mono text-xl font-black mb-1" style={{color:'#f5a623'}}>🚀 Quiero dinero</p>
            <p className="font-mono text-xl font-black mb-2" style={{color:'#f5a623'}}>rápido y fácil</p>
            <p className="font-mono text-xs" style={{color:'rgba(255,255,255,0.40)'}}>Copia traders top o dale órdenes a tu agente — opera ETH/MXN en tiempo real</p>
          </button>

          <button onClick={() => { playSound('click'); onPath('long') }}
            className="rounded-2xl border-2 py-4 px-5 text-left active:scale-95 transition-all"
            style={{ borderColor:'#00ff88', background:'rgba(0,255,136,0.06)' }}>
            <p className="font-mono text-xl font-black mb-1" style={{color:'#00ff88'}}>💎 Quiero dinero</p>
            <p className="font-mono text-xl font-black mb-2" style={{color:'#00ff88'}}>seguro a largo plazo</p>
            <p className="font-mono text-xs" style={{color:'rgba(255,255,255,0.40)'}}>Copia los portafolios de los mejores HODLers e inversores del mundo — el agente automatiza todo</p>
          </button>

          {/* Row: Manual + Academia + Plans */}
          <div className="flex gap-2 w-full">
            <button onClick={() => { playSound('click'); onPath('manual') }}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border active:scale-95 transition-all"
              style={{borderColor:'rgba(255,255,255,0.12)',background:'rgba(255,255,255,0.03)'}}>
              <span className="text-lg">🎮</span>
              <span className="font-mono text-[10px] font-bold text-white">Manual</span>
            </button>
            <a href="/academia"
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border active:scale-95 transition-all"
              style={{borderColor:'rgba(94,114,228,0.30)',background:'rgba(94,114,228,0.05)'}}>
              <span className="text-lg">📊</span>
              <span className="font-mono text-[10px] font-bold" style={{color:'#5e72e4'}}>Academia</span>
            </a>
            <button onClick={() => { playSound('click'); onPath('plans') }}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border active:scale-95 transition-all"
              style={{borderColor:'rgba(0,255,136,0.25)',background:'rgba(0,255,136,0.04)'}}>
              <span className="text-lg">💳</span>
              <span className="font-mono text-[10px] font-bold" style={{color:'#00ff88'}}>Planes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── HODL SCREEN ───────────────────────────────────────────────────────────────
const HODLERS = [
  {
    name: 'Michael Saylor',
    handle: '@saylor',
    emoji: '🟧',
    color: '#F7931A',
    title: 'Bitcoin Maximalist',
    holding: '214,246 BTC',
    gain1y: '+127%',
    strategy: 'Never sell. Accumulate Bitcoin every month. Ignore volatility.',
    portfolio: [
      { asset: 'BTC', alloc: 95, color: '#F7931A' },
      { asset: 'USD', alloc: 5,  color: '#555' },
    ],
  },
  {
    name: 'Cathie Wood',
    handle: '@cathiedwood',
    emoji: '🏹',
    color: '#7B2FFF',
    title: 'Innovation HODLer',
    holding: 'ETH + BTC + alts',
    gain1y: '+84%',
    strategy: 'Hold disruptive assets 5–10 years. Add on dips. DCA monthly.',
    portfolio: [
      { asset: 'ETH', alloc: 45, color: '#7B2FFF' },
      { asset: 'BTC', alloc: 35, color: '#F7931A' },
      { asset: 'SOL', alloc: 20, color: '#14F195' },
    ],
  },
  {
    name: 'Vitalik Buterin',
    handle: '@vitalikbuterin',
    emoji: '🔷',
    color: '#627EEA',
    title: 'ETH Ecosystem',
    holding: 'ETH + L2s + DeFi',
    gain1y: '+93%',
    strategy: 'Believe in the ecosystem. Hold ETH + stake for yield. Diversify into L2 tokens.',
    portfolio: [
      { asset: 'ETH', alloc: 70, color: '#627EEA' },
      { asset: 'L2s', alloc: 20, color: '#00D4FF' },
      { asset: 'DeFi', alloc: 10, color: '#00ff88' },
    ],
  },
]

function HodlScreen({ onExecute, onBack }: { onExecute: (a:string)=>void; onBack:()=>void }) {
  const [sel, setSel] = useState<number|null>(null)
  const [amount, setAmount] = useState('500')
  const [confirm, setConfirm] = useState(false)
  const hodler = sel !== null ? HODLERS[sel] : null

  return (
    <div className="flex flex-col min-h-dvh" style={{background:'#0d0d1a'}}>
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-3 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <button onClick={onBack} className="font-mono text-xs active:opacity-60 p-1" style={{color:'#555'}}>← VOLVER</button>
        <span className="font-mono text-sm font-bold" style={{color:'#00ff88'}}>💎 HODL STRATEGY</span>
        <span className="font-mono text-[10px]" style={{color:'rgba(255,255,255,0.25)'}}>LARGO PLAZO</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 px-5 py-4 overflow-y-auto pb-28">
        <div className="text-center py-2">
          <p className="font-mono text-sm font-black text-white mb-0.5">Los mejores HODLers del mundo</p>
          <p className="font-mono text-[10px]" style={{color:'rgba(255,255,255,0.30)'}}>El agente copia sus portafolios automáticamente · Solo pide tu permiso una vez</p>
        </div>

        {HODLERS.map((h, i) => (
          <button key={h.name} onClick={() => { playSound('click'); setSel(i); setConfirm(false) }}
            className="w-full rounded-2xl border-2 p-4 text-left active:scale-[0.98] transition-all"
            style={{ borderColor: sel===i ? h.color : 'rgba(255,255,255,0.07)', background: sel===i ? `${h.color}10` : 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{h.emoji}</span>
                <div>
                  <p className="font-mono text-sm font-black text-white">{h.name}</p>
                  <p className="font-mono text-[9px]" style={{color:'rgba(255,255,255,0.35)'}}>{h.handle} · {h.title}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-black" style={{color:'#00ff88'}}>{h.gain1y}</p>
                <p className="font-mono text-[9px]" style={{color:'rgba(255,255,255,0.30)'}}>últimos 12m</p>
              </div>
            </div>
            {/* Portfolio bar */}
            <div className="flex rounded-full overflow-hidden h-2 mb-2">
              {h.portfolio.map(p => (
                <div key={p.asset} style={{width:`${p.alloc}%`, background:p.color}} />
              ))}
            </div>
            <div className="flex gap-3">
              {h.portfolio.map(p => (
                <span key={p.asset} className="font-mono text-[9px]" style={{color:p.color}}>{p.asset} {p.alloc}%</span>
              ))}
            </div>
          </button>
        ))}

        {hodler && (
          <div className="rounded-2xl border p-4" style={{background:'rgba(0,255,136,0.04)',borderColor:'rgba(0,255,136,0.20)'}}>
            <p className="font-mono text-[10px] mb-2" style={{color:'rgba(255,255,255,0.55)'}}>🧠 Estrategia: <span style={{color:'#00ff88'}}>"{hodler.strategy}"</span></p>
            <p className="font-mono text-[9px] mb-3" style={{color:'rgba(255,255,255,0.35)'}}>El agente comprará automáticamente los mismos activos en las mismas proporciones. DCA mensual.</p>
            <p className="font-mono text-xs font-bold text-white mb-2">¿Cuánto quieres invertir al mes?</p>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['200','500','1000','2000'].map(v => (
                <button key={v} onClick={() => setAmount(v)}
                  className="rounded-xl py-2 font-mono text-xs font-bold transition-all"
                  style={{background: amount===v ? hodler.color : 'rgba(255,255,255,0.06)', color: amount===v ? 'white' : 'rgba(255,255,255,0.45)'}}>
                  ${v}
                </button>
              ))}
            </div>
            {/* Permission confirm */}
            <div
              onClick={() => setConfirm(c => !c)}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-4 border cursor-pointer"
              style={{borderColor: confirm ? '#00ff88' : 'rgba(255,255,255,0.18)', background: confirm ? 'rgba(0,255,136,0.10)' : 'rgba(255,255,255,0.03)', minHeight:60}}>
              <div className="flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center"
                style={{borderColor: confirm ? '#00ff88' : 'rgba(255,255,255,0.30)', background: confirm ? '#00ff88' : 'transparent'}}>
                {confirm && <span style={{color:'#000',fontSize:14,lineHeight:1,fontWeight:900}}>✓</span>}
              </div>
              <span className="font-mono text-xs text-left leading-snug" style={{color: confirm ? '#00ff88' : 'rgba(255,255,255,0.55)'}}>
                Autorizo al agente a ejecutar <span style={{color:confirm?'#fff':'rgba(255,255,255,0.9)',fontWeight:900}}>${'{'}amount{'}'} MXN/mes</span> en este portafolio
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-safe pb-6 pt-3 border-t" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <button disabled={!hodler || !confirm}
          onClick={() => { playSound('execute'); onExecute(`HODL·${hodler!.name.toUpperCase()}·${amount}MXN`) }}
          className="w-full rounded-2xl py-5 font-mono font-black text-base active:scale-95 transition-all disabled:opacity-25"
          style={{
            background: (hodler && confirm) ? `linear-gradient(135deg,#00ff88,${hodler.color})` : 'rgba(255,255,255,0.05)',
            color:'white', boxShadow: (hodler && confirm) ? '0 8px 30px rgba(0,255,136,0.30)' : 'none',
          }}>
          {hodler && confirm ? `💎 Activar HODL · ${hodler.name} · $${amount}/mes` : hodler ? '⬆ Autoriza para continuar' : '💎 Elige un HODLer'}
        </button>
      </div>
    </div>
  )
}

// ── STOCKS SCREEN ─────────────────────────────────────────────────────────────
const STOCK_INVESTORS = [
  {
    name: 'Warren Buffett',
    handle: '@berkshire',
    emoji: '🏦',
    color: '#2E7D6B',
    title: 'Value Investing',
    gain1y: '+21%',
    strategy: 'Buy great companies at fair prices. Hold forever. Dividends are king.',
    portfolio: [
      { asset: 'AAPL', alloc: 45, color: '#A8B2C1' },
      { asset: 'BAC',  alloc: 15, color: '#2E7D6B' },
      { asset: 'KO',   alloc: 10, color: '#C0392B' },
      { asset: 'OXY',  alloc: 30, color: '#B85C00' },
    ],
  },
  {
    name: 'Ray Dalio',
    handle: '@raydalio',
    emoji: '⚖️',
    color: '#5e72e4',
    title: 'All Weather Portfolio',
    gain1y: '+18%',
    strategy: 'Diversify across all economic environments. 30% stocks, 40% bonds, 30% commodities + gold.',
    portfolio: [
      { asset: 'SPY',  alloc: 30, color: '#5e72e4' },
      { asset: 'GOLD', alloc: 25, color: '#F3BA2F' },
      { asset: 'BOND', alloc: 30, color: '#888' },
      { asset: 'COMM', alloc: 15, color: '#B85C00' },
    ],
  },
  {
    name: 'Cathie Wood',
    handle: '@cathiedwood',
    emoji: '🚀',
    color: '#7B2FFF',
    title: 'Disruptive Innovation',
    gain1y: '+67%',
    strategy: 'Bet on the future: AI, robotics, genomics, fintech. 5-year minimum horizon.',
    portfolio: [
      { asset: 'TSLA', alloc: 25, color: '#CC0000' },
      { asset: 'NVDA', alloc: 20, color: '#76B900' },
      { asset: 'COIN', alloc: 15, color: '#0052FF' },
      { asset: 'MSTR', alloc: 40, color: '#F7931A' },
    ],
  },
]

function StocksScreen({ onExecute, onBack }: { onExecute: (a:string)=>void; onBack:()=>void }) {
  const [sel, setSel] = useState<number|null>(null)
  const [amount, setAmount] = useState('500')
  const [confirm, setConfirm] = useState(false)
  const investor = sel !== null ? STOCK_INVESTORS[sel] : null

  return (
    <div className="flex flex-col min-h-dvh" style={{background:'#0d0d1a'}}>
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-3 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <button onClick={onBack} className="font-mono text-xs active:opacity-60 p-1" style={{color:'#555'}}>← VOLVER</button>
        <span className="font-mono text-sm font-bold" style={{color:'#5e72e4'}}>📈 ACCIONES</span>
        <span className="font-mono text-[10px]" style={{color:'rgba(255,255,255,0.25)'}}>LARGO PLAZO</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 px-5 py-4 overflow-y-auto pb-28">
        <div className="text-center py-2">
          <p className="font-mono text-sm font-black text-white mb-0.5">Los mejores inversores del mundo</p>
          <p className="font-mono text-[10px]" style={{color:'rgba(255,255,255,0.30)'}}>El agente copia sus posiciones · Solo pide permiso para tomar el dinero y ejecutar</p>
        </div>

        {STOCK_INVESTORS.map((inv, i) => (
          <button key={inv.name} onClick={() => { playSound('click'); setSel(i); setConfirm(false) }}
            className="w-full rounded-2xl border-2 p-4 text-left active:scale-[0.98] transition-all"
            style={{ borderColor: sel===i ? inv.color : 'rgba(255,255,255,0.07)', background: sel===i ? `${inv.color}10` : 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{inv.emoji}</span>
                <div>
                  <p className="font-mono text-sm font-black text-white">{inv.name}</p>
                  <p className="font-mono text-[9px]" style={{color:'rgba(255,255,255,0.35)'}}>{inv.handle} · {inv.title}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-black" style={{color:'#5e72e4'}}>{inv.gain1y}</p>
                <p className="font-mono text-[9px]" style={{color:'rgba(255,255,255,0.30)'}}>últimos 12m</p>
              </div>
            </div>
            <div className="flex rounded-full overflow-hidden h-2 mb-2">
              {inv.portfolio.map(p => <div key={p.asset} style={{width:`${p.alloc}%`, background:p.color}} />)}
            </div>
            <div className="flex gap-3 flex-wrap">
              {inv.portfolio.map(p => (
                <span key={p.asset} className="font-mono text-[9px]" style={{color:p.color}}>{p.asset} {p.alloc}%</span>
              ))}
            </div>
          </button>
        ))}

        {investor && (
          <div className="rounded-2xl border p-4" style={{background:'rgba(94,114,228,0.05)',borderColor:'rgba(94,114,228,0.20)'}}>
            <p className="font-mono text-[10px] mb-2" style={{color:'rgba(255,255,255,0.55)'}}>🧠 Estrategia: <span style={{color:'#5e72e4'}}>"{investor.strategy}"</span></p>
            <p className="font-mono text-xs font-bold text-white mb-2">¿Cuánto quieres invertir al mes?</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['200','500','1000','2000'].map(v => (
                <button key={v} onClick={() => setAmount(v)}
                  className="rounded-xl py-2 font-mono text-xs font-bold transition-all"
                  style={{background: amount===v ? investor.color : 'rgba(255,255,255,0.06)', color: amount===v ? 'white' : 'rgba(255,255,255,0.45)'}}>
                  ${v}
                </button>
              ))}
            </div>
            <div
              onClick={() => setConfirm(c => !c)}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-4 border cursor-pointer"
              style={{borderColor: confirm ? investor.color : 'rgba(255,255,255,0.18)', background: confirm ? `${investor.color}15` : 'rgba(255,255,255,0.03)', minHeight:60}}>
              <div className="flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center"
                style={{borderColor: confirm ? investor.color : 'rgba(255,255,255,0.30)', background: confirm ? investor.color : 'transparent'}}>
                {confirm && <span style={{color:'#000',fontSize:14,lineHeight:1,fontWeight:900}}>✓</span>}
              </div>
              <span className="font-mono text-xs text-left leading-snug" style={{color: confirm ? investor.color : 'rgba(255,255,255,0.55)'}}>
                Autorizo al agente a invertir <span style={{color:confirm?'#fff':'rgba(255,255,255,0.9)',fontWeight:900}}>${'{'}amount{'}'} MXN/mes</span> en este portafolio
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-safe pb-6 pt-3 border-t" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <button disabled={!investor || !confirm}
          onClick={() => { playSound('execute'); onExecute(`STOCKS·${investor!.name.toUpperCase()}·${amount}MXN`) }}
          className="w-full rounded-2xl py-5 font-mono font-black text-base active:scale-95 transition-all disabled:opacity-25"
          style={{
            background: (investor && confirm) ? `linear-gradient(135deg,${investor.color},#5e72e4)` : 'rgba(255,255,255,0.05)',
            color:'white', boxShadow: (investor && confirm) ? `0 8px 30px ${investor.color}40` : 'none',
          }}>
          {investor && confirm ? `📈 Activar · ${investor.name} · $${amount}/mes` : investor ? '⬆ Autoriza para continuar' : '📈 Elige un inversor'}
        </button>
      </div>
    </div>
  )
}

// ── TRADE HISTORY ────────────────────────────────────────────────────────────────
const HISTORY_KEY = 'eelienx_history'
function useHistory() {
  const [hist, setHist] = useState<{profit:number;win:boolean;action:string}[]>([])
  useEffect(() => {
    try { const s = localStorage.getItem(HISTORY_KEY); if (s) setHist(JSON.parse(s)) } catch {}
  }, [])
  const addTrade = (t: {profit:number;win:boolean;action:string}) => {
    setHist(prev => {
      const next = [t, ...prev].slice(0, 8)
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }
  const total = hist.reduce((s, t) => s + (t.win ? t.profit : -Math.abs(t.profit)), 0)
  return { hist, addTrade, total }
}

// ── MANUAL ────────────────────────────────────────────────────────────────────

// ── MULTI-AGENT PANEL ─────────────────────────────────────────────────────────
const COLLAB_AGENTS = [
  { id: 'vitalik', name: 'Vitalik Agent', role: 'Risk análysis', color: '#7B2FFF', emoji: '🔷', tip: 'Analiza el riesgo sistémico y pone stop-loss automáticos.' },
  { id: 'cz',      name: 'CZ Agent',     role: 'Portfolio hedge', color: '#F3BA2F', emoji: '🌕', tip: 'Diversifica entre ETH/BTC para reducir volatilidad total.' },
]

function MultiAgentPanel() {
  const [active, setActive] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const sel = COLLAB_AGENTS.find(a => a.id === active)

  const handleSelect = (id: string) => {
    playSound('click')
    if (active === id) { setActive(null); return }
    setActive(id); setSyncing(true)
    setTimeout(() => setSyncing(false), 1400)
  }

  return (
    <div className="rounded-2xl border p-4" style={{background:'rgba(94,114,228,0.04)',borderColor:'rgba(94,114,228,0.18)'}}>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-xs font-bold" style={{color:'#5e72e4'}}>⬡ Colaborar con otro agente</span>
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full" style={{background:'rgba(94,114,228,0.15)',color:'#5e72e4'}}>Multi-agent</span>
      </div>
      <p className="font-mono text-[9px] mb-3" style={{color:'rgba(255,255,255,0.35)'}}>Tu agente + otro agente trabajan juntos — uno ejecuta, el otro protege tu posición.</p>
      <div className="flex gap-2">
        {COLLAB_AGENTS.map(a => (
          <button key={a.id} onClick={() => handleSelect(a.id)}
            className="flex-1 rounded-xl border p-3 text-left active:scale-95 transition-all"
            style={{
              borderColor: active===a.id ? a.color : 'rgba(255,255,255,0.08)',
              background: active===a.id ? `${a.color}12` : 'transparent',
            }}>
            <div className="flex items-center gap-1.5 mb-1">
              <span>{a.emoji}</span>
              <span className="font-mono text-[10px] font-bold text-white">{a.name}</span>
            </div>
            <p className="font-mono text-[9px]" style={{color:'rgba(255,255,255,0.40)'}}>{a.role}</p>
          </button>
        ))}
      </div>
      {sel && (
        <div className="mt-3 flex items-center gap-2">
          {syncing
            ? <><span className="w-2 h-2 rounded-full animate-ping" style={{background:sel.color}} /><span className="font-mono text-[10px]" style={{color:sel.color}}>Sincronizando agentes…</span></>
            : <><span className="w-2 h-2 rounded-full" style={{background:sel.color}} /><span className="font-mono text-[10px]" style={{color:'rgba(255,255,255,0.55)'}}>{sel.tip}</span></>
          }
        </div>
      )}
    </div>
  )
}


function ManualScreen({ onExecute, onBack, loggedIn }: { onExecute:(a:string)=>void; onBack:()=>void; loggedIn:boolean }) {
  const [action, setAction] = useState<'buy'|'sell'|null>(null)
  const [amount, setAmount] = useState('500')
  const [stopLoss, setStopLoss] = useState('5')
  const [takeProfit, setTakeProfit] = useState('10')
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

      <div className="flex-1 flex flex-col gap-3 px-5 py-4 overflow-y-auto pb-28">
        {/* Price + mini chart */}
        <div className="rounded-2xl border p-4" style={{background:'rgba(255,255,255,0.03)',borderColor:'rgba(255,255,255,0.08)'}}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs" style={{color:'#555'}}>ETH / MXN · 1H</span>
            <div className="text-right">
              <span className="font-mono font-black text-xl" style={{color:'#00ff88'}}>${livePrice ? livePrice.last.toLocaleString('es-MX',{maximumFractionDigits:0}) : '...'}</span>
              {livePrice && <span className="font-mono text-xs ml-1.5 px-1.5 py-0.5 rounded" style={{color: livePrice.change24>=0?'#00ff88':'#ff4444',background: livePrice.change24>=0?'rgba(0,255,136,0.12)':'rgba(255,68,68,0.12)'}}>{livePrice.change24>=0?'+':''}{livePrice.change24.toFixed(1)}%</span>}
            </div>
          </div>
          <MiniChart color="#00ff88" />
        </div>

        {/* 🧠 AGENT ANALYSIS — prominent box */}
        <div className="rounded-2xl border-2 p-4" style={{background:'rgba(0,255,136,0.04)',borderColor:'#00ff8830'}}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🧠</span>
            <span className="font-mono text-xs font-bold" style={{color:'#00ff88'}}>AGENTE DICE:</span>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full ml-auto" style={{color:tip.riskC,background:`${tip.riskC}20`,border:`1px solid ${tip.riskC}40`}}>riesgo {tip.risk}</span>
          </div>
          <p className="font-mono text-sm leading-snug" style={{color:'rgba(255,255,255,0.85)'}}>
            &ldquo;{action ? `Acción seleccionada: ${action.toUpperCase()}. ${tip.msg} Confirma para ejecutar.` : tip.msg}&rdquo;
          </p>
        </div>

        {/* Strategy rules */}
        <div className="rounded-xl border px-4 py-3 flex items-center justify-between" style={{background:'rgba(255,255,255,0.02)',borderColor:'rgba(255,255,255,0.06)'}}>
          <span className="font-mono text-[10px]" style={{color:'#444'}}>Estrategia:</span>
          <div className="flex gap-3">
            <span className="font-mono text-[10px] font-bold" style={{color:'#00ff88'}}>BUY si baja 3%</span>
            <span className="font-mono text-[10px]" style={{color:'#333'}}>|</span>
            <span className="font-mono text-[10px] font-bold" style={{color:'#ff4444'}}>SELL si sube 5%</span>
          </div>
        </div>

        {/* Multi-agent collaboration toggle */}
        <MultiAgentPanel />

        {/* Amount selector */}
        <div className="rounded-2xl border p-4" style={{background:'rgba(255,255,255,0.03)',borderColor:'rgba(255,255,255,0.08)'}}>
          <p className="font-mono text-xs font-bold text-white mb-3">💰 ¿Cuánto quieres apostar?</p>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {['200','500','1000','2000'].map(v => (
              <button key={v} onClick={() => setAmount(v)}
                className="rounded-xl py-2 font-mono text-xs font-bold transition-all active:scale-95"
                style={{background: amount===v ? '#00ff88' : 'rgba(255,255,255,0.06)', color: amount===v ? '#000' : 'rgba(255,255,255,0.45)'}}>
                ${v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{color:'rgba(255,255,255,0.40)'}}>MXN</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 rounded-xl px-3 py-2 font-mono text-sm text-white outline-none border"
              style={{background:'rgba(255,255,255,0.05)',borderColor:'rgba(255,255,255,0.10)'}} />
          </div>
        </div>

        {/* Stop Loss / Take Profit */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3" style={{background:'rgba(255,68,68,0.04)',borderColor:'rgba(255,68,68,0.15)'}}>
            <p className="font-mono text-[9px] font-bold mb-1.5" style={{color:'#ff4444'}}>🛡️ Stop Loss</p>
            <div className="flex items-center gap-1">
              <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
                className="w-full rounded-lg px-2 py-1.5 font-mono text-sm text-white outline-none border"
                style={{background:'rgba(255,255,255,0.04)',borderColor:'rgba(255,68,68,0.20)'}} />
              <span className="font-mono text-xs" style={{color:'#ff4444'}}>%</span>
            </div>
            <p className="font-mono text-[8px] mt-1" style={{color:'rgba(255,255,255,0.25)'}}>pérdida máxima</p>
          </div>
          <div className="rounded-xl border p-3" style={{background:'rgba(0,255,136,0.04)',borderColor:'rgba(0,255,136,0.15)'}}>
            <p className="font-mono text-[9px] font-bold mb-1.5" style={{color:'#00ff88'}}>🎯 Take Profit</p>
            <div className="flex items-center gap-1">
              <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)}
                className="w-full rounded-lg px-2 py-1.5 font-mono text-sm text-white outline-none border"
                style={{background:'rgba(255,255,255,0.04)',borderColor:'rgba(0,255,136,0.20)'}} />
              <span className="font-mono text-xs" style={{color:'#00ff88'}}>%</span>
            </div>
            <p className="font-mono text-[8px] mt-1" style={{color:'rgba(255,255,255,0.25)'}}>ganancia objetivo</p>
          </div>
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
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button onClick={() => { playSound('click'); alert('💰 Pago de 0.01 USDC procesado vía x402 · Base\n✅ Agente premium activado — señales avanzadas desbloqueadas') }}
            className="rounded-xl py-3 font-mono text-xs font-bold border active:scale-95 transition-all"
            style={{borderColor:'#f5a62350',color:'#f5a623',background:'rgba(245,166,35,0.06)'}}>
            💰 Agente premium<br/><span style={{fontSize:'9px',opacity:0.7}}>0.01 USDC via x402</span>
          </button>
          <button disabled={!action}
            onClick={() => action && (playSound('execute'), onExecute(`${action.toUpperCase()}·${amount}MXN·SL${stopLoss}%·TP${takeProfit}%`))}
            className="rounded-xl py-3 font-mono font-black text-sm active:scale-95 transition-all disabled:opacity-25"
            style={{
              background: action ? 'linear-gradient(135deg,#5e72e4,#00ff88)' : 'rgba(255,255,255,0.05)',
              color:'white', boxShadow: action ? '0 8px 30px rgba(94,114,228,0.35)' : 'none',
            }}>
            ⚡ EJECUTAR
          </button>
        </div>
      </div>
    </div>
  )
}

// ── COPY ──────────────────────────────────────────────────────────────────────
// ── COPY TRADERS ──────────────────────────────────────────────────────────────
function useLiveTraders(baseChange: number | null) {
  // Generate trader gains based on real ETH price movement + personality variance
  const base = baseChange ?? 2.1
  return [
    {
      name: 'Vitalik.eth',
      handle: '@vitalikbuterin',
      emoji: '🔷',
      color: '#7B2FFF',
      risk: 'BAJO',
      win: 91,
      pct: base > 0 ? `+${(base * 0.85 + 1.2).toFixed(1)}%` : `${(base * 0.6 - 0.5).toFixed(1)}%`,
      raw: base > 0 ? base * 0.85 + 1.2 : base * 0.6 - 0.5,
      tip: 'Perfil conservador, 91% de aciertos. Ideal si es tu primera vez.',
    },
    {
      name: 'CZ Binance',
      handle: '@cz_binance',
      emoji: '🌕',
      color: '#F3BA2F',
      risk: 'MEDIO',
      win: 85,
      pct: base > 0 ? `+${(base * 1.1 + 2.3).toFixed(1)}%` : `${(base * 0.9 - 1.1).toFixed(1)}%`,
      raw: base > 0 ? base * 1.1 + 2.3 : base * 0.9 - 1.1,
      tip: 'Portafolio diversificado ETH + BTC. Retornos estables, riesgo moderado.',
    },
    {
      name: 'Elon Musk',
      handle: '@elonmusk',
      emoji: '🚀',
      color: '#1DA1F2',
      risk: 'ALTO',
      win: 78,
      pct: base > 0 ? `+${(base * 1.8 + 4.1).toFixed(1)}%` : `${(base * 1.4 - 2.8).toFixed(1)}%`,
      raw: base > 0 ? base * 1.8 + 4.1 : base * 1.4 - 2.8,
      tip: 'Movimientos agresivos — alta ganancia, mayor riesgo. Solo si sabes lo que haces.',
    },
  ]
}

function CopyScreen({ onExecute, onBack, loggedIn }: { onExecute:(a:string)=>void; onBack:()=>void; loggedIn:boolean }) {
  const [sel, setSel] = useState<number|null>(null)
  const [amount, setAmount] = useState('500')
  const livePrice = useLivePrice()
  const traders = useLiveTraders(livePrice?.change24 ?? null)
  const trader = sel !== null ? traders[sel] : null

  return (
    <div className="flex flex-col min-h-dvh" style={{background:'#0d0d1a'}}>
      {/* Nav */}
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-3 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <button onClick={onBack} className="font-mono text-xs active:opacity-60 p-1" style={{color:'#555'}}>← VOLVER</button>
        <span className="font-mono text-sm font-bold" style={{color:'#f5a623'}}>🐋 COPY TRADING</span>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{color:'#00ff88',background:'rgba(0,255,136,0.1)'}}>● LIVE</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 px-5 py-4 overflow-y-auto">
        {/* Headline */}
        <div className="text-center py-2">
          <p className="font-mono text-base font-black text-white mb-1">Si quieres ganar,</p>
          <p className="font-mono text-base font-black" style={{color:'#f5a623'}}>sigue a los mejores traders del momento 🐋</p>
          <p className="font-mono text-[10px] mt-1.5" style={{color:'rgba(255,255,255,0.28)'}}>Ganancias últimas 24h · ETH/MXN en tiempo real</p>
        </div>

        {/* Trader cards */}
        {traders.map((w, i) => (
          <button key={w.name} onClick={() => { playSound('click'); setSel(i) }}
            className="w-full rounded-2xl border-2 p-4 text-left active:scale-[0.98] transition-all"
            style={{
              borderColor: sel===i ? w.color : 'rgba(255,255,255,0.07)',
              background: sel===i ? `${w.color}10` : 'rgba(255,255,255,0.02)',
              boxShadow: sel===i ? `0 0 24px ${w.color}30` : 'none',
            }}>
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <span className="text-3xl">{w.emoji}</span>
                {sel===i && <span className="absolute -top-1 -right-1 text-xs">✓</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-sm font-black text-white">{w.name}</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full border"
                    style={{color: w.risk==='BAJO'?'#00ff88':w.risk==='MEDIO'?'#f5a623':'#ff4444', borderColor: w.risk==='BAJO'?'#00ff8840':w.risk==='MEDIO'?'#f5a62340':'#ff444440'}}>
                    Riesgo {w.risk}
                  </span>
                </div>
                <p className="font-mono text-[10px]" style={{color:'rgba(255,255,255,0.35)'}}>{w.handle} · {w.win}% aciertos</p>
                <div className="mt-2"><MiniChart color={w.color} /></div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="font-mono text-2xl font-black" style={{color: w.raw >= 0 ? w.color : '#ff4444'}}>{w.pct}</div>
                <div className="font-mono text-[9px]" style={{color:'rgba(255,255,255,0.30)'}}>últimas 24h</div>
              </div>
            </div>
          </button>
        ))}

        {/* Amount picker — shows when trader selected */}
        {trader && (
          <div className="rounded-2xl border p-4" style={{background:'rgba(255,255,255,0.03)',borderColor:`${trader.color}30`}}>
            <p className="font-mono text-xs font-bold mb-3 text-white">¿Cuánto quieres invertir?</p>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['200','500','1000','2000'].map(v => (
                <button key={v} onClick={() => setAmount(v)}
                  className="rounded-xl py-2.5 font-mono text-xs font-bold transition-all active:scale-95"
                  style={{background: amount===v ? trader.color : 'rgba(255,255,255,0.06)', color: amount===v ? 'white' : 'rgba(255,255,255,0.45)'}}>
                  ${v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-2" style={{background:'rgba(255,255,255,0.05)'}}>
              <span className="font-mono text-xs" style={{color:'rgba(255,255,255,0.35)'}}>MXN</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                className="flex-1 bg-transparent font-mono text-base font-bold text-white outline-none"
                style={{minWidth:0}} />
            </div>
            {/* % of portfolio slider */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[9px]" style={{color:'rgba(255,255,255,0.35)'}}>% del portafolio a arriesgar</span>
                <span className="font-mono text-[9px] font-bold" style={{color: trader.color}}>{Math.round((parseInt(amount)||0)/50)}%</span>
              </div>
              <input type="range" min="1" max="100" value={Math.min(100,Math.round((parseInt(amount)||0)/50))}
                onChange={e => setAmount(String(parseInt(e.target.value)*50))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{accentColor: trader.color}} />
              <div className="flex justify-between mt-0.5">
                <span className="font-mono text-[8px]" style={{color:'#555'}}>Conservador</span>
                <span className="font-mono text-[8px]" style={{color:'#555'}}>Agresivo</span>
              </div>
            </div>
            <NPC text={trader.tip} color={trader.color} />
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-safe pb-6 pt-3 border-t" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <button disabled={!trader}
          onClick={() => trader && (playSound('execute'), onExecute(`COPY·${trader.name.toUpperCase()}·${amount}MXN`))}
          className="w-full rounded-2xl py-5 font-mono font-black text-base active:scale-95 transition-all disabled:opacity-25"
          style={{
            background: trader ? `linear-gradient(135deg,${trader.color},#5e72e4)` : 'rgba(255,255,255,0.05)',
            color:'white', boxShadow: trader ? `0 8px 30px ${trader.color}35` : 'none',
          }}>
          {trader ? `🐋 Copiar a ${trader.name} · $${amount} MXN` : '🐋 Elige un trader para continuar'}
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
      <p className="font-mono text-xs mb-1" style={{color:'rgba(255,255,255,0.30)'}}>{action}</p>
      <p className="font-mono text-[10px] mb-8 px-4 text-center" style={{color:'rgba(0,255,136,0.50)'}}>eelienX Protocol conecta — tu agente ejecuta por ti</p>
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
      {result.win && <MoneyBurst />}

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 text-center"
        style={{opacity: show?1:0, transition:'opacity 0.3s', animation: show?'popin 0.5s ease':'none'}}>
        <div className="mb-4" style={{filter:result.win?'drop-shadow(0 0 20px #00ff8880)':'drop-shadow(0 0 12px #ff444460)'}}>
          <PixelAlien state={result.win ? 'win' : 'lose'} size={3} />
        </div>

        <p className="font-mono font-black mb-1 tracking-widest" style={{fontSize:'clamp(22px,7vw,36px)', color:c}}>
          {result.win ? '🎉 ¡GANASTE!' : '😢 PERDISTE'}
        </p>
        {result.win && <p className="text-4xl mb-2">💰💰💰</p>}

        <h2 className="font-mono font-black mb-2" style={{fontSize:'clamp(40px,11vw,64px)', color:c, textShadow:`0 0 40px ${c}55`}}>
          {result.win ? `+${result.profit.toFixed(2)}%` : `-${Math.abs(result.profit).toFixed(2)}%`}
        </h2>

        <p className="font-mono text-sm mb-6" style={{color:'rgba(255,255,255,0.40)'}}>
          {result.win ? `Trade exitoso 🚀 · ${result.action}` : `El mercado fue volátil · ${result.action}`}
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

// ── HISTORY PANEL ────────────────────────────────────────────────────────────────
function HistoryPanel({ hist, total }: { hist:{profit:number;win:boolean;action:string}[]; total:number }) {
  if (hist.length === 0) return null
  return (
    <div className="rounded-2xl border p-4 mx-5 mb-4" style={{background:'rgba(255,255,255,0.02)',borderColor:'rgba(255,255,255,0.07)'}}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs font-bold" style={{color:'#555'}}>📊 HISTORIAL</span>
        <span className="font-mono text-xs font-black" style={{color: total>=0?'#00ff88':'#ff4444'}}>{total>=0?'+':''}{total.toFixed(2)}% total</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {hist.map((t,i) => (
          <span key={i} className="font-mono text-xs px-2 py-1 rounded-lg font-bold"
            style={{background: t.win?'rgba(0,255,136,0.12)':'rgba(255,68,68,0.12)', color: t.win?'#00ff88':'#ff4444'}}>
            {t.win?'+':'-'}{Math.abs(t.profit).toFixed(1)}%
          </span>
        ))}
      </div>
    </div>
  )
}

// ── PLANS SCREEN ─────────────────────────────────────────────────────────────
const PLANS_DATA = [
  {
    id: 'free', label: 'Gratis', price: '$0', color: '#5e72e4', emoji: '🛸',
    features: ['✅ Precios ETH/BTC/SOL en tiempo real','✅ Academia completa con gráficas','✅ Copy Trading (modo demo)','✅ Ver balance de wallet (solo lectura)','❌ Trades reales','❌ Comandos al agente'],
    cta: 'Empezar gratis',
  },
  {
    id: 'pro', label: 'Agente Pro', price: '$99 USDC', color: '#f5a623', emoji: '⚡', badge: 'POPULAR',
    features: ['✅ Todo lo de Gratis','✅ Trades reales en Bitso (ETH/MXN)','✅ Comandos: "Ponle $50 a ETH"','✅ Swap: "Cambia mi BTC a ETH"','✅ Alertas RSI/MACD push','✅ Multi-agente (Vitalik + CZ)','❌ Trades programados / autopilot'],
    cta: 'Activar Pro con USDC',
  },
  {
    id: 'premium', label: 'Full Autopilot', price: '$299 USDC', color: '#00ff88', emoji: '🚀',
    features: ['✅ Todo lo de Agente Pro','✅ Trades programados: "El lunes a las 9am…"','✅ Wallet fría USDC sin cuenta Bitso','✅ Autopilot: el agente opera X días solo','✅ "Tengo 0.1 ETH, cámbiamelo a SOL"','✅ Gestión de portafolio autónoma 24/7'],
    cta: 'Activar Full Autopilot',
  },
]

function PlansScreen({ onBack, onSelectPlan }: { onBack:()=>void; onSelectPlan:(p:string)=>void }) {
  const [selected, setSelected] = useState<string|null>(null)
  return (
    <div className="flex flex-col min-h-dvh pb-safe" style={{background:'linear-gradient(180deg,#0d0d1a 0%,#0d1228 55%,#0d1a14 100%)'}}>
      <div className="relative z-10 flex items-center justify-between px-5 pt-safe pt-4 mb-3">
        <button onClick={onBack} className="font-mono text-xs active:opacity-60" style={{color:'#555'}}>← VOLVER</button>
        <span className="font-mono text-xs font-bold" style={{color:'#5e72e4'}}>eelienX Protocol</span>
        <div />
      </div>
      <div className="relative z-10 text-center px-5 mb-3">
        <h2 className="font-mono font-black text-2xl text-white mb-1">Elige tu plan 💳</h2>
        <p className="font-mono text-xs" style={{color:'rgba(255,255,255,0.4)'}}>Paga con USDC · actívate en segundos</p>
      </div>
      <div className="relative z-10 flex flex-col gap-3 px-4 overflow-y-auto pb-8">
        {PLANS_DATA.map(plan => (
          <div key={plan.id}
            onClick={() => { setSelected(plan.id); playSound('click') }}
            className="w-full text-left rounded-2xl border-2 p-4 active:scale-95 transition-all cursor-pointer"
            style={{
              borderColor: selected===plan.id ? plan.color : 'rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.02)',
              boxShadow: selected===plan.id ? `0 0 24px ${plan.color}30` : 'none',
            }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{plan.emoji}</span>
                <span className="font-mono font-black text-base" style={{color:plan.color}}>{plan.label}</span>
                {plan.badge && <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-full font-black" style={{background:plan.color,color:'#000'}}>{plan.badge}</span>}
              </div>
              <span className="font-mono font-black text-sm" style={{color:plan.color}}>{plan.price}</span>
            </div>
            <div className="space-y-0.5 mb-2">
              {plan.features.map((f,i) => (
                <p key={i} className="font-mono text-[10px]" style={{color:f.startsWith('✅')?'rgba(255,255,255,0.70)':'rgba(255,255,255,0.22)'}}>{f}</p>
              ))}
            </div>
            {selected===plan.id && (
              <button onClick={e => { e.stopPropagation(); onSelectPlan(plan.id) }}
                className="w-full py-2.5 rounded-xl font-mono font-black text-sm active:scale-95 transition-all mt-1"
                style={{background:plan.color,color:plan.id==='free'?'#fff':'#000'}}>
                {plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── COMMAND SCREEN (Pro / Premium) ────────────────────────────────────────────
function CommandScreen({ onBack, onExecute, plan }: { onBack:()=>void; onExecute:(a:string)=>void; plan:string }) {
  const [input, setInput] = useState('')
  const [scheduled, setScheduled] = useState(false)
  const [schedDate, setSchedDate] = useState('')
  const isPremium = plan === 'premium'

  const EXAMPLES = isPremium
    ? ['Ponle $50 a ETH ahora','El lunes compra $30 de BTC','Tengo 0.1 ETH, cámbiamelo a SOL','DCA $20 diarios en ETH por 7 días','Si ETH baja a $60k MXN, compra $100']
    : ['Ponle $50 a ETH','Compra $30 de BTC','Tengo 0.05 BTC, cámbiamelo a ETH','Vende el 50% de mi ETH']

  return (
    <div className="flex flex-col min-h-dvh pb-safe" style={{background:'linear-gradient(180deg,#0d0d1a 0%,#0d1228 60%,#0d1a14 100%)'}}>
      <div className="relative z-10 flex items-center justify-between px-5 pt-safe pt-4 mb-2">
        <button onClick={onBack} className="font-mono text-xs active:opacity-60" style={{color:'#555'}}>← VOLVER</button>
        <span className="font-mono text-[9px] px-2 py-1 rounded-full font-bold" style={{background:isPremium?'rgba(0,255,136,0.12)':'rgba(245,166,35,0.12)',color:isPremium?'#00ff88':'#f5a623'}}>
          {isPremium?'🚀 Full Autopilot':'⚡ Agente Pro'}
        </span>
        <div />
      </div>
      <div className="relative z-10 px-5 flex flex-col gap-4 flex-1">
        <div className="text-center pt-1">
          <h2 className="font-mono font-black text-xl text-white">Dale órdenes al agente</h2>
          <p className="font-mono text-xs mt-0.5" style={{color:'rgba(255,255,255,0.35)'}}>Escribe en español — él entiende y ejecuta</p>
        </div>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          placeholder="Ej: Ponle $50 a ETH ahora..."
          rows={3}
          className="w-full rounded-xl p-3 font-mono text-sm text-white resize-none outline-none border"
          style={{background:'rgba(255,255,255,0.05)',borderColor:'rgba(255,255,255,0.12)'}} />
        {isPremium && (
          <div>
            <button onClick={() => setScheduled(s => !s)}
              className="flex items-center gap-2 font-mono text-xs"
              style={{color:scheduled?'#00ff88':'rgba(255,255,255,0.40)'}}>
              <span className="w-3 h-3 rounded border inline-flex items-center justify-center" style={{background:scheduled?'#00ff88':'transparent',borderColor:scheduled?'#00ff88':'rgba(255,255,255,0.30)'}}>
                {scheduled && <span style={{color:'#000',fontSize:8,lineHeight:1}}>✓</span>}
              </span>
              ⏰ Programar para una fecha/hora
            </button>
            {scheduled && (
              <input type="datetime-local" value={schedDate} onChange={e => setSchedDate(e.target.value)}
                className="mt-2 w-full rounded-xl p-2 font-mono text-xs text-white border outline-none"
                style={{background:'rgba(255,255,255,0.05)',borderColor:'rgba(0,255,136,0.25)'}} />
            )}
          </div>
        )}
        <div>
          <p className="font-mono text-[9px] mb-2" style={{color:'rgba(255,255,255,0.28)'}}>EJEMPLOS RÁPIDOS — toca para usar:</p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex,i) => (
              <button key={i} onClick={() => setInput(ex)}
                className="px-2.5 py-1 rounded-full border font-mono text-[9px] active:scale-95 transition-all"
                style={{borderColor:'rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.55)',background:'rgba(255,255,255,0.03)'}}>
                {ex}
              </button>
            ))}
          </div>
        </div>
        <button disabled={!input.trim()}
          onClick={() => { playSound('click'); onExecute(input + (scheduled && schedDate ? ` — programado ${new Date(schedDate).toLocaleDateString('es-MX',{weekday:'long',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}` : '')) }}
          className="w-full py-4 rounded-2xl font-mono font-black text-base disabled:opacity-40 active:scale-95 transition-all"
          style={{background:isPremium?'#00ff88':'#f5a623',color:'#000'}}>
          🤖 Que el agente ejecute
        </button>
        <p className="font-mono text-center text-[8px]" style={{color:'rgba(255,255,255,0.18)'}}>
          {isPremium?'Wallet fría USDC conectada · autopilot disponible':'Requiere cuenta Bitso activa · trades reales en MXN'}
        </p>
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
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const { balance, loggedIn } = useSession()
  const { hist, addTrade, total } = useHistory()
  const wallet = useWallet()

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
          addTrade({ profit, win: true, action }); setScreen('result'); return
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
      const tradeResult = { action: isRisk ? action : d.action, profit: isRisk ? -(Math.random()*3+0.5) : profit, message: d.message ?? 'Operación completada', win: !isRisk }
      addTrade({ profit: tradeResult.profit, win: tradeResult.win, action })
      setResult(tradeResult)
    } catch {
      const profit = +(Math.random() * 6 + 1.5).toFixed(2)
      const win = Math.random() > 0.25
      setResult({ action, profit: win ? profit : -profit * 0.4, message: win ? 'ETH recovery detectado' : 'Stop loss activado', win })
    }
    setScreen('result')
  }

  if (screen === 'home')      return <PathScreen onPath={p => p === 'quick' ? setScreen('path') : p === 'manual' ? setScreen('manual') : p === 'plans' ? setScreen('plans') : setScreen('hodl')} wallet={wallet} balance={balance} loggedIn={loggedIn} />
  if (screen === 'path')      return (
    <>
      <HomeScreen onMode={m => m === 'plans' ? setScreen('plans') : setScreen(m)} balance={balance} loggedIn={loggedIn} wallet={wallet} />
      <div style={{position:'fixed',bottom:'80px',left:0,right:0,zIndex:20}}><HistoryPanel hist={hist} total={total} /></div>
    </>
  )
  if (screen === 'hodl')      return (
    <div className="flex flex-col min-h-dvh" style={{background:'#0d0d1a'}}>
      <div className="flex items-center justify-between px-5 pt-safe pt-4 pb-3 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <button onClick={() => setScreen('home')} className="font-mono text-xs active:opacity-60 p-1" style={{color:'#555'}}>← VOLVER</button>
        <span className="font-mono text-sm font-bold" style={{color:'#00ff88'}}>💎 LARGO PLAZO</span>
        <span />
      </div>
      <div className="flex-1 flex flex-col gap-4 px-5 py-6 items-center justify-center">
        <p className="font-mono text-base font-black text-white mb-2">¿Cómo quieres invertir?</p>
        <button onClick={() => { playSound('click'); setScreen('hodlscreen') }}
          className="w-full max-w-sm rounded-2xl border-2 py-6 px-6 text-left active:scale-95 transition-all"
          style={{ borderColor:'#F7931A', background:'rgba(247,147,26,0.06)' }}>
          <p className="font-mono text-lg font-black mb-1" style={{color:'#F7931A'}}>💎 HODL Crypto</p>
          <p className="font-mono text-xs" style={{color:'rgba(255,255,255,0.40)'}}>Copia los mejores HODLers — BTC, ETH, SOL a largo plazo</p>
        </button>
        <button onClick={() => { playSound('click'); setScreen('stocks') }}
          className="w-full max-w-sm rounded-2xl border-2 py-6 px-6 text-left active:scale-95 transition-all"
          style={{ borderColor:'#5e72e4', background:'rgba(94,114,228,0.06)' }}>
          <p className="font-mono text-lg font-black mb-1" style={{color:'#5e72e4'}}>📈 Acciones</p>
          <p className="font-mono text-xs" style={{color:'rgba(255,255,255,0.40)'}}>Copia a Buffett, Dalio, Cathie Wood — los mejores inversores del mundo</p>
        </button>
      </div>
    </div>
  )
  if (screen === 'hodlscreen') return <HodlScreen onExecute={executeTrade} onBack={() => setScreen('hodl')} />
  if (screen === 'stocks')    return <StocksScreen onExecute={executeTrade} onBack={() => setScreen('hodl')} />
  if (screen === 'plans')     return <PlansScreen onBack={() => setScreen('home')} onSelectPlan={p => { setCurrentPlan(p); p === 'free' ? setScreen('home') : setScreen('command') }} />
  if (screen === 'command')   return <CommandScreen onBack={() => setScreen('plans')} onExecute={executeTrade} plan={currentPlan} />
  if (screen === 'manual')    return <ManualScreen onExecute={executeTrade} onBack={() => setScreen('path')} loggedIn={loggedIn} />
  if (screen === 'copy')      return <CopyScreen  onExecute={executeTrade} onBack={() => setScreen('path')} loggedIn={loggedIn} />
  if (screen === 'executing') return <ExecutingScreen action={tradeAction} />
  if (screen === 'result' && result) return <ResultScreen result={result} onReplay={() => { setResult(null); setScreen('home') }} />
  return null
}
