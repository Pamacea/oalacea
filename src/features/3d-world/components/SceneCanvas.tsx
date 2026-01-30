// SceneCanvas - 3D Canvas with lighting and environment
'use client';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { WorldType } from '@/types/3d';
import { TopDownScene } from '@/core/3d/scenes/TopDownScene';
import { ThreeErrorBoundary } from '@/shared/components';

interface CameraPosition {
  x: number;
  z: number;
}

interface SceneCanvasProps {
  currentWorld: WorldType;
  cameraMode: 'follow' | 'free';
  onCameraPositionChange?: (position: CameraPosition) => void;
}

const worldConfig: Record<WorldType, { bg: string; fog: string }> = {
  dev: { bg: '#0a0a0a', fog: '#050505' },
  art: { bg: '#1a1a2e', fog: '#0f0f23' },
};

export function SceneCanvas({ currentWorld, cameraMode, onCameraPositionChange }: SceneCanvasProps) {
  return (
    <ThreeErrorBoundary>
      <Canvas
        shadows
        dpr={[1, 2]}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(worldConfig[currentWorld].bg);
          gl.setSize(window.innerWidth, window.innerHeight);
        }}
      >
        <fogExp2 args={[worldConfig[currentWorld].fog, 0.02]} />
        <ambientLight intensity={0.4} />
        <hemisphereLight args={[worldConfig[currentWorld].bg, '#000000', 0.6]} />
        <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow shadow-mapSize={[2048, 2048]} />

        {currentWorld === 'dev' ? (
          <>
            <pointLight position={[20, 10, 20]} color="#d4af37" intensity={2} decay={1.5} />
            <pointLight position={[-20, 10, -20]} color="#8b0000" intensity={1.5} decay={1.5} />
            <pointLight position={[0, 15, 0]} color="#d4af37" intensity={1} decay={2} />
          </>
        ) : (
          <>
            <pointLight position={[20, 10, 20]} color="#ff6b6b" intensity={2} decay={1.5} />
            <pointLight position={[-20, 10, -20]} color="#4ecdc4" intensity={2} decay={1.5} />
            <pointLight position={[0, 15, 0]} color="#feca57" intensity={1} decay={2} />
          </>
        )}

        <TopDownScene
          worldType={currentWorld}
          cameraMode={cameraMode}
          onCameraPositionChange={onCameraPositionChange}
        />
        <Environment preset={currentWorld === 'dev' ? 'night' : 'city'} />
      </Canvas>
    </ThreeErrorBoundary>
  );
}
