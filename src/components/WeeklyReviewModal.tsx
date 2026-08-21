import React, { useState } from 'react';
import { RealityLogEntry, SessionRecord } from '../types';
import { 
  X, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Target, 
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { analytics } from '../utils/analytics';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionRecord[];
  realityLogs: RealityLogEntry[];
  streakDays: number;
  onSaveNextFocus: (focus: string) => void;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  isOpen,
  onClose,
  sessions,
  realityLogs,
  streakDays,
  onSaveNextFocus,
}) => {
  const [selectedNextFocus, setSelectedNextFocus] = useState<string>('money');
  const [insightNote, setInsightNote] = useState('');

  if (!isOpen) return null;

  const totalMinutes = Math.round(sessions.reduce((acc, s) => acc + s.durationSec, 0) / 60);
  const totalActions = realityLogs.length;
  const courageActions = realityLogs.filter((r) => r.category === 'courage' || r.uncomfortableLevel >= 3).length;

  const handleFinish = () => {
    analytics.track('weekly_review_completed', { nextFocus: selectedNextFocus });
    onSaveNextFocus(selectedNextFocus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-neutral-100 shadow-2xl space-y-6 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-500 hover:text-neutral-200 p-2 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>7-DAY REALITY AUDIT // ЕЖЕНЕДЕЛЬНЫЙ ОБЗОР</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Итоги твоей недели в 5D
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Честный аудит: сколько времени проведено в фокусе и какие реальные факты изменились.
          </p>
        </div>

        {/* 4 Core Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-[10px] font-mono text-neutral-400 uppercase">Сессий фокуса</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{sessions.length}</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-[10px] font-mono text-purple-400 uppercase">Минут в потоке</div>
            <div className="text-2xl font-bold font-mono text-purple-300 mt-1">{totalMinutes} мин</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-[10px] font-mono text-emerald-400 uppercase">Фактов в мире</div>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">{totalActions}</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="text-[10px] font-mono text-rose-400 uppercase">Смелых шагов</div>
            <div className="text-2xl font-bold font-mono text-rose-300 mt-1">{courageActions}</div>
          </div>
        </div>

        {/* Next Week Focus Selection */}
        <div className="space-y-3 pt-3 border-t border-neutral-800">
          <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider block">
            ВЫБЕРИ ГЛАВНЫЙ ФОКУС НА СЛЕДУЮЩИЕ 7 ДНЕЙ:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'money', title: 'ДЕНЬГИ & ЧЕКИ', desc: 'Повышение цен и переговоры' },
              { id: 'focus', title: 'DEEP WORK', desc: '4 часа чистого созидания в день' },
              { id: 'courage', title: 'СМЕЛОСТЬ', desc: '1 некомфортный звонок в день' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedNextFocus(f.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedNextFocus === f.id
                    ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/30'
                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-xs font-bold text-white">{f.title}</div>
                <div className="text-[11px] text-neutral-400 mt-1">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleFinish}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Зафиксировать план на новую неделю</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
