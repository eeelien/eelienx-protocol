'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const lessons = [
  {
    id: 'holdeo',
    emoji: '🧊',
    title: '¿Qué es holdear?',
    level: 'Básico',
    color: 'blue',
    duration: '3 min',
    content: [
      {
        type: 'intro',
        text: '"Hold" viene de "hold on" — aguantar. En crypto, holdear significa comprar y no vender aunque el mercado baje.'
      },
      {
        type: 'key',
        title: '¿Por qué funciona?',
        points: [
          'Bitcoin ha subido un promedio de ~200% cada ciclo de 4 años',
          'Quien vendió en pánico en 2018 se perdió el bull run de 2021',
          'El tiempo compuesto multiplica tu inversión sin hacer nada',
          'Evitas pagar comisiones por cada operación'
        ]
      },
      {
        type: 'example',
        title: 'Ejemplo real',
        text: 'Si hubieras comprado $1,000 MXN en BTC en enero 2020 (~$7,000 USD/BTC) y no tocaras nada, en noviembre 2021 tenías ~$9,000 MXN. Sin hacer absolutamente nada.'
      },
      {
        type: 'warning',
        text: '⚠️ Holdear requiere disciplina. El mercado va a bajar — es normal. La clave es no vender por miedo.'
      },
      {
        type: 'quiz',
        question: '¿Cuál es la clave principal del holdeo?',
        options: [
          { text: 'Vender cuando baja para evitar pérdidas', correct: false },
          { text: 'Comprar y aguantar a largo plazo sin entrar en pánico', correct: true },
          { text: 'Operar todos los días para maximizar ganancias', correct: false },
        ]
      }
    ]
  },
  {
    id: 'velas',
    emoji: '🕯️',
    title: 'Cómo leer velas japonesas',
    level: 'Intermedio',
    color: 'yellow',
    duration: '5 min',
    content: [
      {
        type: 'intro',
        text: 'Las velas japonesas son la forma más usada de ver el precio en crypto. Cada vela representa un período de tiempo (1h, 4h, 1 día).'
      },
      {
        type: 'key',
        title: 'Partes de una vela',
        points: [
          '🟢 Verde = el precio subió en ese período (cierre > apertura)',
          '🔴 Roja = el precio bajó en ese período (cierre < apertura)',
          'Cuerpo = diferencia entre precio de apertura y cierre',
          'Mecha superior = el precio máximo que tocó',
          'Mecha inferior = el precio mínimo que tocó'
        ]
      },
      {
        type: 'example',
        title: 'Señales importantes',
        text: 'Vela verde con mecha larga abajo = compradores tomaron control. Vela con cuerpo pequeño y mechas largas = indecisión en el mercado.'
      },
      {
        type: 'warning',
        text: '💡 Una sola vela no dice mucho. Siempre analiza el patrón de varias velas juntas.'
      },
      {
        type: 'quiz',
        question: '¿Qué significa una vela verde?',
        options: [
          { text: 'El precio bajó durante ese período', correct: false },
          { text: 'El precio cerró más alto de lo que abrió', correct: true },
          { text: 'El mercado no se movió', correct: false },
        ]
      }
    ]
  },
  {
    id: 'rsi',
    emoji: '📊',
    title: 'RSI — ¿Comprar o vender?',
    level: 'Intermedio',
    color: 'purple',
    duration: '4 min',
    content: [
      {
        type: 'intro',
        text: 'El RSI (Relative Strength Index) mide si un activo está "sobrecomprado" o "sobrevendido". Va de 0 a 100.'
      },
      {
        type: 'key',
        title: 'Cómo interpretarlo',
        points: [
          'RSI > 70 = Sobrecomprado — podría venir una corrección',
          'RSI < 30 = Sobrevendido — podría venir un rebote',
          'RSI entre 40–60 = Zona neutral, mercado equilibrado',
          'RSI 50 = ni alcista ni bajista'
        ]
      },
      {
        type: 'example',
        title: 'Ejemplo en BTC',
        text: 'Si BTC sube 20% en 3 días y el RSI llega a 78, muchos traders esperan antes de comprar más. Si BTC cae fuerte y el RSI baja a 25, muchos lo ven como oportunidad.'
      },
      {
        type: 'warning',
        text: '⚠️ El RSI solo es una señal, no una garantía. Un activo puede seguir subiendo incluso con RSI alto.'
      },
      {
        type: 'quiz',
        question: '¿Qué indica un RSI de 28?',
        options: [
          { text: 'El activo está sobrecomprado, cuidado', correct: false },
          { text: 'El activo está sobrevendido, posible rebote', correct: true },
          { text: 'El mercado está en zona neutral', correct: false },
        ]
      }
    ]
  },
  {
    id: 'riesgo',
    emoji: '🛡️',
    title: 'Gestión de riesgo básica',
    level: 'Esencial',
    color: 'red',
    duration: '4 min',
    content: [
      {
        type: 'intro',
        text: 'La gestión de riesgo es lo que separa a los traders que sobreviven de los que quiebran. No es cuánto ganas — es cuánto puedes perder.'
      },
      {
        type: 'key',
        title: 'Reglas básicas',
        points: [
          'Nunca inviertas más de lo que puedes perder completamente',
          'Regla del 1-2%: no arriesgues más del 2% de tu capital en una sola operación',
          'Stop loss: define hasta dónde aguantas antes de entrar',
          'No pongas todo en un solo activo — diversifica básico'
        ]
      },
      {
        type: 'example',
        title: 'El stop loss',
        text: 'Si compras BTC a $87,000 y defines tu stop loss en $84,000 (-3.4%), el agente puede cerrar la posición automáticamente si llega ahí. Limitas la pérdida antes de que sea catastrófica.'
      },
      {
        type: 'warning',
        text: '🔑 La regla más importante: nunca operes con dinero que necesitas. Solo capital que puedes perder sin que afecte tu vida.'
      },
      {
        type: 'quiz',
        question: '¿Para qué sirve un stop loss?',
        options: [
          { text: 'Para garantizar ganancias en cada operación', correct: false },
          { text: 'Para limitar automáticamente cuánto puedes perder', correct: true },
          { text: 'Para comprar más cuando el precio baja', correct: false },
        ]
      }
    ]
  },
  {
    id: 'macd',
    emoji: '📈',
    title: 'MACD — Detectar tendencias',
    level: 'Avanzado',
    color: 'green',
    duration: '5 min',
    content: [
      {
        type: 'intro',
        text: 'El MACD (Moving Average Convergence Divergence) ayuda a identificar si una tendencia está ganando o perdiendo fuerza.'
      },
      {
        type: 'key',
        title: 'Cómo funciona',
        points: [
          'Línea MACD = diferencia entre dos medias móviles (12 y 26 períodos)',
          'Línea señal = media de 9 períodos del MACD',
          'Histograma = distancia entre MACD y señal',
          'Cruce alcista: MACD cruza hacia arriba la señal → posible subida',
          'Cruce bajista: MACD cruza hacia abajo la señal → posible caída'
        ]
      },
      {
        type: 'example',
        title: 'Señal de entrada',
        text: 'Cuando el MACD cruza hacia arriba la línea de señal mientras está debajo del cero, es una señal alcista fuerte. Muchos traders lo usan como punto de entrada.'
      },
      {
        type: 'warning',
        text: '💡 El MACD funciona mejor en mercados con tendencia clara. En mercados laterales da falsas señales — combínalo con RSI.'
      },
      {
        type: 'quiz',
        question: '¿Qué indica un cruce alcista del MACD?',
        options: [
          { text: 'El precio va a bajar pronto', correct: false },
          { text: 'Posible inicio de una tendencia alcista', correct: true },
          { text: 'El mercado está sobrecomprado', correct: false },
        ]
      }
    ]
  }
];

