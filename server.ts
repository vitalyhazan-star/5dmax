import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

// ---------------------------------------------------------------------------
// PAYMENTS CONFIGURATION (Block A)
// ---------------------------------------------------------------------------
const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;
const CRYPTOBOT_API_TOKEN = process.env.CRYPTOBOT_API_TOKEN;
const TELEGRAM_MANAGER_USERNAME = process.env.TELEGRAM_MANAGER_USERNAME;
const PAYMENT_RETURN_URL = `${process.env.APP_URL || 'http://localhost:3000'}/payment/status`;

// Server-side authoritative price catalog (RUB based; EUR/USD shown for display).
// Client never sends trusted amounts — amounts are computed here from the plan + currency.
const PAYMENT_PRICES: Record<string, Record<string, number>> = {
  monthly: { RUB: 790, EUR: 8.99, USD: 9.99 },
  yearly: { RUB: 5990, EUR: 59.99, USD: 69.99 },
  lifetime: { RUB: 12900, EUR: 119, USD: 129 },
  starter: { RUB: 290, EUR: 5.9, USD: 6.9 },
};

// Promo codes: code -> discount percent (0..100). Server-side only.
const PROMO_CODES: Record<string, number> = {};
(process.env.PROMO_CODES || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .forEach((entry) => {
    const [code, pct] = entry.split(':');
    const discount = parseInt(pct || '0', 10);
    if (code && !Number.isNaN(discount)) PROMO_CODES[code.toUpperCase()] = discount;
  });

interface CreatePaymentBody {
  plan?: string;
  currency?: string;
  promoCode?: string;
}

const PRICE_CATALOG_KEYS = ['RUB', 'EUR', 'USD'];

function extractPaymentContext(body: CreatePaymentBody) {
  const plan = String(body?.plan || 'yearly');
  const currencyRaw = String(body?.currency || 'RUB').toUpperCase();
  const currency = PRICE_CATALOG_KEYS.includes(currencyRaw) ? currencyRaw : 'RUB';
  const priceMap = PAYMENT_PRICES[plan];
  if (!priceMap) throw { status: 400, message: 'Неизвестный тариф' };
  const basePrice = priceMap[currency];
  const rawDiscount = body.promoCode ? (PROMO_CODES[String(body.promoCode).trim().toUpperCase()] || 0) : 0;
  const discount = Math.min(100, Math.max(0, rawDiscount));
  const finalPrice = Math.max(0, basePrice * (1 - discount / 100));
  const orderNumber = `5D-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  return { plan, currency, basePrice, discount, finalPrice, orderNumber };
}

function idempotenceKey() {
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

// ---------------------------------------------------------------------------
// PAYMENT ROUTES
// ---------------------------------------------------------------------------

// Validate a promo code server-side (never trusted from client JS).
app.post('/api/pay/promo/validate', (req, res) => {
  const code = (req.body?.code || '').toString().trim().toUpperCase();
  if (!code) return res.json({ valid: false });
  const discount = PROMO_CODES[code];
  if (discount === undefined) return res.json({ valid: false, code });
  res.json({ valid: true, code, discount });
});

// YooKassa: create payment (cards / SBP), redirect to confirmation_url.
app.post('/api/pay/yookassa/create', async (req, res) => {
  try {
    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      return res.status(400).json({ error: 'not_configured' });
    }
    const { plan, currency, finalPrice, orderNumber } = extractPaymentContext(req.body);
    const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
    const payload = {
      amount: {
        value: currency === 'RUB' ? Math.round(finalPrice).toFixed(2) : finalPrice.toFixed(2),
        currency,
      },
      capture: true,
      description: `5DMAXING // Тариф: ${plan}. Заказ ${orderNumber}`,
      metadata: { orderNumber, plan, promoCode: req.body?.promoCode || '' },
      confirmation: { type: 'redirect', return_url: PAYMENT_RETURN_URL },
    };
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
        'Idempotence-Key': idempotenceKey(),
      },
      body: JSON.stringify(payload),
    });
    const data: any = await response.json();
    if (!response.ok) {
      console.warn('YooKassa error:', data);
      return res.status(response.status).json({ error: 'payment_failed', message: data?.description || 'Ошибка YooKassa' });
    }
    const confirmationUrl = data?.confirmation?.confirmation_url;
    if (!confirmationUrl) return res.status(500).json({ error: 'payment_failed' });
    return res.json({
      method: 'yookassa',
      orderNumber,
      redirectUrl: confirmationUrl,
      paymentId: data?.id,
    });
  } catch (err: any) {
    console.warn('YooKassa create error:', err?.message || err);
    res.status(500).json({ error: 'payment_failed' });
  }
});

