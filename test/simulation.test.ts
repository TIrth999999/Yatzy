import { describe, it, expect } from 'vitest';
import { ScoreEngine } from '../src/scoring/ScoreEngine';
import { DiceEngine } from '../src/dice/DiceEngine';
import { BotDecisionEngine } from '../src/bot/BotDecisionEngine';
import { Difficulty, ScorecardState } from '../src/types/game';
import { calculateCategoryScore } from '../src/scoring/ScoreRules';

interface SimulationResult {
  playerWins: number;
  botWins: number;
  draws: number;
  avgPlayerScore: number;
  avgBotScore: number;
}

function simulateMatch(diff1: Difficulty, diff2: Difficulty): { score1: number; score2: number; winner: 1 | 2 | 'draw' } {
  const scoreEngine = new ScoreEngine();
  const dice = new DiceEngine(3);
  const botEngine = new BotDecisionEngine();
  botEngine.setInstantMode(true);

  let card1 = scoreEngine.createEmptyScorecard();
  let card2 = scoreEngine.createEmptyScorecard();

  for (let round = 1; round <= 13; round++) {
    // Player 1 turn
    card1 = playBotTurn(diff1, botEngine, dice, scoreEngine, card1, round);
    // Player 2 turn
    card2 = playBotTurn(diff2, botEngine, dice, scoreEngine, card2, round);
  }

  const s1 = card1.grandTotal;
  const s2 = card2.grandTotal;
  let winner: 1 | 2 | 'draw' = 'draw';
  if (s1 > s2) winner = 1;
  else if (s2 > s1) winner = 2;

  return { score1: s1, score2: s2, winner };
}

function playBotTurn(
  diff: Difficulty,
  bot: BotDecisionEngine,
  dice: DiceEngine,
  scoreEngine: ScoreEngine,
  card: ScorecardState,
  round: number
): ScorecardState {
  dice.resetTurn();

  // Roll 1
  dice.roll();
  const d1 = bot.decideHolds(diff, dice.getValues(), 1, card, round);
  dice.setAllHolds(d1.holds);

  // If holds not all 5, Roll 2
  if (!d1.holds.every(h => h)) {
    dice.roll();
    const d2 = bot.decideHolds(diff, dice.getValues(), 2, card, round);
    dice.setAllHolds(d2.holds);

    if (!d2.holds.every(h => h)) {
      // Roll 3
      dice.roll();
    }
  }

  // Category choice
  const choice = bot.decideCategory(diff, dice.getValues(), card, round);
  const rawScore = calculateCategoryScore(choice.category, dice.getValues());
  const res = scoreEngine.commitScore(card, choice.category, rawScore);
  return res.updatedScorecard;
}

function runSimulation(diff1: Difficulty, diff2: Difficulty, numMatches: number): SimulationResult {
  let p1Wins = 0;
  let p2Wins = 0;
  let draws = 0;
  let totalS1 = 0;
  let totalS2 = 0;

  for (let i = 0; i < numMatches; i++) {
    const res = simulateMatch(diff1, diff2);
    totalS1 += res.score1;
    totalS2 += res.score2;
    if (res.winner === 1) p1Wins++;
    else if (res.winner === 2) p2Wins++;
    else draws++;
  }

  return {
    playerWins: p1Wins,
    botWins: p2Wins,
    draws,
    avgPlayerScore: totalS1 / numMatches,
    avgBotScore: totalS2 / numMatches
  };
}

describe('Bot Intelligence & Statistical Validation', () => {
  it('Hard bot statistically outperforms Easy bot in average score and win rate', () => {
    const matches = 60;
    const result = runSimulation('hard', 'easy', matches);

    console.log(`\n=== 60 MATCH SIMULATION: Hard vs Easy ===`);
    console.log(`Hard Wins: ${result.playerWins}, Easy Wins: ${result.botWins}, Draws: ${result.draws}`);
    console.log(`Avg Hard Score: ${result.avgPlayerScore.toFixed(1)}, Avg Easy Score: ${result.avgBotScore.toFixed(1)}`);

    // Hard bot should achieve a higher average score than Easy
    expect(result.avgPlayerScore).toBeGreaterThan(result.avgBotScore);
    // Hard bot should win majority of games
    expect(result.playerWins).toBeGreaterThan(result.botWins);
  }, 60000);

  it('Hard bot achieves higher average score than Medium bot', () => {
    const matches = 60;
    const result = runSimulation('hard', 'medium', matches);

    console.log(`\n=== 60 MATCH SIMULATION: Hard vs Medium ===`);
    console.log(`Hard Wins: ${result.playerWins}, Medium Wins: ${result.botWins}, Draws: ${result.draws}`);
    console.log(`Avg Hard Score: ${result.avgPlayerScore.toFixed(1)}, Avg Medium Score: ${result.avgBotScore.toFixed(1)}`);

    expect(result.avgPlayerScore).toBeGreaterThanOrEqual(result.avgBotScore);
  }, 60000);
});
