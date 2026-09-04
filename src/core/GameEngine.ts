import { Difficulty, GameMode, ScoreCategory } from '../types/game';
import { GameState } from './GameState';
import { DiceEngine } from '../dice/DiceEngine';
import { BotDecisionEngine } from '../bot/BotDecisionEngine';
import { calculateCategoryScore } from '../scoring/ScoreRules';
import { EventBus } from './EventBus';

export class GameEngine {
  private state: GameState;
  private dice: DiceEngine;
  private bot: BotDecisionEngine;
  private bus: EventBus;
  private activeBotTimer: number | null = null;
  private isProcessingAction: boolean = false;

  constructor() {
    this.state = new GameState();
    this.dice = new DiceEngine(3);
    this.bot = new BotDecisionEngine();
    this.bus = EventBus.getInstance();
  }

  public getState(): GameState {
    return this.state;
  }

  public getDice(): DiceEngine {
    return this.dice;
  }

  public getBotEngine(): BotDecisionEngine {
    return this.bot;
  }

  public startMatch(mode: GameMode = 'quick', difficulty: Difficulty = 'medium'): void {
    this.clearBotTimer();
    this.isProcessingAction = false;
    this.state.resetMatch(mode, difficulty);
    this.dice.resetTurn();
    this.state.phase = 'PLAYER_READY_TO_ROLL';

    this.bus.emit('MATCH_STARTED', {
      mode,
      difficulty,
      round: 1,
      totalRounds: this.state.totalRounds
    });

    this.bus.emit('TURN_STARTED', {
      player: 'player',
      round: 1,
      rollCount: 0
    });
  }

  /**
   * Player rolls the dice
   */
  public playerRoll(): boolean {
    if (this.isProcessingAction) return false;
    if (this.state.activePlayer !== 'player') return false;
    if (this.state.isPaused) return false;
    if (!this.dice.canRoll()) return false;

    this.isProcessingAction = true;
    this.state.phase = 'PLAYER_ROLLING';

    try {
      const rollResult = this.dice.roll();
      this.state.phase = 'PLAYER_DECIDING';

      this.bus.emit('DICE_ROLLED', {
        player: 'player',
        rollCount: this.dice.getRollCount(),
        rolledIndices: rollResult.rolledIndices,
        values: rollResult.newValues,
        canRollAgain: this.dice.canRoll()
      });

      return true;
    } finally {
      this.isProcessingAction = false;
    }
  }

  /**
   * Player toggles hold on a die
   */
  public playerToggleHold(dieIndex: number): boolean {
    if (this.state.activePlayer !== 'player') return false;
    if (this.state.isPaused) return false;
    if (this.state.phase !== 'PLAYER_DECIDING') return false;
    if (this.dice.getRollCount() === 0) return false;

    const isHeld = this.dice.toggleHold(dieIndex);
    this.bus.emit('DIE_HOLD_TOGGLED', {
      player: 'player',
      dieIndex,
      isHeld,
      dice: this.dice.getDice()
    });

    return isHeld;
  }

  /**
   * Player chooses a category to commit
   */
  public playerCommitScore(category: ScoreCategory): boolean {
    if (this.isProcessingAction) return false;
    if (this.state.activePlayer !== 'player') return false;
    if (this.state.isPaused) return false;
    if (this.dice.getRollCount() === 0) return false;

    const currentScorecard = this.state.player.scorecard;
    if (this.state.scoreEngine.isCategoryScored(currentScorecard, category)) {
      return false;
    }

    this.isProcessingAction = true;

    try {
      const rawScore = calculateCategoryScore(category, this.dice.getValues());
      const { newlyAwardedBonus, updatedScorecard } = this.state.scoreEngine.commitScore(
        currentScorecard,
        category,
        rawScore
      );

      this.state.player.scorecard = updatedScorecard;

      this.bus.emit('SCORE_COMMITTED', {
        player: 'player',
        category,
        score: rawScore,
        scorecard: updatedScorecard,
        newlyAwardedBonus
      });

      if (newlyAwardedBonus) {
        this.bus.emit('BONUS_AWARDED', { player: 'player', points: 35 });
      }

      if (category === 'yatzy' && rawScore === 50) {
        this.bus.emit('YATZY_SCORED', { player: 'player' });
      }

      // Check if practice mode game complete
      if (this.state.mode === 'practice' && this.state.isGameComplete()) {
        this.finishMatch();
        return true;
      }

      // Transition to Bot's turn
      this.transitionToBot();
      return true;
    } finally {
      this.isProcessingAction = false;
    }
  }

