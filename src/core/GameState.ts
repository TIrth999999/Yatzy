import {
  Difficulty,
  GameMode,
  GamePhase,
  GameRulesConfig,
  PlayerState,
  PlayerType,
  DEFAULT_RULES
} from '../types/game';
import { ScoreEngine } from '../scoring/ScoreEngine';

export class GameState {
  public phase: GamePhase = 'BOOT';
  public previousPhase: GamePhase = 'BOOT';
  public mode: GameMode = 'quick';
  public difficulty: Difficulty = 'medium';
  public currentRound: number = 1;
  public totalRounds: number = 13;
  public activePlayer: PlayerType = 'player';
  public isPaused: boolean = false;

  public player: PlayerState;
  public bot: PlayerState;

  public scoreEngine: ScoreEngine;

  constructor(rules: GameRulesConfig = DEFAULT_RULES) {
    this.totalRounds = rules.totalRounds;
    this.scoreEngine = new ScoreEngine(rules);

    this.player = {
      id: 'player',
      name: 'You',
      scorecard: this.scoreEngine.createEmptyScorecard()
    };

    this.bot = {
      id: 'bot',
      name: 'Bot',
      scorecard: this.scoreEngine.createEmptyScorecard()
    };
  }

  public resetMatch(mode: GameMode = 'quick', difficulty: Difficulty = 'medium'): void {
    this.mode = mode;
    this.difficulty = difficulty;
    this.currentRound = 1;
    this.activePlayer = 'player';
    this.isPaused = false;
    this.phase = 'PLAYER_READY_TO_ROLL';
    this.previousPhase = 'PLAYER_READY_TO_ROLL';

    this.player = {
      id: 'player',
      name: 'You',
      scorecard: this.scoreEngine.createEmptyScorecard()
    };

    this.bot = {
      id: 'bot',
      name: difficulty === 'easy' ? 'Bot (Easy)' : difficulty === 'hard' ? 'Bot (Hard)' : 'Bot (Medium)',
      scorecard: this.scoreEngine.createEmptyScorecard()
    };
  }

  public getActivePlayerState(): PlayerState {
    return this.activePlayer === 'player' ? this.player : this.bot;
  }

  public getInactivePlayerState(): PlayerState {
    return this.activePlayer === 'player' ? this.bot : this.player;
  }

  public isGameComplete(): boolean {
    const playerDone = this.scoreEngine.isGameComplete(this.player.scorecard);
    if (this.mode === 'practice') {
      return playerDone;
    }
    const botDone = this.scoreEngine.isGameComplete(this.bot.scorecard);
    return playerDone && botDone;
  }
}
