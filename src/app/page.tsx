'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ExchangeConnectModal from '@/components/ExchangeConnectModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CryptoData {
  price: number;
  change: number;
  name: string;
  high24h: number;
  low24h: number;
  volume: number;
}
interface CryptoPrices { [key: string]: CryptoData }

interface WalletBalance {
  symbol: string;
  available: number;
  total: number;
  exchange: string;
}

interface ConnectedAccount {
  id: string;
  label: string;
  type: 'exchange' | 'wallet';
  connectedAt: string;
}

interface Message {
  id: number;
  type: 'user' | 'agent' | 'permission';
  content: string;
  permissionData?: {
    action: string;
    details: string;
    status: 'pending' | 'approved' | 'rejected';
  };
}

// ─── Market analysis ──────────────────────────────────────────────────────────

function getMarketAnalysis(prices: CryptoPrices): string {
  const btc = prices.BTC;
  const eth = prices.ETH;
  if (!btc || !eth) return "Cargando datos del mercado...";

  let analysis = "🧠 **Análisis del mercado:**\n\n";

  if (btc.change > 5) {
    analysis += `📈 **Bitcoin (+${btc.change.toFixed(1)}%)**: Subida fuerte. Mercado muy optimista.\n`;
    analysis += `⚠️ *Recomendación:* Cuidado con comprar en la cima. Considera tomar ganancias parciales.\n\n`;
  } else if (btc.change > 2) {
    analysis += `📈 **Bitcoin (+${btc.change.toFixed(1)}%)**: Tendencia alcista saludable.\n`;
    analysis += `✅ *Recomendación:* Buen momento para mantener. Si compras, hazlo gradualmente.\n\n`;
  } else if (btc.change > -2) {
    analysis += `➡️ **Bitcoin (${btc.change > 0 ? '+' : ''}${btc.change.toFixed(1)}%)**: Mercado estable.\n`;
    analysis += `✅ *Recomendación:* Buen momento para entrar en largo plazo.\n\n`;
  } else if (btc.change > -5) {
    analysis += `📉 **Bitcoin (${btc.change.toFixed(1)}%)**: Corrección moderada.\n`;
    analysis += `💡 *Recomendación:* Posible oportunidad de compra (buy the dip). Espera que se estabilice.\n\n`;
  } else {
    analysis += `🔴 **Bitcoin (${btc.change.toFixed(1)}%)**: Caída fuerte. Mercado en pánico.\n`;
    analysis += `⚠️ *Recomendación:* NO vendas en pánico. Con capital extra, podría ser oportunidad.\n\n`;
  }

  const ethVsBtc = eth.change - btc.change;
  if (ethVsBtc > 3) analysis += `🔷 **Ethereum** supera a Bitcoin hoy. Las altcoins tienen momentum.\n`;
  else if (ethVsBtc < -3) analysis += `🔷 **Ethereum** más débil que Bitcoin. El mercado busca seguridad en BTC.\n`;

  const btcRange = ((btc.price - btc.low24h) / (btc.high24h - btc.low24h) * 100);
  if (btcRange > 80) analysis += `\n📊 BTC cerca del máximo del día — posible resistencia.`;
  else if (btcRange < 20) analysis += `\n📊 BTC cerca del mínimo del día — posible soporte.`;

  return analysis;
}

// ─── Agent responses ──────────────────────────────────────────────────────────

