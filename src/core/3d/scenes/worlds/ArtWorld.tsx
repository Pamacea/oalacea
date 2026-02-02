// ArtWorld - Underground Art brutal + neon world
'use client';

import { ConcreteWall, NeonSign, ArtPedestal, SprayCan, GalleryFrame, NeonParticles } from './art/ArtComponents';
import { UndergroundPortal } from '../portals';
import { ArtProjectDisplays } from '../objects/ArtDisplay';
import { BlogDocuments, AdminTerminalWrapper, BlogContentTerminal, ProjectContentTerminal } from '../objects';
// NPC module removed - commenting out ArtCuratorGuide
// import { ArtCuratorGuide } from '@/core/3d/npc';

interface ArtWorldProps {
  position?: [number, number, number];
}

export function ArtWorld({ position = [0, 0, 0] }: ArtWorldProps) {
  const [x, y, z] = position;

  return (
    <group position={[x, y, z]}>
      {/* Murs de béton brut */}
      <ConcreteWall position={[-20, 0, -15]} rotation={0.3} scale={[8, 1, 1]} />
      <ConcreteWall position={[20, 0, -15]} rotation={-0.3} scale={[8, 1, 1]} />
      <ConcreteWall position={[-25, 0, 5]} rotation={Math.PI / 4} scale={[6, 1, 1]} />
      <ConcreteWall position={[25, 0, 5]} rotation={-Math.PI / 4} scale={[6, 1, 1]} />
      <ConcreteWall position={[0, 0, -30]} rotation={0} scale={[15, 1, 1]} />

      {/* Panneaux néon */}
      <NeonSign position={[0, 8, -25]} color="#ff6b6b" />
      <NeonSign position={[-15, 6, 10]} color="#4ecdc4" />
      <NeonSign position={[15, 6, 10]} color="#feca57" />
      <NeonSign position={[0, 10, 20]} color="#ff9ff3" />

      {/* Piédestaux d'exposition */}
      <ArtPedestal position={[-10, 0, -8]} rotation={-0.3} />
      <ArtPedestal position={[10, 0, -8]} rotation={0.3} />
      <ArtPedestal position={[-8, 0, 12]} rotation={Math.PI - 0.2} />
      <ArtPedestal position={[8, 0, 12]} rotation={-Math.PI + 0.2} />

      {/* Cadres de galerie */}
      <GalleryFrame position={[0, 0, -20]} rotation={0} />
      <GalleryFrame position={[-15, 0, 0]} rotation={Math.PI / 2} />
      <GalleryFrame position={[15, 0, 0]} rotation={-Math.PI / 2} />

      {/* Bombes de spray */}
      <SprayCan position={[-18, 0, 15]} rotation={0.5} />
      <SprayCan position={[-20, 0, 18]} rotation={1.2} />
      <SprayCan position={[18, 0, 15]} rotation={-0.8} />
      <SprayCan position={[22, 0, -10]} rotation={2} />

      {/* Tapis de sol néon - DÉSACTIVÉS car portail au centre */}
      {/* <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[10, 12, 6]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, Math.PI / 3, 0]} receiveShadow>
        <ringGeometry args={[10, 12, 6]} />
        <meshStandardMaterial color="#4ecdc4" emissive="#4ecdc4" emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, -Math.PI / 3, 0]} receiveShadow>
        <ringGeometry args={[10, 12, 6]} />
        <meshStandardMaterial color="#feca57" emissive="#feca57" emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh> */}

      {/* Particules néon */}
      <NeonParticles count={250} />

      {/* Projets exposés - Displays néon */}
      <ArtProjectDisplays activeProjectId={undefined} />

      {/* Portail vers l'Imperium - AU CENTRE */}
      <UndergroundPortal position={[0, 0, 0]} targetWorld="dev" rotation={0} />

      {/* Blog Posts In-World */}
      <BlogDocuments world="ART" />

      {/* Admin Terminal - Near center but not blocking */}
      <AdminTerminalWrapper world="ART" position={[-8, 0, 8]} />

      {/* AI Guide - Art Curator - REMOVED: npc module deleted */}
      {/* <ArtCuratorGuide position={[5, 0, 8]} /> */}

      {/* Content Terminals - For reading blogs and projects */}
      <BlogContentTerminal position={[-15, 0, 15]} world="ART" />
      <ProjectContentTerminal position={[15, 0, 15]} world="ART" />
    </group>
  );
}
