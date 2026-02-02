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
  const setCanInteract = useCharacterStore((s) => s.setCanInteract);

  useEffect(() => {
    if (disabled || objects.length === 0) {
      setCanInteract(false);
      return;
    }

    const checkProximity = () => {
      // IMPORTANT: Read position directly from store on each check
      // to avoid closure stale values
      const characterPos = useCharacterStore.getState().position;
      const charPosition = new Vector3(...characterPos);

      let closestObject: ProximityObject | null = null;
      let closestDistance = Infinity;

      console.log('[useProximity] Char pos:', characterPos, 'checking', objects.length, 'objects');

      for (const obj of objects) {
        const objPosition = new Vector3(...obj.position);
        const distance = charPosition.distanceTo(objPosition);

        console.log(`[useProximity] Distance to ${obj.data.name}:`, distance.toFixed(2), '(radius:', obj.radius, ')');

        if (distance < obj.radius && distance < closestDistance) {
          closestObject = obj;
          closestDistance = distance;
        }
      }

      if (closestObject) {
        console.log('[useProximity] ✓ INTERACT:', closestObject.data.name, 'dist:', closestDistance.toFixed(2));
        setCanInteract(
          true,
          {
            name: closestObject.data.name,
            route: closestObject.data.route,
            objectId: closestObject.id,
            type: closestObject.data.type,
            targetWorld: closestObject.data.targetWorld,
          }
        );
      } else {
        console.log('[useProximity] ✗ No interaction in range');
        setCanInteract(false);
      }
    };

    checkProximity();
    checkIntervalRef.current = window.setInterval(checkProximity, checkInterval);

    return () => {
      if (checkIntervalRef.current !== undefined) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [objects, checkInterval, disabled, setCanInteract]);

  return { objects };
}
