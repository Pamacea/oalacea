// 3D Heatmap Visualization Component

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Info } from 'lucide-react';
import { getInteractionTracker, type HeatmapPoint } from '@/core/3d/analytics';

interface HeatmapVisualizationProps {
  className?: string;
}

type WorldType = 'dev' | 'art';
type TimePeriod = 'today' | 'week' | 'month' | 'all';

interface HeatmapDataPoint {
  position: [number, number, number];
  intensity: number;
  color: THREE.Color;
}

// Heatmap plane component
function HeatmapPlane({
  points,
  opacity = 0.7,
}: {
  points: HeatmapDataPoint[];
  opacity?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;

    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    // Create a grid of vertices
    const gridSize = 50;
    const worldSize = 100;
    const step = worldSize / gridSize;

    for (let x = 0; x <= gridSize; x++) {
      for (let z = 0; z <= gridSize; z++) {
        const worldX = (x * step) - (worldSize / 2);
        const worldZ = (z * step) - (worldSize / 2);

        positions.push(worldX, 0.1, worldZ);

        // Calculate intensity at this point
        const intensity = calculateIntensity(worldX, worldZ, points);
        const color = getHeatmapColor(intensity);

        colors.push(color.r, color.g, color.b);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // Create indices for triangles
    const indices: number[] = [];
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const i = x * (gridSize + 1) + z;
        indices.push(i, i + 1, i + gridSize + 1);
        indices.push(i + 1, i + gridSize + 2, i + gridSize + 1);
      }
    }

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    meshRef.current.geometry = geometry;
  }, [points]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        vertexColors
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Individual heatmap point component
function HeatmapPoints({ points }: { points: HeatmapDataPoint[] }) {
  const instancedMesh = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!instancedMesh.current) return;

    const matrix = new THREE.Matrix4();

    points.forEach((point, i) => {
      matrix.setPosition(point.position[0], point.position[1], point.position[2]);
      instancedMesh.current!.setMatrixAt(i, matrix);
      instancedMesh.current!.setColorAt(i, point.color);
    });

    instancedMesh.current.instanceMatrix.needsUpdate = true;
    if (instancedMesh.current.instanceColor) {
      instancedMesh.current.instanceColor.needsUpdate = true;
    }
  }, [points]);

  return (
    <instancedMesh
      ref={instancedMesh}
      args={[new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshStandardMaterial({ vertexColors: true }), points.length]}
    >
    </instancedMesh>
  );
}

// Grid helper component
function WorldGrid({ worldType }: { worldType: WorldType }) {
  const color = worldType === 'dev' ? '#9a1115' : '#b8a646'; // imperium-crimson or imperium-gold
  const gridSize = 100;
  const divisions = 20;

  return (
    <gridHelper
      args={[gridSize, divisions, color, `${color}40`]}
      position={[0, 0.05, 0]}
    />
  );
}

// Interactive marker for selected point
function InteractionMarker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color="#b8a646" emissive="#b8a646" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.3, 0.6]} />
        <meshStandardMaterial color="#b8a646" />
      </mesh>
    </group>
  );
}

// Scene component
function HeatmapScene({
  worldType,
  heatmapData,
  selectedPoint,
}: {
  worldType: WorldType;
  heatmapData: HeatmapDataPoint[];
  selectedPoint: HeatmapDataPoint | null;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <WorldGrid worldType={worldType} />
      <HeatmapPlane points={heatmapData} />
      <HeatmapPoints points={heatmapData.slice(0, 500)} />
      {selectedPoint && <InteractionMarker position={selectedPoint.position} />}
    </group>
  );
}

// Helper functions
function calculateIntensity(x: number, z: number, points: HeatmapDataPoint[]): number {
  const radius = 5;
  let totalIntensity = 0;
  let weight = 0;

  points.forEach((point) => {
    const dx = point.position[0] - x;
    const dz = point.position[2] - z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < radius) {
      const gaussianWeight = Math.exp(-(distance * distance) / (2 * (radius / 3) * (radius / 3)));
      totalIntensity += point.intensity * gaussianWeight;
      weight += gaussianWeight;
    }
  });

  return weight > 0 ? totalIntensity / weight : 0;
}

