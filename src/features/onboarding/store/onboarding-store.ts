// Onboarding store - Tutorial and first visit state management
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ONBOARDING_STORAGE_KEY = 'oalacea_onboarding';

type TutorialStep = 'welcome' | 'movement' | 'camera' | 'interaction' | 'worlds' | 'navigation';

export type { TutorialStep };
export type { OnboardingState };

interface OnboardingState {
  // First visit tracking
  firstVisit: boolean;
  setFirstVisit: (visited: boolean) => void;

  // Tutorial tracking
  seenTutorial: boolean;
  setSeenTutorial: (seen: boolean) => void;

  // Current tutorial step
  currentStep: TutorialStep | null;
  setCurrentStep: (step: TutorialStep | null) => void;

  // Completed steps
  completedSteps: TutorialStep[];
  completeStep: (step: TutorialStep) => void;
  isStepCompleted: (step: TutorialStep) => boolean;

  // Tutorial dismissed (skipped)
  tutorialDismissed: boolean;
  dismissTutorial: () => void;

  // World intro tracking
  seenDevWorldIntro: boolean;
  seenArtWorldIntro: boolean;
  setWorldIntroSeen: (world: 'dev' | 'art') => void;

  // Feature discovery
  discoveredFeatures: string[];
  discoverFeature: (featureId: string) => void;
  isFeatureDiscovered: (featureId: string) => boolean;

  // Reset for development
  reset: () => void;
  resetTutorial: () => void;
}

const initialState = {
  firstVisit: true,
  seenTutorial: false,
  currentStep: null,
  completedSteps: [] as TutorialStep[],
  tutorialDismissed: false,
  seenDevWorldIntro: false,
  seenArtWorldIntro: false,
  discoveredFeatures: [] as string[],
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setFirstVisit: (visited) => set({ firstVisit: visited }),

      setSeenTutorial: (seen) => set({ seenTutorial: seen }),

      setCurrentStep: (step) => set({ currentStep: step }),

      completeStep: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      isStepCompleted: (step) => get().completedSteps.includes(step),

      dismissTutorial: () => set({ tutorialDismissed: true, currentStep: null }),

      setWorldIntroSeen: (world) =>
        set({
          seenDevWorldIntro: world === 'dev' ? true : get().seenDevWorldIntro,
          seenArtWorldIntro: world === 'art' ? true : get().seenArtWorldIntro,
        }),

      discoverFeature: (featureId) =>
        set((state) =>
          state.discoveredFeatures.includes(featureId)
            ? state
            : { discoveredFeatures: [...state.discoveredFeatures, featureId] }
        ),

      isFeatureDiscovered: (featureId) => get().discoveredFeatures.includes(featureId),

      reset: () =>
        set({
          ...initialState,
          firstVisit: true,
          seenTutorial: false,
          completedSteps: [],
          tutorialDismissed: false,
          discoveredFeatures: [],
        }),

      resetTutorial: () =>
        set({
          currentStep: null,
          completedSteps: [],
          tutorialDismissed: false,
        }),
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      partialize: (state) => ({
        firstVisit: state.firstVisit,
        seenTutorial: state.seenTutorial,
        completedSteps: state.completedSteps,
        tutorialDismissed: state.tutorialDismissed,
        seenDevWorldIntro: state.seenDevWorldIntro,
        seenArtWorldIntro: state.seenArtWorldIntro,
        discoveredFeatures: state.discoveredFeatures,
      }),
    }
  )
);

// Selectors
export const selectFirstVisit = (state: OnboardingState) => state.firstVisit;
export const selectSeenTutorial = (state: OnboardingState) => state.seenTutorial;
export const selectCurrentStep = (state: OnboardingState) => state.currentStep;
export const selectCompletedSteps = (state: OnboardingState) => state.completedSteps;
export const selectTutorialProgress = (state: OnboardingState) => ({
  current: state.currentStep,
  completed: state.completedSteps,
  total: 5,
});
