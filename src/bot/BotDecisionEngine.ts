import { Difficulty, DieValue, ScoreCategory, ScorecardState } from '../types/game';
import { EasyStrategy } from './EasyStrategy';
import { MediumStrategy } from './MediumStrategy';
import { HardStrategy } from './HardStrategy';

export interface BotDecisionLog {
  turn: number;
  rollNumber: number;
  dice: DieValue[];
  action: 'hold' | 'score';
  holds?: boolean[];
  category?: ScoreCategory;
  score?: number;
  reasoning: string;
  durationMs: number;
}

export class BotDecisionEngine {
  private logs: BotDecisionLog[] = [];
  private instantMode: boolean = false;

  public setInstantMode(instant: boolean): void {
    this.instantMode = instant;
  }

  public getLogs(): BotDecisionLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  /**
   * Generates a realistic human-like thinking delay in milliseconds
   */
  public getThinkingDelay(difficulty: Difficulty): number {
    if (this.instantMode) return 0;

    switch (difficulty) {
      case 'easy':
        return Math.floor(500 + Math.random() * 400); // 500-900ms
      case 'medium':
        return Math.floor(700 + Math.random() * 500); // 700-1200ms
      case 'hard':
        return Math.floor(1000 + Math.random() * 600); // 1000-1600ms
      default:
        return 700;
    }
  }

  /**
   * Decides which dice to hold for the next roll
   */
  public decideHolds(
    difficulty: Difficulty,
    dice: DieValue[],
    rollCount: number,
    scorecard: ScorecardState,
    turnNumber: number
  ): { holds: boolean[]; reasoning: string } {
    const startTime = performance.now();
    let result: { holds: boolean[]; reasoning: string };

    switch (difficulty) {
      case 'easy':
        result = EasyStrategy.chooseHolds(dice, rollCount, scorecard);
        break;
      case 'medium':
        result = MediumStrategy.chooseHolds(dice, rollCount, scorecard);
        break;
      case 'hard':
        result = HardStrategy.chooseHolds(dice, rollCount, scorecard);
        break;
      default:
        result = MediumStrategy.chooseHolds(dice, rollCount, scorecard);
    }

    const duration = performance.now() - startTime;
    this.logs.push({
      turn: turnNumber,
      rollNumber: rollCount,
      dice: [...dice],
      action: 'hold',
      holds: [...result.holds],
      reasoning: result.reasoning,
      durationMs: duration
    });

    return result;
  }

  /**
   * Decides which category to score
   */
  public decideCategory(
    difficulty: Difficulty,
    dice: DieValue[],
    scorecard: ScorecardState,
    turnNumber: number
  ): { category: ScoreCategory; score: number; reasoning: string } {
    const startTime = performance.now();
    let result: { category: ScoreCategory; score: number; reasoning: string };

    switch (difficulty) {
      case 'easy':
        result = EasyStrategy.chooseCategory(dice, scorecard);
        break;
      case 'medium':
        result = MediumStrategy.chooseCategory(dice, scorecard);
        break;
      case 'hard':
        result = HardStrategy.chooseCategory(dice, scorecard);
        break;
      default:
        result = MediumStrategy.chooseCategory(dice, scorecard);
    }

    const duration = performance.now() - startTime;
    this.logs.push({
      turn: turnNumber,
      rollNumber: 3,
      dice: [...dice],
      action: 'score',
      category: result.category,
      score: result.score,
      reasoning: result.reasoning,
      durationMs: duration
    });

    return result;
  }
}
