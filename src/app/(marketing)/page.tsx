// HomePage - Page d'accueil avec scène 3D
'use client';

import { SceneContainer } from '@/core/3d/scenes/SceneContainer';
import { TestScene } from '@/core/3d/scenes/TestScene';
import { LoadingScreen } from '@/features/3d-world/components';
import { FloatingUI } from '@/features/3d-world/components';
import { useWorldStore } from '@/features/3d-world/store';

export default function HomePage() {
  const currentWorld = useWorldStore((s) => s.currentWorld);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* 3D Scene */}
      <SceneContainer currentWorld={currentWorld}>
        <TestScene worldType={currentWorld} />
      </SceneContainer>

      {/* Loading Screen */}
      <LoadingScreen />

      {/* Floating UI */}
      <FloatingUI />

      {/* Welcome Overlay - Disparaît au premier clique */}
      <div className="absolute bottom-6 left-6 z-40 max-w-sm rounded-lg bg-black/50 backdrop-blur-md p-4 text-white border border-white/10">
        <h2 className="text-lg font-semibold mb-2">Welcome to Oalacea 3D</h2>
        <p className="text-sm text-white/70">
          Explore the {currentWorld === 'dev' ? 'Imperium' : 'Underground'} world.
          Click anywhere to start exploring with WASD.
        </p>
      </div>
    </main>
  );
}
