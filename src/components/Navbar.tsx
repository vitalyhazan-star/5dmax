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
    <header className="sticky top-0 z-40 bg-[var(--color-bg-deep)]/90 backdrop-blur-md border-b border-[var(--color-border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand Title — хроматический эффект бренда */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center space-x-2 cursor-pointer select-none shrink-0"
        >
          {/* Визуальный идентификатор бренда — тессеракт */}
          <div className="brand-icon w-8 h-8">
            <div className="w-full h-full relative">
              <div className="absolute inset-0 border-2 border-[var(--color-accent-primary)] rounded-md"></div>
              <div className="absolute inset-1.5 border-2 border-[var(--color-accent-secondary)] rounded-sm rotate-45"></div>
            </div>
          </div>
          <span className="brand-logo group-hover:opacity-90 transition-opacity whitespace-nowrap">
            5DMAXING
          </span>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
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
                    ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-accent)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)]'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          
          {/* Quick 60s Abundance Test CTA */}
          {onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-bg-elevated)] hover:bg-[var(--color-accent-secondary)]/20 border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-mono font-medium transition-all cursor-pointer"
              title="Пройти 60-секундный тест уровня изобилия"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-gold)]" />
              <span className="hidden xl:inline">Тест Изобилия (60с)</span>
            </button>
          )}

          {/* PRO Upgrade Button or PRO Status Pill */}
          {isPro ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-accent-gold)]/40 text-[var(--color-accent-gold)] font-mono text-xs font-bold">
              <Crown className="w-3.5 h-3.5" />
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

      {/* Mobile Navigation Strip */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 border-t border-[var(--color-border-subtle)] overflow-x-auto scrollbar-none bg-[var(--color-bg-deep)]/95">
        {navLinks.map((link) => {
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onSelectTab(link.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-accent)]'
                  : 'text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)]'
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
