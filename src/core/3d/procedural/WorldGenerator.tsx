// Procedural World Generator - EXPERIMENTAL
// Generates infinite worlds with seeds, buildings, and biomes

'use client';

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, InstancedMesh, Mesh, Vector3, Color, Object3D, BufferAttribute } from 'three';
import { Text } from '@react-three/drei';

// Seeded random number generator (Mulberry32)
function createSeededRandom(seed: string): () => number {
  // Convert string to numeric seed
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  let state = h;

  return () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Perlin-like noise implementation
class NoiseGenerator {
  private random: () => number;
  private permutation: number[] = [];

  constructor(seed: string) {
    this.random = createSeededRandom(seed);
    this.initPermutation();
  }

  private initPermutation(): void {
    this.permutation = Array.from({ length: 256 }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }
    // Double the permutation
    this.permutation = [...this.permutation, ...this.permutation];
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const A = this.permutation[X] + Y;
    const B = this.permutation[X + 1] + Y;

    return this.lerp(
      this.lerp(this.grad(this.permutation[A], x, y), this.grad(this.permutation[B], x - 1, y), u),
      this.lerp(this.grad(this.permutation[A + 1], x, y - 1), this.grad(this.permutation[B + 1], x - 1, y - 1), u),
      v
    );
  }

  // Fractal Brownian Motion for more interesting terrain
  fbm(x: number, y: number, octaves: number = 4): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.noise2D(x * frequency, y * frequency);
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return value / maxValue;
  }
}

// Biome types
export type BiomeType = 'cyber' | 'industrial' | 'nature' | 'art' | 'void';

export interface BiomeConfig {
  type: BiomeType;
  colors: {
    ground: string;
    building: string;
    accent: string;
    sky: string;
  };
  buildingDensity: number;
  maxHeight: number;
  hasVegetation: boolean;
  hasNeon: boolean;
}

const BIOMES: Record<BiomeType, BiomeConfig> = {
  cyber: {
    type: 'cyber',
    colors: {
      ground: '#0a0a1a',
      building: '#1a1a3a',
      accent: '#00ffff',
      sky: '#050510',
    },
    buildingDensity: 0.8,
    maxHeight: 8,
    hasVegetation: false,
    hasNeon: true,
  },
  industrial: {
    type: 'industrial',
    colors: {
      ground: '#2a2520',
      building: '#3a3530',
      accent: '#ff6600',
      sky: '#1a1815',
    },
    buildingDensity: 0.6,
    maxHeight: 5,
    hasVegetation: false,
    hasNeon: false,
  },
  nature: {
    type: 'nature',
    colors: {
      ground: '#1a3a1a',
      building: '#2a5a2a',
      accent: '#88ff88',
      sky: '#0a2a0a',
    },
    buildingDensity: 0.2,
    maxHeight: 2,
    hasVegetation: true,
    hasNeon: false,
  },
  art: {
    type: 'art',
    colors: {
      ground: '#1a1a2a',
      building: '#2a2a4a',
      accent: '#ff00ff',
      sky: '#0a0a1a',
    },
    buildingDensity: 0.4,
    maxHeight: 4,
    hasVegetation: false,
    hasNeon: true,
  },
  void: {
    type: 'void',
    colors: {
      ground: '#000000',
      building: '#0a0a0a',
      accent: '#333333',
      sky: '#000000',
    },
    buildingDensity: 0.1,
    maxHeight: 1,
    hasVegetation: false,
    hasNeon: false,
  },
};

// Get biome at position using noise
function getBiomeAtPosition(x: number, z: number, noise: NoiseGenerator): BiomeType {
  const biomeValue = noise.fbm(x * 0.02, z * 0.02, 2);

  if (biomeValue < -0.5) return 'void';
  if (biomeValue < -0.2) return 'industrial';
  if (biomeValue < 0.2) return 'cyber';
  if (biomeValue < 0.5) return 'art';
  return 'nature';
}

// Generate building at position
function generateBuilding(
  x: number,
  z: number,
  biome: BiomeConfig,
  noise: NoiseGenerator,
  seed: string
): { position: [number, number, number]; scale: [number, number, number]; color: string; type: string } | null {
  const buildingRandom = createSeededRandom(`${seed}-${x}-${z}`);

  if (buildingRandom() > biome.buildingDensity) return null;

  const height = Math.floor(buildingRandom() * biome.maxHeight) + 1;
  const width = buildingRandom() * 2 + 1;
  const depth = buildingRandom() * 2 + 1;

  const types = ['tower', 'block', 'pyramid', 'sphere'];
  const type = types[Math.floor(buildingRandom() * types.length)];

  // Vary accent color slightly
  const accentVariation = Math.floor(buildingRandom() * 40) - 20;

  return {
    position: [x * 5, height / 2, z * 5],
    scale: [width, height, depth],
    color: biome.colors.building,
    type,
  };
}

