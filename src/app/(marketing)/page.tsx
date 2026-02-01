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

      {/* Floating UI - 3D scene specific controls */}
      <FloatingUI />

      {/* Welcome Overlay - Disparaît au premier clic */}
      <div className="absolute bottom-6 left-6 z-40 max-w-sm rounded-none border-2 border-imperium-steel-dark bg-imperium-black/95 backdrop-blur-md p-4 shadow-[8px_8px_0_rgba(28,28,28,0.6)]">
        <h2 className="font-display text-lg uppercase tracking-wider text-imperium-crimson mb-2">
          {'>'} Welcome to Oalacea 3D
        </h2>
        <p className="font-terminal text-sm text-imperium-steel">
          Explore the {currentWorld === 'dev' ? 'Imperium' : 'Underground'} world.
          Click anywhere to start exploring with WASD.
        </p>
      </div>
    </main>
  );
}
