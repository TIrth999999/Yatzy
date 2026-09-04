import { GameState } from '../../core/GameState';
import { EventBus } from '../../core/EventBus';

export class ScoreHeader {
  private container: HTMLElement;
  private bus: EventBus = EventBus.getInstance();

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.bus.on('SCORE_COMMITTED', () => this.render());
    this.bus.on('ROUND_ADVANCED', () => this.render());
    this.bus.on('TURN_STARTED', () => this.render());
  }

  public render(gameState?: GameState): void {
    if (!gameState) return;

    const pScore = gameState.player.scorecard.grandTotal;
    const bScore = gameState.bot.scorecard.grandTotal;
    const round = gameState.currentRound;
    const totalRounds = gameState.totalRounds;
    const diffLabel = gameState.difficulty.toUpperCase();

    this.container.innerHTML = `
      <div class="header-content-inner" style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
        <div class="header-score-box player">
          <span class="score-label">YOU</span>
          <span class="score-num" id="header-player-score">${pScore}</span>
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="vs-indicator">VS</span>
            <span class="round-pill">ROUND ${round} / ${totalRounds}</span>
          </div>
          <span style="font-size: 0.72rem; font-weight: 700; color: rgba(255,255,255,0.6); text-transform: uppercase;">
            BOT (${diffLabel})
          </span>
        </div>

        <div class="header-score-box bot">
          <span class="score-label">BOT</span>
          <span class="score-num" id="header-bot-score">${bScore}</span>
        </div>

        <div style="display: flex; gap: 8px; margin-left: 12px;">
          <button class="btn btn-secondary btn-icon" id="btn-header-pause" title="Pause / Menu" aria-label="Pause">
            ⏸️
          </button>
        </div>
      </div>
    `;

    const pauseBtn = this.container.querySelector('#btn-header-pause');
    pauseBtn?.addEventListener('click', () => {
      this.bus.emit('REQUEST_PAUSE');
    });
  }
}
