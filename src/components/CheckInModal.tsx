import React, { useState } from 'react';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  Flame, 
  Crown, 
  Target, 
  CheckCircle2,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Protocol } from '../types';

interface CheckInModalProps {
  type: 'pre' | 'post';
  protocolTitle: string;
  protocol?: Protocol;
  initialFrequency?: number;
  preFrequency?: number;
  durationMinutes: number;
  isPro?: boolean;
  onConfirm: (freq: number, intent: string, logActionTitle?: string) => void;
  onClose?: () => void;
  onOpenDiagnostic?: () => void;
  onOpenPaywall?: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  type,
  protocolTitle,
  protocol,
  initialFrequency = 350,
  preFrequency = 350,
  durationMinutes,
  isPro = false,
  onConfirm,
  onClose,
  onOpenDiagnostic,
  onOpenPaywall,
}) => {
  const [frequency, setFrequency] = useState<number>(
    type === 'post' ? Math.min(999, preFrequency + 280) : initialFrequency
  );
  const [intent, setIntent] = useState<string>('Фокус на одном ключевом результате');
  const [actionDoneChecked, setActionDoneChecked] = useState<boolean>(true);

  const intentOptions = [
    'Фокус на одном ключевом результате',
    'Сброс информационной перегрузки и тумана',
    'Спокойствие перед озвучиванием цены',
    '3–4 часа непрерывного созидания (Deep Work)',
    'Смелость сделать 1 некомфортный звонок/контакт',
  ];

  const getFrequencyZone = (hz: number) => {
    if (hz < 300) {
      return {
        label: 'Реактивный режим / Фоновый шум',
        desc: 'Мышечные зажимы, распыление на уведомления, режим выживания.',
        badgeColor: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
      };
    }
    if (hz < 600) {
      return {
        label: 'Ясность & Альфа-Фокус',
        desc: 'Стабильное дыхание, однонаправленное внимание, готовность действовать.',
        badgeColor: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
      };
    }
    return {
      label: '5D High Agency // Sovereign Creator',
      desc: 'Отсутствие страха перед масштабом, четкие решения, высокие стандарты созидания.',
      badgeColor: 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200',
    };
  };

  const currentZone = getFrequencyZone(frequency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === 'post') {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#a855f7', '#06b6d4', '#facc15', '#10b981'],
        });
      } catch (err) {
        // ignore
      }
    }

    onConfirm(
      frequency, 
      intent, 
      type === 'post' && actionDoneChecked && protocol?.realWorldAction ? protocol.realWorldAction.title : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-neutral-100 shadow-2xl my-8">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2 font-mono">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            {type === 'pre' ? 'ПРЕДВАРИТЕЛЬНАЯ КАЛИБРОВКА' : 'СЕССИЯ ЗАВЕРШЕНА // ПЕРЕХОД К ДЕЙСТВИЮ'}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            {type === 'pre' ? 'Калибровка фокуса' : 'Состояние настроено'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {type === 'pre'
              ? `Протокол: «${protocolTitle}»`
              : `Сессия завершена (${durationMinutes} мин). Теперь примени это состояние в реальности.`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Frequency Slider & Badge */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                {type === 'pre' ? 'Уровень готовности к фокусу:' : 'Частотный сдвиг:'}
              </span>
              <span className="text-xl font-bold font-mono text-white">
                {frequency} <span className="text-xs font-normal text-purple-400">Hz</span>
              </span>
            </div>

            <input
              type="range"
              min="100"
              max="999"
              step="5"
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />

            <div className="pt-2">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono border ${currentZone.badgeColor}`}>
                {currentZone.label}
              </span>
              <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                {currentZone.desc}
              </p>
            </div>
          </div>

          {/* Pre Mode: Intent Selector */}
          {type === 'pre' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-neutral-300">
                Ключевой фокус на сессию:
              </label>
              <div className="space-y-1.5">
                {intentOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIntent(opt)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-all border cursor-pointer ${
                      intent === opt
                        ? 'bg-purple-950/60 border-purple-500 text-purple-200 font-medium'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Post Mode: Real World Action Bridge (Crucial Product Principle) */}
          {type === 'post' && protocol?.realWorldAction && (
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>ТЕПЕРЬ СДЕЛАЙ ЭТО В РЕАЛЬНОСТИ:</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white font-display">
                  {protocol.realWorldAction.title}
                </h4>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  {protocol.realWorldAction.description}
                </p>
              </div>

              <label className="flex items-center gap-2.5 text-xs text-neutral-200 cursor-pointer pt-2 border-t border-purple-500/20">
                <input
                  type="checkbox"
                  checked={actionDoneChecked}
                  onChange={(e) => setActionDoneChecked(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 accent-emerald-500"
                />
                <span>Добавить это действие в мой Reality Log (+100 EXP)</span>
              </label>
            </div>
          )}

          {/* Submit */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="btn-primary w-full py-3.5 px-4 text-xs sm:text-sm"
            >
              <span>{type === 'pre' ? 'Запустить сессию' : 'Зафиксировать и перейти к делам'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {type === 'pre' && onOpenDiagnostic && (
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onOpenDiagnostic();
                }}
                className="w-full py-2 text-xs text-neutral-400 hover:text-purple-300 transition-colors cursor-pointer text-center"
              >
                Пройти 5D Self-Scan за 1 минуту →
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
