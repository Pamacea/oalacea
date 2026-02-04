// UndergroundPortal - Neon brutalist portal for ArtWorld
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Portal } from './Portal';
import type { WorldType } from '../types';

const COLORS = {
  concrete: '#2a2a3a',
  darkConcrete: '#1a1a2a',
  neonCyan: '#4ecdc4',
  neonPink: '#ff6b6b',
  neonYellow: '#feca57',
  rust: '#8b4513',
};

const NEON_COLORS = [COLORS.neonCyan, COLORS.neonPink, COLORS.neonYellow];

interface UndergroundPortalProps {
  position: [number, number, number];
  targetWorld: WorldType;
  rotation?: number;
}

export function UndergroundPortal({
  position,
  targetWorld,
  rotation = 0,
}: UndergroundPortalProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftLightRef = useRef<THREE.PointLight>(null);
  const rightLightRef = useRef<THREE.PointLight>(null);
  const signRef = useRef<THREE.Mesh>(null);

  const glitchColors = NEON_COLORS.map(c => new THREE.Color(c));

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (leftLightRef.current) {
      const flicker = 0.8 + Math.sin(time * 10) * 0.2 + Math.random() * 0.1;
      leftLightRef.current.intensity = 2 * flicker;
    }

    if (rightLightRef.current) {
      const flicker = 0.8 + Math.sin(time * 8 + 1) * 0.2 + Math.random() * 0.1;
      rightLightRef.current.intensity = 2 * flicker;
    }

    if (signRef.current && signRef.current.material) {
      const mat = signRef.current.material as THREE.MeshStandardMaterial;
      const colorIndex = Math.floor(time * 0.5) % glitchColors.length;
      mat.emissive.copy(glitchColors[colorIndex]);
    }
  });

  const portalHeight = 5;
  const portalWidth = 3;

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      <Portal
        position={[0, 0, 0]}
        targetWorld={targetWorld}
        vortexColor={COLORS.neonCyan}
        frameColor={COLORS.neonPink}
        glowColor={COLORS.neonCyan}
      />

      <group position={[0, 0, -0.3]}>
        <mesh position={[-portalWidth - 0.5, portalHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, portalHeight + 1, 0.6]} />
          <meshStandardMaterial
            color={COLORS.concrete}
            roughness={0.95}
            metalness={0.1}
          />
        </mesh>

        <mesh position={[portalWidth + 0.5, portalHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, portalHeight + 1, 0.6]} />
          <meshStandardMaterial
            color={COLORS.concrete}
            roughness={0.95}
            metalness={0.1}
          />
        </mesh>

        <mesh position={[0, portalHeight + 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[portalWidth * 2 + 1.5, 0.8, 0.6]} />
          <meshStandardMaterial
            color={COLORS.concrete}
            roughness={0.95}
            metalness={0.1}
          />
        </mesh>

        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[portalWidth * 2 + 1.5, 0.6, 0.6]} />
          <meshStandardMaterial
            color={COLORS.darkConcrete}
            roughness={0.9}
            metalness={0.2}
          />
        </mesh>

        <mesh position={[-portalWidth - 0.5, portalHeight + 0.5, 0.35]}>
          <planeGeometry args={[0.6, 1.5]} />
          <meshStandardMaterial
            color={COLORS.neonCyan}
            emissive={COLORS.neonCyan}
            emissiveIntensity={0.8}
          />
        </mesh>

        <mesh position={[portalWidth + 0.5, portalHeight + 0.5, 0.35]}>
          <planeGeometry args={[0.6, 1.5]} />
          <meshStandardMaterial
            color={COLORS.neonPink}
            emissive={COLORS.neonPink}
            emissiveIntensity={0.8}
          />
        </mesh>

        <mesh ref={signRef} position={[0, portalHeight + 1.2, 0]}>
          <boxGeometry args={[2.5, 0.4, 0.1]} />
          <meshStandardMaterial
            color={COLORS.neonYellow}
            emissive={COLORS.neonYellow}
            emissiveIntensity={0.8}
          />
        </mesh>

        <mesh position={[-0.8, portalHeight - 1, 0.3]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.15, 0.8, 0.1]} />
          <meshStandardMaterial
            color={COLORS.neonCyan}
            emissive={COLORS.neonCyan}
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[-0.6, portalHeight - 1.2, 0.3]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[0.12, 0.6, 0.1]} />
          <meshStandardMaterial
            color={COLORS.neonPink}
            emissive={COLORS.neonPink}
            emissiveIntensity={0.5}
          />
        </mesh>

        <mesh position={[0.8, portalHeight - 1, 0.3]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.15, 0.8, 0.1]} />
          <meshStandardMaterial
            color={COLORS.neonYellow}
            emissive={COLORS.neonYellow}
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0.6, portalHeight - 0.8, 0.3]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial
            color={COLORS.neonCyan}
            emissive={COLORS.neonCyan}
            emissiveIntensity={0.5}
          />
        </mesh>

        <mesh position={[-portalWidth - 0.5, 0.5, 0.35]}>
          <planeGeometry args={[0.4, 0.4]} />
          <meshStandardMaterial
            color={COLORS.neonPink}
            emissive={COLORS.neonPink}
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh position={[portalWidth + 0.5, 0.5, 0.35]}>
          <planeGeometry args={[0.4, 0.4]} />
          <meshStandardMaterial
            color={COLORS.neonCyan}
            emissive={COLORS.neonCyan}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      <pointLight
        ref={leftLightRef}
        position={[-portalWidth - 1, portalHeight / 2, 1]}
        color={COLORS.neonCyan}
        intensity={2}
        distance={8}
        decay={2}
      />
      <pointLight
        ref={rightLightRef}
        position={[portalWidth + 1, portalHeight / 2, 1]}
        color={COLORS.neonPink}
        intensity={2}
        distance={8}
        decay={2}
      />

      <spotLight
        position={[0, portalHeight + 2, 2]}
        target-position={[0, portalHeight / 2, 0]}
        angle={0.5}
        penumbra={0.3}
        intensity={2}
        distance={12}
        decay={2}
        color={COLORS.neonYellow}
      />
    </group>
  );
}
