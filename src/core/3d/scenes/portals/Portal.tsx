// Portal - Base portal component with animated vortex
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WorldType } from '../types';

// Seed-based random for deterministic values during render
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// World colors constant - defined outside component to avoid recreation on every render
const WORLD_COLORS: Record<WorldType, { vortex: string; frame: string; glow: string }> = {
  dev: {
    vortex: '#8b0000',
    frame: '#d4af37',
    glow: '#ff4400',
  },
  art: {
    vortex: '#4ecdc4',
    frame: '#2a2a3a',
    glow: '#ff6b6b',
  },
};

export interface PortalProps {
  position: [number, number, number];
  targetWorld: WorldType;
  rotation?: number;
  scale?: number;
  vortexColor?: string;
  frameColor?: string;
  glowColor?: string;
}

const DEFAULT_PROPS = {
  rotation: 0,
  scale: 1,
};

export function Portal({
  position,
  targetWorld,
  rotation = DEFAULT_PROPS.rotation,
  scale = DEFAULT_PROPS.scale,
  vortexColor,
  frameColor,
  glowColor,
}: PortalProps) {
  const groupRef = useRef<THREE.Group>(null);
  const vortexRef = useRef<THREE.Mesh>(null);
  const innerVortexRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);

  const resolvedColors = vortexColor && frameColor && glowColor
    ? { vortex: vortexColor, frame: frameColor, glow: glowColor }
    : WORLD_COLORS[targetWorld === 'dev' ? 'art' : 'dev'];
  const colorObjects = {
    vortex: new THREE.Color(resolvedColors.vortex),
    frame: new THREE.Color(resolvedColors.frame),
    glow: new THREE.Color(resolvedColors.glow),
  };

  const particleCount = 100;
  const particlesData = useRef(
    // Use deterministic seed-based random instead of Math.random
    Array.from({ length: particleCount }, (_, i) => ({
      angle: seededRandom(i * 3) * Math.PI * 2,
      radius: 2 + seededRandom(i * 5 + 100) * 2,
      height: (seededRandom(i * 7 + 200) - 0.5) * 6,
      speed: 0.5 + seededRandom(i * 11 + 300) * 1,
      riseSpeed: 0.2 + seededRandom(i * 13 + 400) * 0.3,
      scale: 0.05 + seededRandom(i * 17 + 500) * 0.1,
    }))
  );

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    if (vortexRef.current) {
      vortexRef.current.rotation.z = time * 0.5;
      const pulseScale = 1 + Math.sin(time * 2) * 0.05;
      vortexRef.current.scale.set(pulseScale, pulseScale, 1);
    }

    if (innerVortexRef.current) {
      innerVortexRef.current.rotation.z = -time * 0.7;
      const innerPulse = 0.7 + Math.sin(time * 3) * 0.1;
      innerVortexRef.current.scale.set(innerPulse, innerPulse, 1);
    }

    if (particlesRef.current) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < particleCount; i++) {
        const data = particlesData.current[i];
        data.angle += data.speed * delta;
        data.height += data.riseSpeed * delta;

        if (data.height > 3) {
          data.height = -3;
          data.angle = seededRandom(i * 19 + 600) * Math.PI * 2;
        }

        const x = Math.cos(data.angle) * data.radius;
        const z = Math.sin(data.angle) * data.radius * 0.3;

        dummy.position.set(x, data.height, z);
        dummy.scale.setScalar(data.scale);
        dummy.updateMatrix();
        particlesRef.current.setMatrixAt(i, dummy.matrix);
      }
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const portalHeight = 5;
  const portalWidth = 3;

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={scale}>
      <pointLight
        position={[0, portalHeight / 2, 0]}
        color={colorObjects.glow}
        intensity={3}
        distance={8}
        decay={2}
      />

      <mesh position={[0, portalHeight / 2, 0]} rotation={[0, 0, 0]}>
        <ringGeometry args={[portalWidth, portalWidth + 0.15, 32]} />
        <meshStandardMaterial
          color={colorObjects.frame}
          emissive={colorObjects.frame}
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={vortexRef} position={[0, portalHeight / 2, 0]} rotation={[0, 0, 0]}>
        <ringGeometry args={[portalWidth * 0.3, portalWidth - 0.2, 32]} />
        <meshBasicMaterial
          color={colorObjects.vortex}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={innerVortexRef} position={[0, portalHeight / 2, 0]} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.5, portalWidth * 0.5, 32]} />
        <meshBasicMaterial
          color={colorObjects.glow}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      <instancedMesh ref={particlesRef} args={[undefined as THREE.BufferGeometry | undefined, undefined as THREE.Material | undefined, particleCount]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color={colorObjects.glow}
          emissive={colorObjects.glow}
          emissiveIntensity={1}
          transparent
          opacity={0.8}
        />
      </instancedMesh>

      <ambientLight color={colorObjects.glow} intensity={0.3} />
    </group>
  );
}
