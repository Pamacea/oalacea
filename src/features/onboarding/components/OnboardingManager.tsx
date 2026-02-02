// OnboardingManager - Main component that integrates all onboarding features
'use client';

import { useEffect } from 'react';
import { TutorialOverlay } from './TutorialOverlay';
import { FeatureDiscovery } from './FeatureDiscovery';
import { WorldIntro } from '@/features/3d-world/components';
import { CinematicCamera, DEV_WORLD_PATH, ART_WORLD_PATH } from '@/core/3d/camera/CinematicCamera';
import { useOnboardingStore } from '@/features/onboarding/store';
import { useProgressionStore } from '@/features/onboarding/store';
import { useFirstVisit } from '@/features/onboarding/hooks';
import { useFeatureDiscovery } from './FeatureDiscovery';
import type { PerspectiveCamera as PerspectiveCameraType } from 'three';

interface OnboardingManagerProps {
  currentWorld?: 'dev' | 'art';
  cameraRef?: React.MutableRefObject<PerspectiveCameraType | null>;
}

export function OnboardingManager({ currentWorld = 'dev', cameraRef }: OnboardingManagerProps) {
  const { isFirstVisit, markVisited } = useFirstVisit();
  const { seenDevWorldIntro, seenArtWorldIntro } = useOnboardingStore();
  const { discover, discoverMovement } = useFeatureDiscovery();

  // Mark first visit after mount
  useEffect(() => {
    if (isFirstVisit) {
      markVisited();
      // Auto-discover initial features
      discoverMovement();
    }
  }, [isFirstVisit, markVisited, discoverMovement]);

  // Track world visits for feature discovery
  useEffect(() => {
    if (currentWorld === 'dev' && !seenDevWorldIntro) {
      discover('dev_world');
    } else if (currentWorld === 'art' && !seenArtWorldIntro) {
      discover('art_world');
    }
  }, [currentWorld, seenDevWorldIntro, seenArtWorldIntro, discover]);

  // Should show world intro?
  const showWorldIntro = currentWorld === 'dev' ? !seenDevWorldIntro : !seenArtWorldIntro;
  const worldPath = currentWorld === 'dev' ? DEV_WORLD_PATH : ART_WORLD_PATH;

  return (
    <>
      {/* Tutorial overlay */}
      {isFirstVisit && <TutorialOverlay />}

      {/* World intro cinematic */}
      {showWorldIntro && (
        <>
          <CinematicCamera
            path={worldPath}
            world={currentWorld}
            duration={8}
            allowSkip
            targetCameraRef={cameraRef}
          />
          <WorldIntro
            world={currentWorld}
            isActive={showWorldIntro}
          />
        </>
      )}

      {/* Progressive feature discovery */}
      <FeatureDiscovery />
    </>
  );
}

// Hook to trigger onboarding actions from anywhere
export function useOnboardingActions() {
  const { setCurrentStep, resetTutorial } = useOnboardingStore();
  const { discoverFeature, addExperience, completeAction } = useProgressionStore();

  const startTutorial = () => setCurrentStep('welcome');

  const triggerFeatureDiscovery = (featureId: string) => {
    // Import FEATURE_DEFINITIONS dynamically to avoid circular deps
    import('./tutorialSteps').then(() => {
      import('@/features/onboarding/store').then(({ FEATURE_DEFINITIONS }) => {
        const def = FEATURE_DEFINITIONS[featureId];
        if (def) {
          discoverFeature(def);
        }
      });
    });
  };

  const completeOnboardingAction = (actionId: string, xpReward = 25) => {
    completeAction(actionId);
    addExperience(xpReward);
  };

  return {
    startTutorial,
    resetTutorial,
    triggerFeatureDiscovery,
    completeOnboardingAction,
  };
}
