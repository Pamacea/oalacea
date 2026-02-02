'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import type { WorldType } from '../types';
import type { ProximityObject } from '@/features/3d-world/hooks';
import { InSceneLabel } from './InSceneLabel';

interface InteractionZoneProps {
  position: [number, number, number];
  radius?: number;
  label: string;
  route: string;
  worldType: WorldType;
  color?: string;
  id: string;
  type?: 'portal' | 'route' | 'dialogue' | 'pickup' | 'admin';
  targetWorld?: WorldType;
  isActive?: boolean;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export function InteractionZone({
  position,
  radius = 3,
  label: _label,
  route,
  worldType,
  color,
  id,
  type = 'route',
  targetWorld,
  isActive = false,
}: InteractionZoneProps) {
  const groupRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const sphereRef = useRef<Mesh>(null);

  const colors = {
    dev: {
      primary: '#d4af37',
      glow: '#8b0000',
    },
    art: {
      primary: '#ff6b6b',
      glow: '#4ecdc4',
    },
  }[worldType];

  const zoneColor = color || colors.primary;

  const pulseSpeed = useMemo(() => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 1.5 + ((hash % 100) / 100) * 0.5;
  }, [id]);
  const baseRadius = radius;

  useFrame((state) => {
    if (!ringRef.current || !sphereRef.current) return;

    const time = state.clock.elapsedTime;

    const pulseScale = isActive ? 1 + Math.sin(time * pulseSpeed * 1.5) * 0.15 : 1 + Math.sin(time * pulseSpeed) * 0.1;
    ringRef.current.scale.setScalar(pulseScale);

    const spherePulse = isActive ? 1 + Math.sin(time * pulseSpeed * 2) * 0.2 : 1 + Math.sin(time * pulseSpeed * 1.5) * 0.15;
    sphereRef.current.scale.setScalar(spherePulse);
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[baseRadius - 0.2, baseRadius, 32]} />
        <meshBasicMaterial
          color={zoneColor}
          transparent
          opacity={isActive ? 0.6 : 0.4}
        />
      </mesh>

      <mesh ref={sphereRef} position={[0, 1, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={zoneColor}
          emissive={zoneColor}
          emissiveIntensity={isActive ? 1.2 : 0.8}
        />
      </mesh>

      <pointLight
        position={[0, 2, 0]}
        color={zoneColor}
        intensity={isActive ? 2 : 1.5}
        distance={radius * 2.5}
        decay={2}
      />

      <InSceneLabel
        position={[0, 4.5, 0]}
        label={_label}
        type={type}
        isActive={isActive}
        targetWorld={targetWorld}
      />
    </group>
  );
}

export function interactionZoneToProps(
  zone: Omit<InteractionZoneProps, 'worldType' | 'isActive'>
): ProximityObject {
  // biome-ignore lint/style/noUnusedTsParameters: route is used in the returned data object
  return {
    id: zone.id,
    position: zone.position,
    radius: zone.radius || 3,
    data: {
      name: zone.label,
      route: zone.route,
      type: zone.type,
      targetWorld: zone.targetWorld,
    },
  };
}
