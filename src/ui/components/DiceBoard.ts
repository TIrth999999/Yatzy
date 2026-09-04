import { DieState, DieValue } from '../../types/game';
import { GameEngine } from '../../core/GameEngine';
import { EventBus } from '../../core/EventBus';

export class DiceBoard {
  private container: HTMLElement;
  private engine: GameEngine;
  private bus: EventBus = EventBus.getInstance();
  private rollBtn: HTMLButtonElement | null = null;
  private isRolling: boolean = false;

  constructor(container: HTMLElement, engine: GameEngine) {
    this.container = container;
    this.engine = engine;
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
  }

  private setupEventListeners(): void {
    this.bus.on('DICE_ROLLED', (data: any) => {
      this.animateRoll(data.rolledIndices, data.values);
    });

    this.bus.on('DIE_HOLD_TOGGLED', (data: any) => {
      this.updateHoldVisual(data.dieIndex, data.isHeld);
    });

    this.bus.on('TURN_STARTED', () => {
      this.render();
    });

    this.bus.on('BOT_HOLDS_DECIDED', (data: any) => {
      data.holds.forEach((held: boolean, idx: number) => {
        this.updateHoldVisual(idx, held);
      });
    });
  }

  private setupKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e) => {
      const state = this.engine.getState();
      if (state.phase === 'PAUSED' || state.phase === 'GAME_OVER' || state.activePlayer !== 'player') return;

      // Space or R: Roll
      if (e.code === 'KeyR' || e.code === 'Space') {
        if (!this.isRolling && this.engine.getDice().canRoll()) {
          e.preventDefault();
          this.engine.playerRoll();
        }
      }

      // 1-5: Toggle hold
      if (e.key >= '1' && e.key <= '5') {
        const idx = parseInt(e.key) - 1;
        this.engine.playerToggleHold(idx);
      }
    });
  }

  public render(): void {
    const dice = this.engine.getDice().getDice();
    const rollCount = this.engine.getDice().getRollCount();
    const maxRolls = this.engine.getDice().getMaxRolls();
    const state = this.engine.getState();
    const isPlayer = state.activePlayer === 'player';
    const canRoll = isPlayer && this.engine.getDice().canRoll() && !this.isRolling;

    this.container.innerHTML = `
      <div class="dice-board-inner" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
        <div class="dice-tray" id="dice-tray">
          ${dice.map((d, i) => this.renderDieHTML(d, i)).join('')}
        </div>

        <div class="dice-instruction-hint" style="margin: 8px 0; min-height: 20px;">
          ${this.getInstructionText(state.activePlayer, rollCount)}
        </div>

        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;">
          <button class="btn btn-primary btn-roll-main" id="btn-roll-action" ${canRoll ? '' : 'disabled'}>
            ${this.getRollButtonLabel(rollCount, maxRolls, isPlayer)}
          </button>

          <div class="keyboard-hints desktop-only">
            <span><span class="kbd-key">R</span> or <span class="kbd-key">Space</span> to Roll</span>
            <span><span class="kbd-key">1</span>-<span class="kbd-key">5</span> to Hold</span>
          </div>
        </div>
      </div>
    `;

    this.attachDieClickHandlers();

    this.rollBtn = this.container.querySelector('#btn-roll-action');
    this.rollBtn?.addEventListener('click', () => {
      if (canRoll) {
        this.engine.playerRoll();
      }
    });
  }

  private getInstructionText(activePlayer: string, rollCount: number): string {
    if (activePlayer === 'bot') {
      return '<span style="color: var(--accent-cyan); font-weight: 700;">🤖 Bot is thinking...</span>';
    }
    if (rollCount === 0) {
      return 'Press ROLL to start your turn';
    }
    if (rollCount < 3) {
      return 'Tap dice to KEEP them, then Roll or Score';
    }
    return 'Final roll! Choose a category on the scorecard to score';
  }

  private getRollButtonLabel(rollCount: number, maxRolls: number, isPlayer: boolean): string {
    if (!isPlayer) {
      return 'BOT\'S TURN';
    }
    if (rollCount === 0) {
      return 'ROLL DICE (1/3)';
    }
    if (rollCount >= maxRolls) {
      return 'CHOOSE SCORE';
    }
    return `ROLL AGAIN (${rollCount + 1}/${maxRolls})`;
  }

  private renderDieHTML(die: DieState, index: number): string {
    const heldClass = die.held ? 'held' : '';
    return `
      <div class="die-wrapper ${heldClass}" data-index="${index}">
        <div class="die" data-value="${die.value}">
          ${this.renderPipsHTML(die.value)}
        </div>
        <span class="die-hold-badge">HELD</span>
      </div>
    `;
  }

  private renderPipsHTML(value: DieValue): string {
    return Array.from({ length: value }, () => '<span class="pip"></span>').join('');
  }

  private attachDieClickHandlers(): void {
    const wrappers = this.container.querySelectorAll('.die-wrapper');
    wrappers.forEach(wrap => {
      wrap.addEventListener('click', () => {
        const index = parseInt(wrap.getAttribute('data-index') || '0', 10);
        this.engine.playerToggleHold(index);
      });
    });
  }

  private updateHoldVisual(index: number, isHeld: boolean): void {
    const wrap = this.container.querySelector(`.die-wrapper[data-index="${index}"]`);
    if (wrap) {
      if (isHeld) wrap.classList.add('held');
      else wrap.classList.remove('held');
    }
  }

  private animateRoll(rolledIndices: number[], newValues: DieValue[]): void {
    this.isRolling = true;
    const wrappers = this.container.querySelectorAll('.die-wrapper');

    rolledIndices.forEach(idx => {
      const wrap = wrappers[idx];
      if (wrap) {
        const dieElem = wrap.querySelector('.die') as HTMLElement;
        if (dieElem) {
          dieElem.classList.remove('rolling');
          // Force reflow
          void dieElem.offsetWidth;
          dieElem.classList.add('rolling');

          // Change pips midway through tumble
          setTimeout(() => {
            const val = newValues[idx];
            dieElem.setAttribute('data-value', val.toString());
            dieElem.innerHTML = this.renderPipsHTML(val);
          }, 200);
        }
      }
    });

    setTimeout(() => {
      this.isRolling = false;
      this.render();
    }, 450);
  }
}
