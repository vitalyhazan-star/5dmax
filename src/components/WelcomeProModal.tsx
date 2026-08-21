import React, { useState } from 'react';
import { Protocol } from '../types';
import { 
  Sparkles, 
  Crown, 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  Zap, 
  Gift,
  X
} from 'lucide-react';

interface WelcomeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFirstPath: (focus: string) => void;
}

export const WelcomeProModal: React.FC<WelcomeProModalProps> = ({
  isOpen,
  onClose,
  onStartFirstPath,
}) => {
  const [selectedFocus, setSelectedFocus] = useState<string>('money');

  if (!isOpen) return null;

  const handleStart = () => {
    onStartFirstPath(selectedFocus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-neutral-950 border border-purple-500/50 rounded-3xl p-6 sm:p-9 text-neutral-100 shadow-2xl space-y-6 my-8 text-center">
        
        <div className="w-16 h-16 rounded-3xl bg-purple-900/40 border border-purple-500/50 flex items-center justify-center text-amber-400 mx-auto">
          <Crown className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            ДОБРО ПОЖАЛОВАТЬ В PRO
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Система активирована
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto">
            Теперь ты можешь использовать все 10 протоколов, Reality Engine, Систему Изобилия и безлимитного AI-Оракула.
          </p>
        </div>

        {/* 7-Day Path Builder */}
        <div className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 text-left space-y-3">
          <div className="text-xs font-mono font-bold text-purple-400 uppercase">
            ШАГ 1 · ВЫБЕРИ СВОЙ 7-ДНЕВНЫЙ ФОКУС
          </div>

          <div className="space-y-2">
            {[
              { id: 'money', label: 'ДЕНЬГИ & ВЫСОКИЕ ЧЕКИ', desc: 'Снятие страха перед ценой и отказ от дешевых проектов' },
              { id: 'focus', label: 'DEEP WORK & КОНЦЕНТРАЦИЯ', desc: 'Устранение прокрастинации и 4 часа чистого созидания' },
              { id: 'courage', label: 'СМЕЛОСТЬ & ПЕРЕГОВОРЫ', desc: 'Сложные разговоры и некомфортные действия каждый день' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFocus(f.id)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedFocus === f.id
                    ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/30'
                    : 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                }`}
              >
                <div className="text-xs font-bold text-white">{f.label}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="btn-primary w-full py-3.5 text-sm"
        >
          <span>Запустить мой 7-дневный спринт</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};
