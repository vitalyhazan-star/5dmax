import React from 'react';
import { 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Check 
} from 'lucide-react';
import { analytics } from '../utils/analytics';
import { STARTER_7DAY_PRICES } from '../config/pricing';

interface DownsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptStarter: () => void;
  onContinueFree: () => void;
}

export const DownsellModal: React.FC<DownsellModalProps> = ({
  isOpen,
  onClose,
  onAcceptStarter,
  onContinueFree,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-neutral-100 shadow-2xl space-y-5 my-8 text-center">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-500 hover:text-neutral-200 p-1.5 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-300 mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold font-display text-white">
            Попробуй 7-дневный тест
          </h3>
          <p className="text-xs text-neutral-400">
            Если ты хочешь сначала увидеть осязаемый результат перед годовой подпиской — начни с тестового спринта.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 text-neutral-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>7 дней полного доступа ко всем 10 протоколам</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Система Изобилия и Reality Engine</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Без автоматических скрытых списаний</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => {
              analytics.track('downsell_accepted');
              onAcceptStarter();
            }}
className="btn-primary w-full py-3.5 text-xs"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              analytics.track('downsell_declined');
              onContinueFree();
            }}
            className="w-full py-2.5 text-xs text-neutral-400 hover:text-neutral-200 font-medium transition-colors cursor-pointer"
          >
            Оставить бесплатный тариф (прогресс сохранится)
          </button>
        </div>

      </div>
    </div>
  );
};
