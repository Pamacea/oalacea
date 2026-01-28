# Oalacea 3D - Physics Engine Specification

> Custom physics engine designed for 3D portfolio navigation with precise collisions and smooth character movement

**Version:** 1.1.0
**Created:** 2025-01-24
**Updated:** 2025-01-24 (0.5m cells, dynamic hitboxes)
**Status:** Design Document

---

## Table of Contents

1. [Overview](#overview)
2. [Current Problems](#current-problems)
3. [Architecture](#architecture)
4. [Collision System](#collision-system)
5. [Kinematics & Dynamics](#kinematics--dynamics)
6. [Pathfinding Integration](#pathfinding-integration)
7. [API Reference](#api-reference)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

### Goals

The Oalacea Physics Engine (OPE) is a lightweight, grid-augmented physics system designed specifically for character navigation in 3D portfolio environments.

**Primary Goals:**
- Precise collision detection for objects of all sizes
- Smooth character movement with realistic kinematics
- Efficient pathfinding with sub-cell precision
- Minimal computational overhead
- Easy integration with existing React Three Fiber setup

**Non-Goals:**
- Full rigid body dynamics (use Rapier for complex physics)
- Vehicle simulation
- Cloth/soft body physics
- Multiplayer synchronization

### Why Custom Instead of Full Physics Engine?

| Aspect | Custom Engine | Full Engine (Rapier/Cannon) |
|--------|---------------|-----------------------------|
| **Bundle size** | ~5KB | ~200KB+ |
| **Small object collision** | Precision guaranteed | Grid issues remain |
| **Character control** | Tuned for portfolio | Generic, needs tuning |
| **Learning curve** | Designed for use case | Complex API |
| **Performance** | Optimized for needs | Overhead for unused features |

---

## Current Problems

### Problem 1: Grid Resolution Mismatch

```
Current: GRID_SIZE = 2m, Terminal radius = 0.91m

Grid cells (2x2m):
┌─────┬─────┬─────┬─────┐
│     │     │     │     │
├─────┼─────┼─────┼─────┤
│     │  T  │     │     │  ← Terminal only blocks 1 cell
├─────┼─────┼─────┼─────┘     (2x2m area)
│     │     │     │     │     Actual terminal: ~1.8m diameter
└─────┴─────┴─────┴─────┘     Player clips through corners
```

**Issue:** With `radiusInCells = Math.ceil(0.91 / 2) = 1`, only one cell is blocked, leaving gaps at corners.

### Problem 2: Single Hitbox Type

All objects use circle collision regardless of their actual shape.

**Consequences:**
- Square objects have inaccurate collision at corners
- Rectangular objects (walls, terminals) need oversized hitboxes
- Precision lost for non-circular geometry

### Problem 3: Binary Collision State

Current implementation marks grid cells as either `walkable` or `not walkable` with no intermediate states.

**Consequences:**
- No partial collision (can't get close to small objects)
- No interaction distance consideration
- Pathfinding creates artificial avoidance

### Problem 4: No Continuous Collision Detection

Character movement doesn't check collisions between grid cells, allowing tunneling through small objects.

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OALACEA PHYSICS ENGINE (v1.1)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SPATIAL HASH GRID (0.5m cells)            │   │
│  │  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐         │   │
│  │  │[0,0]│[1,0]│[2,0]│[3,0]│[4,0]│[5,0]│[6,0]│[7,0]│...     │   │
│  │  │objs:│objs:│objs:│objs:│objs:│objs:│objs:│objs:│         │   │
│  │  │[]   │[]   │[T]  │[T]  │[T]  │[T]  │[]   │[]   │         │   │
│  │  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤         │   │
│  │  │[0,1]│[1,1]│[2,1]│[3,1]│[4,1]│[5,1]│[6,1]│[7,1]│...     │   │
│  │  │objs:│objs:│objs:│objs:│objs:│objs:│objs:│objs:│         │   │
│  │  │[]   │[]   │[T]  │[T]  │[T]  │[T]  │[]   │[]   │         │   │
│  │  └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘         │   │
│  │  Terminal (2x1m box) spans 8 cells with precise shape         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  COLLISION DETECTOR                          │   │
│  │  - Dynamic hitbox system (circle, box, capsule, polygon)    │   │
│  │  - Shape-specific collision algorithms                      │   │
│  │  - SAT (Separating Axis Theorem) for boxes                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  CHARACTER CONTROLLER                        │   │
│  │  ┌───────────────┬───────────────┬──────────────────────┐    │   │
│  │  │   Input       │    Kinematics │   Collision Response │    │   │
│  │  │   Processor   │    Solver     │   (slide, push)      │    │   │
│  │  └───────────────┴───────────────┴──────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  PATHFINDING ADAPTER                         │   │
│  │  - Hybrid A* (0.5m grid + precise collision checks)          │   │
│  │  - Path smoothing with collision validation                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Core Modules

```typescript
// src/core/3d/physics/engine/index.ts

export * from './SpatialHashGrid';
export * from './CollisionDetector';
export * from './CharacterController';
export * from './PathfindingAdapter';
export * from './types';
```

### File Structure

```
src/core/3d/physics/
├── engine/
│   ├── index.ts                    # Public API exports
│   ├── types.ts                    # Core type definitions
│   ├── hitboxes/                   # Dynamic hitbox system
│   │   ├── index.ts
│   │   ├── HitboxShape.ts          # Base shape interface
│   │   ├── CircleHitbox.ts         # Circle collision
│   │   ├── BoxHitbox.ts            # AABB/OBB collision
│   │   ├── CapsuleHitbox.ts        # Capsule collision
│   │   └── PolygonHitbox.ts        # Convex polygon collision
│   ├── SpatialHashGrid.ts          # Spatial partitioning (0.5m cells)
│   ├── CollisionDetector.ts        # Collision queries
│   ├── CharacterController.ts      # Movement & physics
│   └── PathfindingAdapter.ts       # A* integration
├── config/
│   ├── PhysicsConfig.ts            # Engine constants
│   └── CollisionConfig.ts          # Collision profiles
└── utils/
    ├── VectorUtils.ts              # Vector math helpers
    ├── GeometryUtils.ts            # Shape calculations
    └── SAT.ts                      # Separating Axis Theorem implementation
```

---

## Collision System

### Dynamic Hitbox System

Instead of using circle collision for everything, obstacles can have different hitbox shapes matching their visual geometry.

```typescript
// src/core/3d/physics/engine/hitboxes/HitboxShape.ts

import { Vector3, Quaternion } from 'three';

export enum HitboxType {
  CIRCLE = 'circle',      // Round objects (pillars, columns)
  BOX = 'box',            // Rectangular objects (walls, terminals)
  CAPSULE = 'capsule',    // Tall rounded objects (doors, character)
  POLYGON = 'polygon',    // Complex shapes (L-shaped, irregular)
}

export interface HitboxShape {
  readonly type: HitboxType;

  /**
   * Get the bounding box for grid registration
   * Returns min/max bounds in world space
   */
  getBounds(): { min: Vector3; max: Vector3 };

  /**
   * Check collision with a circle (character)
   */
  collidesWithCircle(
    center: Vector3,
    radius: number
  ): { collided: boolean; normal: Vector3; penetration: number };

  /**
   * Get the point on the shape closest to a given position
   * Used for collision response
   */
  getClosestPoint(position: Vector3): Vector3;
}
```

### Circle Hitbox

For round objects like pillars, columns, and rotundas.

```typescript
// src/core/3d/physics/engine/hitboxes/CircleHitbox.ts

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
    const distance = Math.sqrt(dx * dx + dz * dz);
    const minDistance = radius + this.radius;

    if (distance < minDistance) {
      const normal = new Vector3(dx, 0, dz).normalize();
      const penetration = minDistance - distance;
      return { collided: true, normal, penetration };
    }

    return { collided: false, normal: new Vector3(), penetration: 0 };
  }

  getClosestPoint(position: Vector3): Vector3 {
    const direction = position.clone().sub(this.center).normalize();
    return this.center.clone().add(direction.multiplyScalar(this.radius));
  }
}
```

### Box Hitbox (AABB/OBB)

For rectangular objects like walls, terminals, and buildings.

```typescript
// src/core/3d/physics/engine/hitboxes/BoxHitbox.ts

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
  private getCorners(): Vector3[] {
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
   * SAT (Separating Axis Theorem) collision detection
   * Works for both AABB and OBB
   */
  collidesWithCircle(circleCenter: Vector3, circleRadius: number) {
    // Transform circle center to box local space
    const localCircleCenter = circleCenter.clone().sub(this.center);
    const inverseQuat = this.quaternion.clone().invert();
    localCircleCenter.applyQuaternion(inverseQuat);

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

    // Transform closest point back to world space
    const closestWorld = closestLocal.clone().applyQuaternion(this.quaternion).add(this.center);

    // Distance from circle center to closest point
    const distance = circleCenter.distanceTo(closestWorld);

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
        normal = localNormal.applyQuaternion(this.quaternion);
      } else {
        normal = circleCenter.clone().sub(closestWorld).normalize();
      }

      const penetration = circleRadius - distance;
      return { collided: true, normal, penetration: isInside ? circleRadius + distance : penetration };
    }

    return { collided: false, normal: new Vector3(), penetration: 0 };
  }

  getClosestPoint(position: Vector3): Vector3 {
    // Transform position to box local space
    const localPos = position.clone().sub(this.center);
    const inverseQuat = this.quaternion.clone().invert();
    localPos.applyQuaternion(inverseQuat);

    // Clamp to box bounds
    const closestLocal = new Vector3(
      Math.max(-this.halfSize.x, Math.min(this.halfSize.x, localPos.x)),
      Math.max(-this.halfSize.y, Math.min(this.halfSize.y, localPos.y)),
      Math.max(-this.halfSize.z, Math.min(this.halfSize.z, localPos.z))
    );

    // Transform back to world space
    return closestLocal.applyQuaternion(this.quaternion).add(this.center);
  }
}
```

### Capsule Hitbox

For tall objects with rounded tops like doors and the character.

```typescript
// src/core/3d/physics/engine/hitboxes/CapsuleHitbox.ts

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
  readonly halfHeight: number;  // Cylinder half-height
  readonly rotation: number;

  constructor(config: CapsuleHitboxConfig) {
    this.center = config.center.clone();
    this.radius = config.radius;
    this.height = config.height;
    this.halfHeight = (config.height - 2 * config.radius) / 2;
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
    // Project circle center onto capsule's vertical axis
    // Since we're doing 2D collision on XZ plane, treat as circle
    const dx = center.x - this.center.x;
    const dz = center.z - this.center.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const minDistance = radius + this.radius;

    if (distance < minDistance) {
      const normal = new Vector3(dx, 0, dz).normalize();
      const penetration = minDistance - distance;
      return { collided: true, normal, penetration };
    }

    return { collided: false, normal: new Vector3(), penetration: 0 };
  }

  getClosestPoint(position: Vector3): Vector3 {
    const direction = position.clone().sub(this.center);
    direction.y = 0;  // Flatten to XZ plane
    direction.normalize().multiplyScalar(this.radius);
    return this.center.clone().add(direction);
  }
}
```

### Spatial Hash Grid (Updated)

Now with 0.5m cells and hitbox shape support:

```typescript
// src/core/3d/physics/engine/SpatialHashGrid.ts

import { Vector3 } from 'three';
import type { HitboxShape } from './hitboxes/HitboxShape';

export interface Obstacle {
  id: string;
  hitbox: HitboxShape;
  type: 'static' | 'dynamic' | 'trigger';
  interactionDistance?: number;
  name?: string;
}

export interface GridCell {
  x: number;
  z: number;
  obstacles: Map<string, Obstacle>;
  cachedWalkable: boolean;
  cachedCost: number;
}

export class SpatialHashGrid {
  // Ultra-fine 0.5m cells for sub-meter precision
  private readonly CELL_SIZE: number = 0.5;
  private readonly WORLD_MIN: number = -50;
  private readonly WORLD_MAX: number = 50;
  private readonly grid: Map<string, GridCell>;
  private readonly obstacles: Map<string, Obstacle>;
  private readonly cols: number;
  private readonly rows: number;

  constructor() {
    this.cols = Math.ceil((this.WORLD_MAX - this.WORLD_MIN) / this.CELL_SIZE);
    this.rows = Math.ceil((this.WORLD_MAX - this.WORLD_MIN) / this.CELL_SIZE);
    this.grid = new Map();
    this.obstacles = new Map();
    this.initializeGrid();
  }

  private initializeGrid(): void {
    for (let x = 0; x < this.cols; x++) {
      for (let z = 0; z < this.rows; z++) {
        this.grid.set(this.getCellKey(x, z), {
          x, z,
          obstacles: new Map(),
          cachedWalkable: true,
          cachedCost: 1,
        });
      }
    }
  }

  private getCellKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  private worldToCell(worldPos: number): number {
    return Math.floor((worldPos - this.WORLD_MIN) / this.CELL_SIZE);
  }

  private cellToWorld(cellX: number): number {
    return this.WORLD_MIN + cellX * this.CELL_SIZE + this.CELL_SIZE / 2;
  }

  /**
   * Add an obstacle with its hitbox shape
   */
  addObstacle(obstacle: Obstacle): void {
    this.obstacles.set(obstacle.id, obstacle);

    // Get bounding box for grid registration
    const bounds = obstacle.hitbox.getBounds();

    // Calculate cell range from bounding box
    const minCellX = this.worldToCell(bounds.min.x);
    const minCellZ = this.worldToCell(bounds.min.z);
    const maxCellX = this.worldToCell(bounds.max.x);
    const maxCellZ = this.worldToCell(bounds.max.z);

    // Mark all cells this obstacle touches
    for (let x = minCellX; x <= maxCellX; x++) {
      for (let z = minCellZ; z <= maxCellZ; z++) {
        const key = this.getCellKey(x, z);
        const cell = this.grid.get(key);

        if (cell) {
          cell.obstacles.set(obstacle.id, obstacle);
          cell.cachedWalkable = false;
        }
      }
    }
  }

  /**
   * Remove an obstacle from the grid
   */
  removeObstacle(id: string): void {
    const obstacle = this.obstacles.get(id);
    if (!obstacle) return;

    const bounds = obstacle.hitbox.getBounds();
    const minCellX = this.worldToCell(bounds.min.x);
    const minCellZ = this.worldToCell(bounds.min.z);
    const maxCellX = this.worldToCell(bounds.max.x);
    const maxCellZ = this.worldToCell(bounds.max.z);

    for (let x = minCellX; x <= maxCellX; x++) {
      for (let z = minCellZ; z <= maxCellZ; z++) {
        const key = this.getCellKey(x, z);
        const cell = this.grid.get(key);

        if (cell) {
          cell.obstacles.delete(id);
          cell.cachedWalkable = this.calculateCellWalkable(cell);
        }
      }
    }

    this.obstacles.delete(id);
  }

  /**
   * Get all obstacles near a position
   * Uses cell lookup for O(1) access
   */
  getNearbyObstacles(position: Vector3, searchRadius: number): Obstacle[] {
    const cellX = this.worldToCell(position.x);
    const cellZ = this.worldToCell(position.z);
    const radiusInCells = Math.ceil(searchRadius / this.CELL_SIZE);
    const nearby = new Set<Obstacle>();

    for (let dx = -radiusInCells; dx <= radiusInCells; dx++) {
      for (let dz = -radiusInCells; dz <= radiusInCells; dz++) {
        const key = this.getCellKey(cellX + dx, cellZ + dz);
        const cell = this.grid.get(key);

        if (cell) {
          for (const obstacle of cell.obstacles.values()) {
            nearby.add(obstacle);
          }
        }
      }
    }

    return Array.from(nearby);
  }

  /**
   * Get cell walkable state for pathfinding
   */
  isCellWalkable(cellX: number, cellZ: number): boolean {
    const key = this.getCellKey(cellX, cellZ);
    const cell = this.grid.get(key);

    if (!cell) return false;

    if (!cell.cachedWalkable) {
      cell.cachedWalkable = this.calculateCellWalkable(cell);
    }

    return cell.cachedWalkable;
  }

  private calculateCellWalkable(cell: GridCell): boolean {
    for (const obstacle of cell.obstacles.values()) {
      if (obstacle.type !== 'trigger') {
        return false;
      }
    }
    return true;
  }

  getObstacle(id: string): Obstacle | undefined {
    return this.obstacles.get(id);
  }

  getAllObstacles(): Obstacle[] {
    return Array.from(this.obstacles.values());
  }
}
```

---

## Kinematics & Dynamics

### Character Movement Model

Uses physics-based movement with acceleration, friction, and velocity damping:

```typescript
// src/core/3d/physics/engine/CharacterController.ts

import { Vector3 } from 'three';
import type { CollisionDetector } from './CollisionDetector';
import type { SpatialHashGrid } from './SpatialHashGrid';

export interface CharacterInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  jump: boolean;
}

export interface KinematicState {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  rotation: number;
  isGrounded: boolean;
}

export class CharacterController {
  private readonly collisionDetector: CollisionDetector;
  private state: KinematicState;

  // Physics parameters
  private readonly config = {
    // Movement speeds
    walkSpeed: 6.0,
    runSpeed: 12.0,
    rotationSpeed: 10.0,

    // Physics
    acceleration: 30.0,
    deceleration: 20.0,
    friction: 8.0,

    // Jump
    jumpForce: 8.0,
    gravity: -20.0,

    // Collision
    characterRadius: 0.5,
    stepHeight: 0.3,
  };

  constructor(
    collisionDetector: CollisionDetector,
    startPosition: Vector3 = new Vector3(0, 0.5, 0)
  ) {
    this.collisionDetector = collisionDetector;
    this.state = {
      position: startPosition.clone(),
      velocity: new Vector3(),
      acceleration: new Vector3(),
      rotation: 0,
      isGrounded: true,
    };
  }

  /**
   * Update character physics
   * Call this every frame with delta time
   */
  update(input: CharacterInput, deltaTime: number): void {
    // 1. Calculate target velocity from input
    const targetVelocity = this.calculateTargetVelocity(input);

    // 2. Apply acceleration/deceleration
    this.applyAcceleration(targetVelocity, deltaTime);

    // 3. Apply friction
    this.applyFriction(deltaTime);

    // 4. Calculate tentative new position
    const tentativePos = this.state.position.clone().add(
      this.state.velocity.clone().multiplyScalar(deltaTime)
    );

    // 5. Check and resolve collisions
    const finalPos = this.resolveMovement(tentativePos);

    // 6. Update state
    this.state.position.copy(finalPos);

    // 7. Update rotation
    this.updateRotation(input, deltaTime);

    // 8. Handle gravity and ground check
    this.updateVertical(input, deltaTime);
  }

  private calculateTargetVelocity(input: CharacterInput): Vector3 {
    const speed = input.sprint ? this.config.runSpeed : this.config.walkSpeed;
    const target = new Vector3();

    if (input.forward) target.z -= 1;
    if (input.backward) target.z += 1;
    if (input.left) target.x -= 1;
    if (input.right) target.x += 1;

    if (target.length() > 0) {
      target.normalize().multiplyScalar(speed);
    }

    return target;
  }

  private applyAcceleration(targetVelocity: Vector3, deltaTime: number): void {
    const accel = this.config.acceleration;
    const decel = this.config.deceleration;

    // Horizontal only (y is handled separately)
    if (targetVelocity.length() > 0) {
      // Accelerate towards target
      this.state.acceleration.x = (targetVelocity.x - this.state.velocity.x) * accel;
      this.state.acceleration.z = (targetVelocity.z - this.state.velocity.z) * accel;
    } else {
      // Decelerate (no input)
      this.state.acceleration.x = -this.state.velocity.x * decel;
      this.state.acceleration.z = -this.state.velocity.z * decel;
    }

    // Apply acceleration to velocity
    this.state.velocity.x += this.state.acceleration.x * deltaTime;
    this.state.velocity.z += this.state.acceleration.z * deltaTime;
  }

  private applyFriction(deltaTime: number): void {
    // Apply damping when velocity is low
    const friction = this.config.friction;

    if (Math.abs(this.state.velocity.x) < 0.1) {
      this.state.velocity.x = 0;
    } else {
      this.state.velocity.x *= Math.pow(1 - friction * deltaTime, 1);
    }

    if (Math.abs(this.state.velocity.z) < 0.1) {
      this.state.velocity.z = 0;
    } else {
      this.state.velocity.z *= Math.pow(1 - friction * deltaTime, 1);
    }
  }

  private resolveMovement(tentativePos: Vector3): Vector3 {
    // Horizontal collision (x, z)
    const collision = this.collisionDetector.checkCollision(
      tentativePos,
      this.config.characterRadius
    );

    if (collision.collided) {
      // Slide along collision surface
      const normal = collision.normal;
      const penetration = collision.penetration;

      // Push out of collision
      tentativePos.add(normal.clone().multiplyScalar(penetration));

      // Project velocity onto collision plane
      const dot = this.state.velocity.dot(normal);
      this.state.velocity.sub(normal.clone().multiplyScalar(dot));

      // Apply some bounce dampening
      this.state.velocity.multiplyScalar(0.5);
    }

    return tentativePos;
  }

  private updateRotation(input: CharacterInput, deltaTime: number): void {
    if (input.forward || input.backward || input.left || input.right) {
      const targetRotation = Math.atan2(
        this.state.velocity.x,
        this.state.velocity.z
      );

      // Smooth rotation
      const rotDiff = targetRotation - this.state.rotation;
      const normalizedDiff = ((rotDiff + Math.PI) % (2 * Math.PI)) - Math.PI;

      this.state.rotation += normalizedDiff * this.config.rotationSpeed * deltaTime;
    }
  }

  private updateVertical(input: CharacterInput, deltaTime: number): void {
    // Apply gravity
    this.state.velocity.y += this.config.gravity * deltaTime;

    // Jump
    if (input.jump && this.state.isGrounded) {
      this.state.velocity.y = this.config.jumpForce;
      this.state.isGrounded = false;
    }

    // Ground check
    if (this.state.position.y <= 0.5) {
      this.state.position.y = 0.5;
      this.state.velocity.y = 0;
      this.state.isGrounded = true;
    }

    this.state.position.y += this.state.velocity.y * deltaTime;
  }

  getState(): Readonly<KinematicState> {
    return this.state;
  }

  setPosition(pos: Vector3): void {
    this.state.position.copy(pos);
    this.state.velocity.set(0, 0, 0);
  }
}
```

### Configuration Profiles

```typescript
// src/core/3d/physics/config/PhysicsConfig.ts

export interface PhysicsProfile {
  character: {
    radius: number;
    height: number;
    mass: number;
  };
  movement: {
    walkSpeed: number;
    runSpeed: number;
    acceleration: number;
    deceleration: number;
    rotationSpeed: number;
  };
  physics: {
    friction: number;
    gravity: number;
    jumpForce: number;
    airControl: number;
  };
  collision: {
    pushForce: number;
    maxSlope: number;
    stepHeight: number;
  };
}

export const PROFILES: Record<string, PhysicsProfile> = {
  default: {
    character: { radius: 0.5, height: 1.8, mass: 70 },
    movement: {
      walkSpeed: 6,
      runSpeed: 12,
      acceleration: 30,
      deceleration: 20,
      rotationSpeed: 10,
    },
    physics: {
      friction: 8,
      gravity: -20,
      jumpForce: 8,
      airControl: 0.3,
    },
    collision: {
      pushForce: 50,
      maxSlope: 45,
      stepHeight: 0.3,
    },
  },
  heavy: {
    character: { radius: 0.6, height: 2.0, mass: 100 },
    movement: {
      walkSpeed: 4,
      runSpeed: 8,
      acceleration: 20,
      deceleration: 15,
      rotationSpeed: 6,
    },
    physics: {
      friction: 10,
      gravity: -25,
      jumpForce: 6,
      airControl: 0.2,
    },
    collision: {
      pushForce: 100,
      maxSlope: 30,
      stepHeight: 0.2,
    },
  },
  light: {
    character: { radius: 0.4, height: 1.6, mass: 50 },
    movement: {
      walkSpeed: 8,
      runSpeed: 16,
      acceleration: 40,
      deceleration: 25,
      rotationSpeed: 14,
    },
    physics: {
      friction: 6,
      gravity: -18,
      jumpForce: 10,
      airControl: 0.5,
    },
    collision: {
      pushForce: 30,
      maxSlope: 50,
      stepHeight: 0.4,
    },
  },
};
```

---

## Pathfinding Integration

### Hybrid A* with Sub-Cell Precision

Combines grid-based pathfinding with precise collision validation:

```typescript
// src/core/3d/physics/engine/PathfindingAdapter.ts

import { Vector3 } from 'three';
import type { SpatialHashGrid } from './SpatialHashGrid';
import type { CollisionDetector } from './CollisionDetector';

export interface PathNode {
  position: Vector3;
  g: number;  // Cost from start
  h: number;  // Heuristic to end
  f: number;  // Total cost
  parent: PathNode | null;
}

export class PathfindingAdapter {
  private readonly spatialGrid: SpatialHashGrid;
  private readonly collisionDetector: CollisionDetector;
  private readonly CELL_SIZE = 0.5;  // Ultra-fine 0.5m cells
  private readonly WORLD_MIN = -50;
  private readonly WORLD_MAX = 50;

  constructor(
    spatialGrid: SpatialHashGrid,
    collisionDetector: CollisionDetector
  ) {
    this.spatialGrid = spatialGrid;
    this.collisionDetector = collisionDetector;
  }

  /**
   * Find path from start to end using hybrid A*
   * Uses grid for high-level planning, precise collision for validation
   */
  findPath(start: Vector3, end: Vector3, characterRadius: number = 0.5): Vector3[] {
    // 1. Check if direct path is clear (line of sight)
    if (this.hasLineOfSight(start, end, characterRadius)) {
      return [end];
    }

    // 2. Find nearest valid grid cells
    const startCell = this.worldToCell(start);
    const endCell = this.worldToCell(end);

    // 3. Run A* on grid
    const gridPath = this.findGridPath(startCell, endCell, characterRadius);

    if (gridPath.length === 0) {
      return [end]; // No path found, return direct
    }

    // 4. Convert grid path to world positions with offset
    const worldPath = this.gridToWorld(gridPath);

    // 5. Add exact start position
    worldPath.unshift(start.clone());

    // 6. Ensure end position is reachable
    const lastPoint = worldPath[worldPath.length - 1];
    if (!this.isPositionValid(end, characterRadius)) {
      // Find nearest valid position to end
      const nearest = this.findNearestValid(end, characterRadius);
      worldPath.push(nearest);
    } else {
      worldPath.push(end.clone());
    }

    // 7. Smooth path (remove unnecessary waypoints)
    return this.smoothPath(worldPath, characterRadius);
  }

  /**
   * A* pathfinding on grid with walkability check
   */
  private findGridPath(
    start: { x: number; z: number },
    end: { x: number; z: number },
    radius: number
  ): { x: number; z: number }[] {
    const openSet: PathNode[] = [{
      position: new Vector3(start.x, 0, start.z),
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
      parent: null,
    }];
    openSet[0].f = openSet[0].g + openSet[0].h;

    const closedSet = new Set<string>();

    while (openSet.length > 0) {
      // Get node with lowest f
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const currentKey = `${current.position.x},${current.position.z}`;

      // Check if reached goal
      if (Math.abs(current.position.x - end.x) < 0.5 &&
          Math.abs(current.position.z - end.z) < 0.5) {
        return this.reconstructPath(current);
      }

      closedSet.add(currentKey);

      // Check neighbors (8-directional)
      for (const neighbor of this.getNeighbors(current.position.x, current.position.z)) {
        const neighborKey = `${neighbor.x},${neighbor.z}`;

        if (closedSet.has(neighborKey)) continue;

        // Check walkability with precise collision
        const worldPos = this.cellToWorld(neighbor.x, neighbor.z);
        const collision = this.collisionDetector.checkCollision(worldPos, radius);

        if (collision.collided) continue;

        // Calculate costs
        const tentativeG = current.g + this.distance(
          { x: current.position.x, z: current.position.z },
          neighbor
        );

        const existing = openSet.find(n =>
          Math.abs(n.position.x - neighbor.x) < 0.5 &&
          Math.abs(n.position.z - neighbor.z) < 0.5
        );

        if (!existing) {
          const h = this.heuristic(neighbor, end);
          openSet.push({
            position: new Vector3(neighbor.x, 0, neighbor.z),
            g: tentativeG,
            h,
            f: tentativeG + h,
            parent: current,
          });
        } else if (tentativeG < existing.g) {
          existing.g = tentativeG;
          existing.f = tentativeG + existing.h;
          existing.parent = current;
        }
      }
    }

    return []; // No path found
  }

  private getNeighbors(x: number, z: number): { x: number; z: number }[] {
    const neighbors: { x: number; z: number }[] = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],  // Cardinal
      [-1, -1], [-1, 1], [1, -1], [1, 1], // Diagonal
    ];

    for (const [dx, dz] of directions) {
      const nx = x + dx;
      const nz = z + dz;

      if (nx >= 0 && nx < 100 && nz >= 0 && nz < 100) {
        neighbors.push({ x: nx, z: nz });
      }
    }

    return neighbors;
  }

  private heuristic(a: { x: number; z: number }, b: { x: number; z: number }): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.z - b.z, 2));
  }

  private distance(a: { x: number; z: number }, b: { x: number; z: number }): number {
    const dx = Math.abs(a.x - b.x);
    const dz = Math.abs(a.z - b.z);
    return dx === 1 && dz === 1 ? 1.414 : 1;
  }

  private reconstructPath(endNode: PathNode): { x: number; z: number }[] {
    const path: { x: number; z: number }[] = [];
    let current: PathNode | null = endNode;

    while (current) {
      path.unshift({ x: current.position.x, z: current.position.z });
      current = current.parent;
    }

    return path;
  }

  private cellToWorld(x: number, z: number): Vector3 {
    return new Vector3(
      this.WORLD_MIN + x * this.CELL_SIZE + this.CELL_SIZE / 2,
      0.5,
      this.WORLD_MIN + z * this.CELL_SIZE + this.CELL_SIZE / 2
    );
  }

  private worldToCell(pos: Vector3): { x: number; z: number } {
    return {
      x: Math.floor((pos.x - this.WORLD_MIN) / this.CELL_SIZE),
      z: Math.floor((pos.z - this.WORLD_MIN) / this.CELL_SIZE),
    };
  }

  private gridToWorld(gridPath: { x: number; z: number }[]): Vector3[] {
    return gridPath.map(p => this.cellToWorld(p.x, p.z));
  }

  /**
   * Check if there's a clear line of sight between two points
   */
  private hasLineOfSight(from: Vector3, to: Vector3, radius: number): boolean {
    const distance = from.distanceTo(to);
    const steps = Math.ceil(distance / 0.2); // Check every 20cm
    const direction = to.clone().sub(from).normalize();

    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const checkPos = from.clone().add(direction.clone().multiplyScalar(distance * t));

      const collision = this.collisionDetector.checkCollision(checkPos, radius);
      if (collision.collided) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a position is valid (no collisions)
   */
  private isPositionValid(pos: Vector3, radius: number): boolean {
    const collision = this.collisionDetector.checkCollision(pos, radius);
    return !collision.collided;
  }

  /**
   * Find nearest valid position to target
   */
  private findNearestValid(target: Vector3, radius: number): Vector3 {
    const maxRadius = 5;
    const step = 0.5;

    for (let r = step; r <= maxRadius; r += step) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
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
   * Smooth path by removing unnecessary waypoints
   */
  private smoothPath(path: Vector3[], radius: number): Vector3[] {
    if (path.length <= 2) return path;

    const smoothed: Vector3[] = [path[0]];
    let currentIndex = 0;

    while (currentIndex < path.length - 1) {
      let farthestIndex = currentIndex + 1;

      for (let i = currentIndex + 2; i < path.length; i++) {
        if (this.hasLineOfSight(path[currentIndex], path[i], radius)) {
          farthestIndex = i;
        } else {
          break;
        }
      }

      smoothed.push(path[farthestIndex]);
      currentIndex = farthestIndex;
    }

    return smoothed;
  }
}
```

---

## API Reference

### Core API

```typescript
// src/core/3d/physics/engine/index.ts

export { SpatialHashGrid } from './SpatialHashGrid';
export { CollisionDetector } from './CollisionDetector';
export { CharacterController } from './CharacterController';
export { PathfindingAdapter } from './PathfindingAdapter';

export type { Obstacle, GridCell } from './SpatialHashGrid';
export type { CollisionResult } from './CollisionDetector';
export type { CharacterInput, KinematicState } from './CharacterController';
export type { PathNode } from './PathfindingAdapter';

// Main physics engine class
export class PhysicsEngine {
  private spatialGrid: SpatialHashGrid;
  private collisionDetector: CollisionDetector;
  private pathfinding: PathfindingAdapter;
  private characterController?: CharacterController;

  constructor(config?: Partial<PhysicsConfig>) {
    this.spatialGrid = new SpatialHashGrid(config?.gridSize);
    this.collisionDetector = new CollisionDetector(this.spatialGrid);
    this.pathfinding = new PathfindingAdapter(this.spatialGrid, this.collisionDetector);
  }

  // Obstacle management
  addObstacle(obstacle: Obstacle): void;
  removeObstacle(id: string): void;
  updateObstacle(id: string, updates: Partial<Obstacle>): void;
  getObstacles(): Obstacle[];

  // Collision queries
  checkCollision(position: Vector3, radius?: number): CollisionResult;
  raycast(from: Vector3, to: Vector3, radius?: number): CollisionResult;
  hasLineOfSight(from: Vector3, to: Vector3, radius?: number): boolean;

  // Pathfinding
  findPath(from: Vector3, to: Vector3, radius?: number): Vector3[];

  // Character control
  createCharacterController(startPos?: Vector3): CharacterController;
}
```

### React Hook Integration

```typescript
// src/hooks/usePhysicsEngine.ts

'use client';

import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { PhysicsEngine } from '@/core/3d/physics/engine';
import { CircleHitbox, BoxHitbox } from '@/core/3d/physics/engine/hitboxes';
import type { CollisionZone } from '@/core/3d/scenes/collisions';

export function usePhysicsEngine(collisionZones: CollisionZone[]) {
  const engineRef = useRef<PhysicsEngine>();

  useEffect(() => {
    // Initialize engine with 0.5m cells
    engineRef.current = new PhysicsEngine({
      cellSize: 0.5,  // Ultra-fine precision
      worldBounds: { min: -50, max: 50 },
    });

    // Convert collision zones to obstacles with dynamic hitboxes
    collisionZones.forEach(zone => {
      let hitbox;

      // Choose hitbox based on zone name/shape
      if (zone.name?.toLowerCase().includes('pillar') ||
          zone.name?.toLowerCase().includes('pilier')) {
        // Round objects get circle hitbox
        hitbox = new CircleHitbox({
          center: new Vector3(...zone.position),
          radius: zone.radius,
        });
      } else {
        // Default to box for rectangular objects (terminals, walls)
        hitbox = new BoxHitbox({
          center: new Vector3(...zone.position),
          size: [zone.radius * 2, 2, zone.radius * 2],  // Approximate from radius
        });
      }

      const obstacle = {
        id: zone.id,
        hitbox,
        type: 'static' as const,
        name: zone.name,
      };

      engineRef.current!.addObstacle(obstacle);
    });

    return () => {
      engineRef.current = undefined;
    };
  }, [collisionZones]);

  return engineRef.current;
}

// Character controller hook
export function useCharacterController(engine: PhysicsEngine | undefined) {
  const controllerRef = useRef<ReturnType<Non<typeof PhysicsEngine.prototype.createCharacterController>>>();

  useEffect(() => {
    if (engine) {
      controllerRef.current = engine.createCharacterController();
    }
  }, [engine]);

  return controllerRef.current;
}
```

### React Component Usage

```typescript
// src/core/3d/character/CharacterPhysics.tsx

'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import { Vector3 } from 'three';
import { usePhysicsEngine } from '@/hooks/usePhysicsEngine';
import { useCharacterInputs } from '@/hooks/useCharacterInputs';
import { useCharacterStore } from '@/store/3d-character-store';

interface CharacterPhysicsProps {
  collisionZones: CollisionZone[];
}

export function CharacterPhysics({ collisionZones }: CharacterPhysicsProps) {
  const engine = usePhysicsEngine(collisionZones);
  const inputs = useCharacterInputs();
  const setPosition = useCharacterStore(s => s.setPosition);

  const lastPositionRef = useRef(new Vector3(0, 0.5, 0));

  useFrame((_, delta) => {
    if (!engine) return;

    const controller = engine.getCharacterController();
    if (!controller) return;

    // Update physics
    controller.update(inputs, delta);

    // Get new position
    const state = controller.getState();
    const newPos = state.position;

    // Check if position changed significantly
    if (newPos.distanceTo(lastPositionRef.current) > 0.1) {
      lastPositionRef.current.copy(newPos);
      setPosition([newPos.x, newPos.y, newPos.z]);
    }
  });

  return null; // This is a logical component, no rendering
}
```

---

## Implementation Roadmap

### Phase 1: Core Collision (Week 1)

| Task | Description | Files | Estimate |
|------|-------------|-------|----------|
| 1.1 | Create type definitions | `types.ts` | 2h |
| 1.2 | Implement SpatialHashGrid | `SpatialHashGrid.ts` | 4h |
| 1.3 | Implement CollisionDetector | `CollisionDetector.ts` | 3h |
| 1.4 | Unit tests for collision | `*.test.ts` | 3h |

**Deliverable:** Working collision detection system

### Phase 2: Character Controller (Week 2)

| Task | Description | Files | Estimate |
|------|-------------|-------|----------|
| 2.1 | Implement kinematics | `CharacterController.ts` | 4h |
| 2.2 | Add physics profiles | `PhysicsConfig.ts` | 2h |
| 2.3 | React integration hooks | `usePhysicsEngine.ts` | 3h |
| 2.4 | Test character movement | `CharacterPhysics.tsx` | 2h |

**Deliverable:** Character with smooth movement and collision response

### Phase 3: Pathfinding (Week 3)

| Task | Description | Files | Estimate |
|------|-------------|-------|----------|
| 3.1 | Implement A* algorithm | `PathfindingAdapter.ts` | 4h |
| 3.2 | Add path smoothing | `PathfindingAdapter.ts` | 2h |
| 3.3 | Integrate with click-to-move | `CharacterControls.ts` | 3h |
| 3.4 | Optimize for performance | All files | 2h |

**Deliverable:** Click-to-move with precise collision avoidance

### Phase 4: Integration & Polish (Week 4)

| Task | Description | Files | Estimate |
|------|-------------|-------|----------|
| 4.1 | Replace old collision system | `collisions.ts` | 3h |
| 4.2 | Update terminal collisions | `dev.ts`, `art.ts` | 1h |
| 4.3 | Performance optimization | All files | 3h |
| 4.4 | Documentation | `README.md` | 2h |
| 4.5 | Testing & bugfix | All files | 4h |

**Deliverable:** Complete physics engine integrated into the project

### Migration Checklist

- [ ] Backup existing collision system
- [ ] Install new physics engine files
- [ ] Update collision zone definitions
- [ ] Replace CharacterControls with new system
- [ ] Test terminal collisions (radius 0.91 should work)
- [ ] Test character movement smoothness
- [ ] Test pathfinding precision
- [ ] Performance testing (60fps target)
- [ ] Remove old system if migration successful
- [ ] Update documentation

---

## Configuration Examples

### Obstacle Creation with Dynamic Hitboxes

```typescript
import { Vector3 } from 'three';
import { CircleHitbox, BoxHitbox, CapsuleHitbox } from '@/core/3d/physics/engine/hitboxes';

// Terminal - Box hitbox for precise rectangular collision
const terminalObstacle = {
  id: 'terminal-1',
  hitbox: new BoxHitbox({
    center: new Vector3(-12, 0, -8),
    size: [2, 1, 1],  // Exact visual dimensions
    rotation: Math.PI / 4,  // 45 degrees
  }),
  type: 'static' as const,
  interactionDistance: 1.5,
};

// Pillar - Circle hitbox for round objects
const pillarObstacle = {
  id: 'pillar-1',
  hitbox: new CircleHitbox({
    center: new Vector3(25, 0, 0),
    radius: 2.0,  // Exact pillar radius
  }),
  type: 'static' as const,
};

// Doorway - Capsule hitbox for tall walk-through areas
const doorObstacle = {
  id: 'door-1',
  hitbox: new CapsuleHitbox({
    center: new Vector3(0, 1, 10),
    radius: 0.6,
    height: 2.5,
  }),
  type: 'static' as const,
};

// Character (for self-collision)
const characterObstacle = {
  id: 'character',
  hitbox: new CapsuleHitbox({
    center: new Vector3(0, 0.9, 0),
    radius: 0.4,
    height: 1.8,
  }),
  type: 'dynamic' as const,
};
```

### Hitbox Selection Guide

| Object Type | Recommended Hitbox | Why |
|-------------|-------------------|-----|
| **Terminal** | Box | Rectangular shape, needs precise corners |
| **Pillar/Column** | Circle | Perfect for round geometry |
| **Wall/Barrier** | Box | Rectangular, can be rotated |
| **Door/Archway** | Capsule | Tall with walk-through area |
| **Character** | Capsule | Humanoid shape, smooth corner sliding |
| **L-shaped object** | Polygon | Complex geometry (future) |

### Grid Cell Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│  GRID SIZE COMPARISON                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  2m cells (OLD):           1m cells:            0.5m cells (NEW):│
│  ┌─────────┐             ┌───┬───┐           ┌─┬─┬─┬─┐         │
│  │         │             │   │   │           │ │ │ │ │         │
│  │   [T]   │             │ [ │T] │           │[│T│]│         │
│  │         │             │   │   │           │ │ │ │ │         │
│  └─────────┘             └───┴───┘           └─┴─┴─┴─┘         │
│   1 cell = 4m²            1 cell = 1m²        1 cell = 0.25m²   │
│   Terminal: inaccurate    Terminal: ok        Terminal: precise │
│                                                                 │
│  0.5m cells: Terminal (2x1m) spans 8 cells                     │
│  ┌─┬─┬─┬─┐                                                      │
│  │[│T│]│ ← Can walk closer to exact edge                      │
│  └─┴─┴─┴─┘                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Character Configuration

```typescript
// Fast, agile character (for exploration)
const agileProfile = {
  character: { radius: 0.4, height: 1.6, mass: 50 },
  movement: { walkSpeed: 8, runSpeed: 16, acceleration: 40, ... },
  // ... Character feels responsive and light
};

// Heavy, deliberate character (for "heavy" feel)
const heavyProfile = {
  character: { radius: 0.6, height: 2.0, mass: 100 },
  movement: { walkSpeed: 4, runSpeed: 8, acceleration: 20, ... },
  // ... Character feels weighty and grounded
};
```

---

## Performance Considerations

### Optimization Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Frame time | < 1ms | Physics shouldn't impact rendering |
| Pathfinding | < 8ms | A* with 0.5m cells (more cells = more processing) |
| Collision queries | O(1) average | Spatial hash grid |
| Memory | < 2MB | 0.5m cells = 4x more grid cells than 1m |

### Grid Size Impact

```
┌─────────────────────────────────────────────────────────────────┐
│  GRID SIZE ANALYSIS (100x100m world)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Cell Size    Total Cells    Memory    Precision                │
│  ────────────────────────────────────────────────────────────  │
│  2.0m         2,500          ~100KB    Low (terminal issues)    │
│  1.0m         10,000         ~400KB    Medium                   │
│  0.5m         40,000         ~1.6MB    High (recommended)       │
│  0.25m        160,000        ~6.4MB    Ultra (overkill)         │
│                                                                 │
│  Trade-off: 0.5m cells give 4x precision of 1m cells          │
│              with only 4x memory cost (still < 2MB)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Optimization Strategies

1. **Spatial Partitioning**: O(1) obstacle lookup
2. **Lazy Grid Updates**: Only recalculate when obstacles change
3. **Object Pooling**: Reuse Vector3 objects
4. **Path Caching**: Cache common paths
5. **LOD Pathfinding**: Use coarse grid for long paths

---

## Glossary

| Term | Definition |
|------|------------|
| **Spatial Hash Grid** | Grid-based spatial partitioning for efficient collision queries |
| **Dynamic Hitbox** | Hitbox shape that matches object geometry (circle, box, capsule, polygon) |
| **Circle Hitbox** | Round collision shape for pillars, columns |
| **Box Hitbox (AABB/OBB)** | Rectangular collision with optional rotation |
| **Capsule Hitbox** | Cylinder with rounded ends, for characters and doorways |
| **SAT (Separating Axis Theorem)** | Algorithm for detecting collision between convex shapes |
| **Continuous Collision Detection** | Collision checks at intermediate positions during movement |
| **Sub-cell Precision** | Collision accuracy finer than grid cell size |
| **A* (A-Star)** | Pathfinding algorithm using heuristics |
| **Path Smoothing** | Removing unnecessary waypoints from a path |
| **Kinematics** | Motion without considering forces (position, velocity, acceleration) |
| **Collision Normal** | Direction vector perpendicular to collision surface |
| **Penetration Depth** | How far one object has entered another |

---

**Document Status:** Design Complete - Ready for Implementation
**Version:** 1.1.0 (0.5m cells, dynamic hitboxes)
**Next Step:** Begin Phase 1 - Core Collision System
