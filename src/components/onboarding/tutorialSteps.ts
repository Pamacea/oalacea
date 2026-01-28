// Tutorial steps configuration
import type { TutorialStep } from '@/store/onboarding-store';

export interface TutorialStepData {
  id: TutorialStep;
  title: string;
  description: string;
  highlightedElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  keyHint?: string;
}

export const tutorialSteps: TutorialStepData[] = [
  {
    id: 'welcome',
    title: 'Welcome to Oalacea',
    description: 'Your journey through the Imperium awaits. This brief tutorial will guide you through the basics of navigation and interaction.',
    position: 'center',
  },
  {
    id: 'movement',
    title: 'Movement',
    description: 'Right-click and hold anywhere on the ground to move your character. The character will follow your cursor.',
    highlightedElement: 'canvas',
    keyHint: 'Right-click + Hold',
  },
  {
    id: 'camera',
    title: 'Camera Controls',
    description: 'Press and hold SPACE to enter free camera mode. Use WASD or arrow keys to pan the camera around the world.',
    highlightedElement: 'canvas',
    keyHint: 'SPACE + WASD',
  },
  {
    id: 'interaction',
    title: 'Interaction',
    description: 'When near an interactive object, press E to interact. This includes terminals, portals, and project displays.',
    highlightedElement: 'interaction-prompt',
    keyHint: 'E',
  },
  {
    id: 'worlds',
    title: 'World Switching',
    description: 'Step through the portal to travel between the Dev World and the Art World. Each world showcases different aspects of my work.',
    highlightedElement: 'portal',
    keyHint: 'Walk into portal',
  },
  {
    id: 'navigation',
    title: 'Navigation Menu',
    description: 'Access the full menu to explore all projects, blog posts, and about information. Press the menu icon in the top right.',
    highlightedElement: 'menu-button',
    keyHint: 'Click menu icon',
  },
];

export const getStepById = (id: TutorialStep): TutorialStepData | undefined => {
  return tutorialSteps.find((step) => step.id === id);
};

export const getNextStep = (currentId: TutorialStep): TutorialStep | null => {
  const currentIndex = tutorialSteps.findIndex((step) => step.id === currentId);
  if (currentIndex < tutorialSteps.length - 1) {
    return tutorialSteps[currentIndex + 1].id;
  }
  return null;
};

export const getPrevStep = (currentId: TutorialStep): TutorialStep | null => {
  const currentIndex = tutorialSteps.findIndex((step) => step.id === currentId);
  if (currentIndex > 0) {
    return tutorialSteps[currentIndex - 1].id;
  }
  return null;
};

export const getStepProgress = (currentId: TutorialStep): { current: number; total: number } => {
  const currentIndex = tutorialSteps.findIndex((step) => step.id === currentId);
  return {
    current: currentIndex + 1,
    total: tutorialSteps.length,
  };
};
