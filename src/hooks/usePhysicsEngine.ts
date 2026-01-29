// usePhysicsEngine - React integration for the physics engine
'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Vector3 } from 'three';
import {
  SpatialHashGrid,
  CollisionDetector,
  CharacterController,
  PathfindingAdapter,
  type Obstacle,
} from '@/core/3d/physics/engine';
import { CircleHitbox, BoxHitbox } from '@/core/3d/physics/engine/hitboxes';
import type { CollisionZone } from '@/core/3d/scenes/collisions';
import { getControllerConfig } from '@/core/3d/physics/config/PhysicsConfig';

interface PhysicsEngineConfig {
  cellSize?: number;
  worldBounds?: { min: number; max: number };
}

interface PhysicsEngineInstance {
  spatialGrid: SpatialHashGrid;
  collisionDetector: CollisionDetector;
  pathfinding: PathfindingAdapter;
  addObstacle: (obstacle: Obstacle) => void;
  removeObstacle: (id: string) => void;
  updateObstacle: (id: string, updates: Partial<Omit<Obstacle, 'id'>>) => void;
  checkCollision: (position: Vector3, radius?: number) => boolean;
  findPath: (from: Vector3, to: Vector3, radius?: number) => Vector3[];
  getStats: () => { cellSize: number; cols: number; rows: number; totalCells: number; obstacleCount: number };
}

/**
 * Hook that initializes and manages the physics engine
 * Converts collision zones to obstacles with dynamic hitboxes
 */
export function usePhysicsEngine(
  collisionZones: CollisionZone[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config?: PhysicsEngineConfig
): PhysicsEngineInstance | null {
  const engineRef = useRef<PhysicsEngineInstance | null>(null);

  // Stable dependency for useEffect - only changes if zone data actually changes
  const zonesKey = useMemo(() => {
    return JSON.stringify(collisionZones.map((z) => ({
      id: z.id,
      position: z.position,
      radius: z.radius,
      name: z.name,
    })));
  }, [collisionZones]);

  useEffect(() => {
    // Initialize components
    const spatialGrid = new SpatialHashGrid();
    const collisionDetector = new CollisionDetector(spatialGrid);
    const pathfinding = new PathfindingAdapter(spatialGrid, collisionDetector);

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
    };

    // Convert collision zones to obstacles with appropriate hitboxes
    console.log('[Physics] Initializing with', collisionZones.length, 'collision zones');
    collisionZones.forEach((zone) => {
      const obstacle = createObstacleFromZone(zone);
      instance.addObstacle(obstacle);
    });
    console.log('[Physics] Added all obstacles. Total:', instance.getStats().obstacleCount);

    engineRef.current = instance;

    return () => {
      console.log('[Physics] Cleanup - clearing engine');
      engineRef.current = null;
    };
  }, [zonesKey, collisionZones]);

  // Return engine instance - will be null on first render, then available after effect
  return engineRef.current;
}

/**
 * Create an obstacle with appropriate hitbox from a collision zone
 * IMPORTANT: Hitbox size includes character radius margin for proper collision
 */
function createObstacleFromZone(zone: CollisionZone): Obstacle {
  const center = new Vector3(...zone.position);
  const nameLower = zone.name?.toLowerCase() || '';

  // Character radius to add for collision margin
  const CHARACTER_MARGIN = 0.5; // Character radius

  let hitbox;

  // Choose hitbox type based on zone name/characteristics
  if (nameLower.includes('pillar') || nameLower.includes('pilier') || nameLower.includes('monolith')) {
    // Pillars: circle with radius margin for character
    hitbox = new CircleHitbox({
      center,
      radius: zone.radius + CHARACTER_MARGIN, // Add character radius!
    });
  } else if (nameLower.includes('terminal')) {
    // Terminals are rectangular - box with margin
    const width = 2 + CHARACTER_MARGIN * 2;
    const depth = 1 + CHARACTER_MARGIN * 2;
    hitbox = new BoxHitbox({
      center,
      size: [width, 2, depth],
      rotation: 0,
    });
  } else if (nameLower.includes('arch') || nameLower.includes('arc')) {
    // Arch pillars - box with margin
    hitbox = new BoxHitbox({
      center,
      size: [(zone.radius * 1.5) + CHARACTER_MARGIN * 2, 3, (zone.radius * 1.5) + CHARACTER_MARGIN * 2],
      rotation: 0,
    });
  } else if (nameLower.includes('pedestal')) {
    // Pedestals - box with margin
    hitbox = new BoxHitbox({
      center,
      size: [(zone.radius * 2) + CHARACTER_MARGIN * 2, 1, (zone.radius * 2) + CHARACTER_MARGIN * 2],
      rotation: 0,
    });
  } else if (nameLower.includes('frame') || nameLower.includes('cadre')) {
    // Gallery Frames - wide but thin (5x4x0.3) → use box with larger width, small depth
    hitbox = new BoxHitbox({
      center,
      size: [(zone.radius * 2) + CHARACTER_MARGIN * 2, 4, 0.5], // Thin depth for frame
      rotation: 0,
    });
  } else if (nameLower.includes('wall')) {
    // Walls - elongated box with margin
    const isWide = zone.radius > 3;
    hitbox = new BoxHitbox({
      center,
      size: isWide
        ? [(zone.radius * 2) + CHARACTER_MARGIN * 2, 3, 1]
        : [1, 3, (zone.radius * 2) + CHARACTER_MARGIN * 2],
      rotation: 0,
    });
  } else {
    // Default: box with margin
    hitbox = new BoxHitbox({
      center,
      size: [(zone.radius * 2) + CHARACTER_MARGIN * 2, 2, (zone.radius * 2) + CHARACTER_MARGIN * 2],
      rotation: 0,
    });
  }

  return {
    id: zone.id,
    hitbox,
    type: 'static' as const,
    name: zone.name,
  };
}

/**
 * Character controller hook
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