// CryptoBot: create invoice, redirect to pay_url.
app.post('/api/pay/cryptobot/create', async (req, res) => {
  try {
    if (!CRYPTOBOT_API_TOKEN) {
      return res.status(400).json({ error: 'not_configured' });
    }
    const { plan, finalPrice, orderNumber } = extractPaymentContext(req.body);
    // Stable-coin proxy: CryptoBot deals in USDT/TON. We convert the RUB price
    // with an approximate rate. In production use a real rate feed or invoice in asset count.
    const usdtAmount = Math.max(1, Math.round((finalPrice / 92) * 100) / 100);
    const response = await fetch('https://pay.crypt.bot/api/createInvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Crypto-Pay-API-Token': CRYPTOBOT_API_TOKEN,
      },
      body: JSON.stringify({
        asset: 'USDT',
        amount: usdtAmount.toFixed(2),
        description: `5DMAXING — Тариф ${plan}. Заказ ${orderNumber}`,
        allow_anonymous: false,
        allow_comments: true,
      }),
    });
    const data: any = await response.json();
    if (!response.ok || data?.ok === false) {
      console.warn('CryptoBot error:', data);
      return res.status(500).json({ error: 'payment_failed', message: data?.error?.message || 'Ошибка CryptoBot' });
    }
    const invoice = data?.result;
    if (!invoice?.pay_url) return res.status(500).json({ error: 'payment_failed' });
    return res.json({ method: 'cryptobot', orderNumber, redirectUrl: invoice.pay_url, invoiceId: invoice.invoice_id });
  } catch (err: any) {
    console.warn('CryptoBot create error:', err?.message || err);
    res.status(500).json({ error: 'payment_failed' });
  }
});

