'use client';

import { useState } from 'react';

type ExchangeId = 'bitso' | 'binance' | 'bybit';
type WalletId = 'ledger' | 'metamask';
type TabId = ExchangeId | WalletId;

interface Props {
  onClose: () => void;
  onConnected: (exchange: string, label: string) => void;
}

const EXCHANGES = [
  {
    id: 'bitso' as ExchangeId,
    name: 'Bitso',
    logo: '🇲🇽',
    color: 'from-green-500 to-emerald-600',
    desc: 'Compra/vende con MXN',
    docsUrl: 'https://bitso.com/developers/api',
    docsLabel: 'bitso.com/developers',
  },
  {
    id: 'binance' as ExchangeId,
    name: 'Binance',
    logo: '🟡',
    color: 'from-yellow-500 to-amber-500',
    desc: 'El exchange más grande del mundo',
    docsUrl: 'https://www.binance.com/en/my/settings/api-management',
    docsLabel: 'binance.com → API Management',
  },
  {
    id: 'bybit' as ExchangeId,
    name: 'Bybit',
    logo: '🟠',
    color: 'from-orange-500 to-red-500',
    desc: 'Para traders avanzados',
    docsUrl: 'https://www.bybit.com/app/user/api-management',
    docsLabel: 'bybit.com → API Management',
  },
];

const WALLETS = [
  {
    id: 'ledger' as WalletId,
    name: 'Ledger / Trezor',
    logo: '🧊',
    color: 'from-blue-500 to-indigo-600',
    desc: 'Solo lectura — pega tu dirección pública',
  },
  {
    id: 'metamask' as WalletId,
    name: 'MetaMask',
    logo: '🦊',
    color: 'from-orange-400 to-orange-600',
    desc: 'Solo lectura — dirección Ethereum (0x...)',
  },
];

