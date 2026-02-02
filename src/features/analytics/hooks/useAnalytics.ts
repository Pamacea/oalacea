// React hook for analytics
'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { analytics, type AnalyticsEvent, type SessionData } from '@/lib/analytics';

interface UseAnalyticsOptions {
  disablePageView?: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { disablePageView = false } = options;
  const hasTrackedPageView = useRef(false);

  useEffect(() => {
    if (!disablePageView && !hasTrackedPageView.current && typeof window !== 'undefined') {
      hasTrackedPageView.current = true;
      analytics.pageView(window.location.pathname, document.title);
    }
  }, [disablePageView]);

  // Track page view
  const trackPageView = useCallback((path: string, title?: string) => {
    analytics.pageView(path, title);
  }, []);

  // Track project view
  const trackProjectView = useCallback((slug: string, title: string) => {
    analytics.projectView(slug, title);
  }, []);

  // Track blog read
  const trackBlogRead = useCallback((slug: string, title: string, readingTime?: number) => {
    analytics.blogRead(slug, title, readingTime);
  }, []);

  // Track 3D interaction
  const track3DInteraction = useCallback((
    interactionType: string,
    worldType: 'dev' | 'art',
    position?: { x: number; z: number }
  ) => {
    analytics.interaction3D(interactionType, worldType, position);
  }, []);

  // Track world switch
  const trackWorldSwitch = useCallback((from: 'dev' | 'art', to: 'dev' | 'art') => {
    analytics.worldSwitch(from, to);
  }, []);

  // Track contact form submit
  const trackContactSubmit = useCallback(() => {
    analytics.contactFormSubmit();
  }, []);

  // Track newsletter signup
  const trackNewsletterSignup = useCallback(() => {
    analytics.newsletterSignup();
  }, []);

  // Track custom event
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    analytics.track(event);
  }, []);

  // Consent management
  const setConsent = useCallback((granted: boolean) => {
    analytics.setConsent(granted);
  }, []);

  const hasConsent = useCallback(() => {
    return analytics.hasConsent();
  }, []);

  const getSessionId = useCallback(() => {
    return analytics.getSessionId();
  }, []);

  const getSessionData = useCallback((): SessionData | null => {
    return analytics.getSessionData();
  }, []);

  return {
    trackPageView,
    trackProjectView,
    trackBlogRead,
    track3DInteraction,
    trackWorldSwitch,
    trackContactSubmit,
    trackNewsletterSignup,
    trackEvent,
    setConsent,
    hasConsent,
    getSessionId,
    getSessionData,
  };
}

// Hook for tracking scroll depth on articles
export function useScrollTracking(articleId: string, enabled = true) {
  const { trackEvent } = useAnalytics();
  const thresholdsRef = useRef(new Set<number>());
  const [maxDepth, setMaxDepth] = useState(0);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
      const depth = Math.floor(scrollPercent / 10) * 10; // 0, 10, 20, ... 100

      if (depth > maxDepth) {
        setMaxDepth(depth);
      }

      // Track at 25%, 50%, 75%, 100%
      [25, 50, 75, 100].forEach((threshold) => {
        if (scrollPercent >= threshold && !thresholdsRef.current.has(threshold)) {
          thresholdsRef.current.add(threshold);
          trackEvent({
            type: 'blogRead',
            properties: {
              slug: articleId,
              scrollDepth: threshold,
              maxDepth: depth,
            },
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [articleId, enabled, trackEvent, maxDepth]);

  return maxDepth;
}

// Hook for tracking time spent on page
export function useTimeTracking(enabled = true) {
  const [startTime, setStartTime] = useState<number>(() => Date.now());
  const isActiveRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
      } else {
        isActiveRef.current = true;
        setStartTime(Date.now());
      }
    };

    const handleBeforeUnload = () => {
      const timeSpent = Date.now() - startTime;
      if (timeSpent > 1000) { // Only track if spent more than 1 second
        navigator.sendBeacon('/api/analytics/time', JSON.stringify({
          duration: timeSpent,
          path: window.location.pathname,
        }));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, startTime]);

  const getTimeSpent = useCallback(() => {
    return Date.now() - startTime;
  }, [startTime]);

  return { getTimeSpent };
}
