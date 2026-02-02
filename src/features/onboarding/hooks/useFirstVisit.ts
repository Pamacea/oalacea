// useFirstVisit - Hook to detect first visit using localStorage
'use client';

import { useEffect, useState } from 'react';

const FIRST_VISIT_KEY = 'oalacea_first_visit';
const SESSION_VISIT_KEY = 'oalacea_session_visit';

export interface FirstVisitState {
  isFirstVisit: boolean;
  isFirstSession: boolean;
  markVisited: () => void;
  reset: () => void;
}

export function useFirstVisit(): FirstVisitState {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem(FIRST_VISIT_KEY);
  });
  const [isFirstSession, setIsFirstSession] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem(SESSION_VISIT_KEY);
  });

  useEffect(() => {
    // Mark session as visited
    const hasVisitedThisSession = sessionStorage.getItem(SESSION_VISIT_KEY);
    if (!hasVisitedThisSession) {
      sessionStorage.setItem(SESSION_VISIT_KEY, 'true');
    }
  }, []);

  const markVisited = () => {
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    setIsFirstVisit(false);
  };

  const reset = () => {
    localStorage.removeItem(FIRST_VISIT_KEY);
    sessionStorage.removeItem(SESSION_VISIT_KEY);
    setIsFirstVisit(true);
    setIsFirstSession(true);
  };

  return {
    isFirstVisit,
    isFirstSession,
    markVisited,
    reset,
  };
}
