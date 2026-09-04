import { DieValue, ScoreCategory, GameRulesConfig, DEFAULT_RULES } from '../types/game';

/**
 * Counts occurrences of each die value 1-6
 */
export function getCounts(dice: DieValue[]): Record<DieValue, number> {
  const counts: Record<DieValue, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const d of dice) {
    if (d >= 1 && d <= 6) {
      counts[d]++;
    }
  }
  return counts;
}

/**
 * Sums all 5 dice
 */
export function sumDice(dice: DieValue[]): number {
  return dice.reduce((acc, v) => acc + v, 0);
}

// Upper Section
export function calculateOnes(dice: DieValue[]): number {
  return dice.filter(d => d === 1).length * 1;
}

export function calculateTwos(dice: DieValue[]): number {
  return dice.filter(d => d === 2).length * 2;
}

export function calculateThrees(dice: DieValue[]): number {
  return dice.filter(d => d === 3).length * 3;
}

export function calculateFours(dice: DieValue[]): number {
  return dice.filter(d => d === 4).length * 4;
}

export function calculateFives(dice: DieValue[]): number {
  return dice.filter(d => d === 5).length * 5;
}

export function calculateSixes(dice: DieValue[]): number {
  return dice.filter(d => d === 6).length * 6;
}

// Lower Section
export function calculateThreeOfAKind(dice: DieValue[]): number {
  const counts = getCounts(dice);
  const hasThree = Object.values(counts).some(c => c >= 3);
  return hasThree ? sumDice(dice) : 0;
}

export function calculateFourOfAKind(dice: DieValue[]): number {
  const counts = getCounts(dice);
  const hasFour = Object.values(counts).some(c => c >= 4);
  return hasFour ? sumDice(dice) : 0;
}

export function calculateFullHouse(
  dice: DieValue[],
  config: GameRulesConfig = DEFAULT_RULES
): number {
  const counts = Object.values(getCounts(dice)).filter(c => c > 0);
  counts.sort((a, b) => b - a);

  if (counts.length === 2 && counts[0] === 3 && counts[1] === 2) {
    return sumDice(dice);
  }

  // If configurable Yatzy-as-Full-House is enabled
  if (config.yatzyCountsAsFullHouse && counts.length === 1 && counts[0] === 5) {
    return sumDice(dice);
  }

  return 0;
}

export function calculateSmallStraight(
  dice: DieValue[],
  config: GameRulesConfig = DEFAULT_RULES
): number {
  const unique = Array.from(new Set(dice)).sort((a, b) => a - b);
  const set = new Set(unique);

  // Check possible 4-straights: 1-2-3-4, 2-3-4-5, 3-4-5-6
  const has1234 = set.has(1) && set.has(2) && set.has(3) && set.has(4);
  const has2345 = set.has(2) && set.has(3) && set.has(4) && set.has(5);
  const has3456 = set.has(3) && set.has(4) && set.has(5) && set.has(6);

  if (has1234 || has2345 || has3456) {
    return config.smallStraightPoints;
  }
  return 0;
}

export function calculateLargeStraight(
  dice: DieValue[],
  config: GameRulesConfig = DEFAULT_RULES
): number {
  const unique = Array.from(new Set(dice)).sort((a, b) => a - b);
  if (unique.length !== 5) return 0;

  const is1to5 = unique[0] === 1 && unique[1] === 2 && unique[2] === 3 && unique[3] === 4 && unique[4] === 5;
  const is2to6 = unique[0] === 2 && unique[1] === 3 && unique[2] === 4 && unique[3] === 5 && unique[4] === 6;

  if (is1to5 || is2to6) {
    return config.largeStraightPoints;
  }
  return 0;
}

export function calculateYatzy(
  dice: DieValue[],
  config: GameRulesConfig = DEFAULT_RULES
): number {
  const counts = Object.values(getCounts(dice));
  const has5 = counts.some(c => c === 5);
  return has5 ? config.yatzyPoints : 0;
}

export function calculateChance(dice: DieValue[]): number {
  return sumDice(dice);
}

/**
 * Pure calculation dispatcher for a specific category
 */
export function calculateCategoryScore(
  category: ScoreCategory,
  dice: DieValue[],
  config: GameRulesConfig = DEFAULT_RULES
): number {
  switch (category) {
    case 'ones': return calculateOnes(dice);
    case 'twos': return calculateTwos(dice);
    case 'threes': return calculateThrees(dice);
    case 'fours': return calculateFours(dice);
    case 'fives': return calculateFives(dice);
    case 'sixes': return calculateSixes(dice);
    case 'threeOfAKind': return calculateThreeOfAKind(dice);
    case 'fourOfAKind': return calculateFourOfAKind(dice);
    case 'fullHouse': return calculateFullHouse(dice, config);
    case 'smallStraight': return calculateSmallStraight(dice, config);
    case 'largeStraight': return calculateLargeStraight(dice, config);
    case 'yatzy': return calculateYatzy(dice, config);
    case 'chance': return calculateChance(dice);
    default: return 0;
  }
}

/**
 * Calculate potential score for all 13 categories given a set of 5 dice
 */
export function calculateAllCategoryScores(
  dice: DieValue[],
  config: GameRulesConfig = DEFAULT_RULES
): Record<ScoreCategory, number> {
  return {
    ones: calculateOnes(dice),
    twos: calculateTwos(dice),
    threes: calculateThrees(dice),
    fours: calculateFours(dice),
    fives: calculateFives(dice),
    sixes: calculateSixes(dice),
    threeOfAKind: calculateThreeOfAKind(dice),
    fourOfAKind: calculateFourOfAKind(dice),
    fullHouse: calculateFullHouse(dice, config),
    smallStraight: calculateSmallStraight(dice, config),
    largeStraight: calculateLargeStraight(dice, config),
    yatzy: calculateYatzy(dice, config),
    chance: calculateChance(dice)
  };
}
