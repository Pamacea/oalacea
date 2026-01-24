// DevWorld - Imperium Warhammer 40k style
'use client';

import { useMemo } from 'react';
import { ImperialPillar, GothicArch, DevTerminal, DustParticles } from './dev/DevComponents';

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

      {/* Monolithe central */}
      <group position={[0, 0, -20]}>
        <mesh position={[0, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 10, 2]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[0, 5, 1.1]} castShadow>
          <boxGeometry args={[6.2, 10.2, 0.2]} />
          <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} emissive="#d4af37" emissiveIntensity={0.1} />
        </mesh>
        <group position={[0, 7, 1.3]}>
          <mesh position={[-2, 0, 0]} rotation={[0, 0, 0.3]} castShadow>
            <coneGeometry args={[1, 3, 4]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} emissive="#d4af37" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[2, 0, 0]} rotation={[0, 0, -0.3]} castShadow>
            <coneGeometry args={[1, 3, 4]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} emissive="#d4af37" emissiveIntensity={0.3} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.8]} />
            <meshStandardMaterial color="#8b0000" metalness={0.9} emissive="#8b0000" emissiveIntensity={0.3} />
          </mesh>
        </group>
      </group>

      {/* Terminaux */}
      <DevTerminal position={[-12, 0, -8]} rotation={0.3} />
      <DevTerminal position={[12, 0, -8]} rotation={-0.3} />
      <DevTerminal position={[-8, 0, 8]} rotation={Math.PI - 0.3} />
      <DevTerminal position={[8, 0, 8]} rotation={-Math.PI + 0.3} />

      {/* Particules */}
      <DustParticles count={300} />
    </group>
  );
}
