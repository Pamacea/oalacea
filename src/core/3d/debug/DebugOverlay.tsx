// Debug Overlay - Visual debugging for collision zones and pathfinding
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import type { HitboxShape } from '@/core/3d/physics/engine/hitboxes/HitboxShape';

// ============================================
// TYPES
// ============================================

export interface DebugOverlayProps {
  show?: boolean;
  obstacles?: Array<{
    id: string;
    hitbox: HitboxShape;
    position: Vector3;
    name?: string;
  }>;
  currentPath?: Vector3[];
  characterPosition?: Vector3;
  targetPosition?: Vector3;
  spatialGrid?: {
    cellSize: number;
    cols: number;
    rows: number;
    worldMin: number;
    worldMax: number;
  };
}

// ============================================
// COMPONENTS
// ============================================

/**
 * Wireframe box hitbox visualization
 */
function BoxHitboxDebug({
  position,
  size,
  rotation = 0,
  color = 0xff0000,
}: {
  position: Vector3;
  size: [number, number, number];
  rotation?: number;
  color?: number;
}) {
  const [width, height, depth] = size;
  const halfW = width / 2;
  const halfH = height / 2;
  const halfD = depth / 2;

  const edgePoints = useMemo(() => {
    // Box edges (12 edges, 2 points each = 24 points)
    const edges: number[][] = [
      // Bottom face
      [-halfW, -halfH, -halfD],
      [halfW, -halfH, -halfD],
      [halfW, -halfH, -halfD],
      [halfW, -halfH, halfD],
      [halfW, -halfH, halfD],
      [-halfW, -halfH, halfD],
      [-halfW, -halfH, halfD],
      [-halfW, -halfH, -halfD],
      // Top face
      [-halfW, halfH, -halfD],
      [halfW, halfH, -halfD],
      [halfW, halfH, -halfD],
      [halfW, halfH, halfD],
      [halfW, halfH, halfD],
      [-halfW, halfH, halfD],
      [-halfW, halfH, halfD],
      [-halfW, halfH, -halfD],
      // Vertical edges
      [-halfW, -halfH, -halfD],
      [-halfW, halfH, -halfD],
      [halfW, -halfH, -halfD],
      [halfW, halfH, -halfD],
      [halfW, -halfH, halfD],
      [halfW, halfH, halfD],
      [-halfW, -halfH, halfD],
      [-halfW, halfH, halfD],
    ];
    return new Float32Array(edges.flat());
  }, [halfW, halfH, halfD]);

  return (
    <group position={[position.x, position.y, position.z]} rotation={[0, rotation, 0]}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[edgePoints, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={2} />
      </lineSegments>
    </group>
  );
}

/**
 * Path line visualization
 */
function PathDebug({
  path,
  color = 0x00ff00,
}: {
  path: Vector3[];
  color?: number;
}) {
  // useMemo must be called before any early return to follow rules of hooks
  const pathPoints = useMemo(() => {
    const pts: number[] = [];
    for (const p of path) {
      pts.push(p.x, p.y + 0.1, p.z);
    }
    return new Float32Array(pts);
  }, [path]);

  if (!path || path.length < 2) return null;

  return (
    <>
      {/* Path line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pathPoints, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} linewidth={3} />
      </line>

      {/* Waypoint markers */}
      {path.map((p, i) => (
        <mesh key={i} position={[p.x, p.y + 0.2, p.z]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={i === path.length - 1 ? 0xffff00 : 0x00ff00} />
        </mesh>
      ))}
    </>
  );
}

/**
 * Spatial grid visualization
 */
function SpatialGridDebug({
  cellSize,
  cols,
  rows,
  worldMin,
  worldMax,
}: {
  cellSize: number;
  cols: number;
  rows: number;
  worldMin: number;
  worldMax: number;
}) {
  const gridLines = useMemo(() => {
    const lines: number[] = [];

    // Horizontal lines (every 5 cells)
    for (let i = 0; i <= rows; i += 5) {
      const z = worldMin + i * cellSize;
      lines.push(worldMin, 0.05, z, worldMax, 0.05, z);
    }

    // Vertical lines (every 5 cells)
    for (let i = 0; i <= cols; i += 5) {
      const x = worldMin + i * cellSize;
      lines.push(x, 0.05, worldMin, x, 0.05, worldMax);
    }

    return new Float32Array(lines);
  }, [cellSize, cols, rows, worldMin, worldMax]);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[gridLines, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color={0x444444} transparent opacity={0.3} />
    </lineSegments>
  );
}

/**
 * Character position indicator
 */
function CharacterIndicator({ position }: { position: Vector3 }) {
  const ringRef = useRef<Group>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group position={[position.x, 0.1, position.z]}>
      {/* Rotating ring */}
      <group ref={ringRef}>
        <mesh>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshBasicMaterial color={0x00ffff} side={2} transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Center dot */}
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={0x00ffff} />
      </mesh>
    </group>
  );
}

