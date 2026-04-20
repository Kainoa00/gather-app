export type PRNG = () => number;

function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function createPRNG(seed: number): PRNG {
  return mulberry32(seed);
}

export function seededInt(prng: PRNG, min: number, max: number): number {
  return Math.floor(prng() * (max - min + 1)) + min;
}

export function seededFloat(prng: PRNG, min: number, max: number): number {
  return prng() * (max - min) + min;
}

export function seededPick<T>(prng: PRNG, arr: T[]): T {
  return arr[Math.floor(prng() * arr.length)];
}

export function seededBool(prng: PRNG, probability: number): boolean {
  return prng() < probability;
}
