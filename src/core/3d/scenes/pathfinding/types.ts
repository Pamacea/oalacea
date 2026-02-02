// Pathfinding types

export const GRID_SIZE = 2;
export const WORLD_MIN = -50;
export const WORLD_MAX = 50;

export interface GridNode {
  x: number;
  z: number;
  walkable: boolean;
  g: number;
  h: number;
  f: number;
  parent: GridNode | null;
}

export interface PathfindingOptions {
  maxIterations?: number;
}
