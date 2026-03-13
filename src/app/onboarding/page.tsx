'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// ── Copy strategies data ────────────────────────────────────────────────────

const copyTraders = [
  {
    id: 'whale_btc',
    name: 'The Whale 🐋',
    focus: 'BTC + ETH',
    return: '+47%',
    period: 'este mes',
    style: 'Compra en correcciones, vende en resistencias. Mueve $500k+/operación.',
    coin: 'BTC',
    color: 'orange',
    avatar: '🐋',
  },
  {
    id: 'defi_queen',
    name: 'DeFi Queen 👑',
    focus: 'SOL + Altcoins',
    return: '+63%',
    period: 'este mes',
    style: 'Sigue tokens con volumen creciente. Alta rentabilidad, riesgo medio-alto.',
    coin: 'SOL',
    color: 'purple',
    avatar: '👑',
  },
  {
    id: 'momentum_mx',
    name: 'Momentum MX 🇲🇽',
    focus: 'BTC + BNB',
    return: '+38%',
    period: 'este mes',
    style: 'Trader mexicano. Opera en Bitso y Binance. Estrategia conservadora y rentable.',
    coin: 'BNB',
    color: 'yellow',
    avatar: '🇲🇽',
  },
];

const copyHodlers = [
  {
    id: 'saylor',
    name: 'Michael Saylor 💎',
    focus: 'Bitcoin',
    holding: '500,000+ BTC',
    quote: '"Bitcoin es la propiedad digital más segura del mundo."',
    strategy: 'Compra BTC con todo. Nunca vende. Horizonte: décadas.',
    coin: 'BTC',
    color: 'orange',
    avatar: '💎',
  },
  {
    id: 'vitalik',
    name: 'Estilo Vitalik 🔷',
    focus: 'Ethereum',
    holding: 'ETH + ecosistema',
    quote: '"Ethereum es la base de la economía descentralizada."',
    strategy: 'Hodlea ETH a largo plazo. Apuesta por DeFi y smart contracts.',
    coin: 'ETH',
    color: 'blue',
    avatar: '🔷',
  },
  {
    id: 'latam_hodler',
    name: 'LATAM Store 🌎',
    focus: 'BTC + ETH + SOL',
    holding: 'Basket diversificado',
    quote: '"En LATAM el crypto es protección contra la inflación."',
    strategy: 'Divide el capital en BTC 60% / ETH 30% / SOL 10%. Acumula mensual.',
    coin: 'BTC',
    color: 'green',
    avatar: '🌎',
  },
];

// ── Color maps ──────────────────────────────────────────────────────────────

const cardBorder: Record<string, string> = {
  orange: 'border-orange-500/50 hover:border-orange-400',
  purple: 'border-purple-500/50 hover:border-purple-400',
  yellow: 'border-yellow-500/50 hover:border-yellow-400',
  blue:   'border-blue-500/50 hover:border-blue-400',
  green:  'border-green-500/50 hover:border-green-400',
};
const cardBg: Record<string, string> = {
  orange: 'bg-orange-500/10',
  purple: 'bg-purple-500/10',
  yellow: 'bg-yellow-500/10',
  blue:   'bg-blue-500/10',
  green:  'bg-green-500/10',
};
const textAccent: Record<string, string> = {
  orange: 'text-orange-400',
  purple: 'text-purple-400',
  yellow: 'text-yellow-400',
  blue:   'text-blue-400',
  green:  'text-green-400',
};

// ── Main component ──────────────────────────────────────────────────────────