  private transitionToBot(): void {
    this.state.activePlayer = 'bot';
    this.state.phase = 'BOT_WAITING';
    this.dice.resetTurn();

    this.bus.emit('TURN_STARTED', {
      player: 'bot',
      round: this.state.currentRound,
      rollCount: 0
    });

    // Schedule bot action with realistic delay
    const delay = this.bot.getThinkingDelay(this.state.difficulty);
    this.scheduleBotStep(() => {
      this.executeBotTurn();
    }, delay);
  }

  /**
   * Orchestrates the entire bot turn asynchronously with human-like pacing
   */
  private async executeBotTurn(): Promise<void> {
    if (this.state.activePlayer !== 'bot' || this.state.isPaused) return;

    // --- Roll 1 ---
    this.state.phase = 'BOT_ROLLING';
    const roll1 = this.dice.roll();
    this.bus.emit('DICE_ROLLED', {
      player: 'bot',
      rollCount: 1,
      rolledIndices: roll1.rolledIndices,
      values: roll1.newValues,
      canRollAgain: true
    });

    const delay1 = this.bot.getThinkingDelay(this.state.difficulty);
    await this.waitMs(delay1);
    if (this.state.activePlayer !== 'bot' || this.state.isPaused) return;

    // --- Decide Holds 1 ---
    const decision1 = this.bot.decideHolds(
      this.state.difficulty,
      this.dice.getValues(),
      1,
      this.state.bot.scorecard,
      this.state.currentRound
    );

    this.dice.setAllHolds(decision1.holds);
    this.bus.emit('BOT_HOLDS_DECIDED', {
      holds: decision1.holds,
      reasoning: decision1.reasoning
    });

    // If bot decided to hold all 5, it can score early!
    if (decision1.holds.every(h => h)) {
      await this.waitMs(300);
      this.commitBotScore();
      return;
    }

    await this.waitMs(delay1 / 2);
    if (this.state.activePlayer !== 'bot' || this.state.isPaused) return;

    // --- Roll 2 ---
    this.state.phase = 'BOT_ROLLING';
    const roll2 = this.dice.roll();
    this.bus.emit('DICE_ROLLED', {
      player: 'bot',
      rollCount: 2,
      rolledIndices: roll2.rolledIndices,
      values: roll2.newValues,
      canRollAgain: true
    });

    const delay2 = this.bot.getThinkingDelay(this.state.difficulty);
    await this.waitMs(delay2);
    if (this.state.activePlayer !== 'bot' || this.state.isPaused) return;

    // --- Decide Holds 2 ---
    const decision2 = this.bot.decideHolds(
      this.state.difficulty,
      this.dice.getValues(),
      2,
      this.state.bot.scorecard,
      this.state.currentRound
    );

    this.dice.setAllHolds(decision2.holds);
    this.bus.emit('BOT_HOLDS_DECIDED', {
      holds: decision2.holds,
      reasoning: decision2.reasoning
    });

    if (decision2.holds.every(h => h)) {
      await this.waitMs(300);
      this.commitBotScore();
      return;
    }

    await this.waitMs(delay2 / 2);
    if (this.state.activePlayer !== 'bot' || this.state.isPaused) return;

    // --- Roll 3 ---
    this.state.phase = 'BOT_ROLLING';
    const roll3 = this.dice.roll();
    this.bus.emit('DICE_ROLLED', {
      player: 'bot',
      rollCount: 3,
      rolledIndices: roll3.rolledIndices,
      values: roll3.newValues,
      canRollAgain: false
    });

    const delay3 = this.bot.getThinkingDelay(this.state.difficulty);
    await this.waitMs(delay3);
    if (this.state.activePlayer !== 'bot' || this.state.isPaused) return;

    // --- Score Category ---
    this.commitBotScore();
  }

