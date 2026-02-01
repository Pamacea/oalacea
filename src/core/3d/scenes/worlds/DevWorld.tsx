// DevWorld - Imperium Warhammer 40k style
'use client';

import { useMemo } from 'react';
import { ImperialPillar, GothicArch, DevTerminal, DustParticles } from './dev/DevComponents';
import { ImperiumPortal } from '../portals';
import { DevProjectPedestals } from '../objects/ProjectPedestal';
import { BlogDocuments, AdminTerminalWrapper, BlogContentTerminal, ProjectContentTerminal } from '../objects';
import { TechPriestGuide } from '@/core/3d/npc';

interface DevWorldProps {
  position?: [number, number, number];
}

export function DevWorld({ position = [0, 0, 0] }: DevWorldProps) {
  const [x, y, z] = position;

  const pillarPositions = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const radius = 25;
      return { id: i, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
    });
  }, []);

  return (
    <group position={[x, y, z]}>
      {/* Piliers gothiques */}
      {pillarPositions.map((pillar) => (
        <ImperialPillar key={`pillar-${pillar.id}`} position={[pillar.x, 0, pillar.z]} />
      ))}

      {/* Arcs gothiques */}
      <GothicArch position={[18, 0, 0]} rotation={Math.PI / 2} />
      <GothicArch position={[-18, 0, 0]} rotation={-Math.PI / 2} />
      <GothicArch position={[0, 0, 18]} rotation={0} />
      <GothicArch position={[0, 0, -18]} rotation={Math.PI} />


      {/* Terminaux */}
      <DevTerminal position={[-12, 0, -8]} rotation={0.3} />
      <DevTerminal position={[12, 0, -8]} rotation={-0.3} />
      <DevTerminal position={[-8, 0, 8]} rotation={Math.PI - 0.3} />
      <DevTerminal position={[8, 0, 8]} rotation={-Math.PI + 0.3} />

      {/* Particules */}
      <DustParticles count={300} />

      {/* Projets exposés - Pedestals impériaux */}
      <DevProjectPedestals activeProjectId={undefined} />

      {/* Portail vers l'Underground - AU CENTRE */}
      <ImperiumPortal position={[0, 0, 0]} targetWorld="art" rotation={0} />

      {/* Blog Posts In-World */}
      <BlogDocuments world="DEV" />

      {/* Admin Terminal - Near center but not blocking */}
      <AdminTerminalWrapper world="DEV" position={[8, 0, 8]} />

      {/* AI Guide - Tech Priest */}
      <TechPriestGuide position={[-5, 0, 8]} />

      {/* Content Terminals - For reading blogs and projects */}
      <BlogContentTerminal position={[-12, 0, 12]} world="DEV" />
      <ProjectContentTerminal position={[12, 0, 12]} world="DEV" />
    </group>
  );
}