export default function ExchangeConnectModal({ onClose, onConnected }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('bitso');
  const [bitsoStep, setBitsoStep] = useState<'guide' | 'form'>('guide');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  const isExchange = ['bitso', 'binance', 'bybit'].includes(activeTab);
  const isWallet = ['ledger', 'metamask'].includes(activeTab);

  const activeExchange = EXCHANGES.find(e => e.id === activeTab);
  const activeWallet = WALLETS.find(w => w.id === activeTab);

  const canSubmit = isExchange
    ? apiKey.trim() !== '' && apiSecret.trim() !== '' && accepted && !loading
    : address.trim() !== '' && !loading;

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setApiKey('');
    setApiSecret('');
    setAddress('');
    setError('');
    if (tab === 'bitso') setBitsoStep('guide');
  };

  const handleConnect = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    try {
      const body = isExchange
        ? { exchange: activeTab, apiKey, apiSecret }
        : { exchange: activeTab, address };

      const res = await fetch('/api/exchange-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        const label = isExchange
          ? EXCHANGES.find(e => e.id === activeTab)?.name || activeTab
          : WALLETS.find(w => w.id === activeTab)?.name || activeTab;
        onConnected(activeTab, label);
      } else {
        setError(data.message || 'Error al conectar. Verifica tus credenciales.');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0d0d1a] border border-[var(--border)] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-6 pb-0">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors text-xl">✕</button>
          <h2 className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent mb-1">
            Conectar cuenta
          </h2>
          <p className="text-sm text-gray-400">Elige tu exchange o cartera fría</p>
        </div>

        {/* Exchange / Wallet tabs */}
        <div className="p-6 pb-0">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Exchanges</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {EXCHANGES.map(ex => (
              <button
                key={ex.id}
                onClick={() => handleTabChange(ex.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  activeTab === ex.id
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border)] bg-black/20 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-1">{ex.logo}</div>
                <div className="text-xs font-semibold">{ex.name}</div>
                <div className="text-[10px] text-gray-500">{ex.desc}</div>
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Carteras frías (solo lectura)</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {WALLETS.map(w => (
              <button
                key={w.id}
                onClick={() => handleTabChange(w.id)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  activeTab === w.id
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border)] bg-black/20 hover:border-gray-500'
                }`}
              >
                <div className="text-2xl mb-1">{w.logo}</div>
                <div className="text-xs font-semibold">{w.name}</div>
                <div className="text-[10px] text-gray-500">{w.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="p-6 pt-2 space-y-4">

          {/* Bitso: guía paso a paso */}
          {activeTab === 'bitso' && bitsoStep === 'guide' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white">Cómo crear tu API Key en Bitso</p>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 font-medium">
                  🔒 Tu contraseña nunca la vemos
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { n: 1, text: <>Entra a <a href="https://bitso.com" target="_blank" rel="noreferrer" className="text-[var(--primary)] hover:underline">bitso.com</a> e inicia sesión</> },
                  { n: 2, text: <>Haz clic en tu foto de perfil (arriba a la derecha) → <strong className="text-white">Configuración de cuenta</strong></> },
                  { n: 3, text: <>En el menú lateral izquierdo selecciona <strong className="text-white">API Keys</strong></> },
                  { n: 4, text: <>Haz clic en <strong className="text-white">Crear API Key</strong></> },
                  { n: 5, text: <><strong className="text-yellow-400">⚠️ Permisos:</strong> activa solo <strong className="text-white">Ver saldo</strong> y <strong className="text-white">Ver órdenes</strong>. <span className="text-red-400">NUNCA actives Retiros</span></> },
                  { n: 6, text: <>Copia tu <strong className="text-white">API Key</strong> y <strong className="text-white">API Secret</strong> — el Secret solo se muestra una vez</> },
                ].map(step => (
                  <div key={step.n} className="flex gap-3 items-start p-2 rounded-lg bg-black/20 border border-[var(--border)]/50">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)]/40 text-[var(--primary)] text-xs font-bold flex items-center justify-center">
                      {step.n}
                    </span>
                    <span className="text-xs text-gray-300 leading-relaxed">{step.text}</span>
                  </div>
                ))}
              </div>
              <a
                href="https://bitso.com/r/security/api"
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs text-[var(--primary)] hover:underline mt-1"
              >
                Ir directo a API Keys de Bitso →
              </a>
              <button
                onClick={() => setBitsoStep('form')}
                className="w-full py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm mt-1"
              >
                Ya tengo mi API Key →
              </button>
            </div>
          )}

          {/* Exchange form (Bitso en step form + Binance + Bybit) */}
          {isExchange && activeExchange && (activeTab !== 'bitso' || bitsoStep === 'form') && (
            <>
              {activeTab === 'bitso' && (
                <button
                  onClick={() => setBitsoStep('guide')}
                  className="text-xs text-gray-400 hover:text-[var(--primary)] transition-colors mb-1"
                >
                  ← Ver instrucciones
                </button>
              )}
              {activeTab !== 'bitso' && (
                <div className="p-3 rounded-lg bg-black/30 border border-[var(--border)] text-xs text-gray-400">
                  📋 Crea tu API Key en{' '}
                  <a href={activeExchange.docsUrl} target="_blank" rel="noreferrer" className="text-[var(--primary)] hover:underline">
                    {activeExchange.docsLabel}
                  </a>
                </div>
              )}
              <input
                type="text"
                placeholder="API Key"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-gray-500 text-sm font-mono"
              />
              <input
                type="password"
                placeholder="API Secret"
                value={apiSecret}
                onChange={e => setApiSecret(e.target.value)}
                className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-gray-500 text-sm font-mono"
              />
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="mt-1 accent-[var(--primary)]"
                />
                <span className="text-sm text-gray-300">
                  Entiendo que mis API Keys se guardan cifradas y solo se usan para operar en mi nombre
                </span>
              </label>
            </>
          )}

          {/* Cold wallet form */}
          {isWallet && activeWallet && (
            <>
              <div className="p-3 rounded-lg bg-black/30 border border-[var(--border)] text-xs text-gray-400">
                🔒 <strong className="text-white">Solo lectura</strong> — eelienX nunca puede mover tu crypto desde aquí.
                {activeTab === 'ledger' && ' Pega tu dirección pública de Bitcoin (empieza con 1, 3 o bc1) o Ethereum (0x...).'}
                {activeTab === 'metamask' && ' Pega tu dirección pública de Ethereum (0x...).'}
              </div>
              <input
                type="text"
                placeholder={
                  activeTab === 'ledger'
                    ? 'Dirección pública (bc1q... o 0x...)'
                    : 'Dirección Ethereum (0x...)'
                }
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-gray-500 text-sm font-mono"
              />
            </>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
              ⚠️ {error}
            </div>
          )}

          {(activeTab !== 'bitso' || bitsoStep === 'form') && (
            <>
              <button
                onClick={handleConnect}
                disabled={!canSubmit}
                className="w-full py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-sm"
              >
                {loading
                  ? 'Verificando...'
                  : isWallet
                  ? '🔍 Leer saldo'
                  : `🔗 Conectar ${activeExchange?.name}`}
              </button>

              <p className="text-xs text-gray-500 text-center">
                {isExchange
                  ? 'Tus API Keys se cifran con AES-256. Nunca se comparten con terceros.'
                  : 'Tu dirección pública no permite hacer transacciones. Es como darte tu CLABE para que te depositen.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
