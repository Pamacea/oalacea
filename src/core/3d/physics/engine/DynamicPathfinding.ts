// Dynamic Pathfinding - A* with dirty flag system for incremental updates
import { Vector3 } from 'three';
import type { SpatialHashGrid } from './SpatialHashGrid';
import type { CollisionDetector } from './CollisionDetector';
import { PathCache, getPathCache } from './PathCache';
import { rayCircleIntersection } from './Raycast';

// ============================================
// TYPES
// ============================================

export interface PathNode {
  position: Vector3;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export interface PathfindingStats {
  nodesExplored: number;
  pathLength: number;
  calculationTime: number;
  cacheHit: boolean;
}

// ============================================
// DYNAMIC PATHFINDING CLASS
// ============================================

export class DynamicPathfinding {
  private readonly spatialGrid: SpatialHashGrid;
  private readonly collisionDetector: CollisionDetector;
  private readonly pathCache: PathCache;
  private readonly CELL_SIZE = 0.5;
  private readonly WORLD_MIN = -50;
  private readonly WORLD_MAX = 50;

  // Dirty flag system
  private dirtyCells = new Set<string>();
  private gridVersion = 0;
  private obstacleVersion = 0;
  private walkableCache = new Map<string, boolean>();

  // Statistics
  private stats: PathfindingStats = {
    nodesExplored: 0,
    pathLength: 0,
    calculationTime: 0,
    cacheHit: false,
  };

  constructor(
    spatialGrid: SpatialHashGrid,
    collisionDetector: CollisionDetector,
    pathCache?: PathCache
  ) {
    this.spatialGrid = spatialGrid;
    this.collisionDetector = collisionDetector;
    this.pathCache = pathCache || getPathCache({ debug: false });

    // Listen to spatial grid changes (if we add events later)
    this.initializeDirtyRegion();
  }

  // ============================================
  // DIRTY FLAG SYSTEM
  // ============================================

  /**
   * Mark a region as dirty (needs recalculation).
   * Called when an obstacle is added, removed, or moved.
   */
  markDirty(position: Vector3, radius: number): void {
    const minCell = this.worldToCell(
      new Vector3(position.x - radius, 0, position.z - radius)
    );
    const maxCell = this.worldToCell(
      new Vector3(position.x + radius, 0, position.z + radius)
    );

    for (let x = minCell.x; x <= maxCell.x; x++) {
      for (let z = minCell.z; z <= maxCell.z; z++) {
        const key = this.makeCellKey(x, z);
        this.dirtyCells.add(key);

        // Invalidate walkable cache for this cell
        const worldPos = this.cellToWorld(x, z);
        this.walkableCache.delete(`${worldPos.x.toFixed(1)},${worldPos.z.toFixed(1)}`);
      }
    }

    // Invalidate path cache for affected area
    this.pathCache.invalidateArea(position, radius);
  }

  /**
   * Mark the entire grid as dirty.
   */
  markAllDirty(): void {
    for (let x = 0; x < this.spatialGrid['cols']; x++) {
      for (let z = 0; z < this.spatialGrid['rows']; z++) {
        this.dirtyCells.add(this.makeCellKey(x, z));
      }
    }
    this.walkableCache.clear();
    this.pathCache.invalidateAll();
  }

  /**
   * Process all dirty cells (recalculate walkable status).
   * Called before pathfinding to ensure grid is up to date.
   */
  private processDirtyCells(): void {
    if (this.dirtyCells.size === 0) return;

    for (const cellKey of this.dirtyCells) {
      const [x, z] = cellKey.split(',').map(Number);
      this.updateCell(x, z);
    }

    this.dirtyCells.clear();
    this.gridVersion++;
  }

  /**
   * Update a single cell's walkable status.
   */
  private updateCell(x: number, z: number): void {
    const worldPos = this.cellToWorld(x, z);
    const isWalkable = this.collisionDetector.isPositionValid(worldPos);

    // Update walkable cache
    const cacheKey = `${worldPos.x.toFixed(1)},${worldPos.z.toFixed(1)}`;
    this.walkableCache.set(cacheKey, isWalkable);
  }

