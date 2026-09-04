import { DieValue, ScoreCategory, ScorecardState, UPPER_CATEGORIES } from '../types/game';
import { calculateAllCategoryScores, calculateCategoryScore, getCounts } from '../scoring/ScoreRules';

export interface HoldEvaluation {
  holds: boolean[];
  expectedValue: number;
  reason: string;
}

export class HardStrategy {
  /**
   * Evaluates all 32 hold combinations and chooses the one with the maximum expected utility.
   */
  public static chooseHolds(
    dice: DieValue[],
    rollCount: number,
    scorecard: ScorecardState
  ): { holds: boolean[]; reasoning: string; ev: number } {
    // If Yatzy already rolled and Yatzy is available, hold ALL dice!
    const yatzyScore = calculateCategoryScore('yatzy', dice);
    if (yatzyScore === 50 && scorecard.scores.yatzy === undefined) {
      return { holds: [true, true, true, true, true], reasoning: 'Yatzy rolled! Holding all dice.', ev: 100 };
    }

    // If Large Straight rolled and available, hold ALL dice!
    const lsScore = calculateCategoryScore('largeStraight', dice);
    if (lsScore === 20 && scorecard.scores.largeStraight === undefined) {
      return { holds: [true, true, true, true, true], reasoning: 'Large Straight achieved! Holding all.', ev: 45 };
    }

    let bestHolds: boolean[] = [false, false, false, false, false];
    let bestEV = -Infinity;
    let bestReason = '';

    // Evaluate all 2^5 = 32 combinations
    for (let mask = 0; mask < 32; mask++) {
      const holds = [
        (mask & 1) !== 0,
        (mask & 2) !== 0,
        (mask & 4) !== 0,
        (mask & 8) !== 0,
        (mask & 16) !== 0
      ];

      const ev = this.estimateHoldEV(dice, holds, rollCount, scorecard);

      if (ev > bestEV) {
        bestEV = ev;
        bestHolds = holds;
        bestReason = `Mask ${mask.toString(2).padStart(5, '0')} with EV ${ev.toFixed(2)}`;
      }
    }

    return { holds: bestHolds, reasoning: bestReason, ev: bestEV };
  }

  /**
   * Estimates the expected value (EV) for keeping a specific subset of dice.
   */
  private static estimateHoldEV(
    dice: DieValue[],
    holds: boolean[],
    rollCount: number,
    scorecard: ScorecardState
  ): number {
    const heldDice: DieValue[] = [];
    const rerollIndices: number[] = [];

    for (let i = 0; i < 5; i++) {
      if (holds[i]) {
        heldDice.push(dice[i]);
      } else {
        rerollIndices.push(i);
      }
    }

    const unheldCount = rerollIndices.length;

    // If all 5 are held, calculate immediate best category utility
    if (unheldCount === 0) {
      return this.evaluateBestCategoryUtility(dice, scorecard);
    }

    // For roll 2 -> 3 (1 roll left) or roll 1 -> 2 (2 rolls left)
    // When unheldCount <= 3: exact calculation (6^1=6, 6^2=36, 6^3=216)
    // When unheldCount >= 4: representative deterministic lattice sampling (approx 50-100 outcomes)
    const outcomes = this.generateOutcomes(unheldCount);
    let totalUtility = 0;

    for (const outcome of outcomes) {
      const simulatedDice = [...heldDice, ...outcome];
      const utility = this.evaluateBestCategoryUtility(simulatedDice, scorecard);
      totalUtility += utility;
    }

    const baseEV = totalUtility / outcomes.length;

    // Small bonus for keeping pairs/straights on roll 1 (preserves flexibility)
    let flexibilityBonus = 0;
    if (rollCount === 1) {
      flexibilityBonus = this.calculateFlexibilityBonus(heldDice, scorecard);
    }

    return baseEV + flexibilityBonus;
  }

  /**
   * Generates representative roll outcomes for unheld dice
   */
  private static generateOutcomes(count: number): DieValue[][] {
    if (count === 1) {
      return [[1], [2], [3], [4], [5], [6]];
    }
    if (count === 2) {
      const res: DieValue[][] = [];
      for (let a = 1; a <= 6; a++) {
        for (let b = 1; b <= 6; b++) {
          res.push([a as DieValue, b as DieValue]);
        }
      }
      return res;
    }
    if (count === 3) {
      // 216 exact outcomes
      const res: DieValue[][] = [];
      for (let a = 1; a <= 6; a++) {
        for (let b = 1; b <= 6; b++) {
          for (let c = 1; c <= 6; c++) {
            res.push([a as DieValue, b as DieValue, c as DieValue]);
          }
        }
      }
      return res;
    }

    // For 4 or 5 unheld dice, generate a balanced representative sample of 36 evenly distributed rolls
    const res: DieValue[][] = [];
    for (let i = 1; i <= 6; i++) {
      for (let j = 1; j <= 6; j++) {
        if (count === 4) {
          res.push([
            i as DieValue,
            j as DieValue,
            (((i + j) % 6) + 1) as DieValue,
            (((i * 2 + j) % 6) + 1) as DieValue
          ]);
        } else {
          res.push([
            i as DieValue,
            j as DieValue,
            (((i + j) % 6) + 1) as DieValue,
            (((i * 2 + j) % 6) + 1) as DieValue,
            (((i + j * 2) % 6) + 1) as DieValue
          ]);
        }
      }
    }
    return res;
  }

