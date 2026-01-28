// useInteractionsRegistry - Hook pour utiliser le registry d'interactions
'use client';

import { useMemo } from 'react';
import type { WorldType } from '../types';
import { INTERACTIONS_REGISTRY, getInteractionsForWorld, type InteractionConfig } from './registry';
import { useProximity, type ProximityObject } from '@/hooks/useProximity';

export function useInteractionsRegistry(world: WorldType) {
  // Récupère les interactions pour le monde courant
  const interactions = useMemo(() => {
    return getInteractionsForWorld(world);
  }, [world]);

  // Convertit les interactions en ProximityObjects pour useProximity
  const proximityObjects: ProximityObject[] = useMemo(() => {
    return interactions
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
      }));
  }, [interactions]);

  // Appelle useProximity pour activer la détection
  useProximity(proximityObjects);

  // Interactions à afficher visuellement (zones qui ne sont pas des portails)
  const visualInteractions = useMemo(() => {
    return interactions.filter(
      interaction => !interaction.disabled && interaction.type !== 'portal'
    );
  }, [interactions]);

  return {
    interactions,
    proximityObjects,
    visualInteractions,
  };
}
