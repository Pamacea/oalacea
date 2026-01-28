// World store for 3D worlds
import { create } from 'zustand';
import type { WorldType, TransitionState, LoadingState } from '@/core/3d/scenes/types';

interface WorldState {
  currentWorld: WorldType;
  setCurrentWorld: (world: WorldType) => void;
  isTransitioning: boolean;
  transitionState: TransitionState | null;
  switchWorld: (world: WorldType) => Promise<void>;
  setTransitionState: (state: TransitionState | null) => void;
  loadingProgress: number;
  setLoadingProgress: (progress: number) => void;
  incrementProgress: (amount: number) => void;
  resetProgress: () => void;
  loadingState: LoadingState;
  setAssetLoading: (assetId: string) => void;
  setAssetLoaded: (assetId: string) => void;
  setAssetError: (assetId: string, error: Error) => void;
  isInitialLoadComplete: boolean;
  setInitialLoadComplete: () => void;
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  fps: number;
  setFps: (fps: number) => void;
  preloadedWorlds: Set<WorldType>;
  setWorldPreloaded: (world: WorldType) => void;
  isWorldPreloaded: (world: WorldType) => boolean;
}

export const useWorldStore = create<WorldState>((set, get) => ({
  currentWorld: 'dev',
  setCurrentWorld: (world) => set({ currentWorld: world }),

  isTransitioning: false,
  transitionState: null,

  switchWorld: async (world: WorldType) => {
    const state = get();
    if (state.isTransitioning || state.currentWorld === world) return;

    const fromWorld = state.currentWorld;
    set({
      isTransitioning: true,
      transitionState: { isActive: true, progress: 0, fromWorld, toWorld: world },
      loadingProgress: 0,
    });

    const loadingInterval = setInterval(() => {
      const currentProgress = get().loadingProgress;
      if (currentProgress >= 90) clearInterval(loadingInterval);
      else get().incrementProgress(10);
    }, 100);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    clearInterval(loadingInterval);

    // Reset character position to center when changing worlds
    // This avoids the player being stuck in a wall or obstacle
    // We need to access the character store but avoid circular dependency
    // The character will be repositioned via an event or by the scene
    set({
      currentWorld: world,
      isTransitioning: false,
      transitionState: null,
      loadingProgress: 100,
    });

    setTimeout(() => set({ loadingProgress: 0 }), 500);
  },

  setTransitionState: (state) => set({ transitionState: state }),

  loadingProgress: 0,
  setLoadingProgress: (progress) => set({ loadingProgress: Math.min(100, Math.max(0, progress)) }),
  incrementProgress: (amount) => set((state) => ({ loadingProgress: Math.min(100, state.loadingProgress + amount) })),
  resetProgress: () => set({ loadingProgress: 0 }),

  loadingState: { progress: 0, loading: new Set(), loaded: new Set(), errors: new Map() },

  setAssetLoading: (assetId) => set((state) => {
    const loading = new Set(state.loadingState.loading);
    loading.add(assetId);
    return { loadingState: { ...state.loadingState, loading } };
  }),

  setAssetLoaded: (assetId) => set((state) => {
    const loading = new Set(state.loadingState.loading);
    const loaded = new Set(state.loadingState.loaded);
    loading.delete(assetId);
    loaded.add(assetId);
    const progress = (loaded.size / (loaded.size + loading.size)) * 100;
    return { loadingState: { ...state.loadingState, loading, loaded }, loadingProgress: progress };
  }),

  setAssetError: (assetId, error) => set((state) => {
    const errors = new Map(state.loadingState.errors);
    errors.set(assetId, error);
    const loading = new Set(state.loadingState.loading);
    loading.delete(assetId);
    return { loadingState: { ...state.loadingState, loading, errors } };
  }),

  isInitialLoadComplete: false,
  setInitialLoadComplete: () => set({ isInitialLoadComplete: true }),

  performanceMode: false,
  setPerformanceMode: (enabled) => set({ performanceMode: enabled }),

  fps: 60,
  setFps: (fps) => {
    set({ fps });
    if (fps < 30 && !get().performanceMode) {
      console.warn('[WorldStore] Low FPS detected, enabling performance mode');
      get().setPerformanceMode(true);
    } else if (fps > 50 && get().performanceMode) {
      get().setPerformanceMode(false);
    }
  },

  preloadedWorlds: new Set<WorldType>(['dev']),
  setWorldPreloaded: (world) => set((state) => {
    const preloaded = new Set(state.preloadedWorlds);
    preloaded.add(world);
    return { preloadedWorlds: preloaded };
  }),
  isWorldPreloaded: (world) => get().preloadedWorlds.has(world),
}));

export const selectCurrentWorld = (state: WorldState) => state.currentWorld;
export const selectTransitionState = (state: WorldState) => ({
  isTransitioning: state.isTransitioning,
  transitionState: state.transitionState,
});
export const selectLoadingProgress = (state: WorldState) => state.loadingProgress;
export const selectPerformanceState = (state: WorldState) => ({
  performanceMode: state.performanceMode,
  fps: state.fps,
});
export const selectIsReady = (state: WorldState) => state.isInitialLoadComplete;