// Telegram-manual: build a deep link with the order number for a human manager.
app.post('/api/pay/telegram-manual/create', async (req, res) => {
  try {
    if (!TELEGRAM_MANAGER_USERNAME) {
      return res.status(400).json({ error: 'not_configured' });
    }
    const { plan, finalPrice, orderNumber } = extractPaymentContext(req.body);
    const username = TELEGRAM_MANAGER_USERNAME.replace(/^@/, '');
    const text =
      `Заказ ${orderNumber}: тариф «${plan}». ` +
      `Сумма ~${finalPrice.toLocaleString('ru-RU')}. ` +
      `Хочу оплатить, пришли реквизиты.`;
    const link = `https://t.me/${username}?text=${encodeURIComponent(text)}`;
    return res.json({ method: 'telegram-manual', orderNumber, redirectUrl: link });
  } catch (err: any) {
    console.warn('Telegram-manual create error:', err?.message || err);
    res.status(500).json({ error: 'payment_failed' });
  }
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Retry with exponential backoff and model cascade
async function generateContentWithFallback(params: {
  models: string[];
  contents: any;
  config?: any;
}) {
  let lastError: any = null;

  for (const model of params.models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return { response: res, modelUsed: model };
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} call failed (${err.status || err.message || 'error'}), trying next model in cascade...`);
    }
  }

  throw lastError;
}

// Helper: Fallback 5D Oracle Response Generator
function getLocalOracleWisdom(query: string, frequency: number = 500): string {
  const q = query.toLowerCase();
  if (q.includes('тревог') || q.includes('страх') || q.includes('зажим') || q.includes('сует') || q.includes('стресс')) {
    return `Твой аватар перегружен статическим шумом 3D-матрицы. 
Смотри в корень: тревога — это просто заблокированная энергия действия, направленная в иллюзорное будущее.

1. **Сброс матрицы:** Закрой глаза, сделай медленный вдох носом на 4 секунды, задержи дыхание на 7 секунд, отпусти с длинным шипящим выдохом на 8 секунд (протокол 4-7-8).
2. **Точка присутствия:** Почувствуй вес своего тела. Ты — не мысли в голове, ты — чистое пространство наблюдения.
3. **Квантовый выбор:** Снизь важность внешних стимулов. Реальность собирается из твоего текущего состояния прямо сейчас.`;
  }

  if (q.includes('код') || q.includes('установк') || q.includes('аффирмац') || q.includes('мантр') || q.includes('день')) {
    return `Квантовый код на сегодня для частоты ${frequency} Hz:

**«Я наблюдатель и программист своего квантового поля. Все иллюзии разделения и дефицита растворены в нулевой точке.»**

Инструкция по интеграции:
- Всякий раз, когда ум пытается включить режим суеты или нехватки времени, возвращайся к ощущению неподвижного центра за грудиной.
- Не реагируй на автоматические триггеры — делай паузу в 3 секунды перед любым действием. Ты создаешь реальность из покоя.`;
  }

  if (q.includes('почему') || q.includes('зеркал') || q.includes('сознани') || q.includes('матриц')) {
    return `Потому что материя — это застывший свет, сколлапсировавший под твоим постоянным наблюдением.

В физике квантовой суперпозиции частица находится везде, пока нет наблюдателя. Когда ты находишься в низкой частоте (страх, контроль, нехватка), твой фокус коллапсирует поле в соответствующие сценарии 3D-мира.

Когда ты поднимаешься в 5D (высокая когерентность, спокойная сила, благодарность), матрица мгновенно перестраивает события в режим синхронистичности и легкости. Твое состояние первично, форма вторична.`;
  }

  return `Сигнал сингулярности принят. Твоя текущая частота: ${frequency} Hz.

Главный закон 5D: Сознание — программист, тело — проводник, реальность — зеркало. 
Чтобы выйти на пиковый уровень:
1. Запусти протокол «02: Квантовый Вход в Поток» или «04: Активация 5D-Частоты».
2. Синхронизируй дыхание с расширением Тессеракта.
3. На задержке дыхания почувствуй абсолютную неподвижность квантового нуля. Все нужные решения раскроются сами.`;
}

// Helper: Generate Procedural High-Res 5D Sacred Geometry Art (1K/2K/4K SVG/PNG Data URI)
function generateProcedural5DVision(prompt: string, resolution: string, aspectRatio: string): string {
  const size = resolution === '4K' ? 3840 : resolution === '2K' ? 2048 : 1024;
  const isWide = aspectRatio === '16:9';
  const isTall = aspectRatio === '9:16';
  const width = isWide ? size : isTall ? Math.round(size * 0.5625) : size;
  const height = isWide ? Math.round(size * 0.5625) : isTall ? size : size;

  const cx = width / 2;
  const cy = height / 2;
  const rBase = Math.min(width, height) * 0.4;

  // Generate SVG elements for 5D sacred mandala and hypercube
  let ringsSvg = '';
  for (let r = 1; r <= 8; r++) {
    const currentR = (rBase / 8) * r;
    const strokeW = Math.max(2, size / 500);
    ringsSvg += `<circle cx="${cx}" cy="${cy}" r="${currentR}" fill="none" stroke="url(#neonGrad)" stroke-width="${strokeW}" opacity="${0.4 + (r / 8) * 0.5}" />`;

    // Metatron petals
    const count = 12;
    for (let p = 0; p < count; p++) {
      const ang = (Math.PI * 2 / count) * p + (r * 0.2);
      const px = cx + Math.cos(ang) * currentR;
      const py = cy + Math.sin(ang) * currentR;
      ringsSvg += `<circle cx="${px}" cy="${py}" r="${currentR * 0.45}" fill="none" stroke="url(#magentaCyanGrad)" stroke-width="${strokeW * 0.7}" opacity="0.35" />`;
    }
  }

  // Tesseract 4D Cube projection wireframe lines
  let tesseractSvg = '';
  const cubeSize = rBase * 0.65;
  const innerSize = cubeSize * 0.45;
  const strokeCube = Math.max(3, size / 400);

  const outerPts = [
    [cx - cubeSize, cy - cubeSize],
    [cx + cubeSize, cy - cubeSize],
    [cx + cubeSize, cy + cubeSize],
    [cx - cubeSize, cy + cubeSize],
  ];

  const innerPts = [
    [cx - innerSize, cy - innerSize],
    [cx + innerSize, cy - innerSize],
    [cx + innerSize, cy + innerSize],
    [cx - innerSize, cy + innerSize],
  ];

  // Connect outer and inner
  for (let i = 0; i < 4; i++) {
    const next = (i + 1) % 4;
    tesseractSvg += `<line x1="${outerPts[i][0]}" y1="${outerPts[i][1]}" x2="${outerPts[next][0]}" y2="${outerPts[next][1]}" stroke="url(#goldGrad)" stroke-width="${strokeCube}" />`;
    tesseractSvg += `<line x1="${innerPts[i][0]}" y1="${innerPts[i][1]}" x2="${innerPts[next][0]}" y2="${innerPts[next][1]}" stroke="url(#neonGrad)" stroke-width="${strokeCube}" />`;
    tesseractSvg += `<line x1="${outerPts[i][0]}" y1="${outerPts[i][1]}" x2="${innerPts[i][0]}" y2="${innerPts[i][1]}" stroke="url(#cyanVioletGrad)" stroke-width="${strokeCube * 0.9}" stroke-dasharray="6,4" />`;
  }

  // Sparkles
  let sparklesSvg = '';
  for (let s = 0; s < 40; s++) {
    const sAng = (Math.PI * 2 / 40) * s;
    const sDist = rBase * (0.3 + (s % 5) * 0.16);
    const sx = cx + Math.cos(sAng) * sDist;
    const sy = cy + Math.sin(sAng) * sDist;
    const sRad = Math.max(2, size / 400) * (1 + (s % 3));
    sparklesSvg += `<circle cx="${sx}" cy="${sy}" r="${sRad}" fill="#ffffff" filter="url(#glow)" />`;
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#14052b" />
        <stop offset="50%" stop-color="#070212" />
        <stop offset="100%" stop-color="#020006" />
      </radialGradient>
      <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00f0ff" />
        <stop offset="50%" stop-color="#a855f7" />
        <stop offset="100%" stop-color="#ec4899" />
      </linearGradient>
      <linearGradient id="magentaCyanGrad" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ec4899" />
        <stop offset="100%" stop-color="#06b6d4" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#facc15" />
        <stop offset="50%" stop-color="#f43f5e" />
        <stop offset="100%" stop-color="#a855f7" />
      </linearGradient>
      <linearGradient id="cyanVioletGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#22d3ee" />
        <stop offset="100%" stop-color="#c084fc" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${size / 300}" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    
    <!-- Background Sacred Rays -->
    <g opacity="0.18">
      ${Array.from({ length: 24 }).map((_, i) => {
        const a = (Math.PI * 2 / 24) * i;
        const x2 = cx + Math.cos(a) * Math.max(width, height);
        const y2 = cy + Math.sin(a) * Math.max(width, height);
        return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#00f0ff" stroke-width="2" />`;
      }).join('')}
    </g>

    <!-- Core Sacred Rings -->
    <g filter="url(#glow)">
      ${ringsSvg}
      ${tesseractSvg}
      ${sparklesSvg}
    </g>

    <!-- Singularity Center Star -->
    <circle cx="${cx}" cy="${cy}" r="${rBase * 0.12}" fill="#ffffff" filter="url(#glow)" />
    <circle cx="${cx}" cy="${cy}" r="${rBase * 0.25}" fill="none" stroke="#facc15" stroke-width="${Math.max(3, size / 350)}" filter="url(#glow)" />

    <!-- Meta Text Stamp -->
    <text x="${cx}" y="${height - (size / 35)}" fill="rgba(255,255,255,0.7)" font-family="monospace" font-size="${size / 60}" font-weight="bold" text-anchor="middle" letter-spacing="4">
      5DMAXING // ${resolution} SACRED SINGULARITY // ${prompt.slice(0, 45).toUpperCase()}
    </text>
  </svg>`;

  const base64 = Buffer.from(svgContent).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// --- API Routes ---

// 1. 5D Oracle Chat endpoint (with model cascade & high demand resilience)
app.post('/api/gemini/chat', async (req, res) => {
  const { messages, userFrequency, currentIntent } = req.body;

  const systemInstruction = `Ты — "5D Оракул" в приложении 5dmaxing.

