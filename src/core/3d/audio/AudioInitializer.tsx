'use client';

import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/features/3d-world/store/3d-audio-store';

interface AudioInitializerProps {
  enabled?: boolean;
  ambientDelay?: number;
  musicDelay?: number;
}

/**
 * AudioInitializer - Handles ambient SFX and music startup
 *
 * Flow:
 * 1. On user interaction, enable audio
 * 2. Start ambient SFX after short delay
 * 3. Start music fade-in after longer delay
 *
 * Usage: Add to the 3D scene or main app component
 */
export function AudioInitializer({
  enabled = true,
  ambientDelay = 500,
  musicDelay = 3000,
}: AudioInitializerProps) {
  const hasInitialized = useRef(false);
  const hasStartedMusic = useRef(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isInitializingRef = useRef(false);
  const eventListenersRef = useRef<{
    click?: () => void;
    keydown?: () => void;
    touchstart?: () => void;
  }>({});

  useEffect(() => {
    if (!enabled) return undefined;

    const initializeAudio = async () => {
      // Prevent race conditions - if already initializing, wait
      if (isInitializingRef.current) {
        return;
      }

      // Prevent multiple initializations
      if (hasInitialized.current) {
        return;
      }

      isInitializingRef.current = true;

      try {
        const store = useAudioStore.getState();

        // Check again inside the critical section
        if (store.isEnabled) {
          hasInitialized.current = true;
          return;
        }

        store.setEnabled(true);
        hasInitialized.current = true;

        // Start ambient SFX after short delay
        const ambientTimeout = setTimeout(() => {
          if (hasInitialized.current) {
            store.playAmbient().catch((err) => {
              if (err && err.name !== 'NotAllowedError') {
                console.warn('[AudioInitializer] Failed to play ambient:', err);
              }
            });
          }
        }, ambientDelay);
        timeoutsRef.current.push(ambientTimeout);

        // Start music fade-in after longer delay
        const musicTimeout = setTimeout(async () => {
          if (!hasStartedMusic.current && hasInitialized.current) {
            hasStartedMusic.current = true;
            await store.loadWorldTracks('dev');
          }
        }, musicDelay);
        timeoutsRef.current.push(musicTimeout);
      } finally {
        isInitializingRef.current = false;
      }
    };

    // Create stable handler functions
    const clickHandler = () => initializeAudio();
    const keyHandler = () => initializeAudio();
    const touchHandler = () => initializeAudio();

    // Store references for cleanup
    eventListenersRef.current = {
      click: clickHandler,
      keydown: keyHandler,
      touchstart: touchHandler,
    };

    // Set up user interaction handlers (once only)
    document.addEventListener('click', clickHandler, { once: true, passive: true });
    document.addEventListener('keydown', keyHandler, { once: true, passive: true });
    document.addEventListener('touchstart', touchHandler, { once: true, passive: true });

    // Also check if already enabled (hot reload case)
    if (useAudioStore.getState().isEnabled) {
      initializeAudio();
    }

    return () => {
      // Clear all timeouts
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];

      // Remove event listeners if they haven't fired yet
      const { click, keydown, touchstart } = eventListenersRef.current;
      if (click) document.removeEventListener('click', click);
      if (keydown) document.removeEventListener('keydown', keydown);
      if (touchstart) document.removeEventListener('touchstart', touchstart);

      // Reset refs
      hasInitialized.current = false;
      hasStartedMusic.current = false;
      isInitializingRef.current = false;
    };
  }, [enabled, ambientDelay, musicDelay]);

  return null;
}

/**
 * Hook to manually trigger audio initialization
 */
export function useAudioInitializer() {
  const isEnabled = useAudioStore((s) => s.isEnabled);
  const isInitializingRef = useRef(false);

  const initializeAudio = async () => {
    const store = useAudioStore.getState();
    if (isEnabled || isInitializingRef.current) return;

    isInitializingRef.current = true;
    try {
      store.setEnabled(true);
      await store.playAmbient();

      setTimeout(async () => {
        await store.loadWorldTracks('dev');
      }, 3000);
    } finally {
      isInitializingRef.current = false;
    }
  };

  return { initializeAudio, isEnabled };
}
