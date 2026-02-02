'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

// Seed-based random for deterministic values during render
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface AdminTerminalProps {
  position: [number, number, number];
  world: 'DEV' | 'ART';
  isActive?: boolean;
  isAdmin?: boolean; // Passed from wrapper instead of using useSession
}

const DEV_COLORS = {
  base: 0x1a1a1a,
  gold: 0xd4af37,
  green: 0x00ff88,
  darkGreen: 0x004422,
  // ART colors also included for TypeScript compatibility
  neonPink: 0xff6b6b,
  neonTeal: 0x4ecdc4,
  concrete: 0x3a3a4a,
};

const ART_COLORS = {
  base: 0x2a2a3a,
  gold: 0xd4af37,
  green: 0x00ff88,
  darkGreen: 0x004422,
  neonPink: 0xff6b6b,
  neonTeal: 0x4ecdc4,
  concrete: 0x3a3a4a,
};

export function AdminTerminal({ position, world, isActive = false, isAdmin = false }: AdminTerminalProps) {
  const groupRef = useRef<Group>(null);
  const screenRef = useRef<Mesh>(null);

  const colors = world === 'DEV' ? DEV_COLORS : ART_COLORS;
  const pi = Math.PI;

  // Floating particles for terminal effect
  const particles = useMemo(() => {
    // Use deterministic seed-based random instead of Math.random
    return Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      radius: 0.8 + seededRandom(i * 3) * 0.4,
      speed: 0.3 + seededRandom(i * 5 + 50) * 0.4,
      yOffset: (seededRandom(i * 7 + 100) - 0.5) * 1.5,
    }));
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Screen glow pulse
    if (screenRef.current) {
      const pulse = (Math.sin(time * 2) + 1) * 0.5;
      const mat = screenRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + pulse * 0.3;
    }

    // Animate access indicator if admin
    if (isAdmin && groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (child.type === 'Mesh' && child !== screenRef.current) {
          const particle = particles[i - 2]; // Skip base and screen
          if (particle) {
            child.position.x = Math.cos(time * particle.speed + particle.angle) * particle.radius;
            child.position.z = Math.sin(time * particle.speed + particle.angle) * particle.radius;
            child.position.y = particle.yOffset + Math.sin(time * 2 + i) * 0.15;
          }
        }
      });
    }
  });

  // Only visible to admin users
  if (!isAdmin) {
    return null;
  }

  if (world === 'DEV') {
    return (
      <group ref={groupRef} position={position}>
        {/* Floating Light Beam - makes terminal visible from afar */}
        <mesh position={[0, 12, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.6, 18, 8, 1, true]} />
          <meshBasicMaterial
            color={colors.green}
            transparent
            opacity={0.1}
            side={2}
          />
        </mesh>

        {/* Top Beacon Light */}
        <pointLight
          position={[0, 14, 0]}
          color={colors.green}
          intensity={3}
          distance={20}
        />

        {/* Floating Ring Animation */}
        <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1, 1.2, 32]} />
          <meshBasicMaterial
            color={colors.gold}
            transparent
            opacity={0.4}
            side={2}
          />
        </mesh>

        {/* Imperial Gothic Base */}
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.4, 1.6, 1, 8]} />
          <meshStandardMaterial color={colors.base} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Gold Decorative Rings */}
        <mesh position={[0, 1, 0]} castShadow>
          <torusGeometry args={[1.3, 0.08, 8, 32]} />
          <meshStandardMaterial color={colors.gold} metalness={1} roughness={0.1} />
        </mesh>

        {/* Gothic Arch Terminal Frame */}
        <mesh position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[2, 2.5, 0.3]} />
          <meshStandardMaterial color={colors.base} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Gothic Arch Top - Simplified to avoid parsing issues */}
        <mesh position={[0, 4, 0]} castShadow>
          <cylinderGeometry args={[1, 1, 0.3, 16]} />
          <meshStandardMaterial color={colors.base} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Gold Trim */}
        <mesh position={[0, 2.5, 0.16]}>
          <boxGeometry args={[2.1, 2.6, 0.05]} />
          <meshStandardMaterial color={colors.gold} metalness={1} roughness={0.1} emissive={colors.gold} emissiveIntensity={isActive ? 0.3 : 0} />
        </mesh>

        {/* Terminal Screen */}
        <mesh ref={screenRef} position={[0, 2.5, 0]}>
          <planeGeometry args={[1.6, 2]} />
          <meshStandardMaterial
            color={colors.darkGreen}
            emissive={colors.green}
            emissiveIntensity={0.5}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Screen Text - Admin Terminal */}
        <Text
          position={[0, 3.2, 0.01]}
          fontSize={0.2}
          color={colors.gold}
          anchorX="center"
          anchorY="top"
        >
          ADMIN TERMINAL
        </Text>

        <Text
          position={[0, 2.8, 0.01]}
          fontSize={0.1}
          color={colors.green}
          anchorX="center"
          anchorY="top"
        >
          ┌─────────────┐
        </Text>

        <Text
          position={[0, 2.5, 0.01]}
          fontSize={0.08}
          color={colors.green}
          anchorX="center"
          anchorY="top"
        >
          │ AUTHORIZED  │
        </Text>

        <Text
          position={[0, 2.2, 0.01]}
          fontSize={0.08}
          color={colors.green}
          anchorX="center"
          anchorY="top"
        >
          └─────────────┘
        </Text>

        <Text
          position={[0, 1.8, 0.01]}
          fontSize={0.1}
          color={colors.gold}
          anchorX="center"
          anchorY="top"
        >
          [E] TO ACCESS
        </Text>

        {/* Aquila Symbol on screen */}
        <Text
          position={[0, 1.4, 0.01]}
          fontSize={0.3}
          color={colors.gold}
          anchorX="center"
          anchorY="top"
        >
          ⬡
        </Text>

        {/* Active Indicators */}
        {isActive && (
          <>
            {/* Pulsing Ring */}
            <mesh position={[0, 2.5, 0.5]} rotation={[pi / 2, 0, 0]}>
              <ringGeometry args={[1.5, 1.6, 32]} />
              <meshBasicMaterial color={colors.green} transparent opacity={0.4} side={2} />
            </mesh>

            {/* Data Particles */}
            {particles.map((_, i) => (
              <mesh key={i}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color={colors.green} />
              </mesh>
            ))}

            <pointLight position={[0, 3, 2]} color={colors.green} intensity={1} distance={5} />
          </>
        )}

        {/* Ambient Glow */}
        <pointLight position={[0, 2.5, 1]} color={colors.green} intensity={0.3} distance={4} />
      </group>
    );
  }

  // Art World Admin Panel
  return (
    <group ref={groupRef} position={position}>
      {/* Floating Light Beam - makes terminal visible from afar */}
      <mesh position={[0, 12, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.6, 18, 8, 1, true]} />
        <meshBasicMaterial
          color={colors.neonTeal}
          transparent
          opacity={0.1}
          side={2}
        />
      </mesh>

      {/* Top Beacon Light */}
      <pointLight
        position={[0, 14, 0]}
        color={colors.neonTeal}
        intensity={3}
        distance={20}
      />

      {/* Floating Ring Animation */}
      <mesh position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1, 1.2, 32]} />
        <meshBasicMaterial
          color={colors.neonPink}
          transparent
          opacity={0.4}
          side={2}
        />
      </mesh>

      {/* Brutalist Concrete Base */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1, 1.5]} />
        <meshStandardMaterial color={colors.base} roughness={0.95} />
      </mesh>

      {/* Main Panel */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[2.5, 3, 0.3]} />
        <meshStandardMaterial color={colors.concrete} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Neon Frame Border */}
      <mesh position={[0, 2.5, 0.16]}>
        <boxGeometry args={[2.55, 3.05, 0.05]} />
        <meshStandardMaterial
          color={colors.neonTeal}
          emissive={colors.neonTeal}
          emissiveIntensity={isActive ? 2 : 1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Corner Accents */}
      <mesh position={[-1.1, 3.8, 0.17]}>
        <boxGeometry args={[0.3, 0.3, 0.06]} />
        <meshStandardMaterial color={colors.neonPink} emissive={colors.neonPink} emissiveIntensity={2} />
      </mesh>
      <mesh position={[1.1, 3.8, 0.17]}>
        <boxGeometry args={[0.3, 0.3, 0.06]} />
        <meshStandardMaterial color={colors.neonPink} emissive={colors.neonPink} emissiveIntensity={2} />
      </mesh>
      <mesh position={[-1.1, 1.2, 0.17]}>
        <boxGeometry args={[0.3, 0.3, 0.06]} />
        <meshStandardMaterial color={colors.neonPink} emissive={colors.neonPink} emissiveIntensity={2} />
      </mesh>
      <mesh position={[1.1, 1.2, 0.17]}>
        <boxGeometry args={[0.3, 0.3, 0.06]} />
        <meshStandardMaterial color={colors.neonPink} emissive={colors.neonPink} emissiveIntensity={2} />
      </mesh>

      {/* Screen */}
      <mesh ref={screenRef} position={[0, 2.5, 0]}>
        <planeGeometry args={[2.1, 2.6]} />
        <meshStandardMaterial
          color={0x111122}
          emissive={colors.neonTeal}
          emissiveIntensity={0.2}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Admin Text */}
      <Text
        position={[0, 3.7, 0.01]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="top"
        font="/fonts/mono.json"
      >
        ADMIN PANEL
      </Text>

      {/* Scanline Effect Lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, 2.8 - i * 0.4, 0.01]}>
          <planeGeometry args={[1.8, 0.02]} />
          <meshBasicMaterial color={colors.neonTeal} transparent opacity={0.1 + i * 0.05} />
        </mesh>
      ))}

      <Text
        position={[0, 1.6, 0.01]}
        fontSize={0.12}
        color={colors.neonPink}
        anchorX="center"
        anchorY="top"
      >
        ◆ AUTHORIZED ◆
      </Text>

      <Text
        position={[0, 1.3, 0.01]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="top"
      >
        [E] TO ACCESS
      </Text>

      {/* Active Indicators */}
      {isActive && (
        <>
          {/* Pulsing Rings */}
          <mesh position={[0, 2.5, 0.5]} rotation={[pi / 2, 0, 0]}>
            <ringGeometry args={[1.6, 1.7, 32]} />
            <meshBasicMaterial color={colors.neonTeal} transparent opacity={0.5} side={2} />
          </mesh>

          <mesh position={[0, 2.5, 0.5]} rotation={[pi / 2, 0, 0]}>
            <ringGeometry args={[2, 2.1, 32]} />
            <meshBasicMaterial color={colors.neonPink} transparent opacity={0.3} side={2} />
          </mesh>

          {/* Data Particles */}
          {particles.map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color={i % 2 === 0 ? colors.neonTeal : colors.neonPink} />
            </mesh>
          ))}

          <pointLight position={[0, 3, 2]} color={colors.neonTeal} intensity={1} distance={5} />
        </>
      )}

      {/* Ambient Neon Glow */}
      <pointLight position={[0, 2.5, 1]} color={colors.neonTeal} intensity={0.4} distance={4} />
      <pointLight position={[0, 2.5, -1]} color={colors.neonPink} intensity={0.2} distance={3} />
    </group>
  );
}
