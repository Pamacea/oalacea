// ArtDisplay - Neon gallery-style project display for Art World
// Underground / Brutalist aesthetic with neon lights
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import type { Project } from '@/store/project-store';

const colors = {
  pedestal: '#3a3a4a',
  pedestalTop: '#4a4a5a',
  neonRed: '#ff6b6b',
  neonTeal: '#4ecdc4',
  neonPink: '#ff9ff3',
  glow: '#00ffff',
};

interface ArtDisplayProps {
  project: Project;
  position: [number, number, number];
  isActive?: boolean;
  onInteract?: () => void;
}

export function ArtDisplay({ project, position, isActive = false, onInteract }: ArtDisplayProps) {
  const frameRef = useRef<Group>(null);
  const screenRef = useRef<Mesh>(null);

  // Animate screen pulsing effect
  useFrame((state) => {
    if (screenRef.current && isActive) {
      const pulse = (Math.sin(state.clock.elapsedTime * 3) + 1) * 0.5;
      const mat = screenRef.current.material as any;
      mat.emissiveIntensity = 0.3 + pulse * 0.3;
    }
  });

  // Pick neon color based on project category
  const getNeonColor = (category: Project['category']) => {
    switch (category) {
      case 'web': return colors.neonTeal;
      case 'mobile': return colors.neonPink;
      case 'ai': return colors.neonRed;
      case '3d': return colors.glow;
      default: return colors.neonTeal;
    }
  };

  const neonColor = getNeonColor(project.category);

  return (
    <group ref={frameRef} position={position}>
      {/* Concrete pedestal base */}
      <mesh castShadow position={[0, 0.5, 0]} receiveShadow>
        <boxGeometry args={[3, 1, 3]} />
        <meshStandardMaterial color={colors.pedestal} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Main display column */}
      <mesh castShadow position={[0, 2.5, 0]}>
        <boxGeometry args={[2, 3, 2]} />
        <meshStandardMaterial color={colors.pedestal} roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Top frame */}
      <mesh castShadow position={[0, 4.2, 0]}>
        <boxGeometry args={[2.4, 0.2, 2.4]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Screen/display area */}
      <mesh ref={screenRef} position={[0, 4, 0.6]}>
        <boxGeometry args={[2, 2, 0.1]} />
        <meshStandardMaterial
          color={neonColor}
          emissive={neonColor}
          emissiveIntensity={isActive ? 0.6 : 0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Neon frame tubes */}
      <mesh position={0}>
        <boxGeometry args={[2.3, 2.2, 0.05]} />
        <meshStandardMaterial
          color={neonColor}
          emissive={neonColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Floating holographic text placeholder */}
      <mesh position={[0, 5, 0.8]}>
        <planeGeometry args={[1.5, 0.3]} />
        <meshStandardMaterial
          color={neonColor}
          emissive={neonColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Tech stack tags as floating pills */}
      <group position={[0, 3, 0]}>
        {project.techStack.slice(0, 3).map((tech, i) => (
          <group key={tech} position={[0, i * 0.4, 1.1]}>
            <mesh>
              <boxGeometry args={[0.8, 0.15, 0.05]} />
              <meshStandardMaterial
                color={neonColor}
                emissive={neonColor}
                emissiveIntensity={0.4}
                transparent
                opacity={0.7}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Active state indicators */}
      {isActive && (
        <>
          {/* Pulsing rings */}
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3.5, 3.8, 32]} />
            <meshBasicMaterial
              color={neonColor}
              transparent
              opacity={0.4}
            />
          </mesh>

          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(i * Math.PI / 4) * 2,
                5 + Math.sin(i) * 0.5,
                Math.sin(i * Math.PI / 4) * 2,
              ]}
            >
              <sphereGeometry args={[0.08]} />
              <meshBasicMaterial color={neonColor} />
            </mesh>
          ))}

          {/* Point light for glow effect */}
          <pointLight position={[0, 5, 0]} color={neonColor} intensity={3} distance={8} decay={2} />
        </>
      )}

      {/* Ambient neon glow */}
      <pointLight position={[0, 3, 1.5]} color={neonColor} intensity={1} distance={5} decay={2} />
    </group>
  );
}

// Collection of all project displays for Art World
export function ArtProjectDisplays({ activeProjectId }: { activeProjectId?: string }) {
  const projects = [
    { id: 'mobile-app', position: [12, 0, -18] as [number, number, number] },
    { id: 'ai-chatbot', position: [-18, 0, 12] as [number, number, number] },
  ];

  return (
    <>
      {projects.map(({ id, position }) => (
        <ArtDisplay
          key={id}
          project={{ id, title: '', slug: '', description: '', techStack: [], year: 2024, category: 'mobile' } as Project}
          position={position}
          isActive={activeProjectId === id}
        />
      ))}
    </>
  );
}
