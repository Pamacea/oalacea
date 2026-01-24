// SceneContainer - Container 3D principal avec Canvas R3F
'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Preload } from '@react-three/drei';
import * as THREE from 'three';
import type { WorldType } from './types';
import { useWorldStore } from '@/store/3d-world-store';
import { DEV_WORLD, ART_WORLD } from '@/config/3d/worlds';

interface SceneContainerProps {
  children?: React.ReactNode;
  currentWorld?: WorldType;
}

function SceneContent({ children, currentWorld }: SceneContainerProps) {
  const worldConfig = currentWorld === 'art' ? ART_WORLD : DEV_WORLD;

  const fog = useMemo(
    () => new THREE.FogExp2(worldConfig.colors.fog, 0.02),
    [worldConfig.colors.fog]
  );

  const backgroundColor = useMemo(() => worldConfig.colors.background, [worldConfig.colors.background]);

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={[0, 5, 10]}
        fov={50}
        near={0.1}
        far={1000}
      />

      {/* Fog */}
      <primitive object={fog} attach="fog" />

      {/* Lighting de base */}
      <ambientLight
        intensity={worldConfig.lighting.ambientIntensity}
        color={worldConfig.colors.ambient}
      />

      {/* Lumières ponctuelles du monde */}
      {worldConfig.lighting.pointLights.map((light, index) => (
        <pointLight
          key={`pointlight-${index}`}
          position={light.position}
          color={light.color}
          intensity={light.intensity}
          decay={light.decay}
          distance={100}
        />
      ))}

      {/* Environnement HDRI */}
      <Environment
        preset={currentWorld === 'dev' ? 'night' : 'city'}
        background={false}
      />

      {/* Contenu personnalisé */}
      {children}

      {/* Preload pour optimisation */}
      <Preload all />
    </>
  );
}

export function SceneContainer({ children, currentWorld }: SceneContainerProps) {
  const worldStoreCurrentWorld = useWorldStore((s) => s.currentWorld);
  const activeWorld = currentWorld ?? worldStoreCurrentWorld;

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        onCreated={({ gl }) => {
          // Optimiser pour le dark mode
          gl.setClearColor('#0a0a0a');
        }}
      >
        <Suspense fallback={null}>
          <SceneContent currentWorld={activeWorld}>
            {children}
          </SceneContent>
        </Suspense>
      </Canvas>
    </div>
  );
}
