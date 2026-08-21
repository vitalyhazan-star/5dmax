import React, { useState } from 'react';
import { SubscriptionTier } from '../types';
import {
  PRICING_EXPERIMENTS,
  CURRENCIES,
  PAYMENT_METHODS,
  Currency,
  PlanKey,
  PaymentMethodId,
} from '../config/pricing';
import { createPayment, validatePromo } from '../utils/payments';
import {
  Check,
  X,
  Crown,
  ShieldCheck,
  CreditCard,
  Bot,
  Send,
  Loader2,
} from 'lucide-react';
import { analytics } from '../utils/analytics';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTier: (tier: SubscriptionTier) => void;
  currentTier: SubscriptionTier;
  onOpenDownsell?: () => void;
}

type Step = 'plan' | 'method';

const PLAN_DEFS: { key: PlanKey; title: string; sub: string; tier: SubscriptionTier; unit: string; hero?: boolean }[] = [
  { key: 'monthly', title: 'MONTHLY ACCESS', sub: 'Помесячный доступ, отмена в любой момент', tier: 'pro', unit: '/ месяц' },
  { key: 'yearly', title: 'ANNUAL PASS', sub: '1 год полного доступа. Удобная ставка за месяц.', tier: 'pro', unit: '/ год', hero: true },
  { key: 'lifetime', title: 'LIFETIME 5D PASS', sub: 'Один платёж навсегда, все обновления включены', tier: 'lifetime', unit: 'разово' },
];

interface MethodIconProps {
  id: PaymentMethodId;
  className?: string;
}

function MethodIcon({ id, className }: MethodIconProps) {
  if (id === 'yookassa') return <CreditCard className={className} />;
  if (id === 'cryptobot') return <Bot className={className} />;
  return <Send className={className} />;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onSelectTier,
  currentTier,
  onOpenDownsell,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('RUB');
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>('yearly');
  const [step, setStep] = useState<Step>('plan');
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [promoState, setPromoState] = useState<'idle' | 'applied' | 'invalid'>('idle');
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPricing = PRICING_EXPERIMENTS[selectedCurrency];

  const displayPrice = (plan: PlanKey) => {
    const raw = currentPricing[plan] as number;
    const price = Math.max(0, raw * (1 - promoDiscount / 100));
    const decimals = selectedCurrency === 'RUB' ? 0 : 2;
    return `${currentPricing.symbol}${price.toFixed(decimals).replace(/\.00$/, '')}`;
  };

  const handleApplyPromo = async () => {
    const code = promoCode.trim();
    if (!code) return;
    setProcessing(true);
    const res = await validatePromo(code);
    setProcessing(false);
    if (res.valid && res.discount !== undefined) {
      setPromoDiscount(res.discount);
      setPromoState('applied');
      setError(null);
    } else {
      setPromoState('invalid');
      setError('Такого промокода нет. Проверь написание.');
    }
  };

  const handleClose = () => {
    analytics.track('paywall_closed');
    setStep('plan');
    setError(null);
    if (currentTier === 'free' && onOpenDownsell) {
      onClose();
      onOpenDownsell();
    } else {
      onClose();
    }
  };

  const handleConfirmMethod = async (method: PaymentMethodId) => {
    setProcessing(true);
    setError(null);
    try {
      const res = await createPayment(method, selectedPlan, selectedCurrency, promoCode.trim() || undefined);
      if (res.ok && res.redirectUrl) {
        analytics.track('payment_redirect', { method: res.method, plan: selectedPlan, currency: selectedCurrency });
        onSelectTier(PLAN_DEFS.find((p) => p.key === selectedPlan)!.tier);
        window.location.href = res.redirectUrl;
        return;
      }
      if (res.notConfigured) {
        setError('Приёмы оплаты ещё не подключены. Свяжись с менеджером в Telegram для оформления.');
        return;
      }
      setError(res.error || 'Не удалось создать платёж. Попробуй другой способ.');
    } catch (e: any) {
      setError(e?.message || 'Ошибка сети. Попробуй ещё раз.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-purple-500/30 rounded-3xl p-6 sm:p-8 text-neutral-100 shadow-2xl space-y-6 my-6">

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'method' && (
          <button
            onClick={() => { setStep('plan'); setError(null); }}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-mono"
          >
            ← Назад к тарифам
          </button>
        )}

        <div className="text-center max-w-md mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-amber-300 text-xs font-mono font-bold uppercase">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>{step === 'plan' ? 'Выбор тарифа' : 'Способ оплаты'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
            {step === 'plan' ? 'Открой полный путь к жизни в Изобилии' : 'Как хочешь оплатить?'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            {step === 'plan'
              ? 'Выбери тариф. Доступ откроется после оформления оплаты.'
              : 'Если способ недоступен, мы автоматически предложим Telegram-менеджера.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs font-mono">
          {CURRENCIES.map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCurrency === curr ? 'bg-purple-600 text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>

        {step === 'plan' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLAN_DEFS.map(({ key, title, sub, hero, tier, unit }) => {
                const active = selectedPlan === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative ${
                      hero ? 'border-amber-500/60 bg-neutral-900' : active ? 'border-purple-500 bg-purple-950/30 ring-2 ring-purple-500/40' : 'border-neutral-800 bg-neutral-900/50'
                    }`}
                  >
                    {hero && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-mono font-black uppercase whitespace-nowrap">
                        РЕКОМЕНДУЕМ
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono font-bold text-amber-300 uppercase">{title}</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black font-display text-white">{displayPrice(key)}</span>
                        <span className="text-xs text-neutral-400 font-mono">{unit}</span>
                      </div>
                      <p className="text-xs text-neutral-400">{sub}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(key);
                        setStep('method');
                        setError(null);
                      }}
                      className={`btn-${hero ? 'amber' : 'primary'} w-full py-2.5 text-xs`}
                    >
                      Выбрать и оплатить
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <label className="block text-xs font-semibold text-neutral-300">Промокод</label>
              <div className="flex items-center gap-2">
                <input
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); setPromoState('idle'); }}
                  placeholder="Введи промокод"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-purple-500 text-white text-xs outline-none placeholder:text-neutral-500"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={processing || !promoCode.trim()}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white text-xs font-bold cursor-pointer"
                >
                  Применить
                </button>
              </div>
              {promoState === 'applied' && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <Check className="w-3.5 h-3.5" /> Промокод применён: −{promoDiscount}%
                </span>
              )}
              {promoState === 'invalid' && <span className="text-xs text-rose-400">{error}</span>}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleConfirmMethod(m.id)}
                  disabled={processing}
                  className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:border-purple-500 text-left transition-all cursor-pointer disabled:opacity-60 flex flex-col gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                    <MethodIcon id={m.id} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{m.label}</div>
                    <p className="text-xs text-neutral-400 mt-0.5">{m.hint}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-center text-neutral-400">
              Тариф: <span className="text-white font-semibold">{PLAN_DEFS.find((p) => p.key === selectedPlan)!.title}</span>
              {' · '}Сумма: <span className="text-amber-300 font-semibold">{displayPrice(selectedPlan)}</span>
            </div>

            {processing && (
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-300 font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                Создание платежа...
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-300 text-xs text-center">
                {error}
              </div>
            )}
          </>
        )}

        <div className="border-t border-neutral-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>14 дней безусловной гарантии возврата</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Безопасная оплата</span>
            <span>·</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Отмена в любой момент</span>
          </div>
        </div>

      </div>
    </div>
  );
};