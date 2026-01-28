import type { BiomeType } from './biome';
import { getBiomeData } from './biome';

/**
 * Building data structure
 */
export interface BuildingData {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: number;
  biome: BiomeType;
  color: number;
}

/**
 * Generate a building at the given chunk position
 */
export function generateBuilding(
  chunkX: number,
  chunkZ: number,
  localX: number,
  localZ: number,
  biome: BiomeType,
  random: () => number
): BuildingData | null {
  const biomeData = getBiomeData(biome);

  // Check if we should place a building based on biome density
  if (random() > biomeData.buildingDensity) {
    return null;
  }

  const height = biomeData.minBuildingHeight +
    random() * (biomeData.maxBuildingHeight - biomeData.minBuildingHeight);
  const width = 0.5 + random() * 1;
  const depth = 0.5 + random() * 1;

  return {
    position: [
      chunkX * 10 + localX,
      height / 2,
      chunkZ * 10 + localZ,
    ],
    scale: [width, height, depth],
    rotation: random() * Math.PI * 2,
    biome,
    color: biomeData.color,
  };
}

/**
 * Generate multiple buildings for a chunk
 */
export function generateChunkBuildings(
  chunkX: number,
  chunkZ: number,
  biome: BiomeType,
  random: () => number,
  count: number = 10
): BuildingData[] {
  const buildings: BuildingData[] = [];

  for (let i = 0; i < count; i++) {
    const localX = (random() - 0.5) * 10;
    const localZ = (random() - 0.5) * 10;

    const building = generateBuilding(chunkX, chunkZ, localX, localZ, biome, random);
    if (building) {
      buildings.push(building);
    }
  }

  return buildings;
}