  private commitBotScore(): void {
    const categoryDecision = this.bot.decideCategory(
      this.state.difficulty,
      this.dice.getValues(),
      this.state.bot.scorecard,
      this.state.currentRound
    );

    const { newlyAwardedBonus, updatedScorecard } = this.state.scoreEngine.commitScore(
      this.state.bot.scorecard,
      categoryDecision.category,
      categoryDecision.score
    );

    this.state.bot.scorecard = updatedScorecard;

    this.bus.emit('SCORE_COMMITTED', {
      player: 'bot',
      category: categoryDecision.category,
      score: categoryDecision.score,
      scorecard: updatedScorecard,
      newlyAwardedBonus,
      reasoning: categoryDecision.reasoning
    });

    if (newlyAwardedBonus) {
      this.bus.emit('BONUS_AWARDED', { player: 'bot', points: 35 });
    }

    if (categoryDecision.category === 'yatzy' && categoryDecision.score === 50) {
      this.bus.emit('YATZY_SCORED', { player: 'bot' });
    }

    // Check if match complete
    if (this.state.isGameComplete()) {
      this.finishMatch();
      return;
    }

    // Advance to next round and player's turn
    this.state.currentRound++;
    this.state.activePlayer = 'player';
    this.state.phase = 'PLAYER_READY_TO_ROLL';
    this.dice.resetTurn();

    this.bus.emit('ROUND_ADVANCED', {
      round: this.state.currentRound,
      totalRounds: this.state.totalRounds
    });

    this.bus.emit('TURN_STARTED', {
      player: 'player',
      round: this.state.currentRound,
      rollCount: 0
    });
  }

  private finishMatch(): void {
    this.state.phase = 'GAME_OVER';

    const pTotal = this.state.player.scorecard.grandTotal;
    const bTotal = this.state.bot.scorecard.grandTotal;

    let winner: 'player' | 'bot' | 'draw' = 'draw';
    if (pTotal > bTotal) winner = 'player';
    else if (bTotal > pTotal) winner = 'bot';

    this.bus.emit('MATCH_COMPLETED', {
      winner,
      playerScore: pTotal,
      botScore: bTotal,
      scoreDifference: Math.abs(pTotal - bTotal),
      playerScorecard: this.state.player.scorecard,
      botScorecard: this.state.bot.scorecard,
      difficulty: this.state.difficulty
    });
  }

  public pause(): void {
    if (this.state.isPaused || this.state.phase === 'GAME_OVER' || this.state.phase === 'BOOT') return;
    this.clearBotTimer();
    this.state.isPaused = true;
    this.state.previousPhase = this.state.phase;
    this.state.phase = 'PAUSED';
    this.bus.emit('MATCH_PAUSED');
  }

  public resume(): void {
    if (!this.state.isPaused) return;
    this.state.isPaused = false;
    this.state.phase = this.state.previousPhase;
    this.bus.emit('MATCH_RESUMED');

    if (this.state.activePlayer === 'bot') {
      this.scheduleBotStep(() => {
        this.executeBotTurn();
      }, 500);
    }
  }

  private scheduleBotStep(fn: () => void, delayMs: number): void {
    this.clearBotTimer();
    this.activeBotTimer = (setTimeout as unknown as (fn: () => void, ms: number) => number)(() => {
      this.activeBotTimer = null;
      fn();
    }, delayMs);
  }

  private clearBotTimer(): void {
    if (this.activeBotTimer !== null) {
      clearTimeout(this.activeBotTimer);
      this.activeBotTimer = null;
    }
  }

  private waitMs(ms: number): Promise<void> {
    return new Promise(resolve => {
      this.activeBotTimer = (setTimeout as unknown as (fn: () => void, ms: number) => number)(() => {
        this.activeBotTimer = null;
        resolve();
      }, ms);
    });
  }
}
