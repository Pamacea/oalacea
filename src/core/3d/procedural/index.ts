export {
  ProceduralWorld,
  ProceduralTerrain,
  WorldSeedInput,
  WorldMinimap,
  serializeWorldState,
  deserializeWorldState,
} from './WorldGenerator';
export type { BiomeType, WorldState, BiomeConfig } from './WorldGenerator';

// Procedural generation utilities (pure functions for testing)
export * from './utils';
