import { describe, it, expect } from 'vitest';
import { GameEngine } from '../src/core/GameEngine';

describe('GameEngine - State & Turn Rules', () => {
  it('allows maximum 3 rolls per turn', () => {
    const engine = new GameEngine();
    engine.startMatch('quick', 'easy');

    expect(engine.getDice().getRollCount()).toBe(0);
    expect(engine.getDice().canRoll()).toBe(true);

    // Roll 1
    expect(engine.playerRoll()).toBe(true);
    expect(engine.getDice().getRollCount()).toBe(1);
    expect(engine.getDice().canRoll()).toBe(true);

    // Roll 2
    expect(engine.playerRoll()).toBe(true);
    expect(engine.getDice().getRollCount()).toBe(2);
    expect(engine.getDice().canRoll()).toBe(true);

    // Roll 3
    expect(engine.playerRoll()).toBe(true);
    expect(engine.getDice().getRollCount()).toBe(3);
    expect(engine.getDice().canRoll()).toBe(false);

    // 4th roll must fail
    expect(engine.playerRoll()).toBe(false);
  });

  it('allows holding dice after roll 1 and toggling hold state', () => {
    const engine = new GameEngine();
    engine.startMatch('quick', 'easy');

    // Cannot hold before roll 1
    expect(engine.playerToggleHold(0)).toBe(false);

    // Roll 1
    engine.playerRoll();

    // Now can hold
    const held = engine.playerToggleHold(0);
    expect(held).toBe(true);
    expect(engine.getDice().getDice()[0].held).toBe(true);

    // Toggle release
    const released = engine.playerToggleHold(0);
    expect(released).toBe(false);
    expect(engine.getDice().getDice()[0].held).toBe(false);
  });

  it('locks category permanently after scoring', () => {
    const engine = new GameEngine();
    engine.startMatch('quick', 'easy');
    engine.playerRoll();

    // Score Ones
    const scored = engine.playerCommitScore('ones');
    expect(scored).toBe(true);
    expect(engine.getState().player.scorecard.scores.ones).toBeDefined();

    // Trying to score Ones again must fail
    const scoredAgain = engine.playerCommitScore('ones');
    expect(scoredAgain).toBe(false);
  });
});
