'use client';

import { useState, useCallback } from 'react';

const listeners: Set<(active: boolean) => void> = new Set();

export const setJoystickActive = (active: boolean) => {
  listeners.forEach((listener) => listener(active));
};

export function useJoystickActive() {
  const [isActive, setIsActive] = useState(false);

  useState(() => {
    listeners.add(setIsActive);
    return () => {
      listeners.delete(setIsActive);
    };
  });

  return isActive;
}
