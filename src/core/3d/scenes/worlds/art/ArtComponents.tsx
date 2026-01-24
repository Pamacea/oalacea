// Art world components
'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const colors = {
  wall: '#2a2a3a',
  pedestal: '#3a3a4a',
  pedestalTop: '#4a4a5a',
  neonRed: '#ff6b6b',
  neonTeal: '#4ecdc4',
  neonYellow: '#feca57',
  neonPink: '#ff9ff3',
  gold: '#d4af37',
};

export function ConcreteWall({ position, rotation, scale }: {
  position: [number, number, number];
  rotation: number;
  scale: [number, number, number];
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 8, 1]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, 4, 0.51]}>
        <planeGeometry args={[0.8, 2]} />
        <meshStandardMaterial color={colors.neonRed} emissive={colors.neonRed} emissiveIntensity={0.3} />
      </mesh>
      <pointLight position={[0, 5, 1]} color={colors.neonRed} intensity={2} distance={8} decay={2} />
    </group>
  );
}

export function NeonSign({ position, color, label }: {
  position: [number, number, number];
  color: string;
  label: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh>
        <boxGeometry args={[4, 1.5, 0.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[4.2, 1.7, 0.1]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} transparent opacity={0.5} />
      </mesh>
      <pointLight position={[0, 0, 1]} color={color} intensity={3} distance={15} decay={2} />
    </group>
  );
}

export function ArtPedestal({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 2, 2, 6]} />
        <meshStandardMaterial color={colors.pedestal} roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.5, 0.3, 6]} />
        <meshStandardMaterial color={colors.pedestalTop} roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[0, 3, 0]} castShadow>
        <icosahedronGeometry args={[0.8]} />
        <meshStandardMaterial color={colors.neonTeal} roughness={0.2} metalness={0.8} emissive={colors.neonTeal} emissiveIntensity={0.2} />
      </mesh>
      <spotLight position={[0, 6, 0]} target-position={[0, 2, 0]} angle={0.5} penumbra={0.3} intensity={2} distance={10} decay={2} color="#fff" />
    </group>
  );
}

export function SprayCan({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, Math.PI / 2]}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 12]} />
        <meshStandardMaterial color={colors.neonRed} roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 0.3, 12]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.7} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.2, 8]} />
        <meshStandardMaterial color="#222" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  );
}

export function GalleryFrame({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[5, 4, 0.3]} />
        <meshStandardMaterial color={colors.gold} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 3, 0.16]}>
        <planeGeometry args={[4.5, 3.5]} />
        <meshStandardMaterial color="#1a1a2e" emissive={colors.neonRed} emissiveIntensity={0.1} />
      </mesh>
      <pointLight position={[0, 3, 1]} color="#feca57" intensity={1.5} distance={8} decay={2} />
    </group>
  );
}

export function NeonParticles({ count = 250 }: { count?: number }) {
  const instancesRef = useRef<THREE.InstancedMesh>(null);
  const neonColors = [colors.neonRed, colors.neonTeal, colors.neonYellow, colors.neonPink];
  const colorObjects = useMemo(() => neonColors.map(c => new THREE.Color(c)), []);

  const particlesData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 80,
        Math.random() * 3 + 0.5,
        (Math.random() - 0.5) * 80
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.6
      ),
      baseY: Math.random() * 3 + 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.7,
      scale: Math.random() * 0.12 + 0.04,
      colorIndex: Math.floor(Math.random() * neonColors.length),
    }));
  }, [count]);

  useFrame((state, delta) => {
    if (!instancesRef.current) return;
    const dummy = new THREE.Object3D();
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const data = particlesData[i];
      data.position.x += data.velocity.x * delta;
      data.position.z += data.velocity.z * delta;

      if (data.position.x > 45) data.position.x = -45;
      if (data.position.x < -45) data.position.x = 45;
      if (data.position.z > 45) data.position.z = -45;
      if (data.position.z < -45) data.position.z = 45;

      data.position.y = data.baseY + Math.sin(time * data.speed + data.phase) * 0.4;
      const pulseScale = data.scale * (0.8 + Math.sin(time * data.speed * 2) * 0.3);

      dummy.position.copy(data.position);
      dummy.scale.setScalar(pulseScale);
      dummy.updateMatrix();
      instancesRef.current.setMatrixAt(i, dummy.matrix);
      instancesRef.current.setColorAt(i, colorObjects[data.colorIndex]);
    }

    instancesRef.current.instanceMatrix.needsUpdate = true;
    if (instancesRef.current.instanceColor) {
      instancesRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={instancesRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} transparent opacity={0.6} />
    </instancedMesh>
  );
}
