// Art world configuration
import type { WorldConfig, WorldObject, PointLightConfig } from '@/core/3d/scenes/types';

const ART_POINT_LIGHTS: PointLightConfig[] = [
  { position: [10, 10, 10], color: '#ff6b6b', intensity: 2, decay: 1.5 },
  { position: [-10, 5, -10], color: '#4ecdc4', intensity: 2, decay: 1.5 },
  { position: [0, 15, 0], color: '#feca57', intensity: 1, decay: 2 },
  { position: [5, 8, 5], color: '#ff9ff3', intensity: 1.5, decay: 2 },
];

const ART_OBJECTS: WorldObject[] = [
  {
    id: 'art-gallery-frame', type: 'glb', position: [0, 0, -10],
    rotation: [0, 0, 0], scale: [1, 1, 1], model: '/3d/models/art/gallery-frame.glb',
    interactable: true, onClick: '/portfolio/art',
  },
  {
    id: 'art-graffiti-wall', type: 'glb', position: [8, 0, -5],
    rotation: [0, Math.PI / 4, 0], scale: [1, 1, 1], model: '/3d/models/art/graffiti-wall.glb',
    interactable: true, onClick: '/about',
  },
  {
    id: 'art-pedestal-left', type: 'glb', position: [-6, 0, -8],
    rotation: [0, -Math.PI / 6, 0], scale: [1, 1, 1], model: '/3d/models/art/pedestal.glb',
    interactable: true, onClick: '/portfolio/art/sculptures',
  },
  {
    id: 'art-pedestal-right', type: 'glb', position: [6, 0, -8],
    rotation: [0, Math.PI / 6, 0], scale: [1, 1, 1], model: '/3d/models/art/pedestal.glb',
    interactable: true, onClick: '/portfolio/art/paintings',
  },
  {
    id: 'art-neon-sign', type: 'glb', position: [0, 6, -8],
    rotation: [0, 0, 0], scale: [1, 1, 1], model: '/3d/models/art/neon-sign.glb',
  },
  {
    id: 'art-spray-can', type: 'glb', position: [-10, 0, 0],
    rotation: [0, Math.PI / 3, 0], scale: [0.5, 0.5, 0.5], model: '/3d/models/art/spray-can.glb',
    interactable: true, onClick: '/contact',
  },
];

export const ART_WORLD: WorldConfig = {
  id: 'art',
  name: 'Art Underground',
  colors: {
    background: '#1a1a2e',
    ambient: '#16213e',
    fog: '#0f0f23',
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
  },
  lighting: { ambientIntensity: 0.4, directionalIntensity: 0.5, pointLights: ART_POINT_LIGHTS },
  environment: {
    skybox: '/3d/env/art/underground.hdr',
    ground: '/3d/env/art/concrete-floor.glb',
    objects: ART_OBJECTS,
  },
  spawnPoint: [0, 1, 5],
};
