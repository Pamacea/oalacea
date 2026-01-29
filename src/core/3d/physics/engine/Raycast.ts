// Raycast Utilities - Analytical ray-shape intersection for precise collision detection
import { Vector3 } from 'three';

// ============================================
// TYPES
// ============================================

export interface RaycastHit {
  collided: boolean;
  point: Vector3;
  normal: Vector3;
  distance: number;
}

export interface Ray {
  origin: Vector3;
  direction: Vector3;
}

// ============================================
// RAY-CIRCLE INTERSECTION
// ============================================

/**
 * Analytical ray-circle intersection in the XZ plane.
 * Uses quadratic formula to find exact intersection point.
 *
 * Ray: P(t) = O + t*D
 * Circle: |P - C|² = r²
 *
 * Substituting: |O + t*D - C|² = r²
 * Let L = O - C, then: |L + t*D|² = r²
 * Expanding: (L·L) + 2*t*(L·D) + t²*(D·D) = r²
 *
 * This is a quadratic: at² + bt + c = 0
 * Where a = D·D, b = 2*(L·D), c = L·L - r²
 *
 * @param rayOrigin - Starting point of the ray
 * @param rayDirection - Normalized direction of the ray
 * @param circleCenter - Center of the circle in XZ plane
 * @param circleRadius - Radius of the circle
 * @param maxDistance - Maximum distance to check (default: Infinity)
 * @returns Intersection info or null if no hit
 */
export function rayCircleIntersection(
  rayOrigin: Vector3,
  rayDirection: Vector3,
  circleCenter: Vector3,
  circleRadius: number,
  maxDistance: number = Infinity
): RaycastHit | null {
  // Project to XZ plane (ignore Y)
  const originXZ = new Vector3(rayOrigin.x, 0, rayOrigin.z);
  const dirXZ = new Vector3(rayDirection.x, 0, rayDirection.z).normalize();
  const centerXZ = new Vector3(circleCenter.x, 0, circleCenter.z);

  // Vector from ray origin to circle center
  const L = originXZ.clone().sub(centerXZ);

  // Quadratic coefficients
  const a = dirXZ.dot(dirXZ); // Should be 1 if normalized
  const b = 2 * L.dot(dirXZ);
  const c = L.dot(L) - circleRadius * circleRadius;

  // Discriminant determines if we have real solutions
  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return null; // No intersection
  }

  // Two solutions: t = (-b ± sqrt(discriminant)) / (2a)
  const sqrtD = Math.sqrt(discriminant);
  const t1 = (-b - sqrtD) / (2 * a);
  const t2 = (-b + sqrtD) / (2 * a);

  // We want the smallest positive t (closest intersection in front)
  let t: number | null = null;

  if (t1 >= 0 && t1 <= maxDistance) {
    t = t1;
  } else if (t2 >= 0 && t2 <= maxDistance) {
    t = t2;
  }

  if (t === null) {
    return null; // Both intersections are behind or beyond max distance
  }

  // Calculate intersection point
  const point = originXZ.clone().add(dirXZ.clone().multiplyScalar(t));
  point.y = rayOrigin.y + rayDirection.y * t; // Preserve Y from original ray

  // Calculate normal (from circle center to intersection point)
  const normal = point.clone().sub(centerXZ);
  normal.y = 0;
  normal.normalize();

  // Distance from ray origin to intersection
  const distance = rayOrigin.distanceTo(point);

  return {
    collided: true,
    point,
    normal,
    distance,
  };
}

// ============================================
// RAY-BOX INTERSECTION (AABB)
// ============================================

/**
 * Slab method for ray-AABB intersection.
 * Efficient algorithm that checks intersection with each axis-aligned slab.
 *
 * @param rayOrigin - Starting point of the ray
 * @param rayDirection - Normalized direction of the ray
 * @param boxMin - Minimum corner of the AABB
 * @param boxMax - Maximum corner of the AABB
 * @param maxDistance - Maximum distance to check (default: Infinity)
 * @returns Intersection info or null if no hit
 */
export function rayAABBIntersection(
  rayOrigin: Vector3,
  rayDirection: Vector3,
  boxMin: Vector3,
  boxMax: Vector3,
  maxDistance: number = Infinity
): RaycastHit | null {
  let tMin = 0;
  let tMax = maxDistance;
  let normalMin = new Vector3();
  let normalMax = new Vector3();

  // Check each axis (X, Y, Z)
  for (let i = 0; i < 3; i++) {
    const axis = i === 0 ? 'x' : i === 1 ? 'y' : 'z';
    const invDir = 1 / (rayDirection[axis] + 1e-10); // Avoid division by zero

    let t1 = (boxMin[axis] - rayOrigin[axis]) * invDir;
    let t2 = (boxMax[axis] - rayOrigin[axis]) * invDir;

    // Swap if ray direction is negative
    let n1 = new Vector3();
    let n2 = new Vector3();
    n1[axis] = -1;
    n2[axis] = 1;

    if (invDir < 0) {
      [t1, t2] = [t2, t1];
      [n1, n2] = [n2, n1];
    }

    // Update tMin, tMax
    if (t1 > tMin) {
      tMin = t1;
      normalMin = n1;
    }
    if (t2 < tMax) {
      tMax = t2;
      normalMax = n2;
    }

    // No intersection if intervals don't overlap
    if (tMax < tMin) {
      return null;
    }
  }

  // tMin is the entry point
  if (tMin > maxDistance) {
    return null;
  }

  // Calculate intersection point
  const point = rayOrigin.clone().add(rayDirection.clone().multiplyScalar(tMin));

  return {
    collided: true,
    point,
    normal: normalMin,
    distance: tMin,
  };
}

