import {
  ScoreCategory,
  ScorecardState,
  GameRulesConfig,
  DEFAULT_RULES,
  UPPER_CATEGORIES,
  LOWER_CATEGORIES,
  ALL_CATEGORIES
} from '../types/game';

export class ScoreEngine {
  private config: GameRulesConfig;

  constructor(config: GameRulesConfig = DEFAULT_RULES) {
    this.config = config;
  }

  public createEmptyScorecard(): ScorecardState {
    return {
      scores: {},
      upperSubtotal: 0,
      bonusAchieved: false,
      bonusScore: 0,
      upperTotal: 0,
      lowerTotal: 0,
      grandTotal: 0
    };
  }

  public isCategoryScored(scorecard: ScorecardState, category: ScoreCategory): boolean {
    return scorecard.scores[category] !== undefined;
  }

  public getAvailableCategories(scorecard: ScorecardState): ScoreCategory[] {
    return ALL_CATEGORIES.filter(c => !this.isCategoryScored(scorecard, c));
  }

  public isGameComplete(scorecard: ScorecardState): boolean {
    return ALL_CATEGORIES.every(c => this.isCategoryScored(scorecard, c));
  }

  /**
   * Commits a score to a category.
   * Updates upperSubtotal, bonusAchieved, bonusScore, upperTotal, lowerTotal, grandTotal.
   * Returns whether a bonus was newly awarded in this turn.
   */
  public commitScore(
    scorecard: ScorecardState,
    category: ScoreCategory,
    score: number
  ): { newlyAwardedBonus: boolean; updatedScorecard: ScorecardState } {
    if (this.isCategoryScored(scorecard, category)) {
      throw new Error(`Category "${category}" has already been scored and cannot be modified.`);
    }

    const updated: ScorecardState = {
      ...scorecard,
      scores: {
        ...scorecard.scores,
        [category]: Math.max(0, score)
      }
    };

    // Calculate upper subtotal
    let upperSub = 0;
    for (const cat of UPPER_CATEGORIES) {
      if (updated.scores[cat] !== undefined) {
        upperSub += updated.scores[cat]!;
      }
    }
    updated.upperSubtotal = upperSub;

    // Check bonus
    let newlyAwardedBonus = false;
    if (!scorecard.bonusAchieved && upperSub >= this.config.upperBonusThreshold) {
      updated.bonusAchieved = true;
      updated.bonusScore = this.config.upperBonusPoints;
      newlyAwardedBonus = true;
    } else if (scorecard.bonusAchieved) {
      updated.bonusAchieved = true;
      updated.bonusScore = scorecard.bonusScore;
    } else {
      updated.bonusAchieved = false;
      updated.bonusScore = 0;
    }

    updated.upperTotal = updated.upperSubtotal + updated.bonusScore;

    // Calculate lower total
    let lowerSub = 0;
    for (const cat of LOWER_CATEGORIES) {
      if (updated.scores[cat] !== undefined) {
        lowerSub += updated.scores[cat]!;
      }
    }
    updated.lowerTotal = lowerSub;

    // Grand total
    updated.grandTotal = updated.upperTotal + updated.lowerTotal;

    return { newlyAwardedBonus, updatedScorecard: updated };
  }
}
