import { PaymentMethodId, PlanKey, Currency } from '../config/pricing';

interface CreatePaymentResult {
  ok: boolean;
  method: PaymentMethodId | null;
  orderNumber?: string;
  redirectUrl?: string;
  error?: string;
  notConfigured?: boolean;
}

const METHOD_ROUTE: Record<PaymentMethodId, string> = {
  yookassa: '/api/pay/yookassa/create',
  cryptobot: '/api/pay/cryptobot/create',
  'telegram-manual': '/api/pay/telegram-manual/create',
};

/**
 * Создаёт платёж для выбранного способа. Если способ не настроен на бэкенде
 * ({ error: 'not_configured' }), автоматически откатывается на Telegram-оплату.
 */
export async function createPayment(
  method: PaymentMethodId,
  plan: PlanKey | 'starter',
  currency: Currency,
  promoCode?: string,
): Promise<CreatePaymentResult> {
  const attempt = async (m: PaymentMethodId): Promise<CreatePaymentResult> => {
    try {
      const res = await fetch(METHOD_ROUTE[m], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, currency, promoCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.error === 'not_configured') {
        return { ok: false, method: m, notConfigured: true, error: 'not_configured' };
      }
      if (!res.ok || !data?.redirectUrl) {
        return { ok: false, method: m, error: data?.error || 'Ошибка создания платежа' };
      }
      return { ok: true, method: m, orderNumber: data.orderNumber, redirectUrl: data.redirectUrl };
    } catch (e: any) {
      return { ok: false, method: m, error: e?.message || 'Ошибка сети' };
    }
  };

  const primary = await attempt(method);

  // Фолбэк: если основной способ не настроен, пробуем Telegram-менеджера.
  if (primary.notConfigured && method !== 'telegram-manual') {
    const fallback = await attempt('telegram-manual');
    if (fallback.ok) return fallback;
    if (!fallback.notConfigured) return fallback;
    return { ok: false, method: 'telegram-manual', notConfigured: true, error: 'not_configured' };
  }

  return primary;
}

// validatePromo: проверка промокода на бэкенде (не в клиентском JS).
export async function validatePromo(
  code: string,
): Promise<{ valid: boolean; discount?: number; code?: string }> {
  try {
    const res = await fetch('/api/pay/promo/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    return (await res.json()) as { valid: boolean; discount?: number; code?: string };
  } catch (e) {
    return { valid: false };
  }
}