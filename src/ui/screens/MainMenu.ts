import { Difficulty } from '../../types/game';
import { EventBus } from '../../core/EventBus';
import { DailyChallenge } from '../../daily/DailyChallenge';
import { Icons } from '../icons/Icons';
import logoIcon from '../../../assets/two-dice-icon.png';

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
        padding: 12px;
        background: var(--bg-canvas);
        z-index: 80;
        overflow: hidden;
      ">
        <div style="max-width: 440px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="text-align: center; display: flex; flex-direction: column; align-items: center;">
            <img src="${logoIcon}" alt="Yatzy Clash Logo" style="width: 58px; height: auto; margin-bottom: 2px;" />

            <h1 style="
              font-size: 1.85rem;
              font-weight: 900;
              letter-spacing: -0.01em;
              color: #ffffff;
              text-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
              line-height: 1.05;
            ">
              YATZY CLASH
            </h1>
            <p style="font-size: 0.72rem; font-weight: 800; color: rgba(255, 255, 255, 0.9); letter-spacing: 0.16em; text-transform: uppercase; margin-top: 1px;">
              DICE MASTERS
            </p>
          </div>

          <!-- Difficulty Selection Slider & Animated Expression -->
          <div style="width: 100%; display: flex; flex-direction: column; gap: 6px;">
            <div style="font-size: 0.72rem; font-weight: 800; color: rgba(255, 255, 255, 0.85); letter-spacing: 0.08em; text-align: center;">
              SELECT DIFFICULTY
            </div>

            <!-- Animated Face & Difficulty Details Card -->
            <div id="diff-info-card" style="
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 8px 14px;
              background: #ffffff;
              border: 2px solid #1e354d;
              border-radius: 14px;
              box-shadow: 0 4px 0 #1e354d, 0 6px 12px rgba(0, 0, 0, 0.12);
              transition: box-shadow 0.25s ease, border-color 0.25s ease;
            ">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div id="diff-face-icon" style="
                  font-size: 1.8rem;
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
                  <div id="diff-title" style="font-weight: 900; font-size: 0.95rem; color: #00b4d8; transition: color 0.25s ease;">
                    MEDIUM
                  </div>
                  <div id="diff-desc" style="font-size: 0.7rem; color: #64748b; font-weight: 600; transition: color 0.25s ease;">
                    Smart, tactical opponent
                  </div>
                </div>
              </div>
              <div id="diff-stars" style="color: #00b4d8; font-size: 0.8rem; font-weight: 900; transition: color 0.25s ease;">
                ★★★☆☆
              </div>
            </div>

            <!-- Discrete 3-Level Slider Track with 3D button styling -->
            <div class="diff-slider-wrapper" style="
              position: relative;
              background: #ffffff;
              border-radius: 14px;
              padding: 3px;
              display: flex;
              align-items: center;
              border: 2px solid #1e354d;
              box-shadow: 0 4px 0 #1e354d, 0 6px 12px rgba(0, 0, 0, 0.12);
              user-select: none;
            ">
              <!-- Sliding Thumb Pill with 3D button bevel -->
              <div id="slider-pill" style="
                position: absolute;
                top: 3px;
                bottom: 6px;
                left: calc(33.333% + 1px);
                width: calc(33.333% - 4px);
                background: #00b4d8;
                border-radius: 10px;
                border: 2px solid #0077b6;
                box-shadow: 0 3px 0 #0077b6, 0 4px 10px rgba(0, 0, 0, 0.2);
                transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1), background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
                pointer-events: none;
                z-index: 1;
              "></div>

              <!-- Segment Buttons -->
              <div class="diff-segment" data-index="0" style="
                flex: 1;
                text-align: center;
                padding: 6px 0;
                font-weight: 900;
                font-size: 0.78rem;
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
                padding: 6px 0;
                font-weight: 900;
                font-size: 0.78rem;
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
                padding: 6px 0;
                font-weight: 900;
                font-size: 0.78rem;
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
          <div style="width: 100%; display: flex; flex-direction: column; gap: 8px; margin-top: 2px;">
            <button class="btn btn-primary" id="btn-play-quick" style="
              height: 46px;
              font-size: 1.15rem;
              width: 100%;
              background: #e84d43;
              box-shadow: 0 5px 0 #b33930, 0 6px 14px rgba(0,0,0,0.2);
              border-radius: 14px;
            ">
              PLAY NOW
            </button>

            <div style="display: flex; gap: 8px; width: 100%;">
              <button class="btn btn-gold mode-coming-soon-btn" id="btn-play-daily" style="flex: 1; height: 40px; font-size: 0.78rem; position: relative; opacity: 0.72; filter: grayscale(20%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; padding: 2px 4px; border-radius: 12px;">
                <span>Daily Challenge</span>
                <span style="font-size: 0.54rem; font-weight: 900; background: rgba(0, 0, 0, 0.45); color: #ffd200; padding: 1px 6px; border-radius: 999px; letter-spacing: 0.06em; border: 1px solid rgba(255, 210, 0, 0.4);">COMING SOON</span>
              </button>
              <button class="btn btn-secondary mode-coming-soon-btn" id="btn-play-practice" style="flex: 1; height: 40px; font-size: 0.78rem; background: #f1f5f9; position: relative; opacity: 0.72; filter: grayscale(20%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; padding: 2px 4px; border-radius: 12px;">
                <span style="color: #475569;">Solo Practice</span>
                <span style="font-size: 0.54rem; font-weight: 900; background: #e2e8f0; color: #64748b; padding: 1px 6px; border-radius: 999px; letter-spacing: 0.06em; border: 1px solid #cbd5e1;">COMING SOON</span>
              </button>
            </div>
          </div>

          <!-- Navigation Icon Row -->
          <div style="display: flex; gap: 10px; width: 100%; justify-content: center; margin-top: 4px;">
            <button class="circle-header-btn" id="btn-menu-htp" title="How to Play" aria-label="How to Play" style="width: 44px; height: 44px; min-width: 44px; min-height: 44px;">
              ${Icons.book(18, '#1e354d')}
            </button>
            <button class="circle-header-btn" id="btn-menu-stats" title="Statistics" aria-label="Statistics" style="width: 44px; height: 44px; min-width: 44px; min-height: 44px;">
              ${Icons.chart(18, '#1e354d')}
            </button>
            <button class="circle-header-btn" id="btn-menu-ach" title="Achievements" aria-label="Achievements" style="width: 44px; height: 44px; min-width: 44px; min-height: 44px;">
              ${Icons.trophy(18, '#1e354d')}
            </button>
            <button class="circle-header-btn" id="btn-menu-cosmetics" title="Dice Themes" aria-label="Dice Themes" style="width: 44px; height: 44px; min-width: 44px; min-height: 44px;">
              ${Icons.palette(18, '#1e354d')}
            </button>
            <button class="circle-header-btn" id="btn-menu-settings" title="Settings" aria-label="Settings" style="width: 44px; height: 44px; min-width: 44px; min-height: 44px;">
              ${Icons.settings(18, '#1e354d')}
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
        darkColor: '#27ae60',
        face: '😊'
      },
      {
        key: 'medium' as Difficulty,
        name: 'MEDIUM',
        desc: 'Smart, tactical opponent',
        stars: '★★★☆☆',
        color: '#00b4d8',
        darkColor: '#0077b6',
        face: '😏'
      },
      {
        key: 'hard' as Difficulty,
        name: 'HARD',
        desc: 'Expert 32-hold EV strategy',
        stars: '★★★★★',
        color: '#ff5e57',
        darkColor: '#d63031',
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
        sliderPill.style.borderColor = cfg.darkColor;
        sliderPill.style.boxShadow = `0 3px 0 ${cfg.darkColor}, 0 4px 10px rgba(0, 0, 0, 0.2)`;
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

    const showComingSoonModal = (modeName: string, desc: string, icon: string) => {
      const modal = document.createElement('div');
      modal.className = 'modal-overlay active';
      modal.style.zIndex = '999';
      modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center; padding: 28px 24px;">
          <div style="font-size: 3.2rem; line-height: 1; margin-bottom: 12px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15));">${icon}</div>
          <h2 style="font-size: 1.5rem; font-weight: 900; color: #1e354d; margin-bottom: 6px;">${modeName}</h2>
          <div style="display: inline-block; background: #fff3cd; color: #856404; font-size: 0.72rem; font-weight: 900; padding: 4px 14px; border-radius: 999px; margin-bottom: 14px; letter-spacing: 0.08em; border: 1.5px solid #ffeeba;">
            COMING SOON
          </div>
          <p style="font-size: 0.88rem; color: #64748b; font-weight: 600; line-height: 1.45; margin-bottom: 22px;">
            ${desc}
          </p>
          <button class="btn btn-primary btn-close-cs" style="width: 100%; height: 46px; font-size: 1rem; border-radius: 14px;">
            Got it!
          </button>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelector('.btn-close-cs')?.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 200);
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          setTimeout(() => modal.remove(), 200);
        }
      });
    };

    this.container.querySelector('#btn-play-practice')?.addEventListener('click', () => {
      showComingSoonModal(
        'Solo Practice',
        'Solo Practice mode is currently under development and will be available in the upcoming update. Play against our smart tactical bot in the meantime!',
        '🎯'
      );
    });

    this.container.querySelector('#btn-play-daily')?.addEventListener('click', () => {
      showComingSoonModal(
        'Daily Challenge',
        'Daily Challenge tournaments with worldwide seed rankings will be unlocked in the next season. Stay tuned!',
        '🏆'
      );
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
