// ProjectPedestal - Interactive pedestal for displaying projects in 3D space
// Dev World style - Warhammer 40k / Imperium aesthetic
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group, Mesh, DoubleSide } from 'three';
import type { Project } from '@/store/project-store';

const COLORS = {
  black: '#1a1a1a',
  gold: '#d4af37',
  red: '#8b0000',
  glow: '#ff6600',
};

interface ProjectPedestalProps {
  project: Project;
  position: [number, number, number];
  isActive?: boolean;
  onInteract?: () => void;
}

export function ProjectPedestal({ project, position, isActive = false, onInteract }: ProjectPedestalProps) {
  const groupRef = useRef<Group>(null);
  const hologramRef = useRef<Mesh>(null);

  // Animate hologram effect
  useFrame((state) => {
    if (hologramRef.current) {
      hologramRef.current.position.y = 2.5 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      hologramRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base platform */}
      <mesh receiveShadow position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[2.5, 3, 0.5, 8]} />
        <meshStandardMaterial color={COLORS.black} roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Main pedestal column */}
      <mesh castShadow position={[0, 1.5, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 2, 3, 8]} />
        <meshStandardMaterial color={COLORS.black} roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Gold rings */}
      <mesh position={[0, 1, 0]} castShadow>
        <torusGeometry args={[1.8, 0.15, 8, 16]} />
        <meshStandardMaterial
          color={COLORS.gold}
          roughness={0.3}
          metalness={0.8}
          emissive={COLORS.gold}
          emissiveIntensity={isActive ? 0.5 : 0.2}
        />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow>
        <torusGeometry args={[1.4, 0.1, 8, 16]} />
        <meshStandardMaterial color={COLORS.gold} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Top platform */}
      <mesh castShadow position={[0, 3.2, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 2, 0.3, 8]} />
        <meshStandardMaterial color={COLORS.black} roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Holographic display */}
      <mesh ref={hologramRef} position={[0, 2.5, 0]}>
        <boxGeometry args={[1.2, 0.8, 1.2]} />
        <meshStandardMaterial
          color={COLORS.glow}
          transparent
          opacity={0.3}
          emissive={COLORS.glow}
          emissiveIntensity={isActive ? 0.8 : 0.3}
        />
      </mesh>

      {/* Project title hologram */}
      <mesh position={[0, 3.5, 0]}>
        <planeGeometry args={[2, 0.3]} />
        <meshStandardMaterial
          color={isActive ? COLORS.glow : COLORS.gold}
          emissive={isActive ? COLORS.glow : COLORS.gold}
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Floating data-slates (project info) */}
      <group position={[0, 4, 0]}>
        {project.techStack.slice(0, 3).map((tech, i) => (
          <mesh
            key={tech}
            position={[Math.cos(i * Math.PI * 2 / 3) * 1.5, 0, Math.sin(i * Math.PI * 2 / 3) * 1.5]}
            rotation={[0, 0, Math.PI / 4]}
          >
            <planeGeometry args={[0.6, 0.6]} />
            <meshStandardMaterial
              color={COLORS.gold}
              emissive={COLORS.gold}
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
              side={DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Interaction indicator */}
      {isActive && (
        <>
          {/* Glowing ring */}
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3.2, 3.5, 32]} />
            <meshBasicMaterial
              color={COLORS.glow}
              transparent
              opacity={0.5}
            />
          </mesh>

          {/* Press E indicator */}
          <mesh position={[0, 5, 0]}>
            <sphereGeometry args={[0.3]} />
            <meshBasicMaterial color={COLORS.glow} />
          </mesh>
          <pointLight position={[0, 5, 0]} color={COLORS.glow} intensity={2} distance={5} decay={2} />
        </>
      )}
    </group>
  );
}

// Collection of all project pedestals for Dev World
export function DevProjectPedestals({ activeProjectId }: { activeProjectId?: string }) {
  const projects = [
    { id: 'oalacea', position: [15, 0, 10] as [number, number, number] },
    { id: 'ecommerce-platform', position: [-15, 0, 15] as [number, number, number] },
  ];

  return (
    <>
      {projects.map(({ id, position }) => (
        <ProjectPedestal
          key={id}
          project={{ id, title: '', slug: '', description: '', techStack: [], year: 2024, category: 'web' } as Project}
          position={position}
          isActive={activeProjectId === id}
        />
      ))}
    </>
  );
}
