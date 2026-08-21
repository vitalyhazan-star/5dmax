import React from 'react';
import { UserProfile, Protocol, DesireCategory } from '../types';
import { DESIRE_OPTIONS, PRODUCT_CONFIG } from '../config/productConfig';
import { 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Target, 
  Flame, 
  CheckCircle2, 
  Crown, 
  Volume2, 
  Clock, 
  Compass,
  Cpu,
  BookOpen,
  Activity,
  Heart,
  Coins,
  Shield,
  Radio,
  MessageSquare,
  Layers
} from 'lucide-react';
import { analytics } from '../utils/analytics';

interface HomeScreenProps {
  userProfile: UserProfile;
  recommendedProtocol: Protocol;
  todaysActionTitle: string;
  todaysActionDesc: string;
  isDailyQuestCompleted: boolean;
  onSelectDesire: (desire: DesireCategory) => void;
  onStartProtocol: (protocol: Protocol) => void;
  onCompleteDailyAction: () => void;
  onOpenRealityLog: () => void;
  onOpenRealityEngine: () => void;
  onOpenAbundance: () => void;
  onOpenPaywall: (trigger?: string) => void;
  onOpenQuiz: (desire?: DesireCategory) => void;
  onOpenOracle: (initialPrompt?: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  recommendedProtocol,
  todaysActionTitle,
  todaysActionDesc,
  isDailyQuestCompleted,
  onSelectDesire,
  onStartProtocol,
  onCompleteDailyAction,
  onOpenRealityLog,
  onOpenRealityEngine,
  onOpenAbundance,
  onOpenPaywall,
  onOpenQuiz,
  onOpenOracle,
}) => {
  const currentLevelDef = PRODUCT_CONFIG.levels.find((l) => l.level === userProfile.currentLevel) || PRODUCT_CONFIG.levels[0];
  const isPro = userProfile.subscriptionTier !== 'free';

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Coins': return <Coins className="w-5 h-5 text-amber-400" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-purple-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-cyan-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-violet-400" />;
      case 'Crown': return <Crown className="w-5 h-5 text-yellow-300" />;
      default: return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto pb-10 relative z-10">
      
      {/* ========================================================================= */}
      {/* 1. THE CORE CONSUMER HOOK: WHAT DO YOU WANT MORE OF?                      */}
      {/* ========================================================================= */}
      <section className="text-center space-y-6 pt-2 sm:pt-4">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-accent)] text-[var(--color-accent-primary)] text-xs font-mono font-bold tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[var(--color-accent-gold)] animate-pulse" />
          <span>ENTER YOUR 5D ERA</span>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-display text-[var(--color-text-primary)] tracking-tight leading-tight">
            ЧЕГО ТЫ ХОЧЕШЬ <br className="hidden sm:block" />
            <span className="text-glow-accent bg-gradient-to-r from-[var(--color-accent-primary)] via-[var(--color-accent-gold)] to-[var(--color-accent-secondary)] bg-clip-text text-transparent">
              БОЛЬШЕ?
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] max-w-xl mx-auto font-medium">
            Выбери главное желание. Пройди 60-секундный тест и открой персональный протокол.
          </p>
        </div>

        {/* 8 Universal Desire Magnetic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 text-left">
          {DESIRE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                analytics.track('onboarding_completed', { desire: opt.id });
                onSelectDesire(opt.id);
                onOpenQuiz(opt.id);
              }}
              className="card-surface p-5 flex flex-col justify-between space-y-4 group cursor-pointer hover:border-[var(--color-border-accent)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[var(--color-bg-deep)] border border-[var(--color-border-subtle)] group-hover:border-[var(--color-border-accent)] transition-colors">
                    {renderIcon(opt.iconName)}
                  </div>
                  <span className="text-[11px] font-mono text-[var(--color-text-muted)] font-bold group-hover:text-[var(--color-accent-primary)] transition-colors">
                    {opt.targetHz} Hz
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold font-display text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors">
                    {opt.title}
                  </h3>
                  <div className="text-xs text-[var(--color-text-secondary)] italic font-medium mt-0.5">
                    {opt.tagline}
                  </div>
                </div>

                <p className="text-xs text-[var(--color-text-muted)] leading-snug line-clamp-2">
                  {opt.hookSubtitle}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
                <span>Пройти тест</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[var(--color-accent-primary)]" />
              </div>
            </button>
          ))}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2. TODAY'S 5D HUB: ONE SCREEN → ONE DECISION                              */}
      {/* ========================================================================= */}
      <section className="rounded-3xl p-6 sm:p-9 bg-[var(--color-bg-surface)] border border-[var(--color-border-accent)] shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Subtle glow */}
        <div className="absolute -top-10 -right-10 w-80 h-80 bg-[var(--color-accent-secondary)]/15 blur-[100px] pointer-events-none rounded-full" />
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-accent)] text-[var(--color-accent-primary)]">
              <Radio className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs font-mono font-bold text-[var(--color-accent-primary)] uppercase tracking-wider">
                TODAY'S 5D RITUAL // НАСТРОЙКА ДНЯ
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">
                Калибровка состояния за 3 минуты
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-bg-deep)] border border-[var(--color-border-subtle)] text-xs font-mono text-[var(--color-accent-gold)]">
              <Flame className="w-3.5 h-3.5" />
              <span>{userProfile.streakDays} ДНЕЙ СЕРИИ</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[var(--color-bg-deep)] border border-[var(--color-border-subtle)] text-xs font-mono text-[var(--color-accent-primary)]">
              {userProfile.exp} EXP
            </div>
          </div>
        </div>

        {/* Recommended Protocol Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-[var(--color-bg-deep)] border border-[var(--color-border-subtle)]">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-block text-[11px] font-mono font-bold text-[var(--color-accent-gold)] uppercase tracking-wider">
              РЕКОМЕНДОВАНО ДЛЯ ТВОЕГО УРОВНЯ
            </div>
            <h2 className="text-2xl font-bold font-display text-[var(--color-text-primary)]">
              {recommendedProtocol.title}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {recommendedProtocol.subtitle} · {recommendedProtocol.durationMin} мин · {recommendedProtocol.frequencyTag}
            </p>
          </div>

          <button
            onClick={() => {
              analytics.track('protocol_started', { protocolId: recommendedProtocol.id });
              onStartProtocol(recommendedProtocol);
            }}
            className="btn-primary text-sm px-8 py-4 shrink-0"
          >
            <Volume2 className="w-5 h-5" />
            <span>ENTER YOUR STATE // НАЧАТЬ НАСТРОЙКУ</span>
          </button>
        </div>

        {/* Real-World Action Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                ДЕЙСТВИЕ ДНЯ В РЕАЛЬНОСТИ
              </span>
            </div>
            <h4 className="text-sm font-bold text-white font-display">
              {todaysActionTitle}
            </h4>
            <p className="text-xs text-neutral-400">
              {todaysActionDesc}
            </p>
          </div>

          {isDailyQuestCompleted ? (
            <button
              onClick={onOpenRealityLog}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold whitespace-nowrap cursor-pointer"
            >
              Открыть Reality Log
            </button>
          ) : (
            <button
              onClick={onCompleteDailyAction}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold text-xs transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Я сделал это в реальности</span>
            </button>
          )}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. ASK YOUR ORACLE: RELATABLE CONSUMER QUESTIONS                          */}
      {/* ========================================================================= */}
      <section className="rounded-3xl bg-neutral-950 border border-neutral-800 p-6 sm:p-8 space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                ASK YOUR 5D ORACLE
              </span>
            </div>
            <h3 className="text-xl font-bold font-display text-white">
              Задай волнующий вопрос о жизни, деньгах или отношениях
            </h3>
            <p className="text-xs text-neutral-400">
              Оракул раскроет скрытый зажим, даст точный инсайт и подскажет следующий шаг.
            </p>
          </div>

          <button
            onClick={() => onOpenOracle()}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <span>Открыть диалог</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          {[
            { prompt: 'Почему у меня ничего не получается, хотя я стараюсь?', cat: 'Фокус' },
            { prompt: 'Почему я боюсь называть высокий чек за работу?', cat: 'Деньги' },
            { prompt: 'Как перестать откладывать и начать новую жизнь прямо сейчас?', cat: 'Смелость' },
            { prompt: 'Почему я постоянно возвращаюсь к прошлым обидам?', cat: 'Отношения' },
            { prompt: 'Стоит ли мне сейчас менять работу или проект?', cat: 'Решения' },
            { prompt: 'Что блокирует мое изобилие прямо сегодня?', cat: 'Изобилие' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => onOpenOracle(item.prompt)}
              className="p-3.5 rounded-xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-purple-500/40 text-left transition-all cursor-pointer group space-y-1"
            >
              <div className="text-[10px] font-mono text-purple-400 uppercase">{item.cat}</div>
              <div className="text-xs text-neutral-200 group-hover:text-white font-medium">
                «{item.prompt}»
              </div>
            </button>
          ))}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. THREE PILLARS SHORTCUT TILES                                           */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1: Abundance System */}
        <div
          onClick={onOpenAbundance}
          className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white font-display group-hover:text-amber-300 transition-colors">
              Система Изобилия
            </h3>
            <p className="text-xs text-neutral-400">
              7 измерений: отношение к деньгам, чеки, масштаб и созидание.
            </p>
          </div>
          <div className="text-xs text-amber-400 font-mono font-medium flex items-center gap-1">
            <span>Изучить модули</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 2: Reality Engine */}
        <div
          onClick={onOpenRealityEngine}
          className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-purple-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white font-display group-hover:text-purple-300 transition-colors">
              Reality Engine
            </h3>
            <p className="text-xs text-neutral-400">
              Цепочка рычагов: Внимание → Состояние → Решение → Действие.
            </p>
          </div>
          <div className="text-xs text-purple-400 font-mono font-medium flex items-center gap-1">
            <span>Фильтр решений</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Pillar 3: Reality Log */}
        <div
          onClick={onOpenRealityLog}
          className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
        >
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white font-display group-hover:text-emerald-300 transition-colors">
              Reality Log
            </h3>
            <p className="text-xs text-neutral-400">
              Хроника результатов: заработанные деньги, звонки и релизы.
            </p>
          </div>
          <div className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1">
            <span>Смотреть журнал ({userProfile.realityLog.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </section>

    </div>
  );
};
