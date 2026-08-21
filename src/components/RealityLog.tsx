import React, { useState } from 'react';
import { RealityLogEntry } from '../types';
import { 
  BookOpen, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Coins, 
  Flame, 
  ShieldCheck, 
  Calendar,
  X,
  Target
} from 'lucide-react';
import { analytics } from '../utils/analytics';

interface RealityLogProps {
  entries: RealityLogEntry[];
  onAddEntry: (entry: Omit<RealityLogEntry, 'id' | 'timestamp' | 'dateStr'>) => void;
}

export const RealityLog: React.FC<RealityLogProps> = ({
  entries,
  onAddEntry,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [metric, setMetric] = useState('');
  const [category, setCategory] = useState<'money' | 'focus' | 'courage' | 'creation' | 'boundaries' | 'opportunity'>('money');
  const [uncomfortableLevel, setUncomfortableLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [shiftRealized, setShiftRealized] = useState('');

  // Aggregated Stats
  const totalActions = entries.length;
  const courageActions = entries.filter((e) => e.category === 'courage' || e.uncomfortableLevel >= 3).length;
  const moneyActions = entries.filter((e) => e.category === 'money').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEntry({
      title,
      details,
      metric: metric.trim() || undefined,
      category,
      uncomfortableLevel,
      shiftRealized: shiftRealized.trim() || 'Действие расширило зону личного комфорта.',
    });

    analytics.track('reality_log_added', { category, uncomfortableLevel });

    setTitle('');
    setDetails('');
    setMetric('');
    setShiftRealized('');
    setIsModalOpen(false);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'money': return <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 font-mono text-[10px]">ДЕНЬГИ / ЧЕК</span>;
      case 'courage': return <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 font-mono text-[10px]">СМЕЛОСТЬ</span>;
      case 'focus': return <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-[10px]">DEEP WORK</span>;
      case 'creation': return <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[10px]">СОЗИДАНИЕ</span>;
      case 'boundaries': return <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">ГРАНИЦЫ</span>;
      default: return <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">ДЕЙСТВИЕ</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Summary Hero */}
      <div className="rounded-3xl p-6 sm:p-8 bg-neutral-950 border border-neutral-800 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>REALITY LOG // ФАКТЫ В МАТЕРИАЛЬНОМ МИРЕ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Дневник реальных изменений
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Никакой абстракции. Только реальные звонки, озвученные цены, сделанные релизы и преодоленные страхи.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Зафиксировать факт</span>
          </button>
        </div>

        {/* 2. Reality Shift Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-800/80">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-[10px] font-mono text-neutral-400 uppercase">Всего действий</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{totalActions}</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-[10px] font-mono text-rose-400 uppercase">Некомфортных шагов</div>
            <div className="text-2xl font-bold font-mono text-rose-300 mt-1">{courageActions}</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-[10px] font-mono text-amber-400 uppercase">Денежных решений</div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{moneyActions}</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-[10px] font-mono text-emerald-400 uppercase">Статус созидания</div>
            <div className="text-xs font-bold font-mono text-emerald-300 mt-2">HIGH AGENCY</div>
          </div>
        </div>
      </div>

      {/* 3. Entries Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono font-bold text-neutral-400 uppercase tracking-wider">
          Хроника завершенных действий ({entries.length})
        </h3>

        {entries.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center space-y-3">
            <Target className="w-8 h-8 text-neutral-600 mx-auto" />
            <div className="text-sm text-neutral-300 font-medium">Дневник пока пуст</div>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Заверши свой первый протокол или выполни сегодняшнее действие, чтобы зафиксировать первый факт в реальности.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer"
            >
              Добавить первое действие
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getCategoryBadge(entry.category)}
                    <span className="text-[11px] font-mono text-neutral-500">
                      {entry.dateStr}
                    </span>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900/30">
                      Дискомфорт: {entry.uncomfortableLevel}/5
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-neutral-100">
                    {entry.title}
                  </h4>

                  {entry.details && (
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {entry.details}
                    </p>
                  )}

                  {entry.shiftRealized && (
                    <div className="text-xs text-neutral-400 italic bg-neutral-900/50 p-2.5 rounded-xl border border-neutral-800/60">
                      «{entry.shiftRealized}»
                    </div>
                  )}
                </div>

                {entry.metric && (
                  <div className="shrink-0 px-3.5 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-amber-300 font-mono font-bold text-xs self-start">
                    {entry.metric}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Add Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-7 text-neutral-100 shadow-2xl space-y-5">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-500 hover:text-neutral-200 p-1.5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-xs font-mono text-purple-400 font-bold uppercase">
                НОВАЯ ЗАПИСЬ РЕАЛЬНОСТИ
              </div>
              <h3 className="text-xl font-bold font-display text-white mt-1">
                Что ты совершил в реальном мире?
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1.5">
                  Категория
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'money', label: 'Деньги' },
                    { id: 'courage', label: 'Смелость' },
                    { id: 'focus', label: 'Фокус' },
                    { id: 'creation', label: 'Созидание' },
                    { id: 'boundaries', label: 'Границы' },
                    { id: 'opportunity', label: 'Шанс' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all ${
                        category === cat.id
                          ? 'bg-purple-950/60 border-purple-500 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1.5">
                  Конкретное действие *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Назвал клиенту прайс 120 000 ₽ без скидки"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1.5">
                  Осязаемый результат / метрика (если есть)
                </label>
                <input
                  type="text"
                  placeholder="Например: +120 000 ₽ или 1 час сохранен"
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1.5">
                  Уровень дискомфорта / страха (1 = легко, 5 = максимальный зажим): {uncomfortableLevel}/5
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={uncomfortableLevel}
                  onChange={(e) => setUncomfortableLevel(Number(e.target.value) as any)}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1.5">
                  Что ты понял после выполнения? (Инсайт)
                </label>
                <input
                  type="text"
                  placeholder="Например: Клиент согласился сразу, страх был только в моей голове"
                  value={shiftRealized}
                  onChange={(e) => setShiftRealized(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
              >
                Сохранить в Reality Log (+100 EXP)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
