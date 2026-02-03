// Audio store for 3D worlds
import { create } from 'zustand';
import type { WorldType } from '@/core/3d/scenes/types';
import { WORLD_AUDIO_CONFIGS, SFX_CONFIGS } from '@/config/3d/audio';
import { useWorldStore } from './3d-world-store';

// Helper to properly cleanup an audio element
function cleanupAudioElement(audio: HTMLAudioElement): void {
  audio.pause();
  audio.removeEventListener('ended', audio._onEndedHandler as EventListener);
  audio.src = '';
  audio.load();
}

// Extend HTMLAudioElement to store handler reference
declare global {
  interface HTMLAudioElement {
    _onEndedHandler?: (() => void) | null;
    _rafId?: number | null;
  }
}

interface AudioState {
  masterVolume: number;
  setMasterVolume: (volume: number) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  sfxVolume: number;
  setSfxVolume: (volume: number) => void;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  isPaused: boolean;
  setPaused: (paused: boolean) => void;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  loadedTracks: Map<string, HTMLAudioElement>;
  loadedWorlds: Set<WorldType>;
  loadWorldTracks: (world: WorldType) => Promise<void>;
  unloadWorldTracks: (world: WorldType) => void;
  playSfx: (soundName: string, volume?: number) => void;
  footstepPlaying: boolean;
  playFootstep: () => void;
  isFading: boolean;
  fadingFrom: WorldType | null;
  fadingTo: WorldType | null;
  setIsFading: (fading: boolean, from?: WorldType | null, to?: WorldType | null) => void;
  crossfadeWorlds: (fromWorld: WorldType, toWorld: WorldType, duration: number) => Promise<void>;
  currentWorld: WorldType | null;
  setCurrentWorld: (world: WorldType) => void;
  scheduleNextTrack: () => void;
  cancelScheduledTrack: () => void;
  // Ambient SFX
  ambientSfx: HTMLAudioElement | null;
  playAmbient: () => Promise<void>;
  stopAmbient: () => void;
  // UI SFX actions
  playDoorOpen: () => void;
  playDoorClose: () => void;
  playNotification: () => void;
  playNotificationDelete: () => void;
  // Cleanup
  cleanup: () => void;
}

// Store active RAF IDs for cleanup
const activeRafIds = new Set<number>();

// Store scheduled timeout for next track
let nextTrackTimeoutId: ReturnType<typeof setTimeout> | null = null;

// Random delay between tracks (in ms): between 30s and 120s
function getRandomDelay(): number {
  return 30000 + Math.random() * 90000;
}

// Safe requestAnimationFrame that tracks IDs
function safeRaf(callback: FrameRequestCallback): number {
  const id = requestAnimationFrame(callback);
  activeRafIds.add(id);
  return id;
}

// Safe cancelAnimationFrame that removes from tracking
function safeCancelRaf(id: number): void {
  activeRafIds.delete(id);
  cancelAnimationFrame(id);
}

// Cancel all active RAF IDs
function cancelAllActiveRafs(): void {
  activeRafIds.forEach((id) => cancelAnimationFrame(id));
  activeRafIds.clear();
}

