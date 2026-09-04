import { DieValue, ScoreCategory, ScorecardState, UPPER_CATEGORIES } from '../types/game';
import { calculateAllCategoryScores } from './ScoreRules';

export interface CategoryRecommendation {
  category: ScoreCategory;
  score: number;
  reason: string;
  utility: number;
}

export class SmartRecommender {
  /**
   * Recommends the optimal category to score based on expected value, scarcity, and bonus progress
   */
  public static recommend(
    dice: DieValue[],
    scorecard: ScorecardState,
    _rollCount: number
  ): CategoryRecommendation | null {
    const scores = calculateAllCategoryScores(dice);

    let bestCat: ScoreCategory | null = null;
    let bestUtility = -Infinity;
    let bestScore = 0;
    let bestReason = '';

    const remainingUpperNeed = Math.max(0, 63 - scorecard.upperSubtotal);

    for (const [catStr, score] of Object.entries(scores)) {
      const cat = catStr as ScoreCategory;
      if (scorecard.scores[cat] !== undefined) continue;

      let utility = score;
      let reason = `Scores ${score} points.`;

      // Yatzy check
      if (cat === 'yatzy') {
        if (score === 50) {
          utility += 200;
          reason = 'Yatzy! Maximum 50 points!';
        } else {
          // If 0 on Yatzy, very low utility unless late game and no other choice
          utility = -20;
          reason = 'Zeros the 50pt Yatzy category.';
        }
      }

      // Large Straight check
      else if (cat === 'largeStraight') {
        if (score === 20) {
          utility += 60;
          reason = 'Large Straight scored for full 20 points!';
        } else {
          utility = -10;
        }
      }

      // Small Straight check
      else if (cat === 'smallStraight') {
        if (score === 15) {
          utility += 35;
          reason = 'Small Straight secured!';
        } else {
          utility = -5;
        }
      }

      // Full House check
      else if (cat === 'fullHouse') {
        if (score > 0) {
          utility += 30 + (score - 15);
          reason = 'Full House completed!';
        } else {
          utility = -8;
        }
      }

      // 4 of a Kind
      else if (cat === 'fourOfAKind') {
        if (score >= 20) {
          utility += 25;
          reason = 'High-value 4 of a Kind!';
        } else if (score > 0) {
          utility += 10;
        } else {
          utility = -5;
        }
      }

      // 3 of a Kind
      else if (cat === 'threeOfAKind') {
        if (score >= 22) {
          utility += 15;
          reason = 'Strong 3 of a Kind sum!';
        }
      }

      // Chance
      else if (cat === 'chance') {
        if (score >= 22) {
          utility += 12;
          reason = 'Great Chance roll!';
        } else if (score < 18) {
          utility -= 15; // Don't waste Chance on a low sum
        }
      }

      // Upper categories
      else if (UPPER_CATEGORIES.includes(cat)) {
        const val = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].indexOf(cat) + 1;
        const matchingCount = dice.filter(d => d === val).length;

        // Target for bonus is 3 of each: 3*val
        const target = 3 * val;
        if (score >= target) {
          utility += 25 + (score - target) * 3;
          reason = `Great upper section score! (${score}/${target} bonus par)`;
        } else if (score === 2 * val && matchingCount === 2) {
          utility += 5;
        } else if (score === 0) {
          // Zeroing an upper category hurts bonus
          utility -= (val * 2.5);
          reason = `Warning: scores 0 for ${cat}`;
        }

        // Extra bonus incentive if close to 63
        if (!scorecard.bonusAchieved && remainingUpperNeed > 0 && remainingUpperNeed <= 15 && score > 0) {
          utility += 15;
        }
      }

      if (utility > bestUtility) {
        bestUtility = utility;
        bestCat = cat;
        bestScore = score;
        bestReason = reason;
      }
    }

    if (!bestCat) return null;

    return {
      category: bestCat,
      score: bestScore,
      reason: bestReason,
      utility: bestUtility
    };
  }
}
