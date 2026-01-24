// PhysicsWorld - Monde de physique Cannon
'use client';

import { Physics } from '@react-three/cannon';
import type { WorldType } from '../scenes/types';

export const PHYSICS_CONFIG = {
  gravity: [0, -20, 0] as [number, number, number],
  defaultMaterial: {
    friction: 0.3,
    restitution: 0.1,
  },
};

interface PhysicsWorldProps {
  worldType: WorldType;
  children: React.ReactNode;
}

export function PhysicsWorld({ worldType, children }: PhysicsWorldProps) {
  return (
    <Physics gravity={PHYSICS_CONFIG.gravity}>
      {children}
    </Physics>
  );
}
