import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Volume2, 
  Loader2, 
  Play, 
  RefreshCw, 
  Zap, 
  Crown, 
  CheckCircle2, 
  HelpCircle,
  BrainCircuit,
  Target,
  Coins,
  Heart,
  Shield,
  Flame
} from 'lucide-react';
import { ChatMessage, SubscriptionTier } from '../types';
import { analytics } from '../utils/analytics';

interface OracleChatProps {
  userFrequency: number;
  userTier?: SubscriptionTier;
  onLaunchProtocol: (protocolId: string) => void;
  onOpenPaywall?: (feature: string) => void;
  onLogRealityAction?: (title: string, category: 'money' | 'focus' | 'courage' | 'creation' | 'boundaries' | 'opportunity', metric?: string) => void;
  initialPrompt?: string;
}

export const OracleChat: React.FC<OracleChatProps> = ({
  userFrequency,
  userTier = 'free',
  onLaunchProtocol,
  onOpenPaywall,
  onLogRealityAction,
  initialPrompt,
}) => {
  const isPro = userTier === 'pro' || userTier === 'lifetime';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Приветствую. Я твой персональный 5D Проводник & Оракул.

Ты можешь спросить меня о самом наболевшем:
• Почему деньги приходят с трудом или сразу утекают?
• Почему ты боишься озвучить свои истинные желания или поднять чек?
• Почему ты откладываешь новую главу жизни и ждешь «идеального момента»?
• Как выйти из тревоги и начать действовать спокойно и уверенно?

Что происходит в твоей жизни прямо сейчас?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTTSId, setActiveTTSId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = [
    'Почему у меня ничего не получается, хотя я стараюсь?',
    'Почему я боюсь называть высокий чек и делать скидки?',
    'Как перестать откладывать и начать новую жизнь?',
    'Почему я выбираю недоступных людей и боюсь близости?',
    'Стоит ли мне сейчас менять сферу деятельности?',
    'Что мне сделать прямо сейчас за 5 минут?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // If initialPrompt passed, send immediately
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    analytics.track('oracle_message_sent', { queryLength: text.length });

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          userFrequency,
          currentIntent: '5D Oracle: Мудрый, эмпатичный, глубокий проводник. Формат: 1) PATTERN (в чем психологический зажим/страх без ярлыков); 2) INSIGHT (взгляд из изобилия и достоинства); 3) YOUR NEXT MOVE (одно простое физическое действие на 2-5 минут); 4) RITUAL (рекомендованный протокол: money, deepwork, courage, love, quantum).',
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка сервера Оракула');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Сигнал получен. Переключи фокус на созидание и сделай первый шаг.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      console.error(e);
      // Relatable mass-consumer coaching fallback
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `🔍 **ПАТТЕРН:** Ты пытаешься всё проконтролировать головой и ждешь 100% гарантий перед тем, как сделать шаг. Это естественная реакция на страх неизвестности.

💡 **ИНСАЙТ:** Изобилие и уверенность приходят не ДО действия, а В ПРОЦЕССЕ. Твое право на лучшую жизнь не нужно никому доказывать.

🎯 **ТВОЙ ШАГ В РЕАЛЬНОСТИ:** Сделай 1 простое действие прямо сейчас: отправь сообщение, назови цену без скидки или закрой вкладки с новостями.

🎵 **РИТУАЛ:** Рекомендую протокол **«MONEY // Снятие зажима (639 Hz)»** или **«COURAGE // Смелость (741 Hz)»**.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayTTS = async (msgId: string, text: string) => {
    if (activeTTSId === msgId) {
      window.speechSynthesis?.cancel();
      setActiveTTSId(null);
      return;
    }

    setActiveTTSId(msgId);

    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'Kore', promptStyle: 'confident, soothing and visionary' }),
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
          source.onended = () => setActiveTTSId(null);
          source.start();
          return;
        }
      }
    } catch (e) {
      console.warn('TTS model error, falling back to Web Speech API', e);
    }

    // Web Speech API fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setActiveTTSId(null);
      utterance.onerror = () => setActiveTTSId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setActiveTTSId(null);
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-neutral-950 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl">
      
      {/* Top Banner */}
      <div className="px-6 py-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-bold text-neutral-100 text-base">
                5D Oracle & Reality Guide
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/30 text-purple-300 font-semibold">
                Gemini 3.7 Flash
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Паттерн → Инсайт → Твой шаг → Ритуал
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isPro && onOpenPaywall && (
            <button
              onClick={() => onOpenPaywall('Безлимитный AI-Оракул')}
              className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 hover:bg-amber-500/30 transition-colors cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>PRO UNLIMITED</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-6 py-2.5 bg-neutral-900/60 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-mono text-purple-400 uppercase font-bold shrink-0">
          ЧАСТЫЕ ВОПРОСЫ:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1 rounded-full bg-neutral-950 border border-neutral-800 hover:border-purple-500/40 text-neutral-300 hover:text-white text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-900 border border-purple-500/30 text-amber-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-neutral-900/90 border border-neutral-800 text-neutral-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {!isUser && (
                  <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center gap-2 text-xs">
                    <button
                      onClick={() => handlePlayTTS(msg.id, msg.content)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        activeTTSId === msg.id
                          ? 'bg-purple-950 border-purple-500 text-purple-300 animate-pulse'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{activeTTSId === msg.id ? 'Остановить голос' : 'Озвучить ответ'}</span>
                    </button>

                    <button
                      onClick={() => onLaunchProtocol('proto-money')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Запустить настройку</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-purple-500/30 flex items-center justify-center text-amber-300">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs font-mono text-neutral-400">
              Оракул считывает паттерн и формулирует инсайт...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Спроси Оракула о деньгах, отношениях или следующем шаге..."
          className="flex-1 px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 text-white text-xs sm:text-sm outline-none placeholder:text-neutral-500 font-sans"
        />

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white transition-all cursor-pointer shadow-md shadow-purple-950/50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
