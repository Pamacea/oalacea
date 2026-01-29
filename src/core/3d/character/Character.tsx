// Character - Controllable character with pathfinding
'use client';

import { useEffect, useMemo } from 'react';
import type { WorldType } from '../scenes/types';
import type { CollisionZone, ObstacleConfig } from '../scenes/collisions';
import { DEV_COLLISION_ZONES, ART_COLLISION_ZONES } from '../scenes/collisions';
import { useCharacterControls } from './CharacterControls';
import { CharacterModel } from './CharacterModel';
import { PathVisualization } from './PathVisualization';
import type { Group } from 'three';

export interface CharacterProps {
  worldType: WorldType;
  positionRef?: React.MutableRefObject<import('three').Vector3>;
  onTargetSet?: (pos: import('three').Vector3 | null) => void;
  onSprintChange?: (sprinting: boolean) => void;
  isOccluded?: boolean;
  groupRef?: React.MutableRefObject<Group | null>;
}

export function Character({
  worldType,
  positionRef,
  onTargetSet,
  onSprintChange,
  isOccluded = false,
  groupRef: externalGroupRef,
}: CharacterProps) {
  // Memoize collision zones to prevent physics engine re-initialization on every render
  const collisionZones: (CollisionZone | ObstacleConfig)[] = useMemo(
    () => (worldType === 'dev' ? DEV_COLLISION_ZONES : ART_COLLISION_ZONES),
    [worldType]
  );

  const { groupRef, isMoving, isSprinting, displayPath } = useCharacterControls({
    worldType,
    collisionZones,
    positionRef,
    onTargetSet,
    onSprintChange,
  });

  // Sync external ref with internal ref
  useEffect(() => {
    if (externalGroupRef) {
      externalGroupRef.current = groupRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      <CharacterModel isMoving={isMoving} isSprinting={isSprinting} isOccluded={isOccluded} />
      <PathVisualization path={displayPath} isSprinting={isSprinting} worldType={worldType} />
    </group>
  );
}
