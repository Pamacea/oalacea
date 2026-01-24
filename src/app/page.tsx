// 3D HomePage - Vue isométrique avec personnage contrôlable (style LoL)
// Contrôles: Clic droit pour se déplacer, Espace pour switch caméra, Shift pour sprint
'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { TopDownScene } from '@/core/3d/scenes/TopDownScene';
import { LoadingScreen } from '@/components/3d/LoadingScreen';
import { FloatingUI } from '@/components/3d/FloatingUI';
import { useWorldStore } from '@/store/3d-world-store';
import type { WorldType } from '@/core/3d/scenes/types';

export default function HomePage() {
  const currentWorld = useWorldStore((s) => s.currentWorld);
  const [mounted, setMounted] = useState(false);
  const [cameraMode, setCameraMode] = useState<'follow' | 'free'>('follow');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Toggle caméra
  const toggleCamera = () => {
    setCameraMode(m => m === 'follow' ? 'free' : 'follow');
  };

  // Écouter la touche Space pour toggle
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
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const worldConfig: Record<WorldType, { bg: string; fog: string }> = {
    dev: { bg: '#0a0a0a', fog: '#050505' },
    art: { bg: '#1a1a2e', fog: '#0f0f23' },
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <Canvas
        shadows
        dpr={[1, 2]}
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
        {/* Fog */}
        <fogExp2 args={[worldConfig[currentWorld].fog, 0.02]} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <hemisphereLight
          args={[worldConfig[currentWorld].bg, '#000000', 0.6]}
        />

        {/* Lumières directionnelles dynamiques */}
        <directionalLight
          position={[10, 20, 10]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Lumières colorées selon le monde */}
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

        {/* Scène top-down avec personnage et caméra toggleable */}
        <TopDownScene worldType={currentWorld} cameraMode={cameraMode} />

        {/* Environment */}
        <Environment preset={currentWorld === 'dev' ? 'night' : 'city'} />
      </Canvas>

      {/* UI Overlay */}
      <LoadingScreen />
      <FloatingUI />

      {/* Icônes en bas à droite */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 items-end">
        {/* Panel des raccourcis (déroulant) */}
        {showShortcuts && (
          <div className="mb-2 rounded-lg bg-black/80 backdrop-blur-md p-3 text-white border border-white/10 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <h3 className="text-xs font-semibold mb-2 text-white/50 uppercase tracking-wider">Controls</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Move</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">Right Click</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Camera</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">Space</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-white/70">Sprint</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">Shift</span>
              </div>
              {cameraMode === 'free' && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/70">Free Cam</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">WASD</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bouton raccourcis */}
        <button
          onClick={() => setShowShortcuts(s => !s)}
          className={`w-10 h-10 rounded-lg backdrop-blur-md border flex items-center justify-center transition-all ${
            showShortcuts
              ? 'bg-white/20 border-white/30'
              : 'bg-black/50 border-white/10 hover:bg-white/10'
          }`}
          title="Controls"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>

        {/* Bouton caméra lock/unlock */}
        <button
          onClick={toggleCamera}
          className={`w-10 h-10 rounded-lg backdrop-blur-md border flex items-center justify-center transition-all ${
            cameraMode === 'free'
              ? 'bg-orange-600/80 border-orange-400'
              : 'bg-black/50 border-white/10 hover:bg-white/10'
          }`}
          title={cameraMode === 'follow' ? 'Unlock camera (Space)' : 'Lock camera (Space)'}
        >
          {cameraMode === 'follow' ? (
            // Icône cadenas verrouillé
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9V6a5 5 0 00-10 0v2H6v10h12V8h-2zM9 6a3 3 0 116 0v2H9V6z" />
            </svg>
          ) : (
            // Icône cadenas déverrouillé
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-9h-1V6a5 5 0 00-10 0v2H6v10h12V8zm-6-5a3 3 0 013 3v2H9V6a3 3 0 013-3zm0 14a4 4 0 110-8 4 4 0 010 8z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
