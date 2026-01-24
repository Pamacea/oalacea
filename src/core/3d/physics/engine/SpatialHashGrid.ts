// Spatial Hash Grid - Ultra-fine 0.5m cells for precise collision detection
import { Vector3 } from 'three';
import type { HitboxShape } from './hitboxes/HitboxShape';

export interface Obstacle {
  id: string;
  hitbox: HitboxShape;
  type: 'static' | 'dynamic' | 'trigger';
  interactionDistance?: number;
  name?: string;
}

export interface GridCell {
  x: number;
  z: number;
  obstacles: Map<string, Obstacle>;
  cachedWalkable: boolean;
  cachedCost: number;
}

/**
 * Spatial hash grid with 0.5m cells for sub-meter precision
 * Provides O(1) obstacle lookup and efficient collision queries
 */
export class SpatialHashGrid {
  // Ultra-fine 0.5m cells for sub-meter precision
  readonly CELL_SIZE: number = 0.5;
  readonly WORLD_MIN: number = -50;
  readonly WORLD_MAX: number = 50;
  readonly cols: number;
  readonly rows: number;

  private readonly grid: Map<string, GridCell>;
  private readonly obstacles: Map<string, Obstacle>;

  constructor() {
    this.cols = Math.ceil((this.WORLD_MAX - this.WORLD_MIN) / this.CELL_SIZE);
    this.rows = Math.ceil((this.WORLD_MAX - this.WORLD_MIN) / this.CELL_SIZE);
    this.grid = new Map();
    this.obstacles = new Map();
    this.initializeGrid();
  }

  private initializeGrid(): void {
    for (let x = 0; x < this.cols; x++) {
      for (let z = 0; z < this.rows; z++) {
        this.grid.set(this.getCellKey(x, z), {
          x, z,
          obstacles: new Map(),
          cachedWalkable: true,
          cachedCost: 1,
        });
      }
    }
  }

  private getCellKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  private worldToCell(worldPos: number): number {
    return Math.floor((worldPos - this.WORLD_MIN) / this.CELL_SIZE);
  }

  private cellToWorld(cellX: number): number {
    return this.WORLD_MIN + cellX * this.CELL_SIZE + this.CELL_SIZE / 2;
  }

  private cellToWorldPos(cellX: number, cellZ: number): Vector3 {
    return new Vector3(
      this.cellToWorld(cellX),
      0,
      this.cellToWorld(cellZ)
    );
  }

  /**
   * Add an obstacle with its hitbox shape
   * Marks all cells that the obstacle's bounding box touches
   */
  addObstacle(obstacle: Obstacle): void {
    // Remove existing obstacle with same ID
    if (this.obstacles.has(obstacle.id)) {
      this.removeObstacle(obstacle.id);
    }

    this.obstacles.set(obstacle.id, obstacle);

    // Get bounding box for grid registration
    const bounds = obstacle.hitbox.getBounds();

    // Calculate cell range from bounding box
    const minCellX = Math.max(0, this.worldToCell(bounds.min.x));
    const minCellZ = Math.max(0, this.worldToCell(bounds.min.z));
    const maxCellX = Math.min(this.cols - 1, this.worldToCell(bounds.max.x));
    const maxCellZ = Math.min(this.rows - 1, this.worldToCell(bounds.max.z));

    // Mark all cells this obstacle touches
    for (let x = minCellX; x <= maxCellX; x++) {
      for (let z = minCellZ; z <= maxCellZ; z++) {
        const key = this.getCellKey(x, z);
        const cell = this.grid.get(key);

        if (cell) {
          cell.obstacles.set(obstacle.id, obstacle);
          cell.cachedWalkable = this.calculateCellWalkable(cell);
        }
      }
    }
  }

