// Privacy-first analytics library
// GDPR compliant - no personal data without consent

type EventType =
  | 'pageView'
  | 'projectView'
  | 'blogRead'
  | 'interaction3D'
  | 'worldSwitch'
  | 'contactSubmit'
  | 'newsletterSignup'
  | 'embedView';

interface AnalyticsEvent {
  type: EventType;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

interface UTMParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

interface SessionData {
  sessionId: string;
  startTime: number;
  pageViews: number;
  events: AnalyticsEvent[];
  referrer: string | null;
  utm: UTMParameters;
}

const STORAGE_KEY = 'analytics_consent';
const SESSION_KEY = 'analytics_session';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

class AnalyticsClient {
  private consent: boolean = false;
  private session: SessionData | null = null;
  private queue: AnalyticsEvent[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadConsent();
      this.initSession();
    }
  }

  private loadConsent(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    this.consent = stored === 'granted';
  }

  setConsent(granted: boolean): void {
    this.consent = granted;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied');
      if (granted) {
        this.flushQueue();
      } else {
        this.clearSession();
      }
    }
  }

  hasConsent(): boolean {
    return this.consent;
  }

  private initSession(): void {
    if (!this.consent) return;

    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SessionData;
        const now = Date.now();
        if (now - parsed.startTime < SESSION_DURATION) {
          this.session = parsed;
          this.isInitialized = true;
          return;
        }
      } catch {
        // Invalid session data, create new one
      }
    }

    this.createSession();
  }

  private createSession(): void {
    const sessionId = crypto.randomUUID();
    this.session = {
      sessionId,
      startTime: Date.now(),
      pageViews: 0,
      events: [],
      referrer: document.referrer || null,
      utm: this.getUTMParameters(),
    };
    this.saveSession();
    this.isInitialized = true;
  }

  private getUTMParameters(): UTMParameters {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined,
    };
  }

  private saveSession(): void {
    if (!this.session) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
  }

  private clearSession(): void {
    this.session = null;
    sessionStorage.removeItem(SESSION_KEY);
  }

  getSessionId(): string | null {
    return this.session?.sessionId ?? null;
  }

  getSessionData(): SessionData | null {
    return this.session;
  }

  track(event: AnalyticsEvent): void {
    const eventWithTimestamp: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    if (!this.consent) {
      this.queue.push(eventWithTimestamp);
      return;
    }

    if (!this.session) {
      this.initSession();
    }

    if (this.session) {
      this.session.events.push(eventWithTimestamp);
      if (event.type === 'pageView') {
        this.session.pageViews++;
      }
      this.saveSession();
    }

    // Send to server
    this.sendToServer(eventWithTimestamp);
  }

  private async sendToServer(event: AnalyticsEvent): Promise<void> {
    if (!this.session) return;

    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          sessionId: this.session.sessionId,
          referrer: this.session.referrer,
          utm: this.session.utm,
        }),
      });
    } catch {
      // Silently fail - analytics shouldn't break the app
    }
  }

  private flushQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.track(event);
      }
    }
  }

  // Public tracking methods
  pageView(path: string, title?: string): void {
    this.track({
      type: 'pageView',
      properties: { path, title },
    });
  }

  projectView(slug: string, title: string): void {
    this.track({
      type: 'projectView',
      properties: { slug, title },
    });
  }

  blogRead(slug: string, title: string, readingTime?: number): void {
    this.track({
      type: 'blogRead',
      properties: { slug, title, readingTime },
    });
  }

  interaction3D(
    interactionType: string,
    worldType: 'dev' | 'art',
    position?: { x: number; z: number }
  ): void {
    this.track({
      type: 'interaction3D',
      properties: {
        interactionType,
        worldType,
        position,
      },
    });
  }

  worldSwitch(from: 'dev' | 'art', to: 'dev' | 'art'): void {
    this.track({
      type: 'worldSwitch',
      properties: { from, to },
    });
  }

  contactFormSubmit(): void {
    this.track({
      type: 'contactSubmit',
      properties: {},
    });
  }

  newsletterSignup(): void {
    this.track({
      type: 'newsletterSignup',
      properties: {},
    });
  }
}

// Singleton instance
let analyticsInstance: AnalyticsClient | null = null;

export function getAnalytics(): AnalyticsClient {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsClient();
  }
  return analyticsInstance;
}

// Export for convenience
export const analytics = getAnalytics();

// Types
export type { AnalyticsEvent, SessionData, UTMParameters };

// =========================================
// SERVER-SIDE TRACKING
// =========================================

interface ServerAnalyticsEvent {
  type: EventType;
  properties?: Record<string, unknown>;
  sessionId?: string;
  referrer?: string | null;
  utm?: UTMParameters;
}

export async function trackAnalyticsEvent(event: ServerAnalyticsEvent): Promise<void> {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.error('Failed to track analytics event:', error);
  }
}
