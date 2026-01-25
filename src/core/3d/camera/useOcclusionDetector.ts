// Hook to detect when character is occluded by objects
// Makes occluding objects transparent and highlights character
'use client';

import { useRef, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Raycaster, Vector3, Object3D, Mesh, PerspectiveCamera as PerspectiveCameraType } from 'three';

interface OccluderState {
  mesh: Mesh;
  originalOpacity?: number;
  originalTransparent?: boolean;
}

interface UseOcclusionDetectorOptions {
  characterRef: React.MutableRefObject<Object3D | null>;
  cameraRef: React.MutableRefObject<PerspectiveCameraType | null>;
  occludableObjects?: Object3D[];
  enabled?: boolean;
  checkInterval?: number; // Frames between checks (default: 3)
  transparency?: number; // Opacity when occluded (default: 0.3)
}

interface OcclusionState {
  isOccluded: boolean;
  occludingObjects: Mesh[];
}

export function useOcclusionDetector({
  characterRef,
  cameraRef,
  occludableObjects = [],
  enabled = true,
  checkInterval = 3,
  transparency = 0.3,
}: UseOcclusionDetectorOptions) {
  const raycaster = useMemo(() => new Raycaster(), []);
  const frameCount = useRef(0);
  const occluderStates = useRef<Map<string, OccluderState>>(new Map());
  const occlusionState = useRef<OcclusionState>({
    isOccluded: false,
    occludingObjects: [],
  });

  // Restore original material properties
  const restoreOccluders = useCallback(() => {
    occluderStates.current.forEach((state) => {
      const material = state.mesh.material as any;
      if (material) {
        if (state.originalOpacity !== undefined) {
          material.opacity = state.originalOpacity;
        }
        if (state.originalTransparent !== undefined) {
          material.transparent = state.originalTransparent;
        }
        material.needsUpdate = true;
      }
    });
    occluderStates.current.clear();
  }, []);

  // Apply transparency to occluding objects
  const applyOcclusion = useCallback((occludingMeshes: Mesh[]) => {
    // Restore previous occluders first
    const currentOccluders = new Set(occludingMeshes);
    occluderStates.current.forEach((state, key) => {
      if (!currentOccluders.has(state.mesh)) {
        // This object is no longer occluding, restore it
        const material = state.mesh.material as any;
        if (material) {
          if (state.originalOpacity !== undefined) {
            material.opacity = state.originalOpacity;
          }
          if (state.originalTransparent !== undefined) {
            material.transparent = state.originalTransparent;
          }
          material.needsUpdate = true;
        }
        occluderStates.current.delete(key);
      }
    });

    // Apply transparency to new occluders
    occludingMeshes.forEach((mesh) => {
      const key = mesh.uuid;
      if (!occluderStates.current.has(key)) {
        const material = mesh.material as any;
        if (material) {
          // Store original state
          occluderStates.current.set(key, {
            mesh,
            originalOpacity: material.opacity,
            originalTransparent: material.transparent,
          });

          // Apply transparency
          material.transparent = true;
          material.opacity = transparency;
          material.needsUpdate = true;
        }
      }
    });

    occlusionState.current = {
      isOccluded: occludingMeshes.length > 0,
      occludingObjects: occludingMeshes,
    };
  }, [transparency]);

  // Check for occlusion each frame
  useFrame(() => {
    if (!enabled || !characterRef.current || !cameraRef.current) {
      if (occlusionState.current.isOccluded) {
        restoreOccluders();
        occlusionState.current = { isOccluded: false, occludingObjects: [] };
      }
      return;
    }

    frameCount.current++;
    if (frameCount.current % checkInterval !== 0) return;

    const character = characterRef.current;
    const camera = cameraRef.current;

    // Get character position (center of the character)
    const characterPos = new Vector3();
    character.getWorldPosition(characterPos);
    characterPos.y += 1; // Target center of character body

    // Get camera position
    const cameraPos = new Vector3();
    camera.getWorldPosition(cameraPos);

    // Set ray from camera to character
    const direction = new Vector3().subVectors(characterPos, cameraPos).normalize();
    raycaster.set(cameraPos, direction);
    raycaster.far = cameraPos.distanceTo(characterPos);

    // Get all meshes from occludable objects or scene
    let meshes: Mesh[] = [];
    if (occludableObjects.length > 0) {
      occludableObjects.forEach((obj) => {
        obj.traverse((child) => {
          if (child instanceof Mesh && child !== character) {
            meshes.push(child);
          }
        });
      });
    } else {
      // Fallback: get all meshes from scene (except character)
      const scene = camera.parent;
      if (scene) {
        scene.traverse((child) => {
          if (child instanceof Mesh && child !== character) {
            meshes.push(child);
          }
        });
      }
    }

    // Filter out objects that are behind the character or too far
    meshes = meshes.filter((mesh) => {
      const meshPos = new Vector3();
      mesh.getWorldPosition(meshPos);
      const distToCamera = meshPos.distanceTo(cameraPos);
      const distToCharacter = meshPos.distanceTo(characterPos);
      // Only consider objects between camera and character
      return distToCamera < cameraPos.distanceTo(characterPos) && distToCharacter > 0.5;
    });

    // Cast ray
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const occludingMeshes = intersects
        .map((hit) => hit.object as Mesh)
        .filter((mesh): mesh is Mesh => mesh !== null && mesh !== character);
      applyOcclusion(occludingMeshes);
    } else {
      if (occlusionState.current.isOccluded) {
        restoreOccluders();
        occlusionState.current = { isOccluded: false, occludingObjects: [] };
      }
    }
  });

  return {
    isOccluded: () => occlusionState.current.isOccluded,
    getOccludingObjects: () => occlusionState.current.occludingObjects,
  };
}
