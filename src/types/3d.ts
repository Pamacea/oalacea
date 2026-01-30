// 3D Scene types
export type WorldType = 'dev' | 'art';

export type AnimationType = 'idle' | 'walk' | 'run' | 'jump' | 'fall';

export type TransitionState = 'idle' | 'transitioning' | 'complete';

export type LoadingState = 'loading' | 'ready' | 'error';

// 3D Component props types
export interface WorldSeedInputProps {
  world: 'DEV' | 'ART';
  onSeedChange?: (seed: string) => void;
}

export interface BlogDocumentProps {
  post: {
    id: string;
    title: string;
    excerpt: string | null;
    publishDate: Date | null;
    createdAt: Date;
    category: string | null;
  };
  position: [number, number, number];
  world: 'DEV' | 'ART';
  isActive?: boolean;
  onInteract?: () => void;
}

export interface CharacterModelProps {
  isMoving: boolean;
  isSprinting: boolean;
  isOccluded?: boolean;
}

// Collision types
export interface CollisionZone {
  id: string;
  name: string;
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
  type: 'wall' | 'portal' | 'trigger' | 'obstacle';
  targetWorld?: 'dev' | 'art';
  targetRoute?: string;
}

// World generation types
export interface BuildingData {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: number;
  biome: string;
}

export interface ChunkData {
  x: number;
  z: number;
  buildings: BuildingData[];
  decorations: DecorationData[];
}

export interface DecorationData {
  position: [number, number, number];
  type: 'tree' | 'rock' | 'lamp' | 'bench';
}
