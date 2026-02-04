'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

// Seed-based random for deterministic values during render
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface BlogCategory {
  id?: string;
  name: string;
  slug: string;
}

interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishDate: Date | null;
  createdAt: Date;
  readingTime: number | null;
  featured: boolean;
  published: boolean;
  category: BlogCategory | null;
}

interface BlogDocumentProps {
  post: BlogPostData;
  position: [number, number, number];
  world: 'DEV' | 'ART';
  isActive?: boolean;
}

const DEV_COLORS = {
  base: 0x1a1a1a,
  gold: 0xd4af37,
  green: 0x00ff88,
  glow: 0x00ff44,
  neonPink: 0xff6b6b,
  neonTeal: 0x4ecdc4,
  neonYellow: 0xffe66d,
};

const ART_COLORS = {
  base: 0x2a2a3a,
  gold: 0xd4af37,
  green: 0x4ecdc4,
  glow: 0x4ecdc4,
  neonPink: 0xff6b6b,
  neonTeal: 0x4ecdc4,
  neonYellow: 0xffe66d,
};

const CATEGORY_COLOR_MAP: Record<string, number> = {
  technology: 0x00ff88,
  dev: 0x00ff44,
  design: 0xff6b6b,
  art: 0x4ecdc4,
  tutorial: 0xffe66d,
  default: 0x4ecdc4,
};

function getCategoryColor(category: { slug?: string | null } | null, baseColor: number): number {
  if (!category) return baseColor;
  const slug = category.slug || null;
  if (!slug) return baseColor;
  const normalized = slug.toLowerCase();
  return CATEGORY_COLOR_MAP[normalized] ?? CATEGORY_COLOR_MAP.default;
}

