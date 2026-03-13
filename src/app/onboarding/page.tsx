'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'trader' | 'hodler' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!selected) return;
    setLoading(true);
    localStorage.setItem('eelienx_profile', selected);
    router.push('/chat');
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">👽</div>
        <h1 className="text-2xl font-bold mb-2">¿Cuál es tu estilo?</h1>
        <p className="text-gray-400 text-sm max-w-sm">
          Cuéntame cómo operas y personalizaré mi forma de ayudarte.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl mb-10">

        {/* Trader activo */}
        <button
          onClick={() => setSelected('trader')}
          className={`flex-1 rounded-2xl border-2 p-6 text-left transition-all duration-200 cursor-pointer
            ${selected === 'trader'
              ? 'border-green-400 bg-green-400/10 shadow-lg shadow-green-400/20'
              : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
        >
          <div className="text-4xl mb-3">🔥</div>
          <h2 className="text-xl font-bold mb-2">Trader activo</h2>
          <p className="text-gray-400 text-sm mb-4">
            Quiero operar, comprar y vender. Busco oportunidades en el mercado y quiero actuar rápido.
          </p>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span className="text-gray-300">Análisis técnico antes de cada operación</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span className="text-gray-300">El agente ejecuta, pero tú siempre confirmas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span className="text-gray-300">Alertas de precio y señales de mercado</span>
            </li>
          </ul>
          {selected === 'trader' && (
            <div className="mt-4 text-green-400 text-sm font-semibold">✓ Seleccionado</div>
          )}
        </button>

        {/* Hodler pasivo */}
        <button
          onClick={() => setSelected('hodler')}
          className={`flex-1 rounded-2xl border-2 p-6 text-left transition-all duration-200 cursor-pointer
            ${selected === 'hodler'
              ? 'border-blue-400 bg-blue-400/10 shadow-lg shadow-blue-400/20'
              : 'border-gray-700 bg-gray-900 hover:border-gray-500'}`}
        >
          <div className="text-4xl mb-3">🧊</div>
          <h2 className="text-xl font-bold mb-2">Hodler pasivo</h2>
          <p className="text-gray-400 text-sm mb-4">
            Prefiero rendimientos a largo plazo. Meto mi capital, lo dejo crecer y no me complico la vida.
          </p>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span className="text-gray-300">Estrategia de holdeo explicada en simple</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span className="text-gray-300">Por qué el holdeo funciona a largo plazo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span className="text-gray-300">El agente ejecuta cuando tú lo decides</span>
            </li>
          </ul>
          {selected === 'hodler' && (
            <div className="mt-4 text-blue-400 text-sm font-semibold">✓ Seleccionado</div>
          )}
        </button>
      </div>

      {/* CTA */}
      <button
        onClick={handleContinue}
        disabled={!selected || loading}
        className={`w-full max-w-xs py-4 rounded-xl font-bold text-lg transition-all duration-200
          ${selected
            ? selected === 'trader'
              ? 'bg-green-400 text-black hover:bg-green-300 cursor-pointer'
              : 'bg-blue-400 text-black hover:bg-blue-300 cursor-pointer'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
      >
        {loading ? 'Entrando...' : selected ? 'Entrar al agente 🛸' : 'Elige tu perfil'}
      </button>

      <p className="text-gray-600 text-xs mt-6 text-center">
        Puedes cambiar tu perfil en cualquier momento desde el chat.
      </p>
    </main>
  );
}
