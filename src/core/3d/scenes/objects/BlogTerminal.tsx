'use client';

import { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { Text } from '@react-three/drei';
import type { Post } from '@/generated/prisma/client';

interface BlogTerminalProps {
  posts: Post[];
  position?: [number, number, number];
  onPostSelect?: (post: Post) => void;
  activePostId?: string;
}

const DEV_COLORS = {
  base: 0x1a1a1a,
  gold: 0xd4af37,
  green: 0x00ff88,
  darkGreen: 0x003311,
  glow: 0x00ff44,
  cyan: 0x00ff88,
  darkCyan: 0x003311,
};

const ART_COLORS = {
  base: 0x2a2a3a,
  gold: 0xd4af37,
  green: 0x4ecdc4,
  darkGreen: 0x003333,
  glow: 0x00ffff,
  cyan: 0x4ecdc4,
  darkCyan: 0x003333,
  neonPink: 0xff6b6b,
};

const POSTS_PER_PAGE = 5;

export function BlogTerminal({ posts, position = [0, 0, 0], onPostSelect, activePostId }: BlogTerminalProps) {
  const groupRef = useRef<Group>(null);
  const screenRef = useRef<Mesh>(null);
  const scanlineRef = useRef<Mesh>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const world: 'DEV' | 'ART' = 'DEV';

  const colors = world === 'DEV' ? DEV_COLORS : ART_COLORS;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const currentPosts = posts.slice(currentPage * POSTS_PER_PAGE, (currentPage + 1) * POSTS_PER_PAGE);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, totalPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (screenRef.current) {
      const pulse = (Math.sin(time * 2) + 1) * 0.5;
      (screenRef.current.material as any).emissiveIntensity = 0.2 + pulse * 0.15;
    }

    if (scanlineRef.current) {
      scanlineRef.current.position.y = 1.1 - ((time * 0.5) % 2.2);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Terminal Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.7, 1, 8]} />
        <meshStandardMaterial color={colors.base} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Gold/Neon Ring */}
      <mesh position={[0, 1, 0]} castShadow>
        <torusGeometry args={[1.6, 0.08, 8, 32]} />
        <meshStandardMaterial color={colors.gold} metalness={1} roughness={0.1} />
      </mesh>

      {/* Terminal Frame */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[3, 3, 0.3]} />
        <meshStandardMaterial color={colors.base} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Terminal Top */}
      <mesh position={[0, 4.2, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.3, 16]} />
        <meshStandardMaterial color={colors.base} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Accent Trim */}
      <mesh position={[0, 2.5, 0.16]}>
        <boxGeometry args={[3.1, 3.1, 0.05]} />
        <meshStandardMaterial
          color={colors.gold}
          metalness={1}
          roughness={0.1}
          emissive={colors.gold}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Screen Background */}
      <mesh ref={screenRef} position={[0, 2.5, 0]}>
        <planeGeometry args={[2.6, 2.6]} />
        <meshStandardMaterial
          color={world === 'DEV' ? colors.darkGreen : colors.darkCyan}
          emissive={world === 'DEV' ? colors.green : colors.cyan}
          emissiveIntensity={0.3}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Scanline Effect */}
      <mesh ref={scanlineRef} position={[0, 2.5, 0.01]}>
        <planeGeometry args={[2.6, 0.05]} />
        <meshBasicMaterial
          color={world === 'DEV' ? colors.green : colors.cyan}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Terminal Header */}
      <Text
        position={[0, 3.7, 0.02]}
        fontSize={0.2}
        color={colors.gold}
        anchorX="center"
        anchorY="top"
      >
        BLOG TERMINAL
      </Text>

      {/* Decorative Border */}
      <Text
        position={[0, 3.45, 0.02]}
        fontSize={0.1}
        color={world === 'DEV' ? colors.green : colors.cyan}
        anchorX="center"
        anchorY="top"
      >
        {'='.repeat(25)}
      </Text>

      {/* Blog Posts List */}
      {currentPosts.length > 0 ? (
        currentPosts.map((post, index) => {
          const yPos = 3.1 - index * 0.35;
          const isHovered = hoveredIndex === index;
          const isActive = activePostId === post.id;

          return (
            <group key={post.id} position={[0, yPos, 0.02]}>
              {/* Hover Background */}
              {isHovered && (
                <mesh position={[0, -0.12, -0.01]}>
                  <planeGeometry args={[2.4, 0.28]} />
                  <meshBasicMaterial
                    color={world === 'DEV' ? colors.green : colors.cyan}
                    transparent
                    opacity={0.2}
                  />
                </mesh>
              )}

              {/* Post Title */}
              <Text
                position={[-1.1, 0, 0]}
                fontSize={0.09}
                color={isActive ? colors.gold : world === 'DEV' ? colors.green : colors.cyan}
                anchorX="left"
                anchorY="top"
                maxWidth={2}
                onClick={() => onPostSelect?.(post)}
                onPointerOver={() => setHoveredIndex(index)}
                onPointerOut={() => setHoveredIndex(null)}
              >
                {isActive ? '> ' : '  '}{post.title}
              </Text>

              {/* Post Date */}
              <Text
                position={[1.1, 0, 0]}
                fontSize={0.06}
                color={colors.gold}
                anchorX="right"
                anchorY="top"
              >
                {new Date(post.publishDate ?? post.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </Text>
            </group>
          );
        })
      ) : (
        <Text
          position={[0, 2.5, 0.02]}
          fontSize={0.1}
          color={colors.gold}
          anchorX="center"
          anchorY="middle"
        >
          NO POSTS AVAILABLE
        </Text>
      )}

      {/* Page Navigation */}
      {totalPages > 1 && (
        <group position={[0, 1.35, 0.02]}>
          {/* Previous Button */}
          {currentPage > 0 && (
            <Text
              position={[-0.8, 0, 0]}
              fontSize={0.1}
              color={world === 'DEV' ? colors.green : colors.cyan}
              anchorX="center"
              onClick={handlePrevPage}
              onPointerOver={() => setHoveredIndex(-1)}
              onPointerOut={() => setHoveredIndex(null)}
            >
              {'< PREV'}
            </Text>
          )}

          {/* Page Indicator */}
          <Text
            position={[0, 0, 0]}
            fontSize={0.08}
            color={colors.gold}
            anchorX="center"
          >
            [{currentPage + 1}/{totalPages}]
          </Text>

          {/* Next Button */}
          {currentPage < totalPages - 1 && (
            <Text
              position={[0.8, 0, 0]}
              fontSize={0.1}
              color={world === 'DEV' ? colors.green : colors.cyan}
              anchorX="center"
              onClick={handleNextPage}
              onPointerOver={() => setHoveredIndex(-2)}
              onPointerOut={() => setHoveredIndex(null)}
            >
              {'NEXT >'}
            </Text>
          )}
        </group>
      )}

      {/* Footer */}
      <Text
        position={[0, 1.15, 0.02]}
        fontSize={0.07}
        color={colors.gold}
        anchorX="center"
      >
        PRESS ESC TO CLOSE
      </Text>

      {/* Corner Decorations */}
      <Text position={[0, 1, 0.02]} fontSize={0.08} color={world === 'DEV' ? colors.green : colors.cyan} anchorX="center">
        {'.'.repeat(30)}
      </Text>

      {/* Ambient Glow */}
      <pointLight position={[0, 2.5, 1]} color={world === 'DEV' ? colors.green : colors.cyan} intensity={0.5} distance={6} />
    </group>
  );
}
