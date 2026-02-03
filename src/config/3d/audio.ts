// Audio configurations for 3D worlds
import type { WorldType, AudioTrack } from '@/core/3d/scenes/types';

// Music files that will be dynamically loaded from /3d/audio/music/
// The system will scan for .mp3 and .wav files
export const MUSIC_DIRECTORY = '/3d/audio/music';

// Cache buster - increment to force browser to reload audio files
export const AUDIO_VERSION = '2';

export const WORLD_AUDIO_CONFIGS: Record<WorldType, AudioTrack[]> = {
  dev: [
    {
      path: `/3d/audio/music/acidic.mp3?v=${AUDIO_VERSION}`,
      type: 'music',
      volume: 0.5,
      loop: false,
    },
  ],
  art: [
    {
      path: `/3d/audio/music/acidic.mp3?v=${AUDIO_VERSION}`,
      type: 'music',
      volume: 0.5,
      loop: false,
    },
  ],
};

// Sound effect configurations - matching actual files
export const SFX_CONFIGS = {
  interaction: { volume: 0.3, path: '/3d/audio/sfx/sfx_notification.wav' },
  hover: { volume: 0.15, path: '/3d/audio/sfx/sfx_notification.wav' },
  worldSwitch: { volume: 0.5, path: '/3d/audio/sfx/sfx_opening_door.mp3' },
  click: { volume: 0.4, path: '/3d/audio/sfx/sfx_notification.wav' },
  success: { volume: 0.5, path: '/3d/audio/sfx/sfx_notification.wav' },
  error: { volume: 0.4, path: '/3d/audio/sfx/sfx_notification_2.wav' },
  doorOpen: { volume: 0.5, path: '/3d/audio/sfx/sfx_opening_door.mp3' },
  doorClose: { volume: 0.5, path: '/3d/audio/sfx/sfx_close_door.mp3' },
  notification: { volume: 0.4, path: '/3d/audio/sfx/sfx_notification.wav' },
  notificationDelete: { volume: 0.4, path: '/3d/audio/sfx/sfx_notification_2.wav' },
  ambient: { volume: 0.3, path: '/3d/audio/sfx/sfx_ambient.wav', loop: true },
};

// Get all music files from the music directory
export async function getMusicFiles(): Promise<string[]> {
  try {
    // In a real implementation, we'd fetch the directory listing
    // For now, return the known music file
    return ['/3d/audio/music/acidic.mp3'];
  } catch {
    return [];
  }
}
