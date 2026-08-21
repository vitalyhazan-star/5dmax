import React from 'react';
import { Play, Clock, Activity, Zap, Sparkles, Crown, Lock } from 'lucide-react';
import { Protocol, SubscriptionTier } from '../types';
import { BREATHING_PATTERNS } from '../data/protocols';

interface ProtocolCardProps {
  protocol: Protocol;
  onSelect: (protocol: Protocol) => void;
  userFrequency?: number;
  userTier?: SubscriptionTier;
  onOpenPaywall?: (feature: string) => void;
}

export const ProtocolCard: React.FC<ProtocolCardProps> = ({
  protocol,
  onSelect,
  userFrequency = 250,
  userTier = 'free',
  onOpenPaywall,
}) => {
  const breathing = BREATHING_PATTERNS.find(b => b.id === protocol.breathingId) || BREATHING_PATTERNS[0];
  const isProLocked = protocol.isPro && userTier === 'free';

  const getColorTheme = () => {
    if (protocol.isPro) {
      return {
        badge: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
        glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]',
        border: 'border-amber-500/40 group-hover:border-amber-300',
        btn: 'from-amber-400 to-orange-600',
      };
    }

    switch (protocol.accentColor) {
      case 'cyan':
        return {
          badge: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300',
          glow: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]',
          border: 'border-cyan-500/30 group-hover:border-cyan-400',
          btn: 'from-cyan-500 to-blue-600',
        };
      case 'magenta':
        return {
          badge: 'bg-pink-950/60 border-pink-500/40 text-pink-300',
          glow: 'group-hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]',
          border: 'border-pink-500/30 group-hover:border-pink-400',
          btn: 'from-pink-500 to-purple-600',
        };
      case 'purple':
        return {
          badge: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
          glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.45)]',
          border: 'border-purple-500/30 group-hover:border-purple-400',
          btn: 'from-purple-600 to-indigo-600',
        };
      case 'gold':
        return {
          badge: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
          glow: 'group-hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]',
          border: 'border-amber-500/30 group-hover:border-amber-400',
          btn: 'from-amber-500 to-orange-600',
        };
      default:
        return {
          badge: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
          glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]',
          border: 'border-emerald-500/30 group-hover:border-emerald-400',
          btn: 'from-emerald-500 to-teal-600',
        };
    }
  };

  const theme = getColorTheme();

  const handleClick = () => {
    if (isProLocked) {
      onOpenPaywall?.(`Протокол ${protocol.number}: ${protocol.title}`);
    } else {
      onSelect(protocol);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-2xl border ${theme.border} bg-[#0b061c]/80 backdrop-blur-xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden ${theme.glow}`}
    >
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-400 tracking-wider">
              [УРОВЕНЬ {protocol.number}]
            </span>
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium ${theme.badge}`}>
              {protocol.frequencyTag}
            </span>
          </div>

          {protocol.isPro && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-400/50 text-[10px] font-mono font-bold text-amber-300">
              <Crown className="w-3 h-3 text-amber-400" />
              PRO
            </span>
          )}
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-lg sm:text-xl font-display font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-slate-100 group-hover:to-cyan-200 transition-colors">
          {protocol.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">
          {protocol.subtitle}
        </p>

        {/* Affirmation snippet */}
        <div className="mt-3.5 px-3 py-2 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-400 italic">
          "{protocol.affirmation}"
        </div>

        {/* Для какого состояния (персонализация из блока D) */}
        <div className="mt-3 space-y-1.5">
          <div className="px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-500/25">
            <span className="block text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">
              Для состояния
            </span>
            <p className="text-xs text-neutral-300 mt-0.5 leading-snug">{protocol.forState}</p>
          </div>
          <div className="px-3 py-2 rounded-xl bg-black/30 border border-white/5">
            <span className="block text-[10px] font-mono font-bold text-cyan-300/80 uppercase tracking-wider">
              Как это работает
            </span>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">{protocol.mechanism}</p>
          </div>
        </div>
      </div>

      {/* Meta Footer */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            {breathing.name.split(' ')[0]}
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            {protocol.targetHz} Hz
          </span>
        </div>

        {isProLocked ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPaywall?.(`Протокол ${protocol.number}: ${protocol.title}`);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-300 font-display font-bold text-xs uppercase tracking-wider hover:bg-amber-900 transition-all cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Открыть PRO</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(protocol);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r ${theme.btn} text-white font-display font-bold text-xs uppercase tracking-wider transition-all cursor-pointer`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Старт</span>
          </button>
        )}
      </div>
    </div>
  );
};
