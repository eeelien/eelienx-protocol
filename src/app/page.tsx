'use client';

import { useState, useRef, useEffect } from 'react';

// Datos simulados de cripto
const cryptoPrices = {
  BTC: { price: 67234.50, change: 2.4, name: 'Bitcoin' },
  ETH: { price: 3456.78, change: -1.2, name: 'Ethereum' },
  USDT: { price: 1.00, change: 0.01, name: 'Tether' },
  SOL: { price: 156.89, change: 5.7, name: 'Solana' },
  XRP: { price: 0.52, change: 3.1, name: 'Ripple' },
};

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

// Respuestas del agente
function getAgentResponse(input: string): { response: string; needsPermission?: boolean; permissionData?: any } {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('hola') || lowerInput.includes('hey') || lowerInput.includes('qué onda')) {
    return { response: '¡Qué onda! 👽 Soy eelienX, tu agente crypto. Puedo ayudarte a:\n\n• Ver precios y tu portafolio\n• Comprar o vender crypto\n• Transferir a tu banco\n• Analizar el mercado\n\n¿Qué necesitas?' };
  }
  
  if (lowerInput.includes('precio') || lowerInput.includes('cuánto está') || lowerInput.includes('cotización')) {
    const prices = Object.entries(cryptoPrices)
      .map(([symbol, data]) => `${data.name}: $${data.price.toLocaleString()} USD (${data.change > 0 ? '+' : ''}${data.change}%)`)
      .join('\n');
    return { response: `📊 Precios actuales:\n\n${prices}\n\n¿Quieres que te avise cuando alguno suba o baje?` };
  }
  
  if (lowerInput.includes('portafolio') || lowerInput.includes('balance') || lowerInput.includes('tengo')) {
    const total = Object.entries(userWallet).reduce((acc, [symbol, amount]) => {
      if (symbol === 'MXN') return acc + amount;
      const price = cryptoPrices[symbol as keyof typeof cryptoPrices]?.price || 0;
      return acc + (amount * price * 17.5); // Convertir a MXN
    }, 0);
    
    const portfolio = Object.entries(userWallet)
      .map(([symbol, amount]) => {
        if (symbol === 'MXN') return `💵 MXN: $${amount.toLocaleString()}`;
        const data = cryptoPrices[symbol as keyof typeof cryptoPrices];
        const valueMXN = amount * (data?.price || 0) * 17.5;
        return `${symbol}: ${amount} (~$${valueMXN.toLocaleString()} MXN)`;
      })
      .join('\n');
    
    return { response: `🛸 Tu portafolio eelienX:\n\n${portfolio}\n\n💰 Total: ~$${total.toLocaleString()} MXN\n\n¿Quieres hacer alguna operación?` };
  }
  
  if (lowerInput.includes('comprar') && (lowerInput.includes('btc') || lowerInput.includes('bitcoin'))) {
    return {
      response: '🔐 Para comprar Bitcoin necesito tu autorización...',
      needsPermission: true,
      permissionData: {
        action: 'Comprar Bitcoin',
        details: 'Comprar 0.001 BTC (~$1,176 MXN) usando tu saldo en Bitso',
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
  
  if (lowerInput.includes('mercado') || lowerInput.includes('análisis') || lowerInput.includes('buen momento')) {
    const btcChange = cryptoPrices.BTC.change;
    const sentiment = btcChange > 0 ? '📈 alcista' : '📉 bajista';
    return { 
      response: `🧠 Análisis del mercado:\n\nEl mercado está ${sentiment} hoy. Bitcoin ${btcChange > 0 ? 'subió' : 'bajó'} ${Math.abs(btcChange)}%.\n\n${btcChange > 2 ? '✅ Buen momento para tomar ganancias si tienes BTC.' : btcChange < -2 ? '✅ Podría ser buen momento para comprar en el dip.' : '⚖️ El mercado está estable, no hay urgencia.'}\n\n¿Quieres que te avise cuando haya movimientos fuertes?`
    };
  }
  
  if (lowerInput.includes('ayuda') || lowerInput.includes('qué puedes hacer')) {
    return { response: '👽 Soy eelienX Protocol, tu agente crypto. Puedo:\n\n🔹 Ver precios en tiempo real\n🔹 Mostrar tu portafolio\n🔹 Comprar/vender crypto\n🔹 Transferir a tu banco (SPEI)\n🔹 Analizar el mercado\n🔹 Alertas de precio\n\nTodo con tu autorización. Tú mandas, yo ejecuto. 🛸' };
  }
  
  return { response: '👽 Entendido. ¿Podrías ser más específico? Puedo ayudarte con precios, tu portafolio, comprar/vender crypto, o transferencias bancarias. Solo dime qué necesitas.' };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'agent',
      content: '👽 ¡Bienvenido a eelienX Protocol!\n\nSoy tu agente de crypto personal. Hago las operaciones complicadas por ti, tú solo autorizas.\n\n¿Qué quieres hacer hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    
    // Simular delay del agente
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const { response, needsPermission, permissionData } = getAgentResponse(input);
    
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
    
    // Agregar respuesta del agente
    setTimeout(() => {
      const responseMessage: Message = {
        id: Date.now(),
        type: 'agent',
        content: approved 
          ? '✅ ¡Operación autorizada! Ejecutando...\n\n🔄 Procesando con Bitso...\n✅ ¡Listo! La operación se completó exitosamente.\n\nTu nuevo balance se actualizará en unos segundos. 🛸'
          : '❌ Operación cancelada. No te preocupes, no se hizo ningún movimiento.\n\n¿Hay algo más en lo que pueda ayudarte?'
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card-bg)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-black font-bold glow">
              👽
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">
                eelienX Protocol
              </h1>
              <p className="text-xs text-gray-400">Tu agente crypto personal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></span>
            <span className="text-gray-400">Conectado</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Sidebar con precios */}
        <aside className="hidden md:block w-64 border-r border-[var(--border)] p-4 bg-[var(--card-bg)] backdrop-blur-md">
          <h2 className="text-sm font-semibold text-gray-400 mb-4">📊 MERCADO</h2>
          <div className="space-y-3">
            {Object.entries(cryptoPrices).map(([symbol, data]) => (
              <div key={symbol} className="p-3 rounded-lg bg-black/30 border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{symbol}</span>
                  <span className={data.change > 0 ? 'text-green-400' : 'text-red-400'}>
                    {data.change > 0 ? '+' : ''}{data.change}%
                  </span>
                </div>
                <div className="text-sm text-gray-400">${data.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
          
          <h2 className="text-sm font-semibold text-gray-400 mt-6 mb-4">💰 TU WALLET</h2>
          <div className="space-y-2 text-sm">
            {Object.entries(userWallet).map(([symbol, amount]) => (
              <div key={symbol} className="flex justify-between">
                <span className="text-gray-400">{symbol}</span>
                <span>{symbol === 'MXN' ? `$${amount.toLocaleString()}` : amount}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat principal */}
        <main className="flex-1 flex flex-col">
          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'permission' && message.permissionData ? (
                  <div className="max-w-md w-full">
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
                            className="flex-1 py-2 px-4 bg-[var(--primary)] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
                          >
                            ✓ Autorizar
                          </button>
                          <button
                            onClick={() => handlePermission(message.id, false)}
                            className="flex-1 py-2 px-4 bg-red-500/20 text-red-400 font-semibold rounded-lg border border-red-500/50 hover:bg-red-500/30 transition-colors"
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
                  <div className={`max-w-md p-4 rounded-2xl ${
                    message.type === 'user' 
                      ? 'bg-[var(--primary)] text-black rounded-br-md' 
                      : 'bg-[var(--card-bg)] border border-[var(--border)] rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
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
          <div className="p-4 border-t border-[var(--border)] bg-[var(--card-bg)] backdrop-blur-md">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu mensaje... (ej: 'quiero comprar bitcoin')"
                className="flex-1 bg-black/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-gray-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-black font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enviar 🛸
              </button>
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {['💰 Mi portafolio', '📊 Precios', '📈 Análisis', '❓ Ayuda'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion.replace(/^[^\s]+\s/, ''))}
                  className="text-xs px-3 py-1 rounded-full bg-black/30 border border-[var(--border)] text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
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
