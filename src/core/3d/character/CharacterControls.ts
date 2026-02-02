// Character controls logic - Fixed with proper collision checking during movement
'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import * as THREE from 'three';
import type { WorldType } from '../scenes/types';
import type { CollisionZone, ObstacleConfig } from '../scenes/collisions';
import { usePhysicsEngine } from '@/features/3d-world/hooks';
import { useCharacterStore } from '@/features/3d-world/store';
import { useWorldStore } from '@/features/3d-world/store';

const INITIAL_POSITION = [0, 0.5, 0] as [number, number, number];

export interface CharacterControlsProps {
  worldType: WorldType;
  collisionZones: (CollisionZone | ObstacleConfig)[];
  positionRef?: React.MutableRefObject<Vector3>;
  onTargetSet?: (pos: Vector3 | null) => void;
  onSprintChange?: (sprinting: boolean) => void;
  onPathfindingStats?: (stats: { nodesExplored: number; pathLength: number; calculationTime: number; cacheHit: boolean }) => void;
}

export function useCharacterControls({
  collisionZones,
  positionRef,
  onTargetSet,
  onSprintChange,
  onPathfindingStats,
}: CharacterControlsProps) {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();
  const pathRef = useRef<Vector3[]>([]);
  const currentWaypointRef = useRef<Vector3 | null>(null);
  const finalDestinationRef = useRef<Vector3 | null>(null); // Store original destination
  const blockedFramesRef = useRef(0); // Count consecutive blocked frames

  // Use refs for values that change every frame to avoid re-renders
  const rotationRef = useRef(0);
  const localPositionRef = useRef(new Vector3(...INITIAL_POSITION));

  // Use state for position and rotation to return values without accessing refs during render
  // These are only updated when needed to avoid excessive re-renders
  const [isMoving, setIsMoving] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [displayPath, setDisplayPath] = useState<Vector3[]>([]);
  const [renderPosition, setRenderPosition] = useState(new Vector3(...INITIAL_POSITION));
  const [renderRotation, setRenderRotation] = useState(0);

  // Sync state from refs periodically (throttled)
  const lastRenderUpdateRef = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastRenderUpdateRef.current > 100) { // Update every 100ms max
        setRenderPosition(localPositionRef.current.clone());
        setRenderRotation(rotationRef.current);
        lastRenderUpdateRef.current = now;
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Initialize new physics engine
  const physicsEngine = usePhysicsEngine(collisionZones);

  const setPosition = useCharacterStore((s) => s.setPosition);
  const setPlayerPosition = useWorldStore((s) => s.setPlayerPosition);
  const lastSyncedPositionRef = useRef(new Vector3(...INITIAL_POSITION));
  const keys = useRef({ sprint: false });
  const prevSprintingRef = useRef(false);
  const prevIsMovingRef = useRef(false);

  // Initialize position in stores once on mount
  useEffect(() => {
    const initialPos = positionRef?.current || localPositionRef.current;
    if (positionRef) {
      localPositionRef.current.copy(positionRef.current);
    }
    setRenderPosition(initialPos.clone());
    setPosition([initialPos.x, initialPos.y, initialPos.z]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.current.sprint = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.current.sprint = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 2 || !camera || !physicsEngine) return;
      e.preventDefault();

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      const x = Math.max(-45, Math.min(45, intersection.x));
      const z = Math.max(-45, Math.min(45, intersection.z));
      let clickedPos = new Vector3(x, 0.5, z);
      const currentPos = positionRef?.current || localPositionRef.current;

      // Validate clicked position - if inside obstacle, find nearest valid position
      // Pathfinding will handle routing around obstacles
      if (physicsEngine.checkCollision(clickedPos)) {
        clickedPos = physicsEngine.collisionDetector.findNearestValidPosition(clickedPos, 0.5, 5);
      }

      // Use pathfinding to get full route (handles going around obstacles)
      const path = physicsEngine.findPath(currentPos, clickedPos);

      // Report pathfinding statistics
      if (physicsEngine.getPathfindingStats && onPathfindingStats) {
        onPathfindingStats(physicsEngine.getPathfindingStats());
      }

      if (path.length > 0) {
        pathRef.current = path;
        setDisplayPath(path);
        const nextWaypoint = path.length > 1 ? path[1] : path[0];
        currentWaypointRef.current = nextWaypoint;
        finalDestinationRef.current = path[path.length - 1]; // Store final destination
        blockedFramesRef.current = 0; // Reset blocked counter
        onTargetSet?.(path[path.length - 1]);
      } else {
        setDisplayPath([]);
        finalDestinationRef.current = null;
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [camera, collisionZones, positionRef, onTargetSet, physicsEngine, onPathfindingStats]);

  /**
   * Move towards a target with collision checking at each step
   * Uses sliding along obstacles to navigate through narrow passages
   * Enhanced with strafing and nudging for better obstacle avoidance
   */
  const moveTowardsWithCollision = (
    currentPos: Vector3,
    targetPos: Vector3,
    speed: number,
    delta: number
  ): { position: Vector3; blocked: boolean } => {
    const dx = targetPos.x - currentPos.x;
    const dz = targetPos.z - currentPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance <= 0.1) {
      return { position: currentPos.clone(), blocked: false }; // Reached
    }

    const direction = new Vector3(dx, 0, dz).normalize();
    const moveDistance = Math.min(speed * delta, distance);
    const tentativePos = currentPos.clone().add(direction.clone().multiplyScalar(moveDistance));

    // Check if next position would collide
    const collision = physicsEngine!.collisionDetector.checkCollision(tentativePos);

    if (!collision.collided) {
      return { position: tentativePos, blocked: false };
    }

    // Collision detected - try sliding along the obstacle
    const normal = collision.normal;

    // Project direction onto the collision plane (perpendicular to normal)
    // This makes the character slide along the wall instead of stopping
    const dot = direction.dot(normal);
    const slideDirection = direction.clone().sub(normal.clone().multiplyScalar(dot));

    // If slide direction is valid, try moving along it
    if (slideDirection.length() > 0.01) {
      slideDirection.normalize();
      const slidePos = currentPos.clone().add(slideDirection.multiplyScalar(moveDistance * 0.95));

      // Check if sliding position is valid
      const slideCollision = physicsEngine!.collisionDetector.checkCollision(slidePos);

      if (!slideCollision.collided) {
        // Verify we're still making progress toward target (more lenient check)
        const newDist = slidePos.distanceTo(targetPos);
        if (newDist < distance * 1.25) { // Allow 25% tolerance for longer sliding path
          return { position: slidePos, blocked: false };
        }
      }
    }

    // Try perpendicular sliding (strafing along obstacle)
    const perpSlide = new Vector3(-normal.z, 0, normal.x).normalize();
    // Try both directions along the perpendicular
    for (const sign of [1, -1]) {
      const perpDir = perpSlide.clone().multiplyScalar(sign);
      const perpPos = currentPos.clone().add(perpDir.multiplyScalar(moveDistance * 0.7));

      const perpCollision = physicsEngine!.collisionDetector.checkCollision(perpPos);
      if (!perpCollision.collided) {
        const perpDist = perpPos.distanceTo(targetPos);
        if (perpDist < distance * 1.2) {
          return { position: perpPos, blocked: false };
        }
      }
    }

    // Try small "nudge" movements in multiple directions to find a way through
    const nudgeDirs = [
      new Vector3(0.3, 0, 0).add(direction).normalize(),
      new Vector3(-0.3, 0, 0).add(direction).normalize(),
      new Vector3(0, 0, 0.3).add(direction).normalize(),
      new Vector3(0, 0, -0.3).add(direction).normalize(),
    ];

    for (const nudgeDir of nudgeDirs) {
      const nudgePos = currentPos.clone().add(nudgeDir.multiplyScalar(moveDistance * 0.5));
      const nudgeCollision = physicsEngine!.collisionDetector.checkCollision(nudgePos);
      if (!nudgeCollision.collided) {
        const nudgeDist = nudgePos.distanceTo(targetPos);
        if (nudgeDist < distance * 1.15) {
          return { position: nudgePos, blocked: false };
        }
      }
    }

    // All sliding attempts failed - try minimal movement to avoid getting stuck
    // Sometimes moving slightly closer to obstacle allows next frame to slide
    const minimalMove = currentPos.clone().add(direction.multiplyScalar(moveDistance * 0.1));
    const minimalCollision = physicsEngine!.collisionDetector.checkCollision(minimalMove);
    if (!minimalCollision.collided) {
      return { position: minimalMove, blocked: false };
    }

    // All sliding attempts failed - truly blocked
    return { position: currentPos.clone(), blocked: true };
  };

  useFrame((_, delta) => {
    if (!groupRef.current || !physicsEngine) return;

    const sprinting = keys.current.sprint;
    // Only update state when sprint value actually changes to avoid infinite loop
    if (sprinting !== prevSprintingRef.current) {
      prevSprintingRef.current = sprinting;
      setIsSprinting(sprinting);
      onSprintChange?.(sprinting);
    }

    const currentPos = positionRef?.current || localPositionRef.current;
    const rotation = rotationRef.current;

    if (currentWaypointRef.current) {
      const targetPos = currentWaypointRef.current;
      const distance = currentPos.distanceTo(targetPos);

      if (distance > 0.3) {
        // Update isMoving state only when it actually changes
        if (!prevIsMovingRef.current) {
          prevIsMovingRef.current = true;
          setIsMoving(true);
        }

        // Calculate rotation - use ref instead of state
        const dx = targetPos.x - currentPos.x;
        const dz = targetPos.z - currentPos.z;
        const targetRotation = Math.atan2(dx, dz);
        const rotDiff = targetRotation - rotation;
        const shortestRot = ((rotDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
        rotationRef.current += shortestRot * delta * 15;

        // Move WITH collision checking
        const speed = sprinting ? 8 : 4;
        const { position: newPos, blocked } = moveTowardsWithCollision(currentPos, targetPos, speed, delta);

        if (blocked) {
          blockedFramesRef.current++;

          // If blocked for more than 3 frames, recalculate path (faster reaction)
          if (blockedFramesRef.current > 3 && finalDestinationRef.current) {
            const newPath = physicsEngine.findPath(currentPos, finalDestinationRef.current);
            if (newPath.length > 0) {
              pathRef.current = newPath;
              setDisplayPath(newPath);
              currentWaypointRef.current = newPath.length > 1 ? newPath[1] : newPath[0];
              blockedFramesRef.current = 0;
            } else {
              // No path found, give up
              currentWaypointRef.current = null;
              pathRef.current = [];
              setDisplayPath([]);
              setIsMoving(false);
              prevIsMovingRef.current = false;
            }
          }
        } else {
          blockedFramesRef.current = 0; // Reset when moving
        }

        // Update position - use ref instead of state
        localPositionRef.current.copy(newPos);
        if (positionRef) positionRef.current.copy(newPos);
      } else {
        // Reached waypoint, get next one
        const path = pathRef.current;
        const currentIndex = path.findIndex(p =>
          Math.abs(p.x - targetPos.x) < 0.1 && Math.abs(p.z - targetPos.z) < 0.1
        );

        if (currentIndex >= 0 && currentIndex < path.length - 1) {
          currentWaypointRef.current = path[currentIndex + 1];
          blockedFramesRef.current = 0;
        } else {
          currentWaypointRef.current = null;
          pathRef.current = [];
          setDisplayPath([]);
          finalDestinationRef.current = null;
          blockedFramesRef.current = 0;
          onTargetSet?.(null);
          setIsMoving(false);
          prevIsMovingRef.current = false;
        }
      }
    } else if (pathRef.current.length === 0) {
      if (prevIsMovingRef.current) {
        prevIsMovingRef.current = false;
        setIsMoving(false);
      }
    }

    // Sync position to store
    const posChanged = currentPos.distanceTo(lastSyncedPositionRef.current) > 0.1;
    if (posChanged) {
      lastSyncedPositionRef.current.copy(currentPos);
      setPosition([currentPos.x, currentPos.y, currentPos.z]);
      setPlayerPosition([currentPos.x, currentPos.y, currentPos.z]);
    }

    groupRef.current.position.copy(currentPos);
    groupRef.current.rotation.y = rotationRef.current;
  });

  return {
    groupRef,
    localPosition: renderPosition,
    rotation: renderRotation,
    isMoving,
    isSprinting,
    displayPath,
  };
}
