// 3D Interaction Tracker
// Tracks zones explored, time spent per world, objects interacted with, and heatmap data

'use client';

import { analytics } from '@/lib/analytics';

type WorldType = 'dev' | 'art';

interface ZoneData {
  x: number;
  z: number;
  visits: number;
  duration: number;
  lastVisit: number;
}

interface InteractionData {
  objectId: string;
  type: string;
  world: WorldType;
  count: number;
  lastInteraction: number;
  position?: { x: number; y: number; z: number };
}

interface WorldStats {
  world: WorldType;
  totalTime: number;
  visitCount: number;
  firstVisit: number;
  lastVisit: number;
  interactions: number;
}

interface HeatmapPoint {
  x: number;
  z: number;
  intensity: number;
  timestamp: number;
  world: WorldType;
}

interface InteractionTrackerOptions {
  zoneSize?: number; // Size of each grid zone in units
  maxZones?: number; // Maximum number of zones to track
  trackingInterval?: number; // How often to update position tracking (ms)
}

class InteractionTracker {
  private worldStats: Map<WorldType, WorldStats> = new Map();
  private zones: Map<string, ZoneData> = new Map();
  private interactions: Map<string, InteractionData> = new Map();
  private heatmap: HeatmapPoint[] = [];
  private currentPosition: { x: number; z: number } | null = null;
  private currentWorld: WorldType = 'dev';
  private worldStartTime: number = Date.now();
  private zoneStartTime: number = Date.now();
  private trackingInterval: NodeJS.Timeout | null = null;
  private isEnabled = true;

  private readonly options: Required<InteractionTrackerOptions>;

  constructor(options: InteractionTrackerOptions = {}) {
    this.options = {
      zoneSize: options.zoneSize ?? 5,
      maxZones: options.maxZones ?? 500,
      trackingInterval: options.trackingInterval ?? 1000,
    };

    // Initialize world stats
    this.worldStats.set('dev', {
      world: 'dev',
      totalTime: 0,
      visitCount: 0,
      firstVisit: Date.now(),
      lastVisit: Date.now(),
      interactions: 0,
    });
    this.worldStats.set('art', {
      world: 'art',
      totalTime: 0,
      visitCount: 0,
      firstVisit: 0,
      lastVisit: 0,
      interactions: 0,
    });
  }

  enable(): void {
    this.isEnabled = true;
    this.startTracking();
  }

  disable(): void {
    this.isEnabled = false;
    this.stopTracking();
  }

  private startTracking(): void {
    if (this.trackingInterval) return;

    this.trackingInterval = setInterval(() => {
      if (this.currentPosition && this.isEnabled) {
        this.recordPosition(this.currentPosition.x, this.currentPosition.z);
      }
    }, this.options.trackingInterval);
  }

