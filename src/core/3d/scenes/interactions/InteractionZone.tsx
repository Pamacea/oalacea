// InteractionZone - Zone d'interaction avec indicateur visuel
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import type { WorldType } from '../types';
import type { ProximityObject } from '@/hooks/useProximity';

interface InteractionZoneProps {
  position: [number, number, number];
  radius?: number;
  label: string;
  route: string;
  worldType: WorldType;
  color?: string;
  /** ID unique pour la zone */
  id: string;
}

export function InteractionZone({
  position,
  radius = 3,
  label: _label,
  route: _route,
  worldType,
  color,
  id: _id,
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

  // Calculer pulseSpeed une seule fois pour éviter les avertissements ESLint
  const pulseSpeed = useMemo(() => 1.5 + Math.random() * 0.5, []);
  const baseRadius = radius;

  useFrame((state) => {
    if (!ringRef.current || !sphereRef.current) return;

    const time = state.clock.elapsedTime;

    // Pulsation du ring
    const pulseScale = 1 + Math.sin(time * pulseSpeed) * 0.1;
    ringRef.current.scale.setScalar(pulseScale);

    // Pulsation de la sphère
    const spherePulse = 1 + Math.sin(time * pulseSpeed * 1.5) * 0.15;
    sphereRef.current.scale.setScalar(spherePulse);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Anneau au sol */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[baseRadius - 0.2, baseRadius, 32]} />
        <meshBasicMaterial
          color={zoneColor}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Sphère flottante au centre */}
      <mesh ref={sphereRef} position={[0, 1, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={zoneColor}
          emissive={zoneColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Point light pour éclairer la zone */}
      <pointLight
        position={[0, 2, 0]}
        color={zoneColor}
        intensity={1.5}
        distance={radius * 2.5}
        decay={2}
      />
    </group>
  );
}

export function interactionZoneToProps(
  zone: Omit<InteractionZoneProps, 'worldType'>
): ProximityObject {
  return {
    id: zone.id,
    position: zone.position,
    radius: zone.radius || 3,
    data: {
      name: zone.label,
      route: zone.route,
    },
  };
}
