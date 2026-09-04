import { DieValue, ScoreCategory, ScorecardState } from '../types/game';
import { calculateAllCategoryScores, calculateCategoryScore, getCounts } from '../scoring/ScoreRules';
import { RNGService } from '../dice/RNG';

export class EasyStrategy {
  public static chooseHolds(
    dice: DieValue[],
    _rollCount: number,
    _scorecard: ScorecardState
  ): { holds: boolean[]; reasoning: string } {
    const rng = RNGService.getInstance();

    // 1. If Yatzy made, hold it
    if (calculateCategoryScore('yatzy', dice) === 50) {
      return { holds: [true, true, true, true, true], reasoning: 'Easy: Holding Yatzy' };
    }

    // 2. 15% casual mistake: reroll all or random hold
    if (rng.nextFloat() < 0.15) {
      const randomIdx = rng.nextInt(0, 4);
      const holds = [false, false, false, false, false];
      holds[randomIdx] = true;
      return { holds, reasoning: 'Easy: Casual random hold' };
    }

    // 3. Find highest count
    const counts = getCounts(dice);
    let bestVal: DieValue | null = null;
    let maxCount = 0;

    for (let v = 1; v <= 6; v++) {
      const val = v as DieValue;
      if (counts[val] >= maxCount && counts[val] >= 2) {
        maxCount = counts[val];
        bestVal = val;
      }
    }

    if (bestVal !== null) {
      const holds = dice.map(d => d === bestVal);
      return { holds, reasoning: `Easy: Holding ${maxCount}x ${bestVal}` };
    }

    return { holds: [false, false, false, false, false], reasoning: 'Easy: Reroll all' };
  }

  public static chooseCategory(
    dice: DieValue[],
    scorecard: ScorecardState
  ): { category: ScoreCategory; score: number; reasoning: string } {
    const scores = calculateAllCategoryScores(dice);
    const rng = RNGService.getInstance();

    // Available categories
    const available: { cat: ScoreCategory; score: number }[] = [];
    for (const [catStr, score] of Object.entries(scores)) {
      const cat = catStr as ScoreCategory;
      if (scorecard.scores[cat] === undefined) {
        available.push({ cat, score });
      }
    }

    if (available.length === 0) {
      throw new Error('No categories available');
    }

    // Sort by immediate raw score descending
    available.sort((a, b) => b.score - a.score);

    // If highest score is > 0, Easy usually picks the highest raw score or second highest
    if (available[0].score > 0) {
      // 80% pick highest, 20% pick second highest if available
      const idx = (available.length > 1 && rng.nextFloat() < 0.20 && available[1].score > 0) ? 1 : 0;
      return {
        category: available[idx].cat,
        score: available[idx].score,
        reasoning: `Easy: Picked highest available (${available[idx].cat})`
      };
    }

    // If all available score 0, pick a random category to sacrifice (often wastes a good category)
    const pick = available[rng.nextInt(0, available.length - 1)];
    return {
      category: pick.cat,
      score: 0,
      reasoning: `Easy: Sacrificed 0 on ${pick.cat}`
    };
  }
}
