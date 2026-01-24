// ImperiumPortal - Gothic Imperial-style portal for DevWorld
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Portal } from './Portal';
import type { WorldType } from '../types';

const COLORS = {
  black: '#1a1a1a',
  gold: '#d4af37',
  red: '#8b0000',
  darkRed: '#4a0000',
};

interface ImperiumPortalProps {
  position: [number, number, number];
  targetWorld: WorldType;
  rotation?: number;
}

export function ImperiumPortal({
  position,
  targetWorld,
  rotation = 0,
}: ImperiumPortalProps) {
  const groupRef = useRef<THREE.Group>(null);
  const skullRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (skullRef.current) {
      skullRef.current.position.y = 3.5 + Math.sin(time * 1.5) * 0.1;
      skullRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
  });

  const portalHeight = 5;
  const portalWidth = 3;
  const frameThickness = 0.4;

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      <Portal
        position={[0, 0, 0]}
        targetWorld={targetWorld}
        vortexColor={COLORS.red}
        frameColor={COLORS.gold}
        glowColor="#ff4400"
      />

      <group position={[0, 0, -0.3]}>
        <mesh position={[-portalWidth - frameThickness / 2, portalHeight / 2, 0]} castShadow>
          <boxGeometry args={[frameThickness, portalHeight + 1, 0.5]} />
          <meshStandardMaterial
            color={COLORS.black}
            roughness={0.7}
            metalness={0.4}
          />
        </mesh>
        <mesh position={[portalWidth + frameThickness / 2, portalHeight / 2, 0]} castShadow>
          <boxGeometry args={[frameThickness, portalHeight + 1, 0.5]} />
          <meshStandardMaterial
            color={COLORS.black}
            roughness={0.7}
            metalness={0.4}
          />
        </mesh>

        <mesh position={[0, portalHeight + frameThickness / 2, 0]} castShadow>
          <boxGeometry args={[portalWidth * 2 + frameThickness * 2, frameThickness, 0.5]} />
          <meshStandardMaterial
            color={COLORS.black}
            roughness={0.7}
            metalness={0.4}
          />
        </mesh>

        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[portalWidth * 2 + frameThickness * 2, 0.5, 0.5]} />
          <meshStandardMaterial
            color={COLORS.gold}
            roughness={0.3}
            metalness={0.8}
            emissive={COLORS.gold}
            emissiveIntensity={0.2}
          />
        </mesh>

        <mesh position={[0, portalHeight, 0.26]}>
          <torusGeometry args={[1.5, 0.15, 8, 16, Math.PI]} />
          <meshStandardMaterial
            color={COLORS.gold}
            roughness={0.3}
            metalness={0.8}
            emissive={COLORS.gold}
            emissiveIntensity={0.3}
          />
        </mesh>

        <group ref={skullRef} position={[0, 3.5, 0.2]}>
          <mesh position={[0, 0, 0]} castShadow>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial
              color={COLORS.black}
              roughness={0.8}
              metalness={0.3}
            />
          </mesh>
          <mesh position={[-0.25, 0.15, 0.3]} castShadow>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial
              color={COLORS.red}
              emissive={COLORS.red}
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[0.25, 0.15, 0.3]} castShadow>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial
              color={COLORS.red}
              emissive={COLORS.red}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        <group position={[-portalWidth - 0.5, portalHeight - 1, 0.3]}>
          <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0.3]} castShadow>
            <coneGeometry args={[0.3, 0.8, 4]} />
            <meshStandardMaterial
              color={COLORS.gold}
              metalness={0.9}
              emissive={COLORS.gold}
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, -0.3]} castShadow>
            <coneGeometry args={[0.3, 0.8, 4]} />
            <meshStandardMaterial
              color={COLORS.gold}
              metalness={0.9}
              emissive={COLORS.gold}
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>

        <group position={[portalWidth + 0.5, portalHeight - 1, 0.3]} rotation={[0, Math.PI, 0]}>
          <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0.3]} castShadow>
            <coneGeometry args={[0.3, 0.8, 4]} />
            <meshStandardMaterial
              color={COLORS.gold}
              metalness={0.9}
              emissive={COLORS.gold}
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, -0.3]} castShadow>
            <coneGeometry args={[0.3, 0.8, 4]} />
            <meshStandardMaterial
              color={COLORS.gold}
              metalness={0.9}
              emissive={COLORS.gold}
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>

        <mesh position={[0, 1, -0.3]}>
          <boxGeometry args={[0.2, portalHeight - 1, 0.1]} />
          <meshStandardMaterial
            color={COLORS.gold}
            roughness={0.3}
            metalness={0.8}
            emissive={COLORS.gold}
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0, 1, -0.3]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.2, portalHeight - 1, 0.1]} />
          <meshStandardMaterial
            color={COLORS.gold}
            roughness={0.3}
            metalness={0.8}
            emissive={COLORS.gold}
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      <pointLight
        position={[0, portalHeight / 2, 1]}
        color={COLORS.gold}
        intensity={2}
        distance={10}
        decay={2}
      />
    </group>
  );
}
