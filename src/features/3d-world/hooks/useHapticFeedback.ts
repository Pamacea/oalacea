'use client';

import { useCallback, useRef } from 'react';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'notification';

interface HapticFeedbackOptions {
  enabled?: boolean;
  intensity?: number;
}

const HAPTIC_PATTERNS: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10],
  error: [30, 50, 30],
  notification: [15, 30, 15, 30],
};

export function useHapticFeedback(options: HapticFeedbackOptions = {}) {
  const { enabled = true, intensity = 1 } = options;
  const isVibratingRef = useRef(false);

  const isSupported = useCallback(() => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }, []);

  const trigger = useCallback(
    (pattern: HapticPattern, customIntensity?: number) => {
      if (!enabled || !isSupported() || isVibratingRef.current) return;

      const vibrationPattern = HAPTIC_PATTERNS[pattern] || HAPTIC_PATTERNS.light;
      const scaledPattern = vibrationPattern.map((duration) => duration * (customIntensity || intensity));

      isVibratingRef.current = true;

      const success = navigator.vibrate(scaledPattern);

      if (!success) {
        isVibratingRef.current = false;
        return;
      }

      setTimeout(() => {
        isVibratingRef.current = false;
      }, scaledPattern.reduce((sum, duration) => sum + duration, 0));
    },
    [enabled, intensity, isSupported]
  );

  const triggerLight = useCallback(() => trigger('light'), [trigger]);
  const triggerMedium = useCallback(() => trigger('medium'), [trigger]);
  const triggerHeavy = useCallback(() => trigger('heavy'), [trigger]);
  const triggerSuccess = useCallback(() => trigger('success'), [trigger]);
  const triggerError = useCallback(() => trigger('error'), [trigger]);
  const triggerNotification = useCallback(() => trigger('notification'), [trigger]);

  const triggerCustom = useCallback(
    (pattern: number[]) => {
      if (!enabled || !isSupported()) return;
      navigator.vibrate(pattern.map((d) => d * intensity));
    },
    [enabled, intensity, isSupported]
  );

  const stop = useCallback(() => {
    if (isSupported()) {
      navigator.vibrate(0);
      isVibratingRef.current = false;
    }
  }, [isSupported]);

  return {
    trigger,
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerError,
    triggerNotification,
    triggerCustom,
    stop,
    isSupported: isSupported(),
  };
}

export type UseHapticFeedbackReturn = ReturnType<typeof useHapticFeedback>;
