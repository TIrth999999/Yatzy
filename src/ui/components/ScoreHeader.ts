import { GameEngine } from '../../core/GameEngine';
import { GameState } from '../../core/GameState';
import { EventBus } from '../../core/EventBus';
import { Icons } from '../icons/Icons';

export class ScoreHeader {
  private container: HTMLElement;
  private engine: GameEngine;
  private bus: EventBus = EventBus.getInstance();

  constructor(container: HTMLElement, engine: GameEngine) {
    this.container = container;
    this.engine = engine;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.bus.on('SCORE_COMMITTED', () => this.render());
    this.bus.on('ROUND_ADVANCED', () => this.render());
    this.bus.on('TURN_STARTED', () => this.render());
  }

  public render(gameState?: GameState): void {
    const state = gameState || this.engine.getState();
    if (!state) return;

    const pScore = state.player.scorecard.grandTotal;
    const bScore = state.bot.scorecard.grandTotal;
    const diffLabel = state.difficulty.toUpperCase();
    const isBotTurn = state.activePlayer === 'bot';

    this.container.innerHTML = `
      <div class="reference-header-wrapper ${isBotTurn ? 'is-bot-header' : ''}">
        <!-- Left Action: Back to Menu / Pause -->
        <button class="circle-header-btn" id="btn-header-back" title="Menu / Pause" aria-label="Menu">
          ${Icons.arrowLeft(20, '#1e354d')}
        </button>

        <!-- Center: VS Capsule on Player Turn OR Big "Bot's Turn" on Bot Turn -->
        ${isBotTurn ? `
          <div class="bot-turn-header-title animate-bounce-subtle">
            <span class="bot-header-avatar">🤖</span>
            <span class="bot-header-text">Bot's Turn</span>
          </div>
        ` : `
          <div class="vs-capsule-container">
            <div class="diff-tab-pill">${diffLabel}</div>
            <div class="vs-capsule-body">
              <div class="score-player-side">
                <span class="capsule-label">YOU</span>
                <span class="capsule-score-val player">${pScore}</span>
              </div>

              <span class="capsule-vs-text">VS</span>

              <div class="score-bot-side">
                <span class="capsule-label">BOT</span>
                <span class="capsule-score-val bot">${bScore}</span>
              </div>
            </div>
          </div>
        `}

        <!-- Right Action: Restart Match -->
        <button class="circle-header-btn" id="btn-header-restart" title="Restart Game" aria-label="Restart">
          ${Icons.refresh(20, '#1e354d')}
        </button>
      </div>
    `;

    this.container.querySelector('#btn-header-back')?.addEventListener('click', () => {
      this.bus.emit('REQUEST_PAUSE');
    });

    this.container.querySelector('#btn-header-restart')?.addEventListener('click', () => {
      if (confirm('Restart current match?')) {
        this.bus.emit('REQUEST_REMATCH');
      }
    });
  }
}
