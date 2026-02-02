// Hook to detect and manage reduced motion preference
'use client';

import { useEffect, useState } from 'react';

interface ReducedMotionState {
  prefersReducedMotion: boolean;
  isReducedMotionEnabled: boolean;
  toggleReducedMotion: () => void;
  setReducedMotion: (enabled: boolean) => void;
}

const STORAGE_KEY = 'oalacea-reduced-motion';

const getInitialManualOverride = (): boolean | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'true') return true;
  if (stored === 'false') return false;
  return null;
};

export function useReducedMotion(): ReducedMotionState {
  const [systemPrefersReduced, setSystemPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [manualOverride, setManualOverride] = useState<boolean | null>(getInitialManualOverride);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersReduced(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const isReducedMotionEnabled = manualOverride ?? systemPrefersReduced;

  const toggleReducedMotion = () => {
    const newValue = !isReducedMotionEnabled;
    setManualOverride(newValue);
    localStorage.setItem(STORAGE_KEY, String(newValue));
  };

  const setReducedMotion = (enabled: boolean) => {
    setManualOverride(enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
  };

  return {
    prefersReducedMotion: systemPrefersReduced,
    isReducedMotionEnabled,
    toggleReducedMotion,
    setReducedMotion,
  };
}

export default useReducedMotion;