/**
 * Target position indicator
 */
function TargetIndicator({ position }: { position: Vector3 }) {
  const ringRef = useRef<Group>(null);

  useFrame((state) => {
    if (ringRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  const crossPoints = useMemo(() => {
    return new Float32Array([
      -0.3, 0, 0,
      0.3, 0, 0,
      0, 0, -0.3,
      0, 0, 0.3,
    ]);
  }, []);

  return (
    <group position={[position.x, 0.1, position.z]}>
      {/* Pulsing ring */}
      <group ref={ringRef}>
        <mesh>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color={0xffff00} side={2} transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Cross marker */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[crossPoints, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0xffff00} linewidth={2} />
      </lineSegments>
    </group>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Debug overlay for visualizing collision zones, paths, and spatial grid.
 */
export function DebugOverlay({
  show = false,
  obstacles = [],
  currentPath = [],
  characterPosition,
  targetPosition,
  spatialGrid,
}: DebugOverlayProps) {
  if (!show) return null;

  return (
    <group name="debug-overlay">
      {/* Spatial grid */}
      {spatialGrid && (
        <SpatialGridDebug
          cellSize={spatialGrid.cellSize}
          cols={spatialGrid.cols}
          rows={spatialGrid.rows}
          worldMin={spatialGrid.worldMin}
          worldMax={spatialGrid.worldMax}
        />
      )}

      {/* Obstacle hitboxes */}
      {obstacles.map((obs) => {
        const bounds = obs.hitbox.getBounds();
        const center = new Vector3(
          (bounds.min.x + bounds.max.x) / 2,
          (bounds.min.y + bounds.max.y) / 2,
          (bounds.min.z + bounds.max.z) / 2
        );
        const size = [
          bounds.max.x - bounds.min.x,
          bounds.max.y - bounds.min.y,
          bounds.max.z - bounds.min.z,
        ] as [number, number, number];

        return (
          <BoxHitboxDebug
            key={obs.id}
            position={center}
            size={size}
            color={obs.id.includes('npc') ? 0x00ff00 : 0xff0000}
          />
        );
      })}

      {/* Current path */}
      {currentPath.length > 0 && <PathDebug path={currentPath} color={0x00ff00} />}

      {/* Character position */}
      {characterPosition && <CharacterIndicator position={characterPosition} />}

      {/* Target position */}
      {targetPosition && <TargetIndicator position={targetPosition} />}

      {/* Ground plane for reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial
          color={0x333333}
          transparent
          opacity={0.2}
          side={2}
        />
      </mesh>
    </group>
  );
}

// ============================================
// TEXT OVERLAY (HTML)
// ============================================

export interface DebugStatsProps {
  pathCacheStats?: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
  pathfinding?: {
    pathLength: number;
    calculationTime: number;
  };
  character?: {
    position: [number, number, number];
    velocity: [number, number, number];
    isMoving: boolean;
  };
}

/**
 * HTML overlay for debug statistics
 */
export function DebugStats({
  pathCacheStats,
  pathfinding,
  character,
}: DebugStatsProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        left: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#0f0',
        padding: '12px',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 1000,
        minWidth: '200px',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#fff' }}>
        🔧 DEBUG STATS
      </div>

      {/* Path Cache Stats */}
      {pathCacheStats && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ color: '#0ff', fontWeight: 'bold' }}>Path Cache:</div>
          <div>Size: {pathCacheStats.size}</div>
          <div>
            Hits: {pathCacheStats.hits} | Misses: {pathCacheStats.misses}
          </div>
          <div>Hit Rate: {(pathCacheStats.hitRate * 100).toFixed(1)}%</div>
        </div>
      )}

      {/* Pathfinding Stats */}
      {pathfinding && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ color: '#0ff', fontWeight: 'bold' }}>Pathfinding:</div>
          <div>Path Length: {pathfinding.pathLength} waypoints</div>
          <div>Calc Time: {pathfinding.calculationTime.toFixed(2)}ms</div>
        </div>
      )}

      {/* Character Stats */}
      {character && (
        <div>
          <div style={{ color: '#0ff', fontWeight: 'bold' }}>Character:</div>
          <div>
            Pos: [{character.position.map((v) => v.toFixed(1)).join(', ')}]
          </div>
          <div>
            Vel: [{character.velocity.map((v) => v.toFixed(2)).join(', ')}]
          </div>
          <div>Moving: {character.isMoving ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
}
