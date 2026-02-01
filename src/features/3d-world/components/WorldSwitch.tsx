// WorldSwitch - Brutal theme
'use client';

import { useWorldStore } from '@/features/3d-world/store';
import type { WorldType } from '@/core/3d/scenes/types';

export function WorldSwitch() {
  const { currentWorld, switchWorld, isTransitioning } = useWorldStore();

  const worlds: Array<{ id: WorldType; label: string; icon: string }> = [
    { id: 'dev', label: 'Dev', icon: '{ }' },
    { id: 'art', label: 'Art', icon: '◆' },
  ];

  return (
    <div className="flex items-center gap-1 rounded-none border-2 border-imperium-steel-dark bg-imperium-black/80 backdrop-blur-md p-1" role="radiogroup" aria-label="Select world">
      {worlds.map((world) => {
        const isActive = currentWorld === world.id;
        return (
          <button
            key={world.id}
            onClick={() => switchWorld(world.id)}
            disabled={isTransitioning}
            aria-pressed={isActive}
            aria-label={`Switch to ${world.label} world`}
            role="radio"
            aria-checked={isActive}
            className={`relative px-4 py-2 rounded-none font-display text-xs uppercase tracking-wider transition-all ${
              isActive
                ? 'bg-imperium-crimson text-imperium-bone shadow-[0_0_10px_rgba(154,17,21,0.4)]'
                : 'text-imperium-steel hover:text-imperium-bone hover:bg-imperium-iron'
            }`}
          >
            <span className="mr-2 font-terminal" aria-hidden="true">{world.icon}</span>
            {world.label}
          </button>
        );
      })}
    </div>
  );
}