const levelColors: Record<string, string> = {
  'Básico': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Intermedio': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Avanzado': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Esencial': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const cardColors: Record<string, string> = {
  blue:   'border-blue-500/40 hover:border-blue-400',
  yellow: 'border-yellow-500/40 hover:border-yellow-400',
  purple: 'border-purple-500/40 hover:border-purple-400',
  red:    'border-red-500/40 hover:border-red-400',
  green:  'border-green-500/40 hover:border-green-400',
};

const accentColors: Record<string, string> = {
  blue:   'text-blue-400',
  yellow: 'text-yellow-400',
  purple: 'text-purple-400',
  red:    'text-red-400',
  green:  'text-green-400',
};

type QuizOption = { text: string; correct: boolean };
type LessonBlock = {
  type: string;
  text?: string;
  title?: string;
  points?: string[];
  question?: string;
  options?: QuizOption[];
};

function LessonModal({ lesson, onClose, onComplete }: {
  lesson: typeof lessons[0];
  onClose: () => void;
  onComplete: (id: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);

  const block = lesson.content[step] as LessonBlock;
  const isLast = step === lesson.content.length - 1;
  const accent = accentColors[lesson.color];

  const handleQuiz = (idx: number) => {
    if (quizDone) return;
    setQuizAnswer(idx);
    setQuizDone(true);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete(lesson.id);
      onClose();
    } else {
      setStep(s => s + 1);
      setQuizAnswer(null);
      setQuizDone(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{lesson.emoji}</span>
            <div>
              <div className="font-bold text-white">{lesson.title}</div>
              <div className="text-xs text-gray-500">{step + 1} / {lesson.content.length}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-800">
          <div className="h-1 bg-blue-500 transition-all duration-300"
               style={{ width: `${((step + 1) / lesson.content.length) * 100}%` }} />
        </div>

        {/* Content */}
        <div className="p-6">
          {block.type === 'intro' && (
            <div className="text-gray-200 text-lg leading-relaxed">{block.text}</div>
          )}

          {block.type === 'key' && (
            <div>
              <h3 className={`font-bold text-lg mb-4 ${accent}`}>{block.title}</h3>
              <ul className="space-y-3">
                {block.points?.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center text-xs flex-shrink-0 ${accent} border-current`}>{i + 1}</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {block.type === 'example' && (
            <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700">
              <div className={`font-semibold mb-2 ${accent}`}>💡 {block.title}</div>
              <div className="text-gray-300 text-sm leading-relaxed">{block.text}</div>
            </div>
          )}

          {block.type === 'warning' && (
            <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30 text-yellow-200 text-sm leading-relaxed">
              {block.text}
            </div>
          )}

          {block.type === 'quiz' && (
            <div>
              <div className="font-semibold text-white mb-4 text-lg">🧠 {block.question}</div>
              <div className="space-y-3">
                {block.options?.map((opt, i) => {
                  let cls = 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-500';
                  if (quizDone && quizAnswer === i) {
                    cls = opt.correct
                      ? 'border-green-500 bg-green-500/20 text-green-300'
                      : 'border-red-500 bg-red-500/20 text-red-300';
                  } else if (quizDone && opt.correct) {
                    cls = 'border-green-500 bg-green-500/10 text-green-400';
                  }
                  return (
                    <button key={i} onClick={() => handleQuiz(i)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${cls} ${!quizDone ? 'cursor-pointer' : 'cursor-default'}`}>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              {quizDone && (
                <div className={`mt-4 text-sm font-semibold ${block.options?.[quizAnswer!]?.correct ? 'text-green-400' : 'text-red-400'}`}>
                  {block.options?.[quizAnswer!]?.correct ? '✅ ¡Correcto!' : '❌ No exactamente — la respuesta correcta está marcada en verde.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-800 flex justify-between items-center">
          {step > 0
            ? <button onClick={() => setStep(s => s - 1)} className="text-gray-500 hover:text-white text-sm">← Anterior</button>
            : <div />}
          <button
            onClick={handleNext}
            disabled={block.type === 'quiz' && !quizDone}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all
              ${(block.type !== 'quiz' || quizDone)
                ? 'bg-blue-500 hover:bg-blue-400 text-white cursor-pointer'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
            {isLast ? '🎉 Completar lección' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AcademiaPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('eelienx_academy') || '[]'); } catch { return []; }
  });
  const [active, setActive] = useState<typeof lessons[0] | null>(null);

  const handleComplete = (id: string) => {
    const updated = completed.includes(id) ? completed : [...completed, id];
    setCompleted(updated);
    localStorage.setItem('eelienx_academy', JSON.stringify(updated));
  };

  const progress = Math.round((completed.length / lessons.length) * 100);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/chat')} className="text-gray-500 hover:text-white text-sm">← Chat</button>
          <span className="text-gray-700">|</span>
          <span className="font-bold">📚 Academia eelienX</span>
        </div>
        <div className="text-sm text-gray-500">{completed.length}/{lessons.length} completadas</div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Tu progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                 style={{ width: `${progress}%` }} />
          </div>
          {progress === 100 && (
            <div className="mt-3 text-center text-sm text-green-400 font-semibold">
              🏆 ¡Completaste todas las lecciones! Ya puedes operar con confianza.
            </div>
          )}
        </div>

        {/* Intro */}
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-1">Aprende crypto en minutos 🚀</h1>
          <p className="text-gray-400 text-sm">Lecciones cortas y directas. Sin tecnicismos innecesarios.</p>
        </div>

        {/* Lessons grid */}
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const done = completed.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => setActive(lesson)}
                className={`w-full text-left p-4 rounded-xl border-2 bg-gray-900 transition-all duration-200 ${cardColors[lesson.color]} ${done ? 'opacity-70' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{done ? '✅' : lesson.emoji}</span>
                    <div>
                      <div className="font-semibold text-white">{lesson.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[lesson.level]}`}>
                          {lesson.level}
                        </span>
                        <span className="text-xs text-gray-500">⏱ {lesson.duration}</span>
                        {done && <span className="text-xs text-green-500 font-semibold">Completada</span>}
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-600 text-lg">{done ? '' : '→'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
          <p className="text-gray-400 text-sm mb-3">¿Listo para poner en práctica lo aprendido?</p>
          <button onClick={() => router.push('/chat')}
            className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all">
            Ir al agente 🛸
          </button>
        </div>
      </div>

      {/* Lesson modal */}
      {active && (
        <LessonModal
          lesson={active}
          onClose={() => setActive(null)}
          onComplete={handleComplete}
        />
      )}
    </main>
  );
}