  private stopTracking(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  // Called when player enters a world
  enterWorld(world: WorldType): void {
    // Record time in previous world
    const previousWorld = this.currentWorld;
    const stats = this.worldStats.get(previousWorld);
    if (stats) {
      stats.totalTime += Date.now() - this.worldStartTime;
      stats.lastVisit = Date.now();
    }

    // Switch to new world
    this.currentWorld = world;
    this.worldStartTime = Date.now();

    const newWorldStats = this.worldStats.get(world);
    if (newWorldStats) {
      newWorldStats.visitCount++;
      if (newWorldStats.firstVisit === 0) {
        newWorldStats.firstVisit = Date.now();
      }
      newWorldStats.lastVisit = Date.now();
    }

    // Track the world switch
    analytics.worldSwitch(previousWorld, world);
  }

  // Called when player position changes
  updatePosition(x: number, z: number): void {
    this.currentPosition = { x, z };
  }

  // Records position data for zone tracking and heatmap
  private recordPosition(x: number, z: number): void {
    const zoneX = Math.floor(x / this.options.zoneSize);
    const zoneZ = Math.floor(z / this.options.zoneSize);
    const zoneKey = `${zoneX},${zoneZ}`;

    // Update zone data
    const existingZone = this.zones.get(zoneKey);
    const now = Date.now();

    if (existingZone) {
      existingZone.visits++;
      existingZone.duration += this.options.trackingInterval;
      existingZone.lastVisit = now;
    } else {
      // Check max zones limit
      if (this.zones.size >= this.options.maxZones) {
        // Remove oldest zone
        const oldestKey = Array.from(this.zones.entries())
          .sort(([, a], [, b]) => a.lastVisit - b.lastVisit)[0]?.[0];
        if (oldestKey) {
          this.zones.delete(oldestKey);
        }
      }

      this.zones.set(zoneKey, {
        x: zoneX * this.options.zoneSize,
        z: zoneZ * this.options.zoneSize,
        visits: 1,
        duration: this.options.trackingInterval,
        lastVisit: now,
      });
    }

    // Add to heatmap
    this.heatmap.push({
      x,
      z,
      intensity: 1,
      timestamp: now,
      world: this.currentWorld,
    });

    // Limit heatmap size
    if (this.heatmap.length > 10000) {
      this.heatmap = this.heatmap.slice(-5000);
    }

    // Track 3D interaction
    analytics.interaction3D('movement', this.currentWorld, { x, z });
  }

  // Called when player interacts with an object
  trackInteraction(
    objectId: string,
    type: string,
    position?: { x: number; y: number; z: number }
  ): void {
    const key = `${objectId}_${this.currentWorld}`;
    const existing = this.interactions.get(key);

    if (existing) {
      existing.count++;
      existing.lastInteraction = Date.now();
    } else {
      this.interactions.set(key, {
        objectId,
        type,
        world: this.currentWorld,
        count: 1,
        lastInteraction: Date.now(),
        position,
      });
    }

    // Update world interaction count
    const stats = this.worldStats.get(this.currentWorld);
    if (stats) {
      stats.interactions++;
    }

    // Track via analytics
    analytics.interaction3D(type, this.currentWorld, position ? { x: position.x, z: position.z } : undefined);
  }

  // Get zones explored by world
  getZones(world?: WorldType): ZoneData[] {
    return Array.from(this.zones.values()).filter((zone) => {
      if (!world) return true;
      // Determine which world this zone belongs to based on coordinates
      // Dev world is typically x < 0, Art world is x >= 0 (adjust based on your world setup)
      return world === 'dev' ? zone.x < 0 : zone.x >= 0;
    });
  }

  // Get heatmap data
  getHeatmap(world?: WorldType, timeRange?: { start: number; end: number }): HeatmapPoint[] {
    let points = this.heatmap;

    if (world) {
      points = points.filter((p) => p.world === world);
    }

    if (timeRange) {
      points = points.filter((p) => p.timestamp >= timeRange.start && p.timestamp <= timeRange.end);
    }

    return points;
  }

  // Get aggregated heatmap data (intensity per zone)
  getAggregatedHeatmap(world?: WorldType, gridSize = 5): Array<{ x: number; z: number; intensity: number }> {
    const intensityMap = new Map<string, number>();

    const points = this.getHeatmap(world);
    points.forEach((point) => {
      const zoneX = Math.floor(point.x / gridSize) * gridSize;
      const zoneZ = Math.floor(point.z / gridSize) * gridSize;
      const key = `${zoneX},${zoneZ}`;

      intensityMap.set(key, (intensityMap.get(key) ?? 0) + 1);
    });

    return Array.from(intensityMap.entries()).map(([key, intensity]) => {
      const [x, z] = key.split(',').map(Number);
      return { x, z, intensity };
    });
  }

  // Get time spent per world
  getWorldTime(): Map<WorldType, number> {
    const times = new Map<WorldType, number>();

    this.worldStats.forEach((stats, world) => {
      let totalTime = stats.totalTime;
      // Add current world's active time
      if (world === this.currentWorld) {
        totalTime += Date.now() - this.worldStartTime;
      }
      times.set(world, totalTime);
    });

    return times;
  }

  // Get world statistics
  getWorldStats(world: WorldType): WorldStats | undefined {
    const stats = this.worldStats.get(world);
    if (!stats) return undefined;

    // Return a copy with updated time for current world
    const totalTime = stats.totalTime +
      (world === this.currentWorld ? Date.now() - this.worldStartTime : 0);

    return {
      ...stats,
      totalTime,
    };
  }

  // Get objects interacted with
  getInteractions(world?: WorldType, type?: string): InteractionData[] {
    return Array.from(this.interactions.values()).filter((interaction) => {
      if (world && interaction.world !== world) return false;
      if (type && interaction.type !== type) return false;
      return true;
    });
  }

  // Get world switch count
  getWorldSwitchCount(): number {
    let count = 0;
    this.worldStats.forEach((stats) => {
      count += stats.visitCount;
    });
    return Math.max(0, count - 1); // Subtract initial entry
  }

  // Get exploration percentage
  getExplorationPercentage(world: WorldType, worldBounds: { minX: number; maxX: number; minZ: number; maxZ: number }): number {
    const totalZones = Math.ceil((worldBounds.maxX - worldBounds.minX) / this.options.zoneSize) *
      Math.ceil((worldBounds.maxZ - worldBounds.minZ) / this.options.zoneSize);

    const exploredZones = this.getZones(world).length;
    return totalZones > 0 ? (exploredZones / totalZones) * 100 : 0;
  }

  // Export all data
  exportData() {
    return {
      worldStats: Array.from(this.worldStats.values()),
      zones: Array.from(this.zones.values()),
      interactions: Array.from(this.interactions.values()),
      heatmap: this.heatmap,
      worldSwitchCount: this.getWorldSwitchCount(),
      exportedAt: Date.now(),
    };
  }

  // Clear all tracking data
  clear(): void {
    this.zones.clear();
    this.interactions.clear();
    this.heatmap = [];
    this.worldStartTime = Date.now();

    // Reset world stats but keep visit counts
    this.worldStats.forEach((stats, world) => {
      stats.totalTime = 0;
      stats.interactions = 0;
      if (world === this.currentWorld) {
        stats.lastVisit = Date.now();
      }
    });
  }
}

// Singleton instance
let trackerInstance: InteractionTracker | null = null;

export function getInteractionTracker(): InteractionTracker {
  if (!trackerInstance) {
    trackerInstance = new InteractionTracker();
  }
  return trackerInstance;
}

export type {
  ZoneData,
  InteractionData,
  WorldStats,
  HeatmapPoint,
  InteractionTrackerOptions,
};
