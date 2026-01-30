'use client';

import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, DoubleSide, Vector3 } from 'three';
import { Text } from '@react-three/drei';
import { useModalStore } from '@/store/modal-store';
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
  const plaqueRef = useRef<Mesh>(null);
  const openProjectListing = useModalStore((s) => s.openProjectListing);
  const [hovered, setHovered] = useState(false);
  const [pulseScale, setPulseScale] = useState(1);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (hologramRef.current) {
      hologramRef.current.position.y = 3.5 + Math.sin(time * 1.5) * 0.15;
      hologramRef.current.rotation.y = time * 0.3;
    }

    if (isActive || hovered) {
      const pulse = 1 + Math.sin(time * 4) * 0.05;
      setPulseScale(pulse);
    } else {
      setPulseScale(1);
    }
  });

  const handleClick = useCallback(() => {
    openProjectListing();
    onInteract?.();
  }, [openProjectListing, onInteract]);

  const handlePointerOver = useCallback(() => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {/* Base platform */}
      <mesh receiveShadow position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[3, 3.5, 0.5, 8]} />
        <meshStandardMaterial color={COLORS.black} roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Decorative base ring */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <torusGeometry args={[3.3, 0.1, 8, 32]} />
        <meshStandardMaterial
          color={COLORS.gold}
          roughness={0.3}
          metalness={0.8}
          emissive={COLORS.gold}
          emissiveIntensity={isActive ? 0.5 : 0.2}
        />
      </mesh>

      {/* Main pedestal column */}
      <mesh castShadow position={[0, 2, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2.5, 4, 8]} />
        <meshStandardMaterial color={COLORS.black} roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Gold rings - Imperial style */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <torusGeometry args={[2.3, 0.15, 8, 16]} />
        <meshStandardMaterial
          color={COLORS.gold}
          roughness={0.3}
          metalness={0.8}
          emissive={COLORS.gold}
          emissiveIntensity={isActive ? 0.6 : 0.3}
        />
      </mesh>
      <mesh position={[0, 2.8, 0]} castShadow>
        <torusGeometry args={[1.8, 0.1, 8, 16]} />
        <meshStandardMaterial color={COLORS.gold} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Top platform */}
      <mesh castShadow position={[0, 4.2, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.5, 0.4, 8]} />
        <meshStandardMaterial color={COLORS.black} roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Aquila symbol on top */}
      <mesh position={[0, 4.45, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 6]} />
        <meshStandardMaterial color={COLORS.gold} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Project plaque */}
      <group ref={plaqueRef} position={[0, 2, 1.3]} rotation={[0, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.4, 1.6, 0.1]} />
          <meshStandardMaterial
            color={COLORS.black}
            metalness={0.8}
            roughness={0.3}
            emissive={isActive ? COLORS.glow : COLORS.black}
            emissiveIntensity={isActive ? 0.2 : 0}
          />
        </mesh>
        {/* Gold border */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[2.5, 1.7, 0.02]} />
          <meshStandardMaterial color={COLORS.gold} metalness={1} roughness={0.2} />
        </mesh>

        {/* Project title */}
        <Text
          position={[0, 0.4, 0.07]}
          fontSize={0.15}
          color={COLORS.gold}
          anchorX="center"
          anchorY="top"
          maxWidth={2.2}
        >
          {project.title}
        </Text>

        {/* Project description */}
        <Text
          position={[0, -0.1, 0.07]}
          fontSize={0.08}
          color="#cccccc"
          anchorX="center"
          anchorY="top"
          maxWidth={2.2}
          lineHeight={1.3}
        >
          {project.description}
        </Text>

        {/* Year */}
        <Text
          position={[0, -0.6, 0.07]}
          fontSize={0.1}
          color={COLORS.glow}
          anchorX="center"
          anchorY="top"
        >
          {project.year}
        </Text>
      </group>

      {/* Holographic display */}
      <mesh
        ref={hologramRef}
        position={[0, 3.5, 0]}
        scale={pulseScale}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <octahedronGeometry args={[0.6]} />
        <meshStandardMaterial
          color={hovered ? COLORS.glow : COLORS.gold}
          transparent
          opacity={0.6}
          emissive={hovered ? COLORS.glow : COLORS.gold}
          emissiveIntensity={hovered ? 0.8 : 0.4}
        />
      </mesh>

      {/* Tech stack orbiting icons */}
      <group position={[0, 3.5, 0]}>
        {project.techStack.slice(0, 4).map((tech, i) => {
          const angle = (i / 4) * Math.PI * 2 + (isActive ? 0 : Math.PI / 4);
          const radius = 1.2;
          return (
            <group
              key={tech}
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[0, -angle, 0]}
            >
              <mesh>
                <boxGeometry args={[0.4, 0.15, 0.4]} />
                <meshStandardMaterial
                  color={COLORS.gold}
                  emissive={COLORS.gold}
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.8}
                  side={DoubleSide}
                />
              </mesh>
              <Text
                position={[0, 0.15, 0]}
                fontSize={0.06}
                color={COLORS.gold}
                anchorX="center"
                anchorY="middle"
              >
                {tech.substring(0, 3)}
              </Text>
            </group>
          );
        })}
      </group>

      {/* Interaction indicator */}
      {(isActive || hovered) && (
        <>
          {/* Glowing ring */}
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={pulseScale}>
            <ringGeometry args={[3.8, 4, 32]} />
            <meshBasicMaterial
              color={COLORS.glow}
              transparent
              opacity={0.4}
            />
          </mesh>

          {/* Second ring */}
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={pulseScale * 1.1}>
            <ringGeometry args={[4.2, 4.3, 32]} />
            <meshBasicMaterial
              color={COLORS.gold}
              transparent
              opacity={0.3}
            />
          </mesh>

          {/* E to interact indicator */}
          <Text
            position={[0, 5.5, 0]}
            fontSize={0.3}
            color={COLORS.glow}
            anchorX="center"
            anchorY="middle"
          >
            [E] READ
          </Text>

          <pointLight position={[0, 5, 0]} color={COLORS.glow} intensity={2} distance={8} decay={2} />
        </>
      )}

      {/* Ambient glow */}
      <pointLight position={[0, 3, 2]} color={COLORS.gold} intensity={0.5} distance={6} />
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
          project={{
            id,
            title: 'Oalacea 3D Portfolio',
            slug: 'oalacea',
            description: 'Portfolio interactif 3D avec Three.js et React Three Fiber',
            techStack: ['Next.js', 'R3F', 'Three.js', 'Prisma'],
            year: 2025,
            category: '3d',
          } as Project}
          position={position}
          isActive={activeProjectId === id}
        />
      ))}
    </>
  );
}
