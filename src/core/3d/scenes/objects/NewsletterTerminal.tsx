'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { Text } from '@react-three/drei';
import { MailIcon } from 'lucide-react';

interface NewsletterTerminalProps {
  position: [number, number, number];
  world: 'DEV' | 'ART';
  isActive?: boolean;
  onInteract?: () => void;
}

const DEV_COLORS = {
  base: 0x1a1a1a,
  gold: 0xd4af37,
  green: 0x00ff88,
  darkGreen: 0x004422,
  crimson: 0x8b0000,
  neonPink: 0xff6b6b,
  neonTeal: 0x4ecdc4,
  concrete: 0x3a3a4a,
};

const ART_COLORS = {
  base: 0x2a2a3a,
  gold: 0xd4af37,
  green: 0x4ecdc4,
  darkGreen: 0x004422,
  crimson: 0x8b0000,
  neonPink: 0xff6b6b,
  neonTeal: 0x4ecdc4,
  concrete: 0x3a3a4a,
};

export function NewsletterTerminal({
  position,
  world,
  isActive = false,
  onInteract,
}: NewsletterTerminalProps) {
  const groupRef = useRef<Group>(null);
  const screenRef = useRef<Mesh>(null);
  const [subscribed, setSubscribed] = useState(false);

  const colors = world === 'DEV' ? DEV_COLORS : ART_COLORS;
  const pi = Math.PI;

  // Email notification particles
  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      radius: 0.6 + Math.random() * 0.3,
      speed: 0.2 + Math.random() * 0.3,
    }));
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Screen glow pulse
    if (screenRef.current) {
      const pulse = (Math.sin(time * 1.5) + 1) * 0.5;
      (screenRef.current.material as any).emissiveIntensity = 0.2 + pulse * 0.2;
    }

    // Rotate notification particles
    if (isActive && groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        if (child.type === 'Mesh' && child !== screenRef.current && child.position.y > 1) {
          const particle = particles[Math.floor((i - 3) / 2)];
          if (particle) {
            child.position.x = Math.cos(time * particle.speed + particle.angle) * particle.radius;
            child.position.z = Math.sin(time * particle.speed + particle.angle) * particle.radius;
            child.position.y = 3 + Math.sin(time * 2 + i) * 0.1;
          }
        }
      });
    }
  });

  const handleSubscribe = async () => {
    setSubscribed(true);
    onInteract?.();

    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'visitor@oalacea.com',
          consent: true,
        }),
      });
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
    }

    setTimeout(() => setSubscribed(false), 3000);
  };

  if (world === 'DEV') {
    return (
      <group ref={groupRef} position={position}>
        {/* Imperial Base */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.8, 1, 0.8, 8]} />
          <meshStandardMaterial color={colors.base} metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Gold Rings */}
        <mesh position={[0, 0.9, 0]} castShadow>
          <torusGeometry args={[0.9, 0.06, 8, 32]} />
          <meshStandardMaterial color={colors.gold} metalness={1} roughness={0.1} />
        </mesh>

        {/* Terminal Frame */}
        <mesh position={[0, 1.8, 0]} castShadow>
          <boxGeometry args={[1.4, 1.8, 0.2]} />
          <meshStandardMaterial color={colors.base} metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Gold Trim */}
        <mesh position={[0, 1.8, 0.11]}>
          <boxGeometry args={[1.45, 1.85, 0.04]} />
          <meshStandardMaterial color={colors.gold} metalness={1} roughness={0.1} />
        </mesh>

        {/* Screen */}
        <mesh ref={screenRef} position={[0, 1.8, 0]}>
          <planeGeometry args={[1.1, 1.4]} />
          <meshStandardMaterial
            color={colors.darkGreen}
            emissive={colors.green}
            emissiveIntensity={0.3}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Newsletter Header */}
        <Text
          position={[0, 2.35, 0.01]}
          fontSize={0.12}
          color={colors.gold}
          anchorX="center"
          anchorY="top"
        >
          NEWSLETTER
        </Text>

        {/* Envelope Symbol */}
        <Text
          position={[0, 2.1, 0.01]}
          fontSize={0.25}
          color={colors.green}
          anchorX="center"
          anchorY="top"
        >
          ✉
        </Text>

        {/* Subscribe Prompt */}
        <Text
          position={[0, 1.7, 0.01]}
          fontSize={0.08}
          color={colors.green}
          anchorX="center"
          anchorY="top"
        >
          ┌───────────┐
        </Text>

        <Text
          position={[0, 1.55, 0.01]}
          fontSize={0.06}
          color={colors.green}
          anchorX="center"
          anchorY="top"
        >
          │ JOIN THE   │
        </Text>

        <Text
          position={[0, 1.4, 0.01]}
          fontSize={0.06}
          color={colors.green}
          anchorX="center"
          anchorY="top"
        >
          │ CRUSADE    │
        </Text>

        <Text
          position={[0, 1.25, 0.01]}
          fontSize={0.08}
          color={colors.green}
          anchorX="center"
          anchorY="top"
        >
          └───────────┘
        </Text>

        {/* Subscribe Button */}
        <Text
          position={[0, 0.95, 0.01]}
          fontSize={0.08}
          color={colors.gold}
          anchorX="center"
          anchorY="top"
        >
          [E] SUBSCRIBE
        </Text>

        {/* Success Message */}
        {subscribed && (
          <Text
            position={[0, 1.55, 0.02]}
            fontSize={0.1}
            color={colors.gold}
            anchorX="center"
            anchorY="top"
          >
            CHECK EMAIL
          </Text>
        )}

        {/* Active Indicators */}
        {isActive && (
          <>
            {/* Pulsing Ring */}
            <mesh position={[0, 1.8, 0.4]} rotation={[pi / 2, 0, 0]}>
              <ringGeometry args={[1, 1.1, 32]} />
              <meshBasicMaterial color={colors.gold} transparent opacity={0.4} side={2} />
            </mesh>

            {/* Email Particles */}
            {particles.map((_, i) => (
              <mesh key={i} position={[0, 3, 0]}>
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshBasicMaterial color={colors.gold} />
              </mesh>
            ))}

            <pointLight position={[0, 2, 1.5]} color={colors.gold} intensity={0.8} distance={4} />
          </>
        )}

        {/* Ambient Glow */}
        <pointLight position={[0, 2, 1]} color={colors.gold} intensity={0.3} distance={3} />
      </group>
    );
  }

  // Art World Newsletter Terminal
  return (
    <group ref={groupRef} position={position}>
      {/* Concrete Base */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.8, 1.2]} />
        <meshStandardMaterial color={colors.concrete} roughness={0.95} />
      </mesh>

      {/* Main Panel */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[1.8, 2.2, 0.25]} />
        <meshStandardMaterial color={colors.base} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Neon Frame */}
      <mesh position={[0, 1.8, 0.13]}>
        <boxGeometry args={[1.85, 2.25, 0.04]} />
        <meshStandardMaterial
          color={colors.neonPink}
          emissive={colors.neonPink}
          emissiveIntensity={isActive ? 2 : 1}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Screen */}
      <mesh ref={screenRef} position={[0, 1.8, 0]}>
        <planeGeometry args={[1.5, 1.8]} />
        <meshStandardMaterial
          color={0x111122}
          emissive={colors.neonTeal}
          emissiveIntensity={0.15}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Newsletter Header */}
      <Text
        position={[0, 2.6, 0.01]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="top"
      >
        NEWSLETTER
      </Text>

      {/* Mail Icon */}
      <Text
        position={[0, 2.3, 0.01]}
        fontSize={0.3}
        color={colors.neonTeal}
        anchorX="center"
        anchorY="top"
      >
        ✉
      </Text>

      {/* Subscribe Text */}
      <Text
        position={[0, 1.9, 0.01]}
        fontSize={0.08}
        color={colors.neonTeal}
        anchorX="center"
        anchorY="top"
      >
        ◆ STAY UPDATED ◆
      </Text>

      <Text
        position={[0, 1.7, 0.01]}
        fontSize={0.06}
        color="#ffffff"
        anchorX="center"
        anchorY="top"
      >
        Latest projects & 3D experiments
      </Text>

      <Text
        position={[0, 1.4, 0.01]}
        fontSize={0.08}
        color={colors.neonPink}
        anchorX="center"
        anchorY="top"
      >
        [E] SUBSCRIBE
      </Text>

      {/* Success Message */}
      {subscribed && (
        <Text
          position={[0, 1.9, 0.02]}
          fontSize={0.1}
          color={colors.neonTeal}
          anchorX="center"
          anchorY="top"
        >
          CHECK YOUR EMAIL
        </Text>
      )}

      {/* Active Indicators */}
      {isActive && (
        <>
          {/* Pulsing Rings */}
          <mesh position={[0, 1.8, 0.4]} rotation={[pi / 2, 0, 0]}>
            <ringGeometry args={[1.1, 1.2, 32]} />
            <meshBasicMaterial color={colors.neonTeal} transparent opacity={0.5} side={2} />
          </mesh>

          <mesh position={[0, 1.8, 0.4]} rotation={[pi / 2, 0, 0]}>
            <ringGeometry args={[1.3, 1.4, 32]} />
            <meshBasicMaterial color={colors.neonPink} transparent opacity={0.3} side={2} />
          </mesh>

          {/* Email Particles */}
          {particles.map((_, i) => (
            <mesh key={i} position={[0, 2.5, 0]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial color={i % 2 === 0 ? colors.neonTeal : colors.neonPink} />
            </mesh>
          ))}

          <pointLight position={[0, 2, 1.5]} color={colors.neonTeal} intensity={0.8} distance={4} />
        </>
      )}

      {/* Ambient Glow */}
      <pointLight position={[0, 2, 1]} color={colors.neonTeal} intensity={0.3} distance={3} />
      <pointLight position={[0, 2, -1]} color={colors.neonPink} intensity={0.2} distance={2} />
    </group>
  );
}

export default NewsletterTerminal;
