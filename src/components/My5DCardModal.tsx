import React, { useState } from 'react';
import { ArchetypeProfile, UserProfile } from '../types';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Crown, 
  Flame, 
  Download,
  Instagram,
  Send
} from 'lucide-react';
import { analytics } from '../utils/analytics';

interface My5DCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  archetype: ArchetypeProfile;
  userProfile?: UserProfile;
}

export const My5DCardModal: React.FC<My5DCardModalProps> = ({
  isOpen,
  onClose,
  archetype,
  userProfile,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const shareText = `Я прошел 5D Abundance Test и мой архетип: ${archetype.nameEn} («${archetype.nameRu}»)\n\n${archetype.shareableQuote}\n\nУзнай свой уровень изобилия: 5DMAXING — Пятое измерение сознания`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    analytics.track('reality_action_completed', { note: 'viral_card_copied' });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent('https://5dmaxing.app')}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-neutral-950 border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl space-y-5 p-6 sm:p-8">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>VIRAL STORY CARD</span>
          </div>
          <h3 className="text-xl font-bold font-display text-white">Твоя 5D-Карточка</h3>
          <p className="text-xs text-neutral-400">Поделись своим архетипом в соцсетях</p>
        </div>

        {/* --- THE STORY CARD CANVAS --- */}
        <div className="relative aspect-[9/14] w-full rounded-2xl bg-gradient-to-b from-neutral-900 via-purple-950/40 to-neutral-950 border border-purple-500/40 p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
          
          {/* Background cosmic glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/20 blur-[60px] pointer-events-none rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/15 blur-[60px] pointer-events-none rounded-full" />
          
          {/* Card Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-300">5DMAXING</span>
            </div>
            <span className="text-[10px] font-mono text-purple-400 font-semibold uppercase">{archetype.eraTitle}</span>
          </div>

          {/* Card Body */}
          <div className="relative z-10 my-auto text-center space-y-3 py-2">
            <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">MY ABUNDANCE ARCHETYPE</div>
            <h2 className="text-2xl font-black font-display text-white tracking-tight leading-tight">
              {archetype.nameEn}
            </h2>
            <div className="inline-block px-3 py-1 rounded-lg bg-neutral-900/80 border border-neutral-700 text-xs text-purple-200 font-medium">
              «{archetype.nameRu}»
            </div>

            {/* Metrics pills */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-left">
              <div className="p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px]">
                <div className="text-neutral-400 font-mono text-[9px]">ЖЕЛАНИЕ</div>
                <div className="font-bold text-amber-400 font-mono">{archetype.metrics.desire}%</div>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px]">
                <div className="text-neutral-400 font-mono text-[9px]">ДЕЙСТВИЕ</div>
                <div className="font-bold text-purple-400 font-mono">{archetype.metrics.action}%</div>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px]">
                <div className="text-neutral-400 font-mono text-[9px]">ВЕРА В СЕБЯ</div>
                <div className="font-bold text-emerald-400 font-mono">{archetype.metrics.selfBelief}%</div>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px]">
                <div className="text-neutral-400 font-mono text-[9px]">ПРИНЯТИЕ</div>
                <div className="font-bold text-rose-400 font-mono">{archetype.metrics.receiving}%</div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-300 italic pt-1 leading-snug">
              {archetype.shareableQuote}
            </p>
          </div>

          {/* Card Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-purple-500/20 pt-3 text-[10px] text-neutral-400 font-mono">
            <span>ENTER YOUR 5D ERA</span>
            <span className="text-purple-300 font-bold">5DMAXING.APP</span>
          </div>

        </div>

        {/* Share buttons */}
        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-900/40"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Скопировано в буфер обмена!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Скопировать карточку для сторис</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareTelegram}
              className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>В Telegram</span>
            </button>
            <button
              onClick={handleShareX}
              className="py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span>В X (Twitter)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
