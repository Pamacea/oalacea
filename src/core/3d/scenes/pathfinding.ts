// Système de pathfinding A* pour la navigation autour des obstacles
import { Vector3 } from 'three';
import type { CollisionZone } from './collisions';

// Taille d'une cellule de la grille de navigation
export const GRID_SIZE = 2;
// Limites de la zone de jeu
export const WORLD_MIN = -50;
export const WORLD_MAX = 50;

export interface GridNode {
  x: number;
  z: number;
  walkable: boolean;
  g: number; // Coût du départ à ce noeud
  h: number; // Heuristique (distance estimée à la cible)
  f: number; // g + h
  parent: GridNode | null;
}

// Grille de navigation
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
        const worldX = WORLD_MIN + x * GRID_SIZE;
        const worldZ = WORLD_MIN + z * GRID_SIZE;
        this.grid.set(this.getKey(x, z), {
          x,
          z,
          walkable: true,
          g: 0,
          h: 0,
          f: 0,
          parent: null,
        });
      }
    }
  }

  // Marquer les cellules comme non walkables selon les zones de collision
  updateCollisionZones(zones: CollisionZone[]): void {
    // Reset
    for (const node of this.grid.values()) {
      node.walkable = true;
    }

    // Marquer les cellules en collision
    for (const zone of zones) {
      const zoneRadius = zone.radius + 0.7; // + marge pour le personnage
      const centerGridX = Math.floor((zone.position[0] - WORLD_MIN) / GRID_SIZE);
      const centerGridZ = Math.floor((zone.position[2] - WORLD_MIN) / GRID_SIZE);
      const radiusInCells = Math.ceil(zoneRadius / GRID_SIZE);

      for (let dx = -radiusInCells; dx <= radiusInCells; dx++) {
        for (let dz = -radiusInCells; dz <= radiusInCells; dz++) {
          const cellX = centerGridX + dx;
          const cellZ = centerGridZ + dz;

          if (cellX >= 0 && cellX < this.cols && cellZ >= 0 && cellZ < this.rows) {
            // Vérifier si cette cellule est dans le rayon de collision
            const cellWorldX = WORLD_MIN + cellX * GRID_SIZE + GRID_SIZE / 2;
            const cellWorldZ = WORLD_MIN + cellZ * GRID_SIZE + GRID_SIZE / 2;
            const dist = Math.sqrt(
              Math.pow(cellWorldX - zone.position[0], 2) +
              Math.pow(cellWorldZ - zone.position[2], 2)
            );

            if (dist < zoneRadius) {
              const key = this.getKey(cellX, cellZ);
              const node = this.grid.get(key);
              if (node) {
                node.walkable = false;
              }
            }
          }
        }
      }
    }
  }

  // Convertir position monde en coordonnées grille
  worldToGrid(pos: Vector3): { x: number; z: number } {
    return {
      x: Math.floor((pos.x - WORLD_MIN) / GRID_SIZE),
      z: Math.floor((pos.z - WORLD_MIN) / GRID_SIZE),
    };
  }

  // Convertir coordonnées grille en position monde
  gridToWorld(x: number, z: number): Vector3 {
    return new Vector3(
      WORLD_MIN + x * GRID_SIZE + GRID_SIZE / 2,
      0.5,
      WORLD_MIN + z * GRID_SIZE + GRID_SIZE / 2
    );
  }

  // Vérifier si une position grille est valide
  isValid(x: number, z: number): boolean {
    return x >= 0 && x < this.cols && z >= 0 && z < this.rows;
  }

  // Vérifier si une position grille est walkable
  isWalkable(x: number, z: number): boolean {
    if (!this.isValid(x, z)) return false;
    const node = this.grid.get(this.getKey(x, z));
    return node?.walkable ?? false;
  }

  // A* Pathfinding
  findPath(start: Vector3, end: Vector3): Vector3[] {
    const startGrid = this.worldToGrid(start);
    const endGrid = this.worldToGrid(end);

    // Vérifier si la destination est valide
    if (!this.isValid(endGrid.x, endGrid.z) || !this.isWalkable(endGrid.x, endGrid.z)) {
      // Trouver la cellule walkable la plus proche
      const closest = this.findClosestWalkable(endGrid.x, endGrid.z);
      if (!closest) {
        // Pas de chemin possible, retour direct (le personnage s'arrêtera devant l'obstacle)
        return [end];
      }
      endGrid.x = closest.x;
      endGrid.z = closest.z;
    }

    // Si le départ n'est pas walkable, trouver le plus proche
    if (!this.isWalkable(startGrid.x, startGrid.z)) {
      const closest = this.findClosestWalkable(startGrid.x, startGrid.z);
      if (!closest) return [end];
      startGrid.x = closest.x;
      startGrid.z = closest.z;
    }

    // A*
    const openSet: GridNode[] = [];
    const closedSet = new Set<string>();

    const startNode: GridNode = {
      x: startGrid.x,
      z: startGrid.z,
      walkable: true,
      g: 0,
      h: this.heuristic(startGrid, endGrid),
      f: 0,
      parent: null,
    };
    startNode.f = startNode.g + startNode.h;
    openSet.push(startNode);

    while (openSet.length > 0) {
      // Trouver le noeud avec le plus petit f
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;
      const currentKey = this.getKey(current.x, current.z);

      // Arrivé à destination?
      if (current.x === endGrid.x && current.z === endGrid.z) {
        const path = this.reconstructPath(current);
        // Lisser le chemin (supprimer les noeuds intermédiaires inutiles)
        return this.smoothPath(path);
      }

      closedSet.add(currentKey);

      // Voisins (8 directions)
      const neighbors = this.getNeighbors(current.x, current.z);

      for (const neighbor of neighbors) {
        const neighborKey = this.getKey(neighbor.x, neighbor.z);

        if (closedSet.has(neighborKey) || !neighbor.walkable) {
          continue;
        }

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

    // Pas de chemin trouvé
    return [end];
  }

  private heuristic(a: { x: number; z: number }, b: { x: number; z: number }): number {
    // Distance euclidienne
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.z - b.z, 2));
  }

  private distance(a: GridNode, b: GridNode): number {
    // Distance entre 2 cellules adjacentes
    const dx = Math.abs(a.x - b.x);
    const dz = Math.abs(a.z - b.z);
    if (dx === 1 && dz === 1) {
      return 1.414; // diagonale
    }
    return 1; // cardinal
  }

  private getNeighbors(x: number, z: number): GridNode[] {
    const neighbors: GridNode[] = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1], // cardinaux
      [-1, -1], [-1, 1], [1, -1], [1, 1], // diagonales
    ];

    for (const [dx, dz] of directions) {
      const nx = x + dx;
      const nz = z + dz;

      if (this.isValid(nx, nz)) {
        const node = this.grid.get(this.getKey(nx, nz));
        if (node) {
          neighbors.push({ ...node }); // Clone pour éviter de modifier la grille
        }
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
      // Trouver le point le plus loin visible
      let farthestIndex = currentIndex + 1;

      for (let i = currentIndex + 2; i < path.length; i++) {
        if (this.hasLineOfSight(path[currentIndex], path[i])) {
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

  private hasLineOfSight(from: Vector3, to: Vector3): boolean {
    // Vérifier si le segment de-via intersecte une cellule non walkable
    const dist = from.distanceTo(to);
    const steps = Math.ceil(dist / GRID_SIZE);
    const dir = to.clone().sub(from).normalize();

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps);
      const checkPos = from.clone().add(dir.clone().multiplyScalar(dist * t));
      const gridPos = this.worldToGrid(checkPos);

      if (!this.isWalkable(gridPos.x, gridPos.z)) {
        return false;
      }
    }

    return true;
  }

  private findClosestWalkable(x: number, z: number): { x: number; z: number } | null {
    const maxRadius = 10;
    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dz = -radius; dz <= radius; dz++) {
          if (Math.abs(dx) === radius || Math.abs(dz) === radius) {
            const nx = x + dx;
            const nz = z + dz;
            if (this.isWalkable(nx, nz)) {
              return { x: nx, z: nz };
            }
          }
        }
      }
    }
    return null;
  }
}

// Instance singleton
export const navigationGrid = new NavigationGrid();
