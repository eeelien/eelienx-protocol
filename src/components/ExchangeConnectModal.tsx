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

          {/* Exchange form */}
          {isExchange && activeExchange && (
            <>
              <div className="p-3 rounded-lg bg-black/30 border border-[var(--border)] text-xs text-gray-400">
                📋 Crea tu API Key en{' '}
                <a href={activeExchange.docsUrl} target="_blank" rel="noreferrer" className="text-[var(--primary)] hover:underline">
                  {activeExchange.docsLabel}
                </a>
                {activeExchange.id === 'bitso' && (
                  <span> · Activa permisos: <strong className="text-white">Balance + Trading</strong> (NO Withdrawal)</span>
                )}
              </div>
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
        </div>
      </div>
    </div>
  );
}
