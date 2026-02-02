'use client';

import { useEffect, useCallback } from 'react';
import { useAudioStore } from '@/features/3d-world/store';

export type SoundType = 'interaction' | 'hover' | 'worldSwitch' | 'click' | 'success' | 'error';

interface SoundConfig {
  volume: number;
  loop: boolean;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  interaction: { volume: 0.3, loop: false },
  hover: { volume: 0.15, loop: false },
  worldSwitch: { volume: 0.5, loop: false },
  click: { volume: 0.4, loop: false },
  success: { volume: 0.5, loop: false },
  error: { volume: 0.4, loop: false },
};

class SoundManagerClass {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private activeSounds: Set<string> = new Set();

  async preload(soundType: SoundType): Promise<void> {
    const cacheKey = soundType;
    if (this.audioCache.has(cacheKey)) return;

    const audio = new Audio(`/3d/audio/sfx/${soundType}.mp3`);
    audio.preload = 'auto';

    await new Promise<void>((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => resolve(), { once: true });
      audio.addEventListener('error', () => reject(), { once: true });
      setTimeout(() => resolve(), 1000);
    });

    this.audioCache.set(cacheKey, audio);
  }

  async preloadAll(): Promise<void> {
    const promises = Object.keys(SOUND_CONFIGS) as SoundType[];
    await Promise.allSettled(promises.map((sound) => this.preload(sound)));
  }

  play(soundType: SoundType, volumeMultiplier = 1): void {
    const store = useAudioStore.getState();
    if (!store.isEnabled || store.isPaused) return;

    const config = SOUND_CONFIGS[soundType];
    const finalVolume = config.volume * volumeMultiplier * store.masterVolume * store.sfxVolume;

    const playAudio = () => {
      const audio = new Audio(`/3d/audio/sfx/${soundType}.mp3`);
      audio.volume = Math.max(0, Math.min(1, finalVolume));
      audio.play().catch(() => {});

      const soundId = `${soundType}-${Date.now()}`;
      this.activeSounds.add(soundId);
      audio.addEventListener('ended', () => {
        this.activeSounds.delete(soundId);
      });
    };

    const cached = this.audioCache.get(soundType);
    if (cached) {
      const clone = cached.cloneNode() as HTMLAudioElement;
      clone.volume = Math.max(0, Math.min(1, finalVolume));
      clone.play().catch(() => {});

      const soundId = `${soundType}-${Date.now()}`;
      this.activeSounds.add(soundId);
      clone.addEventListener('ended', () => {
        this.activeSounds.delete(soundId);
      });
    } else {
      playAudio();
    }
  }

  stopAll(): void {
    this.activeSounds.forEach((soundId) => {
      this.activeSounds.delete(soundId);
    });
  }

  async crossfadeWorld(
    fromWorld: string,
    toWorld: string,
    duration: number
  ): Promise<void> {
    const store = useAudioStore.getState();
    if (store.isFading) return;

    store.setIsFading(true);
    this.play('worldSwitch', 0.8);

    await new Promise((resolve) => setTimeout(resolve, duration));
    store.setIsFading(false);
  }
}

const soundManager = new SoundManagerClass();

export function useSoundManager() {
  const { isEnabled, isPaused } = useAudioStore();

  useEffect(() => {
    if (isEnabled) {
      soundManager.preloadAll();
    }
  }, [isEnabled]);

  const play = useCallback(
    (soundType: SoundType, volumeMultiplier = 1) => {
      if (isEnabled && !isPaused) {
        soundManager.play(soundType, volumeMultiplier);
      }
    },
    [isEnabled, isPaused]
  );

  const playInteraction = useCallback(() => play('interaction'), [play]);
  const playHover = useCallback(() => play('hover'), [play]);
  const playClick = useCallback(() => play('click'), [play]);
  const playSuccess = useCallback(() => play('success'), [play]);
  const playError = useCallback(() => play('error'), [play]);

  const crossfadeWorld = useCallback(
    async (fromWorld: string, toWorld: string, duration = 2000) => {
      if (isEnabled) {
        await soundManager.crossfadeWorld(fromWorld, toWorld, duration);
      }
    },
    [isEnabled]
  );

  const stopAll = useCallback(() => {
    soundManager.stopAll();
  }, []);

  return {
    play,
    playInteraction,
    playHover,
    playClick,
    playSuccess,
    playError,
    crossfadeWorld,
    stopAll,
    isReady: true,
  };
}

export { soundManager };
