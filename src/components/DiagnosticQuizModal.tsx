import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Target, 
  Zap, 
  CheckCircle2, 
  X, 
  Activity, 
  BrainCircuit,
  Volume2
} from 'lucide-react';
import { StateArchetype } from '../types';
import { analytics } from '../utils/analytics';

interface DiagnosticQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: { blockage: string; score: number; recommendedHz: number; archetype: StateArchetype; nextMove: string }) => void;
  onOpenPaywall: () => void;
}

export const DiagnosticQuizModal: React.FC<DiagnosticQuizModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  onOpenPaywall,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [resultReady, setResultReady] = useState(false);

  if (!isOpen) return null;

  const questions = [
    {
      title: 'Что сильнее всего тормозит твои результаты за последние 14–30 дней?',
      subtitle: 'Выбери ведущий паттерн сопротивления',
      options: [
        {
          archetype: 'UNDERVALUED' as StateArchetype,
          label: '💸 Страх высоких чеков и отказов',
          desc: 'Сложно называть реальную цену услуг, занижаю прайс, соглашаюсь на неудобные условия.',
        },
        {
          archetype: 'SCATTERED_CREATOR' as StateArchetype,
          label: '📱 Разорванное внимание & Дофаминовый туман',
          desc: 'Сложно сидеть в глубоком фокусе дольше 15 минут, постоянный скроллинг и переключение.',
        },
        {
          archetype: 'OVERTHINKER' as StateArchetype,
          label: '🧠 Бесконечный анализ & Синдром самозванца',
          desc: 'Долго планирую, переписываю черновики, но откладываю реальный релиз или звонок.',
        },
        {
          archetype: 'SURVIVAL_MODE' as StateArchetype,
          label: '🔥 Режим выживания & Рутина',
          desc: 'Много суеты и тушения пожаров, но стратегически важные проекты стоят на месте.',
        },
      ],
    },
    {
      title: 'Как ты обычно действуешь, когда сталкиваешься с дискомфортом?',
      subtitle: 'Реакция на страх и неизвестность',
      options: [
        {
          label: 'Откладываю на потом под предлогом «надо еще подготовиться»',
          score: 10,
        },
        {
          label: 'Начинаю суетиться и делать мелкие неважные задачи (fake work)',
          score: 20,
        },
        {
          label: 'Иду сквозь дискомфорт, но трачу слишком много нервов и энергии',
          score: 40,
        },
      ],
    },
    {
      title: 'К какому стандарту ты стремишься в ближайшие 30 дней?',
      subtitle: 'Твоя целевая идентичность',
      options: [
        {
          label: 'High Agency Architect: высокая цена труда, чистый фокус и хладнокровие',
          score: 50,
        },
        {
          label: 'Prolific Builder: быстрые релизы без перфекционизма и 4 часа Deep Work в день',
          score: 40,
        },
      ],
    },
  ];

  const handleSelectOption = (index: number) => {
    const nextAnswers = [...selectedAnswers, index];
    setSelectedAnswers(nextAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCalculating(true);
      analytics.track('onboarding_step_completed', { test: 'reality_check' });
      setTimeout(() => {
        setIsCalculating(false);
        setResultReady(true);
      }, 700);
    }
  };

  const getArchetype = (): { 
    type: StateArchetype; 
    title: string; 
    block: string; 
    nextMove: string; 
    protocolTitle: string; 
    protocolId: string;
    targetHz: number;
  } => {
    const firstPick = selectedAnswers[0] || 0;
    const pickedArchetype = (questions[0].options[firstPick] as any)?.archetype || 'SURVIVAL_MODE';

    switch (pickedArchetype) {
      case 'UNDERVALUED':
        return {
          type: 'UNDERVALUED',
          title: 'UNDERVALUED (Недооцененный мастер)',
          block: 'Спазм дефицита перед озвучиванием стоимости',
          nextMove: 'Подними цену на свои услуги на 30% для следующего потенциального клиента и озвучь её без оправданий.',
          protocolTitle: 'MONEY // Спокойствие перед чеком',
          protocolId: 'proto-money',
          targetHz: 639,
        };
      case 'SCATTERED_CREATOR':
        return {
          type: 'SCATTERED_CREATOR',
          title: 'SCATTERED CREATOR (Рассеянный созидатель)',
          block: 'Утечка дофаминового внимания и распыление',
          nextMove: 'Убери телефон в другую комнату и проведи 90 минут в работе над одной задачей без единого отвлечения.',
          protocolTitle: 'RESET // Дофаминовый сброс',
          protocolId: 'proto-reset',
          targetHz: 380,
        };
      case 'OVERTHINKER':
        return {
          type: 'OVERTHINKER',
          title: 'OVERTHINKER (Паралич анализа)',
          block: 'Перфекционизм и страх совершить ошибку',
          nextMove: 'Сделай черновой релиз задачи за 25 минут и отправь его на проверку сегодня до конца дня.',
          protocolTitle: 'DECISION // Хладнокровный выбор',
          protocolId: 'proto-decision',
          targetHz: 639,
        };
      default:
        return {
          type: 'SURVIVAL_MODE',
          title: 'SURVIVAL MODE (Режим выживания)',
          block: 'Реактивная позиция и тушение пожаров',
          nextMove: 'Заверши и отправь 1 задачу, которую откладываешь больше 2 дней.',
          protocolTitle: 'DEEP WORK // Лазерный фокус',
          protocolId: 'proto-deepwork',
          targetHz: 520,
        };
    }
  };

  const outcome = getArchetype();

  const handleApplyResult = () => {
    onComplete({
      blockage: outcome.block,
      score: 75,
      recommendedHz: outcome.targetHz,
      archetype: outcome.type,
      nextMove: outcome.nextMove,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-neutral-100 shadow-2xl my-8">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-500 hover:text-neutral-200 p-2 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* In progress */}
        {!resultReady && !isCalculating && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="font-mono text-xs font-bold text-purple-300 uppercase">
                  5D REALITY CHECK // ВОПРОС {currentStep + 1} ИЗ {questions.length}
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                {Math.round(((currentStep + 1) / questions.length) * 100)}%
              </span>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                {questions[currentStep].title}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                {questions[currentStep].subtitle}
              </p>
            </div>

            <div className="space-y-2.5">
              {questions[currentStep].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className="w-full p-4 rounded-2xl bg-neutral-900/60 hover:bg-purple-950/40 border border-neutral-800 hover:border-purple-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-neutral-200 group-hover:text-white">
                    {opt.label}
                  </div>
                  {'desc' in opt && (
                    <div className="text-[11px] text-neutral-400 mt-1">
                      {opt.desc}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Calculating Loader */}
        {isCalculating && (
          <div className="py-12 text-center space-y-4 animate-fadeIn">
            <BrainCircuit className="w-10 h-10 text-purple-400 animate-pulse mx-auto" />
            <div className="text-sm font-bold text-white">
              Анализ поведенческого паттерна...
            </div>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Определяем ключевой зажим и рассчитываем точное действие для выхода в созидание.
            </p>
          </div>
        )}

        {/* Result Screen: REALITY CHECK DIAGNOSTIC */}
        {resultReady && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>РЕЗУЛЬТАТЫ СКАНИРОВАНИЯ</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                Твой текущий паттерн: {outcome.type}
              </h2>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-purple-500/30 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400 font-mono">ГЛАВНЫЙ БЛОК:</span>
                <span className="font-bold text-rose-300">{outcome.block}</span>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400 font-mono">РЕКОМЕНДОВАННЫЙ ПРОТОКОЛ:</span>
                <span className="font-bold text-purple-300">{outcome.protocolTitle}</span>
              </div>

              <div className="pt-2">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase mb-1">
                  YOUR NEXT MOVE // СЛЕДУЮЩЕЕ ДЕЙСТВИЕ:
                </div>
                <p className="text-sm font-bold text-white leading-relaxed">
                  {outcome.nextMove}
                </p>
              </div>
            </div>

            <button
              onClick={handleApplyResult}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Принять маршрут и перейти к действиям</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
