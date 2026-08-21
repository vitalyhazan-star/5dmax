import { PROTOCOLS } from '../data/protocols';
import { UserProfile, Protocol, SessionRecord } from '../types';
import { ARCHETYPE_PROFILES } from '../config/productConfig';

export interface DailyRecommendation {
  protocol: Protocol;
  todaysActionTitle: string;
  todaysActionDesc: string;
  targetStateShift: string;
  questKey: string;
}

// День года (стабилен внутри суток) — чтобы "квест дня" менялся каждый день.
export function getDayIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return diff || 1;
}

// Сериализованный ключ сегодняшнего дня.
export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const TARGET_SHIFT_BY_CATEGORY: Record<string, string> = {
  deepwork: 'Глубокое созидание без отвлечений',
  reset: 'Ясность после информационного тумана',
  courage: 'Хладнокровие перед некомфортным шагом',
  money: 'Уверенность при озвучивании цены',
  abundance: 'Мышление из полноты ресурсов',
  confidence: 'Устойчивость к чужому мнению',
  creation: 'Смелые нестандартные решения',
  night: 'Глубокое восстановление',
  decision: 'Ясный выбор без паралича анализа',
  identity: 'Действие из высшей версии себя',
};

/**
 * Квест дня и рекомендация зависят от профиля, истории и даты,
 * а не от статичной константы.
 */
export function buildDailyRecommendation(
  profile: UserProfile,
  lastSession?: SessionRecord,
): DailyRecommendation {
  const pool = PROTOCOLS;

  // 1. Предпочтение от архетипа (из квиза/диагностики).
  let preferredId: string | null = null;
  if (profile.abundanceArchetype) {
    preferredId = ARCHETYPE_PROFILES[profile.abundanceArchetype]?.recommendedProtocolId || null;
  }
  if (profile.activeStateArchetype) {
    const map: Record<string, string> = {
      OVERTHINKER: 'proto-decision',
      SCATTERED_CREATOR: 'proto-deepwork',
      LOW_ACTION: 'proto-courage',
      UNDERVALUED: 'proto-money',
      SURVIVAL_MODE: 'proto-reset',
      HESITANT_BUILDER: 'proto-identity',
    };
    preferredId = map[profile.activeStateArchetype] || preferredId;
  }

  // 2. Ротация по дню года — гарантирует «другой экран» на следующий день.
  const dayIndex = getDayIndex();

  let selected: Protocol;
  if (preferredId) {
    selected = pool.find((p) => p.id === preferredId) || pool[dayIndex % pool.length];
  } else {
    selected = pool[dayIndex % pool.length];
  }

  // 3. Отклик на результат последней практики: если частота упала — рекомендуем сброс/фокус.
  if (lastSession) {
    const wantsReset = lastSession.endFreqHz < 400 && lastSession.freqDelta < 120;
    if (wantsReset && selected.id !== 'proto-reset') {
      const reset = pool.find((p) => p.id === 'proto-reset');
      if (reset) selected = reset;
    } else if (selected.id === lastSession.protocolId) {
      // Не повторяем вчерашний протокол.
      const alternatives = pool.filter((p) => p.id !== selected.id);
      selected = alternatives[dayIndex % alternatives.length];
    }
  }

  const action = selected.realWorldAction;
  const targetStateShift = TARGET_SHIFT_BY_CATEGORY[selected.category as string] || 'Настройка состояния';

  return {
    protocol: selected,
    todaysActionTitle: action.title,
    todaysActionDesc: action.description,
    targetStateShift,
    questKey: `${todayKey()}::${selected.id}`,
  };
}

/**
 * Подсчёт серии дней подряд на основе истории сессий.
 */
export function computeStreakFromSessions(sessions: SessionRecord[]): number {
  if (!sessions.length) return 0;
  const days = new Set<string>();
  sessions.forEach((s) => {
    const d = new Date(s.timestamp);
    days.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  });
  const sorted = [...days].sort();
  let streak = 0;
  const cursor = new Date();
  // начинаем с сегодня, разрешаем "вчера" как старт
  for (let offset = 0; offset <= sorted.length; offset++) {
    const d = new Date(cursor);
    d.setDate(cursor.getDate() - offset);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (days.has(key)) streak++;
    else if (offset === 0) continue; // сегодня ещё не было — ожидаем вчера
    else break;
  }
  return streak;
}