// Path visualization for A* pathfinding
'use client';

import { Vector3 } from 'three';
import type { WorldType } from '../scenes/types';

interface PathVisualizationProps {
  path: Vector3[];
  isSprinting: boolean;
  worldType: WorldType;
}

export function PathVisualization({ path, isSprinting, worldType }: PathVisualizationProps) {
  const colors = {
    dev: { glow: '#8b0000', sprint: '#ff6b00' },
    art: { glow: '#4ecdc4', sprint: '#feca57' },
  }[worldType];

  if (path.length <= 1) return null;

  return (
    <group>
      {path.slice(1).map((point, i) => (
        <mesh key={`path-${i}`} position={[point.x, 0.06, point.z]}>
          <circleGeometry args={[0.3, 8]} />
          <meshBasicMaterial color={isSprinting ? colors.sprint : colors.glow} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}
