// Character controls logic
'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import * as THREE from 'three';
import type { WorldType } from '../scenes/types';
import type { CollisionZone } from '../scenes/collisions';
import { navigationGrid } from '../scenes/pathfinding';
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
  worldType, collisionZones, positionRef, onTargetSet, onSprintChange,
}: CharacterControlsProps) {
  const groupRef = useRef<Group>(null);
  const { camera } = useThree();
  const pathRef = useRef<Vector3[]>([]);
  const currentWaypointRef = useRef<Vector3 | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [displayPath, setDisplayPath] = useState<Vector3[]>([]);
  const [localPosition, setLocalPosition] = useState(new Vector3(...INITIAL_POSITION));

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
      if (e.button !== 2 || !camera) return;
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
      const clickedPos = new Vector3(x, 0.5, z);
      const currentPos = positionRef?.current || localPosition;

      navigationGrid.updateCollisionZones(collisionZones);
      const path = navigationGrid.findPath(currentPos, clickedPos);

      if (path.length > 0) {
        pathRef.current = path;
        setDisplayPath(path);
        const nextWaypoint = path.length > 1 ? path[1] : path[0];
        currentWaypointRef.current = nextWaypoint;
        onTargetSet?.(path[path.length - 1]);
      } else {
        setDisplayPath([]);
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [camera, collisionZones, positionRef, localPosition, onTargetSet]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const baseSpeed = 12;
    const sprintMultiplier = 1.6;
    const speed = isSprinting ? baseSpeed * sprintMultiplier : baseSpeed;
    const rotSpeed = 15;
    const sprinting = keys.current.sprint;

    setIsSprinting(sprinting);
    onSprintChange?.(sprinting);

    const currentPos = positionRef?.current || localPosition;

    if (currentWaypointRef.current) {
      const targetPos = currentWaypointRef.current;
      const dx = targetPos.x - currentPos.x;
      const dz = targetPos.z - currentPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance > 0.3) {
        setIsMoving(true);
        const targetRotation = Math.atan2(dx, dz);
        const rotDiff = targetRotation - rotation;
        const shortestRot = ((rotDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
        setRotation(r => r + shortestRot * delta * rotSpeed);

        const moveDist = speed * delta;
        const ratio = Math.min(moveDist / distance, 1);
        const newPos = new Vector3(
          currentPos.x + dx * ratio,
          0.5,
          currentPos.z + dz * ratio
        );

        setLocalPosition(newPos);
        if (positionRef) positionRef.current.copy(newPos);
      } else {
        const path = pathRef.current;
        const currentIndex = path.findIndex(p =>
          Math.abs(p.x - targetPos.x) < 0.1 && Math.abs(p.z - targetPos.z) < 0.1
        );

        if (currentIndex >= 0 && currentIndex < path.length - 1) {
          currentWaypointRef.current = path[currentIndex + 1];
        } else {
          currentWaypointRef.current = null;
          pathRef.current = [];
          setDisplayPath([]);
          onTargetSet?.(null);
          setIsMoving(false);
        }
      }
    } else if (pathRef.current.length === 0) {
      setIsMoving(false);
    }

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
