// Dev world components - Imperium Warhammer 40k style
'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COLORS = {
  black: '#1a1a1a',
  gold: '#d4af37',
  red: '#8b0000',
  green: '#00ff88',
};

export function ImperialPillar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 4, 0]}>
        <cylinderGeometry args={[1.2, 1.5, 8, 8]} />
        <meshStandardMaterial color={COLORS.black} roughness={0.8} metalness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 7.5, 0]}>
        <boxGeometry args={[3, 0.8, 3]} />
        <meshStandardMaterial color={COLORS.gold} roughness={0.3} metalness={0.8} emissive={COLORS.gold} emissiveIntensity={0.2} />
      </mesh>
      <mesh receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[2, 2.2, 0.5, 8]} />
        <meshStandardMaterial color={COLORS.gold} roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 8.3, 0]}>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color={COLORS.red} roughness={0.2} metalness={0.9} emissive={COLORS.red} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export function GothicArch({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[-3, 6, 0]} castShadow>
        <boxGeometry args={[1, 12, 1]} />
        <meshStandardMaterial color={COLORS.black} roughness={0.7} metalness={0.4} />
      </mesh>
      <mesh position={[3, 6, 0]} castShadow>
        <boxGeometry args={[1, 12, 1]} />
        <meshStandardMaterial color={COLORS.black} roughness={0.7} metalness={0.4} />
      </mesh>
      <mesh position={[0, 12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[3, 0.4, 8, 16, Math.PI]} />
        <meshStandardMaterial color={COLORS.gold} roughness={0.3} metalness={0.8} emissive={COLORS.gold} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

export function DevTerminal({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color={COLORS.black} roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2, 0.51]}>
        <planeGeometry args={[1.6, 1.5]} />
        <meshStandardMaterial color={COLORS.green} emissive={COLORS.green} emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0, 2.5, 1]} color={COLORS.green} intensity={1} distance={5} decay={2} />
    </group>
  );
}

export function DustParticles({ count = 300 }: { count?: number }) {
  const instancesRef = useRef<THREE.InstancedMesh>(null);

  const particlesData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 80,
        Math.random() * 3 + 0.5,
        (Math.random() - 0.5) * 80
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.5
      ),
      baseY: Math.random() * 3 + 0.5,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
      scale: Math.random() * 0.15 + 0.05,
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

      data.position.y = data.baseY + Math.sin(time * data.speed + data.phase) * 0.3;
      dummy.position.copy(data.position);
      dummy.scale.setScalar(data.scale);
      dummy.updateMatrix();
      instancesRef.current.setMatrixAt(i, dummy.matrix);
    }
    instancesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancesRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color={COLORS.gold} emissive={COLORS.gold} emissiveIntensity={0.3} transparent opacity={0.3} />
    </instancedMesh>
  );
}
