import { GameEngine } from '../../core/GameEngine';
import { EventBus } from '../../core/EventBus';
import { Dice3DComponent } from './Dice3D';
import { SmartRecommender } from '../../scoring/SmartRecommender';
import { CATEGORY_METAS } from '../../types/game';
import { Icons } from '../icons/Icons';

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

    this.bus.on('SKIN_CHANGED', () => {
      this.render();
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
    const rollsLeft = Math.max(0, 3 - rollCount);
    const diceValues = this.engine.getDice().getValues();

    const recommendation = (isPlayer && rollCount > 0)
      ? SmartRecommender.recommend(diceValues, state.player.scorecard, rollCount)
      : null;

    const tipCategoryName = recommendation ? (CATEGORY_METAS[recommendation.category]?.name || recommendation.category) : '';
    const tipText = recommendation
      ? `Tip: <strong>${tipCategoryName}</strong> is open! Score <strong>${recommendation.score}</strong> pts`
      : `Tip: Aim for high combinations or 4+ matching dice!`;

    const feedbackText = recommendation
      ? (recommendation.score >= 20 ? '🔥 Amazing roll! Score now!' : (recommendation.score > 0 ? '✨ Nice! Keep going!' : '🎲 Pick dice to hold or reroll'))
      : '🎲 Tap dice to hold or roll to play';

    this.container.innerHTML = `
      <div class="gameplay-wrapper ${!isPlayer ? 'bot-turn-active' : ''}">
        <!-- Glassmorphism Dice Tray Card -->
        <div class="dice-glass-card">
          <!-- 3D Dice Tray -->
          <div class="dice-tray-wrapper">
            ${this.dice3d.renderTrayHTML(dice, rollCount)}
          </div>

          <!-- Action Area (Player Roll Button or Bot Status) -->
          ${isPlayer ? `
            <div class="roll-action-area">
              <button class="btn-roll-3d ${canRoll ? '' : 'disabled'}" id="btn-roll-action" ${canRoll ? '' : 'disabled'}>
                <span class="btn-roll-title">${rollsLeft === 0 ? 'SELECT CATEGORY' : 'ROLL DICE'}</span>
                <div class="btn-roll-badge">
                  <span class="badge-num">${rollsLeft}</span>
                  <span class="badge-label">${rollsLeft === 1 ? 'ROLL LEFT' : 'ROLLS LEFT'}</span>
                </div>
              </button>

              <div class="roll-feedback-chip">
                <span>${feedbackText}</span>
                ${recommendation ? `<span class="chip-score">+${recommendation.score}</span>` : ''}
              </div>
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

        <!-- Bottom HUD Row: Combo Card, Tip Card (Vector SVG Icons) -->
        <div class="bottom-hud-row">
          <div class="hud-combo-card">
            ${Icons.flame(20, '#ff5252')}
            <div class="hud-combo-body">
              <span class="hud-combo-title">COMBO x2</span>
              <div class="hud-combo-bar">
                <div class="hud-combo-fill" style="width: ${Math.min(100, (rollCount / 3) * 100)}%;"></div>
              </div>
            </div>
            <span class="hud-combo-fraction">${rollCount}/3</span>
          </div>

          <div class="hud-tip-card" title="Smart AI Strategy Advisor">
            ${Icons.lightbulb(20, '#ffd200')}
            <div class="hud-tip-content">${tipText}</div>
          </div>
        </div>
      </div>
    `;

    if (isPlayer) {
      this.attachDieClickHandlers();

      this.container.querySelector('#btn-roll-action')?.addEventListener('click', () => {
        if (canRoll) {
          this.engine.playerRoll();
        } else if (rollsLeft === 0) {
          const scorecard = document.querySelector('.scorecard-modern-card') || document.querySelector('.scorecard-board-reference');
          scorecard?.scrollIntoView({ behavior: 'smooth' });
        }
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
