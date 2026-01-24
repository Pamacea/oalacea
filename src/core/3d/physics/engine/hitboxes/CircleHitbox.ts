// Circle Hitbox - For round objects like pillars, columns, and rotundas
import { Vector3 } from 'three';
import type { HitboxShape } from './HitboxShape';
import { HitboxType } from './HitboxShape';

export interface CircleHitboxConfig {
  center: Vector3;
  radius: number;
}

export class CircleHitbox implements HitboxShape {
  readonly type = HitboxType.CIRCLE;
  readonly center: Vector3;
  readonly radius: number;

  constructor(config: CircleHitboxConfig) {
    this.center = config.center.clone();
    this.radius = config.radius;
  }

  getBounds() {
    return {
      min: new Vector3(
        this.center.x - this.radius,
        this.center.y,
        this.center.z - this.radius
      ),
      max: new Vector3(
        this.center.x + this.radius,
        this.center.y,
        this.center.z + this.radius
      ),
    };
  }

  collidesWithCircle(center: Vector3, radius: number) {
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
    direction.y = 0; // Keep in XZ plane

    const length = direction.length();
    if (length > 0.0001) {
      direction.normalize().multiplyScalar(this.radius);
    }

    return this.center.clone().add(direction);
  }

  containsPoint(position: Vector3): boolean {
    const dx = position.x - this.center.x;
    const dz = position.z - this.center.z;
    return (dx * dx + dz * dz) <= this.radius * this.radius;
  }
}
