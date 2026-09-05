import { GameEngine } from '../../core/GameEngine';
import { DieValue } from '../../types/game';

export class DebugPanel {
  private container: HTMLElement;
  private engine: GameEngine;
  private isVisible: boolean = false;

  constructor(container: HTMLElement, engine: GameEngine) {
    this.container = container;
    this.engine = engine;
    this.setupShortcut();
  }

  private setupShortcut(): void {
    window.addEventListener('keydown', (e) => {
      // Toggle debug panel with backtick ` or ~
      if (e.key === '`' || e.key === '~') {
        this.toggle();
      }
    });

    // Also check URL param `?debug=1`
    if (window.location.search.includes('debug=1')) {
      this.show();
    }
  }

  public toggle(): void {
    if (this.isVisible) this.hide();
    else this.show();
  }

  public hide(): void {
    this.isVisible = false;
    this.container.innerHTML = '';
  }

  public show(): void {
    this.isVisible = true;
    const botLogs = this.engine.getBotEngine().getLogs();
    const lastBotLog = botLogs.length > 0 ? botLogs[botLogs.length - 1] : null;

    this.container.innerHTML = `
      <div style="
        position: fixed;
        bottom: 12px;
        right: 12px;
        width: 320px;
        max-height: 480px;
        background: rgba(15, 12, 25, 0.95);
        border: 1px solid #00d2d3;
        border-radius: 8px;
        padding: 12px;
        font-family: monospace;
        font-size: 0.75rem;
        color: #00d2d3;
        z-index: 9999;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.8);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong>DEV DEBUG PANEL (~ to hide)</strong>
          <button id="btn-dbg-close" style="background: none; border: none; color: #fff; cursor: pointer;">✕</button>
        </div>

        <div style="margin-bottom: 10px;">
          <div>Set Dice Values:</div>
          <div style="display: flex; gap: 4px; margin-top: 4px;">
            <button class="btn-dbg-set" data-val="1,1,1,1,1">1s (Yatzy)</button>
            <button class="btn-dbg-set" data-val="6,6,6,6,6">6s (Yatzy)</button>
            <button class="btn-dbg-set" data-val="1,2,3,4,5">L.Straight</button>
            <button class="btn-dbg-set" data-val="5,5,5,6,6">FullHouse</button>
          </div>
        </div>

        <div style="margin-bottom: 10px;">
          <div>Bot Speed:</div>
          <button id="btn-dbg-instant-bot" style="margin-top: 4px; padding: 2px 6px;">Toggle Instant Bot</button>
        </div>

        <div>
          <strong>Last Bot AI Log:</strong>
          <pre style="background: #000; padding: 6px; border-radius: 4px; max-height: 120px; overflow-x: auto; color: #fff; margin-top: 4px;">${
            lastBotLog ? JSON.stringify(lastBotLog, null, 2) : 'No bot turns yet'
          }</pre>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-dbg-close')?.addEventListener('click', () => this.hide());

    this.container.querySelectorAll('.btn-dbg-set').forEach(btn => {
      btn.addEventListener('click', () => {
        const valStr = btn.getAttribute('data-val');
        if (valStr) {
          const vals = valStr.split(',').map(Number) as DieValue[];
          this.engine.getDice().setDiceValues(vals);
          this.engine.getState().phase = 'PLAYER_DECIDING';
          this.show();
        }
      });
    });

    this.container.querySelector('#btn-dbg-instant-bot')?.addEventListener('click', () => {
      this.engine.getBotEngine().setInstantMode(true);
    });
  }
}
