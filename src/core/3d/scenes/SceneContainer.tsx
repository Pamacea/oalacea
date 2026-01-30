// SceneContainer - Container 3D principal avec Canvas R3F
'use client';

import { Suspense, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Preload } from '@react-three/drei';
import * as THREE from 'three';
import type { WorldType } from './types';
import { useWorldStore } from '@/features/3d-world/store';
import { useSettingsStore, selectQualitySettings } from '@/store/settings-store';
import { DEV_WORLD, ART_WORLD } from '@/config/3d/worlds';

interface SceneContainerProps {
  children?: React.ReactNode;
  currentWorld?: WorldType;
}

function SceneContent({ children, currentWorld }: SceneContainerProps) {
  const worldConfig = currentWorld === 'art' ? ART_WORLD : DEV_WORLD;
  const qualitySettings = useSettingsStore(selectQualitySettings);

  const fog = useMemo(
    () => new THREE.FogExp2(worldConfig.colors.fog, 0.02),
    [worldConfig.colors.fog]
  );

  const backgroundColor = useMemo(() => worldConfig.colors.background, [worldConfig.colors.background]);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 5, 10]}
        fov={50}
        near={0.1}
        far={qualitySettings.renderDistance}
      />

      <primitive object={fog} attach="fog" />

      <ambientLight
        intensity={worldConfig.lighting.ambientIntensity * (qualitySettings.bloomEnabled ? 1 : 0.7)}
        color={worldConfig.colors.ambient}
      />

      {worldConfig.lighting.pointLights.map((light, index) => (
        <pointLight
          key={`pointlight-${index}`}
          position={light.position}
          color={light.color}
          intensity={light.intensity * (qualitySettings.bloomEnabled ? 1 : 0.7)}
          decay={light.decay}
          distance={qualitySettings.renderDistance / 2}
        />
      ))}

      <directionalLight
        position={[10, 20, 10]}
        intensity={qualitySettings.bloomEnabled ? 1 : 0.5}
        castShadow
        shadow-mapSize-width={qualitySettings.shadowQuality}
        shadow-mapSize-height={qualitySettings.shadowQuality}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      <Environment
        preset={currentWorld === 'dev' ? 'night' : 'city'}
        background={false}
      />

      {children}

      <Preload all />
    </>
  );
}

export function SceneContainer({ children, currentWorld }: SceneContainerProps) {
  const worldStoreCurrentWorld = useWorldStore((s) => s.currentWorld);
  const activeWorld = currentWorld ?? worldStoreCurrentWorld;
  const qualitySettings = useSettingsStore(selectQualitySettings);
  const detectMobileAndApplyQuality = useSettingsStore((s) => s.detectMobileAndApplyQuality);

  useEffect(() => {
    detectMobileAndApplyQuality();
  }, [detectMobileAndApplyQuality]);

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        shadows
        dpr={qualitySettings.antialiasing ? [1, 2] : [1, 1]}
        gl={{
          antialias: qualitySettings.antialiasing,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
        performance={{ min: 0.5 }}
        frameloop={qualitySettings.targetFPS === 30 ? 'never' : 'always'}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a0a');
          gl.shadowMap.type = {
            basic: THREE.BasicShadowMap,
            pcf: THREE.PCFShadowMap,
            pcfsoft: THREE.PCFSoftShadowMap,
          }[qualitySettings.shadowMapType];
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
