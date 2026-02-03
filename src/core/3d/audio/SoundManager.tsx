'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAudioStore } from '@/features/3d-world/store';
import { SFX_CONFIGS } from '@/config/3d/audio';

export type SoundType = 'interaction' | 'hover' | 'worldSwitch' | 'click' | 'success' | 'error' | 'doorOpen' | 'doorClose' | 'notification' | 'notificationDelete' | 'ambient';

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
  doorOpen: { volume: 0.5, loop: false },
  doorClose: { volume: 0.5, loop: false },
  notification: { volume: 0.4, loop: false },
  notificationDelete: { volume: 0.4, loop: false },
  ambient: { volume: 0.3, loop: true },
};

// Audio pool for reusing audio elements
class AudioPool {
  private pool: Map<string, HTMLAudioElement[]> = new Map();
  private maxPoolSize = 3;
  private activeElements: Set<HTMLAudioElement> = new Set();

  get(path: string): HTMLAudioElement | null {
    const pool = this.pool.get(path);
    if (pool && pool.length > 0) {
      const audio = pool.pop()!;
      this.activeElements.add(audio);
      return audio;
    }
    return null;
  }

  release(path: string, audio: HTMLAudioElement): void {
    this.activeElements.delete(audio);

    // Reset audio state
    audio.pause();
    audio.currentTime = 0;

    // Add back to pool if under limit
    const pool = this.pool.get(path) || [];
    if (pool.length < this.maxPoolSize) {
      pool.push(audio);
      this.pool.set(path, pool);
    } else {
      // Properly cleanup if pool is full
      this.cleanupAudio(audio);
    }
  }

  private cleanupAudio(audio: HTMLAudioElement): void {
    audio.pause();
    audio.src = '';
    audio.load();
  }

  cleanup(): void {
    // Clean up all pooled elements
    this.pool.forEach((audios) => {
      audios.forEach((audio) => this.cleanupAudio(audio));
    });
    this.pool.clear();

    // Clean up active elements
    this.activeElements.forEach((audio) => this.cleanupAudio(audio));
    this.activeElements.clear();
  }
}

class SoundManagerClass {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private audioPool = new AudioPool();
  private activeSounds: Map<string, HTMLAudioElement> = new Map();

