// 3D Heatmap Visualization Component

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, Info } from 'lucide-react';
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
    const color = new THREE.Color();

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
  const color = worldType === 'dev' ? '#8b5cf6' : '#3b82f6';
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
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.3, 0.6]} />
        <meshStandardMaterial color="#f59e0b" />
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
  // Cold blue -> Green -> Yellow -> Hot red gradient
  const maxIntensity = 10;
  const normalized = Math.min(intensity / maxIntensity, 1);

  if (normalized < 0.25) {
    return new THREE.Color().lerpColors(
      new THREE.Color(0x3b82f6),
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
      new THREE.Color(0xf59e0b),
      (normalized - 0.5) * 4
    );
  } else {
    return new THREE.Color().lerpColors(
      new THREE.Color(0xf59e0b),
      new THREE.Color(0xef4444),
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
  }, [worldType, timePeriod]);

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
      <Card className="border-white/10 bg-slate-900/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-white">
              Heatmap {worldType === 'dev' ? 'Dev World' : 'Art World'}
            </h3>
            <Badge variant="outline" className="bg-slate-800 text-slate-300">
              {totalInteractions} interactions
            </Badge>
            {maxIntensity > 0 && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                Max intensité: {maxIntensity.toFixed(1)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportImage}
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 border-b border-white/10 p-4">
          <Tabs value={worldType} onValueChange={(v) => setWorldType(v as WorldType)}>
            <TabsList className="bg-slate-800/50 border-white/10">
              <TabsTrigger value="dev" className="data-[state=active]:bg-violet-500/20">
                Dev World
              </TabsTrigger>
              <TabsTrigger value="art" className="data-[state=active]:bg-blue-500/20">
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
                        ? 'bg-violet-500 text-white'
                        : 'border-white/10 text-white hover:bg-white/5'
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
        <div className="relative">
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
          <div className="absolute bottom-4 right-4 rounded-lg bg-slate-900/90 border border-white/10 p-3">
            <p className="mb-2 text-xs font-medium text-slate-400">Intensité</p>
            <div className="flex items-center gap-1">
              <div className="h-2 w-6 rounded-l bg-blue-500" />
              <div className="h-2 w-6 bg-cyan-500" />
              <div className="h-2 w-6 bg-green-500" />
              <div className="h-2 w-6 bg-yellow-500" />
              <div className="h-2 w-6 rounded-r bg-red-500" />
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>Faible</span>
              <span>Élevée</span>
            </div>
          </div>

          {/* Selected Point Details */}
          {selectedPoint && showDetails && (
            <div className="absolute top-4 right-4 w-64 rounded-lg bg-slate-900/95 border border-white/10 p-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Détails</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Position</span>
                  <span className="text-white">
                    ({selectedPoint.position[0].toFixed(1)}, {selectedPoint.position[2].toFixed(1)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Intensité</span>
                  <span className="text-white">{selectedPoint.intensity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monde</span>
                  <span className="text-white capitalize">{worldType}</span>
                </div>
              </div>
            </div>
          )}

          {/* Info Tooltip */}
          <div className="absolute top-4 left-4">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 bg-slate-900/50 text-white hover:bg-white/5"
            >
              <Info className="mr-2 h-4 w-4" />
              Cliquez pour voir les détails
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 border-t border-white/10 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalInteractions}</p>
            <p className="text-xs text-slate-400">Interactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{new Set(rawPoints.map((p) => `${Math.floor(p.x)},${Math.floor(p.z)}`)).size}</p>
            <p className="text-xs text-slate-400">Zones visitées</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{maxIntensity.toFixed(1)}</p>
            <p className="text-xs text-slate-400">Intensité max</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{rawPoints.length > 0 ? (rawPoints.reduce((sum, p) => sum + p.intensity, 0) / rawPoints.length).toFixed(1) : 0}</p>
            <p className="text-xs text-slate-400">Intensité moyenne</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
