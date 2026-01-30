// Progression store - Feature discovery and progressive unlocking
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DiscoveredFeature {
  id: string;
  name: string;
  description: string;
  discoveredAt: number;
  category: 'navigation' | 'interaction' | 'world' | 'system';
}

export interface FeatureUnlock {
  featureId: string;
  requiredActions: string[];
  unlocked: boolean;
  unlockedAt?: number;
}

interface ProgressionState {
  // Discovered features
  discoveredFeatures: DiscoveredFeature[];
  discoverFeature: (feature: Omit<DiscoveredFeature, 'discoveredAt'>) => void;
  isFeatureDiscovered: (featureId: string) => boolean;
  getFeature: (featureId: string) => DiscoveredFeature | undefined;

  // Feature unlocks (progressive gating)
  unlocks: Record<string, FeatureUnlock>;
  setUnlock: (featureId: string, unlocked: boolean) => void;
  isFeatureUnlocked: (featureId: string) => boolean;

  // User actions for unlocking features
  completedActions: string[];
  completeAction: (actionId: string) => void;
  isActionCompleted: (actionId: string) => boolean;

  // Notification queue for new features
  pendingNotifications: string[];
  addNotification: (featureId: string) => void;
  clearNotification: (featureId: string) => void;

  // Level/progression
  level: number;
  experience: number;
  addExperience: (amount: number) => void;

  // Reset
  reset: () => void;
}

// Feature definitions
export const FEATURE_DEFINITIONS: Record<string, Omit<DiscoveredFeature, 'discoveredAt'>> = {
  // Navigation features
  movement: { id: 'movement', name: 'Movement', description: 'Right-click to move your character', category: 'navigation' },
  free_camera: { id: 'free_camera', name: 'Free Camera', description: 'Hold SPACE for free camera mode', category: 'navigation' },
  minimap: { id: 'minimap', name: 'Minimap', description: 'View the world map', category: 'navigation' },

  // Interaction features
  interaction: { id: 'interaction', name: 'Interaction', description: 'Press E to interact with objects', category: 'interaction' },
  terminals: { id: 'terminals', name: 'Data Terminals', description: 'Access project information', category: 'interaction' },
  portals: { id: 'portals', name: 'World Portals', description: 'Travel between worlds', category: 'interaction' },

  // World features
  dev_world: { id: 'dev_world', name: 'Dev World', description: 'The realm of code and engineering', category: 'world' },
  art_world: { id: 'art_world', name: 'Art World', description: 'The sanctuary of creativity', category: 'world' },

  // System features
  menu: { id: 'menu', name: 'Navigation Menu', description: 'Access all content', category: 'system' },
  settings: { id: 'settings', name: 'Settings', description: 'Customize your experience', category: 'system' },
  admin: { id: 'admin', name: 'Admin Terminal', description: 'Content management system', category: 'system' },
};

// Unlock conditions
export const UNLOCK_CONDITIONS: Record<string, { requiredLevel: number; requiredActions?: string[] }> = {
  art_world: { requiredLevel: 1, requiredActions: ['first_movement'] },
  free_camera: { requiredLevel: 1, requiredActions: ['first_movement'] },
  terminals: { requiredLevel: 2, requiredActions: ['first_interaction'] },
  portals: { requiredLevel: 2, requiredActions: ['explore_dev_world'] },
  minimap: { requiredLevel: 3 },
  admin: { requiredLevel: 5, requiredActions: ['discover_all_projects'] },
};

const initialState = {
  discoveredFeatures: [],
  unlocks: Object.entries(UNLOCK_CONDITIONS).reduce((acc, [id, cond]) => {
    acc[id] = {
      featureId: id,
      requiredActions: cond.requiredActions || [],
      unlocked: false,
    };
    return acc;
  }, {} as Record<string, FeatureUnlock>),
  completedActions: [],
  pendingNotifications: [],
  level: 1,
  experience: 0,
};

