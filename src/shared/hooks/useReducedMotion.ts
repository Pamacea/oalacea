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

export function useReducedMotion(): ReducedMotionState {
  const [systemPrefersReduced, setSystemPrefersReduced] = useState(false);
  const [manualOverride, setManualOverride] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemPrefersReduced(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersReduced(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setManualOverride(stored === 'true' ? true : stored === 'false' ? false : null);
    }
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
