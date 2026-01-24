// Transition type definitions
import type { WorldType } from './world';

export type TransitionType = 'fade' | 'warp' | 'portal' | 'cinematic';

export interface WorldTransition {
  type: TransitionType;
  color?: string;
  duration: number;
}

export interface TransitionState {
  isActive: boolean;
  progress: number;
  fromWorld: WorldType;
  toWorld: WorldType;
}
