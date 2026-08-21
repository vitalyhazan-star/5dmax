import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Lock,
  Crown,
  Play,
  Volume2,
  Clock,
  Zap,
  ArrowRight,
  Layers,
  Flame,
  CheckCircle2,
  Share2,
  Compass,
  Smile,
  ShieldAlert,
} from 'lucide-react';
import { CodexArticle, SubscriptionTier, Protocol } from '../types';
import { CODEX_ARTICLES, PROTOCOLS } from '../data/protocols';

interface PhilosophyCodexProps {
  userTier: SubscriptionTier;
  onOpenPaywall: (featureName: string) => void;
  onLaunchProtocol: (protocol: Protocol) => void;
}

interface LarpScenario {
  id: string;
  title: string;
  badge: string;
  context: string;
  roleAvatar: string;
  bodyAnchor: string;
  innerMonologue: string;
  protocolId: string;
}

const LARP_SCENARIOS: LarpScenario[] = [
  {
    id: 'negotiation',
    title: 'Созвон с клиентом и озвучивание чека',
    badge: 'Переговоры',
    context: 'Перед обсуждением условий, сметы или защитой проекта',
    roleAvatar: 'Мастер с полной записью проектов на 6 месяцев вперед. Ты выбираешь, интересен ли тебе этот проект, а не выпрашиваешь работу.',
    bodyAnchor: 'Опусти плечи, разожми челюсть, выдерживай паузу в 1.5 секунды перед ответом. Говори на полтона ниже обычного.',
    innerMonologue: '«У меня уже закрыты все базовые потребности. Я здесь, чтобы помочь решить интересную задачу на моих условиях».',
    protocolId: 'proto-money',
  },
  {
    id: 'spending',
    title: 'Оплата счетов и крупные расходы',
    badge: 'Финансы',
    context: 'Когда при списании денег возникает микро-спазм или страх нехватки',
    roleAvatar: 'Управляющий постоянным финансовым потоком. Деньги — это инструмент обмена ценностью, а не дефицитный ресурс.',
    bodyAnchor: 'Сделай свободный полный выдох во время нажатия кнопки оплаты. Почувствуй свободу в диафрагме.',
    innerMonologue: '«Ресурсы циркулируют свободно. Я легко отдаю за ценность и легко привлекаю новые поступления благодаря своим навыкам».',
    protocolId: 'proto-scale',
  },
  {
    id: 'deepwork',
    title: 'Начало сложного спринта / Кодинг / Дизайн',
    badge: 'Творчество & Код',
    context: 'Когда задача кажется огромной и мозг тянется к быстрому дофамину',
    roleAvatar: 'Главный архитектор системы. Ты делаешь прототип спокойно, шаг за шагом, с любопытством исследователя.',
    bodyAnchor: 'Надень наушники, сделай 5 вдохов 4-4-4-4, отложи телефон экраном вниз.',
    innerMonologue: '«Мне не нужно сделать идеально с первой секунды. Я просто наслаждаюсь решением логической головоломки».',
    protocolId: 'proto-deepwork',
  },
  {
    id: 'social',
    title: 'Выход в новое окружение или статусное место',
    badge: 'Социальный статус',
    context: 'Встречи с инвесторами, посещение премиальных пространств, нетворкинг',
    roleAvatar: 'Человек, для которого комфорт, качество и высокий уровень — привычная естественная норма с детства.',
    bodyAnchor: 'Прямой спокойный взгляд, несуетливые плавные движения, отсутствие заискивающей улыбки.',
    innerMonologue: '«Я нахожусь здесь абсолютно органично. Мое присутствие ценно само по себе, мне не нужно ничего доказывать».',
    protocolId: 'proto-highagency',
  },
  {
    id: 'career',
    title: 'Выбор карьерного шага или смены работы',
    badge: 'Работа & Карьера',
    context: 'Когда решаешь: уходить, оставаться, а свою цену на рынке',
    roleAvatar: 'Специалист, за которым уже охотятся и которому выгоднее выбирать, чем просить. Ты оцениваешь условия, а не выпрашиваешь оффер.',
    bodyAnchor: 'Сядь ровно, стопы на полу. Короткий вдох носом, длинный выдох ртом с расслаблением челюсти перед формулировкой условий.',
    innerMonologue: '«Мой навык дефицитен. Я выбираю работу, которая соответствует моей ставке и темпам роста».',
    protocolId: 'proto-decision',
  },
  {
    id: 'conflict',
    title: 'Жёсткий разговор или отстаивание границ',
    badge: 'Конфликт & Границы',
    context: 'Когда нужно сказать нет, не соскользнуть в вину и удержать свою позицию',
    roleAvatar: 'Дипломат высшего ранга. Любая реакция оппонента — это информация, а не угроза твоей безопасности.',
    bodyAnchor: 'Голос на полтона ниже. Пауза в 1.5 секунды перед репликой. Не поднимай интонацию в конце фразы.',
    innerMonologue: '«Я спокоен. Чужой гнев касается его состояния, а не моей ценности. Моё нет — это факт, а не приглашение к спору».',
    protocolId: 'proto-courage',
  },
  {
    id: 'fear',
    title: 'Прилив тревоги или фоновый стресс',
    badge: 'Страх & Тревога',
    context: 'Когда тревога накрывает без конкретной причины и разгоняет мысли',
    roleAvatar: 'Оператор, который знает: тревога — это энергия действия, пока она не направлена вперёд.',
    bodyAnchor: 'Медленный вдох на 4 секунды, задержка до 7, длинный шипящий выдох до 8 (4-7-8). Раскрой рёбра и локти от корпуса.',
    innerMonologue: '«Тело готово к действию, но направление ещё не выбрано. Сначала выдох, потом взгляд. Тревога не враг, это сигнал».',
    protocolId: 'proto-reset',
  },
];

