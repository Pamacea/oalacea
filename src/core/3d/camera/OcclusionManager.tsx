// OcclusionManager - Makes objects transparent when blocking view of character
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Raycaster, Vector3, Object3D, Mesh, PerspectiveCamera as PerspectiveCameraType } from 'three';

interface OcclusionManagerProps {
  characterRef: React.MutableRefObject<Object3D | null>;
  cameraRef: React.MutableRefObject<PerspectiveCameraType | null>;
  onOcclusionChange?: (isOccluded: boolean) => void;
  checkInterval?: number;
  transparency?: number;
}

interface OccluderState {
  mesh: Mesh;
  originalOpacity?: number;
  originalTransparent?: boolean;
}

export function OcclusionManager({
  characterRef,
  cameraRef,
  onOcclusionChange,
  checkInterval = 3,
  transparency = 0.3,
}: OcclusionManagerProps) {
  const raycaster = useMemo(() => new Raycaster(), []);
  const frameCount = useRef(0);
  const occluderStates = useRef<Map<string, OccluderState>>(new Map());
  const isOccluded = useRef(false);

  useFrame(() => {
    if (!characterRef.current || !cameraRef.current) {
      if (isOccluded.current && onOcclusionChange) {
        onOcclusionChange(false);
        isOccluded.current = false;
      }
      restoreAllOccluders();
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

    // Get all meshes from scene (except character and UI elements)
    const scene = camera.parent;
    if (!scene) return;

    const meshes: Mesh[] = [];
    scene.traverse((child) => {
      if (child instanceof Mesh && child !== character && child.parent?.type !== 'Scene') {
        // Skip if it's part of character or UI overlay
        let isCharacterPart = false;
        child.traverseAncestors((ancestor) => {
          if (ancestor === character) isCharacterPart = true;
        });
        if (!isCharacterPart) {
          meshes.push(child);
        }
      }
    });

    // Filter out objects that are behind the character or too far
    const filteredMeshes = meshes.filter((mesh) => {
      const meshPos = new Vector3();
      mesh.getWorldPosition(meshPos);
      const distToCamera = meshPos.distanceTo(cameraPos);
      const distToCharacter = meshPos.distanceTo(characterPos);
      // Only consider objects between camera and character
      return distToCamera < cameraPos.distanceTo(characterPos) && distToCharacter > 0.5;
    });

    // Cast ray
    const intersects = raycaster.intersectObjects(filteredMeshes, false);

    if (intersects.length > 0) {
      const occludingMeshes = intersects
        .map((hit) => hit.object as Mesh)
        .filter((mesh): mesh is Mesh => mesh !== null && mesh !== character);

      applyOcclusion(occludingMeshes);

      if (!isOccluded.current && onOcclusionChange) {
        onOcclusionChange(true);
      }
      isOccluded.current = true;
    } else {
      if (isOccluded.current && onOcclusionChange) {
        onOcclusionChange(false);
      }
      isOccluded.current = false;
      restoreAllOccluders();
    }
  });

  const applyOcclusion = (occludingMeshes: Mesh[]) => {
    const currentOccluders = new Set(occludingMeshes);

    // Restore previous occluders that are no longer blocking
    occluderStates.current.forEach((state, key) => {
      if (!currentOccluders.has(state.mesh)) {
        restoreOccluder(state);
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
  };

  const restoreAllOccluders = () => {
    occluderStates.current.forEach((state) => {
      restoreOccluder(state);
    });
    occluderStates.current.clear();
  };

  const restoreOccluder = (state: OccluderState) => {
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
  };

  return null; // This component doesn't render anything
}
