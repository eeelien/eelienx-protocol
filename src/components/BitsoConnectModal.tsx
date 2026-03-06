'use client';

import { useState } from 'react';

interface BitsoConnectModalProps {
  onClose: () => void;
  onConnect: () => void;
  onManualFlow: () => void;
}

export default function BitsoConnectModal({ onClose, onConnect, onManualFlow }: BitsoConnectModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = email.trim() !== '' && password.trim() !== '' && accepted && !loading;

  const handleConnect = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/bitso-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        onConnect();
      } else {
        setError(data.message || 'Error al conectar');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleManual = () => {
    onClose();
    onManualFlow();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d0d1a] border border-[var(--border)] p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
          Conectar Bitso
        </h2>

        {/* Form */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-gray-500 text-sm"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-gray-500 text-sm"
          />

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 accent-[var(--primary)]"
            />
            <span className="text-sm text-gray-300">Acepto los términos y condiciones</span>
          </label>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Connect button */}
          <button
            onClick={handleConnect}
            disabled={!canSubmit}
            className="w-full py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? 'Conectando...' : 'Conectar'}
          </button>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center">
            No guardamos tu contraseña. Solo la usamos para conectarnos.
          </p>

          {/* Manual flow link */}
          <button
            onClick={handleManual}
            className="w-full text-center text-sm text-[var(--secondary)] hover:underline"
          >
            Conectarlo yo mismo
          </button>
        </div>
      </div>
    </div>
  );
}
