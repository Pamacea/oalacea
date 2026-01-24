// A* Navigation Grid implementation
import { Vector3 } from 'three';
import type { CollisionZone } from '../collisions';
import { GridNode, GRID_SIZE, WORLD_MIN, WORLD_MAX } from './types';

class NavigationGrid {
  private grid: Map<string, GridNode> = new Map();
  private cols: number;
  private rows: number;

  constructor() {
    this.cols = Math.floor((WORLD_MAX - WORLD_MIN) / GRID_SIZE);
    this.rows = Math.floor((WORLD_MAX - WORLD_MIN) / GRID_SIZE);
    this.initializeGrid();
  }

  private getKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  private initializeGrid(): void {
    for (let x = 0; x < this.cols; x++) {
      for (let z = 0; z < this.rows; z++) {
        this.grid.set(this.getKey(x, z), {
          x, z, walkable: true, g: 0, h: 0, f: 0, parent: null,
        });
      }
    }
  }

  updateCollisionZones(zones: CollisionZone[]): void {
    for (const node of this.grid.values()) node.walkable = true;

    for (const zone of zones) {
      const zoneRadius = zone.radius + 0.5;
      const centerGridX = Math.floor((zone.position[0] - WORLD_MIN) / GRID_SIZE);
      const centerGridZ = Math.floor((zone.position[2] - WORLD_MIN) / GRID_SIZE);
      const radiusInCells = Math.ceil(zoneRadius / GRID_SIZE);

      for (let dx = -radiusInCells; dx <= radiusInCells; dx++) {
        for (let dz = -radiusInCells; dz <= radiusInCells; dz++) {
          const cellX = centerGridX + dx;
          const cellZ = centerGridZ + dz;

          if (cellX >= 0 && cellX < this.cols && cellZ >= 0 && cellZ < this.rows) {
            const cellWorldX = WORLD_MIN + cellX * GRID_SIZE + GRID_SIZE / 2;
            const cellWorldZ = WORLD_MIN + cellZ * GRID_SIZE + GRID_SIZE / 2;
            const dist = Math.sqrt(
              Math.pow(cellWorldX - zone.position[0], 2) +
              Math.pow(cellWorldZ - zone.position[2], 2)
            );

            if (dist < zoneRadius) {
              const node = this.grid.get(this.getKey(cellX, cellZ));
              if (node) node.walkable = false;
            }
          }
        }
      }
    }
  }

  worldToGrid(pos: Vector3): { x: number; z: number } {
    return {
      x: Math.floor((pos.x - WORLD_MIN) / GRID_SIZE),
      z: Math.floor((pos.z - WORLD_MIN) / GRID_SIZE),
    };
  }

  gridToWorld(x: number, z: number): Vector3 {
    return new Vector3(
      WORLD_MIN + x * GRID_SIZE + GRID_SIZE / 2,
      0.5,
      WORLD_MIN + z * GRID_SIZE + GRID_SIZE / 2
    );
  }

  isValid(x: number, z: number): boolean {
    return x >= 0 && x < this.cols && z >= 0 && z < this.rows;
  }

  isWalkable(x: number, z: number): boolean {
    if (!this.isValid(x, z)) return false;
    const node = this.grid.get(this.getKey(x, z));
    return node?.walkable ?? false;
  }

  findPath(start: Vector3, end: Vector3): Vector3[] {
    let startGrid = this.worldToGrid(start);
    let endGrid = this.worldToGrid(end);

    if (!this.isValid(endGrid.x, endGrid.z) || !this.isWalkable(endGrid.x, endGrid.z)) {
      const closest = this.findClosestWalkable(endGrid.x, endGrid.z);
      if (!closest) return [end];
      endGrid = closest;
    }

    if (!this.isWalkable(startGrid.x, startGrid.z)) {
      const closest = this.findClosestWalkable(startGrid.x, startGrid.z);
      if (!closest) return [end];
      startGrid = { ...startGrid, ...closest };
    }

    const openSet: GridNode[] = [{
      ...startGrid, walkable: true, g: 0, h: this.heuristic(startGrid, endGrid), f: 0, parent: null,
    }];
    openSet[0].f = openSet[0].g + openSet[0].h;
    const closedSet = new Set<string>();

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const currentKey = this.getKey(current.x, current.z);

      if (current.x === endGrid.x && current.z === endGrid.z) {
        return this.smoothPath(this.reconstructPath(current));
      }

      closedSet.add(currentKey);

      for (const neighbor of this.getNeighbors(current.x, current.z)) {
        const neighborKey = this.getKey(neighbor.x, neighbor.z);
        if (closedSet.has(neighborKey) || !neighbor.walkable) continue;

        const tentativeG = current.g + this.distance(current, neighbor);
        const existingNode = openSet.find(n => n.x === neighbor.x && n.z === neighbor.z);

        if (!existingNode) {
          neighbor.g = tentativeG;
          neighbor.h = this.heuristic(neighbor, endGrid);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          openSet.push(neighbor);
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = current;
        }
      }
    }

    return [end];
  }

  private heuristic(a: { x: number; z: number }, b: { x: number; z: number }): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.z - b.z, 2));
  }

  private distance(a: GridNode, b: GridNode): number {
    const dx = Math.abs(a.x - b.x);
    const dz = Math.abs(a.z - b.z);
    return dx === 1 && dz === 1 ? 1.414 : 1;
  }

  private getNeighbors(x: number, z: number): GridNode[] {
    const neighbors: GridNode[] = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    for (const [dx, dz] of directions) {
      const nx = x + dx, nz = z + dz;
      if (this.isValid(nx, nz)) {
        const node = this.grid.get(this.getKey(nx, nz));
        if (node) neighbors.push({ ...node });
      }
    }
    return neighbors;
  }

  private reconstructPath(endNode: GridNode): Vector3[] {
    const path: Vector3[] = [];
    let current: GridNode | null = endNode;
    while (current) {
      path.unshift(this.gridToWorld(current.x, current.z));
      current = current.parent;
    }
    return path;
  }

  private smoothPath(path: Vector3[]): Vector3[] {
    if (path.length <= 2) return path;

    const smoothed: Vector3[] = [path[0]];
    let currentIndex = 0;

    while (currentIndex < path.length - 1) {
      let farthestIndex = currentIndex + 1;
      for (let i = currentIndex + 2; i < path.length; i++) {
        if (this.hasLineOfSight(path[currentIndex], path[i])) {
          farthestIndex = i;
        } else break;
      }
      smoothed.push(path[farthestIndex]);
      currentIndex = farthestIndex;
    }
    return smoothed;
  }

  private hasLineOfSight(from: Vector3, to: Vector3): boolean {
    const dist = from.distanceTo(to);
    const steps = Math.ceil(dist / GRID_SIZE);
    const dir = to.clone().sub(from).normalize();

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const checkPos = from.clone().add(dir.clone().multiplyScalar(dist * t));
      const gridPos = this.worldToGrid(checkPos);
      if (!this.isWalkable(gridPos.x, gridPos.z)) return false;
    }
    return true;
  }

  private findClosestWalkable(x: number, z: number): { x: number; z: number } | null {
    const maxRadius = 10;
    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (Math.abs(dx) === radius || Math.abs(dz) === radius) {
            const nx = x + dx, nz = z + dz;
            if (this.isWalkable(nx, nz)) return { x: nx, z: nz };
          }
        }
      }
    }
    return null;
  }
}

export { NavigationGrid };
