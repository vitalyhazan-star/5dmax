import React, { useState, useEffect } from 'react';
import { 
  Protocol, 
  UserProfile, 
  SessionRecord, 
  SubscriptionTier, 
  VisualizerType, 
  RealityLogEntry,
  StateArchetype,
  DesireCategory,
  AbundanceArchetype,
  ArchetypeProfile
} from './types';
import { 
  PROTOCOLS, 
  INITIAL_BADGES, 
  CODEX_ARTICLES, 
  ARCHITECT_REVIEWS 
} from './data/protocols';
import { PRODUCT_CONFIG, ARCHETYPE_PROFILES } from './config/productConfig';
import { Navbar, MainAppTab } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { ProtocolCard } from './components/ProtocolCard';
import { AbundanceModule } from './components/AbundanceModule';
import { RealityEngine } from './components/RealityEngine';
import { RealityLog } from './components/RealityLog';
import { PhilosophyCodex } from './components/PhilosophyCodex';
import { OracleChat } from './components/OracleChat';
import { MeditationSession } from './components/MeditationSession';
import { CheckInModal } from './components/CheckInModal';
import { PaywallModal } from './components/PaywallModal';
import { DownsellModal } from './components/DownsellModal';
import { WelcomeProModal } from './components/WelcomeProModal';
import { WeeklyReviewModal } from './components/WeeklyReviewModal';
import { DiagnosticQuizModal } from './components/DiagnosticQuizModal';
import { AbundanceQuizModal } from './components/AbundanceQuizModal';
import { ArchitectReviews } from './components/ArchitectReviews';
import { ProductOfferSection } from './components/ProductOfferSection';
import { 
  Sparkles, 
  Play, 
  Target, 
  Plus, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Radio, 
  Crown, 
  BookOpen, 
  MessageSquare, 
  Award, 
  ArrowRight, 
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Coins,
  Cpu
} from 'lucide-react';
import { analytics } from './utils/analytics';
import { buildDailyRecommendation, computeStreakFromSessions, todayKey } from './utils/daily';

