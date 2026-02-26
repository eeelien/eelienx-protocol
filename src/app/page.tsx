'use client';

import { useState, useRef, useEffect } from 'react';

// Tipos para los precios
interface CryptoData {
  price: number;
  change: number;
  name: string;
  high24h: number;
  low24h: number;
  volume: number;
}

interface CryptoPrices {
  [key: string]: CryptoData;
}

const userWallet = {
  BTC: 0.05,
  ETH: 1.2,
  USDT: 500,
  SOL: 10,
  MXN: 15000,
};

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

// Análisis inteligente del mercado
function getMarketAnalysis(prices: CryptoPrices): string {
  const btc = prices.BTC;
  const eth = prices.ETH;
  
  if (!btc || !eth) return "Cargando datos del mercado...";
  
  let analysis = "🧠 **Análisis del mercado:**\n\n";
  
  // Análisis de Bitcoin
  if (btc.change > 5) {
    analysis += `📈 **Bitcoin (+${btc.change.toFixed(1)}%)**: Subida fuerte. El mercado está muy optimista.\n`;
    analysis += `⚠️ *Recomendación:* Cuidado con comprar en la cima. Si ya tienes BTC, podría ser buen momento para tomar ganancias parciales.\n\n`;
  } else if (btc.change > 2) {
    analysis += `📈 **Bitcoin (+${btc.change.toFixed(1)}%)**: Tendencia alcista saludable.\n`;
    analysis += `✅ *Recomendación:* Buen momento para mantener. Si quieres comprar, hazlo gradualmente.\n\n`;
  } else if (btc.change > -2) {
    analysis += `➡️ **Bitcoin (${btc.change > 0 ? '+' : ''}${btc.change.toFixed(1)}%)**: Mercado estable.\n`;
    analysis += `✅ *Recomendación:* Buen momento para comprar si estás pensando en largo plazo. No hay urgencia.\n\n`;
  } else if (btc.change > -5) {
    analysis += `📉 **Bitcoin (${btc.change.toFixed(1)}%)**: Corrección moderada.\n`;
    analysis += `💡 *Recomendación:* Podría ser oportunidad de compra (buying the dip). Pero espera a que se estabilice.\n\n`;
  } else {
    analysis += `🔴 **Bitcoin (${btc.change.toFixed(1)}%)**: Caída fuerte. El mercado está en modo pánico.\n`;
    analysis += `⚠️ *Recomendación:* NO vendas en pánico. Si tienes capital extra, podría ser buena oportunidad, pero con precaución.\n\n`;
  }
  
  // Análisis de Ethereum
  const ethVsBtc = eth.change - btc.change;
  if (ethVsBtc > 3) {
    analysis += `🔷 **Ethereum** está superando a Bitcoin hoy. Las altcoins podrían tener buen momentum.\n`;
  } else if (ethVsBtc < -3) {
    analysis += `🔷 **Ethereum** está más débil que Bitcoin. El mercado prefiere seguridad (BTC) sobre riesgo (alts).\n`;
  }
  
  // Rango del día
  const btcRange = ((btc.price - btc.low24h) / (btc.high24h - btc.low24h) * 100);
  if (btcRange > 80) {
    analysis += `\n📊 BTC está cerca del máximo del día - posible resistencia.`;
  } else if (btcRange < 20) {
    analysis += `\n📊 BTC está cerca del mínimo del día - posible soporte.`;
  }
  
  return analysis;
}

