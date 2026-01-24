// ArtWorld - Monde Underground Art
// Esthétique brutal underground + néon + graffiti

'use client';

import { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';

interface ArtWorldProps {
  position?: [number, number, number];
}

// Mur de béton brut
function ConcreteWall({ position, rotation, scale }: {
  position: [number, number, number];
  rotation: number;
  scale: [number, number, number];
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 8, 1]} />
        <meshStandardMaterial color="#2a2a3a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Tag graffiti stylisé */}
      <mesh position={[0, 4, 0.51]}>
        <planeGeometry args={[0.8, 2]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.3} />
      </mesh>

      {/* Éclat néon */}
      <pointLight position={[0, 5, 1]} color="#ff6b6b" intensity={2} distance={8} decay={2} />
    </group>
  );
}

// Panneau néon
function NeonSign({ position, color, label }: {
  position: [number, number, number];
  color: string;
  label: string;
}) {
  return (
    <group position={position}>
      {/* Support */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Panneau lumineux */}
      <mesh>
        <boxGeometry args={[4, 1.5, 0.2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>

      {/* Contour brillant */}
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[4.2, 1.7, 0.1]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.3} transparent opacity={0.5} />
      </mesh>

      {/* Lumière du néon */}
      <pointLight position={[0, 0, 1]} color={color} intensity={3} distance={15} decay={2} />
    </group>
  );
}

// Pedestal d'exposition
function ArtPedestal({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Socle */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 2, 2, 6]} />
        <meshStandardMaterial color="#3a3a4a" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Plateau supérieur */}
      <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.8, 1.5, 0.3, 6]} />
        <meshStandardMaterial color="#4a4a5a" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Objet d'art abstrait */}
      <mesh position={[0, 3, 0]} castShadow>
        <icosahedronGeometry args={[0.8]} />
        <meshStandardMaterial
          color="#4ecdc4"
          roughness={0.2}
          metalness={0.8}
          emissive="#4ecdc4"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Spot lumineux */}
      <spotLight
        position={[0, 6, 0]}
        target-position={[0, 2, 0]}
        angle={0.5}
        penumbra={0.3}
        intensity={2}
        distance={10}
        decay={2}
        color="#fff"
      />
    </group>
  );
}

// Bombe de spray (accessoire)
function SprayCan({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, Math.PI / 2]}>
      {/* Corps de la bombe */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 12]} />
        <meshStandardMaterial color="#ff6b6b" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Chapeau */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 0.3, 12]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Buse */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.2, 8]} />
        <meshStandardMaterial color="#222" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  );
}

// Cadre de galerie
function GalleryFrame({ position, rotation }: {
  position: [number, number, number];
  rotation: number;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Cadre */}
      <mesh position={[0, 3, 0]} castShadow>
        <boxGeometry args={[5, 4, 0.3]} />
        <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Intérieur du cadre - "tableau" */}
      <mesh position={[0, 3, 0.16]}>
        <planeGeometry args={[4.5, 3.5]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#ff6b6b"
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Lumière du tableau */}
      <pointLight position={[0, 3, 1]} color="#feca57" intensity={1.5} distance={8} decay={2} />
    </group>
  );
}

// Particules néon avec Instances - positions mémorisées
function NeonParticles({ count = 250 }: { count?: number }) {
  const colors = ['#ff6b6b', '#4ecdc4', '#feca57', '#ff9ff3'];

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 80,
        Math.random() * 3 + 0.5, // Plus bas : hauteur du perso
        (Math.random() - 0.5) * 80,
      ] as [number, number, number],
      scale: Math.random() * 0.12 + 0.04,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
  }, [count]);

  return (
    <Instances limit={count}>
      <sphereGeometry args={[1, 4, 4]} />
      {particles.map((props, i) => (
        <Instance
          key={i}
          position={props.position}
          scale={props.scale}
          color={props.color}
        />
      ))}
    </Instances>
  );
}

export function ArtWorld({ position = [0, 0, 0] }: ArtWorldProps) {
  const [x, y, z] = position;

  return (
    <group position={[x, y, z]}>
      {/* MURS DE BÉTON BRUT - disposition irrégulière */}
      <ConcreteWall position={[-20, 0, -15]} rotation={0.3} scale={[8, 1, 1]} />
      <ConcreteWall position={[20, 0, -15]} rotation={-0.3} scale={[8, 1, 1]} />
      <ConcreteWall position={[-25, 0, 5]} rotation={Math.PI / 4} scale={[6, 1, 1]} />
      <ConcreteWall position={[25, 0, 5]} rotation={-Math.PI / 4} scale={[6, 1, 1]} />
      <ConcreteWall position={[0, 0, -30]} rotation={0} scale={[15, 1, 1]} />

      {/* PANNEAUX NÉON */}
      <NeonSign position={[0, 8, -25]} color="#ff6b6b" label="ART" />
      <NeonSign position={[-15, 6, 10]} color="#4ecdc4" label="CREATE" />
      <NeonSign position={[15, 6, 10]} color="#feca57" label="EXPRESS" />
      <NeonSign position={[0, 10, 20]} color="#ff9ff3" label="UNDERGROUND" />

      {/* PEDESTAUX D'EXPOSITION */}
      <ArtPedestal position={[-10, 0, -8]} rotation={-0.3} />
      <ArtPedestal position={[10, 0, -8]} rotation={0.3} />
      <ArtPedestal position={[-8, 0, 12]} rotation={Math.PI - 0.2} />
      <ArtPedestal position={[8, 0, 12]} rotation={-Math.PI + 0.2} />

      {/* CADRES DE GALERIE */}
      <GalleryFrame position={[0, 0, -20]} rotation={0} />
      <GalleryFrame position={[-15, 0, 0]} rotation={Math.PI / 2} />
      <GalleryFrame position={[15, 0, 0]} rotation={-Math.PI / 2} />

      {/* BOMBES DE SPRAY - accessoire par terre */}
      <SprayCan position={[-18, 0, 15]} rotation={0.5} />
      <SprayCan position={[-20, 0, 18]} rotation={1.2} />
      <SprayCan position={[18, 0, 15]} rotation={-0.8} />
      <SprayCan position={[22, 0, -10]} rotation={2} />

      {/* TAPIS DE SOL néon */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[10, 12, 6]} />
        <meshStandardMaterial
          color="#ff6b6b"
          emissive="#ff6b6b"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, Math.PI / 3, 0]} receiveShadow>
        <ringGeometry args={[10, 12, 6]} />
        <meshStandardMaterial
          color="#4ecdc4"
          emissive="#4ecdc4"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, -Math.PI / 3, 0]} receiveShadow>
        <ringGeometry args={[10, 12, 6]} />
        <meshStandardMaterial
          color="#feca57"
          emissive="#feca57"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* PARTICULES NÉON */}
      <NeonParticles count={250} />
    </group>
  );
}
