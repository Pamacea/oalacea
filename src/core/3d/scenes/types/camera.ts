// Camera type definitions

export type CameraMode = 'follow' | 'orbit' | 'cinematic' | 'firstPerson';

export interface CameraConfig {
  offset: [number, number, number];
  lookAtOffset: [number, number, number];
  smoothFactor: number;
  fov: number;
  minDistance: number;
  maxDistance: number;
}

export interface CameraState {
  mode: CameraMode;
  position: [number, number, number];
  target: [number, number, number];
  isTransitioning: boolean;
}
