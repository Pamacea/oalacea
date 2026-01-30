// Character store for 3D character state
import { create } from 'zustand';
import type { AnimationType } from '@/core/3d/scenes/types';

interface CharacterState {
  position: [number, number, number];
  setPosition: (pos: [number, number, number]) => void;
  rotation: number;
  setRotation: (rot: number) => void;
  velocity: [number, number, number];
  setVelocity: (vel: [number, number, number]) => void;
  currentAnimation: AnimationType;
  setAnimation: (anim: AnimationType) => void;
  animationMap: Record<AnimationType, string>;
  setAnimationMap: (map: Record<AnimationType, string>) => void;
  isGrounded: boolean;
  setIsGrounded: (grounded: boolean) => void;
  canInteract: boolean;
  interactTarget: { name: string; route: string; objectId: string; type?: 'portal' | 'route' | 'dialogue' | 'pickup' | 'admin'; targetWorld?: 'dev' | 'art' } | null;
  setCanInteract: (can: boolean, target?: { name: string; route: string; objectId: string; type?: 'portal' | 'route' | 'dialogue' | 'pickup' | 'admin'; targetWorld?: 'dev' | 'art' }) => void;
  isMoving: boolean;
  setIsMoving: (moving: boolean) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  inputs: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    run: boolean;
    jump: boolean;
    interact: boolean;
  };
  setInput: (key: keyof CharacterState['inputs'], value: boolean) => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  position: [0, 1, 5],
  setPosition: (pos) => set({ position: pos }),
  rotation: 0,
  setRotation: (rot) => set({ rotation: rot }),
  velocity: [0, 0, 0],
  setVelocity: (vel) => set({ velocity: vel }),
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
  isGrounded: true,
  setIsGrounded: (grounded) => set({ isGrounded: grounded }),
  canInteract: false,
  interactTarget: null,
  setCanInteract: (can, target) => set({ canInteract: can, interactTarget: target ?? null }),
  isMoving: false,
  setIsMoving: (moving) => set({ isMoving: moving }),
  isRunning: false,
  setIsRunning: (running) => set({ isRunning: running }),
  inputs: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false,
    interact: false,
  },
  setInput: (key, value) => set((state) => ({ inputs: { ...state.inputs, [key]: value } })),
}));

export const selectCharacterPosition = (state: CharacterState) => state.position;
export const selectCurrentAnimation = (state: CharacterState) => state.currentAnimation;
export const selectInteractionState = (state: CharacterState) => ({
  canInteract: state.canInteract,
  interactTarget: state.interactTarget,
});
export const selectMovementState = (state: CharacterState) => ({
  isMoving: state.isMoving,
  isRunning: state.isRunning,
  isGrounded: state.isGrounded,
});
export const selectInputs = (state: CharacterState) => state.inputs;