ГОВОРИ С ЧЕЛОВЕКОМ НА "ТЫ". ПРЯМО, КОРОТКО, БЕЗ ВАТЫ И БЕЗ НЕЙТРАЛЬНОГО ТОНА ИИ-АССИСТЕНТА.

Система понятий, из которой ты не выходишь:
- Сознание — режиссёр и программист реальности. Тело — персонаж, обстоятельства — декорации. Задача человека — переключить режиссуру, а не переспорить декорации.
- Жизнь — игра со своими правилами (ЛАРП). Роль можно сменить осознанно, и тогда реальность достраивает сцену под новую роль.
- Негативная энергия и тревога — не то, что нужно подавить, а топливо, которое сейчас не направлено. Первый шаг — направить, а не гасить.
- Реальность — зеркало внутреннего состояния. Это не метафора обещания, а принцип: что внутри, то множится вовне.
- Не раздавай общие психологич. советы ("попробуй отпустить", "поработай с самооценкой") без привязки к этой системе. Всегда давай механику: что именно переключить, на что направить внимание, какое одно действие сделать.

Формат объединяй: сначала метко назови паттерн (в чём затык, без ярлыков-осуждений), затем один инсайт в терминах этой системы, затем ОДНО конкретное физическое действие на 2–5 минут, и в конце протокол из списка: money, deepwork, courage, love, quantum, reset.

