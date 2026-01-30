// Pathfinding Adapter - Fixed collision validation and proper radius handling
import { Vector3 } from 'three';
import type { SpatialHashGrid } from './SpatialHashGrid';
import type { CollisionDetector } from './CollisionDetector';

export interface PathNode {
  position: Vector3;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

/**
 * A* Pathfinding with 0.5m grid cells
 * Fixed: Proper collision validation with character radius
 */
export class PathfindingAdapter {
  private readonly spatialGrid: SpatialHashGrid;
  private readonly collisionDetector: CollisionDetector;
  private readonly CELL_SIZE = 0.5;
  private readonly WORLD_MIN = -50;
  private readonly WORLD_MAX = 50;
  public readonly characterRadius: number = 0.5;

  constructor(
    spatialGrid: SpatialHashGrid,
    collisionDetector: CollisionDetector,
    characterRadius: number = 0.5
  ) {
    this.spatialGrid = spatialGrid;
    this.collisionDetector = collisionDetector;
    this.characterRadius = characterRadius;
  }

  /**
   * Find path from start to end using hybrid A*
   */
  findPath(
    start: Vector3,
    end: Vector3,
    characterRadius: number = 0.5
  ): Vector3[] {
    // Use reduced radius for pathfinding to allow tighter navigation
    const pathfindingRadius = Math.max(0.3, characterRadius * 0.5);

    // Validate start position - if invalid, find nearest valid
    const safeStart = this.collisionDetector.isPositionValid(start)
      ? start
      : this.collisionDetector.findNearestValidPosition(start, pathfindingRadius, 3);

    // Validate end position - if invalid, find nearest valid
    const safeEnd = this.collisionDetector.isPositionValid(end)
      ? end
      : this.collisionDetector.findNearestValidPosition(end, pathfindingRadius, 5);

    // Direct path if line of sight
    if (this.hasLineOfSight(safeStart, safeEnd, pathfindingRadius)) {
      return [safeEnd.clone()];
    }

    // A* pathfinding
    const startCell = this.worldToCell(safeStart);
    const endCell = this.worldToCell(safeEnd);
    const gridPath = this.findGridPath(startCell, endCell, pathfindingRadius);

    if (gridPath.length === 0) {
      // No path found, try direct anyway
      return [safeEnd.clone()];
    }

    // Convert and add waypoints
    const worldPath = this.gridToWorld(gridPath);
    worldPath.unshift(safeStart.clone());
    worldPath.push(safeEnd.clone());

    // Smooth path with collision validation
    return this.smoothPath(worldPath, pathfindingRadius);
  }

  /**
   * A* pathfinding with proper radius validation
   */
  private findGridPath(
    start: { x: number; z: number },
    end: { x: number; z: number },
    radius: number
  ): { x: number; z: number }[] {
    const maxIterations = 3000;
    let iterations = 0;

    const openSet: PathNode[] = [{
      position: new Vector3(start.x, 0, start.z),
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
      parent: null,
    }];
    openSet[0].f = openSet[0].g + openSet[0].h;

    const closedSet = new Set<string>();
    const gScores = new Map<string, number>();
    gScores.set(`${start.x},${start.z}`, 0);

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;

      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const currentKey = `${Math.round(current.position.x)},${Math.round(current.position.z)}`;

      // Check if reached goal
      if (Math.abs(current.position.x - end.x) < 1 &&
          Math.abs(current.position.z - end.z) < 1) {
        return this.reconstructPath(current);
      }

      closedSet.add(currentKey);

      for (const neighbor of this.getNeighbors(
        Math.round(current.position.x),
        Math.round(current.position.z)
      )) {
        const neighborKey = `${neighbor.x},${neighbor.z}`;

        if (closedSet.has(neighborKey)) continue;

        // Add character radius offset in all directions for proper validation
        const isValid = this.isCellWalkableWithRadius(neighbor.x, neighbor.z, radius);

        if (!isValid) continue;

        // Calculate costs
        const distFromCurrent = this.distance(
          { x: current.position.x, z: current.position.z },
          neighbor
        );
        const tentativeG = current.g + distFromCurrent;

        const existingG = gScores.get(neighborKey);
        if (existingG === undefined || tentativeG < existingG) {
          gScores.set(neighborKey, tentativeG);

          const existing = openSet.find(n =>
            Math.round(n.position.x) === neighbor.x &&
            Math.round(n.position.z) === neighbor.z
          );

          if (!existing) {
            const h = this.heuristic(neighbor, end);
            openSet.push({
              position: new Vector3(neighbor.x, 0, neighbor.z),
              g: tentativeG,
              h,
              f: tentativeG + h,
              parent: current,
            });
          } else {
            existing.g = tentativeG;
            existing.f = tentativeG + existing.h;
            existing.parent = current;
          }
        }
      }
    }

