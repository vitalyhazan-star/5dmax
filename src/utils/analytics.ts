// Lightweight extensible analytics dispatcher for 5DMAXING

export type AnalyticsEventName =
  | 'onboarding_started'
  | 'onboarding_step_completed'
  | 'onboarding_completed'
  | 'first_protocol_started'
  | 'first_protocol_completed'
  | 'first_path_started'
  | 'protocol_started'
  | 'protocol_completed'
  | 'daily_quest_completed'
  | 'oracle_opened'
  | 'oracle_message_sent'
  | 'paywall_opened'
  | 'paywall_viewed'
  | 'checkout_started'
  | 'purchase_completed'
  | 'payment_redirect'
  | 'paywall_closed'
  | 'downsell_shown'
  | 'downsell_accepted'
  | 'downsell_declined'
  | 'reality_action_completed'
  | 'reality_log_added'
  | 'action_logged'
  | 'weekly_review_opened'
  | 'weekly_review_completed'
  | 'weekly_focus_saved'
  | 'streak_7'
  | 'streak_30'
  | 'larp_mission_started'
  | 'abundance_pillar_viewed';

interface AnalyticsPayload {
  [key: string]: any;
}

class AnalyticsTracker {
  private isDev = true;
  private logHistory: Array<{ event: AnalyticsEventName; payload?: AnalyticsPayload; timestamp: number }> = [];

  constructor() {
    try {
      const saved = localStorage.getItem('5dmaxing_analytics_events');
      if (saved) {
        this.logHistory = JSON.parse(saved).slice(-50);
      }
    } catch {
      // ignore
    }
  }

  public track(event: AnalyticsEventName, payload?: AnalyticsPayload) {
    const record = {
      event,
      payload,
      timestamp: Date.now(),
    };

    this.logHistory.push(record);
    if (this.logHistory.length > 100) {
      this.logHistory = this.logHistory.slice(-100);
    }

    try {
      localStorage.setItem('5dmaxing_analytics_events', JSON.stringify(this.logHistory));
    } catch {
      // ignore
    }

    if (this.isDev) {
      console.log(`[5D_ANALYTICS] 📊 Event: %c${event}`, 'color: #c084fc; font-weight: bold;', payload || '');
    }

    // Future extension: Send to backend / PostHog / Mixpanel / Google Analytics
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({ event, ...payload });
    }
  }

  public getHistory() {
    return [...this.logHistory];
  }
}

export const analytics = new AnalyticsTracker();