function getHeatmapColor(intensity: number): THREE.Color {
  // Cold blue -> Green -> Yellow -> Hot red gradient (with imperium colors)
  const maxIntensity = 10;
  const normalized = Math.min(intensity / maxIntensity, 1);

  if (normalized < 0.25) {
    return new THREE.Color().lerpColors(
      new THREE.Color(0x2a3a5a), // warp blue
      new THREE.Color(0x06b6d4),
      normalized * 4
    );
  } else if (normalized < 0.5) {
    return new THREE.Color().lerpColors(
      new THREE.Color(0x06b6d4),
      new THREE.Color(0x10b981),
      (normalized - 0.25) * 4
    );
  } else if (normalized < 0.75) {
    return new THREE.Color().lerpColors(
      new THREE.Color(0x10b981),
      new THREE.Color(0xb8a646), // imperium-gold
      (normalized - 0.5) * 4
    );
  } else {
    return new THREE.Color().lerpColors(
      new THREE.Color(0xb8a646), // imperium-gold
      new THREE.Color(0x9a1115), // imperium-crimson
      (normalized - 0.75) * 4
    );
  }
}

function filterPointsByTimePeriod(points: HeatmapPoint[], period: TimePeriod): HeatmapPoint[] {
  const now = Date.now();
  let startTime: number;

  switch (period) {
    case 'today':
      startTime = now - 24 * 60 * 60 * 1000;
      break;
    case 'week':
      startTime = now - 7 * 24 * 60 * 60 * 1000;
      break;
    case 'month':
      startTime = now - 30 * 24 * 60 * 60 * 1000;
      break;
    default:
      return points;
  }

  return points.filter((p) => p.timestamp >= startTime);
}

function convertToHeatmapData(points: HeatmapPoint[]): HeatmapDataPoint[] {
  return points.map((point) => ({
    position: [point.x, 0.5, point.z],
    intensity: point.intensity,
    color: getHeatmapColor(point.intensity),
  }));
}

