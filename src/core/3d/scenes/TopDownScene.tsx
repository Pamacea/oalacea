'use client';

import { useRef, useState, useEffect } from 'react';
import { Vector3, PerspectiveCamera as PerspectiveCameraType, Group } from 'three';
import type { WorldType } from './types';
import { DevWorld, ArtWorld } from './worlds';
import { InteractionZone } from './interactions';
import { useInteractionsRegistry } from './interactions/useInteractionsRegistry';
import { useCharacterStore } from '@/features/3d-world/store';
import { useModalStore } from '@/store/modal-store';
import { useWorldStore } from '@/features/3d-world/store';
import { useSettingsStore, selectQualitySettings } from '@/store/settings-store';
import { Character } from '@/core/3d/character';
import { FollowCamera } from '@/core/3d/camera';
import { OcclusionManager } from '@/core/3d/camera/OcclusionManager';

const INITIAL_POSITION = [0, 0.5, 0] as [number, number, number];

interface CameraPosition {
  x: number;
  z: number;
}

interface TopDownSceneProps {
  worldType: WorldType;
  cameraMode?: 'follow' | 'free';
  onCameraPositionChange?: (position: CameraPosition) => void;
}

export function TopDownScene({ worldType, cameraMode: externalCameraMode, onCameraPositionChange }: TopDownSceneProps) {
  const characterPositionRef = useRef(new Vector3(...INITIAL_POSITION));
  const characterGroupRef = useRef<Group | null>(null);
  const cameraRef = useRef<PerspectiveCameraType | null>(null);
  const cameraMode = externalCameraMode ?? 'follow';
  const [targetPosition, setTargetPosition] = useState<Vector3 | null>(null);
  const [isSprinting, setIsSprinting] = useState(false);
  const [isOccluded, setIsOccluded] = useState(false);

  const qualitySettings = useSettingsStore(selectQualitySettings);

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

  const { allVisualInteractions } = useInteractionsRegistry(worldType);

  const openBlogListing = useModalStore((s) => s.openBlogListing);
  const openProjectListing = useModalStore((s) => s.openProjectListing);
  const openAboutListing = useModalStore((s) => s.openAboutListing);
  const openAdminListing = useModalStore((s) => s.openAdminListing);
  const switchWorld = useWorldStore((s) => s.switchWorld);
  const canInteract = useCharacterStore((s) => s.canInteract);
  const interactTarget = useCharacterStore((s) => s.interactTarget);

  const activeInteractionId = interactTarget ? (
    allVisualInteractions.find(z => z.label === interactTarget.name)?.id
  ) : null;

  // Debug: log interaction state
  console.log('[TopDownScene] canInteract:', canInteract, 'activeInteractionId:', activeInteractionId, 'interactTarget:', interactTarget);
  console.log('[TopDownScene] allVisualInteractions:', allVisualInteractions.map(z => ({ id: z.id, label: z.label })));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check modal state dynamically to avoid closure stale values
      const isModalOpen = useModalStore.getState().isOpen;

      console.log('[TopDownScene] Key pressed:', e.code, 'canInteract:', canInteract, 'interactTarget:', interactTarget, 'isModalOpen:', isModalOpen);

      if (isModalOpen) return;

      if (e.code === 'KeyE' && !e.repeat) {
        console.log('[TopDownScene] KeyE pressed, checking interaction...');
        if (canInteract && interactTarget) {
          console.log('[TopDownScene] Interaction detected:', interactTarget);
          if (interactTarget.targetWorld) {
            console.log('[TopDownScene] Switching world to:', interactTarget.targetWorld);
            switchWorld(interactTarget.targetWorld);
          } else if (interactTarget.route) {
            console.log('[TopDownScene] Opening route:', interactTarget.route);
            if (interactTarget.route === '/blog') {
              openBlogListing();
            } else if (interactTarget.route === '/portfolio') {
              openProjectListing();
            } else if (interactTarget.route === '/about') {
              openAboutListing();
            }
          } else if (interactTarget.type === 'admin') {
            console.log('[TopDownScene] Opening admin modal');
            openAdminListing();
          }
        } else {
          console.log('[TopDownScene] Cannot interact - canInteract:', canInteract, 'interactTarget:', interactTarget);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canInteract, interactTarget, openBlogListing, openProjectListing, openAboutListing, openAdminListing, switchWorld]);

  const gridSize = qualitySettings.renderDistance;
  const gridDivisions = Math.floor(gridSize / 2);

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeGeometry args={[gridSize, gridSize]} />
        <meshStandardMaterial color={colors.ground} roughness={0.9} />
      </mesh>

      {worldType === 'dev' ? <DevWorld /> : <ArtWorld />}

      <gridHelper args={[gridSize, gridDivisions, colors.grid, colors.gridAlt]} position={[0, 0, 0]} />

      {allVisualInteractions.map((zone) => (
        <InteractionZone
          key={zone.id}
          id={zone.id}
          position={zone.position}
          label={zone.label}
          route={zone.route ?? ''}
          worldType={worldType}
          color={colors.accent}
          radius={zone.radius ?? 3}
          type={zone.type}
          targetWorld={zone.targetWorld}
          isActive={canInteract && activeInteractionId === zone.id}
        />
      ))}

      <Character
        worldType={worldType}
        positionRef={characterPositionRef}
        onTargetSet={(pos) => setTargetPosition(pos)}
        onSprintChange={setIsSprinting}
        isOccluded={isOccluded}
        groupRef={characterGroupRef}
      />

      {targetPosition && qualitySettings.particleQuality !== 'low' && (
        <mesh
          position={[targetPosition.x, 0.05, targetPosition.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.5, 0.8, 32]} />
          <meshBasicMaterial
            color={isSprinting ? '#ff6b00' : worldType === 'dev' ? '#8b0000' : '#4ecdc4'}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      <FollowCamera
        targetRef={characterPositionRef}
        mode={cameraMode}
        cameraRef={cameraRef}
        onPositionChange={onCameraPositionChange}
      />

      {qualitySettings.particleQuality !== 'low' && (
        <OcclusionManager
          characterRef={characterGroupRef}
          cameraRef={cameraRef}
          onOcclusionChange={setIsOccluded}
        />
      )}
    </>
  );
}
