'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh, Vector3 } from 'three';

export interface InteractionHighlightProps {
  position: [number, number, number];
  color?: string;
  radius?: number;
  isActive?: boolean;
  type?: 'glow' | 'ring' | 'particles';
}

const PARTICLE_COUNT = 12;

export function InteractionHighlight({
  position,
  color = '#00ff88',
  radius = 2,
  isActive = false,
  type = 'ring',
}: InteractionHighlightProps) {
  const groupRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const particlesRef = useRef<Group>(null);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
      baseRadius: radius * 0.8,
      speed: 0.5 + Math.random() * 0.5,
      yOffset: (Math.random() - 0.5) * 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [radius]);

  useFrame((state) => {
    if (!isActive) return;

    const time = state.clock.elapsedTime;

    if (ringRef.current) {
      const pulse = 1 + Math.sin(time * 3) * 0.15;
      ringRef.current.scale.set(pulse, pulse, 1);
      ringRef.current.rotation.z = time * 0.3;
    }

    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const data = particles[i];
        if (data && particle.type === 'Mesh') {
          const angle = data.angle + time * data.speed * 0.5;
          const r = data.baseRadius + Math.sin(time * 2 + data.phase) * 0.2;
          (particle as Mesh).position.x = Math.cos(angle) * r;
          (particle as Mesh).position.z = Math.sin(angle) * r;
          (particle as Mesh).position.y = data.yOffset + Math.sin(time * 3 + data.phase) * 0.1;
        }
      });
    }

    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        if (child.type === 'PointLight') {
          const intensity = 1 + Math.sin(time * 4) * 0.3;
          (child as any).intensity = intensity * 1.5;
        }
      });
    }
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef} position={position}>
      {type === 'ring' && (
        <>
          <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + 0.15, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} side={2} />
          </mesh>

          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius + 0.3, radius + 0.35, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} side={2} />
          </mesh>
        </>
      )}

      {type === 'glow' && (
        <>
          <mesh position={[0, 0.1, 0]}>
            <circleGeometry args={[radius, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
            />
          </mesh>

          <mesh position={[0, 0.15, 0]}>
            <circleGeometry args={[radius * 0.7, 32]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.5}
            />
          </mesh>
        </>
      )}

      {type === 'particles' && (
        <group ref={particlesRef}>
          {particles.map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
          ))}
        </group>
      )}

      <pointLight position={[0, 1, 0]} color={color} intensity={1.5} distance={radius * 3} />
    </group>
  );
}

interface BurstParticleProps {
  position: [number, number, number];
  color?: string;
  onComplete?: () => void;
}

export function BurstParticle({ position, color = '#00ff88', onComplete }: BurstParticleProps) {
  const particlesRef = useRef<Group>(null);
  const [alive, setAlive] = useState(true);

  const particles = useMemo(() => {
    return Array.from({ length: 16 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      return {
        angle,
        speed,
        velocity: new Vector3(
          Math.cos(angle) * speed,
          (Math.random() - 0.5) * speed,
          Math.sin(angle) * speed
        ),
      };
    });
  }, []);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    let allDone = true;

    particlesRef.current.children.forEach((particle, i) => {
      if (particle.type === 'Mesh') {
        const data = particles[i];
        if (data) {
          (particle as Mesh).position.x += data.velocity.x * delta;
          (particle as Mesh).position.y += data.velocity.y * delta;
          (particle as Mesh).position.z += data.velocity.z * delta;
          data.velocity.y -= 5 * delta;

          if ((particle as Mesh).position.y > 0) {
            allDone = false;
          }
        }
      }
    });

    if (allDone && alive) {
      setAlive(false);
      onComplete?.();
    }
  });

  if (!alive) return null;

  return (
    <group ref={particlesRef} position={position}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

interface HoverGlowProps {
  position: [number, number, number];
  color?: string;
  intensity?: number;
}

export function HoverGlow({ position, color = '#00ff88', intensity = 0.5 }: HoverGlowProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = (Math.sin(state.clock.elapsedTime * 2) + 1) * 0.5;
      const mat = meshRef.current.material as any;
      mat.opacity = 0.2 + pulse * intensity * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[position[0], position[1] + 0.05, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.5, 2.5, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        side={2}
      />
    </mesh>
  );
}
