// WorldSwitch - Bouton pour changer entre les deux mondes
'use client';

import { motion } from 'framer-motion';
import { useWorldStore } from '@/store/3d-world-store';
import type { WorldType } from '@/core/3d/scenes/types';
import { Button } from '@/components/ui/button';

const WORLDS: Array<{
  id: WorldType;
  label: string;
  icon: string;
  color: string;
}> = [
  { id: 'dev', label: 'Imperium', icon: '⚔️', color: 'text-yellow-500' },
  { id: 'art', label: 'Underground', icon: '🎨', color: 'text-pink-500' },
];

export function WorldSwitch() {
  const { currentWorld, switchWorld, isTransitioning } = useWorldStore();

  return (
    <div className="flex items-center gap-2 rounded-full bg-black/50 backdrop-blur-md p-1 border border-white/10">
      {WORLDS.map((world) => (
        <Button
          key={world.id}
          variant={currentWorld === world.id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchWorld(world.id)}
          disabled={isTransitioning}
          className={`relative ${
            currentWorld === world.id
              ? world.id === 'dev'
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-pink-600 text-white hover:bg-pink-700'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <span className="mr-2">{world.icon}</span>
          {world.label}
          {isTransitioning && currentWorld === world.id && (
            <motion.span
              className="absolute inset-0 rounded-full bg-white/20"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            />
          )}
        </Button>
      ))}
    </div>
  );
}