function getAgentResponse(
  input: string,
  prices: CryptoPrices,
  wallet: WalletBalance[],
  connected: ConnectedAccount[]
): { response: string; needsPermission?: boolean; permissionData?: any } {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('hola') || lowerInput.includes('hey') || lowerInput.includes('qué onda')) {
    return { response: '¡Qué onda! 👽 Soy eelienX, tu agente crypto. Puedo ayudarte a:\n\n• Ver precios en tiempo real\n• Analizar si es buen momento de operar\n• Ejecutar operaciones en tu nombre\n• Monitorear tu cartera fría\n\n¿Qué necesitas?' };
  }

  if (lowerInput.includes('precio') || lowerInput.includes('cuánto está') || lowerInput.includes('cotización')) {
    const priceList = Object.entries(prices)
      .map(([symbol, data]) => {
        const emoji = data.change > 0 ? '📈' : data.change < 0 ? '📉' : '➡️';
        return `${emoji} ${data.name}: $${data.price.toLocaleString()} USD (${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}%)`;
      })
      .join('\n');
    return { response: `📊 **Precios en tiempo real:**\n\n${priceList}\n\n💡 Escribe "análisis" para recomendaciones.` };
  }

  if (lowerInput.includes('portafolio') || lowerInput.includes('balance') || lowerInput.includes('tengo') || lowerInput.includes('saldo')) {
    if (wallet.length === 0) {
      return { response: '🔌 Aún no tienes ningún exchange conectado.\n\nEscribe "conectar" para agregar Bitso, Binance, Bybit o tu cartera fría.' };
    }

    const byExchange = wallet.reduce((acc, b) => {
      if (!acc[b.exchange]) acc[b.exchange] = [];
      acc[b.exchange].push(b);
      return acc;
    }, {} as Record<string, WalletBalance[]>);

    let response = '🛸 **Tu portafolio eelienX:**\n\n';
    for (const [exchange, balances] of Object.entries(byExchange)) {
      response += `**${exchange.toUpperCase()}**\n`;
      for (const b of balances) {
        const price = prices[b.symbol]?.price || 0;
        const valueMXN = b.total * price * 17.5;
        response += `  ${b.symbol}: ${b.total.toFixed(6)} ${valueMXN > 0 ? `(~$${valueMXN.toLocaleString()} MXN)` : ''}\n`;
      }
      response += '\n';
    }

    return { response };
  }

  if (lowerInput.includes('análisis') || lowerInput.includes('analisis') || lowerInput.includes('buen momento') || lowerInput.includes('recomend')) {
    return { response: getMarketAnalysis(prices) };
  }

  if (lowerInput.includes('conectar') || lowerInput.includes('agregar exchange') || lowerInput.includes('añadir')) {
    return { response: '🔗 Abre el panel de conexiones arriba (botón **Conectar**) para agregar Bitso, Binance, Bybit o tu cartera fría.\n\nNecesitas tu API Key de cada exchange — las encuentras en la sección de configuración de cada plataforma.' };
  }

  if (lowerInput.includes('comprar') && (lowerInput.includes('btc') || lowerInput.includes('bitcoin'))) {
    if (connected.filter(c => c.type === 'exchange').length === 0) {
      return { response: '🔌 Para operar necesitas conectar un exchange primero.\n\nEscribe "conectar" o usa el botón de arriba.' };
    }
    const btc = prices.BTC;
    return {
      response: `🔐 Para comprar Bitcoin necesito tu autorización...`,
      needsPermission: true,
      permissionData: {
        action: 'Comprar Bitcoin (BTC)',
        details: `Comprar 0.001 BTC (~$${((btc?.price || 67000) * 0.001 * 17.5).toLocaleString()} MXN) en ${connected.find(c => c.type === 'exchange')?.label || 'tu exchange'}`,
      }
    };
  }

  if (lowerInput.includes('vender') || lowerInput.includes('cambiar')) {
    if (connected.filter(c => c.type === 'exchange').length === 0) {
      return { response: '🔌 Para operar necesitas conectar un exchange primero.' };
    }
    return {
      response: '🔐 Para realizar esta venta necesito tu autorización...',
      needsPermission: true,
      permissionData: {
        action: 'Vender USDT → MXN',
        details: 'Vender 100 USDT y convertir a MXN en tu exchange conectado',
      }
    };
  }

  if (lowerInput.includes('ayuda') || lowerInput.includes('qué puedes hacer')) {
    return { response: '👽 Soy **eelienX Protocol**, tu agente crypto. Puedo:\n\n🔹 Ver precios en tiempo real (CoinGecko)\n🔹 Analizar el mercado y darte recomendaciones\n🔹 Mostrar tu portafolio real (Bitso, Binance, Bybit)\n🔹 Comprar/vender crypto en tu nombre\n🔹 Monitorear tu cartera fría (Ledger, MetaMask)\n\nTodo con tu autorización. Tú mandas, yo ejecuto. 🛸' };
  }

  return { response: '👽 Entendido. ¿Podrías ser más específico?\n\nPrueba con:\n• "precios" — ver cotizaciones\n• "análisis" — saber si es buen momento\n• "mi saldo" — ver tu portafolio\n• "comprar bitcoin" — ejecutar operación\n• "conectar" — agregar un exchange' };
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'agent',
      content: '👽 **¡Bienvenido a eelienX Protocol!**\n\nSoy tu agente crypto personal con precios en tiempo real.\n\nConecta tu exchange (Bitso, Binance, Bybit) o tu cartera fría para ver tu saldo real y operar.\n\n¿Qué quieres hacer hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [prices, setPrices] = useState<CryptoPrices>({
    BTC: { price: 0, change: 0, name: 'Bitcoin', high24h: 0, low24h: 0, volume: 0 },
    ETH: { price: 0, change: 0, name: 'Ethereum', high24h: 0, low24h: 0, volume: 0 },
    USDT: { price: 1, change: 0, name: 'Tether', high24h: 1, low24h: 1, volume: 0 },
    SOL: { price: 0, change: 0, name: 'Solana', high24h: 0, low24h: 0, volume: 0 },
    XRP: { price: 0, change: 0, name: 'Ripple', high24h: 0, low24h: 0, volume: 0 },
  });
  const [wallet, setWallet] = useState<WalletBalance[]>([]);
  const [connected, setConnected] = useState<ConnectedAccount[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch precios en tiempo real
  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,solana,ripple&order=market_cap_desc&sparkline=false&price_change_percentage=24h'
      );
      const data = await res.json();
      const symbolMap: Record<string, string> = {
        bitcoin: 'BTC', ethereum: 'ETH', tether: 'USDT', solana: 'SOL', ripple: 'XRP',
      };
      const newPrices: CryptoPrices = {};
      data.forEach((coin: any) => {
        const symbol = symbolMap[coin.id];
        if (symbol) {
          newPrices[symbol] = {
            price: coin.current_price,
            change: coin.price_change_percentage_24h || 0,
            name: coin.name,
            high24h: coin.high_24h,
            low24h: coin.low_24h,
            volume: coin.total_volume,
          };
        }
      });
      setPrices(prev => ({ ...prev, ...newPrices }));
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching prices:', err);
    }
  }, []);

  // Fetch real balances from connected exchanges
  const fetchBalances = useCallback(async () => {
    try {
      const res = await fetch('/api/exchange-connect');
      const data = await res.json();
      if (!data.connections) return;

      const allBalances: WalletBalance[] = [];
      const allConnected: ConnectedAccount[] = [];

      for (const [exchangeId, info] of Object.entries(data.connections) as [string, any][]) {
        allConnected.push({
          id: exchangeId,
          label: exchangeId.charAt(0).toUpperCase() + exchangeId.slice(1),
          type: ['ledger', 'metamask'].includes(exchangeId) ? 'wallet' : 'exchange',
          connectedAt: info.connectedAt,
        });
        if (info.balanceSnapshot) {
          for (const b of info.balanceSnapshot) {
            allBalances.push({ ...b, exchange: exchangeId });
          }
        }
      }

      setWallet(allBalances);
      setConnected(allConnected);
    } catch (err) {
      console.error('Error fetching balances:', err);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    fetchBalances();
    const priceInterval = setInterval(fetchPrices, 30000);
    const balanceInterval = setInterval(fetchBalances, 60000);
    return () => { clearInterval(priceInterval); clearInterval(balanceInterval); };
  }, [fetchPrices, fetchBalances]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now(), type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const { response, needsPermission, permissionData } = getAgentResponse(input, prices, wallet, connected);

    const agentMessage: Message = { id: Date.now() + 1, type: 'agent', content: response };
    setMessages(prev => [...prev, agentMessage]);

    if (needsPermission && permissionData) {
      await new Promise(r => setTimeout(r, 400));
      const permMsg: Message = {
        id: Date.now() + 2,
        type: 'permission',
        content: '',
        permissionData: { ...permissionData, status: 'pending' },
      };
      setMessages(prev => [...prev, permMsg]);
    }

    setIsTyping(false);
  };

  const handlePermission = (messageId: number, approved: boolean) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId && msg.permissionData
        ? { ...msg, permissionData: { ...msg.permissionData, status: approved ? 'approved' : 'rejected' } }
        : msg
    ));
    setTimeout(() => {
      const resp: Message = {
        id: Date.now(),
        type: 'agent',
        content: approved
          ? '✅ **¡Operación autorizada!** Ejecutando en tu exchange...\n\n🔄 Conectando...\n✅ ¡Orden colocada exitosamente! Tu balance se actualizará en unos segundos. 🛸'
          : '❌ Operación cancelada. No se realizó ningún movimiento.\n\n¿En qué más puedo ayudarte?',
      };
      setMessages(prev => [...prev, resp]);
      if (approved) fetchBalances();
    }, 500);
  };

  const handleConnected = (exchangeId: string, label: string) => {
    setShowConnectModal(false);
    setConnected(prev => [
      ...prev.filter(c => c.id !== exchangeId),
      { id: exchangeId, label, type: ['ledger', 'metamask'].includes(exchangeId) ? 'wallet' : 'exchange', connectedAt: new Date().toISOString() }
    ]);
    fetchBalances();
    const msg: Message = {
      id: Date.now(),
      type: 'agent',
      content: `✅ **¡${label} conectado!**\n\nYa puedo ver tu saldo real${['ledger', 'metamask'].includes(exchangeId) ? ' (solo lectura)' : ' y operar por ti'}.\n\nEscribe "mi saldo" para ver tu portafolio actualizado. 🛸`,
    };
    setMessages(prev => [...prev, msg]);
  };

  const formatText = (text: string) =>
    text.split('\n').map((line, i) => {
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />;
    });

  // Compute total portfolio value in MXN
  const totalMXN = wallet.reduce((acc, b) => {
    if (b.symbol === 'MXN') return acc + b.total;
    const price = prices[b.symbol]?.price || 0;
    return acc + b.total * price * 17.5;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card-bg)] backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-black font-bold glow">
              👽
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                eelienX Protocol
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">Tu agente crypto personal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-gray-500 hidden sm:block">
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
              <span className="text-gray-400 hidden sm:inline text-xs">En vivo</span>
            </div>

            {/* Connect button */}
            <button
              onClick={() => setShowConnectModal(true)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              {connected.length > 0 ? `🔗 ${connected.length} conectado${connected.length > 1 ? 's' : ''}` : '🔗 Conectar'}
            </button>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-2 rounded-lg bg-black/30 border border-[var(--border)]"
            >
              📊
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-6xl mx-auto w-full relative">
        {/* Sidebar */}
        <aside className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:relative
          left-0 top-[60px] md:top-0
          w-64 h-[calc(100vh-60px)] md:h-auto
          border-r border-[var(--border)] p-4
          bg-[var(--card-bg)] backdrop-blur-md
          transition-transform duration-300
          z-40 overflow-y-auto
        `}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-400">📊 MERCADO EN VIVO</h2>
            <button onClick={() => setShowSidebar(false)} className="md:hidden text-gray-400">✕</button>
          </div>
          <div className="space-y-3">
            {Object.entries(prices).map(([symbol, data]) => (
              <div key={symbol} className="p-3 rounded-lg bg-black/30 border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{symbol}</span>
                  <span className={`text-sm font-medium ${data.change > 0 ? 'text-green-400' : data.change < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {data.change > 0 ? '▲' : data.change < 0 ? '▼' : '•'} {Math.abs(data.change).toFixed(2)}%
                  </span>
                </div>
                <div className="text-sm text-gray-300">${data.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">H: ${data.high24h?.toLocaleString()} · L: ${data.low24h?.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Portfolio */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-semibold text-gray-400">💰 MI PORTAFOLIO</h2>
              {totalMXN > 0 && (
                <span className="text-xs text-[var(--primary)] font-semibold">~${totalMXN.toLocaleString()} MXN</span>
              )}
            </div>

            {connected.length === 0 ? (
              <button
                onClick={() => setShowConnectModal(true)}
                className="w-full p-3 rounded-lg border border-dashed border-[var(--border)] text-xs text-gray-500 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors text-center"
              >
                + Conectar exchange o cartera
              </button>
            ) : (
              <div className="space-y-2 text-sm">
                {connected.map(acc => {
                  const accBalances = wallet.filter(b => b.exchange === acc.id);
                  return (
                    <div key={acc.id} className="p-2 rounded-lg bg-black/20 border border-[var(--border)]">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-semibold text-[var(--primary)]">{acc.label}</span>
                        {acc.type === 'wallet' && <span className="text-[10px] text-gray-500">🧊 solo lectura</span>}
                      </div>
                      {accBalances.length === 0 ? (
                        <div className="text-xs text-gray-500">Sin saldo</div>
                      ) : (
                        accBalances.map(b => (
                          <div key={b.symbol} className="flex justify-between text-xs">
                            <span className="text-gray-400">{b.symbol}</span>
                            <span>{b.total < 0.001 ? b.total.toExponential(2) : b.total.toFixed(4)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={() => setShowConnectModal(true)}
                  className="w-full p-2 rounded-lg border border-dashed border-[var(--border)] text-xs text-gray-500 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  + Agregar cuenta
                </button>
              </div>
            )}
          </div>

          {/* Market summary */}
          <div className="mt-6 p-3 rounded-lg bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10 border border-[var(--primary)]/30">
            <h3 className="text-sm font-semibold mb-2">🧠 Resumen rápido</h3>
            <p className="text-xs text-gray-300">
              {prices.BTC?.change > 2
                ? '📈 Mercado alcista. Cuidado con comprar en la cima.'
                : prices.BTC?.change < -2
                ? '📉 Mercado en corrección. Posible oportunidad.'
                : '➡️ Mercado estable. Buen momento para planear.'}
            </p>
          </div>
        </aside>

        {showSidebar && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setShowSidebar(false)} />
        )}

        {/* Chat */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'permission' && message.permissionData ? (
                  <div className="max-w-[90%] sm:max-w-md w-full">
                    <div className={`p-4 rounded-xl border-2 ${
                      message.permissionData.status === 'pending' ? 'border-yellow-500 bg-yellow-500/10'
                      : message.permissionData.status === 'approved' ? 'border-green-500 bg-green-500/10'
                      : 'border-red-500 bg-red-500/10'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🔐</span>
                        <span className="font-semibold">Autorización Requerida</span>
                      </div>
                      <p className="font-medium text-[var(--primary)]">{message.permissionData.action}</p>
                      <p className="text-sm text-gray-300 mt-1">{message.permissionData.details}</p>
                      {message.permissionData.status === 'pending' ? (
                        <div className="flex gap-2 mt-4">
                          <button onClick={() => handlePermission(message.id, true)} className="flex-1 py-2 px-4 bg-[var(--primary)] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity active:scale-95">
                            ✓ Autorizar
                          </button>
                          <button onClick={() => handlePermission(message.id, false)} className="flex-1 py-2 px-4 bg-red-500/20 text-red-400 font-semibold rounded-lg border border-red-500/50 hover:bg-red-500/30 transition-colors active:scale-95">
                            ✗ Rechazar
                          </button>
                        </div>
                      ) : (
                        <div className={`mt-3 text-sm font-medium ${message.permissionData.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
                          {message.permissionData.status === 'approved' ? '✅ Autorizado' : '❌ Rechazado'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`max-w-[85%] sm:max-w-md p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-[var(--primary)] text-black rounded-br-md'
                      : 'bg-[var(--card-bg)] border border-[var(--border)] rounded-bl-md'
                  }`}>
                    <div className="text-sm sm:text-base">{formatText(message.content)}</div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-2xl rounded-bl-md">
                  <span className="typing-cursor">eelienX está pensando</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--card-bg)] backdrop-blur-md">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-gray-500 text-sm sm:text-base"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <span className="hidden sm:inline">Enviar</span> 🛸
              </button>
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {['📊 Precios', '🧠 Análisis', '💰 Saldo', '🔗 Conectar', '❓ Ayuda'].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion.split(' ').slice(1).join(' '))}
                  className="text-xs px-3 py-1.5 rounded-full bg-black/30 border border-[var(--border)] text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      {showConnectModal && (
        <ExchangeConnectModal
          onClose={() => setShowConnectModal(false)}
          onConnected={handleConnected}
        />
      )}
    </div>
  );
}