  /**
   * Initialize the dirty region system.
   */
  private initializeDirtyRegion(): void {
    // Mark initial cells as processed
    this.processDirtyCells();
  }

  // ============================================
  // OBSTACLE CHANGE NOTIFICATION
  // ============================================

  /**
   * Notify pathfinding that an obstacle was added.
   */
  onObstacleAdded(obstacleId: string, position: Vector3, radius: number): void {
    this.markDirty(position, radius + 1); // Add margin
    this.obstacleVersion++;
  }

  /**
   * Notify pathfinding that an obstacle was removed.
   */
  onObstacleRemoved(obstacleId: string, position: Vector3, radius: number): void {
    this.markDirty(position, radius + 1);
    this.obstacleVersion++;
  }

  /**
   * Notify pathfinding that an obstacle was moved.
   */
  onObstacleMoved(
    obstacleId: string,
    oldPosition: Vector3,
    newPosition: Vector3,
    radius: number
  ): void {
    // Mark both old and new positions as dirty
    this.markDirty(oldPosition, radius + 1);
    this.markDirty(newPosition, radius + 1);
    this.obstacleVersion++;
  }

  // ============================================
  // PATHFINDING
  // ============================================

  /**
   * Find path from start to end using A* with caching.
   */
  findPath(
    start: Vector3,
    end: Vector3,
    characterRadius: number = 0.5
  ): Vector3[] {
    // Use reduced radius for pathfinding to avoid being too conservative
    // This allows paths through tighter spaces while collision detection
    // at runtime will prevent actual clipping
    const pathfindingRadius = Math.max(0.3, characterRadius * 0.5);
    const startTime = performance.now();

    // Process any dirty cells before pathfinding
    this.processDirtyCells();

    // Check cache first
    const cachedPath = this.pathCache.get(start, end);
    if (cachedPath) {
      this.stats = {
        nodesExplored: 0,
        pathLength: cachedPath.length,
        calculationTime: performance.now() - startTime,
        cacheHit: true,
      };
      return cachedPath;
    }

    // Validate and adjust positions using pathfinding radius
    const safeStart = this.getSafeStart(start, pathfindingRadius);
    const safeEnd = this.getSafeEnd(end, pathfindingRadius);

    // Check direct line of sight
    if (this.hasLineOfSight(safeStart, safeEnd, pathfindingRadius)) {
      const directPath = [safeEnd.clone()];
      this.pathCache.set(safeStart, safeEnd, directPath);
      this.stats = {
        nodesExplored: 1,
        pathLength: 1,
        calculationTime: performance.now() - startTime,
        cacheHit: false,
      };
      return directPath;
    }

    // Run A* pathfinding
    const path = this.findAStarPath(safeStart, safeEnd, pathfindingRadius);

    if (path.length > 0) {
      // Smooth the path
      const smoothedPath = this.smoothPath(path, pathfindingRadius);
      this.pathCache.set(safeStart, safeEnd, smoothedPath);
      this.stats = {
        nodesExplored: this.stats.nodesExplored,
        pathLength: smoothedPath.length,
        calculationTime: performance.now() - startTime,
        cacheHit: false,
      };
      return smoothedPath;
    }

    // No path found - return direct path as fallback
    this.stats = {
      nodesExplored: this.stats.nodesExplored,
      pathLength: 0,
      calculationTime: performance.now() - startTime,
      cacheHit: false,
    };
    return [safeEnd.clone()];
  }

  // ============================================
  // A* IMPLEMENTATION
  // ============================================