  private static calculateFlexibilityBonus(held: DieValue[], scorecard: ScorecardState): number {
    let bonus = 0;
    const counts = Object.values(getCounts(held)).filter(c => c > 1);
    if (counts.includes(3)) bonus += 3;
    if (counts.includes(2)) bonus += 1.5;

    // Check partial straight in held dice
    const unique = Array.from(new Set(held)).sort((a, b) => a - b);
    if (unique.length >= 3) {
      let consecutive = 1;
      for (let i = 0; i < unique.length - 1; i++) {
        if (unique[i + 1] === unique[i] + 1) consecutive++;
      }
      if (consecutive >= 3 && scorecard.scores.smallStraight === undefined) {
        bonus += 2;
      }
    }
    return bonus;
  }

  /**
   * Returns highest utility among all currently available categories for given dice
   */
  public static evaluateBestCategoryUtility(
    dice: DieValue[],
    scorecard: ScorecardState
  ): number {
    const scores = calculateAllCategoryScores(dice);
    let maxUtil = -Infinity;

    const upperNeeded = Math.max(0, 63 - scorecard.upperSubtotal);

    for (const [catStr, score] of Object.entries(scores)) {
      const cat = catStr as ScoreCategory;
      if (scorecard.scores[cat] !== undefined) continue;

      const util = this.getCategoryUtility(cat, score, dice, scorecard, upperNeeded);
      if (util > maxUtil) {
        maxUtil = util;
      }
    }

    return maxUtil === -Infinity ? 0 : maxUtil;
  }

  /**
   * Calculates strategic utility of committing a specific category
   */
  public static getCategoryUtility(
    category: ScoreCategory,
    score: number,
    dice: DieValue[],
    scorecard: ScorecardState,
    upperNeeded: number
  ): number {
    let utility = score;

    if (category === 'yatzy') {
      if (score === 50) return 120;
      // Burning yatzy early is heavily penalized
      return -25;
    }

    if (category === 'largeStraight') {
      if (score === 20) return 45;
      return -8;
    }

    if (category === 'smallStraight') {
      if (score === 15) return 28;
      return -4;
    }

    if (category === 'fullHouse') {
      if (score > 0) return score + 14;
      return -5;
    }

    if (category === 'fourOfAKind') {
      if (score >= 20) return score + 12;
      if (score > 0) return score + 4;
      return -3;
    }

    if (category === 'threeOfAKind') {
      if (score >= 20) return score + 6;
      return score;
    }

    if (category === 'chance') {
      if (score >= 23) return score + 8;
      if (score < 18) return score - 14; // Protect Chance for bad rolls
      return score;
    }

    if (UPPER_CATEGORIES.includes(category)) {
      const val = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].indexOf(category) + 1;
      const count = dice.filter(d => d === val).length;

      if (count >= 3) {
        // Exceeding or meeting par (e.g. 3x5=15, 4x6=24) strongly helps unlock the 35pt bonus
        const extra = (count - 3) * val;
        utility += 22 + extra * 3;
        if (!scorecard.bonusAchieved && upperNeeded > 0) {
          utility += 15;
        }
      } else if (count === 2) {
        // Acceptable for 1s, 2s or 3s, but slight negative equity for 5s and 6s
        utility += val <= 2 ? 2 : -2;
      } else if (count === 1) {
        utility -= val * 3;
      } else {
        // Zeroing: 1s is a great zero sacrifice (-2), 6s is devastating (-25)
        if (val === 1) utility = -1;
        else if (val === 2) utility = -3;
        else utility = -(val * 4);
      }
    }

    return utility;
  }

  /**
   * Final decision for committing a category on roll 3 (or early)
   */
  public static chooseCategory(
    dice: DieValue[],
    scorecard: ScorecardState
  ): { category: ScoreCategory; score: number; reasoning: string } {
    const scores = calculateAllCategoryScores(dice);
    let bestCat: ScoreCategory = 'chance';
    let bestUtil = -Infinity;
    let bestScore = 0;
    let bestReason = '';

    const upperNeeded = Math.max(0, 63 - scorecard.upperSubtotal);

    for (const [catStr, score] of Object.entries(scores)) {
      const cat = catStr as ScoreCategory;
      if (scorecard.scores[cat] !== undefined) continue;

      const util = this.getCategoryUtility(cat, score, dice, scorecard, upperNeeded);
      if (util > bestUtil) {
        bestUtil = util;
        bestCat = cat;
        bestScore = score;
        bestReason = `Utility ${util.toFixed(1)} for ${cat} (Score: ${score})`;
      }
    }

    return { category: bestCat, score: bestScore, reasoning: bestReason };
  }
}
