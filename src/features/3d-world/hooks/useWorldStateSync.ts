// Hook for syncing 3D world state with URL parameters
// Enables shareable URLs: ?world=art&x=10&z=-5&showProject=abc123
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { WorldType } from '@/core/3d/scenes/types';
import { useWorldStore } from '@/features/3d-world/store';

export interface WorldStateURL {
  world?: WorldType;
  camX?: number;
  camZ?: number;
  showProject?: string;
  showBlog?: string;
}

const WORLD_STATE_KEY = 'ws';

/**
 * Encode world state to base64 for URL
 */
export function encodeWorldState(state: WorldStateURL): string {
  try {
    const json = JSON.stringify(state);
    return btoa(json);
  } catch {
    return '';
  }
}

/**
 * Decode world state from base64 URL
 */
export function decodeWorldState(encoded: string): WorldStateURL | null {
  try {
    const json = atob(encoded);
    return JSON.parse(json) as WorldStateURL;
  } catch {
    return null;
  }
}

/**
 * Sync world state with URL parameters
 * - Reads URL on mount to restore state
 * - Updates URL when state changes
 */
export function useWorldStateSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setCurrentWorld = useWorldStore((s) => s.setCurrentWorld);

  // Read URL state on mount
  useEffect(() => {
    const stateParam = searchParams.get(WORLD_STATE_KEY);
    if (!stateParam) return;

    const state = decodeWorldState(stateParam);
    if (!state) return;

    // Apply state
    if (state.world && state.world !== 'dev' && state.world !== 'art') {
      setCurrentWorld(state.world);
    }

    // Store additional state for components to use
    if (state.showProject) {
      sessionStorage.setItem('showProject', state.showProject);
    }
    if (state.showBlog) {
      sessionStorage.setItem('showBlog', state.showBlog);
    }
    if (state.camX !== undefined) {
      sessionStorage.setItem('camX', state.camX.toString());
    }
    if (state.camZ !== undefined) {
      sessionStorage.setItem('camZ', state.camZ.toString());
    }
  }, [searchParams, setCurrentWorld]);

  /**
   * Update URL with current world state
   */
  const updateURL = (state: WorldStateURL) => {
    const encoded = encodeWorldState(state);
    const url = new URL(window.location.href);
    url.searchParams.set(WORLD_STATE_KEY, encoded);
    router.replace(url.toString(), { scroll: false });
  };

  /**
   * Share current view
   */
  const shareView = async (state: WorldStateURL) => {
    const encoded = encodeWorldState(state);
    const url = `${window.location.origin}${window.location.pathname}?${WORLD_STATE_KEY}=${encoded}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Oalacea 3D Portfolio',
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
    }

    return url;
  };

  /**
   * Get stored state (for components to use)
   */
  const getStoredState = () => {
    return {
      showProject: sessionStorage.getItem('showProject') || undefined,
      showBlog: sessionStorage.getItem('showBlog') || undefined,
      camX: parseFloat(sessionStorage.getItem('camX') || '0'),
      camZ: parseFloat(sessionStorage.getItem('camZ') || '0'),
    };
  };

  return {
    updateURL,
    shareView,
    getStoredState,
  };
}

/**
 * Get current world state as URL-friendly object
 */
export function getCurrentWorldState(
  world: WorldType,
  cameraX: number,
  cameraZ: number,
  showProject?: string,
  showBlog?: string
): WorldStateURL {
  const state: WorldStateURL = {
    world,
    camX: Math.round(cameraX),
    camZ: Math.round(cameraZ),
  };

  if (showProject) state.showProject = showProject;
  if (showBlog) state.showBlog = showBlog;

  return state;
}
