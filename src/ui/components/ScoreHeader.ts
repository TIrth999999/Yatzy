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
          ${Icons.arrowLeft(40, '#1e354d')}
        </button>

        <!-- Center: Persistent VS Capsule with Active Player Turn Highlight -->
        <div class="vs-capsule-container">
          <div class="diff-tab-pill ${isBotTurn ? 'bot-turn' : 'player-turn'}">
            ${diffLabel} • ${isBotTurn ? "BOT'S TURN 🤖" : "YOUR TURN"}
          </div>
          <div class="vs-capsule-body">
            <div class="score-player-side ${!isBotTurn ? 'active-turn' : ''}">
              <span class="capsule-label">YOU</span>
              <span class="capsule-score-val player">${pScore}</span>
            </div>

            <span class="capsule-vs-text">VS</span>

            <div class="score-bot-side ${isBotTurn ? 'active-turn' : ''}">
              <span class="capsule-label">BOT</span>
              <span class="capsule-score-val bot">${bScore}</span>
            </div>
          </div>
        </div>

        <!-- Right Spacer to keep center scoreboard capsule perfectly centered -->
        <div style="width: 60px; height: 60px; visibility: hidden;" aria-hidden="true"></div>
      </div>
    `;

    this.container.querySelector('#btn-header-back')?.addEventListener('click', () => {
      this.bus.emit('REQUEST_PAUSE');
    });
  }
}
