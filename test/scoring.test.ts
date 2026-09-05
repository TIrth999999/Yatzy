import { describe, it, expect } from 'vitest';
import {
  calculateOnes,
  calculateTwos,
  calculateThrees,
  calculateFours,
  calculateFives,
  calculateSixes,
  calculateThreeOfAKind,
  calculateFourOfAKind,
  calculateFullHouse,
  calculateSmallStraight,
  calculateLargeStraight,
  calculateYatzy,
  calculateChance,
  calculateAllCategoryScores
} from '../src/scoring/ScoreRules';
import { ScoreEngine } from '../src/scoring/ScoreEngine';
import { DEFAULT_RULES } from '../src/types/game';

describe('ScoreRules - Pure Scoring Calculations', () => {
  describe('Upper Section', () => {
    it('calculates Ones correctly', () => {
      expect(calculateOnes([1, 1, 1, 4, 6])).toBe(3);
      expect(calculateOnes([2, 3, 4, 5, 6])).toBe(0);
      expect(calculateOnes([1, 1, 1, 1, 1])).toBe(5);
    });

    it('calculates Twos correctly', () => {
      expect(calculateTwos([2, 2, 4, 5, 6])).toBe(4);
      expect(calculateTwos([1, 3, 5, 5, 6])).toBe(0);
    });

    it('calculates Threes correctly', () => {
      expect(calculateThrees([3, 3, 3, 5, 6])).toBe(9);
      expect(calculateThrees([1, 2, 4, 5, 6])).toBe(0);
    });

    it('calculates Fours correctly', () => {
      expect(calculateFours([4, 4, 2, 3, 6])).toBe(8);
      expect(calculateFours([4, 4, 4, 4, 1])).toBe(16);
    });

    it('calculates Fives correctly', () => {
      expect(calculateFives([5, 5, 1, 2, 6])).toBe(10);
      expect(calculateFives([5, 5, 5, 5, 5])).toBe(25);
    });

    it('calculates Sixes correctly', () => {
      expect(calculateSixes([6, 6, 6, 2, 4])).toBe(18);
      expect(calculateSixes([1, 2, 3, 4, 5])).toBe(0);
    });
  });

  describe('Lower Section', () => {
    it('Three of a Kind: scores sum of ALL 5 dice if at least 3 match, else 0', () => {
      expect(calculateThreeOfAKind([3, 3, 3, 5, 6])).toBe(20);
      expect(calculateThreeOfAKind([6, 6, 6, 6, 2])).toBe(26);
      expect(calculateThreeOfAKind([2, 2, 4, 5, 6])).toBe(0);
    });

    it('Four of a Kind: scores sum of ALL 5 dice if at least 4 match, else 0', () => {
      expect(calculateFourOfAKind([4, 4, 4, 4, 2])).toBe(18);
      expect(calculateFourOfAKind([6, 6, 6, 6, 1])).toBe(25);
      expect(calculateFourOfAKind([3, 3, 3, 5, 6])).toBe(0);
    });

    it('Full House: 3 of one value and 2 of another. Scores static 25 points', () => {
      expect(calculateFullHouse([2, 2, 5, 5, 5])).toBe(25);
      expect(calculateFullHouse([6, 6, 3, 3, 3])).toBe(25);
      // Default: 5 of a kind is Yatzy, not full house
      expect(calculateFullHouse([5, 5, 5, 5, 5])).toBe(0);
      // Not a full house
      expect(calculateFullHouse([2, 2, 2, 2, 5])).toBe(0);
      expect(calculateFullHouse([1, 2, 3, 4, 5])).toBe(0);
    });

    it('Small Straight: at least 4 consecutive values scores 30', () => {
      expect(calculateSmallStraight([1, 2, 3, 4, 6])).toBe(30);
      expect(calculateSmallStraight([2, 3, 4, 5, 5])).toBe(30);
      expect(calculateSmallStraight([3, 4, 5, 6, 1])).toBe(30);
      expect(calculateSmallStraight([1, 3, 4, 5, 6])).toBe(30);
      expect(calculateSmallStraight([1, 2, 3, 5, 6])).toBe(0);
    });

    it('Large Straight: 1-2-3-4-5 or 2-3-4-5-6 scores 40', () => {
      expect(calculateLargeStraight([1, 2, 3, 4, 5])).toBe(40);
      expect(calculateLargeStraight([2, 3, 4, 5, 6])).toBe(40);
      expect(calculateLargeStraight([5, 4, 3, 2, 1])).toBe(40);
      expect(calculateLargeStraight([1, 2, 3, 4, 6])).toBe(0);
      expect(calculateLargeStraight([2, 3, 4, 5, 5])).toBe(0);
    });

    it('Yatzy: 5 identical dice scores 50', () => {
      expect(calculateYatzy([1, 1, 1, 1, 1])).toBe(50);
      expect(calculateYatzy([6, 6, 6, 6, 6])).toBe(50);
      expect(calculateYatzy([6, 6, 6, 6, 5])).toBe(0);
    });

    it('Chance: sum of all 5 dice', () => {
      expect(calculateChance([6, 5, 3, 2, 4])).toBe(20);
      expect(calculateChance([1, 1, 1, 1, 1])).toBe(5);
    });

    it('calculateAllCategoryScores computes all 13 values simultaneously', () => {
      const all = calculateAllCategoryScores([6, 6, 6, 2, 4]);
      expect(all.sixes).toBe(18);
      expect(all.threeOfAKind).toBe(24);
      expect(all.fourOfAKind).toBe(0);
      expect(all.chance).toBe(24);
      expect(all.ones).toBe(0);
    });
  });

  describe('ScoreEngine & Upper Bonus', () => {
    it('tracks upper bonus progress and triggers +35 when sum >= 63', () => {
      const engine = new ScoreEngine(DEFAULT_RULES);
      let card = engine.createEmptyScorecard();

      // Ones: 3 pts (3 x 1)
      let res = engine.commitScore(card, 'ones', 3);
      card = res.updatedScorecard;
      expect(card.upperSubtotal).toBe(3);
      expect(card.bonusAchieved).toBe(false);

      // Twos: 6 pts (3 x 2)
      res = engine.commitScore(card, 'twos', 6);
      card = res.updatedScorecard;
      expect(card.upperSubtotal).toBe(9);
      expect(card.bonusAchieved).toBe(false);

      // Threes: 9 pts (3 x 3)
      res = engine.commitScore(card, 'threes', 9);
      card = res.updatedScorecard;

      // Fours: 12 pts (3 x 4)
      res = engine.commitScore(card, 'fours', 12);
      card = res.updatedScorecard;

      // Fives: 15 pts (3 x 5)
      res = engine.commitScore(card, 'fives', 15);
      card = res.updatedScorecard;
      expect(card.upperSubtotal).toBe(45);
      expect(card.bonusAchieved).toBe(false);

      // Sixes: 18 pts (3 x 6) -> subtotal = 45 + 18 = 63!
      res = engine.commitScore(card, 'sixes', 18);
      card = res.updatedScorecard;
      expect(card.upperSubtotal).toBe(63);
      expect(card.bonusAchieved).toBe(true);
      expect(res.newlyAwardedBonus).toBe(true);
      expect(card.bonusScore).toBe(35);
      expect(card.upperTotal).toBe(98); // 63 + 35
      expect(card.grandTotal).toBe(98);
    });

    it('does not re-award bonus if already achieved and further scores added', () => {
      const engine = new ScoreEngine(DEFAULT_RULES);
      let card = engine.createEmptyScorecard();

      // Score 66 directly across two categories for testing
      card = engine.commitScore(card, 'fives', 25).updatedScorecard;
      const res = engine.commitScore(card, 'sixes', 40); // 65 total >= 63
      card = res.updatedScorecard;
      expect(card.bonusAchieved).toBe(true);
      expect(res.newlyAwardedBonus).toBe(true);

      // Add another score
      const res2 = engine.commitScore(card, 'ones', 5);
      expect(res2.newlyAwardedBonus).toBe(false);
      expect(res2.updatedScorecard.bonusScore).toBe(35);
    });

    it('prevents scoring an already scored category', () => {
      const engine = new ScoreEngine(DEFAULT_RULES);
      let card = engine.createEmptyScorecard();
      card = engine.commitScore(card, 'ones', 3).updatedScorecard;

      expect(() => {
        engine.commitScore(card, 'ones', 4);
      }).toThrow();
    });
  });
});
