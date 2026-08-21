import React from 'react';
import { ARCHITECT_REVIEWS } from '../data/protocols';
import { MessageSquareQuote, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

export const ArchitectReviews: React.FC = () => {
  return (
    <section className="py-10 border-t border-b border-purple-900/20 bg-neutral-950/40 relative overflow-hidden rounded-3xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono mb-2">
            <MessageSquareQuote className="w-3.5 h-3.5 text-purple-400" />
            <span>ОТЗЫВЫ ПРАКТИКОВ</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold font-display text-neutral-100 tracking-tight">
            Реальный опыт использования протоколов
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1.5">
            Без длинных предысторий: конкретная сложность $\to$ процесс $\to$ результат.
          </p>
        </div>

        {/* Text-First Reviews Grid (No photos, clean handles) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ARCHITECT_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-3.5"
            >
              {/* Header: Handle + Role badge + Date */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-purple-300">
                    {rev.username}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                    {rev.badge}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {rev.dateText}
                </span>
              </div>

              {/* 3 Steps: Problem -> Experience -> Result */}
              <div className="space-y-2.5 text-xs">
                {/* 1. Problem */}
                <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
                  <div className="text-[11px] font-semibold text-rose-400/90 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Проблема:
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-[11.5px]">
                    {rev.problem}
                  </p>
                </div>

                {/* 2. Experience */}
                <div className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/60">
                  <div className="text-[11px] font-semibold text-neutral-400 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                    Что делал(а):
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-[11.5px]">
                    {rev.experience}
                  </p>
                </div>

                {/* 3. Measured Result */}
                <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/30">
                  <div className="text-[11px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Итог:
                  </div>
                  <p className="text-neutral-200 leading-relaxed text-[11.5px] font-medium">
                    {rev.result}
                  </p>
                </div>
              </div>

              {/* Protocol tag footer */}
              <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span className="truncate max-w-[200px] text-purple-300">
                  {rev.protocolUsed}
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  Подтверждено
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Line */}
        <div className="mt-6 text-center text-xs text-neutral-500 flex items-center justify-center gap-2">
          <span>Среднее время входа в рабочее состояние по замерам пользователей: <strong>5–7 минут</strong></span>
        </div>
      </div>
    </section>
  );
};

