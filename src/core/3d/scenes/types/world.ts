// World type definitions

export type WorldType = 'dev' | 'art';

export interface WorldColors {
  background: string;
  ambient: string;
  fog: string;
  primary: string;
  secondary: string;
}

export interface WorldLighting {
  ambientIntensity: number;
  directionalIntensity: number;
  pointLights: PointLightConfig[];
}

export interface PointLightConfig {
  position: [number, number, number];
  color: string;
  intensity: number;
  decay: number;
}

export interface WorldEnvironment {
  skybox: string;
  ground: string;
  objects: WorldObject[];
}

export interface WorldObject {
  id: string;
  type: 'glb' | 'primitive' | 'text';
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  model?: string;
  interactable?: boolean;
  onClick?: string;
  interactionDistance?: number;
  displayName?: string;
}

export interface WorldConfig {
  id: WorldType;
  name: string;
  colors: WorldColors;
  lighting: WorldLighting;
  environment: WorldEnvironment;
  spawnPoint: [number, number, number];
}
