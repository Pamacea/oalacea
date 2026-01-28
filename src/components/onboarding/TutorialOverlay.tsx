// TutorialOverlay - Main tutorial overlay component with spotlight effect
'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboarding-store';
import { tutorialSteps, getNextStep, getPrevStep, getStepProgress } from './tutorialSteps';
import { TutorialStep as TutorialStepComponent } from './TutorialStep';
import { cn } from '@/lib/utils';

interface TutorialOverlayProps {
  onComplete?: () => void;
}

export function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [currentStepId, setCurrentStepId] = useState<ReturnType<typeof useOnboardingStore.getState>['currentStep']>(null);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});

  const {
    currentStep,
    setCurrentStep,
    completeStep,
    isStepCompleted,
    setSeenTutorial,
    dismissTutorial,
    tutorialDismissed,
    firstVisit,
  } = useOnboardingStore();

  // Sync local state with store
  useEffect(() => {
    setCurrentStepId(currentStep);
  }, [currentStep]);

  // Auto-start tutorial on first visit
  useEffect(() => {
    if (firstVisit && !tutorialDismissed && !currentStep) {
      // Small delay to let the scene load
      const timer = setTimeout(() => {
        setCurrentStep('welcome');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [firstVisit, tutorialDismissed, currentStep, setCurrentStep]);

  // Spotlight effect for highlighted elements
  useEffect(() => {
    if (!currentStepId) return;

    const stepData = tutorialSteps.find((s) => s.id === currentStepId);
    if (!stepData?.highlightedElement) {
      setSpotlightStyle({});
      return;
    }

    const updateSpotlight = () => {
      let element: HTMLElement | null = null;

      switch (stepData.highlightedElement) {
        case 'canvas':
          element = document.querySelector('canvas');
          break;
        case 'menu-button':
          element = document.querySelector('[data-slot="button"][aria-label="Menu"]');
          break;
        case 'interaction-prompt':
          element = document.querySelector('[data-interaction-prompt]');
          break;
        case 'portal':
          // Portal is a 3D object, center screen
          setSpotlightStyle({
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          });
          return;
        default:
          return;
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightStyle({
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left + rect.width / 2}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          transform: 'translate(-50%, -50%)',
        });
      }
    };

    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [currentStepId]);

  const handleNext = useCallback(() => {
    if (!currentStepId) return;

    completeStep(currentStepId);
    const nextStep = getNextStep(currentStepId);

    if (nextStep) {
      setCurrentStep(nextStep);
    } else {
      handleComplete();
    }
  }, [currentStepId, completeStep, setCurrentStep]);

  const handlePrevious = useCallback(() => {
    if (!currentStepId) return;

    const prevStep = getPrevStep(currentStepId);
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  }, [currentStepId, setCurrentStep]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, []);

  const handleComplete = useCallback(() => {
    setSeenTutorial(true);
    dismissTutorial();
    setCurrentStep(null);
    onComplete?.();
  }, [setSeenTutorial, dismissTutorial, setCurrentStep, onComplete]);

  if (!currentStepId) return null;

  const stepData = tutorialSteps.find((s) => s.id === currentStepId);
  if (!stepData) return null;

  const progress = getStepProgress(currentStepId);
  const isLastStep = progress.current === progress.total;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      >
        {/* Spotlight ring (only when highlighting specific elements) */}
        {stepData.highlightedElement && stepData.highlightedElement !== 'canvas' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed pointer-events-none"
            style={spotlightStyle}
          >
            <div className="absolute -inset-4 rounded-full border-2 border-imperium-gold shadow-[0_0_30px_rgba(212,175,55,0.5)]" />
          </motion.div>
        )}

        {/* Tutorial card */}
        <div
          className="fixed z-50 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            <TutorialStepComponent
              key={currentStepId}
              step={stepData}
              currentIndex={progress.current - 1}
              totalSteps={progress.total}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSkip={handleSkip}
              isLastStep={isLastStep}
            />
          </AnimatePresence>
        </div>

        {/* Skip hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bottom-8 right-8 fixed text-slate-500 text-sm"
        >
          Press ESC to skip
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