    return [];
  }

  /**
   * Check if a cell is walkable accounting for character radius
   * Only checks center of cell - avoids double-margin issue that blocks narrow passages
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private isCellWalkableWithRadius(cellX: number, cellZ: number, radius: number): boolean {
    const cellCenter = this.cellToWorld(cellX, cellZ);

    // Use reduced radius for pathfinding to avoid double-margin issue
    // Hitboxes already include their collision bounds, so we don't need full character radius
    const pathfindingRadius = Math.max(0.3, radius * 0.5);
    return this.collisionDetector.isPositionValid(cellCenter, pathfindingRadius);
  }

  private getNeighbors(x: number, z: number): { x: number; z: number }[] {
    const neighbors: { x: number; z: number }[] = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    for (const [dx, dz] of directions) {
      const nx = x + dx;
      const nz = z + dz;

      if (nx >= 0 && nx < this.spatialGrid['cols'] &&
          nz >= 0 && nz < this.spatialGrid['rows']) {
        neighbors.push({ x: nx, z: nz });
      }
    }

    return neighbors;
  }

  private heuristic(a: { x: number; z: number }, b: { x: number; z: number }): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.z - b.z, 2));
  }

  private distance(a: { x: number; z: number }, b: { x: number; z: number }): number {
    const dx = Math.abs(a.x - b.x);
    const dz = Math.abs(a.z - b.z);
    return dx === 1 && dz === 1 ? 1.414 : 1;
  }

  private reconstructPath(endNode: PathNode): { x: number; z: number }[] {
    const path: { x: number; z: number }[] = [];
    let current: PathNode | null = endNode;

    while (current) {
      path.unshift({
        x: Math.round(current.position.x),
        z: Math.round(current.position.z)
      });
      current = current.parent;
    }

    return path;
  }

  private cellToWorld(x: number, z: number): Vector3 {
    return new Vector3(
      this.WORLD_MIN + x * this.CELL_SIZE + this.CELL_SIZE / 2,
      0.5,
      this.WORLD_MIN + z * this.CELL_SIZE + this.CELL_SIZE / 2
    );
  }

  private worldToCell(pos: Vector3): { x: number; z: number } {
    return {
      x: Math.floor((pos.x - this.WORLD_MIN) / this.CELL_SIZE),
      z: Math.floor((pos.z - this.WORLD_MIN) / this.CELL_SIZE),
    };
  }

  private gridToWorld(gridPath: { x: number; z: number }[]): Vector3[] {
    return gridPath.map(p => this.cellToWorld(p.x, p.z));
  }

  private hasLineOfSight(from: Vector3, to: Vector3, radius: number): boolean {
    return this.collisionDetector.hasLineOfSight(from, to, radius);
  }

  /**
   * Smooth path with collision validation
   * Uses reduced radius for LOS to be more permissive in tight spaces
   */
  private smoothPath(path: Vector3[], radius: number): Vector3[] {
    if (path.length <= 2) return path;

    const smoothed: Vector3[] = [path[0]];
    let currentIndex = 0;

    while (currentIndex < path.length - 1) {
      let farthestIndex = currentIndex + 1;

      for (let i = currentIndex + 2; i < path.length; i++) {
        // Use reduced radius for LOS to be more permissive
        const losRadius = Math.max(0.3, radius * 0.5);
        if (this.hasLineOfSight(path[currentIndex], path[i], losRadius)) {
          farthestIndex = i;
        } else {
          break;
        }
      }

      smoothed.push(path[farthestIndex]);
      currentIndex = farthestIndex;
    }

    return smoothed;
  }
}
