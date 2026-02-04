'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, MeshStandardMaterial } from 'three';
import { Text } from '@react-three/drei';
import { useModalStore } from '@/store/modal-store';

type ContentType = 'blog' | 'project';
type WorldType = 'DEV' | 'ART';

interface ContentTerminalProps {
  position?: [number, number, number];
  world?: WorldType;
  defaultMode?: ContentType;
  blogPosts?: Array<{ id: string | number; slug?: string; title: string; publishDate?: string | Date; year?: number | string }>;
  projects?: Array<{ id: string | number; slug?: string; title: string; year?: number | string }>;
}

const DEV_COLORS = {
  base: 0x1a1a1a,
  gold: 0xd4af37,
  green: 0x00ff88,
  darkGreen: 0x003311,
  glow: 0x00ff44,
  neonPink: 0xff6b6b,
};

const ART_COLORS = {
  base: 0x2a2a3a,
  gold: 0xd4af37,
  green: 0x4ecdc4,
  darkGreen: 0x003333,
  glow: 0x00ffff,
  neonPink: 0xff6b6b,
};

const ITEMS_PER_PAGE = 5;

export function ContentTerminal({
  position = [0, 0, 0],
  world = 'DEV',
  defaultMode = 'blog',
  blogPosts = [],
  projects = [],
}: ContentTerminalProps) {
  const groupRef = useRef<Group>(null);
  const screenRef = useRef<Mesh>(null);
  const scanlineRef = useRef<Mesh>(null);

  const [mode, setMode] = useState<ContentType>(defaultMode);
  const [currentPage, setCurrentPage] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [modeHovered, setModeHovered] = useState(false);

  const colors = world === 'DEV' ? DEV_COLORS : ART_COLORS;
  const openBlogListing = useModalStore((s) => s.openBlogListing);
  const openProjectListing = useModalStore((s) => s.openProjectListing);

  const currentItems = mode === 'blog' ? blogPosts : projects;
  const totalPages = Math.ceil(currentItems.length / ITEMS_PER_PAGE);
  const displayedItems = currentItems.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  };

  const handleToggleMode = () => {
    setMode((m) => (m === 'blog' ? 'project' : 'blog'));
    setCurrentPage(0);
    setHoveredIndex(null);
  };

  const handleItemSelect = () => {
    if (mode === 'blog') {
      openBlogListing();
    } else if (mode === 'project') {
      openProjectListing();
    }
  };

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Screen glow pulse
    if (screenRef.current) {
      const pulse = (Math.sin(time * 2) + 1) * 0.5;
      const mat = screenRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.2 + pulse * 0.15;
    }

    // Scanline animation
    if (scanlineRef.current) {
      scanlineRef.current.position.y = 3.6 - ((time * 0.3) % 7.2);
    }
  });

  if (currentItems.length === 0) {
    return null;
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Terminal Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 2, 1, 8]} />
        <meshStandardMaterial color={colors.base} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Bottom Ring */}
      <mesh position={[0, 1, 0]} castShadow>
        <torusGeometry args={[1.9, 0.1, 8, 32]} />
        <meshStandardMaterial
          color={world === 'ART' ? colors.neonPink : colors.gold}
          metalness={1}
          roughness={0.1}
          emissive={world === 'ART' ? colors.neonPink : colors.gold}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Main Frame */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[3.5, 5, 0.3]} />
        <meshStandardMaterial color={colors.base} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Top Dome */}
      <mesh position={[0, 5.7, 0]} castShadow>
        <sphereGeometry args={[1.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={colors.base} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Frame Border */}
      <mesh position={[0, 3, 0.16]}>
        <boxGeometry args={[3.6, 5.1, 0.05]} />
        <meshStandardMaterial
          color={world === 'ART' ? colors.neonPink : colors.gold}
          metalness={1}
          roughness={0.1}
          emissive={world === 'ART' ? colors.neonPink : colors.gold}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Screen Background */}
      <mesh ref={screenRef} position={[0, 3, 0]}>
        <planeGeometry args={[3, 4.5]} />
        <meshStandardMaterial
          color={world === 'DEV' ? colors.darkGreen : colors.darkGreen}
          emissive={world === 'DEV' ? colors.green : colors.green}
          emissiveIntensity={0.3}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Scanline Effect */}
      <mesh ref={scanlineRef} position={[0, 3, 0.01]}>
        <planeGeometry args={[3, 0.08]} />
        <meshBasicMaterial
          color={world === 'DEV' ? colors.green : colors.green}
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Header - Terminal Title */}
      <Text
        position={[0, 5.2, 0.02]}
        fontSize={0.22}
        color={world === 'ART' ? colors.neonPink : colors.gold}
        anchorX="center"
        anchorY="top"
      >
        {mode === 'blog' ? 'BLOG TERMINAL' : 'PROJECT TERMINAL'}
      </Text>

      {/* Mode Toggle Button */}
      <group position={[0, 4.8, 0.02]}>
        <Text
          fontSize={0.1}
          color={modeHovered ? (world === 'ART' ? colors.neonPink : colors.gold) : colors.green}
          anchorX="center"
          onClick={handleToggleMode}
          onPointerOver={() => setModeHovered(true)}
          onPointerOut={() => setModeHovered(false)}
        >
          [{mode === 'blog' ? 'BLOG' : 'PROJECT'}] - CLICK TO SWITCH
        </Text>
      </group>

      {/* Divider */}
      <Text
        position={[0, 4.55, 0.02]}
        fontSize={0.1}
        color={colors.green}
        anchorX="center"
        anchorY="top"
      >
        {'='.repeat(28)}
      </Text>

      {/* Content List */}
      {displayedItems.length > 0 ? (
        displayedItems.map((item, index) => {
          const yPos = 4.2 - index * 0.5;
          const isHovered = hoveredIndex === index;

          return (
            <group key={item.id || item.slug} position={[0, yPos, 0.02]}>
              {/* Hover Background */}
              {isHovered && (
                <mesh position={[0, -0.2, -0.01]}>
                  <planeGeometry args={[2.8, 0.4]} />
                  <meshBasicMaterial
                    color={world === 'ART' ? colors.neonPink : colors.green}
                    transparent
                    opacity={0.15}
                  />
                </mesh>
              )}

              {/* Item Title */}
              <Text
                position={[-1.2, 0, 0]}
                fontSize={0.11}
                color={world === 'ART' ? colors.neonPink : colors.gold}
                anchorX="left"
                anchorY="top"
                maxWidth={2.4}
                onClick={() => handleItemSelect()}
                onPointerOver={() => setHoveredIndex(index)}
                onPointerOut={() => setHoveredIndex(null)}
              >
                {isHovered ? '> ' : '  '}{item.title}
              </Text>

              {/* Item Meta */}
              <Text
                position={[1.2, 0, 0]}
                fontSize={0.07}
                color={colors.green}
                anchorX="right"
                anchorY="top"
              >
                {mode === 'blog' && 'publishDate' in item && item.publishDate
                  ? new Date(item.publishDate as string | Date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                  : item.year || ''}
              </Text>
            </group>
          );
        })
      ) : (
        <Text
          position={[0, 2.5, 0.02]}
          fontSize={0.12}
          color={colors.gold}
          anchorX="center"
          anchorY="middle"
        >
          NO {mode.toUpperCase()}S AVAILABLE
        </Text>
      )}

      {/* Page Navigation */}
      {totalPages > 1 && (
        <group position={[0, 1.4, 0.02]}>
          {/* Previous */}
          {currentPage > 0 && (
            <Text
              position={[-0.8, 0, 0]}
              fontSize={0.11}
              color={colors.green}
              anchorX="center"
              onClick={handlePrevPage}
              onPointerOver={() => setHoveredIndex(-1)}
              onPointerOut={() => setHoveredIndex(null)}
            >
              {'< PREV'}
            </Text>
          )}

          {/* Page Info */}
          <Text
            position={[0, 0, 0]}
            fontSize={0.09}
            color={colors.gold}
            anchorX="center"
          >
            [{currentPage + 1}/{totalPages}]
          </Text>

          {/* Next */}
          {currentPage < totalPages - 1 && (
            <Text
              position={[0.8, 0, 0]}
              fontSize={0.11}
              color={colors.green}
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
        position={[0, 1.1, 0.02]}
        fontSize={0.07}
        color={colors.gold}
        anchorX="center"
      >
        CLICK ITEM TO READ • PRESS ESC TO CLOSE
      </Text>

      {/* Bottom Decoration */}
      <Text
        position={[0, 0.9, 0.02]}
        fontSize={0.08}
        color={colors.green}
        anchorX="center"
      >
        {'.'.repeat(32)}
      </Text>

      {/* Floating Light Beam - helps locate the terminal */}
      <mesh position={[0, 8, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.3, 4, 8, 1, true]} />
        <meshBasicMaterial
          color={world === 'ART' ? colors.neonPink : colors.gold}
          transparent
          opacity={0.1}
          side={2}
        />
      </mesh>

      {/* Ambient Glow */}
      <pointLight
        position={[0, 3, 1.5]}
        color={world === 'ART' ? colors.neonPink : colors.gold}
        intensity={0.6}
        distance={8}
      />

      {/* Screen Glow */}
      <pointLight
        position={[0, 3, 0.5]}
        color={colors.green}
        intensity={0.4}
        distance={5}
      />
    </group>
  );
}
