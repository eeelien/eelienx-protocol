'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const WORDS = ['wallet','galaxy','token','shield','lunar','orbit','digital','crypto','signal','secure','vault','apex'];

export default function DemoSeedPage() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-[#0d0d1a] border border-yellow-500/40 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔐</div>
            <h2 className="text-xl font-bold text-yellow-400">Tu frase semilla</h2>
            <p className="text-sm text-gray-400 mt-2">
              Esta es tu llave maestra. <strong className="text-white">Guárdala en papel, en un lugar seguro.</strong> Si pierdes tu contraseña, la necesitarás para recuperar tu cuenta.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {WORDS.map((word, i) => (
              <div key={i} className="bg-[#1a1a2e] border border-yellow-500/20 rounded-lg p-2 text-center">
                <span className="text-xs text-gray-500 block">{i + 1}</span>
                <span className="text-sm font-mono text-yellow-300">{word}</span>
              </div>
            ))}
          </div>

          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-6">
            <p className="text-xs text-red-400 text-center">
              ⚠️ Nunca compartas esta frase. Quien la tenga, tiene acceso total a tu cuenta.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
              className="w-4 h-4 accent-yellow-400"/>
            <span className="text-sm text-gray-300">He guardado mi frase semilla en un lugar seguro</span>
          </label>

          <button
            onClick={() => router.push('/onboarding?reset=1')}
            disabled={!confirmed}
            className="w-full py-3 rounded-xl font-bold text-black transition-all"
            style={{ background: confirmed ? '#facc15' : '#374151', cursor: confirmed ? 'pointer' : 'not-allowed' }}>
            Continuar al onboarding →
          </button>
        </div>
      </div>
    </div>
  );
}
