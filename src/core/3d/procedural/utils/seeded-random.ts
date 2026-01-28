/**
 * Seeded random number generator (Mulberry32)
 * Provides deterministic random numbers based on a string seed.
 *
 * @param seed - String seed for the random number generator
 * @returns A function that returns random numbers between 0 and 1
 */
export function createSeededRandom(seed: string): () => number {
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

/**
 * Generates a random integer between min and max (inclusive) using seeded random
 */
export function randomInt(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max using seeded random
 */
export function randomFloat(random: () => number, min: number, max: number): number {
  return random() * (max - min) + min;
}

/**
 * Picks a random element from an array using seeded random
 */
export function randomPick<T>(random: () => number, array: T[]): T {
  return array[Math.floor(random() * array.length)];
}
