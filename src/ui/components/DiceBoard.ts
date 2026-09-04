import { GameEngine } from '../../core/GameEngine';
import { EventBus } from '../../core/EventBus';
import { Dice3DComponent } from './Dice3D';

export class DiceBoard {
  private container: HTMLElement;
  private engine: GameEngine;
  private bus: EventBus = EventBus.getInstance();
  private dice3d: Dice3DComponent = new Dice3DComponent();
  private isRolling: boolean = false;
  private botStatusMessage: string = 'Bot is rolling dice...';

  constructor(container: HTMLElement, engine: GameEngine) {
    this.container = container;
    this.engine = engine;
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
  }

  private setupEventListeners(): void {
    this.bus.on('DICE_ROLLED', (data: any) => {
      this.isRolling = true;
      if (data.player === 'bot') {
        this.botStatusMessage = `Bot rolling (Roll ${data.rollCount}/3)...`;
        this.updateBotStatusUI();
      }
      this.dice3d.animateRoll(this.container, data.rolledIndices, data.values, () => {
        this.isRolling = false;
        this.render();
      });
    });

    this.bus.on('DIE_HOLD_TOGGLED', (data: any) => {
      const scene = this.container.querySelector(`.die-scene[data-index="${data.dieIndex}"]`);
      if (scene) {
        if (data.isHeld) scene.classList.add('held');
        else scene.classList.remove('held');
      }
    });

    this.bus.on('TURN_STARTED', (data: any) => {
      if (data && data.player === 'bot') {
        this.botStatusMessage = 'Bot is deciding strategy...';
      } else {
        this.botStatusMessage = '';
      }
      this.render();
    });

    this.bus.on('BOT_HOLDS_DECIDED', (data: any) => {
      const heldCount = data.holds.filter(Boolean).length;
      this.botStatusMessage = heldCount > 0
        ? `Bot held ${heldCount} ${heldCount === 1 ? 'die' : 'dice'}, preparing next roll...`
        : 'Bot re-rolling all dice...';
      this.updateBotStatusUI();

      data.holds.forEach((held: boolean, idx: number) => {
        const scene = this.container.querySelector(`.die-scene[data-index="${idx}"]`);
        if (scene) {
          if (held) scene.classList.add('held');
          else scene.classList.remove('held');
        }
      });
    });

    this.bus.on('SCORE_COMMITTED', (data: any) => {
      if (data.player === 'bot') {
        this.botStatusMessage = `Bot scored ${data.score} on ${data.category}!`;
        this.updateBotStatusUI();
      }
    });
  }

  private updateBotStatusUI(): void {
    const textEl = this.container.querySelector('.bot-status-message-text');
    if (textEl) {
      textEl.textContent = this.botStatusMessage;
    }
  }

  private setupKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      const state = this.engine.getState();
      if (state.phase === 'PAUSED' || state.phase === 'GAME_OVER' || state.activePlayer !== 'player') return;

      if (e.code === 'KeyR' || e.code === 'Space') {
        if (!this.isRolling && this.engine.getDice().canRoll()) {
          e.preventDefault();
          this.engine.playerRoll();
        }
      }

      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key, 10) - 1;
        this.engine.playerToggleHold(idx);
      }
    });
  }

  public render(): void {
    const dice = this.engine.getDice().getDice();
    const rollCount = this.engine.getDice().getRollCount();
    const state = this.engine.getState();
    const isPlayer = state.activePlayer === 'player';
    const canRoll = isPlayer && this.engine.getDice().canRoll() && !this.isRolling;
    const canScore = isPlayer && rollCount > 0;

    this.container.innerHTML = `
      <div class="dice-board-wrapper ${!isPlayer ? 'bot-turn-active' : ''}">
        <!-- 3D Dice Tray -->
        ${this.dice3d.renderTrayHTML(dice, rollCount)}

        <!-- Bottom Action Controls matching reference screenshot 1, 3, & 5 -->
        ${isPlayer ? `
          <div class="roll-controls-container">
            <button class="btn-roll-reference ${canRoll ? '' : 'disabled'}" id="btn-roll-action" ${canRoll ? '' : 'disabled'}>
              <span class="roll-text">ROLL</span>
              <div class="roll-pills-group">
                <span class="roll-pill ${rollCount === 1 ? 'active' : ''}">1</span>
                <span class="roll-pill ${rollCount === 2 ? 'active' : ''}">2</span>
                <span class="roll-pill ${rollCount === 3 ? 'active' : ''}">3</span>
              </div>
            </button>

            ${canScore ? `
              <button class="btn-play-reference" id="btn-play-action" title="Commit score on scorecard">
                PLAY
              </button>
            ` : ''}
          </div>
        ` : `
          <div class="bot-status-container animate-fade-in">
            <div class="bot-status-pill">
              <span class="bot-pulse-icon">🤖</span>
              <span class="bot-status-message-text">${this.botStatusMessage || "Bot's Turn — Rolling..."}</span>
            </div>
          </div>
        `}
      </div>
    `;

    if (isPlayer) {
      this.attachDieClickHandlers();

      this.container.querySelector('#btn-roll-action')?.addEventListener('click', () => {
        if (canRoll) {
          this.engine.playerRoll();
        }
      });

      this.container.querySelector('#btn-play-action')?.addEventListener('click', () => {
        const scorecard = document.querySelector('.scorecard-board-reference');
        scorecard?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  private attachDieClickHandlers(): void {
    const scenes = this.container.querySelectorAll('.die-scene');
    scenes.forEach(scene => {
      scene.addEventListener('click', () => {
        const index = parseInt(scene.getAttribute('data-index') || '0', 10);
        this.engine.playerToggleHold(index);
      });
    });
  }
}
