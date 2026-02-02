// Audio store for 3D worlds
import { create } from 'zustand';
import type { WorldType } from '@/core/3d/scenes/types';
import { WORLD_AUDIO_CONFIGS } from '@/config/3d/audio';
import { useWorldStore } from './3d-world-store';

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
  loadWorldTracks: (world: WorldType) => Promise<void>;
  unloadWorldTracks: (world: WorldType) => void;
  playSfx: (soundName: string, volume?: number) => void;
  footstepPlaying: boolean;
  playFootstep: () => void;
  isFading: boolean;
  setIsFading: (fading: boolean) => void;
  crossfadeWorlds: (fromWorld: WorldType, toWorld: WorldType, duration: number) => Promise<void>;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  masterVolume: 0.7,
  setMasterVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ masterVolume: clamped });
    get().loadedTracks.forEach((audio) => {
      audio.volume = clamped * get().musicVolume;
    });
  },

  musicVolume: 0.6,
  setMusicVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ musicVolume: clamped });
    get().loadedTracks.forEach((audio) => {
      audio.volume = get().masterVolume * clamped;
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
      loadedTracks.forEach((audio) => audio.play().catch(() => {}));
    } else {
      loadedTracks.forEach((audio) => audio.pause());
    }
  },

  isPaused: false,
  setPaused: (paused) => {
    set({ isPaused: paused });
    const { loadedTracks, isEnabled } = get();
    if (!isEnabled) return;
    if (paused) {
      loadedTracks.forEach((audio) => audio.pause());
    } else {
      loadedTracks.forEach((audio) => audio.play().catch(() => {}));
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

  loadWorldTracks: async (world: WorldType) => {
    const config = WORLD_AUDIO_CONFIGS[world];
    const { loadedTracks, masterVolume, musicVolume } = get();
    get().unloadWorldTracks(world);

    for (const track of config) {
      const audio = new Audio(track.path);
      audio.volume = track.volume * masterVolume * musicVolume;
      audio.loop = track.loop;
      audio.preload = 'auto';

      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
      });

      loadedTracks.set(`${world}-${track.path}`, audio);
      if (get().isEnabled) audio.play().catch(() => {});
    }

    set({ loadedTracks: new Map(loadedTracks) });
  },

  unloadWorldTracks: (world: WorldType) => {
    const { loadedTracks } = get();
    const toRemove: string[] = [];
    loadedTracks.forEach((audio, key) => {
      if (key.startsWith(world)) {
        audio.pause();
        audio.src = '';
        toRemove.push(key);
      }
    });
    toRemove.forEach((key) => loadedTracks.delete(key));
    set({ loadedTracks: new Map(loadedTracks) });
  },

  playSfx: (soundName: string, volume = 1) => {
    const { sfxVolume, masterVolume, isEnabled, isPaused } = get();
    if (!isEnabled || isPaused) return;
    const audio = new Audio(`/3d/audio/sfx/${soundName}.mp3`);
    audio.volume = volume * sfxVolume * masterVolume;
    audio.play().catch(() => {});
  },

  footstepPlaying: false,
  playFootstep: () => {
    const { footstepPlaying, sfxVolume, masterVolume, isEnabled, isPaused } = get();
    if (!isEnabled || isPaused || footstepPlaying) return;
    set({ footstepPlaying: true });
    const audio = new Audio('/3d/audio/sfx/footstep.mp3');
    audio.volume = 0.3 * sfxVolume * masterVolume;
    audio.addEventListener('ended', () => set({ footstepPlaying: false }));
    audio.play().catch(() => set({ footstepPlaying: false }));
  },

  isFading: false,
  setIsFading: (fading) => set({ isFading: fading }),

  crossfadeWorlds: async (fromWorld: WorldType, toWorld: WorldType, duration: number) => {
    if (get().isFading) return;
    set({ isFading: true });
    const { loadedTracks } = get();

    const fromTracks: HTMLAudioElement[] = [];
    loadedTracks.forEach((audio, key) => {
      if (key.startsWith(fromWorld)) fromTracks.push(audio);
    });

    const startTime = Date.now();
    const fadeOut = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const volume = (1 - progress) * get().masterVolume;
      fromTracks.forEach((audio) => { audio.volume = volume; });
      if (progress < 1) {
        requestAnimationFrame(fadeOut);
      } else {
        fromTracks.forEach((audio) => {
          audio.pause();
          audio.currentTime = 0;
        });
      }
    };
    fadeOut();
    await get().loadWorldTracks(toWorld);

    const toTracks: HTMLAudioElement[] = [];
    loadedTracks.forEach((audio, key) => {
      if (key.startsWith(toWorld)) toTracks.push(audio);
    });

    const fadeInStart = Date.now();
    const fadeIn = () => {
      const elapsed = Date.now() - fadeInStart;
      const progress = Math.min(elapsed / duration, 1);
      const volume = progress * get().masterVolume;
      toTracks.forEach((audio) => { audio.volume = volume; });
      if (progress < 1) {
        requestAnimationFrame(fadeIn);
      } else {
        set({ isFading: false });
      }
    };
    fadeIn();
  },
}));

// Hook to sync audio store with world store
import { useEffect, useRef } from 'react';

export function useAudioWorldSync() {
  const currentWorld = useWorldStore((state) => state.currentWorld);
  const isTransitioning = useWorldStore((state) => state.isTransitioning);

  const crossfadeWorlds = useAudioStore((state) => state.crossfadeWorlds);
  const isEnabled = useAudioStore((state) => state.isEnabled);

  // Sync audio world with world store
  // Note: This hook must be called unconditionally per rules of hooks
  // The isEnabled check inside the effect handles the conditional behavior
  const previousWorldRef = useRef(currentWorld);

  useEffect(() => {
    if (!isEnabled) return;

    const previousWorld = previousWorldRef.current;
    if (previousWorld !== currentWorld && !isTransitioning) {
      crossfadeWorlds(previousWorld, currentWorld, 2000);
      previousWorldRef.current = currentWorld;
    }
  }, [currentWorld, crossfadeWorlds, isEnabled, isTransitioning]);
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
