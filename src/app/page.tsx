// 3D HomePage - Isometric view with controllable character
'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useWorldStore } from '@/features/3d-world/store';
import { FloatingNav } from '@/components/navigation/FloatingNav';

// Lazy load 3D components for better initial load performance
const SceneCanvas = dynamic(() => import('@/features/3d-world').then(mod => ({ default: mod.SceneCanvas })), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-imperium-black-deep flex items-center justify-center">
      <div className="animate-pulse text-imperium-crimson font-display text-xl">Chargement de la scène 3D...</div>
    </div>
  ),
});

const LoadingScreen = dynamic(() => import('@/features/3d-world').then(mod => ({ default: mod.LoadingScreen })), { ssr: false });
const WorldTransitionScreen = dynamic(() => import('@/features/3d-world').then(mod => ({ default: mod.WorldTransitionScreen })), { ssr: false });
const FloatingUI = dynamic(() => import('@/features/3d-world').then(mod => ({ default: mod.FloatingUI })), { ssr: false });

// Camera position interface
interface CameraPosition {
  x: number;
  z: number;
}

export default function HomePage() {
  const currentWorld = useWorldStore((s) => s.currentWorld);
  const [cameraMode, setCameraMode] = useState<'follow' | 'free'>('follow');
  const cameraPositionRef = useRef<CameraPosition>({ x: -15, z: 15 });

  const toggleCamera = () => {
    setCameraMode(m => m === 'follow' ? 'free' : 'follow');
  };

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
      <Suspense fallback={
        <div className="fixed inset-0 bg-imperium-black-deep flex items-center justify-center">
          <div className="animate-pulse text-imperium-crimson font-display text-xl">Chargement...</div>
        </div>
      }>
        <SceneCanvas
          currentWorld={currentWorld}
          cameraMode={cameraMode}
          onCameraPositionChange={(pos: CameraPosition) => { cameraPositionRef.current = pos; }}
        />
      </Suspense>
      <LoadingScreen />
      <WorldTransitionScreen />
      <FloatingUI
        cameraMode={cameraMode}
        onToggleCamera={toggleCamera}
      />
      <FloatingNav />
    </div>
  );
}
