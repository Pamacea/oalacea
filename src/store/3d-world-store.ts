// src/store/3d-world-store.ts
// Store Zustand pour l'état des mondes 3D

import { create } from 'zustand';
import type { WorldType, TransitionState, LoadingState } from '@/core/3d/scenes/types';

// ============================================================================
// WORLD STATE
// ============================================================================

interface WorldState {
  // Current World
  /** Monde actuellement actif */
  currentWorld: WorldType;
  /** Changer de monde */
  setCurrentWorld: (world: WorldType) => void;

  // World Transition
  /** Une transition est-elle en cours ? */
  isTransitioning: boolean;
  /** État de la transition */
  transitionState: TransitionState | null;
  /** Initier un changement de monde */
  switchWorld: (world: WorldType) => Promise<void>;
  /** Définir l'état de transition */
  setTransitionState: (state: TransitionState | null) => void;

  // Loading State
  /** Progression de chargement (0-100) */
  loadingProgress: number;
  /** Définir la progression */
  setLoadingProgress: (progress: number) => void;
  /** Incrémenter la progression */
  incrementProgress: (amount: number) => void;
  /** Reset la progression */
  resetProgress: () => void;

  /** État de chargement détaillé */
  loadingState: LoadingState;
  /** Marquer un asset comme en cours de chargement */
  setAssetLoading: (assetId: string) => void;
  /** Marquer un asset comme chargé */
  setAssetLoaded: (assetId: string) => void;
  /** Marquer un asset en erreur */
  setAssetError: (assetId: string, error: Error) => void;

  // Initial Load
  /** Le monde initial est-il chargé ? */
  isInitialLoadComplete: boolean;
  /** Marquer le chargement initial comme complet */
  setInitialLoadComplete: () => void;

  // Performance
  /** Mode performance activé (réduit la qualité) */
  performanceMode: boolean;
  /** Activer/désactiver le mode performance */
  setPerformanceMode: (enabled: boolean) => void;

  /** FPS actuel (mis à jour par le Canvas) */
  fps: number;
  /** Mettre à jour le FPS */
  setFps: (fps: number) => void;

  // Preloading
  /** Monds préchargés (cache) */
  preloadedWorlds: Set<WorldType>;
  /** Marquer un monde comme préchargé */
  setWorldPreloaded: (world: WorldType) => void;
  /** Vérifier si un monde est préchargé */
  isWorldPreloaded: (world: WorldType) => boolean;
}

// ============================================================================
// STORE CREATION
// ============================================================================

