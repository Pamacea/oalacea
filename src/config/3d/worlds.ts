// src/config/3d/worlds.ts
// Configuration des deux mondes 3D du portfolio Oalacea

import type { WorldConfig, WorldObject, PointLightConfig } from '@/core/3d/scenes/types';

// ============================================================================
// MONDE DEV - IMPERIUM WARHAMMER 40K STYLE
// ============================================================================

const DEV_POINT_LIGHTS: PointLightConfig[] = [
  {
    position: [10, 10, 10],
    color: '#d4af37', // Gold
    intensity: 2,
    decay: 2,
  },
  {
    position: [-10, 5, -10],
    color: '#8b0000', // Dark Red
    intensity: 1.5,
    decay: 2,
  },
  {
    position: [0, 15, 0],
    color: '#ff4500', // Orange Red
    intensity: 0.8,
    decay: 2.5,
  },
];

const DEV_OBJECTS: WorldObject[] = [
  {
    id: 'dev-monolith',
    type: 'glb',
    position: [0, 0, -10],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    model: '/3d/models/dev/monolith.glb',
    interactable: true,
    onClick: '/portfolio/dev',
  },
  {
    id: 'dev-blog-terminal',
    type: 'glb',
    position: [-8, 0, -5],
    rotation: [0, Math.PI / 4, 0],
    scale: [1, 1, 1],
    model: '/3d/models/dev/terminal.glb',
    interactable: true,
    onClick: '/blog',
  },
  {
    id: 'dev-server-rack-left',
    type: 'glb',
    position: [-15, 0, -10],
    rotation: [0, Math.PI / 6, 0],
    scale: [1, 1, 1],
    model: '/3d/models/dev/server-rack.glb',
    interactable: false,
  },
  {
    id: 'dev-server-rack-right',
    type: 'glb',
    position: [15, 0, -10],
    rotation: [0, -Math.PI / 6, 0],
    scale: [1, 1, 1],
    model: '/3d/models/dev/server-rack.glb',
    interactable: false,
  },
  {
    id: 'dev-data-stream',
    type: 'glb',
    position: [0, 5, -15],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    model: '/3d/models/dev/data-stream.glb',
    interactable: false,
  },
];

export const DEV_WORLD: WorldConfig = {
  id: 'dev',
  name: 'Imperium Dev',
  colors: {
    background: '#0a0a0a', // Noir profond
    ambient: '#1a1a1a', // Gris très sombre
    fog: '#050505', // Presque noir
    primary: '#d4af37', // Or antique
    secondary: '#8b0000', // Rouge sombre
  },
  lighting: {
    ambientIntensity: 0.3,
    directionalIntensity: 1,
    pointLights: DEV_POINT_LIGHTS,
  },
  environment: {
    skybox: '/3d/env/dev/imperium.hdr',
    ground: '/3d/env/dev/stone-floor.glb',
    objects: DEV_OBJECTS,
  },
  spawnPoint: [0, 1, 5],
};

// ============================================================================
// MONDE ART - BRUTAL UNDERGROUND + GOTHIC MUSEUM
// ============================================================================

const ART_POINT_LIGHTS: PointLightConfig[] = [
  {
    position: [10, 10, 10],
    color: '#ff6b6b', // Neon Red
    intensity: 2,
    decay: 1.5,
  },
  {
    position: [-10, 5, -10],
    color: '#4ecdc4', // Teal
    intensity: 2,
    decay: 1.5,
  },
  {
    position: [0, 15, 0],
    color: '#feca57', // Yellow
    intensity: 1,
    decay: 2,
  },
  {
    position: [5, 8, 5],
    color: '#ff9ff3', // Pink
    intensity: 1.5,
    decay: 2,
  },
];

const ART_OBJECTS: WorldObject[] = [
  {
    id: 'art-gallery-frame',
    type: 'glb',
    position: [0, 0, -10],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    model: '/3d/models/art/gallery-frame.glb',
    interactable: true,
    onClick: '/portfolio/art',
  },
  {
    id: 'art-graffiti-wall',
    type: 'glb',
    position: [8, 0, -5],
    rotation: [0, Math.PI / 4, 0],
    scale: [1, 1, 1],
    model: '/3d/models/art/graffiti-wall.glb',
    interactable: true,
    onClick: '/about',
  },
  {
    id: 'art-pedestal-left',
    type: 'glb',
    position: [-6, 0, -8],
    rotation: [0, -Math.PI / 6, 0],
    scale: [1, 1, 1],
    model: '/3d/models/art/pedestal.glb',
    interactable: true,
    onClick: '/portfolio/art/sculptures',
  },
  {
    id: 'art-pedestal-right',
    type: 'glb',
    position: [6, 0, -8],
    rotation: [0, Math.PI / 6, 0],
    scale: [1, 1, 1],
    model: '/3d/models/art/pedestal.glb',
    interactable: true,
    onClick: '/portfolio/art/paintings',
  },
  {
    id: 'art-neon-sign',
    type: 'glb',
    position: [0, 6, -8],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    model: '/3d/models/art/neon-sign.glb',
    interactable: false,
  },
  {
    id: 'art-spray-can',
    type: 'glb',
    position: [-10, 0, 0],
    rotation: [0, Math.PI / 3, 0],
    scale: [0.5, 0.5, 0.5],
    model: '/3d/models/art/spray-can.glb',
    interactable: true,
    onClick: '/contact',
  },
];

export const ART_WORLD: WorldConfig = {
  id: 'art',
  name: 'Art Underground',
  colors: {
    background: '#1a1a2e', // Bleu nuit profond
    ambient: '#16213e', // Bleu gris sombre
    fog: '#0f0f23', // Presque noir bleuté
    primary: '#ff6b6b', // Rouge néon
    secondary: '#4ecdc4', // Turquoise
  },
  lighting: {
    ambientIntensity: 0.4,
    directionalIntensity: 0.5,
    pointLights: ART_POINT_LIGHTS,
  },
  environment: {
    skybox: '/3d/env/art/underground.hdr',
    ground: '/3d/env/art/concrete-floor.glb',
    objects: ART_OBJECTS,
  },
  spawnPoint: [0, 1, 5],
};

// ============================================================================
// WORLD MAP
// ============================================================================

export const WORLDS = {
  dev: DEV_WORLD,
  art: ART_WORLD,
} as const;

export type WorldId = keyof typeof WORLDS;

// ============================================================================
// WORLD TRANSITION CONFIG
// ============================================================================

export const WORLD_TRANSITION_DURATION = 2000; // ms
export const WORLD_FADE_DURATION = 500; // ms

// Transition effects per world change
export const WORLD_TRANSITIONS = {
  'dev->art': {
    type: 'warp' as const,
    color: '#4ecdc4',
    duration: WORLD_TRANSITION_DURATION,
  },
  'art->dev': {
    type: 'warp' as const,
    color: '#d4af37',
    duration: WORLD_TRANSITION_DURATION,
  },
} as const;
