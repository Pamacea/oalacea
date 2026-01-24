// Hitbox Shape Base Interface
import { Vector3 } from 'three';

export enum HitboxType {
  CIRCLE = 'circle',      // Round objects (pillars, columns)
  BOX = 'box',            // Rectangular objects (walls, terminals)
  CAPSULE = 'capsule',    // Tall rounded objects (doors, character)
  POLYGON = 'polygon',    // Complex shapes (L-shaped, irregular)
}

/**
 * Base interface for all hitbox shapes
 * All hitboxes implement collision detection with circles (characters)
 */
export interface HitboxShape {
  readonly type: HitboxType;

  /**
   * Get the axis-aligned bounding box for grid registration
   * Returns min/max bounds in world space
   */
  getBounds(): { min: Vector3; max: Vector3 };

  /**
   * Check collision with a circle (character)
   * Returns collision result with normal and penetration depth
   */
  collidesWithCircle(
    center: Vector3,
    radius: number
  ): { collided: boolean; normal: Vector3; penetration: number };

  /**
   * Get the point on the shape closest to a given position
   * Used for collision response and interaction distance
   */
  getClosestPoint(position: Vector3): Vector3;

  /**
   * Check if a point is inside the hitbox
   */
  containsPoint(position: Vector3): boolean;
}

/**
 * Configuration for creating hitboxes from obstacle data
 */
export interface HitboxConfig {
  type: HitboxType;
  center: [number, number, number];
  size?: [number, number, number];   // For box: [width, height, depth]
  radius?: number;                   // For circle/capsule
  height?: number;                   // For capsule (total height)
  rotation?: number;                 // For box/capsule: Y-axis rotation in radians
}
