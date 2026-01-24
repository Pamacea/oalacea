// Box Hitbox - For rectangular objects like walls, terminals, and buildings
// Supports both AABB (axis-aligned) and OBB (oriented bounding box) via SAT
import { Vector3, Quaternion } from 'three';
import type { HitboxShape } from './HitboxShape';
import { HitboxType } from './HitboxShape';

export interface BoxHitboxConfig {
  center: Vector3;
  size: [number, number, number];  // [width, height, depth]
  rotation?: number;               // Y-axis rotation in radians
}

export class BoxHitbox implements HitboxShape {
  readonly type = HitboxType.BOX;
  readonly center: Vector3;
  readonly size: [number, number, number];
  readonly halfSize: Vector3;
  readonly rotation: number;
  readonly quaternion: Quaternion;
  readonly inverseQuaternion: Quaternion;
  readonly axes: Vector3[];  // Local axes for OBB

  constructor(config: BoxHitboxConfig) {
    this.center = config.center.clone();
    this.size = config.size;
    this.halfSize = new Vector3(
      config.size[0] / 2,
      config.size[1] / 2,
      config.size[2] / 2
    );
    this.rotation = config.rotation || 0;
    this.quaternion = new Quaternion().setFromAxisAngle(
      new Vector3(0, 1, 0),
      this.rotation
    );
    this.inverseQuaternion = this.quaternion.clone().invert();

    // Precompute local axes for OBB collision
    this.axes = [
      new Vector3(1, 0, 0).applyQuaternion(this.quaternion),
      new Vector3(0, 1, 0).applyQuaternion(this.quaternion),
      new Vector3(0, 0, 1).applyQuaternion(this.quaternion),
    ];
  }

  getBounds() {
    // For rotated boxes, return AABB bounds (conservative)
    if (this.rotation !== 0) {
      const corners = this.getCorners();
      const min = corners[0].clone();
      const max = corners[0].clone();

      for (let i = 1; i < corners.length; i++) {
        min.min(corners[i]);
        max.max(corners[i]);
      }

      return { min, max };
    }

    // Axis-aligned box
    return {
      min: new Vector3(
        this.center.x - this.halfSize.x,
        this.center.y - this.halfSize.y,
        this.center.z - this.halfSize.z
      ),
      max: new Vector3(
        this.center.x + this.halfSize.x,
        this.center.y + this.halfSize.y,
        this.center.z + this.halfSize.z
      ),
    };
  }

  /**
   * Get all 8 corners of the box
   */
  getCorners(): Vector3[] {
    const corners: Vector3[] = [];

    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          const corner = new Vector3(
            x * this.halfSize.x,
            y * this.halfSize.y,
            z * this.halfSize.z
          );
          corner.applyQuaternion(this.quaternion);
          corner.add(this.center);
          corners.push(corner);
        }
      }
    }

    return corners;
  }

  /**
   * SAT-based collision detection with a circle
   * Works for both AABB and OBB
   */
  collidesWithCircle(circleCenter: Vector3, circleRadius: number) {
    // Transform circle center to box local space
    const localCircleCenter = circleCenter.clone().sub(this.center);
    localCircleCenter.applyQuaternion(this.inverseQuaternion);

    // Find closest point on box to circle center (in local space)
    const closestLocal = new Vector3(
      Math.max(-this.halfSize.x, Math.min(this.halfSize.x, localCircleCenter.x)),
      Math.max(-this.halfSize.y, Math.min(this.halfSize.y, localCircleCenter.y)),
      Math.max(-this.halfSize.z, Math.min(this.halfSize.z, localCircleCenter.z))
    );

    // Check if circle center is inside the box
    const isInside =
      Math.abs(localCircleCenter.x) < this.halfSize.x &&
      Math.abs(localCircleCenter.y) < this.halfSize.y &&
      Math.abs(localCircleCenter.z) < this.halfSize.z;

    // Calculate distance in local space
    const localDiff = localCircleCenter.clone().sub(closestLocal);
    const distanceSq = localDiff.x * localDiff.x + localDiff.z * localDiff.z;
    const distance = Math.sqrt(distanceSq);

    // Check collision
    if (distance < circleRadius || isInside) {
      // Calculate normal
      let normal: Vector3;

      if (isInside) {
        // Circle is inside - push out along shortest axis
        const distances = [
          this.halfSize.x - Math.abs(localCircleCenter.x),
          this.halfSize.z - Math.abs(localCircleCenter.z),
        ];
        const minIndex = distances[0] < distances[1] ? 0 : 1;

        const localNormal = new Vector3(
          minIndex === 0 ? Math.sign(localCircleCenter.x) : 0,
          0,
          minIndex === 1 ? Math.sign(localCircleCenter.z) : 0
        );
        normal = localNormal.clone().applyQuaternion(this.quaternion);
      } else {
        // Transform closest point and normal back to world space
        normal = localDiff.clone().normalize();
        normal.applyQuaternion(this.quaternion);
      }

      const penetration = isInside
        ? circleRadius + distance
        : circleRadius - distance;

      return { collided: true, normal, penetration };
    }

    return { collided: false, normal: new Vector3(), penetration: 0 };
  }

  getClosestPoint(position: Vector3): Vector3 {
    // Transform position to box local space
    const localPos = position.clone().sub(this.center);
    localPos.applyQuaternion(this.inverseQuaternion);

    // Clamp to box bounds
    const closestLocal = new Vector3(
      Math.max(-this.halfSize.x, Math.min(this.halfSize.x, localPos.x)),
      Math.max(-this.halfSize.y, Math.min(this.halfSize.y, localPos.y)),
      Math.max(-this.halfSize.z, Math.min(this.halfSize.z, localPos.z))
    );

    // Transform back to world space
    return closestLocal.applyQuaternion(this.quaternion).add(this.center);
  }

  containsPoint(position: Vector3): boolean {
    // Transform position to box local space
    const localPos = position.clone().sub(this.center);
    localPos.applyQuaternion(this.inverseQuaternion);

    return (
      Math.abs(localPos.x) <= this.halfSize.x &&
      Math.abs(localPos.y) <= this.halfSize.y &&
      Math.abs(localPos.z) <= this.halfSize.z
    );
  }
}