// World state interface
export interface WorldState {
  seed: string;
  loadedChunks: Set<string>;
  buildings: Array<{
    position: [number, number, number];
    scale: [number, number, number];
    color: string;
    type: string;
    biome: BiomeType;
  }>;
}

// Serialize world state to JSON
export function serializeWorldState(state: WorldState): string {
  return JSON.stringify({
    seed: state.seed,
    loadedChunks: Array.from(state.loadedChunks),
    buildings: state.buildings,
  });
}

// Deserialize world state from JSON
export function deserializeWorldState(json: string): WorldState {
  const data = JSON.parse(json);
  return {
    seed: data.seed,
    loadedChunks: new Set(data.loadedChunks),
    buildings: data.buildings,
  };
}

interface ProceduralTerrainProps {
  seed?: string;
  renderDistance?: number;
  chunkSize?: number;
  onWorldChange?: (state: WorldState) => void;
  playerPosition?: [number, number, number];
  lodEnabled?: boolean;
}

export function ProceduralTerrain({
  seed = 'default-world',
  renderDistance = 50,
  chunkSize = 10,
  onWorldChange,
  playerPosition = [0, 0, 0],
  lodEnabled = true,
}: ProceduralTerrainProps) {
  const groupRef = useRef<Group>(null);
  const noise = useMemo(() => new NoiseGenerator(seed), [seed]);
  const [worldState, setWorldState] = useState<WorldState>({
    seed,
    loadedChunks: new Set(),
    buildings: [],
  });

  // Generate chunks based on player position
  useEffect(() => {
    const [px, , pz] = playerPosition;
    const chunkX = Math.floor(px / (chunkSize * 5));
    const chunkZ = Math.floor(pz / (chunkSize * 5));

    const newLoadedChunks = new Set(worldState.loadedChunks);
    const newBuildings = [...worldState.buildings];
    let hasChanges = false;

    // Generate chunks around player
    for (let dx = -Math.ceil(renderDistance / chunkSize); dx <= Math.ceil(renderDistance / chunkSize); dx++) {
      for (let dz = -Math.ceil(renderDistance / chunkSize); dz <= Math.ceil(renderDistance / chunkSize); dz++) {
        const cx = chunkX + dx;
        const cz = chunkZ + dz;
        const chunkKey = `${cx},${cz}`;

        if (!newLoadedChunks.has(chunkKey)) {
          newLoadedChunks.add(chunkKey);
          hasChanges = true;

          // Generate buildings for this chunk
          for (let x = 0; x < chunkSize; x++) {
            for (let z = 0; z < chunkSize; z++) {
              const wx = cx * chunkSize + x;
              const wz = cz * chunkSize + z;
              const biome = getBiomeAtPosition(wx, wz, noise);
              const biomeConfig = BIOMES[biome];

              const building = generateBuilding(wx, wz, biomeConfig, noise, seed);
              if (building) {
                newBuildings.push({ ...building, biome });
              }
            }
          }
        }
      }
    }

    // Remove distant chunks
    const loadRange = Math.ceil(renderDistance / chunkSize) + 1;
    for (const chunkKey of newLoadedChunks) {
      const [cx, cz] = chunkKey.split(',').map(Number);
      if (Math.abs(cx - chunkX) > loadRange || Math.abs(cz - chunkZ) > loadRange) {
        newLoadedChunks.delete(chunkKey);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      const newState = { seed, loadedChunks: newLoadedChunks, buildings: newBuildings };
      setWorldState(newState);
      onWorldChange?.(newState);
    }
  }, [playerPosition, seed, chunkSize, renderDistance, noise, worldState, onWorldChange]);

  // Buildings instanced mesh
  const buildings = useMemo(() => worldState.buildings, [worldState.buildings]);

  return (
    <group ref={groupRef}>
      {/* Ground plane with biome colors */}
      <GroundPlane
        noise={noise}
        size={renderDistance * 2}
        playerPosition={playerPosition}
      />

      {/* Buildings */}
      <Buildings buildings={buildings} lod={lodEnabled} />

      {/* Decorations based on biome */}
      <BiomeDecorations
        noise={noise}
        buildings={buildings}
        playerPosition={playerPosition}
        renderDistance={renderDistance}
      />
    </group>
  );
}

interface GroundPlaneProps {
  noise: NoiseGenerator;
  size: number;
  playerPosition: [number, number, number];
}

function GroundPlane({ noise, size, playerPosition }: GroundPlaneProps) {
  const meshRef = useRef<Mesh>(null);

  const colors = useMemo(() => {
    const segments = size;
    const vertexCount = (segments + 1) * (segments + 1);
    const vertexColors = new Float32Array(vertexCount * 3);
    const [px, , pz] = playerPosition;

    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = (i / segments - 0.5) * size + px;
        const z = (j / segments - 0.5) * size + pz;
        const biome = getBiomeAtPosition(x, z, noise);
        const color = new Color(BIOMES[biome].colors.ground);

        const idx = (i * (segments + 1) + j) * 3;
        vertexColors[idx] = color.r;
        vertexColors[idx + 1] = color.g;
        vertexColors[idx + 2] = color.b;
      }
    }

    return vertexColors;
  }, [noise, size, playerPosition]);

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[playerPosition[0], -0.1, playerPosition[2]]}
      receiveShadow
    >
      <planeGeometry args={[size, size, size, size]}>
        <primitive
          object={new BufferAttribute(colors, 3)}
          attach="attributes-color"
        />
      </planeGeometry>
      <meshStandardMaterial vertexColors roughness={0.9} />
    </mesh>
  );
}

