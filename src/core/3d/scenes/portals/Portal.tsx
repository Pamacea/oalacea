// Portal - Base portal component with animated vortex
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { WorldType } from '../types';

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

  const worldColors: Record<WorldType, { vortex: string; frame: string; glow: string }> = {
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

  const colors = vortexColor && frameColor && glowColor
    ? { vortex: vortexColor, frame: frameColor, glow: glowColor }
    : worldColors[targetWorld === 'dev' ? 'art' : 'dev'];

  const colorObjects = useMemo(() => ({
    vortex: new THREE.Color(colors.vortex),
    frame: new THREE.Color(colors.frame),
    glow: new THREE.Color(colors.glow),
  }), [colors]);

  const particleCount = 100;
  const particlesData = useMemo(() => {
    return Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 2 + Math.random() * 2,
      height: (Math.random() - 0.5) * 6,
      speed: 0.5 + Math.random() * 1,
      riseSpeed: 0.2 + Math.random() * 0.3,
      scale: 0.05 + Math.random() * 0.1,
    }));
  }, []);

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
        const data = particlesData[i];
        data.angle += data.speed * delta;
        data.height += data.riseSpeed * delta;

        if (data.height > 3) {
          data.height = -3;
          data.angle = Math.random() * Math.PI * 2;
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

      <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
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
