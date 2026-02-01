// 3D HomePage - Isometric view with controllable character
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  SceneCanvas,
  ControlsPanel,
  LoadingScreen,
  WorldTransitionScreen,
  FloatingUI,
} from '@/features/3d-world';
import { useWorldStore } from '@/features/3d-world/store';
import { FloatingNav } from '@/components/navigation/FloatingNav';

// Camera position interface
interface CameraPosition {
  x: number;
  z: number;
}

export default function HomePage() {
  const currentWorld = useWorldStore((s) => s.currentWorld);
  const [cameraMode, setCameraMode] = useState<'follow' | 'free'>('follow');
  const cameraPositionRef = useRef<CameraPosition>({ x: -15, z: 15 });

  const toggleCamera = useCallback(() => {
    setCameraMode(m => m === 'follow' ? 'free' : 'follow');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        toggleCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCamera]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden bg-imperium-black-deep"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.code === 'Space' && !e.repeat) {
          e.preventDefault();
          toggleCamera();
        }
      }}
    >
      <SceneCanvas
        currentWorld={currentWorld}
        cameraMode={cameraMode}
        onCameraPositionChange={(pos: CameraPosition) => { cameraPositionRef.current = pos; }}
      />
      <LoadingScreen />
      <WorldTransitionScreen />
      <FloatingUI />
      <FloatingNav />
      <ControlsPanel
        cameraMode={cameraMode}
        onToggleCamera={toggleCamera}
      />
    </div>
  );
}
