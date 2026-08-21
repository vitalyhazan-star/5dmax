import React, { useState } from 'react';
import { PRODUCT_CONFIG } from '../config/productConfig';
import { AbundancePillar, Protocol } from '../types';
import { 
  Coins, 
  Compass, 
  Sparkles, 
  ShieldAlert, 
  HeartHandshake, 
  TrendingUp, 
  Crown, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Lock, 
  ChevronRight,
  HelpCircle,
  Flame,
  Volume2
} from 'lucide-react';
import { analytics } from '../utils/analytics';

interface AbundanceModuleProps {
  onStartProtocol: (protocolId: string) => void;
  onOpenPaywall: (trigger?: string) => void;
  isPro: boolean;
  onLogRealityAction: (title: string, category: 'money' | 'focus' | 'courage' | 'creation' | 'boundaries' | 'opportunity', metric?: string) => void;
}

export const AbundanceModule: React.FC<AbundanceModuleProps> = ({
  onStartProtocol,
  onOpenPaywall,
  isPro,
  onLogRealityAction,
}) => {
  const [selectedPillarId, setSelectedPillarId] = useState<string>('money');
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [reflectionInput, setReflectionInput] = useState<string>('');
  const [justLogged, setJustLogged] = useState(false);

  const pillars = PRODUCT_CONFIG.abundancePillars;
  const currentPillar = pillars.find((p) => p.id === selectedPillarId) || pillars[0];

  const getPillarIcon = (name: string) => {
    switch (name) {
      case 'Coins': return <Coins className="w-5 h-5" />;
      case 'Compass': return <Compass className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      case 'Crown': return <Crown className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const handleSelectPillar = (id: string) => {
    setSelectedPillarId(id);
    setJustLogged(false);
    setReflectionInput('');
    analytics.track('abundance_pillar_viewed', { pillarId: id });
  };

  const handleCompleteAction = () => {
    setCompletedActions((prev) => ({ ...prev, [currentPillar.id]: true }));
    onLogRealityAction(
      currentPillar.realWorldAction,
      currentPillar.id === 'money' ? 'money' : currentPillar.id === 'courage' ? 'courage' : 'creation',
      currentPillar.keyMantra
    );
    setJustLogged(true);
    analytics.track('reality_action_completed', { pillarId: currentPillar.id });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Grounded Definition */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-neutral-950 border border-neutral-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>ABUNDANCE OPERATING SYSTEM</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-tight">
            Изобилие как режим мышления, поведения и действий
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 mt-2 leading-relaxed">
            Это не обещание «вселенная даст денег». Изобилие — это способность замечать возможности, создавать осязаемую ценность, называть достойную цену своему труду и действовать без постоянного страха нехватки.
          </p>
          
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400">
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-purple-300">
              MINDSET
            </span>
            <span>$\to$</span>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-purple-300">
              PRACTICE
            </span>
            <span>$\to$</span>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-300">
              REAL-WORLD ACTION
            </span>
            <span>$\to$</span>
            <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-300">
              REFLECTION
            </span>
          </div>
        </div>
      </div>

      {/* 2. 7 Pillars Selector Tabs (Horizontal Scroll on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {pillars.map((pillar) => {
          const isSelected = pillar.id === selectedPillarId;
          const isDone = !!completedActions[pillar.id];
          return (
            <button
              key={pillar.id}
              onClick={() => handleSelectPillar(pillar.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <div className={`p-1 rounded-lg ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`}>
                {getPillarIcon(pillar.iconName)}
              </div>
              <span>{pillar.title}</span>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* 3. Active Pillar Interactive Card */}
      <div className="rounded-3xl bg-neutral-950 border border-neutral-800/80 p-6 sm:p-8 space-y-6">
        {/* Pillar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-900/30 text-amber-400 border border-purple-500/30">
                {getPillarIcon(currentPillar.iconName)}
              </span>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                  {currentPillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400">
                  {currentPillar.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => {
                if (currentPillar.id !== 'money' && !isPro) {
                  onOpenPaywall('Abundance Pillar Protocol');
                } else {
                  onStartProtocol(currentPillar.practiceProtocolId);
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Запустить протокол настройки</span>
              {!isPro && currentPillar.id !== 'money' && <Lock className="w-3 h-3 text-amber-300" />}
            </button>
          </div>
        </div>

        {/* 4-Step Breakdown for Current Pillar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* A. MINDSET SHIFT */}
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <div className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>01 · Сдвиг мышления (Mindset Shift)</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-200">
                <span className="text-[10px] font-mono text-rose-400 block mb-1 font-bold">ПАТТЕРН ДЕФИЦИТА:</span>
                {currentPillar.mindsetShift.scarcity}
              </div>
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200">
                <span className="text-[10px] font-mono text-emerald-400 block mb-1 font-bold">ПАТТЕРН ИЗОБИЛИЯ:</span>
                {currentPillar.mindsetShift.abundance}
              </div>
            </div>
          </div>

          {/* B. REAL-WORLD ACTION */}
          <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>02 · Физическое действие в реальности</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 font-medium mt-2 leading-relaxed">
                {currentPillar.realWorldAction}
              </p>
              <div className="mt-2 text-[11px] text-neutral-400 italic">
                «{currentPillar.keyMantra}»
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800">
              {completedActions[currentPillar.id] || justLogged ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Действие выполнено и занесено в Reality Log (+100 EXP)</span>
                </div>
              ) : (
                <button
                  onClick={handleCompleteAction}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Я выполнил это действие сегодня</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* C. REFLECTION & LOGGING */}
        <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>03 · Вопрос для саморефлексии</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 font-medium">
            {currentPillar.reflectionPrompt}
          </p>
        </div>
      </div>
    </div>
  );
};
