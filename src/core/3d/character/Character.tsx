// Character - Controllable character with pathfinding
'use client';

import type { WorldType } from '../scenes/types';
import type { CollisionZone } from '../scenes/collisions';
import { DEV_COLLISION_ZONES, ART_COLLISION_ZONES } from '../scenes/collisions';
import { useCharacterControls } from './CharacterControls';
import { CharacterModel } from './CharacterModel';
import { PathVisualization } from './PathVisualization';

export interface CharacterProps {
  worldType: WorldType;
  positionRef?: React.MutableRefObject<import('three').Vector3>;
  onTargetSet?: (pos: import('three').Vector3 | null) => void;
  onSprintChange?: (sprinting: boolean) => void;
}

export function Character({ worldType, positionRef, onTargetSet, onSprintChange }: CharacterProps) {
  const collisionZones: CollisionZone[] = worldType === 'dev' ? DEV_COLLISION_ZONES : ART_COLLISION_ZONES;

  const { groupRef, isMoving, isSprinting, displayPath } = useCharacterControls({
    worldType,
    collisionZones,
    positionRef,
    onTargetSet,
    onSprintChange,
  });

  return (
    <group ref={groupRef}>
      <CharacterModel isMoving={isMoving} isSprinting={isSprinting} />
      <PathVisualization path={displayPath} isSprinting={isSprinting} worldType={worldType} />
    </group>
  );
}
