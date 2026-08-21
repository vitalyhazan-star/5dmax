import { PricingExperimentConfig } from '../types';

export const CURRENCIES = ['EUR', 'USD', 'RUB'] as const;
export type Currency = (typeof CURRENCIES)[number];

export type PlanKey = 'monthly' | 'yearly' | 'lifetime';

// Единственный источник цен на клиенте. Любые изменения цен вносятся только здесь.
// Бэкенд держит собственную копию каталога (см. server.ts) — клиент не передаёт цены как доверенные.
export const PRICING_EXPERIMENTS: Record<Currency, PricingExperimentConfig> = {
  EUR: {
    currency: 'EUR',
    symbol: '€',
    monthly: 8.99,
    yearly: 59.99,
    lifetime: 119.0,
    monthlyOld: 14.99,
    yearlyOld: 108.0,
    lifetimeOld: 249.0,
  },
  USD: {
    currency: 'USD',
    symbol: '$',
    monthly: 9.99,
    yearly: 69.99,
    lifetime: 129.0,
    monthlyOld: 16.99,
    yearlyOld: 120.0,
    lifetimeOld: 280.0,
  },
  RUB: {
    currency: 'RUB',
    symbol: '₽',
    monthly: 790,
    yearly: 5990,
    lifetime: 12900,
    monthlyOld: 1490,
    yearlyOld: 9480,
    lifetimeOld: 25000,
  },
};

// Стартовый тариф (7-дневный опыт) из Downsell-оффера.
export const STARTER_7DAY_PRICES: Record<Currency, string> = {
  EUR: '5.90 €',
  USD: '6.90 $',
  RUB: '290 ₽',
};

// Способ оплаты идентификаторы, которые совпадают с роутами бэкенда.
export type PaymentMethodId = 'yookassa' | 'cryptobot' | 'telegram-manual';

export const PAYMENT_METHODS: { id: PaymentMethodId; label: string; hint: string }[] = [
  {
    id: 'yookassa',
    label: 'Карта / СБП',
    hint: 'Банковская карта или Система быстрых платежей',
  },
  {
    id: 'cryptobot',
    label: 'Криптовалюта',
    hint: 'Оплата в USDT через CryptoBot',
  },
  {
    id: 'telegram-manual',
    label: 'Telegram-менеджер',
    hint: 'Оплата вручную после связи с менеджером',
  },
];

// Username менеджера по умолчанию, когда TELEGRAM_MANAGER_USERNAME не задан в .env.
// Бэкенд использует значение из .env; это значение — резервный дефолт для ссылки-фолбэка.
export const TELEGRAM_MANAGER_USERNAME = '5dmax_support';