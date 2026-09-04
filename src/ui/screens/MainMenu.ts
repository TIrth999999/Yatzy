import { Difficulty } from '../../types/game';
import { EventBus } from '../../core/EventBus';
import { DailyChallenge } from '../../daily/DailyChallenge';
import { Icons } from '../icons/Icons';

export class MainMenu {
  private container: HTMLElement;
  private bus: EventBus = EventBus.getInstance();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public show(): void {
    const isDailyDone = DailyChallenge.isDailyCompletedToday();

    this.container.innerHTML = `
      <div class="main-menu-overlay" style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: var(--bg-canvas);
        z-index: 80;
        overflow-y: auto;
      ">
        <div style="max-width: 460px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 18px;">
          <!-- Logo & Title -->
          <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: 72px;
              height: 72px;
              background: #ffffff;
              border: 3.5px solid var(--board-border);
              border-radius: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
              margin-bottom: 6px;
            ">
              <svg width="48" height="48" viewBox="0 0 24 24">
                <circle cx="7" cy="7" r="2.4" fill="#ff5e57"/>
                <circle cx="17" cy="17" r="2.4" fill="#ff5e57"/>
                <circle cx="12" cy="12" r="2.8" fill="#ff5e57"/>
              </svg>
            </div>

            <h1 style="
              font-size: 2.5rem;
              font-weight: 900;
              letter-spacing: -0.01em;
              color: #ffffff;
              text-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
              line-height: 1.05;
            ">
              YATZY CLASH
            </h1>
            <p style="font-size: 0.88rem; font-weight: 800; color: rgba(255, 255, 255, 0.9); letter-spacing: 0.16em; text-transform: uppercase; margin-top: 2px;">
              DICE MASTERS
            </p>
          </div>

          <!-- Difficulty Cards Selection -->
          <div style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 0.78rem; font-weight: 800; color: rgba(255, 255, 255, 0.85); letter-spacing: 0.08em; text-align: center;">
              SELECT DIFFICULTY
            </div>

            <div class="diff-card" data-diff="easy" style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 18px;
              background: #ffffff;
              border: 2px solid #e2e8f0;
              border-radius: var(--radius-md);
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              transition: transform 0.15s ease, border-color 0.15s ease;
            ">
              <div>
                <div style="font-weight: 900; font-size: 1.05rem; color: #2ecc71;">EASY</div>
                <div style="font-size: 0.76rem; color: #64748b; font-weight: 600;">Relaxed opponent</div>
              </div>
              <div style="color: #2ecc71; font-size: 0.85rem; font-weight: 900;">★★☆☆☆</div>
            </div>

            <div class="diff-card selected" data-diff="medium" style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 18px;
              background: #ffffff;
              border: 3px solid #00b4d8;
              border-radius: var(--radius-md);
              cursor: pointer;
              box-shadow: 0 4px 16px rgba(0, 180, 216, 0.35);
              transition: transform 0.15s ease, border-color 0.15s ease;
            ">
              <div>
                <div style="font-weight: 900; font-size: 1.05rem; color: #00b4d8;">MEDIUM</div>
                <div style="font-size: 0.76rem; color: #64748b; font-weight: 600;">Smart, tactical opponent</div>
              </div>
              <div style="color: #00b4d8; font-size: 0.85rem; font-weight: 900;">★★★☆☆</div>
            </div>

            <div class="diff-card" data-diff="hard" style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 18px;
              background: #ffffff;
              border: 2px solid #e2e8f0;
              border-radius: var(--radius-md);
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              transition: transform 0.15s ease, border-color 0.15s ease;
            ">
              <div>
                <div style="font-weight: 900; font-size: 1.05rem; color: #ff5e57;">HARD</div>
                <div style="font-size: 0.76rem; color: #64748b; font-weight: 600;">Expert 32-hold EV strategy</div>
              </div>
              <div style="color: #ff5e57; font-size: 0.85rem; font-weight: 900;">★★★★★</div>
            </div>
          </div>

          <!-- Play Buttons -->
          <div style="width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
            <button class="btn btn-primary" id="btn-play-quick" style="
              height: 56px;
              font-size: 1.3rem;
              width: 100%;
              background: #e84d43;
              box-shadow: 0 6px 0 #b33930, 0 8px 20px rgba(0,0,0,0.22);
              border-radius: 16px;
            ">
              PLAY NOW
            </button>

            <div style="display: flex; gap: 10px; width: 100%;">
              <button class="btn btn-gold" id="btn-play-daily" style="flex: 1; height: 44px; font-size: 0.88rem;">
                Daily Challenge ${isDailyDone ? '✓' : ''}
              </button>
              <button class="btn btn-secondary" id="btn-play-practice" style="flex: 1; height: 44px; font-size: 0.88rem; background: #ffffff;">
                Solo Practice
              </button>
            </div>
          </div>

          <!-- Navigation Icon Row -->
          <div style="display: flex; gap: 14px; width: 100%; justify-content: center; margin-top: 6px;">
            <button class="circle-header-btn" id="btn-menu-htp" title="How to Play" aria-label="How to Play">
              ${Icons.book(20, '#23374d')}
            </button>
            <button class="circle-header-btn" id="btn-menu-stats" title="Statistics" aria-label="Statistics">
              ${Icons.chart(20, '#23374d')}
            </button>
            <button class="circle-header-btn" id="btn-menu-ach" title="Achievements" aria-label="Achievements">
              ${Icons.trophy(20, '#23374d')}
            </button>
            <button class="circle-header-btn" id="btn-menu-cosmetics" title="Dice Themes" aria-label="Dice Themes">
              ${Icons.palette(20, '#23374d')}
            </button>
            <button class="circle-header-btn" id="btn-menu-settings" title="Settings" aria-label="Settings">
              ${Icons.settings(20, '#23374d')}
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachHandlers();
  }

  public hide(): void {
    this.container.innerHTML = '';
  }

  private attachHandlers(): void {
    let selectedDiff: Difficulty = 'medium';

    const cards = this.container.querySelectorAll('.diff-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => {
          c.classList.remove('selected');
          (c as HTMLElement).style.border = '2px solid #e2e8f0';
          (c as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });
        card.classList.add('selected');
        (card as HTMLElement).style.border = '3px solid #00b4d8';
        (card as HTMLElement).style.boxShadow = '0 4px 16px rgba(0, 180, 216, 0.35)';
        selectedDiff = card.getAttribute('data-diff') as Difficulty;
      });
    });

    this.container.querySelector('#btn-play-quick')?.addEventListener('click', () => {
      this.hide();
      this.bus.emit('START_MATCH', { mode: 'quick', difficulty: selectedDiff });
    });

    this.container.querySelector('#btn-play-practice')?.addEventListener('click', () => {
      this.hide();
      this.bus.emit('START_MATCH', { mode: 'practice', difficulty: selectedDiff });
    });

    this.container.querySelector('#btn-play-daily')?.addEventListener('click', () => {
      this.hide();
      DailyChallenge.setupDailyChallengeRNG();
      this.bus.emit('START_MATCH', { mode: 'daily', difficulty: 'hard' });
    });

    this.container.querySelector('#btn-menu-htp')?.addEventListener('click', () => {
      this.bus.emit('REQUEST_HOW_TO_PLAY');
    });

    this.container.querySelector('#btn-menu-stats')?.addEventListener('click', () => {
      this.bus.emit('REQUEST_STATS');
    });

    this.container.querySelector('#btn-menu-ach')?.addEventListener('click', () => {
      this.bus.emit('REQUEST_ACHIEVEMENTS');
    });

    this.container.querySelector('#btn-menu-cosmetics')?.addEventListener('click', () => {
      this.bus.emit('REQUEST_COSMETICS');
    });

    this.container.querySelector('#btn-menu-settings')?.addEventListener('click', () => {
      this.bus.emit('REQUEST_SETTINGS');
    });
  }
}
