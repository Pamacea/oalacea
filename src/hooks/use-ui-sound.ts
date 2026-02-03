'use client';

import { useCallback, useRef, useEffect } from 'react';
import { useAudioStore } from '@/features/3d-world/store/3d-audio-store';

/**
 * UI Sound effects hook
 * Plays synthesized sounds for UI interactions
 * Uses Web Audio API to generate sounds without external files
 */

// Lazy audio context initialization
let audioContext: AudioContext | null = null;
let contextInitPromise: Promise<AudioContext> | null = null;

function getAudioContext(): Promise<AudioContext> {
  if (audioContext && audioContext.state !== 'closed') {
    // Resume if suspended (autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
    return Promise.resolve(audioContext);
  }

  if (contextInitPromise) {
    return contextInitPromise;
  }

  contextInitPromise = (async () => {
    const ctx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    audioContext = ctx;

    // Resume on first user gesture
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Ignore resume errors
      }
    }

    return ctx;
  })();

  return contextInitPromise;
}

type SoundType = 'hover' | 'click' | 'open' | 'close' | 'error' | 'success' | 'typing';

const soundConfigs: Record<SoundType, { frequency: number; duration: number; type: OscillatorType; modulate?: boolean }> = {
  hover: { frequency: 200, duration: 0.05, type: 'square' },
  click: { frequency: 400, duration: 0.08, type: 'square', modulate: true },
  open: { frequency: 150, duration: 0.15, type: 'sawtooth', modulate: true },
  close: { frequency: 100, duration: 0.12, type: 'sawtooth' },
  error: { frequency: 100, duration: 0.2, type: 'square', modulate: true },
  success: { frequency: 600, duration: 0.15, type: 'sine' },
  typing: { frequency: 800, duration: 0.02, type: 'square' },
};

export function useUISound() {
  const { sfxVolume, masterVolume, isEnabled, isPaused } = useAudioStore();
  const activeOscillatorsRef = useRef<Set<OscillatorNode>>(new Set());

  // Cleanup all oscillators on unmount
  useEffect(() => {
    const activeOscillators = activeOscillatorsRef.current;

    return () => {
      activeOscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Ignore errors during cleanup
        }
      });
      activeOscillators.clear();
    };
  }, []);

  const play = useCallback((type: SoundType) => {
    if (!isEnabled || isPaused) return;

    const config = soundConfigs[type];
    const volume = Math.max(0, Math.min(1, sfxVolume * masterVolume * 0.15));

    getAudioContext().then((ctx) => {
      if (ctx.state === 'closed') return;

      try {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

        if (config.modulate) {
          oscillator.frequency.exponentialRampToValueAtTime(
            config.frequency * 0.5,
            ctx.currentTime + config.duration
          );
        }

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

        // Track for cleanup
        activeOscillatorsRef.current.add(oscillator);

        // Cleanup after sound finishes
        const cleanup = () => {
          activeOscillatorsRef.current.delete(oscillator);
          try {
            oscillator.disconnect();
            gainNode.disconnect();
          } catch {
            // Ignore errors
          }
        };

        oscillator.onended = cleanup;

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + config.duration);
      } catch (err) {
        // Silently fail on audio errors
        if ((err as Error).name !== 'AbortError') {
          // Only log non-abort errors
        }
      }
    }).catch(() => {
      // Ignore context initialization errors
    });
  }, [sfxVolume, masterVolume, isEnabled, isPaused]);

  return {
    playHover: () => play('hover'),
    playClick: () => play('click'),
    playOpen: () => play('open'),
    playClose: () => play('close'),
    playError: () => play('error'),
    playSuccess: () => play('success'),
    playTyping: () => play('typing'),
  };
}

// Export cleanup function for manual cleanup
export function cleanupUISound(): void {
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close().catch(() => {});
  }
  audioContext = null;
  contextInitPromise = null;
}
