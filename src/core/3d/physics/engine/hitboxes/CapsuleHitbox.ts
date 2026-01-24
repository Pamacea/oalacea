// Capsule Hitbox - For tall objects with rounded tops like doors and the character
import { Vector3 } from 'three';
import type { HitboxShape } from './HitboxShape';
import { HitboxType } from './HitboxShape';

export interface CapsuleHitboxConfig {
  center: Vector3;
  radius: number;
  height: number;        // Total height (including hemispheres)
  rotation?: number;     // Y-axis rotation
}

export class CapsuleHitbox implements HitboxShape {
  readonly type = HitboxType.CAPSULE;
  readonly center: Vector3;
  readonly radius: number;
  readonly height: number;
  readonly halfHeight: number;  // Cylinder half-height (excluding hemispheres)
  readonly rotation: number;

  constructor(config: CapsuleHitboxConfig) {
    this.center = config.center.clone();
    this.radius = config.radius;
    this.height = config.height;
    // halfHeight is the cylinder portion only (excluding the two hemispheres)
    this.halfHeight = Math.max(0, (config.height - 2 * config.radius) / 2);
    this.rotation = config.rotation || 0;
  }

  getBounds() {
    return {
      min: new Vector3(
        this.center.x - this.radius,
        this.center.y - this.height / 2,
        this.center.z - this.radius
      ),
      max: new Vector3(
        this.center.x + this.radius,
        this.center.y + this.height / 2,
        this.center.z + this.radius
      ),
    };
  }

  collidesWithCircle(center: Vector3, radius: number) {
    // For 2D XZ plane collision, treat as circle
    // The capsule's horizontal cross-section is always a circle
    const dx = center.x - this.center.x;
    const dz = center.z - this.center.z;
    const distanceSq = dx * dx + dz * dz;
    const minDistance = radius + this.radius;

    if (distanceSq < minDistance * minDistance) {
      const distance = Math.sqrt(distanceSq);
      const normal = distance > 0.0001
        ? new Vector3(dx / distance, 0, dz / distance)
        : new Vector3(1, 0, 0);
      const penetration = minDistance - distance;
      return { collided: true, normal, penetration };
    }

    return { collided: false, normal: new Vector3(), penetration: 0 };
  }

  getClosestPoint(position: Vector3): Vector3 {
    const direction = position.clone().sub(this.center);
    direction.y = 0; // Flatten to XZ plane

    const length = direction.length();
    if (length > 0.0001) {
      direction.normalize().multiplyScalar(this.radius);
    }

    return this.center.clone().add(direction);
  }

  containsPoint(position: Vector3): boolean {
    const dx = position.x - this.center.x;
    const dz = position.z - this.center.z;

    // Check horizontal distance (radius)
    const horizontalDistSq = dx * dx + dz * dz;
    if (horizontalDistSq > this.radius * this.radius) {
      return false;
    }

    // Check vertical bounds
    const dy = Math.abs(position.y - this.center.y);
    return dy <= this.height / 2;
  }
}
