'use client';

import { useCallback } from 'react';
import { useAudioStore } from '@/features/3d-world/store/3d-audio-store';

/**
 * UI Sound effects hook
 * Plays synthesized sounds for UI interactions
 * Uses Web Audio API to generate sounds without external files
 */

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

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

  const play = useCallback((type: SoundType) => {
    if (!isEnabled || isPaused || !audioContext) return;

    const config = soundConfigs[type];
    const volume = (sfxVolume * masterVolume * 0.15).toFixed(3);

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime);

    if (config.modulate) {
      oscillator.frequency.exponentialRampToValueAtTime(
        config.frequency * 0.5,
        audioContext.currentTime + config.duration
      );
    }

    gainNode.gain.setValueAtTime(parseFloat(volume), audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + config.duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + config.duration);
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
