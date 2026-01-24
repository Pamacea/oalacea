// Audio type definitions

export interface WorldAudioConfig {
  tracks: AudioTrack[];
  masterVolume: number;
  crossfadeDuration: number;
}

export interface AudioTrack {
  path: string;
  type: 'ambient' | 'music' | 'sfx' | 'footstep';
  volume: number;
  loop: boolean;
}
