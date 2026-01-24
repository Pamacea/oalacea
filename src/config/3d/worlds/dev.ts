// Dev world configuration
import type { WorldConfig, WorldObject, PointLightConfig } from '@/core/3d/scenes/types';

const DEV_POINT_LIGHTS: PointLightConfig[] = [
  { position: [10, 10, 10], color: '#d4af37', intensity: 2, decay: 2 },
  { position: [-10, 5, -10], color: '#8b0000', intensity: 1.5, decay: 2 },
  { position: [0, 15, 0], color: '#ff4500', intensity: 0.8, decay: 2.5 },
];

const DEV_OBJECTS: WorldObject[] = [
  {
    id: 'dev-monolith', type: 'glb', position: [0, 0, -10],
    rotation: [0, 0, 0], scale: [1, 1, 1], model: '/3d/models/dev/monolith.glb',
    interactable: true, onClick: '/portfolio/dev',
  },
  {
    id: 'dev-blog-terminal', type: 'glb', position: [-8, 0, -5],
    rotation: [0, Math.PI / 4, 0], scale: [1, 1, 1], model: '/3d/models/dev/terminal.glb',
    interactable: true, onClick: '/blog',
  },
  {
    id: 'dev-server-rack-left', type: 'glb', position: [-15, 0, -10],
    rotation: [0, Math.PI / 6, 0], scale: [1, 1, 1], model: '/3d/models/dev/server-rack.glb',
  },
  {
    id: 'dev-server-rack-right', type: 'glb', position: [15, 0, -10],
    rotation: [0, -Math.PI / 6, 0], scale: [1, 1, 1], model: '/3d/models/dev/server-rack.glb',
  },
  {
    id: 'dev-data-stream', type: 'glb', position: [0, 5, -15],
    rotation: [0, 0, 0], scale: [1, 1, 1], model: '/3d/models/dev/data-stream.glb',
  },
];

export const DEV_WORLD: WorldConfig = {
  id: 'dev',
  name: 'Imperium Dev',
  colors: {
    background: '#0a0a0a',
    ambient: '#1a1a1a',
    fog: '#050505',
    primary: '#d4af37',
    secondary: '#8b0000',
  },
  lighting: { ambientIntensity: 0.3, directionalIntensity: 1, pointLights: DEV_POINT_LIGHTS },
  environment: {
    skybox: '/3d/env/dev/imperium.hdr',
    ground: '/3d/env/dev/stone-floor.glb',
    objects: DEV_OBJECTS,
  },
  spawnPoint: [0, 1, 5],
};
