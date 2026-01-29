// Obstacle Configuration - Unified collision system with explicit hitbox types
import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export enum ObstacleType {
  // Structural elements
  PILLAR = 'pillar',
  WALL = 'wall',
  ARCH = 'arch',
  FRAME = 'frame',

  // Interactive objects
  TERMINAL = 'terminal',
  PEDESTAL = 'pedestal',
  DOOR = 'door',

  // Decorative objects
  SPRAY = 'spray',
  NEON = 'neon',
  MONUMENT = 'monument',

  // Characters
  NPC = 'npc',
}

export enum HitboxShape {
  CIRCLE = 'circle',
  BOX = 'box',
  CAPSULE = 'capsule',
}

export enum CollisionLayer {
  DEFAULT = 1 << 0,
  PLAYER = 1 << 1,
  NPC = 1 << 2,
  TRIGGER = 1 << 3,
  PROJECTILE = 1 << 4,
}

// ============================================
// TYPES
// ============================================

export interface CircleHitboxConfig {
  shape: HitboxShape.CIRCLE;
  radius: number;
}

export interface BoxHitboxConfig {
  shape: HitboxShape.BOX;
  size: [number, number, number]; // [width, height, depth]
  rotation?: number; // Y-axis rotation in radians
}

export interface CapsuleHitboxConfig {
  shape: HitboxShape.CAPSULE;
  radius: number;
  height: number;
  rotation?: number;
}

export type HitboxConfig = CircleHitboxConfig | BoxHitboxConfig | CapsuleHitboxConfig;

export interface ObstacleConfig {
  id: string;
  type: ObstacleType;
  position: [number, number, number];
  hitbox: HitboxConfig;
  collisionLayer?: CollisionLayer;
  interactionDistance?: number;
  name?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const ObstacleTypeSchema = z.nativeEnum(ObstacleType);
export const HitboxShapeSchema = z.nativeEnum(HitboxShape);
export const CollisionLayerSchema = z.nativeEnum(CollisionLayer);

export const CircleHitboxSchema = z.object({
  shape: z.literal(HitboxShape.CIRCLE),
  radius: z.number().positive(),
});

export const BoxHitboxSchema = z.object({
  shape: z.literal(HitboxShape.BOX),
  size: z.tuple([
    z.number().positive(),
    z.number().positive(),
    z.number().positive(),
  ]),
  rotation: z.number().optional(),
});

export const CapsuleHitboxSchema = z.object({
  shape: z.literal(HitboxShape.CAPSULE),
  radius: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().optional(),
});

export const HitboxConfigSchema = z.discriminatedUnion('shape', [
  CircleHitboxSchema,
  BoxHitboxSchema,
  CapsuleHitboxSchema,
]);

export const ObstacleConfigSchema = z.object({
  id: z.string().min(1),
  type: ObstacleTypeSchema,
  position: z.tuple([z.number(), z.number(), z.number()]),
  hitbox: HitboxConfigSchema,
  collisionLayer: CollisionLayerSchema.optional(),
  interactionDistance: z.number().positive().optional(),
  name: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// ============================================
// CONSTRUCTORS
// ============================================

export function createCircleHitbox(radius: number): CircleHitboxConfig {
  return { shape: HitboxShape.CIRCLE, radius };
}

export function createBoxHitbox(
  size: [number, number, number],
  rotation?: number
): BoxHitboxConfig {
  return { shape: HitboxShape.BOX, size, rotation };
}

export function createCapsuleHitbox(
  radius: number,
  height: number,
  rotation?: number
): CapsuleHitboxConfig {
  return { shape: HitboxShape.CAPSULE, radius, height, rotation };
}

export function createObstacle(
  id: string,
  type: ObstacleType,
  position: [number, number, number],
  hitbox: HitboxConfig,
  options?: Partial<Pick<ObstacleConfig, 'name' | 'collisionLayer' | 'interactionDistance' | 'metadata'>>
): ObstacleConfig {
  return {
    id,
    type,
    position,
    hitbox,
    ...options,
  };
}

// ============================================
// VALIDATION
// ============================================

export function validateObstacleConfig(config: unknown): ObstacleConfig {
  return ObstacleConfigSchema.parse(config);
}

export function validateObstacleConfigs(configs: unknown[]): ObstacleConfig[] {
  return z.array(ObstacleConfigSchema).parse(configs);
}

// ============================================
// TYPE GUARDS
// ============================================

export function isCircleHitbox(config: HitboxConfig): config is CircleHitboxConfig {
  return config.shape === HitboxShape.CIRCLE;
}

export function isBoxHitbox(config: HitboxConfig): config is BoxHitboxConfig {
  return config.shape === HitboxShape.BOX;
}

export function isCapsuleHitbox(config: HitboxConfig): config is CapsuleHitboxConfig {
  return config.shape === HitboxShape.CAPSULE;
}