export const useAudioStore = create<AudioState>((set, get) => ({
  masterVolume: 0.7,
  setMasterVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ masterVolume: clamped });
    const { loadedTracks, musicVolume } = get();
    loadedTracks.forEach((audio) => {
      audio.volume = clamped * musicVolume;
    });
  },

  musicVolume: 0.6,
  setMusicVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ musicVolume: clamped });
    const { loadedTracks, masterVolume } = get();
    loadedTracks.forEach((audio) => {
      audio.volume = masterVolume * clamped;
    });
  },

  sfxVolume: 0.8,
  setSfxVolume: (volume) => {
    set({ sfxVolume: Math.max(0, Math.min(1, volume)) });
  },

  isEnabled: false,
  setEnabled: (enabled) => {
    set({ isEnabled: enabled });
    const { loadedTracks } = get();
    if (enabled) {
      loadedTracks.forEach((audio) => audio.play().catch((err) => {
        // Log only significant errors, not autoplay blocking
        if (err.name !== 'NotAllowedError') {
          console.warn('[Audio] Failed to play:', err);
        }
      }));
    } else {
      get().cancelScheduledTrack();
      loadedTracks.forEach((audio) => audio.pause());
    }
  },

  isPaused: false,
  setPaused: (paused) => {
    set({ isPaused: paused });
    const { loadedTracks, isEnabled } = get();
    if (!isEnabled) return;
    if (paused) {
      get().cancelScheduledTrack();
      loadedTracks.forEach((audio) => audio.pause());
    } else {
      loadedTracks.forEach((audio) => audio.play().catch((err) => {
        if (err.name !== 'NotAllowedError') {
          console.warn('[Audio] Failed to resume:', err);
        }
      }));
    }
  },

  isMuted: false,
  setMuted: (muted) => {
    set({ isMuted: muted });
    const { loadedTracks } = get();
    loadedTracks.forEach((audio) => {
      audio.muted = muted;
    });
  },

  loadedTracks: new Map(),
  loadedWorlds: new Set<WorldType>(),
  currentWorld: null,
  setCurrentWorld: (world: WorldType) => set({ currentWorld: world }),

  scheduleNextTrack: () => {
    const { isEnabled, isPaused } = get();
    if (!isEnabled || isPaused) return;

    get().cancelScheduledTrack();

    const delay = getRandomDelay();
    nextTrackTimeoutId = setTimeout(() => {
      const state = get();
      if (!state.isEnabled || state.isPaused || !state.currentWorld) return;

      const { loadedTracks } = get();
      const trackKey = `${state.currentWorld}-/3d/audio/music/acidic.mp3?v=2`;
      const audio = loadedTracks.get(trackKey);

      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((err) => {
          if (err.name !== 'NotAllowedError') {
            console.warn('[Audio] Failed to play next track:', err);
          }
        });
      }

      get().scheduleNextTrack();
    }, delay);
  },

  cancelScheduledTrack: () => {
    if (nextTrackTimeoutId) {
      clearTimeout(nextTrackTimeoutId);
      nextTrackTimeoutId = null;
    }
  },

  loadWorldTracks: async (world: WorldType) => {
    const { loadedTracks, loadedWorlds, masterVolume, musicVolume, isEnabled } = get();

    get().setCurrentWorld(world);

    const isFirstLoad = !loadedWorlds.has(world);
    const config = WORLD_AUDIO_CONFIGS[world];
    const FADE_IN_DURATION = 3000;

    for (const track of config) {
      const trackKey = `${world}-${track.path}`;
      const existing = loadedTracks.get(trackKey);

      if (existing) {
        if (isEnabled && existing.paused) {
          existing.play().catch(() => {});
        }
        continue;
      }

      const audio = new Audio(track.path);
      audio.volume = 0;
      audio.loop = false;
      audio.preload = 'auto';

      const handleEnded = () => {
        get().scheduleNextTrack();
      };

      audio._onEndedHandler = handleEnded;
      audio.addEventListener('ended', handleEnded);

      await new Promise<void>((resolve) => {
        if (audio.readyState >= 4) {
          resolve();
          return;
        }

        const timeoutId = setTimeout(() => resolve(), 10000);

        const cleanup = () => {
          clearTimeout(timeoutId);
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
        };

        const onCanPlay = () => {
          cleanup();
          resolve();
        };
        const onError = (e: Event) => {
          console.warn('[Audio] Failed to load track:', track.path, e);
          cleanup();
          resolve();
        };

        audio.addEventListener('canplaythrough', onCanPlay, { once: true });
        audio.addEventListener('error', onError, { once: true });
      });

      loadedTracks.set(trackKey, audio);
      const targetVolume = track.volume * masterVolume * musicVolume;

      if (isEnabled) {
        audio.play().catch((err) => {
          if (err.name !== 'NotAllowedError') {
            console.warn('[Audio] Failed to play track:', trackKey, err);
          }
        });

        const fadeInStart = Date.now();
        const fadeIn = () => {
          if (audio.paused) {
            audio._rafId = undefined;
            return;
          }
          const elapsed = Date.now() - fadeInStart;
          const progress = Math.min(elapsed / FADE_IN_DURATION, 1);
          audio.volume = progress * targetVolume;
          if (progress < 1 && !audio.paused) {
            audio._rafId = safeRaf(fadeIn);
          } else {
            audio._rafId = undefined;
          }
        };
        audio._rafId = safeRaf(fadeIn);
      }
    }

    loadedWorlds.add(world);
    set({ loadedTracks: new Map(loadedTracks), loadedWorlds: new Set(loadedWorlds) });

    if (isEnabled && isFirstLoad) {
      get().scheduleNextTrack();
    }
  },

  unloadWorldTracks: (world: WorldType) => {
    const { loadedTracks, loadedWorlds } = get();
    const toRemove: string[] = [];

    loadedTracks.forEach((audio, key) => {
      if (key.startsWith(world)) {
        // Cancel any pending RAF for this audio
        if (audio._rafId) {
          safeCancelRaf(audio._rafId);
          audio._rafId = undefined;
        }
        cleanupAudioElement(audio);
        toRemove.push(key);
      }
    });

    toRemove.forEach((key) => loadedTracks.delete(key));
    loadedWorlds.delete(world);

    set({ loadedTracks: new Map(loadedTracks), loadedWorlds: new Set(loadedWorlds) });
  },

  playSfx: (soundName: string, volume = 1) => {
    const { sfxVolume, masterVolume, isEnabled, isPaused } = get();
    if (!isEnabled || isPaused) return;

    const sfxConfig = (SFX_CONFIGS as Record<string, { volume: number; path: string; loop?: boolean }>)[soundName];
    if (!sfxConfig) {
      console.warn('[Audio] SFX not found:', soundName);
      return;
    }

    const audio = new Audio(sfxConfig.path);
    audio.volume = Math.max(0, Math.min(1, volume * sfxConfig.volume * sfxVolume * masterVolume));
    if (sfxConfig.loop) audio.loop = true;

    audio.play().catch((err) => {
      if (err.name !== 'NotAllowedError') {
        console.warn('[Audio] Failed to play SFX:', soundName, err);
      }
    });

    // Auto-cleanup after playback for non-looping sounds
    if (!sfxConfig.loop) {
      audio.addEventListener('ended', () => {
        cleanupAudioElement(audio);
      }, { once: true });
    }
  },

  footstepPlaying: false,
  playFootstep: () => {
    const { footstepPlaying, sfxVolume, masterVolume, isEnabled, isPaused } = get();
    if (!isEnabled || isPaused || footstepPlaying) return;

    set({ footstepPlaying: true });
    const audio = new Audio('/3d/audio/sfx/footstep.mp3');
    audio.volume = Math.max(0, Math.min(1, 0.3 * sfxVolume * masterVolume));

    const cleanup = () => {
      set({ footstepPlaying: false });
      cleanupAudioElement(audio);
    };

    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('error', cleanup, { once: true });

    audio.play().catch(() => cleanup());
  },

  isFading: false,
  fadingFrom: null,
  fadingTo: null,
  setIsFading: (fading, from = null, to = null) => set({ isFading: fading, fadingFrom: from, fadingTo: to }),

  ambientSfx: null,
  playAmbient: async () => {
    const { ambientSfx, sfxVolume, masterVolume, isEnabled } = get();
    if (ambientSfx) return;
    if (!isEnabled) return;

    const audio = new Audio(SFX_CONFIGS.ambient.path);
    audio.loop = true;
    audio.volume = Math.max(0, Math.min(1, SFX_CONFIGS.ambient.volume * sfxVolume * masterVolume));

    await new Promise<void>((resolve, reject) => {
      const onCanPlay = () => {
        audio.removeEventListener('canplaythrough', onCanPlay);
        audio.removeEventListener('error', onError);
        clearTimeout(timeoutId);
        resolve();
      };
      const onError = () => {
        audio.removeEventListener('canplaythrough', onCanPlay);
        audio.removeEventListener('error', onError);
        clearTimeout(timeoutId);
        reject(new Error('Failed to load ambient audio'));
      };
      const timeoutId = setTimeout(() => {
        audio.removeEventListener('canplaythrough', onCanPlay);
        audio.removeEventListener('error', onError);
        resolve(); // Resolve anyway after timeout
      }, 2000);

      audio.addEventListener('canplaythrough', onCanPlay, { once: true });
      audio.addEventListener('error', onError, { once: true });
    });

    audio.play().catch((err) => {
      if (err.name !== 'NotAllowedError') {
        console.warn('[Audio] Failed to play ambient:', err);
      }
    });
    set({ ambientSfx: audio });
  },

  stopAmbient: () => {
    const { ambientSfx } = get();
    if (ambientSfx) {
      cleanupAudioElement(ambientSfx);
      set({ ambientSfx: null });
    }
  },

  playDoorOpen: () => {
    const { sfxVolume, masterVolume, isEnabled, isPaused } = get();
    if (!isEnabled || isPaused) return;

    const audio = new Audio(SFX_CONFIGS.doorOpen.path);
    audio.volume = Math.max(0, Math.min(1, SFX_CONFIGS.doorOpen.volume * sfxVolume * masterVolume));

    audio.addEventListener('ended', () => cleanupAudioElement(audio), { once: true });
    audio.play().catch(() => cleanupAudioElement(audio));
  },

  playDoorClose: () => {
    const { sfxVolume, masterVolume, isEnabled, isPaused } = get();
    if (!isEnabled || isPaused) return;

    const audio = new Audio(SFX_CONFIGS.doorClose.path);
    audio.volume = Math.max(0, Math.min(1, SFX_CONFIGS.doorClose.volume * sfxVolume * masterVolume));

    audio.addEventListener('ended', () => cleanupAudioElement(audio), { once: true });
    audio.play().catch(() => cleanupAudioElement(audio));
  },

  playNotification: () => {
    const { sfxVolume, masterVolume, isEnabled, isPaused } = get();
    if (!isEnabled || isPaused) return;

    const audio = new Audio(SFX_CONFIGS.notification.path);
    audio.volume = Math.max(0, Math.min(1, SFX_CONFIGS.notification.volume * sfxVolume * masterVolume));

    audio.addEventListener('ended', () => cleanupAudioElement(audio), { once: true });
    audio.play().catch(() => cleanupAudioElement(audio));
  },

  playNotificationDelete: () => {
    const { sfxVolume, masterVolume, isEnabled, isPaused } = get();
    if (!isEnabled || isPaused) return;

    const audio = new Audio(SFX_CONFIGS.notificationDelete.path);
    audio.volume = Math.max(0, Math.min(1, SFX_CONFIGS.notificationDelete.volume * sfxVolume * masterVolume));

    audio.addEventListener('ended', () => cleanupAudioElement(audio), { once: true });
    audio.play().catch(() => cleanupAudioElement(audio));
  },

  crossfadeWorlds: async (fromWorld: WorldType, toWorld: WorldType, duration: number) => {
    const { isFading, fadingFrom, fadingTo } = get();

    // Check if already fading in same direction
    if (isFading && fadingFrom === fromWorld && fadingTo === toWorld) {
      return;
    }

    set({ isFading: true, fadingFrom: fromWorld, fadingTo: toWorld });
    const { loadedTracks, masterVolume } = get();

    // Get from tracks
    const fromTracks: Array<{ audio: HTMLAudioElement; initialVolume: number }> = [];
    loadedTracks.forEach((audio, key) => {
      if (key.startsWith(fromWorld)) {
        fromTracks.push({ audio, initialVolume: audio.volume });
      }
    });

    // Cancel any pending RAF on from tracks
    fromTracks.forEach(({ audio }) => {
      if (audio._rafId) {
        safeCancelRaf(audio._rafId);
        audio._rafId = undefined;
      }
    });

    // Start fade out
    const fadeOutStartTime = Date.now();
    const fadeOutPromises = fromTracks.map(({ audio, initialVolume }) => {
      return new Promise<void>((resolve) => {
        const fadeOut = () => {
          const elapsed = Date.now() - fadeOutStartTime;
          const progress = Math.min(elapsed / duration, 1);
          audio.volume = (1 - progress) * initialVolume;

          if (progress < 1) {
            audio._rafId = safeRaf(fadeOut);
          } else {
            audio.pause();
            audio.currentTime = 0;
            audio._rafId = undefined;
            resolve();
          }
        };
        audio._rafId = safeRaf(fadeOut);
      });
    });

    // Wait for fade out to complete halfway
    await new Promise(resolve => setTimeout(resolve, duration / 2));

    // Load new world tracks
    await get().loadWorldTracks(toWorld);

    // Wait for fade out completion
    await Promise.all(fadeOutPromises);

    // Get fresh loadedTracks after loading
    const toTracks: HTMLAudioElement[] = [];
    get().loadedTracks.forEach((audio, key) => {
      if (key.startsWith(toWorld)) {
        toTracks.push(audio);
      }
    });

    const targetVolume = masterVolume * 0.6; // musicVolume
    const fadeInStartTime = Date.now();
    const fadeInPromises = toTracks.map((audio) => {
      return new Promise<void>((resolve) => {
        audio.play().catch(() => {
          resolve();
        });

        const fadeIn = () => {
          const elapsed = Date.now() - fadeInStartTime;
          const progress = Math.min(elapsed / duration, 1);
          audio.volume = progress * targetVolume;

          if (progress < 1) {
            audio._rafId = safeRaf(fadeIn);
          } else {
            audio._rafId = undefined;
            resolve();
          }
        };
        audio._rafId = safeRaf(fadeIn);
      });
    });

    await Promise.all(fadeInPromises);
    set({ isFading: false, fadingFrom: null, fadingTo: null });
  },

  cleanup: () => {
    const { loadedTracks, ambientSfx } = get();

    cancelAllActiveRafs();
    get().cancelScheduledTrack();

    loadedTracks.forEach((audio) => {
      if (audio._rafId) {
        safeCancelRaf(audio._rafId);
        audio._rafId = undefined;
      }
      cleanupAudioElement(audio);
    });

    if (ambientSfx) {
      cleanupAudioElement(ambientSfx);
    }

    set({
      loadedTracks: new Map(),
      loadedWorlds: new Set(),
      ambientSfx: null,
      currentWorld: null,
    });
  },
}));

