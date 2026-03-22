'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DEMO_SEED = 'wallet galaxy token shield lunar orbit digital crypto signal secure vault apex';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('demo=1')) {
      setSeedPhrase(DEMO_SEED);
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        setSeedPhrase(data.seedPhrase);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de frase semilla
  if (seedPhrase) {
    const words = seedPhrase.split(' ');
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

            {/* Frase semilla */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {words.map((word, i) => (
                <div key={i} className="flex items-center gap-2 bg-black/40 border border-yellow-500/20 rounded-lg px-3 py-2">
                  <span className="text-yellow-600 text-xs font-mono w-4">{i + 1}.</span>
                  <span className="text-white text-sm font-mono">{word}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400 mb-6">
              ⚠️ <strong>Nunca la compartas.</strong> eelienX no la guarda en ningún servidor — si la pierdes, no podemos recuperarla.
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="mt-1 accent-yellow-400"
              />
              <span className="text-sm text-gray-300">
                Ya la guardé en un lugar seguro y entiendo que no puedo recuperarla si la pierdo
              </span>
            </label>

            <button
              onClick={() => router.push('/onboarding')}
              disabled={!confirmed}
              className="w-full py-3 bg-gradient-to-r from-[#00ff88] to-[#00aaff] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 text-sm"
            >
              Entrar al agente 🛸
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de registro
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👽</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00ff88] to-[#00aaff] bg-clip-text text-transparent">
            eelienX Protocol
          </h1>
          <p className="text-gray-400 text-sm mt-1">Crea tu cuenta</p>
        </div>

        <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">Registro</h2>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00ff88] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00ff88] transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00ff88] transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#00ff88] to-[#00aaff] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 text-sm mt-2"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta 🛸'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#00ff88] hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
