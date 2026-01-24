// Audio configurations for 3D worlds
import type { WorldType, AudioTrack } from '@/core/3d/scenes/types';

export const WORLD_AUDIO_CONFIGS: Record<WorldType, AudioTrack[]> = {
  dev: [
    {
      path: '/3d/audio/dev-ambient.mp3',
      type: 'ambient',
      volume: 0.4,
      loop: true,
    },
    {
      path: '/3d/audio/dev-machinery.mp3',
      type: 'ambient',
      volume: 0.2,
      loop: true,
    },
  ],
  art: [
    {
      path: '/3d/audio/art-ambient.mp3',
      type: 'music',
      volume: 0.3,
      loop: true,
    },
    {
      path: '/3d/audio/art-beats.mp3',
      type: 'music',
      volume: 0.25,
      loop: true,
    },
  ],
};