type Step = 'profile' | 'method' | 'strategy' | 'risk';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('profile');
  const [profile, setProfile] = useState<'trader' | 'hodler' | null>(null);
  const [method, setMethod] = useState<'copy' | 'manual' | null>(null);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTraderWarning, setShowTraderWarning] = useState(false);

  useEffect(() => {
    // Show trader warning only first time
    if (profile === 'trader' && step === 'method') {
      const seen = localStorage.getItem('eelienx_trader_warning_seen');
      if (!seen) setShowTraderWarning(true);
    }
  }, [profile, step]);

  // Suggested defaults by profile
  const suggested = {
    stopLoss:   profile === 'hodler' ? '-15%' : '-5%',
    takeProfit: profile === 'hodler' ? '+50%' : '+10%',
    stopLossLabel:   profile === 'hodler' ? 'Salir si baja 15% desde tu entrada' : 'Salir si baja 5% desde tu entrada',
    takeProfitLabel: profile === 'hodler' ? 'Tomar ganancias cuando suba 50%' : 'Tomar ganancias cuando suba 10%',
  };

  const handleProfileSelect = (p: 'trader' | 'hodler') => {
    setProfile(p);
    setStep('method');
  };

  const handleMethodSelect = (m: 'copy' | 'manual') => {
    setMethod(m);
    if (m === 'copy') setStep('strategy');
    else setStep('risk');
  };

  const handleStrategySelect = (id: string) => {
    setStrategy(id);
    setStep('risk');
  };

  const handleFinish = () => {
    setLoading(true);
    localStorage.setItem('eelienx_profile', profile!);
    localStorage.setItem('eelienx_method', method!);
    if (strategy) localStorage.setItem('eelienx_strategy', strategy);
    localStorage.setItem('eelienx_stop_loss', stopLoss || suggested.stopLoss);
    localStorage.setItem('eelienx_take_profit', takeProfit || suggested.takeProfit);
    router.push('/chat');
  };

  // ── Step: Profile ──
  if (step === 'profile') return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-10">
      {/* Academia button top */}
      <div className="w-full max-w-2xl flex justify-end mb-6">
        <a href="/academia"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/5 text-blue-400 text-sm hover:border-blue-400 transition-colors">
          📚 Academia
        </a>
      </div>

      <div className="text-center mb-10">
        <div className="text-5xl mb-4">👽</div>
        <h1 className="text-2xl font-bold mb-2">¿Cómo quieres hacer crecer tu capital?</h1>
        <p className="text-gray-500 text-sm">Elige tu estilo — puedes cambiar cuando quieras.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {/* Hodler */}
        <button onClick={() => handleProfileSelect('hodler')}
          className="flex-1 rounded-2xl border-2 border-blue-500/40 bg-blue-500/5 hover:border-blue-400 hover:bg-blue-500/10 p-7 text-left transition-all cursor-pointer group">
          <div className="text-5xl mb-4">🧊</div>
          <h2 className="text-xl font-bold mb-1">Holdear</h2>
          <p className="text-blue-300 text-sm font-medium mb-4">El tiempo trabaja por mi dinero</p>
          <ul className="space-y-2 text-sm text-gray-300 mb-4">
            <li className="flex gap-2"><span className="text-green-400">✓</span> Rendimientos a largo plazo</li>
            <li className="flex gap-2"><span className="text-green-400">✓</span> Sin estrés de operar a diario</li>
            <li className="flex gap-2"><span className="text-green-400">✓</span> Estrategias de inversores millonarios</li>
            <li className="flex gap-2"><span className="text-green-400">✓</span> BTC ha subido ~200% cada 4 años</li>
            <li className="flex gap-2"><span className="text-red-400">✗</span> El mercado puede bajar antes de subir</li>
            <li className="flex gap-2"><span className="text-red-400">✗</span> Requiere paciencia — no es inmediato</li>
          </ul>
          <div className="mt-3 text-blue-400 font-semibold text-sm group-hover:underline">Elegir Holdear →</div>
        </button>

        {/* Trader */}
        <button onClick={() => handleProfileSelect('trader')}
          className="flex-1 rounded-2xl border-2 border-orange-500/40 bg-orange-500/5 hover:border-orange-400 hover:bg-orange-500/10 p-7 text-left transition-all cursor-pointer group">
          <div className="text-5xl mb-4">🔥</div>
          <h2 className="text-xl font-bold mb-1">Tradear</h2>
          <p className="text-orange-300 text-sm font-medium mb-4">Operaciones rápidas y activas</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2"><span className="text-orange-400">✓</span> Entra y sal del mercado cuando quieras</li>
            <li className="flex gap-2"><span className="text-orange-400">✓</span> Análisis técnico antes de cada operación</li>
            <li className="flex gap-2"><span className="text-orange-400">✓</span> Copia a traders exitosos del momento</li>
            <li className="flex gap-2"><span className="text-orange-400">✓</span> Tú confirmas antes de cada orden</li>
          </ul>
          <div className="mt-3 text-orange-400 font-semibold text-sm group-hover:underline">Elegir Tradear →</div>
        </button>
      </div>
    </main>
  );

  // ── Trader risk warning modal (first time only) ──
  if (showTraderWarning) return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 border-2 border-orange-500/50 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-3 text-orange-400">Trading conlleva riesgo real</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          El trading activo puede generar ganancias rápidas, pero también pérdidas significativas.<br/><br/>
          <strong className="text-white">El agente nunca ejecuta sin tu confirmación</strong> — pero el riesgo del mercado siempre existe. Solo opera con dinero que puedes perder sin que afecte tu vida.
        </p>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 text-left text-sm text-gray-300 space-y-2">
          <p>🛑 Configuraremos un <strong>Stop Loss</strong> para limitar pérdidas</p>
          <p>🎯 Configuraremos un <strong>Take Profit</strong> para asegurar ganancias</p>
          <p>👽 El agente te guía en cada paso</p>
        </div>
        <button
          onClick={() => {
            localStorage.setItem('eelienx_trader_warning_seen', '1');
            setShowTraderWarning(false);
          }}
          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-all cursor-pointer">
          Entendido, quiero continuar 🔥
        </button>
        <button onClick={() => { setProfile(null); setStep('profile'); setShowTraderWarning(false); }}
          className="mt-3 text-gray-600 hover:text-gray-400 text-sm w-full">
          ← Volver a elegir perfil
        </button>
      </div>
    </main>
  );

  // ── Step: Method ──

  if (step === 'method') {
    const isHodler = profile === 'hodler';
    const color = isHodler ? 'blue' : 'orange';
    const emoji = isHodler ? '🧊' : '🔥';

    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
        <button onClick={() => setStep('profile')} className="mb-6 text-gray-600 hover:text-white text-sm self-start max-w-xl w-full mx-auto">← Volver</button>

        <div className="text-center mb-10 max-w-xl w-full mx-auto">
          <div className="text-4xl mb-3">{emoji}</div>
          <h1 className="text-2xl font-bold mb-2">
            {isHodler ? '¿Cómo quieres holdear?' : '¿Cómo quieres tradear?'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isHodler
              ? 'Elige la estrategia — el agente la ejecuta con tu permiso.'
              : 'Elige el método — el agente analiza y ejecuta con tu confirmación.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
          {/* Copy */}
          <button onClick={() => handleMethodSelect('copy')}
            className={`flex-1 rounded-2xl border-2 ${cardBorder[color]} ${cardBg[color]} p-6 text-left transition-all cursor-pointer`}>
            <div className="text-3xl mb-3">{isHodler ? '🏆 Copy Hodl' : '🏆 Copy Trading'}</div>
            <p className="text-gray-300 text-sm mb-3">
              {isHodler
                ? 'Elige a un holdear famoso y replica su estrategia automáticamente.'
                : 'Copia a los traders más exitosos del momento. El agente replica sus movimientos.'}
            </p>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${textAccent[color]} border-current bg-current/10`}>
              Recomendado para empezar
            </span>
          </button>

          {/* Manual */}
          <button onClick={() => handleMethodSelect('manual')}
            className="flex-1 rounded-2xl border-2 border-gray-700 bg-gray-900 hover:border-gray-500 p-6 text-left transition-all cursor-pointer">
            <div className="text-3xl mb-3">{isHodler ? '✋ Hodl Manual' : '✋ Trade Manual'}</div>
            <p className="text-gray-400 text-sm mb-3">
              {isHodler
                ? 'Tú decides qué crypto acumular y cuándo. El agente ejecuta y te da contexto.'
                : 'Tú decides cuándo entrar y salir. El agente analiza y ejecuta con tu OK.'}
            </p>
            <span className="text-xs text-gray-500">Para los que ya tienen experiencia</span>
          </button>
        </div>
      </main>
    );
  }

  // ── Step: Strategy (Copy) ──

  if (step === 'strategy') {
    const isHodler = profile === 'hodler';
    const items = isHodler ? copyHodlers : copyTraders;

    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-xl">
          <button onClick={() => setStep('method')} className="mb-6 text-gray-600 hover:text-white text-sm">← Volver</button>

          <div className="text-center mb-8">
            <div className="text-4xl mb-3">{isHodler ? '🏆' : '📊'}</div>
            <h1 className="text-2xl font-bold mb-2">
              {isHodler ? 'Elige a quién copiar' : 'Traders exitosos del momento'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isHodler
                ? 'El agente replica su estrategia de holdeo — tú siempre confirmas.'
                : 'El agente copia sus movimientos y te pide confirmación antes de ejecutar.'}
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => !loading && handleStrategySelect(item.id)}
                disabled={loading}
                className={`w-full text-left rounded-2xl border-2 ${cardBorder[item.color]} bg-gray-900 p-5 transition-all cursor-pointer disabled:opacity-50`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.avatar}</span>
                    <div>
                      <div className="font-bold text-white">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.focus}</div>
                    </div>
                  </div>
                  {'return' in item ? (
                    <div className="text-right">
                      <div className={`font-bold text-lg ${textAccent[item.color]}`}>{item.return}</div>
                      <div className="text-xs text-gray-600">{item.period}</div>
                    </div>
                  ) : (
                    <div className={`text-xs font-semibold ${textAccent[item.color]}`}>
                      {(item as typeof copyHodlers[0]).holding}
                    </div>
                  )}
                </div>

                {'quote' in item && (
                  <p className="text-gray-500 text-xs italic mb-2">{item.quote}</p>
                )}

                <p className="text-gray-400 text-sm">
                  {'style' in item ? item.style : (item as typeof copyHodlers[0]).strategy}
                </p>

                <div className={`mt-3 text-xs font-semibold ${textAccent[item.color]}`}>
                  {loading && strategy === item.id ? 'Configurando...' : `Copiar estrategia →`}
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-gray-700 text-xs mt-6">
            El agente nunca ejecuta sin que tú confirmes cada operación.
          </p>
        </div>
      </main>
    );
  }

  // ── Step: Risk config ──
  if (step === 'risk') {
    const isHodler = profile === 'hodler';
    const color = isHodler ? 'blue' : 'orange';

    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-lg">
          <button onClick={() => setStep(method === 'copy' ? 'strategy' : 'method')}
            className="mb-6 text-gray-600 hover:text-white text-sm">← Volver</button>

          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🛡️</div>
            <h1 className="text-2xl font-bold mb-2">Protege tu capital</h1>
            <p className="text-gray-500 text-sm">
              Define cuándo parar pérdidas y cuándo tomar ganancias.<br/>
              Si no sabes, el agente te sugiere los valores ideales.
            </p>
          </div>

          <div className="space-y-6">
            {/* Stop Loss */}
            <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-400 text-lg">🛑</span>
                <span className="font-bold">Stop Loss</span>
                <span className="text-xs text-gray-500 ml-1">— para si baja mucho</span>
              </div>
              <p className="text-gray-500 text-xs mb-4">
                Si el precio cae este porcentaje desde tu entrada, el agente sale automáticamente para no perder más.
              </p>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder={suggested.stopLoss}
                  value={stopLoss}
                  onChange={e => setStopLoss(e.target.value)}
                  className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-red-500 outline-none"
                />
                <button
                  onClick={() => setStopLoss(suggested.stopLoss)}
                  className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/20 transition-all whitespace-nowrap">
                  👽 Sugerido
                </button>
              </div>
              {(stopLoss || suggested.stopLoss) && (
                <p className="text-xs text-gray-600 mt-2">
                  ✓ {stopLoss ? `Salir si baja ${stopLoss}` : suggested.stopLossLabel}
                </p>
              )}
            </div>

            {/* Take Profit */}
            <div className="bg-gray-900 border border-green-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-green-400 text-lg">🎯</span>
                <span className="font-bold">Take Profit</span>
                <span className="text-xs text-gray-500 ml-1">— para tomar ganancias</span>
              </div>
              <p className="text-gray-500 text-xs mb-4">
                Cuando el precio suba este porcentaje desde tu entrada, el agente te avisa para que tomes ganancias.
              </p>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder={suggested.takeProfit}
                  value={takeProfit}
                  onChange={e => setTakeProfit(e.target.value)}
                  className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-green-500 outline-none"
                />
                <button
                  onClick={() => setTakeProfit(suggested.takeProfit)}
                  className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/20 transition-all whitespace-nowrap">
                  👽 Sugerido
                </button>
              </div>
              {(takeProfit || suggested.takeProfit) && (
                <p className="text-xs text-gray-600 mt-2">
                  ✓ {takeProfit ? `Tomar ganancias cuando suba ${takeProfit}` : suggested.takeProfitLabel}
                </p>
              )}
            </div>

            {/* Suggestion box */}
            <div className={`bg-${color}-500/5 border border-${color}-500/20 rounded-xl p-4 text-sm text-gray-400`}>
              <p className="font-semibold text-white mb-1">👽 Recomendación del agente</p>
              {isHodler
                ? <p>Para un hodler a largo plazo: <span className="text-red-400">Stop Loss -15%</span> para aguantar correcciones normales, y <span className="text-green-400">Take Profit +50%</span> para tomar ganancias en subidas fuertes. Puedes ajustarlo cuando quieras.</p>
                : <p>Para un trader activo: <span className="text-red-400">Stop Loss -5%</span> para limitar pérdidas en cada operación, y <span className="text-green-400">Take Profit +10%</span> para asegurar ganancias consistentes. La disciplina aquí es clave.</p>
              }
            </div>
          </div>

          <button
            onClick={handleFinish}
            disabled={loading}
            className={`w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all
              ${!loading
                ? isHodler ? 'bg-blue-500 hover:bg-blue-400 text-white cursor-pointer' : 'bg-orange-500 hover:bg-orange-400 text-white cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
          >
            {loading ? 'Configurando...' : 'Entrar al agente 🛸'}
          </button>

          <p className="text-center text-gray-700 text-xs mt-4">
            Puedes cambiar stop loss y take profit en cualquier momento desde el chat.
          </p>
        </div>
      </main>
    );
  }

  return null;
}