  private findAStarPath(
    start: Vector3,
    end: Vector3,
    radius: number
  ): Vector3[] {
    const startCell = this.worldToCellObj(start);
    const endCell = this.worldToCellObj(end);

    const maxIterations = 3000;
    let iterations = 0;

    const openSet: PathNode[] = [
      {
        position: start.clone(),
        g: 0,
        h: this.heuristic(startCell, endCell),
        f: 0,
        parent: null,
      },
    ];
    openSet[0].f = openSet[0].g + openSet[0].h;

    const closedSet = new Set<string>();
    const gScores = new Map<string, number>();
    gScores.set(this.nodeKey(startCell), 0);

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;

      // Get node with lowest f
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const currentCell = this.worldToCellObj(current.position);
      const currentKey = this.nodeKey(currentCell);

      // Check if reached goal
      if (this.isAtGoal(current.position, end)) {
        this.stats.nodesExplored = iterations;
        return this.reconstructPath(current);
      }

      closedSet.add(currentKey);

      // Explore neighbors
      for (const neighbor of this.getNeighbors(currentCell.x, currentCell.z)) {
        const neighborKey = this.nodeKey(neighbor);

        if (closedSet.has(neighborKey)) continue;

        // Check if walkable
        if (!this.isCellWalkable(neighbor.x, neighbor.z, radius)) continue;

        // Calculate costs
        const distFromCurrent = this.distance(currentCell, neighbor);
        const tentativeG = current.g + distFromCurrent;

        const existingG = gScores.get(neighborKey);
        if (existingG === undefined || tentativeG < existingG) {
          gScores.set(neighborKey, tentativeG);

          const existing = openSet.find(
            (n) => Math.round(n.position.x) === neighbor.x && Math.round(n.position.z) === neighbor.z
          );

          const worldPos = this.cellToWorld(neighbor.x, neighbor.z);
          const h = this.heuristic(neighbor, endCell);

          if (!existing) {
            openSet.push({
              position: worldPos,
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

    this.stats.nodesExplored = iterations;
    return []; // No path found
  }

  // ============================================
  // PATH VALIDATION & SMOOTHING
  // ============================================

  /**
   * Check if two positions have line of sight.
   * Uses ray-circle intersection for accuracy.
   */
  private hasLineOfSight(from: Vector3, to: Vector3, radius: number): boolean {
    const direction = to.clone().sub(from).normalize();
    const maxDistance = from.distanceTo(to);

    // Get nearby obstacles
    const midPoint = from.clone().add(to).multiplyScalar(0.5);
    const nearbyObstacles = this.spatialGrid.getNearbyObstacles(midPoint, maxDistance / 2 + 2);

    for (const obstacle of nearbyObstacles) {
      if (obstacle.type === 'trigger') continue;

      // Get obstacle bounds
      const bounds = obstacle.hitbox.getBounds();
      const center = new Vector3(
        (bounds.min.x + bounds.max.x) / 2,
        (bounds.min.y + bounds.max.y) / 2,
        (bounds.min.z + bounds.max.z) / 2
      );

      // Approximate as circle for raycast
      const obsRadius = Math.max(
        bounds.max.x - bounds.min.x,
        bounds.max.z - bounds.min.z
      ) / 2;

      const hit = rayCircleIntersection(from, direction, center, obsRadius + radius, maxDistance);

      if (hit && hit.distance < maxDistance - 0.01) {
        return false;
      }
    }

    return true;
  }

  /**
   * Smooth path by removing unnecessary waypoints.
   * Uses line-of-sight checks to skip intermediate points.
   * Preserves tight turns by checking intermediate waypoints.
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

  // ============================================
  // POSITION VALIDATION
  // ============================================

  private getSafeStart(start: Vector3, radius: number): Vector3 {
    if (this.collisionDetector.isPositionValid(start, radius)) {
      return start.clone();
    }

    // Try with reduced radius first
    const reducedRadius = Math.max(0.3, radius * 0.6);
    if (this.collisionDetector.isPositionValid(start, reducedRadius)) {
      return start.clone();
    }

    return this.collisionDetector.findNearestValidPosition(start, radius, 5);
  }

  private getSafeEnd(end: Vector3, radius: number): Vector3 {
    if (this.collisionDetector.isPositionValid(end, radius)) {
      return end.clone();
    }

    // First try with reduced radius for more permissive pathfinding
    const reducedRadius = Math.max(0.3, radius * 0.6);
    if (this.collisionDetector.isPositionValid(end, reducedRadius)) {
      return end.clone();
    }

    // Find nearest valid position with extended search
    return this.collisionDetector.findNearestValidPosition(end, radius, 8);
  }

  // ============================================
  // CELL UTILITIES
  // ============================================

  private isCellWalkable(x: number, z: number, radius: number): boolean {
    // Check bounds
    if (x < 0 || x >= this.spatialGrid['cols'] || z < 0 || z >= this.spatialGrid['rows']) {
      return false;
    }

    // Check cache
    const worldPos = this.cellToWorld(x, z);
    const cacheKey = `${worldPos.x.toFixed(1)},${worldPos.z.toFixed(1)}`;
    const cached = this.walkableCache.get(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    // For narrow passage detection, use reduced radius during pathfinding
    // The hitboxes already include their collision bounds, so we use a smaller margin
    // This prevents double-margin issue that blocks valid passages
    const pathfindingRadius = Math.max(0.3, radius * 0.5);
    const isWalkable = this.collisionDetector.isPositionValid(worldPos, pathfindingRadius);
    this.walkableCache.set(cacheKey, isWalkable);
    return isWalkable;
  }

  private getNeighbors(x: number, z: number): Array<{ x: number; z: number }> {
    const neighbors: Array<{ x: number; z: number }> = [];
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    for (const [dx, dz] of directions) {
      const nx = x + dx;
      const nz = z + dz;

      if (
        nx >= 0 &&
        nx < this.spatialGrid['cols'] &&
        nz >= 0 &&
        nz < this.spatialGrid['rows']
      ) {
        neighbors.push({ x: nx, z: nz });
      }
    }

    return neighbors;
  }

  // ============================================
  // COORDINATE CONVERSION
  // ============================================

  private worldToCellObj(pos: Vector3): { x: number; z: number } {
    return {
      x: Math.floor((pos.x - this.WORLD_MIN) / this.CELL_SIZE),
      z: Math.floor((pos.z - this.WORLD_MIN) / this.CELL_SIZE),
    };
  }

  private cellToWorld(x: number, z: number): Vector3 {
    return new Vector3(
      this.WORLD_MIN + x * this.CELL_SIZE + this.CELL_SIZE / 2,
      0.5,
      this.WORLD_MIN + z * this.CELL_SIZE + this.CELL_SIZE / 2
    );
  }

  private worldToCell(pos: Vector3): { x: number; z: number } {
    return this.worldToCellObj(pos);
  }

  // ============================================
  // A* UTILITIES
  // ============================================

  private heuristic(
    a: { x: number; z: number },
    b: { x: number; z: number }
  ): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.z - b.z, 2));
  }

  private distance(
    a: { x: number; z: number },
    b: { x: number; z: number }
  ): number {
    const dx = Math.abs(a.x - b.x);
    const dz = Math.abs(a.z - b.z);
    return dx === 1 && dz === 1 ? 1.414 : 1;
  }

  private isAtGoal(pos: Vector3, goal: Vector3): boolean {
    return Math.abs(pos.x - goal.x) < 0.5 && Math.abs(pos.z - goal.z) < 0.5;
  }

  private nodeKey(node: { x: number; z: number }): string {
    return `${node.x},${node.z}`;
  }

  private makeCellKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  private reconstructPath(endNode: PathNode): Vector3[] {
    const path: Vector3[] = [];
    let current: PathNode | null = endNode;

    while (current) {
      path.unshift(current.position.clone());
      current = current.parent;
    }

    return path;
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get statistics from the last pathfinding operation.
   */
  getStats(): PathfindingStats {
    return { ...this.stats };
  }

  /**
   * Get the path cache statistics.
   */
  getCacheStats() {
    return this.pathCache.getStats();
  }

  /**
   * Get grid version (increments when dirty cells are processed).
   */
  getGridVersion(): number {
    return this.gridVersion;
  }

  /**
   * Get obstacle version (increments when obstacles change).
   */
  getObstacleVersion(): number {
    return this.obstacleVersion;
  }
}