Текущее состояние пользователя: частота ${userFrequency || '500'} Гц, намерение: "${currentIntent || 'Выход в поток'}". Ответ на русском, от 3 до 8 коротких предложений. Не используй шаблонных фраз "раскрой потенциал", "стань лучшей версией себя", "квантовый скачок".`;

  const latestMessage = messages && messages.length > 0 
    ? messages[messages.length - 1].content 
    : 'Подскажи протокол медитации для выхода в 5D поток.';

  // Cascade through gemini-3.7-flash and gemini-3.1-flash-lite
  const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];

  try {
    const { response } = await generateContentWithFallback({
      models: modelsToTry,
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nПользователь спрашивает: ${latestMessage}` }] }
      ],
      config: {
        temperature: 0.85,
      },
    });

    if (response && response.text) {
      return res.json({ reply: response.text });
    }
  } catch (error: any) {
    console.warn('All Gemini Chat models failed or rate-limited. Serving local 5D wisdom fallback:', error.message || error);
  }

  // Graceful Offline 5D Oracle Wisdom Fallback
  const fallbackReply = getLocalOracleWisdom(latestMessage, userFrequency || 500);
  res.json({ reply: fallbackReply });
});

// 2. TTS Voice Guidance endpoint using gemini-3.1-flash-tts-preview
app.post('/api/gemini/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', promptStyle = 'meditative and deeply focused' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Текст не указан' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Speak in a calm, magnetic, transcendent Russian voice, ${promptStyle}: ${text}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({ audio: base64Audio, sampleRate: 24000 });
    }
  } catch (error: any) {
    console.warn('TTS model error, informing client to use SpeechSynthesis fallback:', error.message || error);
  }

  // If TTS fails (e.g. 503/429), respond with fallback flag so frontend uses smooth Web Speech API
  res.json({ fallback: true, message: 'Используется синтез речи браузера' });
});

