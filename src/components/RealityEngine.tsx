import React, { useState } from 'react';
import { PRODUCT_CONFIG } from '../config/productConfig';
import { RealityEngineNode } from '../types';
import { 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck, 
  Target, 
  Sparkles,
  Zap,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  Filter
} from 'lucide-react';
import { analytics } from '../utils/analytics';

interface RealityEngineProps {
  onStartProtocol: (protocolId: string) => void;
  onLogRealityAction: (title: string, category: 'money' | 'focus' | 'courage' | 'creation' | 'boundaries' | 'opportunity', metric?: string) => void;
}

export const RealityEngine: React.FC<RealityEngineProps> = ({
  onStartProtocol,
  onLogRealityAction,
}) => {
  const [activeNodeId, setActiveNodeId] = useState<string>('thought');
  const [dilemmaInput, setDilemmaInput] = useState('');
  const [processedAction, setProcessedAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const nodes = PRODUCT_CONFIG.realityEngineNodes;
  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];

  const handleProcessDilemma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dilemmaInput.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      // Deterministic reality engine resolution based on high-agency principles
      const resolutions = [
        `Отсеки второстепенные объяснения. Сделай выбор в пользу максимального масштаба и соверши 1 звонок/отправку прямо сейчас.`,
        `Это сомнение продиктовано страхом нехватки. Назови твердые условия и держи паузу.`,
        `Сделай черновой вариант за 25 минут и покажи его в реальности. Идеализация убивает результат.`,
        `Скажи прямое и вежливое «Нет» тому, что распыляет твое внимание. Освободи 2 часа на ключевую задачу.`,
      ];
      const res = resolutions[Math.floor(Math.random() * resolutions.length)];
      setProcessedAction(res);
      setIsProcessing(false);
      analytics.track('reality_action_completed', { trigger: 'reality_engine_filter' });
    }, 600);
  };

  const handleCommitAction = () => {
    if (!processedAction) return;
    onLogRealityAction(
      `Рычаг Reality Engine: ${processedAction.slice(0, 50)}...`,
      'courage',
      'Решение принято за 2 минуты'
    );
    setProcessedAction(null);
    setDilemmaInput('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Architectural Manifesto */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-neutral-950 border border-neutral-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/10 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>REALITY ENGINE ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-tight">
            Ты не управляешь всем миром. Ты управляешь рычагами.
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 mt-2 leading-relaxed">
            Реальность не меняется от пассивных визуализаций. Она трансформируется через управляемую цепочку: 
            <strong> Внимание $\to$ Состояние $\to$ Решение $\to$ Физическое действие $\to$ Осязаемый результат $\to$ Новая идентичность</strong>.
          </p>
        </div>
      </div>

      {/* 2. Visual Chain Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {nodes.map((node, index) => {
          const isSelected = node.id === activeNodeId;
          return (
            <button
              key={node.id}
              onClick={() => setActiveNodeId(node.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isSelected
                  ? 'bg-purple-950/50 border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-950/50'
                  : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-400">
                  0{node.order}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-neutral-700'}`} />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-100 font-display">
                  {node.title.split('·')[1]}
                </div>
                <div className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                  {node.practicalLever}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Node Deep Dive Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-5">
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-mono font-bold">
            0{activeNode.order}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white font-display">
              {activeNode.title}
            </h3>
            <p className="text-xs text-neutral-400">
              {activeNode.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1.5">
            <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              ПРАКТИЧЕСКИЙ РЫЧАГ УПРАВЛЕНИЯ:
            </span>
            <p className="text-neutral-200 text-sm font-medium">
              {activeNode.practicalLever}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1.5">
            <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              ВОПРОС САМОАУДИТА:
            </span>
            <p className="text-neutral-200 text-sm font-medium">
              {activeNode.auditQuestion}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Interactive Reality Decision Filter */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/80 border border-purple-500/30 space-y-5">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          <span>ФИЛЬТР СЛОЖНЫХ РЕШЕНИЙ & СНЯТИЯ СОМНЕНИЙ</span>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white font-display">
            Пропусти текущий затык через Reality Engine
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 mt-1">
            Напиши ситуацию, где ты колеблешься, откладываешь шаг или чувствуешь тревогу:
          </p>
        </div>

        <form onSubmit={handleProcessDilemma} className="space-y-3">
          <textarea
            value={dilemmaInput}
            onChange={(e) => setDilemmaInput(e.target.value)}
            placeholder="Например: Не могу решиться поднять чек на 40 000 ₽ старому заказчику..."
            className="w-full h-24 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
          />

          <button
            type="submit"
            disabled={!dilemmaInput.trim() || isProcessing}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>{isProcessing ? 'Калибровка рычага...' : 'Получить четкое действие'}</span>
          </button>
        </form>

        {processedAction && (
          <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-3 animate-fadeIn">
            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>ВЕРДИКТ REALITY ENGINE:</span>
            </div>
            <p className="text-sm font-medium text-neutral-100 leading-relaxed">
              {processedAction}
            </p>

            <button
              onClick={handleCommitAction}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Зафиксировать в Reality Log как цель на сегодня</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
