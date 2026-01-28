'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3, Color } from 'three';
import { Text } from '@react-three/drei';
import { useCharacterStore } from '@/store/3d-character-store';
import type { WorldType } from '@/core/3d/scenes/types';

export interface NPCProps {
  position: [number, number, number];
  world: WorldType;
  npcId: string;
  npcName: string;
  primaryColor: string;
  secondaryColor: string;
  onInteract?: () => void;
}

interface AIGuideProps extends NPCProps {
  greeting?: string;
  modelVariant?: 'default' | 'tall' | 'short';
}

export function AIGuide({
  position,
  world,
  npcId,
  npcName,
  primaryColor,
  secondaryColor,
  greeting = 'Hello, traveler!',
  modelVariant = 'default',
  onInteract,
}: AIGuideProps) {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Mesh>(null);
  const bubbleRef = useRef<Group>(null);

  const [isNearby, setIsNearby] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  const characterPosition = useCharacterStore((s) => s.position);

  const colors = useMemo(() => ({
    primary: new Color(primaryColor),
    secondary: new Color(secondaryColor),
  }), [primaryColor, secondaryColor]);

  const modelHeight = modelVariant === 'tall' ? 2.2 : modelVariant === 'short' ? 1.4 : 1.8;
  const bodyWidth = modelVariant === 'tall' ? 0.7 : modelVariant === 'short' ? 0.9 : 0.8;

  useEffect(() => {
    const npcPosition = new Vector3(...position);
    const charPosition = new Vector3(...characterPosition);
    const distance = npcPosition.distanceTo(charPosition);

    const wasNearby = isNearby;
    const nowNearby = distance < 4;

    setIsNearby(nowNearby);

    if (!wasNearby && nowNearby) {
      setShowBubble(true);
    } else if (wasNearby && !nowNearby) {
      setShowBubble(false);
    }
  }, [characterPosition, position, isNearby]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (bodyRef.current) {
      bodyRef.current.position.y = Math.sin(time * 1.2) * 0.08 + modelHeight / 2;
    }
    if (headRef.current) {
      headRef.current.position.y = Math.sin(time * 1.2) * 0.08 + modelHeight + 0.3;
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
    if (bubbleRef.current) {
      bubbleRef.current.position.y = Math.sin(time * 1.2) * 0.08 + modelHeight + 0.9;
      const scale = 1 + Math.sin(time * 3) * 0.05;
      bubbleRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={bodyRef} castShadow receiveShadow>
        <capsuleGeometry args={[bodyWidth / 2, modelHeight * 0.6, 8, 16]} />
        <meshStandardMaterial
          color={colors.primary}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      <mesh ref={headRef} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial
          color={colors.secondary}
          emissive={colors.secondary}
          emissiveIntensity={0.2}
        />
      </mesh>

      {isNearby && showBubble && (
        <group ref={bubbleRef}>
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial
              color="#1a1a2e"
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh position={[0, 0.6, 0.45]}>
            <coneGeometry args={[0.55, 0.3, 4]} />
            <meshStandardMaterial
              color="#1a1a2e"
              transparent
              opacity={0.9}
            />
            <mesh rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.55, 0.3, 4]} />
              <meshStandardMaterial
                color="#1a1a2e"
                transparent
                opacity={0.9}
              />
            </mesh>
          </mesh>
          <Text
            position={[0, 0.7, 0.35]}
            fontSize={0.12}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.8}
            textAlign="center"
          >
            {greeting}
          </Text>
          <Text
            position={[0, 0.5, 0.35]}
            fontSize={0.08}
            color={primaryColor}
            anchorX="center"
            anchorY="middle"
          >
            [E] Talk
          </Text>
        </group>
      )}

      <pointLight
        position={[0, modelHeight + 0.5, 0]}
        color={colors.primary}
        intensity={0.5}
        distance={3}
      />

      {isNearby && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.2, 1.3, 32]} />
          <meshBasicMaterial
            color={colors.primary}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

export type { AIGuideProps };