export default function App() {
  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<MainAppTab>('home');

  // Protocol filter & list
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [protocolsList] = useState<Protocol[]>(PROTOCOLS);

  // Modals visibility
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [showDownsell, setShowDownsell] = useState<boolean>(false);
  const [showWelcomePro, setShowWelcomePro] = useState<boolean>(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState<boolean>(false);
  const [showDiagnostic, setShowDiagnostic] = useState<boolean>(false);
  const [showAbundanceQuiz, setShowAbundanceQuiz] = useState<boolean>(false);

  // Selected desire for quiz hook
  const [selectedDesire, setSelectedDesire] = useState<DesireCategory>('money');
  const [oracleInitialPrompt, setOracleInitialPrompt] = useState<string>('');

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('5d_user_profile_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      currentLevel: 1,
      levelTitle: PRODUCT_CONFIG.levels[0].title,
      exp: 150,
      nextLevelExp: PRODUCT_CONFIG.levels[0].requiredExp + 300,
      streakDays: 3,
      lastSessionDate: new Date().toISOString(),
      currentFrequencyHz: 432,
      totalMinutes: 38,
      totalSessions: 4,
      unlockedBadges: ['first-shift', 'courage-mover'],
      subscriptionTier: 'free',
      invitedCount: 0,
      referralCode: 'ARCHITECT-777',
      completedQuestDays: [1, 2],
      realityLog: [
        {
          id: 'log-seed-1',
          timestamp: Date.now() - 86400000 * 2,
          dateStr: '2 дня назад',
          category: 'money',
          title: 'Озвучил клиенту ставку 180 000 ₽ без скидок',
          details: 'Раньше соглашался на 110к из-за страха остаться без заказа. Заказчик согласился за 5 минут.',
          metric: '+180 000 ₽',
          uncomfortableLevel: 4,
          shiftRealized: 'Клиентам нужна уверенность в результате, а не скидки.',
        },
        {
          id: 'log-seed-2',
          timestamp: Date.now() - 86400000,
          dateStr: 'Вчера',
          category: 'focus',
          title: '4 часа Deep Work: полностью собран прототип без соцсетей',
          details: 'Телефон лежал в другой комнате. Сделал работу за один спринт вместо трех дней суеты.',
          metric: '4 часа чистого созидания',
          uncomfortableLevel: 2,
          shiftRealized: 'Прокрастинация — это просто дофаминовая зависимость, а не лень.',
        },
      ],
    };
  });

  // Session History
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>(() => {
    const saved = localStorage.getItem('5d_session_history_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'init-1',
        protocolId: 'proto-reset',
        protocolTitle: 'RESET // Дофаминовый сброс',
        durationSec: 300,
        timestamp: Date.now() - 86400000 * 2,
        dateStr: '2 дня назад',
        startFreqHz: 280,
        endFreqHz: 520,
        freqDelta: 240,
        expGained: 75,
        visualizerUsed: 'torus',
        intent: 'Сброс информационной перегрузки',
      },
      {
        id: 'init-2',
        protocolId: 'proto-deepwork',
        protocolTitle: 'DEEP WORK // Лазерный фокус',
        durationSec: 600,
        timestamp: Date.now() - 86400000,
        dateStr: 'Вчера',
        startFreqHz: 350,
        endFreqHz: 680,
        freqDelta: 330,
        expGained: 120,
        visualizerUsed: 'mandala',
        intent: 'Созидание без отвлечений',
      },
    ];
  });

  // Daily quest state (persisted per calendar day so it survives reloads)
  const [isDailyQuestCompleted, setIsDailyQuestCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`5d_quest_${todayKey()}`) === '1';
    } catch {
      return false;
    }
  });

  // Active Session & Flow
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [flowStep, setFlowStep] = useState<'idle' | 'pre_checkin' | 'meditating' | 'post_checkin'>('idle');
  const [preFreq, setPreFreq] = useState<number>(profile.currentFrequencyHz);
  const [currentSessionDurationSec, setCurrentSessionDurationSec] = useState<number>(0);
  const [currentSessionIntent, setCurrentSessionIntent] = useState<string>('Фокус на одном ключевом результате');

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('5d_user_profile_v2', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('5d_session_history_v2', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  // Handle Paywall Open
  const openPaywall = (trigger?: string) => {
    analytics.track('paywall_viewed', { trigger: trigger || 'manual' });
    setShowPaywall(true);
  };

  const handleUpgradeTier = (tier: SubscriptionTier) => {
    setProfile((prev) => ({
      ...prev,
      subscriptionTier: tier,
      exp: prev.exp + 500,
      unlockedBadges: Array.from(new Set([...prev.unlockedBadges, 'pro-architect'])),
      currentFrequencyHz: Math.max(prev.currentFrequencyHz, 888),
    }));
    setShowPaywall(false);
    setShowWelcomePro(true);
  };

  const handleAcceptDownsell = () => {
    setProfile((prev) => ({
      ...prev,
      subscriptionTier: 'pro',
      exp: prev.exp + 250,
      currentFrequencyHz: Math.max(prev.currentFrequencyHz, 777),
    }));
    setShowDownsell(false);
    setShowWelcomePro(true);
  };

  // Flow handlers
  const handleStartProtocol = (protocol: Protocol) => {
    if (protocol.isPro && profile.subscriptionTier === 'free') {
      openPaywall(`Протокол ${protocol.title}`);
      return;
    }
    setSelectedProtocol(protocol);
    setFlowStep('pre_checkin');
  };

  const handlePreCheckInConfirm = (freq: number, intent: string) => {
    setPreFreq(freq);
    setCurrentSessionIntent(intent);
    setFlowStep('meditating');
  };

  const handleSessionComplete = (actualDurationSec: number) => {
    setCurrentSessionDurationSec(actualDurationSec);
    setFlowStep('post_checkin');
  };

  const handlePostCheckInConfirm = (postFreq: number, intent: string, logActionTitle?: string) => {
    if (!selectedProtocol) return;

    const delta = Math.max(50, postFreq - preFreq);
    const minutes = Math.max(1, Math.round(currentSessionDurationSec / 60));
    const expGained = Math.round(minutes * 12 + delta * 0.4);

    const newRecord: SessionRecord = {
      id: `session-${Date.now()}`,
      protocolId: selectedProtocol.id,
      protocolTitle: selectedProtocol.title,
      durationSec: currentSessionDurationSec,
      timestamp: Date.now(),
      dateStr: 'Только что',
      startFreqHz: preFreq,
      endFreqHz: postFreq,
      freqDelta: delta,
      expGained,
      visualizerUsed: selectedProtocol.visualizer,
      intent: currentSessionIntent,
    };

    setSessionHistory((prev) => [...prev, newRecord]);

    const newHistory = [...sessionHistory, newRecord];
    const newStreak = computeStreakFromSessions(newHistory);

    // If user confirmed doing the real-world action, also log it directly to Reality Log!
    let newLogEntries = [...profile.realityLog];
    if (logActionTitle) {
      newLogEntries.unshift({
        id: `action-${Date.now()}`,
        timestamp: Date.now(),
        dateStr: 'Только что',
        category: (selectedProtocol.category === 'money' ? 'money' : selectedProtocol.category === 'courage' ? 'courage' : 'focus') as any,
        title: logActionTitle,
        details: `Выполнено сразу после настройки протоколом «${selectedProtocol.title}».`,
        uncomfortableLevel: 3,
        shiftRealized: 'Действие выполнено из собранного состояния без сопротивления.',
      });
    }

    // Update profile
    setProfile((prev) => {
      let newExp = prev.exp + expGained + (logActionTitle ? 100 : 0);
      let newLevel = prev.currentLevel;
      let nextLevelExp = prev.nextLevelExp;

      const matchedLevel = PRODUCT_CONFIG.levels.find(
        (lvl, idx) => newExp >= lvl.requiredExp && (idx === PRODUCT_CONFIG.levels.length - 1 || newExp < PRODUCT_CONFIG.levels[idx + 1].requiredExp)
      );

      if (matchedLevel) {
        newLevel = matchedLevel.level;
      }

      return {
        ...prev,
        currentLevel: newLevel,
        levelTitle: matchedLevel ? matchedLevel.title : prev.levelTitle,
        exp: newExp,
        nextLevelExp,
        totalMinutes: prev.totalMinutes + minutes,
        totalSessions: prev.totalSessions + 1,
        currentFrequencyHz: postFreq,
        streakDays: newStreak > 0 ? newStreak : prev.streakDays,
        lastSessionDate: new Date().toISOString(),
        realityLog: newLogEntries,
      };
    });

    setFlowStep('idle');
    setSelectedProtocol(null);
  };

  // Add Reality Log Entry
  const handleAddRealityLog = (entry: Omit<RealityLogEntry, 'id' | 'timestamp' | 'dateStr'>) => {
    const newEntry: RealityLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      dateStr: 'Сегодня',
    };

    setProfile((prev) => ({
      ...prev,
      exp: prev.exp + 100,
      realityLog: [newEntry, ...prev.realityLog],
    }));

    analytics.track('action_logged', { category: entry.category });
  };

  // Complete Daily Action
  const handleCompleteDailyAction = () => {
    setIsDailyQuestCompleted(true);
    try {
      localStorage.setItem(`5d_quest_${todayKey()}`, '1');
    } catch {}
    handleAddRealityLog({
      category: 'courage',
      title: 'Ежедневный сдвиг: совершен некомфортный шаг',
      details: 'Действие зафиксировано в рамках ежедневного квеста 5D.',
      uncomfortableLevel: 3,
      shiftRealized: 'Регулярные некомфортные шаги делают действия привычными.',
    });
  };

  const handleOpenOracleWithPrompt = (prompt?: string) => {
    if (prompt) setOracleInitialPrompt(prompt);
    setCurrentTab('oracle');
  };

  const filteredProtocols = protocolsList.filter((p) => {
    if (protocolFilter === 'all') return true;
    if (protocolFilter === 'pro') return p.isPro;
    if (protocolFilter === 'money') return p.category === 'money' || p.category === 'abundance';
    if (protocolFilter === 'focus') return p.category === 'deepwork' || p.category === 'reset';
    if (protocolFilter === 'courage') return p.category === 'courage' || p.category === 'confidence';
    return true;
  });

  // Ежедневная рекомендация зависит от профиля, дня и результата прошлой практики.
  const dailyRec = buildDailyRecommendation(profile, sessionHistory[sessionHistory.length - 1]);
  const recommendedProtocol = dailyRec.protocol;
  const todaysActionTitle = dailyRec.todaysActionTitle;
  const todaysActionDesc = dailyRec.todaysActionDesc;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-purple-600 selection:text-white relative font-sans">
      
      {/* Top Navbar (Strict 3-zone contract) */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userProfile={profile}
        onOpenPaywall={() => openPaywall('navbar')}
        onOpenWeeklyReview={() => setShowWeeklyReview(true)}
        onOpenQuiz={() => setShowAbundanceQuiz(true)}
      />

      {/* Main App Body */}
      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full">
        
        {/* VIEW 1: HOME SCREEN (Consumer Conversion Hub) */}
        {currentTab === 'home' && (
          <div className="space-y-10">
            <HomeScreen
              userProfile={profile}
              recommendedProtocol={recommendedProtocol}
              todaysActionTitle={todaysActionTitle}
              todaysActionDesc={todaysActionDesc}
              isDailyQuestCompleted={isDailyQuestCompleted}
              onSelectDesire={(desire) => {
                setSelectedDesire(desire);
                setShowAbundanceQuiz(true);
              }}
              onStartProtocol={handleStartProtocol}
              onCompleteDailyAction={handleCompleteDailyAction}
              onOpenRealityLog={() => setCurrentTab('reality_log')}
              onOpenRealityEngine={() => setCurrentTab('reality_engine')}
              onOpenAbundance={() => setCurrentTab('abundance')}
              onOpenPaywall={openPaywall}
              onOpenQuiz={(desire) => {
                if (desire) setSelectedDesire(desire);
                setShowAbundanceQuiz(true);
              }}
              onOpenOracle={handleOpenOracleWithPrompt}
            />

            {/* Product Value Offer Section */}
            <ProductOfferSection
              onOpenPaywall={() => openPaywall('offer_section')}
              onLaunchQuickProtocol={() => handleStartProtocol(protocolsList[0])}
            />

            {/* Social Proof Reviews */}
            <ArchitectReviews />
          </div>
        )}

        {/* VIEW 2: 10 PROTOCOLS LIBRARY */}
        {currentTab === 'protocols' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>10 БАЗОВЫХ ПРОТОКОЛОВ</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
                  Протоколы настройки состояния
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl">
                  Инструмент быстрой калибровки внимания, снятия телесных зажимов и подготовки к действию в реальности.
                </p>
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl bg-neutral-900 border border-neutral-800 scrollbar-none">
                {[
                  { id: 'all', label: 'Все 10' },
                  { id: 'money', label: '💰 Деньги & Чеки' },
                  { id: 'focus', label: '⚡️ Deep Work' },
                  { id: 'courage', label: '🔥 Смелость' },
                  { id: 'pro', label: '★ PRO' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setProtocolFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      protocolFilter === f.id
                        ? 'bg-purple-600 text-white font-bold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Protocol Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProtocols.map((proto) => (
                <ProtocolCard
                  key={proto.id}
                  protocol={proto}
                  onSelect={handleStartProtocol}
                  userFrequency={profile.currentFrequencyHz}
                  userTier={profile.subscriptionTier}
                  onOpenPaywall={openPaywall}
                />
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: ABUNDANCE SYSTEM (7 Pillars) */}
        {currentTab === 'abundance' && (
          <AbundanceModule
            userTier={profile.subscriptionTier}
            onOpenPaywall={openPaywall}
            onLaunchProtocol={(protocolId) => {
              const proto = protocolsList.find((p) => p.id === protocolId) || protocolsList[0];
              handleStartProtocol(proto);
            }}
            onLogAction={(actionTitle) => {
              handleAddRealityLog({
                category: 'money',
                title: actionTitle,
                details: 'Действие из практики Системы Изобилия 5D.',
                uncomfortableLevel: 3,
                shiftRealized: 'Практика изобилия закреплена в физическом мире.',
              });
            }}
          />
        )}

        {/* VIEW 4: REALITY ENGINE (Decision Filter) */}
        {currentTab === 'reality_engine' && (
          <RealityEngine
            onStartProtocol={(protocolId) => {
              const proto = protocolsList.find((p) => p.id === protocolId) || protocolsList[0];
              handleStartProtocol(proto);
            }}
            onCommitAction={(actionText) => {
              handleAddRealityLog({
                category: 'courage',
                title: actionText,
                details: 'Решение принято и выполнено через матрицу Reality Engine.',
                uncomfortableLevel: 4,
                shiftRealized: 'Хладнокровное решение сэкономило дни сомнений.',
              });
            }}
          />
        )}

        {/* VIEW 5: REALITY LOG (Action Diary) */}
        {currentTab === 'reality_log' && (
          <RealityLog
            entries={profile.realityLog}
            onAddEntry={handleAddRealityLog}
          />
        )}

        {/* VIEW 6: 5D CODEX */}
        {currentTab === 'codex' && (
          <PhilosophyCodex
            userTier={profile.subscriptionTier}
            onOpenPaywall={openPaywall}
            onLaunchProtocol={handleStartProtocol}
          />
        )}

        {/* VIEW 7: 5D REALITY COACH ORACLE */}
        {currentTab === 'oracle' && (
          <div className="max-w-4xl mx-auto">
            <OracleChat
              userFrequency={profile.currentFrequencyHz}
              userTier={profile.subscriptionTier}
              initialPrompt={oracleInitialPrompt}
              onLaunchProtocol={(protoId) => {
                const p = protocolsList.find((x) => x.id === protoId) || protocolsList[0];
                handleStartProtocol(p);
              }}
              onOpenPaywall={openPaywall}
              onLogRealityAction={(title, category, metric) => {
                handleAddRealityLog({
                  category,
                  title,
                  details: 'Сформулировано и выполнено при работе с 5D Reality Coach.',
                  metric,
                  uncomfortableLevel: 3,
                  shiftRealized: 'Снято внутреннее сопротивление перед действием.',
                });
              }}
            />
          </div>
        )}

      </main>

      {/* MODALS */}

      {/* 1. Viral Abundance Discovery Quiz (The core Top-of-Funnel Conversion Engine) */}
      <AbundanceQuizModal
        isOpen={showAbundanceQuiz}
        onClose={() => setShowAbundanceQuiz(false)}
        initialDesire={selectedDesire}
        onComplete={(archetypeKey, profileObj) => {
          setProfile((prev) => ({
            ...prev,
            abundanceArchetype: archetypeKey,
            exp: prev.exp + 150,
          }));
        }}
        onOpenPaywall={openPaywall}
      />

      {/* 2. Paywall Modal (High-converting 'Your Next Chapter' Modal) */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSelectTier={handleUpgradeTier}
        currentTier={profile.subscriptionTier}
        onOpenDownsell={() => setShowDownsell(true)}
      />

      {/* 3. Downsell Modal */}
      <DownsellModal
        isOpen={showDownsell}
        onClose={() => setShowDownsell(false)}
        onAcceptStarter={handleAcceptDownsell}
        onContinueFree={() => setShowDownsell(false)}
      />

      {/* 4. Welcome PRO Modal */}
      <WelcomeProModal
        isOpen={showWelcomePro}
        onClose={() => setShowWelcomePro(false)}
        onStartFirstPath={(focus) => {
          analytics.track('first_path_started', { focus });
          setCurrentTab('protocols');
        }}
      />

      {/* 5. Weekly Review Modal */}
      <WeeklyReviewModal
        isOpen={showWeeklyReview}
        onClose={() => setShowWeeklyReview(false)}
        sessions={sessionHistory}
        realityLogs={profile.realityLog}
        streakDays={profile.streakDays}
        onSaveNextFocus={(focus) => {
          analytics.track('weekly_focus_saved', { focus });
        }}
      />

      {/* 6. Diagnostic Reality Check Modal */}
      <DiagnosticQuizModal
        isOpen={showDiagnostic}
        onClose={() => setShowDiagnostic(false)}
        onComplete={(res) => {
          setProfile((prev) => ({
            ...prev,
            activeStateArchetype: res.archetype,
            currentFrequencyHz: res.recommendedHz,
          }));
        }}
        onOpenPaywall={() => openPaywall('diagnostic')}
      />

      {/* 7. Pre-Session State Check-in Modal */}
      {flowStep === 'pre_checkin' && selectedProtocol && (
        <CheckInModal
          type="pre"
          protocol={selectedProtocol}
          protocolTitle={selectedProtocol.title}
          initialFrequency={profile.currentFrequencyHz}
          durationMinutes={selectedProtocol.durationMin}
          isPro={profile.subscriptionTier !== 'free'}
          onConfirm={handlePreCheckInConfirm}
          onClose={() => setFlowStep('idle')}
        />
      )}

      {/* 8. Live Meditation Session Screen */}
      {flowStep === 'meditating' && selectedProtocol && (
        <MeditationSession
          protocol={selectedProtocol}
          durationMinutes={selectedProtocol.durationMin}
          initialFrequency={preFreq}
          onComplete={handleSessionComplete}
          onExit={() => setFlowStep('idle')}
        />
      )}

      {/* 9. Post-Session State Check-in Modal with Real-World Action Bridge */}
      {flowStep === 'post_checkin' && selectedProtocol && (
        <CheckInModal
          type="post"
          protocol={selectedProtocol}
          protocolTitle={selectedProtocol.title}
          preFrequency={preFreq}
          durationMinutes={Math.max(1, Math.round(currentSessionDurationSec / 60))}
          isPro={profile.subscriptionTier !== 'free'}
          onConfirm={handlePostCheckInConfirm}
          onOpenDiagnostic={() => setShowDiagnostic(true)}
          onOpenPaywall={() => openPaywall('post_session')}
        />
      )}

      {/* Footer with honest terms and pricing notes */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 px-4 text-center text-xs font-mono text-neutral-400 space-y-2">
        <p className="font-bold text-neutral-300">5DMAXING // ПЯТОЕ ИЗМЕРЕНИЕ СОЗНАНИЯ & ЭПОХА ИЗОБИЛИЯ</p>
        <p className="text-neutral-500 max-w-xl mx-auto">
          Опыт изменения состояния, мышления и поведения. Переключи внимание, сними телесный зажим и начни действовать из полноты.
        </p>
      </footer>

    </div>
  );
}