  async preload(soundType: SoundType): Promise<void> {
    const cacheKey = soundType;
    if (this.audioCache.has(cacheKey)) return;

    const sfxConfig = (SFX_CONFIGS as Record<string, { volume: number; path: string; loop?: boolean }>)[soundType];
    if (!sfxConfig) {
      console.warn('[SoundManager] SFX not found:', soundType);
      return;
    }

    const path = sfxConfig.path;
    const audio = new Audio(path);
    audio.preload = 'auto';

    try {
      await new Promise<void>((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          clearTimeout(timeoutId);
          resolve();
        };
        const onError = (e: Event) => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          clearTimeout(timeoutId);
          console.warn('[SoundManager] Failed to preload:', soundType, e);
          reject(e);
        };
        const timeoutId = setTimeout(() => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve(); // Resolve anyway after timeout
        }, 3000);

        audio.addEventListener('canplaythrough', onCanPlay, { once: true });
        audio.addEventListener('error', onError, { once: true });
      });

      this.audioCache.set(cacheKey, audio);
    } catch {
      // Don't cache failed loads
      audio.remove();
    }
  }

  async preloadAll(): Promise<void> {
    const promises = Object.keys(SOUND_CONFIGS) as SoundType[];
    await Promise.allSettled(promises.map((sound) => this.preload(sound)));
  }

  play(soundType: SoundType, volumeMultiplier = 1): void {
    const store = useAudioStore.getState();
    if (!store.isEnabled || store.isPaused) return;

    const config = SOUND_CONFIGS[soundType];
    const sfxConfig = (SFX_CONFIGS as Record<string, { volume: number; path: string; loop?: boolean }>)[soundType];

    if (!sfxConfig) {
      console.warn('[SoundManager] SFX not found:', soundType);
      return;
    }

    const path = sfxConfig.path;
    const finalVolume = Math.max(0, Math.min(1, config.volume * volumeMultiplier * store.masterVolume * store.sfxVolume));

    // Try to get from pool first
    const pooled = this.audioPool.get(path);
    if (pooled) {
      this.playAudio(pooled, soundType, path, finalVolume, config.loop, true);
      return;
    }

    // Try to use cached audio for cloning
    const cached = this.audioCache.get(soundType);
    if (cached) {
      const clone = cached.cloneNode() as HTMLAudioElement;
      this.playAudio(clone, soundType, path, finalVolume, config.loop, false);
      return;
    }

    // Create new audio element
    const audio = new Audio(path);
    this.playAudio(audio, soundType, path, finalVolume, config.loop, false);
  }

  private playAudio(
    audio: HTMLAudioElement,
    soundType: SoundType,
    path: string,
    volume: number,
    loop: boolean,
    fromPool: boolean
  ): void {
    const soundId = `${soundType}-${Date.now()}-${Math.random()}`;

    audio.volume = volume;
    audio.loop = loop;

    // Create cleanup handler
    const cleanup = () => {
      this.activeSounds.delete(soundId);
      audio.removeEventListener('ended', cleanup);
      audio.removeEventListener('error', cleanup);

      if (!loop) {
        if (fromPool) {
          this.audioPool.release(path, audio);
        } else {
          audio.pause();
          audio.src = '';
          audio.load();
        }
      }
    };

    audio.addEventListener('ended', cleanup);
    audio.addEventListener('error', cleanup);

    this.activeSounds.set(soundId, audio);

    audio.play().catch((err) => {
      cleanup();
      if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
        console.warn('[SoundManager] Failed to play:', soundType, err);
      }
    });
  }

  stop(soundType: SoundType): void {
    // Stop all sounds of this type
    const toStop: string[] = [];
    this.activeSounds.forEach((audio, id) => {
      if (id.startsWith(soundType)) {
        audio.pause();
        audio.currentTime = 0;
        toStop.push(id);
      }
    });
    toStop.forEach((id) => this.activeSounds.delete(id));
  }

  stopAll(): void {
    this.activeSounds.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.activeSounds.clear();
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

  cleanup(): void {
    this.stopAll();
    this.audioCache.forEach((audio) => {
      audio.pause();
      audio.src = '';
      audio.load();
    });
    this.audioCache.clear();
    this.audioPool.cleanup();
  }
}

const soundManager = new SoundManagerClass();

export function useSoundManager() {
  const { isEnabled, isPaused } = useAudioStore();
  const cleanupRef = useRef(false);

  useEffect(() => {
    if (isEnabled) {
      soundManager.preloadAll();
    }

    return () => {
      if (cleanupRef.current) {
        soundManager.cleanup();
      }
    };
  }, [isEnabled]);

  const play = useCallback(
    (soundType: SoundType, volumeMultiplier = 1) => {
      if (isEnabled && !isPaused) {
        soundManager.play(soundType, volumeMultiplier);
      }
    },
    [isEnabled, isPaused]
  );

  const stop = useCallback(
    (soundType: SoundType) => {
      soundManager.stop(soundType);
    },
    []
  );

  const playInteraction = useCallback(() => play('interaction'), [play]);
  const playHover = useCallback(() => play('hover'), [play]);
  const playClick = useCallback(() => play('click'), [play]);
  const playSuccess = useCallback(() => play('success'), [play]);
  const playError = useCallback(() => play('error'), [play]);
  const playDoorOpen = useCallback(() => play('doorOpen'), [play]);
  const playDoorClose = useCallback(() => play('doorClose'), [play]);
  const playNotification = useCallback(() => play('notification'), [play]);
  const playNotificationDelete = useCallback(() => play('notificationDelete'), [play]);
  const playAmbient = useCallback(() => play('ambient'), [play]);

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

  const cleanup = useCallback(() => {
    cleanupRef.current = true;
    soundManager.cleanup();
  }, []);

  return {
    play,
    stop,
    playInteraction,
    playHover,
    playClick,
    playSuccess,
    playError,
    playDoorOpen,
    playDoorClose,
    playNotification,
    playNotificationDelete,
    playAmbient,
    crossfadeWorld,
    stopAll,
    cleanup,
    isReady: true,
  };
}

export { SoundManagerClass, soundManager };
