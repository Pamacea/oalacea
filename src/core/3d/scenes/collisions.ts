// Collision zones pour les deux mondes
// Zones de collision définies comme cercles (position, rayon)

import { Vector3 } from 'three';

export interface CollisionZone {
  id: string;
  position: [number, number, number];
  radius: number;
  name: string;
}

// =========================================
// DEV WORLD - COLLISION ZONES
// =========================================
export const DEV_COLLISION_ZONES: CollisionZone[] = [
  // Monolithe central (box 6x2 = rayon ~3)
  { id: 'monolith', position: [0, 0, -20], radius: 3.2, name: 'Monolithe' },

  // Piliers (16 piliers en cercle) - base rayon 2.2
  ...Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const radius = 25;
    return {
      id: `pillar-${i}`,
      position: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
      radius: 2.3, // Base du pilier = 2.2, petit écart pour éviter les collisions trop strictes
      name: `Pilier ${i}`
    } as CollisionZone;
  }),

  // Arcs gothiques - largeur ~7 (de -3 à 3)
  { id: 'arch-north', position: [0, 0, 18], radius: 3.5, name: 'Arc Nord' },
  { id: 'arch-south', position: [0, 0, -18], radius: 3.5, name: 'Arc Sud' },
  { id: 'arch-east', position: [18, 0, 0], radius: 3.5, name: 'Arc Est' },
  { id: 'arch-west', position: [-18, 0, 0], radius: 3.5, name: 'Arc Ouest' },

  // Terminaux (box 2x1 = rayon ~1)
  { id: 'terminal-1', position: [-12, 0, -8], radius: 1.2, name: 'Terminal 1' },
  { id: 'terminal-2', position: [12, 0, -8], radius: 1.2, name: 'Terminal 2' },
  { id: 'terminal-3', position: [-8, 0, 8], radius: 1.2, name: 'Terminal 3' },
  { id: 'terminal-4', position: [8, 0, 8], radius: 1.2, name: 'Terminal 4' },
];

// =========================================
// ART WORLD - COLLISION ZONES
// =========================================
export const ART_COLLISION_ZONES: CollisionZone[] = [
  // Murs de béton (box 1x8x1 avec scale)
  { id: 'wall-1', position: [-20, 0, -15], radius: 4.5, name: 'Mur Béton 1' },
  { id: 'wall-2', position: [20, 0, -15], radius: 4.5, name: 'Mur Béton 2' },
  { id: 'wall-3', position: [-25, 0, 5], radius: 3.5, name: 'Mur Béton 3' },
  { id: 'wall-4', position: [25, 0, 5], radius: 3.5, name: 'Mur Béton 4' },
  { id: 'wall-5', position: [0, 0, -30], radius: 8, name: 'Mur du fond' },

  // Pedestals - base rayon 2.0
  { id: 'pedestal-1', position: [-10, 0, -8], radius: 2.1, name: 'Pedestal 1' },
  { id: 'pedestal-2', position: [10, 0, -8], radius: 2.1, name: 'Pedestal 2' },
  { id: 'pedestal-3', position: [-8, 0, 12], radius: 2.1, name: 'Pedestal 3' },
  { id: 'pedestal-4', position: [8, 0, 12], radius: 2.1, name: 'Pedestal 4' },

  // Gallery frames - box 5x4 = rayon 2.5
  { id: 'frame-1', position: [0, 0, -20], radius: 2.7, name: 'Cadre 1' },
  { id: 'frame-2', position: [-15, 0, 0], radius: 2.7, name: 'Cadre 2' },
  { id: 'frame-3', position: [15, 0, 0], radius: 2.7, name: 'Cadre 3' },

  // Neon signs (haut) - box 4x1.5 = rayon 2, mais en hauteur donc pas de collision au sol
  // On les garde pour référence mais avec un rayon minimal
  { id: 'neon-1', position: [0, 0, -25], radius: 1, name: 'Néon ART' },
  { id: 'neon-2', position: [-15, 0, 10], radius: 1, name: 'Néon CREATE' },
  { id: 'neon-3', position: [15, 0, 10], radius: 1, name: 'Néon EXPRESS' },
  { id: 'neon-4', position: [0, 0, 20], radius: 1, name: 'Néon UNDERGROUND' },
];

// =========================================
// COLLISION DETECTION
// =========================================

/**
 * Vérifie si une position est en collision avec une zone
 * @param position Position à tester
 * @param zones Zones de collision
 * @param characterRadius Rayon du personnage
 * @returns true si collision, false sinon
 */
export function checkCollision(
  position: Vector3,
  zones: CollisionZone[],
  characterRadius: number = 0.5
): boolean {
  for (const zone of zones) {
    const dx = position.x - zone.position[0];
    const dz = position.z - zone.position[2];
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Collision quand les surfaces se touchent (distance < rayon objet + rayon personnage)
    if (distance < zone.radius + characterRadius) {
      return true;
    }
  }
  return false;
}

/**
 * Calcule la position la plus proche possible sans collision
 * @param from Position de départ
 * @param to Position cible
 * @param zones Zones de collision
 * @param characterRadius Rayon du personnage
 * @returns Position corrigée sans collision
 */
export function getSafePosition(
  from: Vector3,
  to: Vector3,
  zones: CollisionZone[],
  characterRadius: number = 0.5
): Vector3 {
  // Direction normale du mouvement
  const direction = new Vector3().subVectors(to, from).normalize();
  const distance = from.distanceTo(to);

  // Test par incréments le long du chemin
  const stepSize = 0.5;
  const steps = Math.ceil(distance / stepSize);

  let currentPos = from.clone();

  for (let i = 0; i < steps; i++) {
    const nextPos = currentPos.clone().add(direction.clone().multiplyScalar(stepSize));

    if (!checkCollision(nextPos, zones, characterRadius)) {
      currentPos = nextPos;
    } else {
      // Collision trouvée, retourner la dernière position valide
      return currentPos;
    }
  }

  // Vérifier la destination finale
  if (!checkCollision(to, zones, characterRadius)) {
    return to;
  }

  return currentPos;
}
