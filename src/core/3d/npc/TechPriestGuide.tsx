'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Object3D } from 'three';
import { Text } from '@react-three/drei';
import { AIGuide, type NPCProps } from './AIGuide';
import type { WorldType } from '@/core/3d/scenes/types';

interface TechPriestGuideProps {
  position?: [number, number, number];
}

const TECH_PRIEST_COLORS = {
  primary: '#d4af37',
  secondary: '#8b0000',
  accent: '#1a1a1a',
};

const TECH_PRIEST_GREETINGS = [
  'Greetings, traveler. The Machine Spirits await.',
  'Blessings of the Omnissiah upon you.',
  'Your presence has been noted in the data-log.',
  'The cogitators predict great things.',
];

const TECH_PRIEST_SYSTEM_PROMPT = `You are a Tech Priest from the Warhammer 40k universe serving as a guide in the Dev World of Oalacea portfolio.

Your personality: Ceremonial, precise, reverent towards technology.
Your knowledge base: Focus on technical projects, development work, coding, and engineering.
Your voice style: Formal, using tech-priest terminology (Machine Spirit, Omnissiah, cogitator, data-log).

You guide visitors through:
- Technical portfolio projects (web development, backend systems, databases)
- Engineering approach and technologies used
- Code quality and architecture decisions

Keep responses concise (2-3 sentences max) but thematically consistent. Use phrases like:
- "The Machine Spirits are pleased with your inquiry."
- "Accessing the sacred data-logs..."
- "By the blessed Omnissiah..."
- "The cogitators have processed your query."

If asked about non-technical topics (art, design), suggest they visit the Art World for such inquiries.`;

export function TechPriestGuide({
  position = [-5, 0, 8],
}: TechPriestGuideProps) {
  const groupRef = useRef<Group>(null);
  const mechadendritesRef = useRef<Group>(null);
  const haloRef = useRef<Mesh>(null);

  const greeting = useMemo(
    () => TECH_PRIEST_GREETINGS[Math.floor(Math.random() * TECH_PRIEST_GREETINGS.length)],
    []
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (haloRef.current) {
      haloRef.current.rotation.y = time * 0.2;
      const pulse = 1 + Math.sin(time * 2) * 0.1;
      haloRef.current.scale.setScalar(pulse);
    }

    if (mechadendritesRef.current) {
      mechadendritesRef.current.children.forEach((child, i) => {
        if (child instanceof Object3D && 'position' in child) {
          const offset = i * 0.5;
          child.position.x = Math.cos(time * 0.8 + offset) * 0.6;
          child.position.z = Math.sin(time * 0.8 + offset) * 0.6;
          child.position.y = Math.sin(time * 1.5 + offset) * 0.2 + 1.8;
        }
      });
    }
  });

  const baseProps: NPCProps = {
    position,
    world: 'dev',
    npcId: 'tech-priest-guide',
    npcName: 'Tech Priest',
    primaryColor: TECH_PRIEST_COLORS.primary,
    secondaryColor: TECH_PRIEST_COLORS.secondary,
  };

  return (
    <group ref={groupRef} position={position}>
      <AIGuide {...baseProps} greeting={greeting} modelVariant="tall" />

      <group ref={mechadendritesRef}>
        {Array.from({ length: 6 }).map((_, i) => (
          <group key={i}>
            <mesh>
              <cylinderGeometry args={[0.03, 0.03, 0.8]} />
              <meshStandardMaterial
                color={TECH_PRIEST_COLORS.primary}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial
                color={TECH_PRIEST_COLORS.secondary}
                emissive={TECH_PRIEST_COLORS.secondary}
                emissiveIntensity={0.5}
              />
            </mesh>
          </group>
        ))}
      </group>

      <mesh ref={haloRef} position={[0, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.05, 8, 32]} />
        <meshStandardMaterial
          color={TECH_PRIEST_COLORS.primary}
          emissive={TECH_PRIEST_COLORS.primary}
          emissiveIntensity={0.8}
        />
      </mesh>

      <Text
        position={[0, 3.2, 0]}
        fontSize={0.15}
        color={TECH_PRIEST_COLORS.primary}
        anchorX="center"
        anchorY="top"
      >
        TECH PRIEST
      </Text>

      <pointLight
        position={[0, 2, 0]}
        color={TECH_PRIEST_COLORS.primary}
        intensity={0.8}
        distance={4}
      />
    </group>
  );
}

export const TECH_PRIEST_CONFIG = {
  systemPrompt: TECH_PRIEST_SYSTEM_PROMPT,
  colors: TECH_PRIEST_COLORS,
  npcId: 'tech-priest-guide',
  npcName: 'Tech Priest',
  world: 'dev' as WorldType,
};
