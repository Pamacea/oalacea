'use client';

import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, MeshStandardMaterial, PointLight } from 'three';
import { Text } from '@react-three/drei';
import { useModalStore } from '@/store/modal-store';

const colors = {
  pedestal: '#3a3a4a',
  pedestalTop: '#4a4a5a',
  frameWood: '#5c4033',
  frameGold: '#d4af37',
  neonRed: '#ff6b6b',
  neonTeal: '#4ecdc4',
  neonPink: '#ff9ff3',
  glow: '#00ffff',
  concrete: '#2a2a3a',
};

type ProjectCategory = {
  id: string;
  name: string;
  slug: string;
};

type ProjectData = {
  id: string;
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  year: number;
  category: string | ProjectCategory;
};

interface ArtDisplayProps {
  project: ProjectData;
  position: [number, number, number];
  isActive?: boolean;
  onInteract?: () => void;
}

export function ArtDisplay({ project, position, isActive = false, onInteract }: ArtDisplayProps) {
  const frameRef = useRef<Group>(null);
  const screenRef = useRef<Mesh>(null);
  const spotlightRef = useRef<Group>(null);
  const openProjectListing = useModalStore((s) => s.openProjectListing);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (screenRef.current && (isActive || hovered)) {
      const pulse = (Math.sin(time * 3) + 1) * 0.5;
      const mat = screenRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + pulse * 0.4;
    }

    if (spotlightRef.current && (isActive || hovered)) {
      spotlightRef.current.children.forEach((child, i) => {
        if (child.type === 'PointLight') {
          (child as PointLight).intensity = 2 + Math.sin(time * 2 + i) * 0.5;
        }
      });
    }
  });

  const getNeonColor = (categorySlug: string) => {
    switch (categorySlug) {
      case 'web': return colors.neonTeal;
      case 'mobile': return colors.neonPink;
      case 'ai': return colors.neonRed;
      case '3d': return colors.glow;
      default: return colors.neonTeal;
    }
  };

  const categorySlug = typeof project.category === 'string' ? project.category : project.category?.slug || 'web';
  const categoryName = typeof project.category === 'string' ? project.category.toUpperCase() : project.category?.name.toUpperCase() || 'PROJECT';

  const neonColor = getNeonColor(categorySlug);

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
    <group ref={frameRef} position={position}>
      {/* Gallery-style pedestal base */}
      <mesh castShadow position={[0, 0.75, 0]} receiveShadow>
        <boxGeometry args={[3.5, 1.5, 3.5]} />
        <meshStandardMaterial color={colors.concrete} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Wood trim on base */}
      <mesh position={[0, 0.75, 1.76]} castShadow>
        <boxGeometry args={[3.5, 0.1, 0.05]} />
        <meshStandardMaterial color={colors.frameWood} roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Main display column */}
      <mesh castShadow position={[0, 3, 0]}>
        <boxGeometry args={[2.5, 3, 2.5]} />
        <meshStandardMaterial color={colors.pedestal} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Top display frame - Gallery style */}
      <group position={[0, 5, 0]}>
        {/* Wood frame outer */}
        <mesh castShadow>
          <boxGeometry args={[4, 3, 0.3]} />
          <meshStandardMaterial color={colors.frameWood} roughness={0.5} metalness={0.3} />
        </mesh>

        {/* Gold inner frame */}
        <mesh position={[0, 0, 0.16]}>
          <boxGeometry args={[3.8, 2.8, 0.05]} />
          <meshStandardMaterial
            color={colors.frameGold}
            roughness={0.2}
            metalness={0.9}
            emissive={colors.frameGold}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Canvas/screen area */}
        <mesh
          ref={screenRef}
          position={[0, 0, 0.18]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <planeGeometry args={[3.5, 2.5]} />
          <meshStandardMaterial
            color={neonColor}
            emissive={neonColor}
            emissiveIntensity={isActive || hovered ? 0.6 : 0.2}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Neon accent frame */}
        <group position={[0, 0, 0.2]}>
          <mesh position={[0, 1.3, 0]}>
            <boxGeometry args={[3.6, 0.05, 0.02]} />
            <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={1} />
          </mesh>
          <mesh position={[0, -1.3, 0]}>
            <boxGeometry args={[3.6, 0.05, 0.02]} />
            <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={1} />
          </mesh>
          <mesh position={[1.75, 0, 0]}>
            <boxGeometry args={[0.05, 2.6, 0.02]} />
            <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={1} />
          </mesh>
          <mesh position={[-1.75, 0, 0]}>
            <boxGeometry args={[0.05, 2.6, 0.02]} />
            <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={1} />
          </mesh>
        </group>

        {/* Project title on canvas */}
        <Text
          position={[0, 0.5, 0.25]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="top"
          maxWidth={3}
          lineHeight={1.2}
        >
          {project.title}
        </Text>

        {/* Category badge */}
        <Text
          position={[0, -0.8, 0.25]}
          fontSize={0.12}
          color={neonColor}
          anchorX="center"
          anchorY="top"
        >
          [{categoryName}]
        </Text>
      </group>

      {/* Project info plaque */}
      <group position={[0, 2, 1.3]}>
        <mesh castShadow>
          <boxGeometry args={[2, 0.8, 0.05]} />
          <meshStandardMaterial
            color={colors.frameWood}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
        {/* Gold border */}
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[2.05, 0.85, 0.02]} />
          <meshStandardMaterial color={colors.frameGold} metalness={0.9} roughness={0.2} />
        </mesh>

        <Text
          position={[0, 0.2, 0.05]}
          fontSize={0.1}
          color={colors.frameGold}
          anchorX="center"
          anchorY="top"
          maxWidth={1.9}
        >
          {project.title}
        </Text>

        <Text
          position={[0, -0.15, 0.05]}
          fontSize={0.06}
          color="#cccccc"
          anchorX="center"
          anchorY="top"
          maxWidth={1.9}
          lineHeight={1.2}
        >
          {project.description}
        </Text>

        <Text
          position={[0, -0.35, 0.05]}
          fontSize={0.08}
          color={neonColor}
          anchorX="center"
          anchorY="top"
        >
          {project.year}
        </Text>
      </group>

      {/* Tech stack as floating neon pills */}
      <group position={[0, 3.5, 0]}>
        {project.techStack.slice(0, 3).map((tech, i) => (
          <group key={tech} position={[0, i * 0.35, 1.3]}>
            <mesh>
              <boxGeometry args={[0.9, 0.2, 0.05]} />
              <meshStandardMaterial
                color={neonColor}
                emissive={neonColor}
                emissiveIntensity={0.6}
                transparent
                opacity={0.8}
              />
            </mesh>
            <Text
              position={[0, 0, 0.03]}
              fontSize={0.08}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {tech}
            </Text>
          </group>
        ))}
      </group>

      {/* Museum spotlight */}
      <group ref={spotlightRef} position={[0, 8, 0]}>
        <spotLight
          target-position={[0, 5, 0]}
          angle={0.4}
          penumbra={0.3}
          intensity={isActive || hovered ? 3 : 1.5}
          distance={15}
          decay={2}
          color="#ffffff"
          castShadow
        />
      </group>

      {/* Active state indicators */}
      {(isActive || hovered) && (
        <>
          {/* Pulsing rings on ground */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[3.8, 4, 32]} />
            <meshBasicMaterial
              color={neonColor}
              transparent
              opacity={0.5}
            />
          </mesh>

          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[4.5, 4.6, 32]} />
            <meshBasicMaterial
              color={colors.frameGold}
              transparent
              opacity={0.3}
            />
          </mesh>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(i * Math.PI / 3) * 2.5,
                6 + Math.sin(i) * 0.5,
                Math.sin(i * Math.PI / 3) * 2.5,
              ]}
            >
              <sphereGeometry args={[0.06]} />
              <meshBasicMaterial color={neonColor} />
            </mesh>
          ))}

          {/* E to interact indicator */}
          <Text
            position={[0, 7, 0]}
            fontSize={0.25}
            color={neonColor}
            anchorX="center"
            anchorY="middle"
          >
            [E] VIEW
          </Text>

          {/* Additional glow light */}
          <pointLight position={[0, 6, 0]} color={neonColor} intensity={2} distance={10} decay={2} />
        </>
      )}

      {/* Ambient neon glow */}
      <pointLight position={[0, 4, 2]} color={neonColor} intensity={0.5} distance={6} />
    </group>
  );
}

// Collection of all project displays for Art World
export function ArtProjectDisplays({ activeProjectId }: { activeProjectId?: string }) {
  const projects = [
    {
      id: 'mobile-app',
      position: [12, 0, -18] as [number, number, number],
      project: {
        id: 'mobile-app',
        title: 'Task Manager App',
        slug: 'task-manager-app',
        description: 'Application mobile de gestion de tâches avec synchronisation offline',
        techStack: ['React Native', 'Expo', 'SQLite'],
        year: 2024,
        category: 'mobile' as const,
      },
    },
    {
      id: 'ai-chatbot',
      position: [-18, 0, 12] as [number, number, number],
      project: {
        id: 'ai-chatbot',
        title: 'AI Chat Assistant',
        slug: 'ai-chatbot',
        description: 'Chatbot IA avec intégration OpenAI et interface en temps réel',
        techStack: ['Node.js', 'OpenAI', 'WebSocket'],
        year: 2023,
        category: 'ai' as const,
      },
    },
  ];

  return (
    <>
      {projects.map(({ id, position, project }) => (
        <ArtDisplay
          key={id}
          project={project}
          position={position}
          isActive={activeProjectId === id}
        />
      ))}
    </>
  );
}
