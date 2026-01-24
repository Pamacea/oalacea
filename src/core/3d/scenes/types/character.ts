// Character type definitions

export type AnimationType =
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'fall'
  | 'land'
  | 'interact';

export interface CharacterInputs {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  jump: boolean;
  interact: boolean;
}

export interface CharacterState {
  position: [number, number, number];
  rotation: number;
  velocity: [number, number, number];
  isGrounded: boolean;
  currentAnimation: AnimationType;
}

export interface CharacterConfig {
  walkSpeed: number;
  runSpeed: number;
  jumpForce: number;
  rotationSpeed: number;
  height: number;
  mass: number;
  modelPath: string;
  animations: CharacterAnimations;
}

export interface CharacterAnimations {
  idle: string;
  walk: string;
  run: string;
  jump: string;
  fall: string;
  land: string;
  interact: string;
}
