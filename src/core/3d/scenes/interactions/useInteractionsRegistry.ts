// useInteractionsRegistry - Hook pour utiliser le registry d'interactions
'use client';

import { useMemo } from 'react';
import type { WorldType } from '../types';
import { getInteractionsForWorld } from './registry';
import { useProximity, type ProximityObject } from '@/features/3d-world/hooks';

export function useInteractionsRegistry(world: WorldType) {
  // Récupère les interactions pour le monde courant
  const interactions = getInteractionsForWorld(world);

  // IMPORTANT: useMemo to stabilize the array reference and prevent useProximity from recreating intervals
  // (React Compiler exception #1: stable dependencies for useEffect)
  const proximityObjects: ProximityObject[] = useMemo(() =>
    interactions
      .filter(interaction => !interaction.disabled)
      .map(interaction => ({
        id: interaction.id,
        position: interaction.position,
        radius: interaction.radius ?? 3.5,
        data: {
          name: interaction.label,
          route: interaction.route ?? '',
          type: interaction.type,
          targetWorld: interaction.targetWorld,
        },
      })),
    [interactions]
  );

  // Interactions à afficher visuellement (zones qui ne sont pas des portails)
  // useMemo car stable depuis React Compiler
  const visualInteractions = useMemo(() =>
    interactions.filter(
      interaction => !interaction.disabled && interaction.type !== 'portal'
    ),
    [interactions]
  );

  // Toutes les interactions pour l'affichage (inclut les zones de portails pour les labels)
  const allVisualInteractions = useMemo(() =>
    interactions.filter(interaction => !interaction.disabled),
    [interactions]
  );

  // Appelle useProximity pour activer la détection
  useProximity(proximityObjects);

  return {
    interactions,
    proximityObjects,
    visualInteractions,
    allVisualInteractions,
  };
}
