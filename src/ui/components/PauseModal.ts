import { GameEngine } from '../../core/GameEngine';
import { EventBus } from '../../core/EventBus';

export class PauseModal {
  private container: HTMLElement;
  private engine: GameEngine;
  private bus: EventBus = EventBus.getInstance();

  constructor(container: HTMLElement, engine: GameEngine) {
    this.container = container;
    this.engine = engine;
  }

  public show(): void {
    this.container.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-content" style="max-width: 380px; text-align: center;">
          <div class="modal-header" style="justify-content: center;">
            <h2>Game Paused</h2>
          </div>
          <div class="modal-body" style="gap: 12px; padding: 24px;">
            <button class="btn btn-primary" id="btn-pause-resume" style="height: 50px; font-size: 1.1rem;">
              ▶️ Resume Match
            </button>
            <button class="btn btn-secondary" id="btn-pause-restart" style="height: 46px;">
              🔄 Restart Match
            </button>
            <button class="btn btn-secondary" id="btn-pause-settings" style="height: 46px;">
              ⚙️ Settings
            </button>
            <button class="btn btn-secondary" id="btn-pause-htp" style="height: 46px;">
              📖 How to Play
            </button>
            <button class="btn btn-secondary" id="btn-pause-menu" style="height: 46px; border-color: rgba(255, 82, 82, 0.4); color: #ff5252;">
              🏠 Quit to Menu
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachHandlers();
  }

  public close(): void {
    this.container.innerHTML = '';
  }

  private attachHandlers(): void {
    this.container.querySelector('#btn-pause-resume')?.addEventListener('click', () => {
      this.close();
      this.engine.resume();
    });

    this.container.querySelector('#btn-pause-restart')?.addEventListener('click', () => {
      this.close();
      this.engine.startMatch(this.engine.getState().mode, this.engine.getState().difficulty);
    });

    this.container.querySelector('#btn-pause-settings')?.addEventListener('click', () => {
      this.bus.emit('REQUEST_SETTINGS');
    });

    this.container.querySelector('#btn-pause-htp')?.addEventListener('click', () => {
      this.bus.emit('REQUEST_HOW_TO_PLAY');
    });

    this.container.querySelector('#btn-pause-menu')?.addEventListener('click', () => {
      this.close();
      this.bus.emit('REQUEST_MAIN_MENU');
    });
  }
}
