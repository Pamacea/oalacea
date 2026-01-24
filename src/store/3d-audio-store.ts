// src/store/3d-audio-store.ts
// Store Zustand pour l'audio des mondes 3D

import { create } from 'zustand';
import type { WorldType, AudioTrack } from '@/core/3d/scenes/types';

// ============================================================================
// AUDIO CONFIG
// ============================================================================

/**
 * Configuration audio pour chaque monde
 */
const WORLD_AUDIO_CONFIGS: Record<WorldType, AudioTrack[]> = {
  dev: [
    {
      path: '/3d/audio/dev-ambient.mp3',
      type: 'ambient',
      volume: 0.4,
      loop: true,
    },
    {
      path: '/3d/audio/dev-machinery.mp3',
      type: 'ambient',
      volume: 0.2,
      loop: true,
    },
  ],
  art: [
    {
      path: '/3d/audio/art-ambient.mp3',
      type: 'music',
      volume: 0.3,
      loop: true,
    },
    {
      path: '/3d/audio/art-beats.mp3',
      type: 'music',
      volume: 0.25,
      loop: true,
    },
  ],
};

// ============================================================================
// AUDIO STATE
// ============================================================================

interface AudioState {
  // Volume Control
  /** Volume principal (0-1) */
  masterVolume: number;
  /** Définir le volume principal */
  setMasterVolume: (volume: number) => void;

  /** Volume de la musique (0-1) */
  musicVolume: number;
  /** Définir le volume de la musique */
  setMusicVolume: (volume: number) => void;

  /** Volume des SFX (0-1) */
  sfxVolume: number;
  /** Définir le volume des SFX */
  setSfxVolume: (volume: number) => void;

  // Playback State
  /** L'audio est-il activé ? (user gesture required) */
  isEnabled: boolean;
  /** Activer/désactiver l'audio */
  setEnabled: (enabled: boolean) => void;

  /** L'audio est-il en pause ? */
  isPaused: boolean;
  /** Mettre en pause/reprendre l'audio */
  setPaused: (paused: boolean) => void;

  // Current World Audio
  /** Monde actuel pour l'audio */
  currentWorld: WorldType;
  /** Changer l'audio du monde */
  setCurrentWorld: (world: WorldType) => void;

  /** Pistes actuellement chargées */
  loadedTracks: Map<string, HTMLAudioElement>;
  /** Charger les pistes d'un monde */
  loadWorldTracks: (world: WorldType) => Promise<void>;
  /** Décharger les pistes d'un monde */
  unloadWorldTracks: (world: WorldType) => void;

  // Sound Effects
  /** Jouer un SFX */
  playSfx: (soundName: string, volume?: number) => void;

  /** Sons de pas actuellement actifs */
  footstepPlaying: boolean;
  /** Jouer un son de pas */
  playFootstep: () => void;

  // Fade Control
  /** Fade en cours */
  isFading: boolean;
  /** Crossfade entre deux mondes */
  crossfadeWorlds: (fromWorld: WorldType, toWorld: WorldType, duration: number) => Promise<void>;
}

// ============================================================================
// STORE CREATION
// ============================================================================

