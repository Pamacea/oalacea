// Collision Layers - Layer-based collision filtering system
import { CollisionLayer } from './ObstacleConfig';

// Re-export the enum
export { CollisionLayer } from './ObstacleConfig';

// ============================================
// LAYER MATRIX
// ============================================

/**
 * Defines which layers can collide with each other.
 * Each layer has a bitmask of layers it collides with.
 */
export const LAYER_MATRIX: Record<CollisionLayer, number> = {
  // Default obstacles (walls, pillars) collide with everything except triggers
  [CollisionLayer.DEFAULT]:
    CollisionLayer.PLAYER |
    CollisionLayer.NPC |
    CollisionLayer.PROJECTILE,

  // Player collides with default obstacles and NPCs
  [CollisionLayer.PLAYER]:
    CollisionLayer.DEFAULT |
    CollisionLayer.NPC,

  // NPCs collide with default obstacles, player, and other NPCs
  [CollisionLayer.NPC]:
    CollisionLayer.DEFAULT |
    CollisionLayer.PLAYER,

  // Triggers don't cause physical collision but can be detected
  [CollisionLayer.TRIGGER]: 0,

  // Projectiles collide with default obstacles and NPCs
  [CollisionLayer.PROJECTILE]:
    CollisionLayer.DEFAULT |
    CollisionLayer.NPC,
};

// ============================================
// COLLISION FILTERING
// ============================================

/**
 * Check if two layers can collide with each other.
 * Uses bitwise AND for efficient checking.
 */
export function canCollide(layerA: CollisionLayer, layerB: CollisionLayer): boolean {
  // Check if A collides with B OR B collides with A
  const aCollidesB = (LAYER_MATRIX[layerA] & layerB) !== 0;
  const bCollidesA = (LAYER_MATRIX[layerB] & layerA) !== 0;
  return aCollidesB || bCollidesA;
}

/**
 * Get all layers that the given layer can collide with.
 */
export function getCollidableLayers(layer: CollisionLayer): CollisionLayer[] {
  const mask = LAYER_MATRIX[layer];
  const layers: CollisionLayer[] = [];

  for (const [key, value] of Object.entries(CollisionLayer)) {
    if (typeof value === 'number' && (mask & value) !== 0) {
      layers.push(value);
    }
  }

  return layers;
}

/**
 * Add a layer to a layer mask.
 */
export function addLayer(mask: CollisionLayer, layer: CollisionLayer): CollisionLayer {
  return mask | layer;
}

/**
 * Remove a layer from a layer mask.
 */
export function removeLayer(mask: CollisionLayer, layer: CollisionLayer): CollisionLayer {
  return mask & ~layer;
}

/**
 * Check if a layer is in a layer mask.
 */
export function hasLayer(mask: CollisionLayer, layer: CollisionLayer): boolean {
  return (mask & layer) !== 0;
}

/**
 * Create a layer mask from multiple layers.
 */
export function createLayerMask(...layers: CollisionLayer[]): CollisionLayer {
  return layers.reduce((mask, layer) => mask | layer, 0 as CollisionLayer);
}

// ============================================
// LAYER NAMES
// ============================================

export const LAYER_NAMES: Record<CollisionLayer, string> = {
  [CollisionLayer.DEFAULT]: 'Default',
  [CollisionLayer.PLAYER]: 'Player',
  [CollisionLayer.NPC]: 'NPC',
  [CollisionLayer.TRIGGER]: 'Trigger',
  [CollisionLayer.PROJECTILE]: 'Projectile',
};

export function getLayerName(layer: CollisionLayer): string {
  return LAYER_NAMES[layer] ?? `Layer_${layer}`;
}
