// Collision Detector - Dynamic hitbox collision detection
import { Vector3 } from 'three';
import type { Obstacle } from './SpatialHashGrid';
import type { SpatialHashGrid } from './SpatialHashGrid';

export interface CollisionResult {
  collided: boolean;
  obstacle?: Obstacle;
  normal: Vector3;
  penetration: number;
  canInteract?: boolean;
  interactionTarget?: string;
}

export interface RaycastHit {
  collided: boolean;
  obstacle?: Obstacle;
  point: Vector3;
  normal: Vector3;
  distance: number;
}

/**
 * Collision detector using dynamic hitbox system
 * Supports circle, box, capsule, and polygon hitboxes
 */
export class CollisionDetector {
  private readonly spatialGrid: SpatialHashGrid;
  private readonly characterRadius: number = 0.5;

  constructor(spatialGrid: SpatialHashGrid) {
    this.spatialGrid = spatialGrid;
  }

  /**
   * Check collision at a specific position
   * Returns detailed collision information
   */
  checkCollision(
    position: Vector3,
    radius: number = this.characterRadius
  ): CollisionResult {
    const nearbyObstacles = this.spatialGrid.getNearbyObstacles(position, radius + 1);
    const result: CollisionResult = {
      collided: false,
      normal: new Vector3(),
      penetration: 0,
    };

    // Sort by distance to check closest obstacles first
    nearbyObstacles.sort((a, b) => {
      const distA = position.distanceTo(a.hitbox.getBounds().min);
      const distB = position.distanceTo(b.hitbox.getBounds().min);
      return distA - distB;
    });

    for (const obstacle of nearbyObstacles) {
      // Check trigger distance
      if (obstacle.type === 'trigger') {
        const dist = position.distanceTo(obstacle.hitbox.getBounds().min);
        const interactionDist = obstacle.interactionDistance ?? 2;

        if (dist <= interactionDist) {
          result.canInteract = true;
          result.interactionTarget = obstacle.id;
        }
        continue; // Triggers don't cause physical collision
      }

      // Check actual collision with hitbox
      const collision = obstacle.hitbox.collidesWithCircle(position, radius);

      if (collision.collided) {
        result.collided = true;
        result.obstacle = obstacle;
        result.normal.copy(collision.normal);
        result.penetration = collision.penetration;
        break; // Return first collision
      }
    }

    return result;
  }

  /**
   * Check if a position is valid (no collisions)
   */
  isPositionValid(position: Vector3, radius: number = this.characterRadius): boolean {
    const result = this.checkCollision(position, radius);
    return !result.collided;
  }

  /**
   * Raycast for line-of-sight checks
   * Returns first obstacle hit along the ray
   */
  raycast(
    from: Vector3,
    to: Vector3,
    radius: number = 0.1
  ): RaycastHit {
    const direction = to.clone().sub(from).normalize();
    const distance = from.distanceTo(to);
    const steps = Math.ceil(distance / 0.2); // Check every 20cm

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const checkPos = from.clone().add(direction.clone().multiplyScalar(distance * t));

      const nearbyObstacles = this.spatialGrid.getNearbyObstacles(checkPos, radius);

      for (const obstacle of nearbyObstacles) {
        if (obstacle.type === 'trigger') continue;

        const collision = obstacle.hitbox.collidesWithCircle(checkPos, radius);
        if (collision.collided) {
          return {
            collided: true,
            obstacle,
            point: checkPos,
            normal: collision.normal,
            distance: from.distanceTo(checkPos),
          };
        }
      }
    }

    return {
      collided: false,
      point: to,
      normal: new Vector3(),
      distance,
    };
  }

  /**
   * Check line of sight between two points
   */
  hasLineOfSight(from: Vector3, to: Vector3, radius: number = 0.1): boolean {
    const hit = this.raycast(from, to, radius);
    return !hit.collided;
  }

  /**
   * Get safe position near target
   * Pushes position outside of any collisions
   */
  resolveCollision(
    position: Vector3,
    radius: number = this.characterRadius
  ): Vector3 {
    const result = this.checkCollision(position, radius);

    if (!result.collided) {
      return position.clone();
    }

    // Push position out along collision normal
    return position.clone().add(result.normal.clone().multiplyScalar(result.penetration));
  }

  /**
   * Find nearest valid position to target
   * Improved with cardinal directions first for narrow passages
   */
  findNearestValidPosition(
    target: Vector3,
    radius: number = this.characterRadius,
    maxSearchRadius: number = 5
  ): Vector3 {
    if (this.isPositionValid(target, radius)) {
      return target.clone();
    }

    // Try cardinal and diagonal directions first (better for narrow passages)
    const primaryAngles = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4];
    const fineAngles = [];

    // Fill in finer angles between primary ones
    for (let i = 0; i < 8; i++) {
      fineAngles.push(primaryAngles[i]);
      if (i < 7) {
        fineAngles.push(primaryAngles[i] + Math.PI/8);
      }
    }

    const step = 0.5;

    // Search in expanding circles
    for (let r = step; r <= maxSearchRadius; r += step) {
      // Use finer angles for smaller radii, coarser for larger
      const angles = r <= 2 ? fineAngles : primaryAngles;
      const angleStep = r <= 2 ? Math.PI / 8 : Math.PI / 4;

      for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
        const offset = new Vector3(
          Math.cos(angle) * r,
          0,
          Math.sin(angle) * r
        );
        const testPos = target.clone().add(offset);

        if (this.isPositionValid(testPos, radius)) {
          return testPos;
        }
      }
    }

    return target.clone(); // Return original if no valid position found
  }

  /**
   * Get all obstacles within interaction distance
   */
  getInteractableObstacles(position: Vector3, radius: number = 2): Obstacle[] {
    const nearby = this.spatialGrid.getNearbyObstacles(position, radius);
    const interactables: Obstacle[] = [];

    for (const obstacle of nearby) {
      const interactionDist = obstacle.interactionDistance ?? radius;
      const bounds = obstacle.hitbox.getBounds();
      const center = new Vector3(
        (bounds.min.x + bounds.max.x) / 2,
        (bounds.min.y + bounds.max.y) / 2,
        (bounds.min.z + bounds.max.z) / 2
      );

      if (position.distanceTo(center) <= interactionDist) {
        interactables.push(obstacle);
      }
    }

    return interactables;
  }
}
