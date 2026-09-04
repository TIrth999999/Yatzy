import { Difficulty } from '../../types/game';
import { EventBus } from '../../core/EventBus';
import { DailyChallenge } from '../../daily/DailyChallenge';

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
        background: radial-gradient(circle at 50% 30%, #362244 0%, #150f24 100%);
        z-index: 80;
        overflow-y: auto;
      ">
        <div style="max-width: 480px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 20px;">
          <!-- Logo & Title -->
          <div style="text-align: center;">
            <div style="font-size: 3.5rem; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.5));">🎲</div>
            <h1 style="
              font-size: 2.6rem;
              font-weight: 900;
              letter-spacing: -0.02em;
              background: linear-gradient(135deg, #ffffff 0%, #ffd32a 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              line-height: 1.1;
              margin-top: 4px;
            ">
              YATZY CLASH
            </h1>
            <p style="font-size: 0.95rem; font-weight: 700; color: var(--accent-cyan); letter-spacing: 0.15em; text-transform: uppercase;">
              DICE MASTERS
            </p>
          </div>

          <!-- Difficulty Cards Selection -->
          <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--text-light-muted); letter-spacing: 0.06em; text-align: center;">
              SELECT DIFFICULTY
            </div>

            <div class="diff-card" data-diff="easy" style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 14px 20px;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: var(--radius-md);
              cursor: pointer;
              transition: transform 0.15s ease, background 0.15s ease;
            ">
              <div>
                <div style="font-weight: 800; font-size: 1.1rem; color: #4cd137;">EASY</div>
                <div style="font-size: 0.78rem; color: var(--text-light-muted);">Relaxed opponent</div>
              </div>
              <div style="color: #4cd137; font-size: 0.9rem;">★★☆☆☆</div>
            </div>

            <div class="diff-card selected" data-diff="medium" style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 14px 20px;
              background: rgba(0, 210, 211, 0.15);
              border: 2px solid var(--accent-cyan);
              border-radius: var(--radius-md);
              cursor: pointer;
              transition: transform 0.15s ease, background 0.15s ease;
            ">
              <div>
                <div style="font-weight: 800; font-size: 1.1rem; color: var(--accent-cyan);">MEDIUM</div>
                <div style="font-size: 0.78rem; color: var(--text-light-muted);">Smart, tactical opponent</div>
              </div>
              <div style="color: var(--accent-cyan); font-size: 0.9rem;">★★★☆☆</div>
            </div>

            <div class="diff-card" data-diff="hard" style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 14px 20px;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: var(--radius-md);
              cursor: pointer;
              transition: transform 0.15s ease, background 0.15s ease;
            ">
              <div>
                <div style="font-weight: 800; font-size: 1.1rem; color: var(--primary-coral);">HARD</div>
                <div style="font-size: 0.78rem; color: var(--text-light-muted);">Expert 32-hold EV strategy</div>
              </div>
              <div style="color: var(--primary-coral); font-size: 0.9rem;">★★★★★</div>
            </div>
          </div>

          <!-- Play Buttons -->
          <div style="width: 100%; display: flex; flex-direction: column; gap: 10px; margin-top: 6px;">
            <button class="btn btn-primary" id="btn-play-quick" style="height: 60px; font-size: 1.35rem; width: 100%;">
              PLAY NOW
            </button>

            <div style="display: flex; gap: 10px; width: 100%;">
              <button class="btn btn-gold" id="btn-play-daily" style="flex: 1; height: 46px; font-size: 0.9rem;">
                📅 Daily Challenge ${isDailyDone ? '✓' : ''}
              </button>
              <button class="btn btn-secondary" id="btn-play-practice" style="flex: 1; height: 46px; font-size: 0.9rem;">
                🎯 Solo Practice
              </button>
            </div>
          </div>

          <!-- Secondary Menu Row -->
          <div style="display: flex; gap: 10px; width: 100%; justify-content: center; margin-top: 10px;">
            <button class="btn btn-secondary btn-icon" id="btn-menu-htp" title="How to Play" aria-label="How to Play">
              📖
            </button>
            <button class="btn btn-secondary btn-icon" id="btn-menu-stats" title="Statistics" aria-label="Statistics">
              📊
            </button>
            <button class="btn btn-secondary btn-icon" id="btn-menu-ach" title="Achievements" aria-label="Achievements">
              🏆
            </button>
            <button class="btn btn-secondary btn-icon" id="btn-menu-cosmetics" title="Dice Themes" aria-label="Dice Themes">
              🎨
            </button>
            <button class="btn btn-secondary btn-icon" id="btn-menu-settings" title="Settings" aria-label="Settings">
              ⚙️
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
          (c as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)';
          (c as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
        });
        card.classList.add('selected');
        (card as HTMLElement).style.background = 'rgba(0, 210, 211, 0.15)';
        (card as HTMLElement).style.borderColor = 'var(--accent-cyan)';
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
