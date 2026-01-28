'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Object3D } from 'three';
import { Text } from '@react-three/drei';
import { AIGuide, type NPCProps } from './AIGuide';
import type { WorldType } from '@/core/3d/scenes/types';

interface ArtCuratorGuideProps {
  position?: [number, number, number];
}

const ART_CURATOR_COLORS = {
  primary: '#ff6b9d',
  secondary: '#4ecdc4',
  accent: '#2a2a4a',
};

const ART_CURATOR_GREETINGS = [
  'Hey there! Ready to explore some creative vibes?',
  'What\'s up, creator? Let\'s check out some art!',
  'Yo! The gallery\'s popping today.',
  'Welcome to the underground! Let\'s get inspired.',
];

const ART_CURATOR_SYSTEM_PROMPT = `You are a relaxed Art Curator serving as a guide in the Art World (Underground) of Oalacea portfolio.

Your personality: Chill, creative, enthusiastic, street-smart.
Your knowledge base: Focus on art projects, design work, visual creativity, street art.
Your voice style: Casual, using modern artistic slang (vibe, popping, fresh, sick, lit).

You guide visitors through:
- Creative portfolio projects (UI/UX design, illustrations, 3D art)
- Design process and artistic techniques
- Visual storytelling and aesthetics
- Street art and urban design influences

Keep responses concise (2-3 sentences max) but thematically consistent. Use phrases like:
- "That's a sick question!"
- "Let's vibe with this idea..."
- "This stuff is straight fire!"
- "The creative flow is real here..."

If asked about technical topics (coding, backend), suggest they visit the Dev World for such inquiries.`;

export function ArtCuratorGuide({
  position = [5, 0, 8],
}: ArtCuratorGuideProps) {
  const groupRef = useRef<Group>(null);
  const sprayCansRef = useRef<Group>(null);
  const neonRingRef = useRef<Mesh>(null);

  const greeting = useMemo(
    () => ART_CURATOR_GREETINGS[Math.floor(Math.random() * ART_CURATOR_GREETINGS.length)],
    []
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (neonRingRef.current) {
      const pulse = 1 + Math.sin(time * 3) * 0.15;
      neonRingRef.current.scale.setScalar(pulse);
      neonRingRef.current.rotation.z = time * 0.3;
    }

    if (sprayCansRef.current) {
      sprayCansRef.current.children.forEach((child, i) => {
        if (child instanceof Object3D && 'position' in child) {
          const offset = i * Math.PI / 3;
          const radius = 0.8 + Math.sin(time + offset) * 0.1;
          child.position.x = Math.cos(time * 0.5 + offset) * radius;
          child.position.z = Math.sin(time * 0.5 + offset) * radius;
          child.position.y = Math.sin(time * 2 + i) * 0.15 + 1.6;
        }
      });
    }
  });

  const baseProps: NPCProps = {
    position,
    world: 'art',
    npcId: 'art-curator-guide',
    npcName: 'Art Curator',
    primaryColor: ART_CURATOR_COLORS.primary,
    secondaryColor: ART_CURATOR_COLORS.secondary,
  };

  return (
    <group ref={groupRef} position={position}>
      <AIGuide {...baseProps} greeting={greeting} modelVariant="default" />

      <group ref={sprayCansRef}>
        {Array.from({ length: 4 }).map((_, i) => (
          <group key={i} rotation={[0, i * Math.PI / 2, 0]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.08, 0.25]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? ART_CURATOR_COLORS.primary : ART_CURATOR_COLORS.secondary}
                metalness={0.3}
                roughness={0.6}
              />
            </mesh>
            <mesh position={[0, 0.13, 0]}>
              <coneGeometry args={[0.05, 0.08, 8]} />
              <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      <mesh
        ref={neonRingRef}
        position={[0, 2.3, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.6, 0.04, 8, 32]} />
        <meshStandardMaterial
          color={ART_CURATOR_COLORS.primary}
          emissive={ART_CURATOR_COLORS.primary}
          emissiveIntensity={1.5}
        />
      </mesh>

      <mesh
        position={[0, 2.3, 0]}
        rotation={[Math.PI / 2, Math.PI / 4, 0]}
      >
        <torusGeometry args={[0.5, 0.03, 8, 32]} />
        <meshStandardMaterial
          color={ART_CURATOR_COLORS.secondary}
          emissive={ART_CURATOR_COLORS.secondary}
          emissiveIntensity={1.2}
        />
      </mesh>

      <Text
        position={[0, 3, 0]}
        fontSize={0.12}
        color={ART_CURATOR_COLORS.primary}
        anchorX="center"
        anchorY="top"
      >
        ART CURATOR
      </Text>

      <pointLight
        position={[0, 2, 0]}
        color={ART_CURATOR_COLORS.primary}
        intensity={0.6}
        distance={4}
      />
      <pointLight
        position={[0, 2, 0]}
        color={ART_CURATOR_COLORS.secondary}
        intensity={0.4}
        distance={3}
      />
    </group>
  );
}

export const ART_CURATOR_CONFIG = {
  systemPrompt: ART_CURATOR_SYSTEM_PROMPT,
  colors: ART_CURATOR_COLORS,
  npcId: 'art-curator-guide',
  npcName: 'Art Curator',
  world: 'art' as WorldType,
};
