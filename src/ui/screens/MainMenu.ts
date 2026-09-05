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
          <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
            <img src="assets/two-dice-icon.png" alt="Yatzy Clash Logo" style="width: 100px; height: auto; margin-bottom: 6px;" />

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

          <!-- Difficulty Selection Slider & Animated Expression -->
          <div style="width: 100%; display: flex; flex-direction: column; gap: 10px;">
            <div style="font-size: 0.78rem; font-weight: 800; color: rgba(255, 255, 255, 0.85); letter-spacing: 0.08em; text-align: center;">
              SELECT DIFFICULTY
            </div>

            <!-- Animated Face & Difficulty Details Card -->
            <div id="diff-info-card" style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 18px;
              background: #ffffff;
              border: 3px solid #00b4d8;
              border-radius: var(--radius-md);
              box-shadow: 0 4px 16px rgba(0, 180, 216, 0.35);
              transition: border-color 0.25s ease, box-shadow 0.25s ease;
            ">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div id="diff-face-icon" style="
                  font-size: 2.2rem;
                  line-height: 1;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                  user-select: none;
                ">
                  😏
                </div>
                <div>
                  <div id="diff-title" style="font-weight: 900; font-size: 1.08rem; color: #00b4d8; transition: color 0.25s ease;">
                    MEDIUM
                  </div>
                  <div id="diff-desc" style="font-size: 0.76rem; color: #64748b; font-weight: 600; transition: color 0.25s ease;">
                    Smart, tactical opponent
                  </div>
                </div>
              </div>
              <div id="diff-stars" style="color: #00b4d8; font-size: 0.85rem; font-weight: 900; transition: color 0.25s ease;">
                ★★★☆☆
              </div>
            </div>

            <!-- Discrete 3-Level Slider Track -->
            <div class="diff-slider-wrapper" style="
              position: relative;
              background: #ffffff;
              border-radius: 14px;
              padding: 4px;
              display: flex;
              align-items: center;
              box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.1);
              border: 2px solid #e2e8f0;
              user-select: none;
            ">
              <!-- Sliding Thumb Pill -->
              <div id="slider-pill" style="
                position: absolute;
                top: 4px;
                bottom: 4px;
                left: calc(33.333% + 1px);
                width: calc(33.333% - 4px);
                background: #00b4d8;
                border-radius: 10px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.25s ease;
                pointer-events: none;
                z-index: 1;
              "></div>

              <!-- Segment Buttons -->
              <div class="diff-segment" data-index="0" style="
                flex: 1;
                text-align: center;
                padding: 10px 0;
                font-weight: 900;
                font-size: 0.85rem;
                letter-spacing: 0.05em;
                color: #475569;
                cursor: pointer;
                z-index: 2;
                transition: color 0.25s ease;
              ">
                EASY
              </div>
              <div class="diff-segment active" data-index="1" style="
                flex: 1;
                text-align: center;
                padding: 10px 0;
                font-weight: 900;
                font-size: 0.85rem;
                letter-spacing: 0.05em;
                color: #ffffff;
                cursor: pointer;
                z-index: 2;
                transition: color 0.25s ease;
              ">
                MEDIUM
              </div>
              <div class="diff-segment" data-index="2" style="
                flex: 1;
                text-align: center;
                padding: 10px 0;
                font-weight: 900;
                font-size: 0.85rem;
                letter-spacing: 0.05em;
                color: #475569;
                cursor: pointer;
                z-index: 2;
                transition: color 0.25s ease;
              ">
                HARD
              </div>

              <!-- Range Input Slider (Snaps strictly to 0, 1, 2) -->
              <input type="range" id="diff-range" min="0" max="2" step="1" value="1" style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                cursor: pointer;
                z-index: 3;
                margin: 0;
              " />
            </div>
          </div>

          <!-- Play Buttons -->
          <div style="width: 100%; display: flex; flex-direction: column; gap: 20px; margin-top: 4px;">
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

    const DIFF_CONFIG = [
      {
        key: 'easy' as Difficulty,
        name: 'EASY',
        desc: 'Relaxed opponent',
        stars: '★★☆☆☆',
        color: '#2ecc71',
        shadow: 'rgba(46, 204, 113, 0.35)',
        face: '😊'
      },
      {
        key: 'medium' as Difficulty,
        name: 'MEDIUM',
        desc: 'Smart, tactical opponent',
        stars: '★★★☆☆',
        color: '#00b4d8',
        shadow: 'rgba(0, 180, 216, 0.35)',
        face: '😏'
      },
      {
        key: 'hard' as Difficulty,
        name: 'HARD',
        desc: 'Expert 32-hold EV strategy',
        stars: '★★★★★',
        color: '#ff5e57',
        shadow: 'rgba(255, 94, 87, 0.35)',
        face: '😈'
      }
    ];

    const infoCard = this.container.querySelector('#diff-info-card') as HTMLElement;
    const faceIcon = this.container.querySelector('#diff-face-icon') as HTMLElement;
    const diffTitle = this.container.querySelector('#diff-title') as HTMLElement;
    const diffDesc = this.container.querySelector('#diff-desc') as HTMLElement;
    const diffStars = this.container.querySelector('#diff-stars') as HTMLElement;
    const sliderPill = this.container.querySelector('#slider-pill') as HTMLElement;
    const rangeInput = this.container.querySelector('#diff-range') as HTMLInputElement;
    const segments = this.container.querySelectorAll('.diff-segment');

    const updateDifficulty = (index: number) => {
      const cfg = DIFF_CONFIG[index];
      if (!cfg) return;

      selectedDiff = cfg.key;

      if (rangeInput && parseInt(rangeInput.value) !== index) {
        rangeInput.value = index.toString();
      }

      if (sliderPill) {
        sliderPill.style.background = cfg.color;
        if (index === 0) {
          sliderPill.style.left = '4px';
          sliderPill.style.width = 'calc(33.333% - 5px)';
        } else if (index === 1) {
          sliderPill.style.left = 'calc(33.333% + 1px)';
          sliderPill.style.width = 'calc(33.333% - 4px)';
        } else {
          sliderPill.style.left = 'calc(66.666% - 1px)';
          sliderPill.style.width = 'calc(33.333% - 3px)';
        }
      }

      segments.forEach((seg, i) => {
        if (i === index) {
          (seg as HTMLElement).style.color = '#ffffff';
        } else {
          (seg as HTMLElement).style.color = '#475569';
        }
      });

      if (infoCard) {
        infoCard.style.borderColor = cfg.color;
        infoCard.style.boxShadow = `0 4px 16px ${cfg.shadow}`;
      }
      if (diffTitle) {
        diffTitle.textContent = cfg.name;
        diffTitle.style.color = cfg.color;
      }
      if (diffDesc) {
        diffDesc.textContent = cfg.desc;
      }
      if (diffStars) {
        diffStars.textContent = cfg.stars;
        diffStars.style.color = cfg.color;
      }

      if (faceIcon) {
        faceIcon.textContent = cfg.face;
        faceIcon.style.transform = 'scale(1.4) rotate(12deg)';
        setTimeout(() => {
          if (faceIcon) {
            faceIcon.style.transform = 'scale(1) rotate(0deg)';
          }
        }, 180);
      }
    };

    rangeInput?.addEventListener('input', () => {
      const idx = parseInt(rangeInput.value);
      updateDifficulty(idx);
    });

    segments.forEach((seg, i) => {
      seg.addEventListener('click', () => {
        updateDifficulty(i);
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
