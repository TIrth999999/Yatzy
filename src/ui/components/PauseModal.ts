import { GameEngine } from '../../core/GameEngine';
import { EventBus } from '../../core/EventBus';
import { Icons } from '../icons/Icons';

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
        <div class="modal-content" style="max-width: 380px;">
          <div class="modal-header">
            <h2>${Icons.pause(22, '#1e354d')} Game Paused</h2>
            <button class="modal-close-btn" id="btn-close-pause" aria-label="Resume">
              ${Icons.close(18, '#1e354d')}
            </button>
          </div>
          <div class="modal-body" style="gap: 10px; padding: 20px;">
            <button class="btn btn-primary" id="btn-pause-resume" style="height: 50px; font-size: 1.08rem;">
              ${Icons.play(18, '#ffffff')} Resume Match
            </button>
            <button class="btn btn-secondary" id="btn-pause-restart" style="height: 44px; font-size: 0.95rem;">
              ${Icons.refresh(18, '#1e354d')} Restart Match
            </button>
            <button class="btn btn-secondary" id="btn-pause-htp" style="height: 44px; font-size: 0.95rem;">
              ${Icons.book(18, '#1e354d')} How to Play
            </button>
            <button class="btn btn-secondary" id="btn-pause-settings" style="height: 44px; font-size: 0.95rem;">
              ${Icons.settings(18, '#1e354d')} Settings
            </button>
            <button class="btn btn-danger" id="btn-pause-menu" style="height: 44px; font-size: 0.95rem; margin-top: 4px;">
              ${Icons.arrowLeft(18, '#ef4444')} Quit to Menu
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
    const resumeAndClose = () => {
      this.close();
      this.engine.resume();
    };

    this.container.querySelector('#btn-close-pause')?.addEventListener('click', resumeAndClose);
    this.container.querySelector('#btn-pause-resume')?.addEventListener('click', resumeAndClose);

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
