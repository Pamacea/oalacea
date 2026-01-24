// src/store/3d-character-store.ts
// Store Zustand pour l'état du personnage 3D

import { create } from 'zustand';
import type { AnimationType } from '@/core/3d/scenes/types';

// ============================================================================
// CHARACTER STATE
// ============================================================================

interface CharacterState {
  // Position & Movement
  /** Position actuelle du personnage [x, y, z] */
  position: [number, number, number];
  /** Définir la position du personnage */
  setPosition: (pos: [number, number, number]) => void;

  /** Rotation actuelle (en radians autour de Y) */
  rotation: number;
  /** Définir la rotation */
  setRotation: (rot: number) => void;

  /** Vélocité actuelle [x, y, z] */
  velocity: [number, number, number];
  /** Définir la vélocité */
  setVelocity: (vel: [number, number, number]) => void;

  // Animation
  /** Animation actuellement jouée */
  currentAnimation: AnimationType;
  /** Changer l'animation */
  setAnimation: (anim: AnimationType) => void;

  /** Map des animations disponibles (clés = noms dans le GLB) */
  animationMap: Record<AnimationType, string>;
  /** Définir le mapping des animations */
  setAnimationMap: (map: Record<AnimationType, string>) => void;

  // Grounded State
  /** Le personnage est-il au sol ? */
  isGrounded: boolean;
  /** Définir l'état au sol */
  setIsGrounded: (grounded: boolean) => void;

  // Interaction
  /** Une interaction est-elle disponible ? */
  canInteract: boolean;
  /** Cible d'interaction actuelle */
  interactTarget: { name: string; route: string; objectId: string } | null;
  /** Définir la disponibilité d'interaction */
  setCanInteract: (
    can: boolean,
    target?: { name: string; route: string; objectId: string }
  ) => void;

  // World Context
  /** Monde actuel du personnage */
  currentWorld: 'dev' | 'art';
  /** Changer de monde */
  setCurrentWorld: (world: 'dev' | 'art') => void;

  // Movement State
  /** Le personnage se déplace-t-il ? */
  isMoving: boolean;
  /** Définir l'état de mouvement */
  setIsMoving: (moving: boolean) => void;

  /** Le personnage court-il ? */
  isRunning: boolean;
  /** Définir l'état de course */
  setIsRunning: (running: boolean) => void;

  // Input State (raw keyboard state)
  /** État des inputs clavier */
  inputs: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    run: boolean;
    jump: boolean;
    interact: boolean;
  };
  /** Définir un input */
  setInput: (key: keyof CharacterState['inputs'], value: boolean) => void;
}

// ============================================================================
// STORE CREATION
// ============================================================================

export const useCharacterStore = create<CharacterState>((set) => ({
  // Position & Movement
  position: [0, 1, 5],
  setPosition: (pos) => set({ position: pos }),

  rotation: 0,
  setRotation: (rot) => set({ rotation: rot }),

  velocity: [0, 0, 0],
  setVelocity: (vel) => set({ velocity: vel }),

  // Animation
  currentAnimation: 'idle',
  setAnimation: (anim) => set({ currentAnimation: anim }),

  animationMap: {
    idle: 'Idle',
    walk: 'Walk',
    run: 'Run',
    jump: 'Jump',
    fall: 'Fall',
    land: 'Land',
    interact: 'Interact',
  },
  setAnimationMap: (map) => set({ animationMap: map }),

  // Grounded State
  isGrounded: true,
  setIsGrounded: (grounded) => set({ isGrounded: grounded }),

  // Interaction
  canInteract: false,
  interactTarget: null,
  setCanInteract: (can, target) =>
    set({
      canInteract: can,
      interactTarget: target ?? null,
    }),

  // World Context
  currentWorld: 'dev',
  setCurrentWorld: (world) => set({ currentWorld: world }),

  // Movement State
  isMoving: false,
  setIsMoving: (moving) => set({ isMoving: moving }),

  isRunning: false,
  setIsRunning: (running) => set({ isRunning: running }),

  // Input State
  inputs: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
    interact: false,
  },
  setInput: (key, value) =>
    set((state) => ({
      inputs: { ...state.inputs, [key]: value },
    })),
}));

// ============================================================================
// SELECTORS (optimized selectors for component usage)
// ============================================================================

/**
 * Sélecteur pour la position du personnage
 */
export const selectCharacterPosition = (state: CharacterState) => state.position;

/**
 * Sélecteur pour l'animation actuelle
 */
export const selectCurrentAnimation = (state: CharacterState) => state.currentAnimation;

/**
 * Sélecteur pour l'état d'interaction
 */
export const selectInteractionState = (state: CharacterState) => ({
  canInteract: state.canInteract,
  interactTarget: state.interactTarget,
});

/**
 * Sélecteur pour l'état de mouvement
 */
export const selectMovementState = (state: CharacterState) => ({
  isMoving: state.isMoving,
  isRunning: state.isRunning,
  isGrounded: state.isGrounded,
});

/**
 * Sélecteur pour les inputs
 */
export const selectInputs = (state: CharacterState) => state.inputs;