export const useWorldStore = create<WorldState>((set, get) => ({
  // Current World
  currentWorld: 'dev',
  setCurrentWorld: (world) => set({ currentWorld: world }),

  // World Transition
  isTransitioning: false,
  transitionState: null,

  switchWorld: async (world: WorldType) => {
    const state = get();

    // Ne rien faire si déjà en transition ou même monde
    if (state.isTransitioning || state.currentWorld === world) {
      return;
    }

    const fromWorld = state.currentWorld;

    // Commencer la transition
    set({
      isTransitioning: true,
      transitionState: {
        isActive: true,
        progress: 0,
        fromWorld,
        toWorld: world,
      },
      loadingProgress: 0,
    });

    // Simuler le chargement (en production, tracker le vrai chargement)
    const loadingInterval = setInterval(() => {
      const currentProgress = get().loadingProgress;
      if (currentProgress >= 90) {
        clearInterval(loadingInterval);
      } else {
        get().incrementProgress(10);
      }
    }, 100);

    // Simuler un délai de transition
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Finaliser la transition
    clearInterval(loadingInterval);
    set({
      currentWorld: world,
      isTransitioning: false,
      transitionState: null,
      loadingProgress: 100,
    });

    // Reset le progress après un court délai
    setTimeout(() => {
      set({ loadingProgress: 0 });
    }, 500);
  },

  setTransitionState: (state) => set({ transitionState: state }),

  // Loading State
  loadingProgress: 0,
  setLoadingProgress: (progress) => set({ loadingProgress: Math.min(100, Math.max(0, progress)) }),

  incrementProgress: (amount) =>
    set((state) => ({
      loadingProgress: Math.min(100, state.loadingProgress + amount),
    })),

  resetProgress: () => set({ loadingProgress: 0 }),

  loadingState: {
    progress: 0,
    loading: new Set(),
    loaded: new Set(),
    errors: new Map(),
  },

  setAssetLoading: (assetId) =>
    set((state) => {
      const loading = new Set(state.loadingState.loading);
      loading.add(assetId);
      return {
        loadingState: { ...state.loadingState, loading },
      };
    }),

  setAssetLoaded: (assetId) =>
    set((state) => {
      const loading = new Set(state.loadingState.loading);
      const loaded = new Set(state.loadingState.loaded);
      loading.delete(assetId);
      loaded.add(assetId);

      const progress = (loaded.size / (loaded.size + loading.size)) * 100;

      return {
        loadingState: { ...state.loadingState, loading, loaded },
        loadingProgress: progress,
      };
    }),

  setAssetError: (assetId, error) =>
    set((state) => {
      const errors = new Map(state.loadingState.errors);
      errors.set(assetId, error);
      const loading = new Set(state.loadingState.loading);
      loading.delete(assetId);

      return {
        loadingState: { ...state.loadingState, loading, errors },
      };
    }),

  // Initial Load
  isInitialLoadComplete: false,
  setInitialLoadComplete: () => set({ isInitialLoadComplete: true }),

  // Performance
  performanceMode: false,
  setPerformanceMode: (enabled) => set({ performanceMode: enabled }),

  fps: 60,
  setFps: (fps) => {
    set({ fps });

    // Auto-enable performance mode si FPS bas
    if (fps < 30 && !get().performanceMode) {
      console.warn('[WorldStore] Low FPS detected, enabling performance mode');
      get().setPerformanceMode(true);
    } else if (fps > 50 && get().performanceMode) {
      get().setPerformanceMode(false);
    }
  },

  // Preloading
  preloadedWorlds: new Set<WorldType>(['dev']), // Dev world préchargé par défaut

  setWorldPreloaded: (world) =>
    set((state) => {
      const preloaded = new Set(state.preloadedWorlds);
      preloaded.add(world);
      return { preloadedWorlds: preloaded };
    }),

  isWorldPreloaded: (world) => get().preloadedWorlds.has(world),
}));

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Sélecteur pour le monde actuel
 */
export const selectCurrentWorld = (state: WorldState) => state.currentWorld;

/**
 * Sélecteur pour l'état de transition
 */
export const selectTransitionState = (state: WorldState) => ({
  isTransitioning: state.isTransitioning,
  transitionState: state.transitionState,
});

/**
 * Sélecteur pour la progression de chargement
 */
export const selectLoadingProgress = (state: WorldState) => state.loadingProgress;

/**
 * Sélecteur pour l'état de performance
 */
export const selectPerformanceState = (state: WorldState) => ({
  performanceMode: state.performanceMode,
  fps: state.fps,
});

/**
 * Sélecteur pour vérifier si le chargement initial est complet
 */
export const selectIsReady = (state: WorldState) => state.isInitialLoadComplete;

// ============================================================================
// ACTIONS (composables pour une utilisation plus facile)
// ============================================================================

/**
 * Hook pour changer de monde avec transition
 */
export const useSwitchWorld = () => {
  const switchWorld = useWorldStore((s) => s.switchWorld);
  const isTransitioning = useWorldStore((s) => s.isTransitioning);

  return {
    switchWorld,
    isTransitioning,
  };
};

/**
 * Hook pour suivre le chargement
 */
export const useLoadingProgress = () => {
  const progress = useWorldStore((s) => s.loadingProgress);
  const isComplete = useWorldStore((s) => s.isInitialLoadComplete);

  return {
    progress,
    isComplete,
    isLoading: !isComplete || progress < 100,
  };
};
