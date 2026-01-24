// TopDownScene - Scène isométrique style LoL
// Contrôles: Clic droit pour se déplacer, Shift pour sprint
// Barre espace: Toggle caméra follow vs free
'use client';

import { useRef, useState, useEffect } from 'react';
import { Vector3 } from 'three';
import type { WorldType } from './types';
import { DevWorld, ArtWorld } from './worlds';
import { InteractionZone } from './interactions';
import { useInteractionsRegistry } from './interactions/useInteractionsRegistry';
import { useCharacterStore } from '@/store/3d-character-store';
import { useOverlayStore } from '@/store/3d-overlay-store';
import { useWorldStore } from '@/store/3d-world-store';
import { Character } from '@/core/3d/character';
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

  // Utilise le registry d'interactions (PLUS DE CODE HARDCODÉ !)
  const { proximityObjects, visualInteractions } = useInteractionsRegistry(worldType);

  // Store pour l'overlay et interactions
  const openOverlay = useOverlayStore((s) => s.openOverlay);
  const switchWorld = useWorldStore((s) => s.switchWorld);
  const canInteract = useCharacterStore((s) => s.canInteract);
  const interactTarget = useCharacterStore((s) => s.interactTarget);

  // Handler pour la touche E (interaction)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && !e.repeat) {
        if (canInteract && interactTarget) {
          if (interactTarget.targetWorld) {
            switchWorld(interactTarget.targetWorld);
          } else if (interactTarget.route && interactTarget.name) {
            openOverlay(interactTarget.route, interactTarget.name);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canInteract, interactTarget, openOverlay, switchWorld]);

  return (
    <>
      {/* Sol visuel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={colors.ground} roughness={0.9} />
      </mesh>

      {/* Monde spécifique selon le type */}
      {worldType === 'dev' ? <DevWorld /> : <ArtWorld />}

      {/* Grille subtile pour repères visuels */}
      <gridHelper args={[100, 50, colors.grid, colors.gridAlt]} position={[0, 0, 0]} />

      {/* Zones d'interaction visuelles (sans les portails qui ont leur propre visuel) */}
      {visualInteractions.map((zone) => (
        <InteractionZone
          key={zone.id}
          id={zone.id}
          position={zone.position}
          label={zone.label}
          route={zone.route ?? ''}
          worldType={worldType}
          color={colors.accent}
          radius={3}
        />
      ))}

      {/* Personnage contrôlable avec système maison */}
      <Character
        worldType={worldType}
        positionRef={characterPositionRef}
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
    </>
  );
}
