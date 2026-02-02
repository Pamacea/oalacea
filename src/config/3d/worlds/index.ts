// World configurations export
import { DEV_WORLD } from './dev';
import { ART_WORLD } from './art';

export const WORLDS = {
  dev: DEV_WORLD,
  art: ART_WORLD,
} as const;

export type WorldId = keyof typeof WORLDS;
export { DEV_WORLD, ART_WORLD };

export const WORLD_TRANSITION_DURATION = 2000;
export const WORLD_FADE_DURATION = 500;

export const WORLD_TRANSITIONS = {
  'dev->art': { type: 'warp' as const, color: '#4ecdc4', duration: WORLD_TRANSITION_DURATION },
  'art->dev': { type: 'warp' as const, color: '#d4af37', duration: WORLD_TRANSITION_DURATION },
} as const;
