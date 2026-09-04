import { DieValue, ScoreCategory, ScorecardState, UPPER_CATEGORIES } from '../types/game';
import { calculateAllCategoryScores, calculateCategoryScore, getCounts } from '../scoring/ScoreRules';

export class MediumStrategy {
  public static chooseHolds(
    dice: DieValue[],
    _rollCount: number,
    scorecard: ScorecardState
  ): { holds: boolean[]; reasoning: string } {
    // 1. Yatzy made? Keep all
    if (calculateCategoryScore('yatzy', dice) === 50 && scorecard.scores.yatzy === undefined) {
      return { holds: [true, true, true, true, true], reasoning: 'Holding Yatzy' };
    }

    // 2. Large straight made? Keep all
    if (calculateCategoryScore('largeStraight', dice) === 20 && scorecard.scores.largeStraight === undefined) {
      return { holds: [true, true, true, true, true], reasoning: 'Holding Large Straight' };
    }

    // 3. Full house made? Keep all if FH available
    if (calculateCategoryScore('fullHouse', dice) > 0 && scorecard.scores.fullHouse === undefined) {
      return { holds: [true, true, true, true, true], reasoning: 'Holding Full House' };
    }

    // 4. Check for 4 of a kind or 3 of a kind
    const counts = getCounts(dice);
    let bestVal: DieValue | null = null;
    let maxCount = 0;

    for (let v = 6; v >= 1; v--) {
      const val = v as DieValue;
      if (counts[val] > maxCount) {
        maxCount = counts[val];
        bestVal = val;
      }
    }

    // If 3 or 4 matching dice, hold them to pursue 4X / Yatzy / Upper
    if (bestVal !== null && maxCount >= 3) {
      const holds = dice.map(d => d === bestVal);
      return { holds, reasoning: `Holding ${maxCount}x of ${bestVal}` };
    }

    // 5. Check 4-straight potential
    const unique = Array.from(new Set(dice)).sort((a, b) => a - b);
    if (scorecard.scores.largeStraight === undefined || scorecard.scores.smallStraight === undefined) {
      // Check 4-straight
      if (unique.length >= 4) {
        let longestRun: number[] = [];
        let currentRun: number[] = [unique[0]];
        for (let i = 1; i < unique.length; i++) {
          if (unique[i] === unique[i - 1] + 1) {
            currentRun.push(unique[i]);
          } else {
            if (currentRun.length > longestRun.length) longestRun = currentRun;
            currentRun = [unique[i]];
          }
        }
        if (currentRun.length > longestRun.length) longestRun = currentRun;

        if (longestRun.length >= 4) {
          const runSet = new Set(longestRun);
          const holds = [false, false, false, false, false];
          const kept = new Set<number>();
          dice.forEach((d, idx) => {
            if (runSet.has(d) && !kept.has(d)) {
              holds[idx] = true;
              kept.add(d);
            }
          });
          return { holds, reasoning: 'Holding 4-dice straight' };
        }
      }
    }

    // 6. Check for a pair (especially high pairs 4, 5, 6 or upper needed)
    if (bestVal !== null && maxCount === 2) {
      const holds = dice.map(d => d === bestVal);
      return { holds, reasoning: `Holding pair of ${bestVal}s` };
    }

    // 7. Otherwise, hold high single dice (5 or 6) if upper available
    const holds = [false, false, false, false, false];
    let highestVal = 0;
    let highIdx = -1;
    dice.forEach((d, idx) => {
      if (d > highestVal && (d === 5 || d === 6)) {
        highestVal = d;
        highIdx = idx;
      }
    });

    if (highIdx !== -1) {
      holds[highIdx] = true;
      return { holds, reasoning: `Holding high die ${highestVal}` };
    }

    return { holds: [false, false, false, false, false], reasoning: 'Rerolling all' };
  }

  public static chooseCategory(
    dice: DieValue[],
    scorecard: ScorecardState
  ): { category: ScoreCategory; score: number; reasoning: string } {
    const scores = calculateAllCategoryScores(dice);
    let bestCat: ScoreCategory = 'chance';
    let highestValue = -Infinity;
    let chosenScore = 0;

    for (const [catStr, score] of Object.entries(scores)) {
      const cat = catStr as ScoreCategory;
      if (scorecard.scores[cat] !== undefined) continue;

      let value = score;
      if (cat === 'yatzy') {
        value = score === 50 ? 100 : -10;
      } else if (cat === 'largeStraight') {
        value = score === 20 ? 35 : -4;
      } else if (cat === 'smallStraight') {
        value = score === 15 ? 25 : -2;
      } else if (cat === 'fullHouse') {
        value = score > 0 ? score + 10 : -3;
      } else if (UPPER_CATEGORIES.includes(cat)) {
        const numVal = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'].indexOf(cat) + 1;
        const count = dice.filter(d => d === numVal).length;
        if (count >= 3) value += 12;
        else if (count === 0) value -= numVal * 2;
      }

      if (value > highestValue) {
        highestValue = value;
        bestCat = cat;
        chosenScore = score;
      }
    }

    return {
      category: bestCat,
      score: chosenScore,
      reasoning: `Medium chosen ${bestCat} (${chosenScore} pts)`
    };
  }
}
