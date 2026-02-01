'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { Suspense } from 'react';

interface Admin3DPreviewProps {
  world: 'DEV' | 'ART';
}

function PreviewScene({ world }: { world: 'DEV' | 'ART' }) {
  const colors = world === 'DEV'
    ? { background: 0x0a0a0a, grid: 0x1a1a1a, axis: 0xd4af37 }
    : { background: 0x1a1a2a, grid: 0x2a2a3a, axis: 0x4ecdc4 };

  return (
    <>
      <PerspectiveCamera makeDefault position={[15, 12, 15]} fov={50} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, 5, -10]} color={world === 'DEV' ? 0x00ff88 : 0x4ecdc4} intensity={0.5} />

      {/* Ground Grid */}
      <Grid
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.5}
        cellColor={colors.grid}
        sectionSize={10}
        sectionThickness={1}
        sectionColor={colors.axis}
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Axes Helper */}
      <group>
        <mesh position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshBasicMaterial color="#ff0000" />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshBasicMaterial color="#00ff00" />
        </mesh>
        <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 2]} />
          <meshBasicMaterial color="#0000ff" />
        </mesh>
      </group>

      {/* Reference Cube - represents the player/character */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={world === 'DEV' ? 0xd4af37 : 0xff6b6b} />
      </mesh>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color={colors.background} roughness={0.9} />
      </mesh>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-slate-500">Chargement de la prévisualisation...</div>
    </div>
  );
}

export function Admin3DPreview({ world }: Admin3DPreviewProps) {
  const colors = world === 'DEV'
    ? { bg: 'bg-slate-950', border: 'border-violet-500/30', text: 'text-violet-400' }
    : { bg: 'bg-slate-900', border: 'border-teal-500/30', text: 'text-teal-400' };

  return (
    <div className={`rounded-sm border ${colors.border} ${colors.bg} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2">
        <span className={`text-xs font-medium ${colors.text}`}>
          {world === 'DEV' ? 'Dev World' : 'Art World'} - Preview
        </span>
        <span className="text-xs text-slate-500">Mini Scene</span>
      </div>
      <div className="h-48 w-full">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          className="h-full w-full"
        >
          <Suspense fallback={null}>
            <PreviewScene world={world} />
          </Suspense>
        </Canvas>
      </div>
      <div className="border-t border-white/10 bg-white/5 px-3 py-2">
        <p className="text-xs text-slate-500">Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
}
