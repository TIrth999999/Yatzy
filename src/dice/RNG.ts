import { DieValue } from '../types/game';

/**
 * Seedable, deterministic PRNG based on Mulberry32 with fallback to crypto.getRandomValues
 */
export class RNGService {
  private static instance: RNGService;
  private seed: number | null = null;
  private state: number = 0;

  public static getInstance(): RNGService {
    if (!RNGService.instance) {
      RNGService.instance = new RNGService();
    }
    return RNGService.instance;
  }

  public setSeed(seed: number | string | null): void {
    if (seed === null || seed === undefined) {
      this.seed = null;
      return;
    }

    if (typeof seed === 'string') {
      // Hash string into 32-bit integer
      let h = 2166136261 >>> 0;
      for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
      }
      this.seed = h >>> 0;
    } else {
      this.seed = seed >>> 0;
    }
    this.state = this.seed;
  }

  public getSeed(): number | null {
    return this.seed;
  }

  /**
   * Returns a float in [0, 1)
   */
  public nextFloat(): number {
    if (this.seed !== null) {
      // Mulberry32
      let t = (this.state += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    // High quality standard random
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return arr[0] / 4294967296;
    }

    return Math.random();
  }

  /**
   * Returns an integer between min and max (inclusive)
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }

  /**
   * Roll a fair 6-sided die
   */
  public rollDie(): DieValue {
    return this.nextInt(1, 6) as DieValue;
  }
}