export function BlogDocument({ post, position, world, isActive = false }: BlogDocumentProps) {
  const groupRef = useRef<Group>(null);
  const hologramRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const particlesRef = useRef<Group>(null);

  const colors = world === 'DEV' ? DEV_COLORS : ART_COLORS;
  const categoryColor = getCategoryColor(post.category, colors.green);

  // Particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    angle: (i / 8) * Math.PI * 2,
    radius: 1.5 + seededRandom(i * 3) * 0.5,
    speed: 0.5 + seededRandom(i * 5 + 50) * 0.5,
    yOffset: (seededRandom(i * 7 + 100) - 0.5) * 2,
  }));

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Hologram float animation
    if (hologramRef.current) {
      hologramRef.current.position.y = Math.sin(time * 0.8) * 0.1;
    }

    // Ring pulse when active
    if (ringRef.current && isActive) {
      const scale = 1 + Math.sin(time * 3) * 0.1;
      ringRef.current.scale.set(scale, scale, 1);
      ringRef.current.rotation.z = time * 0.5;
    }

    // Particles animation
    if (particlesRef.current && isActive) {
      particlesRef.current.children.forEach((particle, i) => {
        const data = particles[i];
        if (particle) {
          (particle as Mesh).position.x = Math.cos(time * data.speed + data.angle) * data.radius;
          (particle as Mesh).position.z = Math.sin(time * data.speed + data.angle) * data.radius;
          (particle as Mesh).position.y = data.yOffset + Math.sin(time * 2 + i) * 0.2;
        }
      });
    }

    // Glow intensity pulse
    if (groupRef.current && isActive) {
      const intensity = 0.5 + Math.sin(time * 4) * 0.3;
      groupRef.current.children.forEach((child) => {
        if (child.type === 'PointLight') {
          (child as THREE.PointLight).intensity = intensity * 2;
        }
      });
    }
  });

  if (world === 'DEV') {
    return (
      <group ref={groupRef} position={position}>
        {/* Imperial Pedestal Base */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1, 1.2, 1, 8]} />
          <meshStandardMaterial color={colors.base} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Gold Trim Ring */}
        <mesh position={[0, 1, 0]} castShadow>
          <torusGeometry args={[1.1, 0.05, 8, 32]} />
          <meshStandardMaterial color={colors.gold} metalness={1} roughness={0.1} emissive={colors.gold} emissiveIntensity={isActive ? 0.5 : 0} />
        </mesh>

        {/* Imperial Seal */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
          <meshStandardMaterial color={colors.gold} metalness={0.9} roughness={0.1} emissive={colors.gold} emissiveIntensity={isActive ? 0.3 : 0} />
        </mesh>

        {/* Aquila Symbol */}
        <Text
          position={[0, 1.55, 0.41]}
          fontSize={0.4}
          color={colors.base}
          anchorX="center"
          anchorY="middle"
        >
          ⬡
        </Text>

        {/* Holographic Data Slate */}
        <group ref={hologramRef} position={[0, 2.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.4, 1.8, 0.05]} />
            <meshStandardMaterial
              color={colors.green}
              transparent
              opacity={0.15}
              emissive={colors.green}
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Title */}
          <Text
            position={[0, 0.6, 0.03]}
            fontSize={0.12}
            color={colors.green}
            anchorX="center"
            anchorY="top"
            maxWidth={1.2}
            lineHeight={1.2}
          >
            {post.title}
          </Text>

          {/* Excerpt */}
          <Text
            position={[0, -0.2, 0.03]}
            fontSize={0.08}
            color={colors.green}
            anchorX="center"
            anchorY="top"
            maxWidth={1.2}
            lineHeight={1.3}
          >
            {post.excerpt ?? 'Read more...'}
          </Text>

          {/* Date */}
          <Text
            position={[0, -0.7, 0.03]}
            fontSize={0.06}
            color={colors.gold}
            anchorX="center"
            anchorY="top"
          >
            {new Date(post.publishDate ?? post.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </group>

        {/* Active Ring */}
        {isActive && (
          <>
            <mesh ref={ringRef} position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.5, 1.6, 32]} />
              <meshBasicMaterial color={colors.green} transparent opacity={0.5} side={2} />
            </mesh>

            {/* Particles */}
            <group ref={particlesRef}>
              {particles.map((_, i) => (
                <mesh key={i}>
                  <sphereGeometry args={[0.03, 8, 8]} />
                  <meshBasicMaterial color={colors.green} />
                </mesh>
              ))}
            </group>

            <pointLight position={[0, 2, 1]} color={colors.green} intensity={1} distance={5} />
          </>
        )}

        {/* Interaction Light */}
        {isActive && (
          <pointLight position={[0, 2, 0]} color={categoryColor} intensity={0.5} distance={3} />
        )}
      </group>
    );
  }

  // Art World Style
  return (
    <group ref={groupRef} position={position}>
      {/* Concrete Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color={colors.base} roughness={0.9} />
      </mesh>

      {/* Neon Accents */}
      <mesh position={[0, 0.5, 0.76]} castShadow>
        <boxGeometry args={[1.5, 0.05, 0.05]} />
        <meshStandardMaterial color={categoryColor} emissive={categoryColor} emissiveIntensity={isActive ? 2 : 1} />
      </mesh>

      {/* Gallery Frame */}
      <group position={[0, 1.5, 0]}>
        {/* Frame */}
        <mesh castShadow>
          <boxGeometry args={[1.6, 2, 0.1]} />
          <meshStandardMaterial color={0x1a1a1a} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Inner Frame (neon) */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[1.5, 1.9, 0.02]} />
          <meshStandardMaterial color={categoryColor} emissive={categoryColor} emissiveIntensity={isActive ? 1 : 0.5} transparent opacity={0.8} />
        </mesh>

        {/* Screen */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[1.4, 1.8]} />
          <meshStandardMaterial
            color={categoryColor}
            transparent
            opacity={0.1}
            emissive={categoryColor}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Title */}
        <Text
          position={[0, 0.5, 0.06]}
          fontSize={0.15}
          color="#ffffff"
          anchorX="center"
          anchorY="top"
          maxWidth={1.2}
          lineHeight={1.2}
        >
          {post.title}
        </Text>

        {/* Excerpt */}
        <Text
          position={[0, -0.2, 0.06]}
          fontSize={0.08}
          color="#cccccc"
          anchorX="center"
          anchorY="top"
          maxWidth={1.2}
          lineHeight={1.3}
        >
          {post.excerpt ?? 'Tap to read...'}
        </Text>

        {/* Category Badge */}
        <Text
          position={[0, -0.7, 0.06]}
          fontSize={0.06}
          color={categoryColor}
          anchorX="center"
          anchorY="top"
        >
          BLOG
        </Text>
      </group>

      {/* Active Indicators */}
      {isActive && (
        <>
          {/* Pulsing Rings */}
          <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.25, 32]} />
            <meshBasicMaterial color={categoryColor} transparent opacity={0.6} side={2} />
          </mesh>

          <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.8, 1.85, 32]} />
            <meshBasicMaterial color={categoryColor} transparent opacity={0.3} side={2} />
          </mesh>

          {/* Particles */}
          <group ref={particlesRef}>
            {particles.map((_, i) => (
              <mesh key={i}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color={categoryColor} />
              </mesh>
            ))}
          </group>

          <pointLight position={[0, 2, 1]} color={categoryColor} intensity={1} distance={5} />
        </>
      )}

      {/* Ambient Neon Glow */}
      <pointLight position={[0, 1.5, 0.5]} color={categoryColor} intensity={0.3} distance={3} />
    </group>
  );
}
