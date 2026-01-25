// Camera bounds configuration
import { Vector3 } from 'three';

export interface CameraBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CameraLimitsConfig {
  maxDistanceFromCharacter: number;
  bounds: CameraBounds;
}

// Configuration: camera can move 35 units max from character
// This covers the main playable area (pillars at radius 25)
export const CAMERA_LIMITS: CameraLimitsConfig = {
  maxDistanceFromCharacter: 35,
  bounds: {
    minX: -45,
    maxX: 45,
    minZ: -45,
    maxZ: 45,
  },
};

/**
 * Clamp camera position to stay within bounds
 */
export function clampCameraPosition(
  position: Vector3,
  characterPosition: Vector3,
  config: CameraLimitsConfig
): Vector3 {
  const clamped = position.clone();

  // First clamp to rectangular bounds
  clamped.x = Math.max(config.bounds.minX, Math.min(config.bounds.maxX, clamped.x));
  clamped.z = Math.max(config.bounds.minZ, Math.min(config.bounds.maxZ, clamped.z));

  // Then clamp distance from character
  const offset = new Vector3().subVectors(clamped, characterPosition);
  const distance = offset.length();

  if (distance > config.maxDistanceFromCharacter) {
    offset.normalize().multiplyScalar(config.maxDistanceFromCharacter);
    clamped.copy(characterPosition).add(offset);
  }

  return clamped;
}
