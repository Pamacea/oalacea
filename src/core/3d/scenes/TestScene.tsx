// TestScene - Scène de test avec cube pour Phase 1
'use client';

import { meshBounds } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WorldType } from './types';

interface TestSceneProps {
  worldType: WorldType;
}

export function TestScene({ worldType }: TestSceneProps) {
  const cubeRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Animation de rotation du cube
  useFrame((state, delta) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += delta * 0.5;
      cubeRef.current.rotation.y += delta * 0.3;
    }
  });

  // Couleurs selon le monde
  const colors = {
    dev: {
      cube: '#d4af37', // Gold
      glow: '#8b0000', // Dark red
    },
    art: {
      cube: '#ff6b6b', // Neon red
      glow: '#4ecdc4', // Turquoise
    },
  }[worldType];

  return (
    <group>
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color={worldType === 'dev' ? '#1a1a1a' : '#16213e'}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Cube de test */}
      <mesh
        ref={cubeRef}
        position={[0, 1, 0]}
        scale={hovered ? 1.2 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial
          color={hovered ? colors.glow : colors.cube}
          roughness={0.3}
          metalness={0.7}
          emissive={hovered ? colors.glow : colors.cube}
          emissiveIntensity={hovered ? 0.5 : 0.1}
        />
      </mesh>

      {/* Lumières décoratives */}
      <mesh position={[5, 2, 5]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={colors.glow} />
        <pointLight color={colors.glow} intensity={2} distance={10} />
      </mesh>

      <mesh position={[-5, 2, -5]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={colors.cube} />
        <pointLight color={colors.cube} intensity={2} distance={10} />
      </mesh>

      {/* Grille de référence */}
      <gridHelper
        args={[50, 50, worldType === 'dev' ? '#333333' : '#2a2a4a', '#222222']}
        position={[0, -0.49, 0]}
      />
    </group>
  );
}