export const PhilosophyCodex: React.FC<PhilosophyCodexProps> = ({
  userTier,
  onOpenPaywall,
  onLaunchProtocol,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<CodexArticle | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('negotiation');

  const isProUser = userTier === 'pro' || userTier === 'lifetime';

  const filteredArticles = CODEX_ARTICLES.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  const selectedScenario = LARP_SCENARIOS.find((s) => s.id === activeScenarioId) || LARP_SCENARIOS[0];

  const handleSelectArticle = (art: CodexArticle) => {
    if (art.isProOnly && !isProUser) {
      onOpenPaywall(`Статья Кодекса: "${art.title}"`);
      return;
    }
    setActiveArticle(art);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handlePlayAudio = async (text: string) => {
    if (isAudioPlaying) {
      window.speechSynthesis?.cancel();
      setIsAudioPlaying(false);
      return;
    }

    setIsAudioPlaying(true);

    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'Kore', promptStyle: 'confident, calm and grounded' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const binary = atob(data.audio);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const tempCtx = new AudioCtx({ sampleRate: 24000 });
          const int16Array = new Int16Array(array.buffer);
          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
          }
          const audioBuffer = tempCtx.createBuffer(1, float32Array.length, 24000);
          audioBuffer.copyToChannel(float32Array, 0);

          const source = tempCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(tempCtx.destination);
          source.onended = () => setIsAudioPlaying(false);
          source.start();
          return;
        }
      }
    } catch (e) {
      console.warn('TTS error, falling back to Web Speech API', e);
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsAudioPlaying(false);
      utterance.onerror = () => setIsAudioPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsAudioPlaying(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl border border-purple-500/20 bg-neutral-950/80 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-950/40 text-xs font-mono text-purple-300 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>БАЗА ЗНАНИЙ // НЕЙРОХАКИНГ & LARP ИЗОБИЛИЯ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Материалы & Практики Состояний
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
              Прикладные техники настройки внимания, протоколы LARP Изобилия и снятие зажимов перед важными задачами.
            </p>
          </div>

          {!isProUser && (
            <button
              onClick={() => onOpenPaywall('Все статьи и практики Кодекса')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-purple-900/30"
            >
              <Crown className="w-4 h-4" />
              <span>Открыть Все PRO Статьи</span>
            </button>
          )}
        </div>

        {/* Filter categories */}
        <div className="mt-6 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'Все материалы' },
            { id: 'larp', label: '🎭 LARP Изобилия & Identity' },
            { id: 'wealth', label: '💼 Практика & Переговоры' },
            { id: 'focus', label: '⚡️ Нейробиология Фокуса' },
            { id: 'laws', label: '🧠 Кибер-Стоицизм' },
            { id: 'alchemy', label: '🌿 Восстановление' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive LARP Abundance Simulator (Тренажер Состояний) */}
      {!activeArticle && (
        <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-neutral-950 via-purple-950/20 to-neutral-950 p-6 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-300 font-semibold mb-1">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                <span>ИНТЕРАКТИВНЫЙ ТРЕНАЖЕР</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                LARP Изобилия: Экспресс-настройка под ситуацию
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Выбери контекст, чтобы мгновенно включить нужный телесный якорь и внутреннюю установку.
              </p>
            </div>

            <span className="text-[11px] px-2.5 py-1 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/30 font-mono shrink-0">
              Identity Shift 777 Hz
            </span>
          </div>

          {/* Scenario tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LARP_SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setActiveScenarioId(sc.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  activeScenarioId === sc.id
                    ? 'border-purple-500 bg-purple-950/50 text-white shadow-md'
                    : 'border-neutral-800/80 bg-neutral-900/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider font-semibold text-purple-400 mb-1">
                  {sc.badge}
                </div>
                <div className="text-xs font-medium line-clamp-1">{sc.title}</div>
              </button>
            ))}
          </div>

          {/* Scenario details card */}
          <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
                <div className="text-[11px] text-purple-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Роль и Аватар
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {selectedScenario.roleAvatar}
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
                <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Телесный якорь & Голос
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {selectedScenario.bodyAnchor}
                </p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
                <div className="text-[11px] text-amber-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Внутренний монолог
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic">
                  {selectedScenario.innerMonologue}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Рекомендуется 5-7 минут прослушивания перед началом действия</span>
              </div>

              {(() => {
                const targetProto = PROTOCOLS.find((p) => p.id === selectedScenario.protocolId) || PROTOCOLS[0];
                return (
                  <button
                    onClick={() => onLaunchProtocol(targetProto)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-purple-900/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Запустить настройку: {targetProto.title}</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 2. Active Article Reader or Article Cards Grid */}
      {activeArticle ? (
        <div className="rounded-3xl border border-purple-500/30 bg-[#0c041a]/90 backdrop-blur-xl p-6 sm:p-10 shadow-2xl space-y-6 animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => setActiveArticle(null)}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-mono"
          >
            ← Вернуться ко всем статьям
          </button>

          {/* Article Header */}
          <div className="space-y-3 border-b border-purple-900/40 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 border border-purple-400/40 text-[11px] font-mono text-purple-300">
                {activeArticle.categoryTitle}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-[11px] font-mono text-amber-300">
                {activeArticle.frequencyTag}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activeArticle.readTimeMin} мин чтения
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-display font-black text-white leading-tight">
              {activeArticle.title}
            </h2>
            <p className="text-sm text-slate-300 font-medium">{activeArticle.subtitle}</p>

            {/* Audio summary voice button */}
            {activeArticle.audioSummaryText && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => handlePlayAudio(activeArticle.audioSummaryText || '')}
                  className="px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 hover:border-purple-400 text-purple-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <span>{isAudioPlaying ? 'Остановить аудио' : 'Слушать аудио-выжимку (AI)'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Article Body */}
          <div className="space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed">
            {activeArticle.content.map((p, idx) => (
              <p key={idx} className="leading-7">
                {p}
              </p>
            ))}
          </div>

          {/* Key Mantra Quote Box */}
          <div className="my-6 p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-[#180829] to-amber-950/30 text-center space-y-1">
            <div className="text-[11px] uppercase tracking-widest text-amber-400 font-mono font-bold">
              Ключевая Нейро-Установка
            </div>
            <div className="text-base sm:text-lg font-display font-bold text-amber-200">
              «{activeArticle.keyMantra}»
            </div>
          </div>

          {/* Practical Exercise Box */}
          {activeArticle.practicalExercise && (
            <div className="p-6 rounded-2xl border border-purple-500/30 bg-purple-950/20 space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white font-display">
                  {activeArticle.practicalExercise.title}
                </h3>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                {activeArticle.practicalExercise.steps.map((st, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{st}</span>
                  </div>
                ))}
              </div>

              {activeArticle.practicalExercise.recommendedProtocolId && (
                <div className="pt-2">
                  {(() => {
                    const rec = PROTOCOLS.find(
                      (p) => p.id === activeArticle.practicalExercise?.recommendedProtocolId
                    );
                    if (!rec) return null;
                    return (
                      <button
                        onClick={() => onLaunchProtocol(rec)}
                        className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Закрепить протоколом: {rec.title}</span>
                      </button>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Articles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((art) => {
            const isLocked = art.isProOnly && !isProUser;
            return (
              <div
                key={art.id}
                onClick={() => handleSelectArticle(art)}
                className={`relative rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 group cursor-pointer ${
                  isLocked
                    ? 'border-purple-900/30 bg-[#090314]/80 opacity-80 hover:opacity-100 hover:border-amber-500/40'
                    : 'border-purple-500/30 bg-[#0d041e]/90 hover:border-purple-400/60 shadow-xl hover:shadow-purple-950/50'
                }`}
              >
                {isLocked && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                    <Lock className="w-3 h-3" />
                    <span>PRO GODMODE</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-purple-400">
                      {art.categoryTitle}
                    </span>
                    <span className="text-[10px] text-slate-500">•</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {art.readTimeMin} мин
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white group-hover:text-purple-300 transition-colors leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {art.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-purple-900/30 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-amber-300/80">
                    {art.frequencyTag}
                  </span>

                  <span className="text-xs font-semibold text-purple-400 group-hover:text-purple-300 flex items-center gap-1">
                    <span>{isLocked ? 'Разблокировать' : 'Читать'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