export function HeatmapVisualization({ className }: HeatmapVisualizationProps) {
  const [worldType, setWorldType] = useState<WorldType>('dev');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [selectedPoint, setSelectedPoint] = useState<HeatmapDataPoint | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tracker = getInteractionTracker();
  const rawPoints = useMemo(() => {
    const points = tracker.getHeatmap(worldType);
    return filterPointsByTimePeriod(points, timePeriod);
  }, [worldType, timePeriod, tracker]);

  const heatmapData = useMemo(() => convertToHeatmapData(rawPoints), [rawPoints]);

  const totalInteractions = rawPoints.length;
  const maxIntensity = Math.max(...rawPoints.map((p) => p.intensity), 0);

  const handleExportImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `heatmap-${worldType}-${timePeriod}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Find closest point
    let closest: HeatmapDataPoint | null = null;
    let minDistance = Infinity;

    heatmapData.forEach((point) => {
      const px = point.position[0] / 50;
      const pz = point.position[2] / 50;
      const distance = Math.sqrt((x - px) ** 2 + (y - pz) ** 2);

      if (distance < minDistance && distance < 0.1) {
        minDistance = distance;
        closest = point;
      }
    });

    setSelectedPoint(closest);
    if (closest) {
      setShowDetails(true);
    }
  };

  return (
    <div className={className}>
      <Card variant="steel" className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-imperium-steel-dark bg-imperium-black p-4">
          <div className="flex items-center gap-4">
            <h3 className="font-display text-lg uppercase tracking-wider text-imperium-crimson">
              Heatmap [{worldType === 'dev' ? 'Dev World' : 'Art World'}]
            </h3>
            <Badge variant="outline" className="border-imperium-steel-dark bg-imperium-iron text-imperium-bone">
              {totalInteractions} interactions
            </Badge>
            {maxIntensity > 0 && (
              <Badge variant="outline" className="border-imperium-gold bg-imperium-gold/10 text-imperium-gold">
                Max intensity: {maxIntensity.toFixed(1)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportImage}
              className="border-imperium-steel-dark font-terminal text-imperium-bone hover:bg-imperium-iron"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 border-b-2 border-imperium-steel-dark bg-imperium-black p-4">
          <Tabs value={worldType} onValueChange={(v) => setWorldType(v as WorldType)}>
            <TabsList className="bg-imperium-black border-2 border-imperium-steel-dark">
              <TabsTrigger value="dev" className="data-[state=active]:bg-imperium-crimson data-[state=active]:text-imperium-bone font-terminal">
                Dev World
              </TabsTrigger>
              <TabsTrigger value="art" className="data-[state=active]:bg-imperium-gold data-[state=active]:text-imperium-black font-terminal">
                Art World
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            {(timePeriod === 'today' || timePeriod === 'week' || timePeriod === 'month' || timePeriod === 'all') && (
              <>
                {(['today', 'week', 'month', 'all'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={timePeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimePeriod(period)}
                    className={
                      timePeriod === period
                        ? 'bg-imperium-crimson text-imperium-bone font-terminal'
                        : 'border-imperium-steel-dark font-terminal text-imperium-steel hover:bg-imperium-iron'
                    }
                  >
                    {period === 'today' && "Aujourd'hui"}
                    {period === 'week' && '7 jours'}
                    {period === 'month' && '30 jours'}
                    {period === 'all' && 'Tout'}
                  </Button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* 3D View */}
        <div className="relative bg-imperium-black">
          <div
            className="h-[400px] w-full cursor-crosshair"
            onClick={handleCanvasClick}
          >
            <Canvas
              ref={canvasRef}
              camera={{ position: [0, 40, 40], fov: 50 }}
              gl={{ preserveDrawingBuffer: true }}
            >
              <HeatmapScene
                worldType={worldType}
                heatmapData={heatmapData}
                selectedPoint={selectedPoint}
              />
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxPolarAngle={Math.PI / 2}
                minDistance={10}
                maxDistance={100}
              />
            </Canvas>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 rounded-none border-2 border-imperium-steel-dark bg-imperium-black/95 p-3 shadow-[4px_4px_0_rgba(148,148,148,0.3)]">
            <p className="mb-2 font-terminal text-xs text-imperium-steel-dark">{'>'} Intensity</p>
            <div className="flex items-center gap-1">
              <div className="h-2 w-6 border-l-2 border-imperium-warp bg-imperium-warp" />
              <div className="h-2 w-6 bg-cyan-500" />
              <div className="h-2 w-6 bg-green-500" />
              <div className="h-2 w-6 bg-imperium-gold" />
              <div className="h-2 w-6 border-r-2 border-imperium-crimson bg-imperium-crimson" />
            </div>
            <div className="mt-1 flex justify-between font-terminal text-xs text-imperium-steel-dark">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Selected Point Details */}
          {selectedPoint && showDetails && (
            <div className="absolute top-4 right-4 w-64 rounded-none border-2 border-imperium-crimson bg-imperium-black/95 p-4 shadow-[8px_8px_0_rgba(154,17,21,0.4)]">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-display uppercase text-imperium-crimson text-sm">{'>'} Details</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="h-6 w-6 p-0 font-terminal text-imperium-steel hover:text-imperium-crimson"
                >
                  ×
                </Button>
              </div>
              <div className="space-y-2 font-terminal text-sm">
                <div className="flex justify-between">
                  <span className="text-imperium-steel-dark">Position</span>
                  <span className="text-imperium-bone">
                    ({selectedPoint.position[0].toFixed(1)}, {selectedPoint.position[2].toFixed(1)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-imperium-steel-dark">Intensity</span>
                  <span className="text-imperium-bone">{selectedPoint.intensity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-imperium-steel-dark">World</span>
                  <span className="text-imperium-gold capitalize">{worldType}</span>
                </div>
              </div>
            </div>
          )}

          {/* Info Tooltip */}
          <div className="absolute top-4 left-4">
            <Button
              variant="outline"
              size="sm"
              className="border-imperium-steel-dark bg-imperium-black/50 font-terminal text-imperium-bone hover:bg-imperium-iron"
            >
              <Info className="mr-2 h-4 w-4" />
              Click for details
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 border-t-2 border-imperium-steel-dark bg-imperium-black p-4">
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-imperium-crimson">{totalInteractions}</p>
            <p className="font-terminal text-xs text-imperium-steel-dark">Interactions</p>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-imperium-gold">{new Set(rawPoints.map((p) => `${Math.floor(p.x)},${Math.floor(p.z)}`)).size}</p>
            <p className="font-terminal text-xs text-imperium-steel-dark">Zones visited</p>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-imperium-crimson">{maxIntensity.toFixed(1)}</p>
            <p className="font-terminal text-xs text-imperium-steel-dark">Max intensity</p>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl font-bold text-imperium-gold">{rawPoints.length > 0 ? (rawPoints.reduce((sum, p) => sum + p.intensity, 0) / rawPoints.length).toFixed(1) : 0}</p>
            <p className="font-terminal text-xs text-imperium-steel-dark">Avg intensity</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
