// DevWorld - Monde Imperium style Warhammer 40k
// Architecture gothique impériale, or et noir, piliers, arcs

'use client';

import { useMemo, useRef } from 'react';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

interface DevWorldProps {
  position?: [number, number, number];
  onCollidableObjects?: (objs: THREE.Object3D[]) => void;
}

// Composant pour un pilier gothique impérial
function ImperialPillar({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pilier principal */}
      <mesh castShadow receiveShadow position={[0, 4, 0]}>
        <cylinderGeometry args={[1.2, 1.5, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Chapiteau doré */}
      <mesh castShadow position={[0, 7.5, 0]}>
        <boxGeometry args={[3, 0.8, 3]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} emissive="#d4af37" emissiveIntensity={0.2} />
      </mesh>

      {/* Base dorée */}
      <mesh receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[2, 2.2, 0.5, 8]} />
        <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Symbole mécanicus */}
      <mesh position={[0, 8.3, 0]}>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#8b0000" roughness={0.2} metalness={0.9} emissive="#8b0000" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Composant pour un arc gothique
function GothicArch({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Piliers de l'arc */}
      <mesh position={[-3, 6, 0]} castShadow>
        <boxGeometry args={[1, 12, 1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.4} />
      </mesh>
      <mesh position={[3, 6, 0]} castShadow>
        <boxGeometry args={[1, 12, 1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Haut de l'arc en demi-cercle */}
      <mesh position={[0, 12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[3, 0.4, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} emissive="#d4af37" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

// Terminal console
function DevTerminal({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Corps du terminal */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Écran lumineux */}
      <mesh position={[0, 2, 0.51]}>
        <planeGeometry args={[1.6, 1.5]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} transparent opacity={0.8} />
      </mesh>

      {/* Lumière du terminal */}
      <pointLight position={[0, 2.5, 1]} color="#00ff88" intensity={1} distance={5} decay={2} />
    </group>
  );
}

// Particules avec Instances pour la perf - positions mémorisées
function DustParticles({ count = 300 }: { count?: number }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 80,
        Math.random() * 3 + 0.5, // Plus bas : entre 0.5 et 3.5 de hauteur
        (Math.random() - 0.5) * 80,
      ] as [number, number, number],
      scale: Math.random() * 0.15 + 0.05,
    }));
  }, [count]);

  return (
    <Instances limit={count}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial color="#d4af37" emissive="#d4af37" emissiveIntensity={0.3} transparent opacity={0.3} />
      {particles.map((props, i) => (
        <Instance key={i} position={props.position} scale={props.scale} />
      ))}
    </Instances>
  );
}

export function DevWorld({ position = [0, 0, 0], onCollidableObjects }: DevWorldProps) {
  const [x, y, z] = position;
  const collidablesRef = useRef<THREE.Object3D[]>([]);

  // Positions des piliers mémorisées pour éviter le tremblement
  const pillarPositions = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const radius = 25;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;
      return { id: i, x: px, z: pz };
    });
  }, []);

  return (
    <group position={[x, y, z]}>
      {/* PILIERS GOITHIQUES IMPÉRIAUX - positions fixes */}
      {pillarPositions.map((pillar) => (
        <ImperialPillar key={`pillar-${pillar.id}`} position={[pillar.x, 0, pillar.z]} />
      ))}

      {/* ARCS GOITHIQUES - 4 arcs cardinaux */}
      <GothicArch position={[18, 0, 0]} rotation={Math.PI / 2} />
      <GothicArch position={[-18, 0, 0]} rotation={-Math.PI / 2} />
      <GothicArch position={[0, 0, 18]} rotation={0} />
      <GothicArch position={[0, 0, -18]} rotation={Math.PI} />

      {/* MONOLITHE CENTRAL */}
      <group position={[0, 0, -20]}>
        {/* Corps du monolithe */}
        <mesh position={[0, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 10, 2]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.5} />
        </mesh>

        {/* Bordures dorées */}
        <mesh position={[0, 5, 1.1]} castShadow>
          <boxGeometry args={[6.2, 10.2, 0.2]} />
          <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} emissive="#d4af37" emissiveIntensity={0.1} />
        </mesh>

        {/* Symbole aquile impérial */}
        <group position={[0, 7, 1.3]}>
          {/* Aile gauche */}
          <mesh position={[-2, 0, 0]} rotation={[0, 0, 0.3]} castShadow>
            <coneGeometry args={[1, 3, 4]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} emissive="#d4af37" emissiveIntensity={0.3} />
          </mesh>
          {/* Aile droite */}
          <mesh position={[2, 0, 0]} rotation={[0, 0, -0.3]} castShadow>
            <coneGeometry args={[1, 3, 4]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} emissive="#d4af37" emissiveIntensity={0.3} />
          </mesh>
          {/* Corps central */}
          <mesh>
            <sphereGeometry args={[0.8]} />
            <meshStandardMaterial color="#8b0000" metalness={0.9} emissive="#8b0000" emissiveIntensity={0.3} />
          </mesh>
        </group>
      </group>

      {/* TERMINALS/CONSOLES */}
      <DevTerminal position={[-12, 0, -8]} rotation={0.3} />
      <DevTerminal position={[12, 0, -8]} rotation={-0.3} />
      <DevTerminal position={[-8, 0, 8]} rotation={Math.PI - 0.3} />
      <DevTerminal position={[8, 0, 8]} rotation={-Math.PI + 0.3} />

      {/* PARTICULES DE POUSSIERE DORÉE - 300 particules, plus basses */}
      <DustParticles count={300} />
    </group>
  );
}
