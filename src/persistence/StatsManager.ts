import { Difficulty, GameStats } from '../types/game';
import { SaveManager } from './SaveManager';

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  gamesDrawn: 0,
  highestScore: 0,
  lowestScore: 0,
  totalScore: 0,
  yatzyCount: 0,
  bonusCount: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  byDifficulty: {
    easy: { games: 0, wins: 0, losses: 0, draws: 0, highestScore: 0 },
    medium: { games: 0, wins: 0, losses: 0, draws: 0, highestScore: 0 },
    hard: { games: 0, wins: 0, losses: 0, draws: 0, highestScore: 0 }
  }
};

export class StatsManager {
  private static instance: StatsManager;
  private stats: GameStats;
  private saveMgr = SaveManager.getInstance();

  public static getInstance(): StatsManager {
    if (!StatsManager.instance) {
      StatsManager.instance = new StatsManager();
    }
    return StatsManager.instance;
  }

  constructor() {
    this.stats = this.saveMgr.load<GameStats>('stats', { ...DEFAULT_STATS });
    // Ensure all difficulties are initialized in case of legacy structure
    if (!this.stats.byDifficulty) {
      this.stats.byDifficulty = { ...DEFAULT_STATS.byDifficulty };
    }
    ['easy', 'medium', 'hard'].forEach(d => {
      const diff = d as Difficulty;
      if (!this.stats.byDifficulty[diff]) {
        this.stats.byDifficulty[diff] = { games: 0, wins: 0, losses: 0, draws: 0, highestScore: 0 };
      }
    });
  }

  public getStats(): GameStats {
    return { ...this.stats };
  }

  public recordMatch(
    winner: 'player' | 'bot' | 'draw',
    playerScore: number,
    difficulty: Difficulty
  ): void {
    this.stats.gamesPlayed++;
    this.stats.totalScore += playerScore;

    if (this.stats.gamesPlayed === 1) {
      this.stats.highestScore = playerScore;
      this.stats.lowestScore = playerScore;
    } else {
      if (playerScore > this.stats.highestScore) this.stats.highestScore = playerScore;
      if (this.stats.lowestScore === 0 || playerScore < this.stats.lowestScore) {
        this.stats.lowestScore = playerScore;
      }
    }

    const diffStats = this.stats.byDifficulty[difficulty];
    diffStats.games++;
    if (playerScore > diffStats.highestScore) {
      diffStats.highestScore = playerScore;
    }

    if (winner === 'player') {
      this.stats.gamesWon++;
      diffStats.wins++;
      this.stats.currentWinStreak++;
      if (this.stats.currentWinStreak > this.stats.bestWinStreak) {
        this.stats.bestWinStreak = this.stats.currentWinStreak;
      }
    } else if (winner === 'bot') {
      this.stats.gamesLost++;
      diffStats.losses++;
      this.stats.currentWinStreak = 0;
    } else {
      this.stats.gamesDrawn++;
      diffStats.draws++;
      this.stats.currentWinStreak = 0;
    }

    this.save();
  }

  public recordYatzy(): void {
    this.stats.yatzyCount++;
    this.save();
  }

  public recordBonus(): void {
    this.stats.bonusCount++;
    this.save();
  }

  public resetStats(): void {
    this.stats = JSON.parse(JSON.stringify(DEFAULT_STATS));
    this.save();
  }

  private save(): void {
    this.saveMgr.save('stats', this.stats);
  }
}
