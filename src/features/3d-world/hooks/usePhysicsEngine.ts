// usePhysicsEngine - React integration for the physics engine
// Now supports unified ObstacleConfig with explicit hitbox types
'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Vector3 } from 'three';
import {
  SpatialHashGrid,
  CollisionDetector,
  CharacterController,
  DynamicPathfinding,
  type Obstacle,
} from '@/core/3d/physics/engine';
import { CircleHitbox, BoxHitbox } from '@/core/3d/physics/engine/hitboxes';
import type { ObstacleConfig, HitboxConfig } from '@/core/3d/physics/config/ObstacleConfig';
import type { CollisionZone } from '@/core/3d/scenes/collisions';
import { CollisionLayer } from '@/core/3d/physics/config/CollisionLayers';
import { getControllerConfig } from '@/core/3d/physics/config/PhysicsConfig';

interface PhysicsEngineConfig {
  cellSize?: number;
  worldBounds?: { min: number; max: number };
  enableDebug?: boolean;
}

interface PhysicsEngineInstance {
  spatialGrid: SpatialHashGrid;
  collisionDetector: CollisionDetector;
  pathfinding: DynamicPathfinding;
  addObstacle: (obstacle: Obstacle) => void;
  removeObstacle: (id: string) => void;
  updateObstacle: (id: string, updates: Partial<Omit<Obstacle, 'id'>>) => void;
  checkCollision: (position: Vector3, radius?: number) => boolean;
  findPath: (from: Vector3, to: Vector3, radius?: number) => Vector3[];
  getStats: () => {
    cellSize: number;
    cols: number;
    rows: number;
    totalCells: number;
    obstacleCount: number;
  };
  getPathfindingStats: () => {
    nodesExplored: number;
    pathLength: number;
    calculationTime: number;
    cacheHit: boolean;
  };
  getCacheStats: () => {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
}

// Character radius margin to add for collision
// Reduced from 0.5 to 0.15 - hitboxes already include their size,
// this is just a small buffer to prevent clipping
const CHARACTER_MARGIN = 0.15;

/**
 * Hook that initializes and manages the physics engine.
 * Now supports both new ObstacleConfig and legacy CollisionZone formats.
 */
export function usePhysicsEngine(
  collisionZones: (ObstacleConfig | CollisionZone)[],
  config?: PhysicsEngineConfig
): PhysicsEngineInstance | null {
  const engineRef = useRef<PhysicsEngineInstance | null>(null);

  // Stable dependency for useEffect - only changes if zone data actually changes
  const zonesKey = useMemo(() => {
    return JSON.stringify(
      collisionZones.map((z) => {
        // Handle both ObstacleConfig and CollisionZone
        if ('hitbox' in z) {
          // New ObstacleConfig format
          return {
            id: z.id,
            position: z.position,
            type: z.type,
            hitbox: z.hitbox,
          };
        } else {
          // Legacy CollisionZone format
          return {
            id: z.id,
            position: z.position,
            radius: z.radius,
            name: z.name,
          };
        }
      })
    );
  }, [collisionZones]);

  useEffect(() => {
    // Initialize components
    const spatialGrid = new SpatialHashGrid();
    const collisionDetector = new CollisionDetector(spatialGrid);
    const pathfinding = new DynamicPathfinding(spatialGrid, collisionDetector);

    // Create engine instance with bound methods
    const instance: PhysicsEngineInstance = {
      spatialGrid,
      collisionDetector,
      pathfinding,
      addObstacle: spatialGrid.addObstacle.bind(spatialGrid),
      removeObstacle: spatialGrid.removeObstacle.bind(spatialGrid),
      updateObstacle: spatialGrid.updateObstacle.bind(spatialGrid),
      checkCollision: (position: Vector3, radius: number = 0) =>
        collisionDetector.checkCollision(position, radius).collided,
      findPath: pathfinding.findPath.bind(pathfinding),
      getStats: spatialGrid.getStats.bind(spatialGrid),
      getPathfindingStats: () => pathfinding.getStats(),
      getCacheStats: () => pathfinding.getCacheStats(),
    };

    // Convert collision zones to obstacles
    console.log('[Physics] Initializing with', collisionZones.length, 'collision zones');
    collisionZones.forEach((zone) => {
      const obstacle = createObstacleFromZone(zone);
      if (obstacle) {
        instance.addObstacle(obstacle);
      }
    });
    console.log('[Physics] Added all obstacles. Total:', instance.getStats().obstacleCount);

    engineRef.current = instance;

    return () => {
      console.log('[Physics] Cleanup - clearing engine');
      engineRef.current = null;
    };
  }, [zonesKey, collisionZones]);

  return engineRef.current;
}

/**
 * Create an obstacle with appropriate hitbox from a zone config.
 * Supports both new ObstacleConfig and legacy CollisionZone formats.
 */
function createObstacleFromZone(zone: ObstacleConfig | CollisionZone): Obstacle | null {
  const center = new Vector3(...zone.position);
  const id = zone.id;
  const name = zone.name || id;

  // Check if this is the new ObstacleConfig format
  if ('hitbox' in zone) {
    // New format with explicit hitbox
    const config = zone as ObstacleConfig;
    const hitbox = createHitboxFromConfig(config.hitbox, center);

    // Map CollisionLayer to Obstacle type
    let obstacleType: 'static' | 'dynamic' | 'trigger' = 'static';
    if (config.collisionLayer === CollisionLayer.TRIGGER) {
      obstacleType = 'trigger';
    } else if (config.collisionLayer === CollisionLayer.NPC) {
      obstacleType = 'dynamic';
    }

    return {
      id,
      hitbox,
      type: obstacleType,
      name,
    };
  }

  // Legacy format - infer hitbox from name/radius
  const legacyZone = zone as CollisionZone;
  const nameLower = name.toLowerCase();

  let hitbox;

  if (nameLower.includes('pillar') || nameLower.includes('pilier')) {
    hitbox = new CircleHitbox({
      center,
      radius: legacyZone.radius + CHARACTER_MARGIN,
    });
  } else if (nameLower.includes('terminal')) {
    const width = 2 + CHARACTER_MARGIN * 2;
    const depth = 1 + CHARACTER_MARGIN * 2;
    hitbox = new BoxHitbox({
      center,
      size: [width, 2, depth],
      rotation: 0,
    });
  } else if (nameLower.includes('arch') || nameLower.includes('arc')) {
    hitbox = new BoxHitbox({
      center,
      size: [legacyZone.radius * 1.5 + CHARACTER_MARGIN * 2, 3, legacyZone.radius * 1.5 + CHARACTER_MARGIN * 2],
      rotation: 0,
    });
  } else if (nameLower.includes('pedestal')) {
    hitbox = new BoxHitbox({
      center,
      size: [legacyZone.radius * 2 + CHARACTER_MARGIN * 2, 1, legacyZone.radius * 2 + CHARACTER_MARGIN * 2],
      rotation: 0,
    });
  } else if (nameLower.includes('frame') || nameLower.includes('cadre')) {
    hitbox = new BoxHitbox({
      center,
      size: [legacyZone.radius * 2 + CHARACTER_MARGIN * 2, 4, 0.5],
      rotation: 0,
    });
  } else if (nameLower.includes('wall')) {
    const isWide = legacyZone.radius > 3;
    hitbox = new BoxHitbox({
      center,
      size: isWide
        ? [legacyZone.radius * 2 + CHARACTER_MARGIN * 2, 3, 1]
        : [1, 3, legacyZone.radius * 2 + CHARACTER_MARGIN * 2],
      rotation: 0,
    });
  } else if (nameLower.includes('npc')) {
    // NPCs use the NPC layer
    hitbox = new CircleHitbox({
      center,
      radius: legacyZone.radius,
    });
    return {
      id,
      hitbox,
      type: 'dynamic' as const,
      name,
    };
  } else {
    // Default: box with margin
    hitbox = new BoxHitbox({
      center,
      size: [legacyZone.radius * 2 + CHARACTER_MARGIN * 2, 2, legacyZone.radius * 2 + CHARACTER_MARGIN * 2],
      rotation: 0,
    });
  }

  return {
    id,
    hitbox,
    type: 'static' as const,
    name,
  };
}

/**
 * Create a hitbox from HitboxConfig.
 */
function createHitboxFromConfig(hitboxConfig: HitboxConfig, center: Vector3) {
  switch (hitboxConfig.shape) {
    case 'circle':
      return new CircleHitbox({
        center,
        radius: hitboxConfig.radius + CHARACTER_MARGIN,
      });

    case 'box':
      return new BoxHitbox({
        center,
        size: [
          hitboxConfig.size[0] + CHARACTER_MARGIN * 2,
          hitboxConfig.size[1],
          hitboxConfig.size[2] + CHARACTER_MARGIN * 2,
        ],
        rotation: hitboxConfig.rotation || 0,
      });

    case 'capsule':
      // For capsules, use a circle for now (could implement CapsuleHitbox later)
      return new CircleHitbox({
        center,
        radius: hitboxConfig.radius + CHARACTER_MARGIN,
      });

    default:
      // Default to circle
      return new CircleHitbox({
        center,
        radius: 1 + CHARACTER_MARGIN,
      });
  }
}

/**
 * Character controller hook.
 */
export function useCharacterController(
  engine: ReturnType<typeof usePhysicsEngine>,
  startPosition?: Vector3,
  profileName?: 'default' | 'heavy' | 'light'
) {
  const controllerRef = useRef<CharacterController | null>(null);

  useEffect(() => {
    if (!engine) return;

    const config = profileName ? getControllerConfig(profileName) : undefined;

    controllerRef.current = new CharacterController(
      engine.collisionDetector,
      startPosition || new Vector3(0, 0.5, 0),
      config
    );

    return () => {
      controllerRef.current = null;
    };
  }, [engine, startPosition, profileName]);

  return controllerRef;
}
