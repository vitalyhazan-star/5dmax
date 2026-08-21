import React from 'react';
import { 
  Zap, 
  Target, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Headphones, 
  BrainCircuit, 
  Gift, 
  Sparkles,
  Crown
} from 'lucide-react';
import { Protocol } from '../types';

interface ProductOfferSectionProps {
  onOpenPaywall: (trigger?: string) => void;
  onLaunchQuickProtocol: () => void;
}

export const ProductOfferSection: React.FC<ProductOfferSectionProps> = ({
  onOpenPaywall,
  onLaunchQuickProtocol,
}) => {
  return (
    <section className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-neutral-950 via-[#0c041b] to-neutral-950 p-6 sm:p-9 shadow-2xl relative overflow-hidden space-y-8">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* 1. КРЮЧОК (БОЛЬ ЗА 2 СЕКУНДЫ) */}
      <div className="max-w-3xl mx-auto text-center space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-mono font-semibold">
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          <span>СТОП ПРОКРАСТИНАЦИЯ & ВЫГОРАНИЕ</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight leading-tight">
          Устал залипать в ленте вместо работы и зажиматься перед созвонами по чекам?
        </h2>

        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-body">
          Когда внимание разорвано уведомлениями, а в теле сидит фоновый стресс, даже простая задача занимает весь день, а назвать клиенту нормальную цену становится пыткой.
        </p>
      </div>

      {/* 2. РЕШЕНИЕ И КОНКРЕТНАЯ ВЫГОДА */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
          <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-purple-400" />
            Что это такое
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            5DMAXING — это прикладная система быстрой настройки мозга
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Специально рассчитанные бинауральные звуковые волны (520–963 Гц), дыхательные алгоритмы и техники <strong>LARP Изобилия</strong>. Без мистики и эзотерики — чистая психоакустика и управление нервной системой.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Что ты получаешь
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Измеримый результат уже через 5 минут
          </h3>
          <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-200">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span><strong>3–4 часа чистого Deep Work фокуса</strong> без переключения на соцсети</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span><strong>Снятие зажима и суеты в теле</strong> перед важными переговорами</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span><strong>Быстрое засыпание за 10 минут</strong> и восстановление без кофеина</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. ПРОЗРАЧНЫЕ ШАГИ (КАК ЭТО РАБОТАЕТ В 3 ШАГА) */}
      <div className="space-y-4 relative z-10">
        <div className="text-center">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
            3 ПРОСТЫХ ШАГА К РЕЗУЛЬТАТУ
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
            Как проходит твоя сессия
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2 relative">
            <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-300 font-mono font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h4 className="text-sm font-bold text-white">Выбираешь задачу</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Сбросить утренний туман, сесть за сложный код/дизайн или настроиться на созвон с высоким чеком.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2 relative">
            <div className="w-7 h-7 rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-300 font-mono font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h4 className="text-sm font-bold text-white">Надеваешь наушники</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Включаешь звуковой протокол и делаешь короткую дыхательную настройку (3–5 минут) прямо в приложении.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2 relative">
            <div className="w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h4 className="text-sm font-bold text-white">Работаешь в потоке</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Мозг автоматически переходит в альфа/гамма ритм. Делаешь дневной объем работы спокойно и без суеты.
            </p>
          </div>
        </div>
      </div>

      {/* 4. БОНУС-ПАК В ПОДАРОК */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-neutral-900 to-purple-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
              Подарочный комплект при выборе любого PRO-тарифа
            </div>
            <div className="text-xs sm:text-sm text-neutral-200 mt-1 font-medium">
              • PDF-чеклист «LARP Изобилия в переговорах» • Шаблон утреннего Deep Work входа • Закрытый Telegram-клуб практиков
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenPaywall('Бонусный комплект PRO')}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shrink-0 cursor-pointer transition-all shadow-md flex items-center gap-1.5"
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Получить бонусы</span>
        </button>
      </div>

      {/* 5. ПРЯМОЙ CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
        <button
          type="button"
          onClick={onLaunchQuickProtocol}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Headphones className="w-4 h-4" />
          <span>Протестировать сессию бесплатно (5 мин)</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenPaywall('Тарифная сетка PRO')}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Посмотреть тарифы и скидки</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Trust reassurance */}
      <div className="text-center text-[11px] text-neutral-500 flex items-center justify-center gap-4 relative z-10">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          14 дней гарантия возврата
        </span>
        <span>•</span>
        <span>Работает в любых наушниках</span>
        <span>•</span>
        <span>Отмена в 1 клик</span>
      </div>
    </section>
  );
};
