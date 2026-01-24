// Character controls logic - Fixed with proper collision checking during movement
'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import * as THREE from 'three';
import type { WorldType } from '../scenes/types';
import type { CollisionZone } from '../scenes/collisions';
import { usePhysicsEngine, useCharacterController as usePhysicsController } from '@/hooks/usePhysicsEngine';
import { useCharacterStore } from '@/store/3d-character-store';

const INITIAL_POSITION = [0, 0.5, 0] as [number, number, number];

export interface CharacterControlsProps {
  worldType: WorldType;
  collisionZones: CollisionZone[];
  positionRef?: React.MutableRefObject<Vector3>;
  onTargetSet?: (pos: Vector3 | null) => void;
  onSprintChange?: (sprinting: boolean) => void;
}

export function useCharacterControls({
  worldType,
  collisionZones,
  positionRef,
  onTargetSet,
  onSprintChange,
}: CharacterControlsProps) {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();
  const pathRef = useRef<Vector3[]>([]);
  const currentWaypointRef = useRef<Vector3 | null>(null);
  const finalDestinationRef = useRef<Vector3 | null>(null); // Store original destination
  const blockedFramesRef = useRef(0); // Count consecutive blocked frames

  const [rotation, setRotation] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [displayPath, setDisplayPath] = useState<Vector3[]>([]);
  const [localPosition, setLocalPosition] = useState(new Vector3(...INITIAL_POSITION));

  // Initialize new physics engine
  const physicsEngine = usePhysicsEngine(collisionZones);
  const characterController = usePhysicsController(physicsEngine, localPosition);

  const setPosition = useCharacterStore((s) => s.setPosition);
  const lastSyncedPositionRef = useRef(new Vector3(...INITIAL_POSITION));
  const keys = useRef({ sprint: false });

  useEffect(() => {
    const initialPos = positionRef?.current || localPosition;
    setPosition([initialPos.x, initialPos.y, initialPos.z]);
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
      const currentPos = positionRef?.current || localPosition;

      // Validate clicked position - if inside obstacle, find nearest valid position
      // Pathfinding will handle routing around obstacles
      if (physicsEngine.checkCollision(clickedPos)) {
        clickedPos = physicsEngine.collisionDetector.findNearestValidPosition(clickedPos, 0.5, 5);
      }

      // Use pathfinding to get full route (handles going around obstacles)
      const path = physicsEngine.findPath(currentPos, clickedPos);

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
  }, [camera, collisionZones, positionRef, localPosition, onTargetSet, physicsEngine]);

  /**
   * Move towards a target with collision checking at each step
   * Returns the new position - stops if blocked (no sliding)
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
    const collision = physicsEngine!.collisionDetector.checkCollision(tentativePos, 0.5);

    if (collision.collided) {
      // Blocked - don't slide, let pathfinding handle it
      return { position: currentPos.clone(), blocked: true };
    }

    return { position: tentativePos, blocked: false };
  };

  useFrame((_, delta) => {
    if (!groupRef.current || !physicsEngine) return;

    const sprinting = keys.current.sprint;
    setIsSprinting(sprinting);
    onSprintChange?.(sprinting);

    const currentPos = positionRef?.current || localPosition;

    if (currentWaypointRef.current) {
      const targetPos = currentWaypointRef.current;
      const distance = currentPos.distanceTo(targetPos);

      if (distance > 0.3) {
        setIsMoving(true);

        // Calculate rotation
        const dx = targetPos.x - currentPos.x;
        const dz = targetPos.z - currentPos.z;
        const targetRotation = Math.atan2(dx, dz);
        const rotDiff = targetRotation - rotation;
        const shortestRot = ((rotDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
        setRotation(r => r + shortestRot * delta * 15);

        // Move WITH collision checking
        const speed = sprinting ? 8 : 4;
        const { position: newPos, blocked } = moveTowardsWithCollision(currentPos, targetPos, speed, delta);

        if (blocked) {
          blockedFramesRef.current++;

          // If blocked for more than 10 frames, recalculate path
          if (blockedFramesRef.current > 10 && finalDestinationRef.current) {
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
            }
          }
        } else {
          blockedFramesRef.current = 0; // Reset when moving
        }

        // Update position
        setLocalPosition(newPos.clone());
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
        }
      }
    } else if (pathRef.current.length === 0) {
      setIsMoving(false);
    }

    // Sync position to store
    const posChanged = currentPos.distanceTo(lastSyncedPositionRef.current) > 0.5;
    if (posChanged) {
      lastSyncedPositionRef.current.copy(currentPos);
      setPosition([currentPos.x, currentPos.y, currentPos.z]);
    }

    groupRef.current.position.copy(currentPos);
    groupRef.current.rotation.y = rotation;
  });

  return {
    groupRef,
    localPosition,
    rotation,
    isMoving,
    isSprinting,
    displayPath,
  };
}
