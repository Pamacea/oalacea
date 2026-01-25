// 3D HomePage - Isometric view with controllable character
'use client';

import { useEffect, useState, useCallback } from 'react';
import { SceneCanvas } from './components/SceneCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { LoadingScreen } from '@/components/3d/LoadingScreen';
import { WorldTransitionScreen } from '@/components/3d/WorldTransitionScreen';
import { FloatingUI } from '@/components/3d/FloatingUI';
import { useWorldStore } from '@/store/3d-world-store';

export default function HomePage() {
  const currentWorld = useWorldStore((s) => s.currentWorld);
  const [cameraMode, setCameraMode] = useState<'follow' | 'free'>('follow');
  const [showShortcuts, setShowShortcuts] = useState(false);

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
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <SceneCanvas currentWorld={currentWorld} cameraMode={cameraMode} />
      <LoadingScreen />
      <WorldTransitionScreen />
      <FloatingUI />
      <ControlsPanel
        showShortcuts={showShortcuts}
        setShowShortcuts={setShowShortcuts}
        cameraMode={cameraMode}
        onToggleCamera={toggleCamera}
      />
    </div>
  );
}
