import React from 'react';
import { UserProfile, SubscriptionTier } from '../types';
import { 
  Sparkles, 
  Crown, 
  BookOpen, 
  MessageSquare, 
  Coins, 
  Cpu, 
  Flame, 
  Calendar,
  Layers,
  Home,
  CheckCircle2
} from 'lucide-react';
import { analytics } from '../utils/analytics';

export type MainAppTab = 'home' | 'protocols' | 'abundance' | 'reality_engine' | 'reality_log' | 'codex' | 'oracle';

interface NavbarProps {
  currentTab: MainAppTab;
  onSelectTab: (tab: MainAppTab) => void;
  userProfile: UserProfile;
  onOpenPaywall: () => void;
  onOpenWeeklyReview: () => void;
  onOpenQuiz?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userProfile,
  onOpenPaywall,
  onOpenWeeklyReview,
  onOpenQuiz,
}) => {
  const isPro = userProfile.subscriptionTier !== 'free';

  const navLinks: Array<{ id: MainAppTab; label: string; icon?: React.ReactNode }> = [
    { id: 'home', label: 'Главная', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'protocols', label: 'Протоколы', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'abundance', label: 'Изобилие', icon: <Coins className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'reality_engine', label: 'Reality Engine', icon: <Cpu className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'reality_log', label: 'Reality Log', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'oracle', label: 'Оракул', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand Title (One line, no child taglines) */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center space-x-2 cursor-pointer select-none group shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-amber-400 p-[1px] shadow-sm">
            <div className="w-full h-full bg-neutral-950 rounded-[7px] flex items-center justify-center">
              <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-300 text-xs">
                5D
              </span>
            </div>
          </div>
          <span className="font-display font-black tracking-wider text-white text-base group-hover:text-purple-300 transition-colors whitespace-nowrap">
            5DMAXING
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop, single line, 1-2 word labels) */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs font-medium">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  analytics.track('oracle_opened', { fromTab: link.id });
                  onSelectTab(link.id);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-950/60 text-white border border-purple-500/50 shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (1-2 Primary Actions) */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Quick 60s Abundance Test CTA */}
          {onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 text-xs font-mono font-medium transition-colors cursor-pointer"
              title="Пройти 60-секундный тест уровня изобилия"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Тест Изобилия (60с)</span>
            </button>
          )}

          {/* PRO Upgrade Button or PRO Status Pill */}
          {isPro ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-amber-300 font-mono text-xs font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>PRO PASS</span>
            </div>
          ) : (
            <button
              onClick={onOpenPaywall}
              className="btn-primary px-3.5 py-1.5 text-xs whitespace-nowrap"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>ENTER PRO</span>
            </button>
          )}

        </div>

      </div>

      {/* Mobile Navigation Strip (Bottom or secondary row) */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 border-t border-neutral-800/60 overflow-x-auto scrollbar-none bg-neutral-950/95">
        {navLinks.map((link) => {
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onSelectTab(link.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-purple-950/80 text-white border border-purple-500/50'
                  : 'text-neutral-400 bg-neutral-900/40'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