export const useAudioStore = create<AudioState>((set, get) => ({
  // Volume Control
  masterVolume: 0.7,
  setMasterVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ masterVolume: clamped });

    // Appliquer le volume à toutes les pistes chargées
    get().loadedTracks.forEach((audio) => {
      audio.volume = clamped * get().masterVolume;
    });
  },

  musicVolume: 0.6,
  setMusicVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ musicVolume: clamped });
  },

  sfxVolume: 0.8,
  setSfxVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ sfxVolume: clamped });
  },

  // Playback State
  isEnabled: false,
  setEnabled: (enabled) => {
    set({ isEnabled: enabled });

    const { loadedTracks } = get();
    if (enabled) {
      loadedTracks.forEach((audio) => {
        audio.play().catch(() => {
          // Ignore les erreurs de play (peut être bloqué par le navigateur)
        });
      });
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
      loadedTracks.forEach((audio) => {
        audio.play().catch(() => {});
      });
    }
  },

  // Current World Audio
  currentWorld: 'dev',
  setCurrentWorld: (world) => set({ currentWorld: world }),

  loadedTracks: new Map(),

  loadWorldTracks: async (world: WorldType) => {
    const config = WORLD_AUDIO_CONFIGS[world];
    const { loadedTracks, masterVolume, musicVolume } = get();

    // Nettoyer les anciennes pistes du même monde
    get().unloadWorldTracks(world);

    for (const track of config) {
      const audio = new Audio(track.path);
      audio.volume = track.volume * masterVolume * musicVolume;
      audio.loop = track.loop;
      audio.preload = 'auto';

      // Attendre que l'audio soit prêt
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
      });

      loadedTracks.set(`${world}-${track.path}`, audio);

      // Jouer si l'audio est activé
      if (get().isEnabled) {
        audio.play().catch(() => {});
      }
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

  // Sound Effects
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

    audio.addEventListener('ended', () => {
      set({ footstepPlaying: false });
    });

    audio.play().catch(() => {
      set({ footstepPlaying: false });
    });
  },

  // Fade Control
  isFading: false,

  crossfadeWorlds: async (
    fromWorld: WorldType,
    toWorld: WorldType,
    duration: number
  ) => {
    if (get().isFading) return;

    set({ isFading: true });

    const { loadedTracks } = get();

    // Fade out les pistes du monde source
    const fromTracks: HTMLAudioElement[] = [];
    loadedTracks.forEach((audio, key) => {
      if (key.startsWith(fromWorld)) {
        fromTracks.push(audio);
      }
    });

    // Fade in progressivement
    const startTime = Date.now();
    const fadeOut = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const volume = (1 - progress) * get().masterVolume;

      fromTracks.forEach((audio) => {
        audio.volume = volume;
      });

      if (progress < 1) {
        requestAnimationFrame(fadeOut);
      } else {
        // Pause les pistes après le fade out
        fromTracks.forEach((audio) => {
          audio.pause();
          audio.currentTime = 0;
        });
      }
    };

    fadeOut();

    // Charger et jouer les nouvelles pistes
    await get().loadWorldTracks(toWorld);

    const toTracks: HTMLAudioElement[] = [];
    loadedTracks.forEach((audio, key) => {
      if (key.startsWith(toWorld)) {
        toTracks.push(audio);
      }
    });

    // Fade in
    const fadeInStart = Date.now();
    const fadeIn = () => {
      const elapsed = Date.now() - fadeInStart;
      const progress = Math.min(elapsed / duration, 1);
      const volume = progress * get().masterVolume;

      toTracks.forEach((audio) => {
        audio.volume = volume;
      });

      if (progress < 1) {
        requestAnimationFrame(fadeIn);
      } else {
        set({ isFading: false });
      }
    };

    fadeIn();
  },
}));

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Sélecteur pour les volumes
 */
export const selectVolumes = (state: AudioState) => ({
  master: state.masterVolume,
  music: state.musicVolume,
  sfx: state.sfxVolume,
});

/**
 * Sélecteur pour l'état de lecture
 */
export const selectPlaybackState = (state: AudioState) => ({
  enabled: state.isEnabled,
  paused: state.isPaused,
});

/**
 * Sélecteur pour le monde audio actuel
 */
export const selectAudioWorld = (state: AudioState) => state.currentWorld;

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook pour contrôler le volume principal
 */
export const useMasterVolume = () => {
  const volume = useAudioStore((s) => s.masterVolume);
  const setVolume = useAudioStore((s) => s.setMasterVolume);
  const isEnabled = useAudioStore((s) => s.isEnabled);

  return {
    volume,
    setVolume,
    isEnabled,
    toggle: () => {
      useAudioStore.getState().setEnabled(!isEnabled);
    },
  };
};

/**
 * Hook pour initialiser l'audio (requiert un geste utilisateur)
 */
export const useInitAudio = () => {
  const isEnabled = useAudioStore((s) => s.isEnabled);
  const currentWorld = useAudioStore((s) => s.currentWorld);

  const init = async () => {
    if (isEnabled) return;

    await useAudioStore.getState().loadWorldTracks(currentWorld);
    useAudioStore.getState().setEnabled(true);
  };

  return {
    isInit: isEnabled,
    init,
  };
};
