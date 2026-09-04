import { RNGService } from '../dice/RNG';

export class DailyChallenge {
  public static getTodaySeed(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `YATZY-${year}-${month}-${day}`;
  }

  public static setupDailyChallengeRNG(): void {
    const seed = this.getTodaySeed();
    RNGService.getInstance().setSeed(seed);
  }

  public static isDailyCompletedToday(): boolean {
    const today = this.getTodaySeed();
    try {
      const saved = localStorage.getItem('yatzy_clash_daily_' + today);
      return saved !== null;
    } catch {
      return false;
    }
  }

  public static recordDailyCompletion(score: number): void {
    const today = this.getTodaySeed();
    try {
      localStorage.setItem('yatzy_clash_daily_' + today, JSON.stringify({ score, date: new Date().toISOString() }));
    } catch {
      // Non-blocking
    }
  }
}
