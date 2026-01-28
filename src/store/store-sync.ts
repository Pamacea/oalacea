import { useEffect } from 'react';
import type { StoreApi } from 'zustand';
import { useWorldStore } from './3d-world-store';

/**
 * Hook for components that need to sync their local store with the world store.
 * Call this in any component that manages a store with a currentWorld property.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useWorldSyncEffect(
 *     (world) => useAudioStore.getState().setCurrentWorld(world)
 *   );
 *   return <div></div>;
 * }
 * ```
 */
export function useWorldSyncEffect(
  onWorldChange: (world: 'dev' | 'art') => void
) {
  const currentWorld = useWorldStore((state) => state.currentWorld);

  useEffect(() => {
    onWorldChange(currentWorld);
  }, [currentWorld, onWorldChange]);
}
