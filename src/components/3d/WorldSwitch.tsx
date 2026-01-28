// WorldSwitch - Simplified gray theme
'use client';

import { useWorldStore } from '@/store/3d-world-store';
import type { WorldType } from '@/core/3d/scenes/types';

export function WorldSwitch() {
  const { currentWorld, switchWorld, isTransitioning } = useWorldStore();

  const worlds: Array<{ id: WorldType; label: string; icon: string }> = [
    { id: 'dev', label: 'Dev', icon: '⚔️' },
    { id: 'art', label: 'Art', icon: '🎨' },
  ];

  return (
    <div className="flex items-center gap-2 rounded-full bg-zinc-900/80 backdrop-blur-md p-1 border border-zinc-800">
      {worlds.map((world) => {
        const isActive = currentWorld === world.id;
        return (
          <button
            key={world.id}
            onClick={() => switchWorld(world.id)}
            disabled={isTransitioning}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            <span className="mr-2">{world.icon}</span>
            {world.label}
          </button>
        );
      })}
    </div>
  );
}
