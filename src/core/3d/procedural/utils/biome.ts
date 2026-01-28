/**
 * Biome definitions for procedural world generation
 */
export const BIOMES = {
  URBAN_DENSE: {
    name: 'Urban Dense',
    color: 0x1a1a1a,
    buildingDensity: 0.8,
    minBuildingHeight: 2,
    maxBuildingHeight: 8,
    decorationChance: 0.1,
  },
  URBAN_SPARSE: {
    name: 'Urban Sparse',
    color: 0x2a2a2a,
    buildingDensity: 0.4,
    minBuildingHeight: 1,
    maxBuildingHeight: 4,
    decorationChance: 0.3,
  },
  PARK: {
    name: 'Park',
    color: 0x1a3a1a,
    buildingDensity: 0.1,
    minBuildingHeight: 0,
    maxBuildingHeight: 1,
    decorationChance: 0.8,
  },
  PLAZA: {
    name: 'Plaza',
    color: 0x3a3a2a,
    buildingDensity: 0.2,
    minBuildingHeight: 0,
    maxBuildingHeight: 2,
    decorationChance: 0.4,
  },
} as const;

export type BiomeType = keyof typeof BIOMES;

/**
 * Get biome at position based on noise value
 */
export function getBiomeAtPosition(noiseValue: number): BiomeType {
  if (noiseValue < -0.3) return 'PARK';
  if (noiseValue < 0) return 'URBAN_SPARSE';
  if (noiseValue < 0.3) return 'PLAZA';
  return 'URBAN_DENSE';
}

/**
 * Get biome data for a given biome type
 */
export function getBiomeData(type: BiomeType) {
  return BIOMES[type];
}