interface BuildingsProps {
  buildings: BuildingData[];
  lod: boolean;
}

type BuildingData = {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  type: string;
  biome: BiomeType;
  building?: BuildingData;
};

interface BiomeDecorationData {
  position: [number, number, number];
  type: string;
  color: string;
  biome: BiomeType;
}

function Buildings({ buildings, lod }: BuildingsProps) {
  // Group buildings by type for instanced rendering
  const byType = useMemo(() => {
    const groups: Record<string, typeof buildings> = {};
    for (const b of buildings) {
      if (!groups[b.type]) groups[b.type] = [];
      groups[b.type].push(b);
    }
    return groups;
  }, [buildings]);

  return (
    <>
      {Object.entries(byType).map(([type, typeBuildings]) => (
        <BuildingGroup
          key={type}
          buildings={typeBuildings}
          type={type}
          lod={lod}
        />
      ))}
    </>
  );
}

interface BuildingGroupProps {
  buildings: BuildingData[];
  type: string;
  lod: boolean;
}

function BuildingGroup({ buildings, type, lod }: BuildingGroupProps) {
  const meshRef = useRef<InstancedMesh>(null);

  // Limit instances for performance
  const maxInstances = lod ? 500 : 1000;
  const visibleBuildings = buildings.slice(0, maxInstances);

  const dummy = useMemo(() => new Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;

    visibleBuildings.forEach((b, i) => {
      dummy.position.set(...b.position);
      dummy.scale.set(...b.scale);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [visibleBuildings, dummy]);

  if (visibleBuildings.length === 0) return null;

  // Geometry based on type
  const geometry = useMemo(() => {
    switch (type) {
      case 'tower':
        return <cylinderGeometry args={[0.5, 0.7, 1, 6]} />;
      case 'pyramid':
        return <coneGeometry args={[0.7, 1, 4]} />;
      case 'sphere':
        return <sphereGeometry args={[0.6, 8, 6]} />;
      case 'block':
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [type]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, visibleBuildings.length]}
      castShadow
      receiveShadow
    >
      {geometry}
      <meshStandardMaterial
        color={visibleBuildings[0]?.color || '#666666'}
        roughness={0.7}
        metalness={0.3}
      />
    </instancedMesh>
  );
}

interface BiomeDecorationsProps {
  noise: NoiseGenerator;
  buildings: BuildingData[];
  playerPosition: [number, number, number];
  renderDistance: number;
}

function BiomeDecorations({ noise, buildings, playerPosition, renderDistance }: BiomeDecorationsProps) {
  const decorations = useMemo(() => {
    const result: Array<{ position: [number, number, number]; type: string; color: string }> = [];
    const [px, , pz] = playerPosition;
    const decoRandom = createSeededRandom('decorations');

    // Add decorations near buildings
    for (const b of buildings) {
      const [bx, by, bz] = b.position;
      const dist = Math.sqrt((bx - px) ** 2 + (bz - pz) ** 2);
      if (dist > renderDistance) continue;

      const biome = BIOMES[b.biome as BiomeType];

      if (biome.hasNeon && decoRandom() > 0.7) {
        result.push({
          position: [bx + 1, by + 0.5, bz],
          type: 'neon',
          color: biome.colors.accent,
        });
      }

      if (biome.hasVegetation && decoRandom() > 0.5) {
        result.push({
          position: [bx + (decoRandom() - 0.5) * 3, 0, bz + (decoRandom() - 0.5) * 3],
          type: 'tree',
          color: '#228822',
        });
      }
    }

    return result.slice(0, 200); // Limit decorations
  }, [buildings, playerPosition, renderDistance]);

  return (
    <>
      {decorations.map((d, i) => (
        <group key={i} position={d.position}>
          {d.type === 'neon' && (
            <>
              <mesh>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={d.color} />
              </mesh>
              <pointLight color={d.color} intensity={0.5} distance={3} />
            </>
          )}
          {d.type === 'tree' && (
            <group>
              <mesh position={[0, 0.5, 0]}>
                <cylinderGeometry args={[0.1, 0.15, 1, 6]} />
                <meshStandardMaterial color="#4a3728" />
              </mesh>
              <mesh position={[0, 1.2, 0]}>
                <coneGeometry args={[0.4, 0.8, 6]} />
                <meshStandardMaterial color={d.color} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </>
  );
}

// World seed input component
interface WorldSeedInputProps {
  seed: string;
  onSeedChange: (seed: string) => void;
  onRegenerate: () => void;
}

export function WorldSeedInput({ seed, onSeedChange, onRegenerate }: WorldSeedInputProps) {
  return (
    <div className="fixed top-4 left-4 z-50 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-white/10">
      <h3 className="text-white font-medium mb-2">World Generator</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={seed}
          onChange={(e) => onSeedChange(e.target.value)}
          placeholder="Enter seed..."
          className="px-3 py-2 bg-white/10 rounded text-white text-sm border border-white/20 focus:border-white/40 outline-none"
        />
        <button
          type="button"
          onClick={onRegenerate}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors"
        >
          Generate
        </button>
      </div>
      <div className="text-white/50 text-xs mt-2">
        Same seed = same world
      </div>
    </div>
  );
}

// Mini-map component
interface WorldMinimapProps {
  buildings: BuildingData[];
  playerPosition: [number, number, number];
  size?: number;
}

export function WorldMinimap({ buildings, playerPosition, size = 150 }: WorldMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, size, size);

    const scale = size / 100;
    const [px, , pz] = playerPosition;

    // Draw buildings
    for (const b of buildings) {
      const [bx, , bz] = b.position;
      const dx = (bx - px) * scale + size / 2;
      const dz = (bz - pz) * scale + size / 2;

      if (dx < 0 || dx > size || dz < 0 || dz > size) continue;

      const biome = BIOMES[b.biome as BiomeType];
      ctx.fillStyle = biome.colors.building;
      ctx.fillRect(dx - 2, dz - 2, 4, 4);
    }

    // Draw player
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }, [buildings, playerPosition, size]);

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/10">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded"
        style={{ width: size / 2, height: size / 2 }}
      />
    </div>
  );
}

// Full procedural world component
interface ProceduralWorldProps {
  seed?: string;
  onSeedChange?: (seed: string) => void;
  playerPosition?: [number, number, number];
  renderDistance?: number;
}

export function ProceduralWorld({
  seed: initialSeed = 'oalacea-world',
  onSeedChange,
  playerPosition,
  renderDistance = 40,
}: ProceduralWorldProps) {
  const [seed, setSeed] = useState(initialSeed);
  const [worldState, setWorldState] = useState<WorldState | null>(null);

  const handleSeedChange = useCallback((newSeed: string) => {
    setSeed(newSeed);
    onSeedChange?.(newSeed);
  }, [onSeedChange]);

  const handleWorldChange = useCallback((state: WorldState) => {
    setWorldState(state);
  }, []);

  return (
    <>
      <WorldSeedInput
        seed={seed}
        onSeedChange={handleSeedChange}
        onRegenerate={() => setWorldState(null)}
      />
      {worldState && (
        <WorldMinimap
          buildings={worldState.buildings}
          playerPosition={playerPosition || [0, 0, 0]}
        />
      )}
      <ProceduralTerrain
        seed={seed}
        renderDistance={renderDistance}
        onWorldChange={handleWorldChange}
        playerPosition={playerPosition || [0, 0, 0]}
      />
    </>
  );
}
