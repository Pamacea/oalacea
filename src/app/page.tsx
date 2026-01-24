// 3D HomePage - Isometric view with controllable character
'use client';

import { useEffect, useState } from 'react';
import { SceneCanvas } from './components/SceneCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { LoadingScreen } from '@/components/3d/LoadingScreen';
import { FloatingUI } from '@/components/3d/FloatingUI';
import { useWorldStore } from '@/store/3d-world-store';

export default function HomePage() {
  const currentWorld = useWorldStore((s) => s.currentWorld);
  const [mounted, setMounted] = useState(false);
  const [cameraMode, setCameraMode] = useState<'follow' | 'free'>('follow');
  const [showShortcuts, setShowShortcuts] = useState(false);

  const toggleCamera = () => setCameraMode(m => m === 'follow' ? 'free' : 'follow');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        toggleCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <SceneCanvas currentWorld={currentWorld} cameraMode={cameraMode} />
      <LoadingScreen />
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
