// useProximity - Hook pour détecter la proximité du personnage avec des objets
'use client';

import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useCharacterStore } from '@/store/3d-character-store';

export interface ProximityObject {
  id: string;
  position: [number, number, number];
  radius: number;
  data: {
    name: string;
    route: string;
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
  const { setCanInteract, position: characterPos } = useCharacterStore();

  useEffect(() => {
    if (disabled || objects.length === 0) {
      setCanInteract(false);
      return;
    }

    const checkProximity = () => {
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

      if (closestObject) {
        setCanInteract(
          true,
          {
            name: closestObject.data.name,
            route: closestObject.data.route,
            objectId: closestObject.id,
            targetWorld: closestObject.data.targetWorld,
          }
        );
      } else {
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
  }, [objects, characterPos, checkInterval, disabled, setCanInteract]);

  return { objects };
}
