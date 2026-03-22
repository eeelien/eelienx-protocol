'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const PRICES_DEMO = ['BTC $97,420', 'ETH $3,841', 'SOL $182', 'BNB $614', 'XRP $2.31'];

const FEATURES = [
  { icon: '📊', title: 'Precios en tiempo real', desc: 'CoinGecko + tus exchanges en un solo lugar. Sin abrir 10 pestañas.' },
  { icon: '🔐', title: 'Opera con autorización', desc: 'eelienX propone, tú autorizas. Nunca se mueve un peso sin tu OK.' },
  { icon: '🧠', title: 'Análisis inteligente', desc: 'El agente analiza el mercado y te dice si es buen momento o no. En español claro.' },
  { icon: '🏦', title: 'Multi-exchange', desc: 'Conecta Bitso, Binance o Bybit. Todos tus fondos en un solo panel.' },
  { icon: '🧊', title: 'Cartera fría incluida', desc: 'Monitorea tu Ledger o MetaMask. Solo lectura — nadie puede mover tu crypto de ahí.' },
  { icon: '📈', title: 'Registro de rendimiento', desc: 'Dile cuánto pusiste al inicio. eelienX te muestra si vas ganando o perdiendo, con gráfica.' },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'siempre',
    color: 'border-gray-700',
    features: ['Precios en tiempo real', 'Análisis de mercado', 'Ver portafolio', '2 consultas premium gratis'],
    cta: 'Empezar gratis',
    highlight: false,
  },
  {
    name: 'Básico',
    price: '$99',
    period: 'MXN/mes',
    color: 'border-[var(--primary)]',
    features: ['Todo lo de Free', '1 exchange conectado', '50 operaciones/mes', 'Alertas de precio', 'Registro de rendimiento'],
    cta: 'Quiero el Básico',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '$299',
    period: 'MXN/mes',
    color: 'border-[var(--secondary)]',
    features: ['Todo lo de Básico', 'Exchanges ilimitados', 'Cartera fría (Ledger/Trezor)', 'Operaciones ilimitadas', 'Análisis avanzado + gráficas'],
    cta: 'Quiero el Premium',
    highlight: false,
  },
];

const STEPS = [
  { n: '01', title: 'Conecta tu exchange', desc: 'Bitso, Binance o Bybit. Solo necesitas tu API Key — como en cualquier app de trading.' },
  { n: '02', title: 'Pregúntale al agente', desc: 'En español normal. "¿Es buen momento de comprar?" o "Compra 0.001 BTC por mí".' },
  { n: '03', title: 'Tú autorizas, él ejecuta', desc: 'Cada operación necesita tu OK. eelienX nunca mueve dinero sin que tú lo apruebes.' },
];

export default function Landing() {
  const [tickerIdx, setTickerIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTickerIdx(i => (i + 1) % PRICES_DEMO.length);
        setVisible(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card-bg)] backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-sm">
              👽
            </div>
            <span className="font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
              eelienX Protocol
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              {PRICES_DEMO[tickerIdx]}
            </span>
            <Link
              href="/chat"
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Abrir app →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--primary)]/5 blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-[var(--secondary)]/5 blur-[100px]" />
        </div>

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-xs text-[var(--primary)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
          Hecho para LatAm · Crypto sin miedo
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight">
          Tu agente crypto
          <br />
          <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
            personal
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-xl mb-8 leading-relaxed">
          Pregúntale en español. Él analiza, opera y registra.
          <br className="hidden sm:block" />
          Tú solo autorizas. <strong className="text-white">Simple.</strong>
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/chat"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black font-bold text-base hover:opacity-90 transition-opacity active:scale-95"
          >
            Empezar gratis 🛸
          </Link>
          <a
            href="#como-funciona"
            className="px-8 py-3.5 rounded-xl bg-black/30 border border-[var(--border)] text-white font-semibold text-base hover:border-[var(--primary)] transition-colors"
          >
            Ver cómo funciona
          </a>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-xs text-gray-500">
          Compatible con Bitso · Binance · Bybit · Ledger · MetaMask
        </p>
      </section>

      {/* ── Cómo funciona ─────────────────────────────────────── */}
      <section id="como-funciona" className="py-20 px-4 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Cómo funciona</h2>
          <p className="text-center text-gray-400 mb-12">Tres pasos y ya estás operando</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map(step => (
              <div key={step.n} className="relative p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                <div className="text-4xl font-black text-[var(--primary)]/20 mb-4">{step.n}</div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Chat demo ─────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Habla normal</h2>
          <p className="text-center text-gray-400 mb-10">Sin tecnicismos. Sin buscar tutoriales.</p>
          <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] p-4 space-y-3">
            {[
              { type: 'user', text: '¿Es buen momento para comprar Bitcoin?' },
              { type: 'agent', text: '🧠 Bitcoin bajó 3.2% hoy. Está en corrección moderada — posible oportunidad de compra. ¿Quieres que compre una pequeña cantidad?' },
              { type: 'user', text: 'Sí, compra $500 MXN en BTC' },
              { type: 'agent', text: '🔐 Voy a comprar ~0.000051 BTC ($500 MXN) en Bitso. ¿Autorizas?' },
              { type: 'permission', text: '✓ Autorizar · ✗ Rechazar' },
              { type: 'agent', text: '✅ ¡Listo! Compraste 0.000051 BTC. Tu saldo se actualizó. 🛸' },
            ].map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'permission' ? (
                  <div className="w-full p-3 rounded-xl border-2 border-yellow-500/50 bg-yellow-500/5 text-sm text-center text-yellow-400 font-medium">
                    🔐 {msg.text}
                  </div>
                ) : (
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.type === 'user'
                      ? 'bg-[var(--primary)] text-black rounded-br-sm'
                      : 'bg-black/40 border border-[var(--border)] rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Todo en un lugar</h2>
          <p className="text-center text-gray-400 mb-12">Sin apps extra. Sin hojas de cálculo.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors group">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold mb-2 group-hover:text-[var(--primary)] transition-colors">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-black/20 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Planes</h2>
          <p className="text-center text-gray-400 mb-12">Empieza gratis. Escala cuando lo necesites.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <div key={plan.name} className={`relative p-6 rounded-2xl bg-[var(--card-bg)] border-2 ${plan.color} flex flex-col`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--primary)] text-black text-xs font-bold">
                    Más popular
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black">{plan.price}</span>
                    <span className="text-sm text-gray-400">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-[var(--primary)] mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/chat"
                  className={`w-full py-2.5 rounded-xl text-center font-semibold text-sm transition-opacity hover:opacity-90 active:scale-95 ${
                    plan.highlight
                      ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black'
                      : 'bg-black/40 border border-[var(--border)] text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-[var(--border)] text-center">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl mb-6">👽</div>
          <h2 className="text-3xl font-bold mb-4">¿Lista para dejar de adivinar?</h2>
          <p className="text-gray-400 mb-8">
            eelienX no promete hacerte millonaria. Te promete que vas a entender qué está pasando con tu crypto y que nunca vas a operar sola.
          </p>
          <Link
            href="/chat"
            className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black font-bold text-lg hover:opacity-90 transition-opacity active:scale-95"
          >
            Empezar ahora · Es gratis 🛸
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <span>© 2026 eelienX Protocol · Hecho en México 🇲🇽</span>
          <span>Precios via CoinGecko · No somos asesores financieros</span>
        </div>
      </footer>

    </div>
  );
}
