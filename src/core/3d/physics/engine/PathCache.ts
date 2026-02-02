// Path Cache - LRU cache for pathfinding results with spatial invalidation
import { Vector3 } from 'three';

// ============================================
// TYPES
// ============================================

interface CachedPath {
  path: Vector3[];
  timestamp: number;
  hitCount: number;
  lastHit: number;
  key: string;
  hash: string;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  invalidations: number;
  hitRate: number;
}

// ============================================
// CONFIGURATION
// ============================================

interface PathCacheConfig {
  maxAge: number; // Maximum age of cached path in ms
  maxSize: number; // Maximum number of cached paths
  gridResolution: number; // Resolution for spatial hashing
  debug: boolean; // Enable debug logging
}

const DEFAULT_CONFIG: PathCacheConfig = {
  maxAge: 5000, // 5 seconds
  maxSize: 100,
  gridResolution: 5, // 5m cells for spatial invalidation
  debug: false,
};

// ============================================
// PATH CACHE CLASS
// ============================================

export class PathCache {
  private cache = new Map<string, CachedPath>();
  private spatialIndex = new Map<string, Set<string>>(); // Cell key -> Set of cache keys
  private hits = 0;
  private misses = 0;
  private invalidations = 0;
  private config: PathCacheConfig;

  constructor(config?: Partial<PathCacheConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============================================
  // CACHE LOOKUP
  // ============================================

  /**
   * Get a cached path from start to end position.
   * Returns null if not found, expired, or invalidated.
   */
  get(from: Vector3, to: Vector3): Vector3[] | null {
    const key = this.makeKey(from, to);
    const cached = this.cache.get(key);

    if (!cached) {
      this.misses++;
      this.logDebug(`Cache miss: ${key}`);
      return null;
    }

    // Check if expired
    const age = Date.now() - cached.timestamp;
    if (age > this.config.maxAge) {
      this.remove(key);
      this.misses++;
      this.logDebug(`Cache expired: ${key} (${age}ms old)`);
      return null;
    }

    // Cache hit!
    this.hits++;
    cached.hitCount++;
    cached.lastHit = Date.now();

    this.logDebug(`Cache hit: ${key} (${cached.path.length} waypoints, hit #${cached.hitCount})`);

    // Return a deep copy of the path to prevent mutation
    return cached.path.map((v) => v.clone());
  }

  /**
   * Store a path in the cache.
   */
  set(from: Vector3, to: Vector3, path: Vector3[]): void {
    // Don't cache empty or single-point paths
    if (!path || path.length <= 1) {
      return;
    }

    const key = this.makeKey(from, to);
    const hash = this.makePathHash(path);

    // Check if we need to evict
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    // Create cache entry
    const now = Date.now();
    const entry: CachedPath = {
      path: path.map((v) => v.clone()),
      timestamp: now,
      hitCount: 0,
      lastHit: now,
      key,
      hash,
    };

    this.cache.set(key, entry);

    // Update spatial index for all path points
    this.updateSpatialIndex(key, path);

    this.logDebug(`Cached path: ${key} (${path.length} waypoints)`);
  }

  // ============================================
  // SPATIAL INVALIDATION
  // ============================================

  /**
   * Invalidate all cached paths that pass through a circular area.
   * Called when an obstacle is added/removed/moved.
   */
  invalidateArea(position: Vector3, radius: number): void {
    const cells = this.getCellsForArea(position, radius);
    const keysToRemove = new Set<string>();

    // Find all cache keys that pass through affected cells
    for (const cellKey of cells) {
      const pathKeys = this.spatialIndex.get(cellKey);
      if (pathKeys) {
        for (const pathKey of pathKeys) {
          keysToRemove.add(pathKey);
        }
      }
    }

    // Remove all affected paths
    for (const key of keysToRemove) {
      this.remove(key);
    }

    this.invalidations += keysToRemove.size;

    this.logDebug(
      `Invalidated ${keysToRemove.size} paths near [${position.x.toFixed(1)}, ${position.z.toFixed(1)}]`
    );
  }

  /**
   * Invalidate all cached paths that pass through a specific cell.
   */
  invalidateCell(cellX: number, cellZ: number): void {
    const cellKey = this.makeCellKey(cellX, cellZ);
    const pathKeys = this.spatialIndex.get(cellKey);

    if (pathKeys) {
      for (const key of pathKeys) {
        this.remove(key);
      }
    }
  }

  /**
   * Invalidate all cached paths.
   */
  invalidateAll(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.spatialIndex.clear();
    this.invalidations += size;
    this.logDebug(`Invalidated all ${size} cached paths`);
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private remove(key: string): void {
    const entry = this.cache.get(key);
    if (!entry) return;

    // Remove from spatial index
    for (const point of entry.path) {
      const cellKey = this.makeCellKeyFromPos(point);
      const pathKeys = this.spatialIndex.get(cellKey);
      if (pathKeys) {
        pathKeys.delete(key);
        if (pathKeys.size === 0) {
          this.spatialIndex.delete(cellKey);
        }
      }
    }

    this.cache.delete(key);
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.lastHit < oldestTime) {
        oldestTime = entry.lastHit;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.logDebug(`Evicting LRU: ${oldestKey}`);
      this.remove(oldestKey);
    }
  }

  private updateSpatialIndex(key: string, path: Vector3[]): void {
    // Add this path key to all cells it passes through
    for (const point of path) {
      const cellKey = this.makeCellKeyFromPos(point);
      let pathKeys = this.spatialIndex.get(cellKey);

      if (!pathKeys) {
        pathKeys = new Set();
        this.spatialIndex.set(cellKey, pathKeys);
      }

      pathKeys.add(key);
    }
  }

  private getCellsForArea(position: Vector3, radius: number): Set<string> {
    const cells = new Set<string>();
    const res = this.config.gridResolution;

    const minCellX = Math.floor((position.x - radius) / res);
    const maxCellX = Math.floor((position.x + radius) / res);
    const minCellZ = Math.floor((position.z - radius) / res);
    const maxCellZ = Math.floor((position.z + radius) / res);

    for (let x = minCellX; x <= maxCellX; x++) {
      for (let z = minCellZ; z <= maxCellZ; z++) {
        cells.add(this.makeCellKey(x, z));
      }
    }

    return cells;
  }

  // ============================================
  // KEY GENERATION
  // ============================================

  /**
   * Create a cache key from two positions.
   * Uses rounded coordinates to group nearby queries.
   */
  private makeKey(from: Vector3, to: Vector3): string {
    const resolution = 0.5; // 0.5m resolution for key generation
    const fx = Math.round(from.x / resolution) * resolution;
    const fz = Math.round(from.z / resolution) * resolution;
    const tx = Math.round(to.x / resolution) * resolution;
    const tz = Math.round(to.z / resolution) * resolution;
    return `${fx},${fz}->${tx},${tz}`;
  }

  /**
   * Create a hash of a path for detecting changes.
   */
  private makePathHash(path: Vector3[]): string {
    if (path.length === 0) return '';

    // Sample points along the path to create a simple hash
    const samples = Math.min(path.length, 5);
    const step = Math.floor(path.length / samples) || 1;

    const parts: string[] = [];
    for (let i = 0; i < path.length; i += step) {
      const p = path[i];
      parts.push(`${p.x.toFixed(1)},${p.z.toFixed(1)}`);
    }

    return parts.join('|');
  }

  private makeCellKey(x: number, z: number): string {
    return `${x},${z}`;
  }

  private makeCellKeyFromPos(pos: Vector3): string {
    const res = this.config.gridResolution;
    const x = Math.floor(pos.x / res);
    const z = Math.floor(pos.z / res);
    return this.makeCellKey(x, z);
  }

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Get cache statistics.
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      invalidations: this.invalidations,
      hitRate,
    };
  }

  /**
   * Reset statistics counters.
   */
  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.invalidations = 0;
  }

  /**
   * Get detailed information about cached paths.
   */
  getCacheInfo(): Array<{
    key: string;
    age: number;
    hitCount: number;
    pathLength: number;
  }> {
    const now = Date.now();
    const info: Array<{
      key: string;
      age: number;
      hitCount: number;
      pathLength: number;
    }> = [];

    for (const [key, entry] of this.cache) {
      info.push({
        key,
        age: now - entry.timestamp,
        hitCount: entry.hitCount,
        pathLength: entry.path.length,
      });
    }

    return info.sort((a, b) => b.hitCount - a.hitCount);
  }

  // ============================================
  // DEBUGGING
  // ============================================

  private logDebug(_message: string): void {
    // Debug logging disabled
  }

  /**
   * Enable or disable debug mode.
   */
  setDebug(enabled: boolean): void {
    this.config.debug = enabled;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let globalCache: PathCache | null = null;

/**
 * Get or create the global path cache instance.
 */
export function getPathCache(config?: Partial<PathCacheConfig>): PathCache {
  if (!globalCache) {
    globalCache = new PathCache(config);
  }
  return globalCache;
}

/**
 * Reset the global path cache.
 */
export function resetPathCache(): void {
  if (globalCache) {
    globalCache.invalidateAll();
    globalCache.resetStats();
  }
  globalCache = null;
}