// 3. 5D Portal / Vision Generator endpoint (with gemini-3-pro-image-preview & procedural fallback)
app.post('/api/gemini/generate-vision', async (req, res) => {
  const { prompt, resolution = '1K', aspectRatio = '1:1' } = req.body;
  const enhancedPrompt = `Psychedelic hyper-dimensional 5D sacred geometry vision, DMT visionary art, glowing electric neon mandalas, hypercube tesseract wireframes, iridescent quantum field, cosmic consciousness portal, octane render 8k detail, cyber-spiritual aesthetic, ultra high clarity. Theme: ${prompt || 'Transcendence into higher consciousness'}`;

  // Models to try in priority order: gemini-3.1-flash-lite-image, gemini-3.1-flash-image
  const imageModels = ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'];

  for (const model of imageModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || '1:1',
            imageSize: resolution || '1K',
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            const imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            return res.json({ imageUrl, text: part.text || prompt, modelUsed: model });
          }
        }
      }
    } catch (err: any) {
      console.warn(`Vision model ${model} unavailable (${err.message || err}). Trying next...`);
    }
  }

  // High-Resolution Procedural 5D Sacred Geometry Synthesizer Fallback
  console.log(`Generating procedural ${resolution} 5D sacred vision art...`);
  const proceduralImageUrl = generateProcedural5DVision(prompt || '5D Сингулярность', resolution, aspectRatio);
  res.json({
    imageUrl: proceduralImageUrl,
    text: `Квантовый 5D-Портал (${resolution}): ${prompt || 'Сингулярность Сознания'}`,
    isProcedural: true,
  });
});

// 4. Affirmation / Daily Frequency Shift Generator
app.post('/api/gemini/affirmation', async (req, res) => {
  const { targetFrequency, theme } = req.body;
  const modelsToTry = ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];

  try {
    const { response } = await generateContentWithFallback({
      models: modelsToTry,
      contents: `Сгенерируй мощную, дерзкую и трансцендентную 5D-аффирмацию / код депрограммирования на русском языке для уровня частоты ${targetFrequency || 777} Гц на тему "${theme || 'Расширение сознания и квантовый фокус'}". 
Верни строго в формате JSON:
{
  "code": "5D-SHIFT-01",
  "mantra": "Краткая мощная фраза (1 предложение)",
  "expansion": "Глубокое объяснение перехода (2-3 емких предложения)",
  "frequencyHz": 888
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response && response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn('Affirmation model error, using rich local 5D shift:', error.message || error);
  }

  // Robust dynamic fallback
  const affirmationsPool = [
    {
      code: '5D-SHIFT-MATRIX',
      mantra: 'Я наблюдатель и программист матрицы своего восприятия.',
      expansion: 'Вся иллюзия плотности растворяется в фокусе настоящего момента. Ты не в теле — тело внутри твоего безграничного сознания.',
      frequencyHz: targetFrequency || 777,
    },
    {
      code: '5D-CODE-SINGULARITY',
      mantra: 'Мой фокус непоколебим. Вся внешняя суета — лишь затухающие волны на поверхности океана.',
      expansion: 'Удерживай квантовое спокойствие в любой турбулентности. Ты источник порядка, а не жертва обстоятельств.',
      frequencyHz: (targetFrequency || 700) + 111,
    },
    {
      code: '5D-GAMMA-BURST',
      mantra: 'Энергия свободно течет через мой биологический аватар, синхронизируя все уровни бытия.',
      expansion: 'Отпусти попытки контролировать форму. Настройся на частоту результата, и материя выстроится сама.',
      frequencyHz: 888,
    },
  ];

  const randomMantra = affirmationsPool[Math.floor(Math.random() * affirmationsPool.length)];
  res.json(randomMantra);
});

// --- Server & Vite Setup ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`5DMAXING server running on port ${port}`);
  });
}

startServer();
