// Character 3D model
'use client';

import type { WorldType } from '../scenes/types';

interface CharacterModelProps {
  isMoving: boolean;
  isSprinting: boolean;
}

export function CharacterModel({ isMoving, isSprinting }: CharacterModelProps) {
  const colors: Record<WorldType, { body: string; glow: string; sprint: string }> = {
    dev: { body: '#d4af37', glow: '#8b0000', sprint: '#ff6b00' },
    art: { body: '#ff6b6b', glow: '#4ecdc4', sprint: '#feca57' },
  };

  const worldType: WorldType = 'dev'; // TODO: get from context
  const c = colors[worldType];

  return (
    <>
      {/* Ombre portée */}
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[isSprinting ? 0.6 : 0.5, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {/* Glow */}
      <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, isSprinting ? 0.9 : 0.7, 32]} />
        <meshBasicMaterial color={isSprinting ? c.sprint : c.glow} transparent opacity={isMoving ? 0.6 : 0.3} />
      </mesh>

      {/* Corps */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1.3, 0]} castShadow>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color={c.body} roughness={0.3} metalness={0.5} emissive={isSprinting ? c.sprint : c.body} emissiveIntensity={isSprinting ? 0.5 : 0.2} />
        </mesh>
        <mesh position={[0, 0.65, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.55, 8, 16]} />
          <meshStandardMaterial color={c.body} roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[-0.28, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color={c.body} metalness={0.6} />
        </mesh>
        <mesh position={[0.28, 0.9, 0]} castShadow>
          <sphereGeometry args={[0.14, 8, 8]} />
          <meshStandardMaterial color={c.body} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.15, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.18, 0.35, 4]} />
          <meshBasicMaterial color={isSprinting ? c.sprint : c.glow} transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Particules de mouvement */}
      {isMoving && (
        <>
          <mesh position={[-0.35, 0.1, -0.25]}>
            <sphereGeometry args={[0.06, 4, 4]} />
            <meshBasicMaterial color={isSprinting ? c.sprint : c.glow} transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.35, 0.1, -0.25]}>
            <sphereGeometry args={[0.06, 4, 4]} />
            <meshBasicMaterial color={isSprinting ? c.sprint : c.glow} transparent opacity={0.6} />
          </mesh>
        </>
      )}
    </>
  );
}
