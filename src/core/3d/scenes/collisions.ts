// Collision zones pour les deux mondes
// Now with explicit hitbox configuration
//
// IMPORTANT: Les portails sont positionnés à [0, 0, 0] dans les deux mondes (AU CENTRE).
// TOUJOURS laisser un rayon de sécurité d'au moins 10 unités autour du centre [0, 0].
// Ne pas placer de zones de collision dans un rayon de 10m autour du centre.

import { Vector3 } from 'three';
import {
  ObstacleConfig,
  ObstacleType,
  HitboxShape,
  createObstacle,
  createCircleHitbox,
  createBoxHitbox,
} from '@/core/3d/physics/config/ObstacleConfig';
import { CollisionLayer } from '@/core/3d/physics/config/CollisionLayers';

// Re-export for convenience
export type { ObstacleConfig, ObstacleType, HitboxShape } from '@/core/3d/physics/config/ObstacleConfig';
export { CollisionLayer } from '@/core/3d/physics/config/CollisionLayers';

// =========================================
// DEV WORLD - COLLISION ZONES
// =========================================

export const DEV_COLLISION_ZONES: ObstacleConfig[] = [
  // Piliers (16 piliers en cercle)
  ...Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const radius = 25;
    const position: [number, number, number] = [
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    ];
    return createObstacle(`pillar-${i}`, ObstacleType.PILLAR, position, createCircleHitbox(2.0), {
      name: `Pilier ${i}`,
      collisionLayer: CollisionLayer.DEFAULT,
    });
  }),

  // Arcs gothiques - 2 piliers séparés
  // Hitbox réduite à 1.3 pour permettre un passage plus large entre les piliers
  // Arc Nord (z=18)
  createObstacle(
    'arch-north-left',
    ObstacleType.ARCH,
    [-3, 0, 18],
    createBoxHitbox([1.3, 3, 1.3]),
    { name: 'Pilier Arc Nord Gauche', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'arch-north-right',
    ObstacleType.ARCH,
    [3, 0, 18],
    createBoxHitbox([1.3, 3, 1.3]),
    { name: 'Pilier Arc Nord Droite', collisionLayer: CollisionLayer.DEFAULT }
  ),
  // Arc Sud (z=-18)
  createObstacle(
    'arch-south-left',
    ObstacleType.ARCH,
    [-3, 0, -18],
    createBoxHitbox([1.3, 3, 1.3]),
    { name: 'Pilier Arc Sud Gauche', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'arch-south-right',
    ObstacleType.ARCH,
    [3, 0, -18],
    createBoxHitbox([1.3, 3, 1.3]),
    { name: 'Pilier Arc Sud Droite', collisionLayer: CollisionLayer.DEFAULT }
  ),
  // Arc Est (x=18)
  createObstacle(
    'arch-east-left',
    ObstacleType.ARCH,
    [18, 0, -3],
    createBoxHitbox([1.3, 3, 1.3]),
    { name: 'Pilier Arc Est Gauche', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'arch-east-right',
    ObstacleType.ARCH,
    [18, 0, 3],
    createBoxHitbox([1.3, 3, 1.3]),
    { name: 'Pilier Arc Est Droite', collisionLayer: CollisionLayer.DEFAULT }
  ),
  // Arc Ouest (x=-18)
  createObstacle(
    'arch-west-left',
    ObstacleType.ARCH,
    [-18, 0, -3],
    createBoxHitbox([1.3, 3, 1.3]),
    { name: 'Pilier Arc Ouest Gauche', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'arch-west-right',
    ObstacleType.ARCH,
    [-18, 0, 3],
    createBoxHitbox([1.3, 3, 1.3]),
    { name: 'Pilier Arc Ouest Droite', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // Terminaux (box 2x1)
  createObstacle(
    'terminal-1',
    ObstacleType.TERMINAL,
    [-12, 0, -8],
    createBoxHitbox([2.5, 1.5, 1.5]),
    { name: 'Terminal 1', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'terminal-2',
    ObstacleType.TERMINAL,
    [12, 0, -8],
    createBoxHitbox([2.5, 1.5, 1.5]),
    { name: 'Terminal 2', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'terminal-3',
    ObstacleType.TERMINAL,
    [-8, 0, 8],
    createBoxHitbox([2.5, 1.5, 1.5]),
    { name: 'Terminal 3', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'terminal-4',
    ObstacleType.TERMINAL,
    [8, 0, 8],
    createBoxHitbox([2.5, 1.5, 1.5]),
    { name: 'Terminal 4', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // Project Pedestals
  createObstacle(
    'pedestal-oalacea',
    ObstacleType.PEDESTAL,
    [15, 0, 10],
    createBoxHitbox([5.0, 1.2, 5.0]),
    { name: 'Pedestal Oalacea', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'pedestal-ecommerce',
    ObstacleType.PEDESTAL,
    [-15, 0, 15],
    createBoxHitbox([5.0, 1.2, 5.0]),
    { name: 'Pedestal E-commerce', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // Admin Terminal
  createObstacle(
    'admin-terminal',
    ObstacleType.TERMINAL,
    [8, 0, 8],
    createBoxHitbox([2.5, 1.5, 1.5]),
    { name: 'Admin Terminal', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // Blog Terminal
  createObstacle(
    'blog-terminal',
    ObstacleType.TERMINAL,
    [-20, 0, 0],
    createBoxHitbox([3.5, 2, 3.5]),
    { name: 'Blog Terminal', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // NPC Tech Priest - Trigger zone, not solid collision
  createObstacle(
    'npc-tech-priest',
    ObstacleType.NPC,
    [-5, 0, 8],
    createCircleHitbox(0.8),
    { name: 'Tech Priest Guide', collisionLayer: CollisionLayer.NPC }
  ),
];

// =========================================
// ART WORLD - COLLISION ZONES
// =========================================

export const ART_COLLISION_ZONES: ObstacleConfig[] = [
  // Murs de béton
  createObstacle(
    'wall-1',
    ObstacleType.WALL,
    [-20, 0, -15],
    createBoxHitbox([8.5, 3, 1.5]),
    { name: 'Mur Béton 1', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'wall-2',
    ObstacleType.WALL,
    [20, 0, -15],
    createBoxHitbox([8.5, 3, 1.5]),
    { name: 'Mur Béton 2', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'wall-3',
    ObstacleType.WALL,
    [-25, 0, 5],
    createBoxHitbox([1.5, 3, 6.5]),
    { name: 'Mur Béton 3', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'wall-4',
    ObstacleType.WALL,
    [25, 0, 5],
    createBoxHitbox([1.5, 3, 6.5]),
    { name: 'Mur Béton 4', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'wall-5',
    ObstacleType.WALL,
    [0, 0, -30],
    createBoxHitbox([8.5, 3, 1.5]),
    { name: 'Mur du fond', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // Pedestals
  createObstacle(
    'pedestal-1',
    ObstacleType.PEDESTAL,
    [-10, 0, -8],
    createBoxHitbox([4.0, 1.2, 4.0]),
    { name: 'Pedestal 1', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'pedestal-2',
    ObstacleType.PEDESTAL,
    [10, 0, -8],
    createBoxHitbox([4.0, 1.2, 4.0]),
    { name: 'Pedestal 2', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'pedestal-3',
    ObstacleType.PEDESTAL,
    [-8, 0, 12],
    createBoxHitbox([4.0, 1.2, 4.0]),
    { name: 'Pedestal 3', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'pedestal-4',
    ObstacleType.PEDESTAL,
    [8, 0, 12],
    createBoxHitbox([4.0, 1.2, 4.0]),
    { name: 'Pedestal 4', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // Gallery frames
  createObstacle(
    'frame-1',
    ObstacleType.FRAME,
    [0, 0, -20],
    createBoxHitbox([5.5, 4.5, 0.8]),
    { name: 'Cadre 1', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'frame-2',
    ObstacleType.FRAME,
    [-15, 0, 0],
    createBoxHitbox([5.5, 4.5, 0.8]),
    { name: 'Cadre 2', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'frame-3',
    ObstacleType.FRAME,
    [15, 0, 0],
    createBoxHitbox([5.5, 4.5, 0.8]),
    { name: 'Cadre 3', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // SprayCans
  createObstacle(
    'spray-1',
    ObstacleType.SPRAY,
    [-18, 0, 15],
    createCircleHitbox(0.4),
    { name: 'Spray Can 1', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'spray-2',
    ObstacleType.SPRAY,
    [-20, 0, 18],
    createCircleHitbox(0.4),
    { name: 'Spray Can 2', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'spray-3',
    ObstacleType.SPRAY,
    [18, 0, 15],
    createCircleHitbox(0.4),
    { name: 'Spray Can 3', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'spray-4',
    ObstacleType.SPRAY,
    [22, 0, -10],
    createCircleHitbox(0.4),
    { name: 'Spray Can 4', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // NeonSigns - High up, minimal collision
  createObstacle(
    'neon-1',
    ObstacleType.NEON,
    [0, 8, -25],
    createBoxHitbox([4.5, 1, 0.5]),
    { name: 'Neon ART', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'neon-2',
    ObstacleType.NEON,
    [-15, 6, 10],
    createBoxHitbox([4.5, 1, 0.5]),
    { name: 'Neon CREATE', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'neon-3',
    ObstacleType.NEON,
    [15, 6, 10],
    createBoxHitbox([4.5, 1, 0.5]),
    { name: 'Neon EXPRESS', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'neon-4',
    ObstacleType.NEON,
    [0, 10, 20],
    createBoxHitbox([5.5, 1.2, 0.5]),
    { name: 'Neon UNDERGROUND', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // Art Project Displays
  createObstacle(
    'art-display-mobile',
    ObstacleType.PEDESTAL,
    [12, 0, -18],
    createBoxHitbox([5.5, 1.5, 5.5]),
    { name: 'Mobile App Display', collisionLayer: CollisionLayer.DEFAULT }
  ),
  createObstacle(
    'art-display-ai',
    ObstacleType.PEDESTAL,
    [-18, 0, 12],
    createBoxHitbox([5.5, 1.5, 5.5]),
    { name: 'AI Chatbot Display', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // Admin Terminal
  createObstacle(
    'admin-terminal',
    ObstacleType.TERMINAL,
    [-8, 0, 8],
    createBoxHitbox([3.5, 2, 3.5]),
    { name: 'Admin Terminal', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // Blog Terminal
  createObstacle(
    'blog-terminal',
    ObstacleType.TERMINAL,
    [20, 0, 0],
    createBoxHitbox([3.5, 2, 3.5]),
    { name: 'Blog Terminal', collisionLayer: CollisionLayer.DEFAULT }
  ),

  // NPCs
  createObstacle(
    'npc-curator',
    ObstacleType.NPC,
    [5, 0, 8],
    createCircleHitbox(1.0),
    { name: 'Art Curator', collisionLayer: CollisionLayer.NPC }
  ),
];

// =========================================
// LEGACY COMPATIBILITY
// =========================================

// Legacy interface for backward compatibility
export interface CollisionZone {
  id: string;
  position: [number, number, number];
  radius: number;
  name: string;
}

/**
 * Convert new ObstacleConfig to legacy CollisionZone format.
 * Use this for gradual migration.
 */
export function toLegacyZone(config: ObstacleConfig): CollisionZone {
  let radius: number;

  switch (config.hitbox.shape) {
    case HitboxShape.CIRCLE:
      radius = config.hitbox.radius;
      break;
    case HitboxShape.BOX:
      radius = Math.max(config.hitbox.size[0], config.hitbox.size[2]) / 2;
      break;
    case HitboxShape.CAPSULE:
      radius = config.hitbox.radius;
      break;
  }

  return {
    id: config.id,
    position: config.position,
    radius,
    name: config.name || config.id,
  };
}

/**
 * Get collision zones in legacy format.
 * Maintains backward compatibility.
 */
export function getDevCollisionZones(): CollisionZone[] {
  return DEV_COLLISION_ZONES.map(toLegacyZone);
}

/**
 * Get collision zones in legacy format.
 * Maintains backward compatibility.
 */
export function getArtCollisionZones(): CollisionZone[] {
  return ART_COLLISION_ZONES.map(toLegacyZone);
}

// =========================================
// COLLISION DETECTION (LEGACY)
// =========================================

/**
 * Vérifie si une position est en collision avec une zone
 * @param position Position à tester
 * @param zones Zones de collision
 * @param characterRadius Rayon du personnage
 * @returns true si collision, false sinon
 */
export function checkCollision(
  position: Vector3,
  zones: CollisionZone[],
  characterRadius: number = 0.5
): boolean {
  for (const zone of zones) {
    const dx = position.x - zone.position[0];
    const dz = position.z - zone.position[2];
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < zone.radius + characterRadius) {
      return true;
    }
  }
  return false;
}

/**
 * Calcule la position la plus proche possible sans collision
 * @param from Position de départ
 * @param to Position cible
 * @param zones Zones de collision
 * @param characterRadius Rayon du personnage
 * @returns Position corrigée sans collision
 */
export function getSafePosition(
  from: Vector3,
  to: Vector3,
  zones: CollisionZone[],
  characterRadius: number = 0.5
): Vector3 {
  const direction = new Vector3().subVectors(to, from).normalize();
  const distance = from.distanceTo(to);
  const stepSize = 0.5;
  const steps = Math.ceil(distance / stepSize);

  let currentPos = from.clone();

  for (let i = 0; i < steps; i++) {
    const nextPos = currentPos.clone().add(direction.clone().multiplyScalar(stepSize));

    if (!checkCollision(nextPos, zones, characterRadius)) {
      currentPos = nextPos;
    } else {
      return currentPos;
    }
  }

  if (!checkCollision(to, zones, characterRadius)) {
    return to;
  }

  return currentPos;
}
