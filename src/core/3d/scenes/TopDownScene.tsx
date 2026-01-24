// TopDownScene - Scène isométrique style LoL
// Contrôles: Clic droit pour se déplacer, Shift pour sprint
// Barre espace: Toggle caméra follow vs free
'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Vector3 } from 'three';
import type { WorldType } from './types';
import { DevWorld, ArtWorld } from './worlds';
import { InteractionZone } from './interactions';
import { useProximity } from '@/hooks/useProximity';
import { useCharacterStore } from '@/store/3d-character-store';
import { useOverlayStore } from '@/store/3d-overlay-store';
import { PhysicsCharacter } from '@/core/3d/physics/PhysicsCharacter';
import { PhysicsWorld, PhysicsPillar, PhysicsArch, PhysicsTerminal, PhysicsMonolith, PhysicsGround, PhysicsWall, PhysicsPedestal } from '@/core/3d/physics';
import { FollowCamera } from '@/core/3d/camera';

const INITIAL_POSITION = [0, 0.5, 0] as [number, number, number];

interface TopDownSceneProps {
  worldType: WorldType;
  cameraMode?: 'follow' | 'free';
}

export function TopDownScene({ worldType, cameraMode: externalCameraMode }: TopDownSceneProps) {
  const characterPositionRef = useRef(new Vector3(...INITIAL_POSITION));
  const [internalCameraMode, _setInternalCameraMode] = useState<'follow' | 'free'>('follow');
  const cameraMode = externalCameraMode ?? internalCameraMode;
  const [targetPosition, setTargetPosition] = useState<Vector3 | null>(null);
  const [isSprinting, setIsSprinting] = useState(false);

  // Couleurs du monde
  const colors = {
    dev: {
      ground: '#1a1a1a',
      grid: '#333333',
      gridAlt: '#2a2a2a',
      accent: '#d4af37',
      pillar: '#2a2a2a',
    },
    art: {
      ground: '#16213e',
      grid: '#2a2a4a',
      gridAlt: '#1e1e3a',
      accent: '#ff6b6b',
      pillar: '#1e1e3a',
    },
  }[worldType];

  // Zones d'interaction avec routes
  const interactionZones = useMemo(() => [
    { id: 'zone-blog', position: [-15, 0, -15] as [number, number, number], label: 'Blog', route: '/blog' },
    { id: 'zone-portfolio-dev', position: [15, 0, -15] as [number, number, number], label: 'Portfolio Dev', route: '/portfolio' },
    { id: 'zone-portfolio-art', position: [-15, 0, 15] as [number, number, number], label: 'Portfolio Art', route: '/portfolio' },
    { id: 'zone-about', position: [15, 0, 15] as [number, number, number], label: 'About', route: '/about' },
  ], []);

  // Proximity detection pour les interactions
  const proximityObjects = useMemo(() =>
    interactionZones.map(zone => ({
      id: zone.id,
      position: zone.position,
      radius: 3.5,
      data: { name: zone.label, route: zone.route },
    })),
    [interactionZones]
  );
  useProximity(proximityObjects);

  // Store pour l'overlay
  const openOverlay = useOverlayStore((s) => s.openOverlay);
  const canInteract = useCharacterStore((s) => s.canInteract);
  const interactTarget = useCharacterStore((s) => s.interactTarget);

  // Handler pour la touche E (interaction)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && !e.repeat) {
        if (canInteract && interactTarget?.route && interactTarget?.name) {
          openOverlay(interactTarget.route, interactTarget.name);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canInteract, interactTarget, openOverlay]);

  return (
    <PhysicsWorld worldType={worldType}>
      {/* Sol physique */}
      <PhysicsGround />

      {/* Sol visuel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={colors.ground} roughness={0.9} />
      </mesh>

      {/* Monde spécifique selon le type */}
      {worldType === 'dev' ? (
        <>
          <DevWorld />
          {/* Piliers gothiques */}
          <PhysicsPillar position={[0, 4, -25]} />
          <PhysicsPillar position={[25, 4, 0]} />
          <PhysicsPillar position={[-25, 4, 0]} />
          <PhysicsPillar position={[0, 4, 25]} />
          {/* Arcs */}
          <PhysicsArch position={[18, 0, 0]} rotation={Math.PI / 2} />
          <PhysicsArch position={[-18, 0, 0]} rotation={-Math.PI / 2} />
          <PhysicsArch position={[0, 0, 18]} rotation={0} />
          <PhysicsArch position={[0, 0, -18]} rotation={Math.PI} />
          {/* Monolithe */}
          <PhysicsMonolith position={[0, 5, -20]} />
          {/* Terminaux */}
          <PhysicsTerminal position={[-12, 0.75, -8]} rotation={0.3} />
          <PhysicsTerminal position={[12, 0.75, -8]} rotation={-0.3} />
          <PhysicsTerminal position={[-8, 0.75, 8]} rotation={Math.PI - 0.3} />
          <PhysicsTerminal position={[8, 0.75, 8]} rotation={-Math.PI + 0.3} />
        </>
      ) : (
        <>
          <ArtWorld />
          {/* Murs de béton */}
          <PhysicsWall position={[-20, 4, -15]} rotation={0.3} />
          <PhysicsWall position={[20, 4, -15]} rotation={-0.3} />
          <PhysicsWall position={[-25, 4, 5]} rotation={Math.PI / 4} />
          <PhysicsWall position={[25, 4, 5]} rotation={-Math.PI / 4} />
          <PhysicsWall position={[0, 4, -30]} rotation={0} />
          {/* Piédestaux */}
          <PhysicsPedestal position={[-10, 1, -8]} rotation={-0.3} />
          <PhysicsPedestal position={[10, 1, -8]} rotation={0.3} />
          <PhysicsPedestal position={[-8, 1, 12]} rotation={Math.PI - 0.2} />
          <PhysicsPedestal position={[8, 1, 12]} rotation={-Math.PI + 0.2} />
        </>
      )}

      {/* Grille subtile pour repères visuels */}
      <gridHelper args={[100, 50, colors.grid, colors.gridAlt]} position={[0, 0, 0]} />

      {/* Zones d'interaction */}
      {interactionZones.map((zone) => (
        <InteractionZone
          key={zone.id}
          id={zone.id}
          position={zone.position}
          label={zone.label}
          route={zone.route}
          worldType={worldType}
          color={colors.accent}
          radius={3}
        />
      ))}

      {/* Personnage contrôlable avec physique */}
      <PhysicsCharacter
        worldType={worldType}
        onTargetSet={(pos) => setTargetPosition(pos)}
        onSprintChange={setIsSprinting}
      />

      {/* Indicateur de destination */}
      {targetPosition && (
        <mesh position={[targetPosition.x, 0.05, targetPosition.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.8, 32]} />
          <meshBasicMaterial
            color={isSprinting ? '#ff6b00' : worldType === 'dev' ? '#8b0000' : '#4ecdc4'}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Caméra isométrique */}
      <FollowCamera targetRef={characterPositionRef} mode={cameraMode} />
    </PhysicsWorld>
  );
}