// Hook to sync audio store with world store
import { useEffect, useRef } from 'react';

export function useAudioWorldSync() {
  const currentWorld = useWorldStore((state) => state.currentWorld);
  const isTransitioning = useWorldStore((state) => state.isTransitioning);

  const crossfadeWorlds = useAudioStore((state) => state.crossfadeWorlds);
  const isEnabled = useAudioStore((state) => state.isEnabled);

  const previousWorldRef = useRef(currentWorld);
  const crossfadeInProgressRef = useRef(false);

  useEffect(() => {
    if (!isEnabled) return;

    const previousWorld = previousWorldRef.current;

    // Only crossfade if world actually changed and not already crossfading
    if (previousWorld !== currentWorld && !isTransitioning && !crossfadeInProgressRef.current) {
      crossfadeInProgressRef.current = true;
      crossfadeWorlds(previousWorld, currentWorld, 2000).finally(() => {
        previousWorldRef.current = currentWorld;
        crossfadeInProgressRef.current = false;
      });
    }
  }, [currentWorld, crossfadeWorlds, isEnabled, isTransitioning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAllActiveRafs();
    };
  }, []);
}

export const selectVolumes = (state: AudioState) => ({
  master: state.masterVolume,
  music: state.musicVolume,
  sfx: state.sfxVolume,
});

export const selectPlaybackState = (state: AudioState) => ({
  enabled: state.isEnabled,
  paused: state.isPaused,
});