// Respuestas del agente
function getAgentResponse(input: string, prices: CryptoPrices): { response: string; needsPermission?: boolean; permissionData?: any } {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('hola') || lowerInput.includes('hey') || lowerInput.includes('qué onda')) {
    return { response: '¡Qué onda! 👽 Soy eelienX, tu agente crypto. Puedo ayudarte a:\n\n• Ver precios en tiempo real\n• Analizar si es buen momento para comprar/vender\n• Ejecutar operaciones por ti\n• Transferir a tu banco\n\n¿Qué necesitas?' };
  }
  
  if (lowerInput.includes('precio') || lowerInput.includes('cuánto está') || lowerInput.includes('cotización')) {
    const priceList = Object.entries(prices)
      .map(([symbol, data]) => {
        const emoji = data.change > 0 ? '📈' : data.change < 0 ? '📉' : '➡️';
        return `${emoji} ${data.name}: $${data.price.toLocaleString()} USD (${data.change > 0 ? '+' : ''}${data.change.toFixed(2)}%)`;
      })
      .join('\n');
    return { response: `📊 **Precios en tiempo real:**\n\n${priceList}\n\n💡 Escribe "análisis" para saber si es buen momento de operar.` };
  }
  
  if (lowerInput.includes('portafolio') || lowerInput.includes('balance') || lowerInput.includes('tengo')) {
    const total = Object.entries(userWallet).reduce((acc, [symbol, amount]) => {
      if (symbol === 'MXN') return acc + amount;
      const price = prices[symbol]?.price || 0;
      return acc + (amount * price * 17.5);
    }, 0);
    
    const portfolio = Object.entries(userWallet)
      .map(([symbol, amount]) => {
        if (symbol === 'MXN') return `💵 MXN: $${amount.toLocaleString()}`;
        const data = prices[symbol];
        const valueMXN = amount * (data?.price || 0) * 17.5;
        const changeEmoji = (data?.change || 0) > 0 ? '📈' : '📉';
        return `${changeEmoji} ${symbol}: ${amount} (~$${valueMXN.toLocaleString()} MXN)`;
      })
      .join('\n');
    
    return { response: `🛸 **Tu portafolio eelienX:**\n\n${portfolio}\n\n💰 **Total:** ~$${total.toLocaleString()} MXN\n\n¿Quieres hacer alguna operación?` };
  }
  
  if (lowerInput.includes('análisis') || lowerInput.includes('analisis') || lowerInput.includes('buen momento') || lowerInput.includes('recomend')) {
    return { response: getMarketAnalysis(prices) };
  }
  
  if (lowerInput.includes('comprar') && (lowerInput.includes('btc') || lowerInput.includes('bitcoin'))) {
    const btc = prices.BTC;
    let advice = '';
    if (btc?.change > 5) {
      advice = '\n\n⚠️ *Nota: Bitcoin subió mucho hoy. Considera comprar gradualmente.*';
    } else if (btc?.change < -3) {
      advice = '\n\n💡 *Nota: Bitcoin está en descuento hoy. Podría ser buena entrada.*';
    }
    
    return {
      response: `🔐 Para comprar Bitcoin necesito tu autorización...${advice}`,
      needsPermission: true,
      permissionData: {
        action: 'Comprar Bitcoin',
        details: `Comprar 0.001 BTC (~$${((btc?.price || 67000) * 0.001 * 17.5).toLocaleString()} MXN) usando tu saldo en Bitso`,
      }
    };
  }
  
  if (lowerInput.includes('vender') || lowerInput.includes('cambiar')) {
    return {
      response: '🔐 Para realizar esta venta necesito tu autorización...',
      needsPermission: true,
      permissionData: {
        action: 'Vender USDT',
        details: 'Vender 100 USDT y enviar $1,750 MXN a tu cuenta Banorte ****4523',
      }
    };
  }
  
  if (lowerInput.includes('transferir') || lowerInput.includes('enviar') || lowerInput.includes('banco')) {
    return {
      response: '🔐 Transferencia bancaria detectada. Necesito autorización...',
      needsPermission: true,
      permissionData: {
        action: 'Transferir a Banco',
        details: 'Convertir 200 USDT a MXN y enviar $3,500 vía SPEI a tu cuenta',
      }
    };
  }
  
  if (lowerInput.includes('ayuda') || lowerInput.includes('qué puedes hacer')) {
    return { response: '👽 Soy **eelienX Protocol**, tu agente crypto. Puedo:\n\n🔹 Ver precios en tiempo real\n🔹 Analizar el mercado y darte recomendaciones\n🔹 Mostrar tu portafolio\n🔹 Comprar/vender crypto\n🔹 Transferir a tu banco (SPEI)\n\nTodo con tu autorización. Tú mandas, yo ejecuto. 🛸' };
  }
  
  return { response: '👽 Entendido. ¿Podrías ser más específico?\n\nPrueba con:\n• "precios" - ver cotizaciones\n• "análisis" - saber si es buen momento\n• "mi portafolio" - ver tus fondos\n• "comprar bitcoin" - ejecutar operación' };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'agent',
      content: '👽 **¡Bienvenido a eelienX Protocol!**\n\nSoy tu agente de crypto personal con precios en tiempo real.\n\nHago las operaciones complicadas por ti, tú solo autorizas.\n\n¿Qué quieres hacer hoy?'
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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch precios en tiempo real
  const fetchPrices = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,solana,ripple&order=market_cap_desc&sparkline=false&price_change_percentage=24h'
      );
      const data = await response.json();
      
      const symbolMap: { [key: string]: string } = {
        bitcoin: 'BTC',
        ethereum: 'ETH',
        tether: 'USDT',
        solana: 'SOL',
        ripple: 'XRP',
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
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    
    const { response, needsPermission, permissionData } = getAgentResponse(input, prices);
    
    const agentMessage: Message = {
      id: Date.now() + 1,
      type: 'agent',
      content: response
    };
    
    setMessages(prev => [...prev, agentMessage]);
    
    if (needsPermission && permissionData) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const permissionMessage: Message = {
        id: Date.now() + 2,
        type: 'permission',
        content: '',
        permissionData: { ...permissionData, status: 'pending' }
      };
      setMessages(prev => [...prev, permissionMessage]);
    }
    
    setIsTyping(false);
  };

  const handlePermission = (messageId: number, approved: boolean) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.permissionData) {
        return {
          ...msg,
          permissionData: {
            ...msg.permissionData,
            status: approved ? 'approved' : 'rejected'
          }
        };
      }
      return msg;
    }));
    
    setTimeout(() => {
      const responseMessage: Message = {
        id: Date.now(),
        type: 'agent',
        content: approved 
          ? '✅ **¡Operación autorizada!** Ejecutando...\n\n🔄 Conectando con Bitso...\n✅ ¡Listo! La operación se completó exitosamente.\n\nTu nuevo balance se actualizará en unos segundos. 🛸'
          : '❌ Operación cancelada. No te preocupes, no se hizo ningún movimiento.\n\n¿Hay algo más en lo que pueda ayudarte?'
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 500);
  };

  // Formato de texto con markdown simple
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Italic
      line = line.replace(/\*(.+?)\*/g, '<em>$1</em>');
      return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />;
    });
  };

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
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-xs text-gray-500 hidden sm:block">
                Actualizado: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></span>
              <span className="text-gray-400 hidden sm:inline">En vivo</span>
            </div>
            {/* Botón para mostrar sidebar en móvil */}
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
        {/* Sidebar con precios - Desktop siempre visible, móvil toggle */}
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
            <button 
              onClick={() => setShowSidebar(false)}
              className="md:hidden text-gray-400"
            >
              ✕
            </button>
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
                <div className="text-xs text-gray-500 mt-1">
                  H: ${data.high24h?.toLocaleString()} • L: ${data.low24h?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          
          <h2 className="text-sm font-semibold text-gray-400 mt-6 mb-4">💰 TU WALLET</h2>
          <div className="space-y-2 text-sm">
            {Object.entries(userWallet).map(([symbol, amount]) => {
              const data = prices[symbol];
              const valueMXN = symbol === 'MXN' ? amount : amount * (data?.price || 0) * 17.5;
              return (
                <div key={symbol} className="flex justify-between items-center">
                  <span className="text-gray-400">{symbol}</span>
                  <div className="text-right">
                    <div>{symbol === 'MXN' ? `$${amount.toLocaleString()}` : amount}</div>
                    {symbol !== 'MXN' && (
                      <div className="text-xs text-gray-500">~${valueMXN.toLocaleString()} MXN</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Quick Analysis */}
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

        {/* Overlay para cerrar sidebar en móvil */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Chat principal */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'permission' && message.permissionData ? (
                  <div className="max-w-[90%] sm:max-w-md w-full">
                    <div className={`p-4 rounded-xl border-2 ${
                      message.permissionData.status === 'pending' 
                        ? 'border-yellow-500 bg-yellow-500/10' 
                        : message.permissionData.status === 'approved'
                        ? 'border-green-500 bg-green-500/10'
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
                          <button
                            onClick={() => handlePermission(message.id, true)}
                            className="flex-1 py-2 px-4 bg-[var(--primary)] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity active:scale-95"
                          >
                            ✓ Autorizar
                          </button>
                          <button
                            onClick={() => handlePermission(message.id, false)}
                            className="flex-1 py-2 px-4 bg-red-500/20 text-red-400 font-semibold rounded-lg border border-red-500/50 hover:bg-red-500/30 transition-colors active:scale-95"
                          >
                            ✗ Rechazar
                          </button>
                        </div>
                      ) : (
                        <div className={`mt-3 text-sm font-medium ${
                          message.permissionData.status === 'approved' ? 'text-green-400' : 'text-red-400'
                        }`}>
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
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
              {['📊 Precios', '🧠 Análisis', '💰 Portafolio', '❓ Ayuda'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    const text = suggestion.split(' ')[1];
                    setInput(text);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-black/30 border border-[var(--border)] text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors active:scale-95"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