// ============================================
// RAY-SEGMENT INTERSECTION (2D)
// ============================================

/**
 * Find intersection between a ray and a line segment in the XZ plane.
 * Useful for checking walls and barriers.
 *
 * @param rayOrigin - Starting point of the ray
 * @param rayDirection - Normalized direction of the ray
 * @param segStart - Start of the line segment
 * @param segEnd - End of the line segment
 * @param maxDistance - Maximum distance to check (default: Infinity)
 * @returns Intersection info or null if no hit
 */
export function raySegmentIntersection(
  rayOrigin: Vector3,
  rayDirection: Vector3,
  segStart: Vector3,
  segEnd: Vector3,
  maxDistance: number = Infinity
): RaycastHit | null {
  // Project to XZ plane
  const r = { x: rayOrigin.x, z: rayOrigin.z };
  const d = { x: rayDirection.x, z: rayDirection.z };
  const p = { x: segStart.x, z: segStart.z };
  const q = { x: segEnd.x, z: segEnd.z };

  // Ray: R(t) = r + t*d
  // Segment: S(u) = p + u*(q-p), where 0 <= u <= 1
  // Solve: r + t*d = p + u*(q-p)

  const s = { x: q.x - p.x, z: q.z - p.z };

  const cross = d.x * s.z - d.z * s.x;

  // Parallel lines
  if (Math.abs(cross) < 1e-10) {
    return null;
  }

  const diff = { x: p.x - r.x, z: p.z - r.z };
  const t = (diff.x * s.z - diff.z * s.x) / cross;
  const u = (diff.x * d.z - diff.z * d.x) / cross;

  // Check if intersection is valid
  if (t >= 0 && t <= maxDistance && u >= 0 && u <= 1) {
    const point = new Vector3(
      r.x + t * d.x,
      rayOrigin.y + t * rayDirection.y,
      r.z + t * d.z
    );

    // Normal is perpendicular to segment
    const normal = new Vector3(s.z, 0, -s.x).normalize();

    return {
      collided: true,
      point,
      normal,
      distance: t,
    };
  }

  return null;
}

// ============================================
// LINE OF SIGHT
// ============================================

/**
 * Check if there's a clear line of sight between two points.
 * Uses ray-circle intersection against a list of obstacles.
 *
 * @param from - Starting point
 * @param to - Target point
 * @param obstacles - Array of obstacles to check against
 * @param getObstacleBounds - Function to get circle bounds for an obstacle
 * @param radius - Radius of the ray (for character size consideration)
 * @returns true if line of sight is clear
 */
export function hasLineOfSight(
  from: Vector3,
  to: Vector3,
  obstacles: Array<{ position: Vector3; radius: number }>,
  radius: number = 0.1
): boolean {
  const direction = to.clone().sub(from).normalize();
  const maxDistance = from.distanceTo(to);

  // Check each obstacle
  for (const obstacle of obstacles) {
    // Inflate obstacle radius by ray radius
    const hit = rayCircleIntersection(
      from,
      direction,
      obstacle.position,
      obstacle.radius + radius,
      maxDistance
    );

    if (hit && hit.distance < maxDistance - 0.01) {
      return false; // Something blocks the view
    }
  }

  return true;
}

// ============================================
// MULTIPLE RAY CASTING
// ============================================

/**
 * Cast multiple rays in a pattern (e.g., for thick characters).
 * Returns the closest hit among all rays.
 */
export function castMultipleRays(
  origin: Vector3,
  direction: Vector3,
  obstacles: Array<{ position: Vector3; radius: number }>,
  config: {
    count?: number; // Number of rays to cast
    spread?: number; // Spread perpendicular to direction
    rayRadius?: number; // Radius of each ray
  } = {}
): RaycastHit | null {
  const { count = 3, spread = 0.2, rayRadius = 0.1 } = config;

  // Perpendicular direction for spread
  const perp = new Vector3(-direction.z, 0, direction.x);

  let closestHit: RaycastHit | null = null;
  let closestDist = Infinity;

  for (let i = 0; i < count; i++) {
    // Calculate offset from center
    const offset = (i - (count - 1) / 2) * spread;
    const rayOrigin = origin.clone().add(perp.clone().multiplyScalar(offset));

    for (const obstacle of obstacles) {
      const hit = rayCircleIntersection(
        rayOrigin,
        direction,
        obstacle.position,
        obstacle.radius + rayRadius
      );

      if (hit && hit.distance < closestDist) {
        closestDist = hit.distance;
        closestHit = hit;
      }
    }
  }

  return closestHit;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Create a ray from origin pointing toward a target.
 */
export function createRayToward(origin: Vector3, target: Vector3): Ray {
  const direction = target.clone().sub(origin).normalize();
  return { origin: origin.clone(), direction };
}

/**
 * Get a point along a ray at distance t.
 */
export function getPointOnRay(ray: Ray, t: number): Vector3 {
  return ray.origin.clone().add(ray.direction.clone().multiplyScalar(t));
}