  /**
   * Remove an obstacle from the grid
   */
  removeObstacle(id: string): void {
    const obstacle = this.obstacles.get(id);
    if (!obstacle) return;

    const bounds = obstacle.hitbox.getBounds();
    const minCellX = Math.max(0, this.worldToCell(bounds.min.x));
    const minCellZ = Math.max(0, this.worldToCell(bounds.min.z));
    const maxCellX = Math.min(this.cols - 1, this.worldToCell(bounds.max.x));
    const maxCellZ = Math.min(this.rows - 1, this.worldToCell(bounds.max.z));

    for (let x = minCellX; x <= maxCellX; x++) {
      for (let z = minCellZ; z <= maxCellZ; z++) {
        const key = this.getCellKey(x, z);
        const cell = this.grid.get(key);

        if (cell) {
          cell.obstacles.delete(id);
          cell.cachedWalkable = this.calculateCellWalkable(cell);
        }
      }
    }

    this.obstacles.delete(id);
  }

  /**
   * Update an existing obstacle
   */
  updateObstacle(id: string, updates: Partial<Omit<Obstacle, 'id'>>): void {
    const existing = this.obstacles.get(id);
    if (!existing) return;

    // If hitbox changed, need to re-register
    if (updates.hitbox && updates.hitbox !== existing.hitbox) {
      const updated: Obstacle = {
        ...existing,
        ...updates,
      };
      this.addObstacle(updated);
    } else {
      // Just update the obstacle data
      Object.assign(existing, updates);
    }
  }

  /**
   * Get all obstacles near a position
   * Uses cell lookup for O(1) access
   */
  getNearbyObstacles(position: Vector3, searchRadius: number): Obstacle[] {
    const cellX = this.worldToCell(position.x);
    const cellZ = this.worldToCell(position.z);
    const radiusInCells = Math.ceil(searchRadius / this.CELL_SIZE);
    const nearby = new Set<Obstacle>();

    for (let dx = -radiusInCells; dx <= radiusInCells; dx++) {
      for (let dz = -radiusInCells; dz <= radiusInCells; dz++) {
        const key = this.getCellKey(cellX + dx, cellZ + dz);
        const cell = this.grid.get(key);

        if (cell) {
          for (const obstacle of cell.obstacles.values()) {
            nearby.add(obstacle);
          }
        }
      }
    }

    return Array.from(nearby);
  }

  /**
   * Get cell walkable state for pathfinding
   * Returns true if no solid obstacles in this cell
   */
  isCellWalkable(cellX: number, cellZ: number): boolean {
    if (cellX < 0 || cellX >= this.cols || cellZ < 0 || cellZ >= this.rows) {
      return false;
    }

    const key = this.getCellKey(cellX, cellZ);
    const cell = this.grid.get(key);

    if (!cell) return false;
    return cell.cachedWalkable;
  }

  private calculateCellWalkable(cell: GridCell): boolean {
    for (const obstacle of cell.obstacles.values()) {
      if (obstacle.type !== 'trigger') {
        return false;
      }
    }
    return true;
  }

  /**
   * Get cell at world position
   */
  getCellAt(position: Vector3): { x: number; z: number } | null {
    const x = this.worldToCell(position.x);
    const z = this.worldToCell(position.z);

    if (x >= 0 && x < this.cols && z >= 0 && z < this.rows) {
      return { x, z };
    }

    return null;
  }

  getObstacle(id: string): Obstacle | undefined {
    return this.obstacles.get(id);
  }

  getAllObstacles(): Obstacle[] {
    return Array.from(this.obstacles.values());
  }

  clear(): void {
    this.obstacles.clear();
    this.grid.forEach(cell => {
      cell.obstacles.clear();
      cell.cachedWalkable = true;
    });
  }

  /**
   * Get grid statistics for debugging
   */
  getStats() {
    return {
      cellSize: this.CELL_SIZE,
      cols: this.cols,
      rows: this.rows,
      totalCells: this.cols * this.rows,
      obstacleCount: this.obstacles.size,
    };
  }
}
