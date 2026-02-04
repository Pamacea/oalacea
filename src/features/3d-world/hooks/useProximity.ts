// useProximity - Hook pour détecter la proximité du personnage avec des objets
'use client';

import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useCharacterStore } from '@/features/3d-world/store';

export interface ProximityObject {
  id: string;
  position: [number, number, number];
  radius: number;
  data: {
    name: string;
    route: string;
    type?: 'portal' | 'route' | 'dialogue' | 'pickup' | 'admin';
    targetWorld?: 'dev' | 'art';
  };
}

interface UseProximityOptions {
  /** Intervalle de check en ms (défaut: 100) */
  checkInterval?: number;
  /** Désactiver le hook */
  disabled?: boolean;
}

export function useProximity(
  objects: ProximityObject[],
  options: UseProximityOptions = {}
) {
  const { checkInterval = 100, disabled = false } = options;
  const checkIntervalRef = useRef<number | undefined>(undefined);
  const lastStateRef = useRef<{ canInteract: boolean; target: any } | null>(null);

  useEffect(() => {
    if (disabled || objects.length === 0) {
      const store = useCharacterStore.getState();
      store.setCanInteract(false);
      lastStateRef.current = { canInteract: false, target: null };
      return;
    }

    const checkProximity = () => {
      // IMPORTANT: Read position directly from store on each check
      // to avoid closure stale values
      const characterPos = useCharacterStore.getState().position;
      const charPosition = new Vector3(...characterPos);

      let closestObject: ProximityObject | null = null;
      let closestDistance = Infinity;

      for (const obj of objects) {
        const objPosition = new Vector3(...obj.position);
        const distance = charPosition.distanceTo(objPosition);

        if (distance < obj.radius && distance < closestDistance) {
          closestObject = obj;
          closestDistance = distance;
        }
      }

      const newState = closestObject ? {
        canInteract: true,
        target: {
          name: closestObject.data.name,
          route: closestObject.data.route,
          objectId: closestObject.id,
          type: closestObject.data.type,
          targetWorld: closestObject.data.targetWorld,
        }
      } : { canInteract: false, target: null };

      // CRITICAL: Only update store if state actually changed to prevent infinite loops
      if (!lastStateRef.current ||
          lastStateRef.current.canInteract !== newState.canInteract ||
          JSON.stringify(lastStateRef.current.target) !== JSON.stringify(newState.target)) {
        const store = useCharacterStore.getState();
        if (newState.target) {
          store.setCanInteract(newState.canInteract, newState.target);
        } else {
          store.setCanInteract(newState.canInteract);
        }
        lastStateRef.current = newState;
      }
    };

    checkProximity();
    checkIntervalRef.current = window.setInterval(checkProximity, checkInterval);

    return () => {
      if (checkIntervalRef.current !== undefined) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [objects, checkInterval, disabled]);

  return { objects };
}