export const useProgressionStore = create<ProgressionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      discoverFeature: (feature) =>
        set((state) => {
          if (state.discoveredFeatures.some((f) => f.id === feature.id)) {
            return state;
          }
          const newFeature: DiscoveredFeature = {
            ...feature,
            discoveredAt: Date.now(),
          };
          return {
            discoveredFeatures: [...state.discoveredFeatures, newFeature],
            pendingNotifications: [...state.pendingNotifications, feature.id],
            experience: state.experience + 10,
          };
        }),

      isFeatureDiscovered: (featureId) =>
        get().discoveredFeatures.some((f) => f.id === featureId),

      getFeature: (featureId) =>
        get().discoveredFeatures.find((f) => f.id === featureId),

      setUnlock: (featureId, unlocked) =>
        set((state) => ({
          unlocks: {
            ...state.unlocks,
            [featureId]: {
              ...state.unlocks[featureId],
              unlocked,
              unlockedAt: unlocked ? Date.now() : undefined,
            },
          },
        })),

      isFeatureUnlocked: (featureId) => {
        const unlock = get().unlocks[featureId];
        if (!unlock) return true; // No unlock condition means always available
        return unlock.unlocked;
      },

      completeAction: (actionId) =>
        set((state) => {
          if (state.completedActions.includes(actionId)) {
            return state;
          }
          const newActions = [...state.completedActions, actionId];
          const newExperience = state.experience + 25;
          const newLevel = Math.floor(newExperience / 100) + 1;

          // Check for new unlocks
          const newUnlocks = { ...state.unlocks };
          Object.entries(UNLOCK_CONDITIONS).forEach(([featureId, cond]) => {
            if (cond.requiredActions?.includes(actionId)) {
              const allActionsComplete = cond.requiredActions.every((a) =>
                newActions.includes(a)
              );
              if (allActionsComplete && state.level >= cond.requiredLevel) {
                newUnlocks[featureId] = {
                  ...newUnlocks[featureId],
                  unlocked: true,
                  unlockedAt: Date.now(),
                };
              }
            }
          });

          return {
            completedActions: newActions,
            experience: newExperience,
            level: newLevel,
            unlocks: newUnlocks,
          };
        }),

      isActionCompleted: (actionId) => get().completedActions.includes(actionId),

      addNotification: (featureId) =>
        set((state) => {
          if (state.pendingNotifications.includes(featureId)) {
            return state;
          }
          return {
            pendingNotifications: [...state.pendingNotifications, featureId],
          };
        }),

      clearNotification: (featureId) =>
        set((state) => ({
          pendingNotifications: state.pendingNotifications.filter((id) => id !== featureId),
        })),

      addExperience: (amount) =>
        set((state) => {
          const newExperience = state.experience + amount;
          const newLevel = Math.floor(newExperience / 100) + 1;

          // Check for level-based unlocks
          const newUnlocks = { ...state.unlocks };
          Object.entries(UNLOCK_CONDITIONS).forEach(([featureId, cond]) => {
            if (
              newLevel >= cond.requiredLevel &&
              !state.unlocks[featureId]?.unlocked &&
              (!cond.requiredActions || cond.requiredActions.every((a) => state.completedActions.includes(a)))
            ) {
              newUnlocks[featureId] = {
                ...newUnlocks[featureId],
                unlocked: true,
                unlockedAt: Date.now(),
              };
            }
          });

          return {
            experience: newExperience,
            level: newLevel,
            unlocks: newUnlocks,
          };
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'oalacea_progression',
      partialize: (state) => ({
        discoveredFeatures: state.discoveredFeatures,
        unlocks: state.unlocks,
        completedActions: state.completedActions,
        level: state.level,
        experience: state.experience,
      }),
    }
  )
);

// Selectors
export const selectDiscoveredFeatures = (state: ProgressionState) => state.discoveredFeatures;
export const selectPendingNotifications = (state: ProgressionState) => state.pendingNotifications;
export const selectLevel = (state: ProgressionState) => state.level;
export const selectExperience = (state: ProgressionState) => state.experience;
