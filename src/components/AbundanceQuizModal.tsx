import React, { useState, useEffect } from 'react';
import { DesireCategory, AbundanceArchetype, ArchetypeProfile } from '../types';
import { 
  QUIZ_QUESTIONS, 
  ARCHETYPE_PROFILES, 
  SEVEN_DAY_JOURNEYS,
  DESIRE_OPTIONS 
} from '../config/productConfig';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Target, 
  Share2, 
  Crown, 
  Flame, 
  Radio,
  Zap,
  Shield,
  Heart,
  Coins
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { analytics } from '../utils/analytics';
import { My5DCardModal } from './My5DCardModal';

interface AbundanceQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDesire?: DesireCategory;
  onComplete: (archetype: AbundanceArchetype, profile: ArchetypeProfile) => void;
  onOpenPaywall: (trigger?: string) => void;
}

export const AbundanceQuizModal: React.FC<AbundanceQuizModalProps> = ({
  isOpen,
  onClose,
  initialDesire,
  onComplete,
  onOpenPaywall,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [resultArchetype, setResultArchetype] = useState<ArchetypeProfile | null>(null);

  // Free Mini Ritual Audio state
  const [isRitualPlaying, setIsRitualPlaying] = useState<boolean>(false);
  const [ritualSecondsLeft, setRitualSecondsLeft] = useState<number>(60);
  const [ritualBreathPhase, setRitualBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [ritualCompleted, setRitualCompleted] = useState<boolean>(false);

  // Share Card modal
  const [showShareCard, setShowShareCard] = useState<boolean>(false);

  // Daily action completed check
  const [isActionCommitted, setIsActionCommitted] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setSelectedAnswers([]);
      setIsCalculating(false);
      setResultArchetype(null);
      setIsRitualPlaying(false);
      setRitualSecondsLeft(60);
      setRitualCompleted(false);
      setIsActionCommitted(false);
      soundEngine.stop();
    }
  }, [isOpen]);

  // Mini Ritual Timer & Breath loop
  useEffect(() => {
    let interval: any = null;
    if (isRitualPlaying && ritualSecondsLeft > 0) {
      interval = setInterval(() => {
        setRitualSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRitualPlaying(false);
            setRitualCompleted(true);
            soundEngine.stop();
            analytics.track('first_protocol_completed');
            return 0;
          }
          return prev - 1;
        });

        // Breath cycle every 12 seconds: 4s inhale, 4s hold, 4s exhale
        const cycle = (60 - ritualSecondsLeft) % 12;
        if (cycle < 4) setRitualBreathPhase('inhale');
        else if (cycle < 8) setRitualBreathPhase('hold');
        else setRitualBreathPhase('exhale');
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRitualPlaying, ritualSecondsLeft]);

  if (!isOpen) return null;

  const handleSelectOption = (optionIndex: number) => {
    const nextAnswers = [...selectedAnswers];
    nextAnswers[currentStep] = optionIndex;
    setSelectedAnswers(nextAnswers);

    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finished all questions -> Calculate Archetype
      calculateResult(nextAnswers);
    }
  };

  const calculateResult = (answers: number[]) => {
    setIsCalculating(true);
    analytics.track('onboarding_completed');

    // Tally archetype weights
    const scores: Record<string, number> = {
      THE_SEEKER: 0,
      THE_BLOCKED_CREATOR: 0,
      THE_RECEIVER: 0,
      THE_BUILDER: 0,
      THE_EXPANDER: 0,
      THE_MAGNET: 0,
    };

    answers.forEach((ansIdx, qIdx) => {
      const q = QUIZ_QUESTIONS[qIdx];
      if (q && q.options[ansIdx]) {
        const weights = q.options[ansIdx].archetypeWeight as Record<string, number>;
        Object.entries(weights).forEach(([key, val]) => {
          if (scores[key] !== undefined) {
            scores[key] += val;
          }
        });
      }
    });

    // If user picked a specific desire at the start, boost aligned archetypes
    if (initialDesire === 'money') scores.THE_SEEKER += 2;
    if (initialDesire === 'love') scores.THE_RECEIVER += 3;
    if (initialDesire === 'confidence') scores.THE_BLOCKED_CREATOR += 3;
    if (initialDesire === 'luck') scores.THE_MAGNET += 3;
    if (initialDesire === 'energy') scores.THE_BUILDER += 2;
    if (initialDesire === 'everything') scores.THE_EXPANDER += 3;

    // Pick top scoring archetype
    let topKey = 'THE_SEEKER';
    let maxScore = -1;
    Object.entries(scores).forEach(([key, val]) => {
      if (val > maxScore) {
        maxScore = val;
        topKey = key;
      }
    });

    const finalProfile = ARCHETYPE_PROFILES[topKey] || ARCHETYPE_PROFILES.THE_SEEKER;

    setTimeout(() => {
      setIsCalculating(false);
      setResultArchetype(finalProfile);
      onComplete(finalProfile.id, finalProfile);
    }, 1800);
  };

  const toggleMiniRitual = () => {
    if (!resultArchetype) return;
    if (isRitualPlaying) {
      soundEngine.stop();
      setIsRitualPlaying(false);
    } else {
      soundEngine.playSolfeggioTone(resultArchetype.recommendedHz, 0.45);
      setIsRitualPlaying(true);
      analytics.track('first_protocol_started');
    }
  };

  const selectedDesireObj = DESIRE_OPTIONS.find((d) => d.id === initialDesire) || DESIRE_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto animate-fadeIn">
      
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl my-auto">
        
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/15 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-neutral-300">
              5D ABUNDANCE DISCOVERY
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="relative z-10 p-6 sm:p-8 space-y-6">
          
          {/* STEP 1: CALCULATING STATE */}
          {isCalculating && (
            <div className="py-16 text-center space-y-6 animate-pulse">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/40 border-t-purple-400 animate-spin" />
                <Sparkles className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold font-display text-white">
                  Считываем твой паттерн изобилия...
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Анализируем скрытые зажимы между желанием, действием и принятием ресурсов.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: QUESTION STEPS */}
          {!isCalculating && !resultArchetype && (
            <div className="space-y-6">
              
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span>ШАГ {currentStep + 1} ИЗ {QUIZ_QUESTIONS.length}</span>
                  <span className="text-purple-400 font-bold">{Math.round(((currentStep + 1) / QUIZ_QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-300 rounded-full"
                    style={{ width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white tracking-tight">
                  {QUIZ_QUESTIONS[currentStep].question}
                </h2>
                <p className="text-xs text-neutral-400">
                  {QUIZ_QUESTIONS[currentStep].subtitle}
                </p>
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {QUIZ_QUESTIONS[currentStep].options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentStep] === idx;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer group ${
                        isSelected 
                          ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-950/50' 
                          : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center text-xs shrink-0 border ${
                        isSelected ? 'border-purple-400 bg-purple-600 text-white' : 'border-neutral-700 text-neutral-500 group-hover:border-neutral-500'
                      }`}>
                        {idx + 1}
                      </div>

                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold group-hover:text-white transition-colors">
                          {opt.label}
                        </div>
                        <div className="text-xs text-neutral-400 leading-snug">
                          {opt.sub}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Back button */}
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 font-mono transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Назад</span>
                </button>
              )}

            </div>
          )}

          {/* STEP 3: THE EMOTIONAL RESULT & FREE EXPERIENCE */}
          {resultArchetype && (
            <div className="space-y-7 animate-fadeIn">
              
              {/* 1. HERO ARCHETYPE CARD */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-950/40 via-neutral-900 to-neutral-950 border border-purple-500/40 space-y-4 relative overflow-hidden text-center">
                
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-purple-500/40 text-amber-300 text-xs font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ТВОЙ АРХЕТИП ИЗОБИЛИЯ</span>
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
                    {resultArchetype.nameEn}
                  </h1>
                  <p className="text-sm font-semibold text-purple-300">
                    «{resultArchetype.nameRu}» · {resultArchetype.eraTitle}
                  </p>
                </div>

                {/* Game-like state percentages */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-left">
                  <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400">ЖЕЛАНИЕ</div>
                    <div className="text-base font-bold font-mono text-amber-400">{resultArchetype.metrics.desire}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400">ДЕЙСТВИЕ</div>
                    <div className="text-base font-bold font-mono text-purple-400">{resultArchetype.metrics.action}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400">ВЕРА В СЕБЯ</div>
                    <div className="text-base font-bold font-mono text-emerald-400">{resultArchetype.metrics.selfBelief}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
                    <div className="text-[10px] font-mono text-neutral-400">ПРИНЯТИЕ</div>
                    <div className="text-base font-bold font-mono text-rose-400">{resultArchetype.metrics.receiving}%</div>
                  </div>
                </div>

                {/* Psychological Mirror (Accurate self-discovery) */}
                <div className="p-4 rounded-2xl bg-neutral-950/90 border border-neutral-800/80 text-left space-y-2">
                  <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    ПСИХОЛОГИЧЕСКИЙ ЗЕРКАЛЬНЫЙ АНАЛИЗ
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                    {resultArchetype.psychologicalMirror}
                  </p>
                  <div className="pt-1 text-xs text-rose-300 font-mono">
                    <span className="font-bold">Главный скрытый блок:</span> {resultArchetype.rootBlock}
                  </div>
                </div>

                {/* Share Viral Card Button */}
                <button
                  onClick={() => setShowShareCard(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Поделиться карточкой «MY 5D CARD» в сторис</span>
                </button>

              </div>

              {/* 2. FREE FIRST SHIFT: 60-SECOND MINI RITUAL */}
              <div className="p-6 rounded-3xl bg-neutral-950 border border-amber-500/30 space-y-4">
                
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Radio className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                        YOUR FIRST SHIFT // БЕСПЛАТНАЯ НАСТРОЙКА (60 СЕК)
                      </div>
                      <div className="text-xs text-neutral-400">
                        Калибровка частоты {resultArchetype.recommendedHz} Hz + Дыхание
                      </div>
                    </div>
                  </div>

                  {ritualCompleted && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold">
                      ЗАВЕРШЕНО (+100 EXP)
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-300">
                  {resultArchetype.firstShiftAdvice}
                </p>

                {/* Audio & Breath widget */}
                <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleMiniRitual}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                        isRitualPlaying 
                          ? 'bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/40 animate-pulse' 
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {isRitualPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white font-mono">
                        {isRitualPlaying ? (
                          <span className="text-amber-300 font-bold uppercase">
                            ДЫХАНИЕ: {ritualBreathPhase === 'inhale' ? 'Вдох...' : ritualBreathPhase === 'hold' ? 'Задержка...' : 'Выдох...'} ({ritualSecondsLeft}с)
                          </span>
                        ) : ritualCompleted ? (
                          'Настройка завершена'
                        ) : (
                          'Включить 60-сек частотную настройку'
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        {resultArchetype.recommendedHz} Hz Solfeggio Tone · Снятие напряжения
                      </div>
                    </div>
                  </div>

                  {isRitualPlaying && (
                    <div className="flex items-center gap-1">
                      {[...Array(6)].map((_, i) => (
                        <span 
                          key={i} 
                          className="w-1 bg-amber-400 rounded-full animate-pulse"
                          style={{ 
                            height: `${12 + (i % 3) * 8}px`,
                            animationDelay: `${i * 150}ms` 
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* 3. YOUR NEXT MOVE (1-minute physical action) */}
              <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    YOUR NEXT MOVE // ТВОЙ ШАГ В РЕАЛЬНОСТИ
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-neutral-200 font-medium">
                    {resultArchetype.firstStepAction}
                  </p>

                  <button
                    onClick={() => {
                      setIsActionCommitted(true);
                      analytics.track('reality_action_completed', { archetype: resultArchetype.id });
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActionCommitted
                        ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-neutral-950'
                    }`}
                  >
                    {isActionCommitted ? '✓ Зафиксировано' : 'Я сделаю это прямо сейчас'}
                  </button>
                </div>
              </div>

              {/* 4. THE 7-DAY JOURNEY BRIDGE (High-converting CTA to PRO) */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 to-neutral-900 border border-purple-500/40 space-y-4 text-center">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wider">
                    ТВОЯ ПЕРСОНАЛЬНАЯ 7-ДНЕВНАЯ ПРОГРАММА
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                    {resultArchetype.sevenDayJourneyTheme}
                  </h3>
                  <p className="text-xs text-neutral-300 max-w-md mx-auto">
                    7 последовательных ритуалов + 7 действий для полного выхода в Эпоху Изобилия.
                  </p>
                </div>

                <div className="grid grid-cols-7 gap-1 pt-1 text-[10px] font-mono">
                  {['RECEIVE', 'RELEASE', 'ASK', 'CREATE', 'ACT', 'EXPAND', 'MANIFEST'].map((step, idx) => (
                    <div key={step} className="p-2 rounded-lg bg-neutral-950/70 border border-neutral-800 text-center">
                      <div className="text-neutral-400 text-[8px]">ДЕНЬ {idx + 1}</div>
                      <div className="font-bold text-purple-300 truncate">{step}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenPaywall(`7-day journey: ${resultArchetype.id}`);
                  }}
                  className="btn-primary w-full py-4 px-6 text-sm"
                >
                  <Crown className="w-4 h-4" />
                  <span>ОТКРЫТЬ ПОЛНЫЙ 7-ДНЕВНЫЙ ПУТЬ // ENTER 5D</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-[10px] text-neutral-400 font-mono">
                  14 дней безусловной гарантии · Отмена в любой момент
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Shareable Story Card Modal */}
      {resultArchetype && (
        <My5DCardModal
          isOpen={showShareCard}
          onClose={() => setShowShareCard(false)}
          archetype={resultArchetype}
        />
      )}

    </div>
  );
};
