// useInteractionsRegistry - Hook pour utiliser le registry d'interactions
'use client';

import { useMemo, useCallback } from 'react';
import type { WorldType } from '../types';
import { INTERACTIONS_REGISTRY, getInteractionsForWorld, type InteractionConfig } from './registry';
import { useProximity, type ProximityObject } from '@/features/3d-world/hooks';
import { useCharacterStore } from '@/features/3d-world/store';

export function useInteractionsRegistry(world: WorldType) {
  const setCanInteract = useCharacterStore((s) => s.setCanInteract);

  // Récupère les interactions pour le monde courant
  const interactions = useMemo(() => {
    return getInteractionsForWorld(world);
  }, [world]);

  // Map interaction IDs to their config
  const interactionsMap = useMemo(() => {
    const map = new Map<string, InteractionConfig>();
    interactions.forEach((interaction) => {
      if (!interaction.disabled) {
        map.set(interaction.id, interaction);
      }
    });
    return map;
  }, [interactions]);

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

  // Callback quand un objet devient proche (null = sorti de toutes les zones)
  const onProximityChange = useCallback((objectId: string | null) => {
    if (objectId) {
      const interaction = interactionsMap.get(objectId);
      if (interaction) {
        setCanInteract(true, {
          name: interaction.label,
          route: interaction.route ?? '',
          objectId: interaction.id,
          type: interaction.type,
          targetWorld: interaction.targetWorld,
        });
      }
    } else {
      // Sorti de toutes les zones d'interaction
      setCanInteract(false);
    }
  }, [interactionsMap, setCanInteract]);

  // Appelle useProximity pour activer la détection avec le callback
  useProximity(proximityObjects, onProximityChange);

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
