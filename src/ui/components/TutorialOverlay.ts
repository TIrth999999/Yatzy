import { SettingsManager } from '../../settings/SettingsManager';
import { EventBus } from '../../core/EventBus';

export interface TutorialStep {
  targetSelector: string;
  title: string;
  message: string;
  position: 'top' | 'bottom' | 'center';
}

export class TutorialOverlay {
  private container: HTMLElement;
  private settingsMgr = SettingsManager.getInstance();
  private bus = EventBus.getInstance();
  private currentStepIndex = 0;
  private isActive = false;

  private steps: TutorialStep[] = [
    {
      targetSelector: '#btn-roll-action',
      title: 'Roll the Dice',
      message: 'Tap the ROLL button to roll all 5 dice for your first turn.',
      position: 'top'
    },
    {
      targetSelector: '#dice-tray',
      title: 'Hold Matching Dice',
      message: 'Tap on dice you want to keep. Held dice move up and will NOT change on your next roll.',
      position: 'top'
    },
    {
      targetSelector: '#btn-roll-action',
      title: 'Up to 3 Rolls',
      message: 'You can roll up to 3 times per turn to build the best possible score combination.',
      position: 'top'
    },
    {
      targetSelector: '.scorecard-table-container',
      title: 'Score a Category',
      message: 'Choose any available category on your scorecard to commit your score. Each category can only be used once!',
      position: 'bottom'
    },
    {
      targetSelector: '.bonus-progress-panel',
      title: 'Upper Section Bonus',
      message: 'Score 63 or more total points in the Upper Section (1 through 6) to receive a massive +35 bonus!',
      position: 'top'
    }
  ];

  constructor(container: HTMLElement) {
    this.container = container;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.bus.on('DICE_ROLLED', (data: any) => {
      if (this.isActive && data.player === 'player') {
        if (data.rollCount === 1 && this.currentStepIndex === 0) {
          this.advanceStep();
        } else if (data.rollCount === 2 && this.currentStepIndex === 1) {
          this.advanceStep();
        }
      }
    });

    this.bus.on('SCORE_COMMITTED', (data: any) => {
      if (this.isActive && data.player === 'player') {
        this.completeTutorial();
      }
    });
  }

  public shouldShowTutorial(): boolean {
    return !this.settingsMgr.getSettings().tutorialCompleted;
  }

  public startTutorial(): void {
    this.isActive = true;
    this.currentStepIndex = 0;
    this.render();
  }

  public advanceStep(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      this.render();
    } else {
      this.completeTutorial();
    }
  }

  public completeTutorial(): void {
    this.isActive = false;
    this.settingsMgr.setTutorialCompleted(true);
    this.container.innerHTML = '';
  }

  private render(): void {
    if (!this.isActive) {
      this.container.innerHTML = '';
      return;
    }

    const step = this.steps[this.currentStepIndex];

    this.container.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 7, 20, 0.65);
        z-index: 90;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
      ">
        <div style="
          background: linear-gradient(135deg, #2d2347 0%, #1a142c 100%);
          border: 2px solid var(--accent-gold);
          border-radius: var(--radius-lg);
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 16px 40px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: popIn 0.25s ease;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; font-weight: 800; color: var(--accent-gold); text-transform: uppercase;">
              Tutorial (${this.currentStepIndex + 1}/${this.steps.length})
            </span>
            <button id="btn-skip-tutorial" style="
              background: none;
              border: none;
              color: var(--text-light-muted);
              font-size: 0.82rem;
              font-weight: 700;
              cursor: pointer;
            ">Skip</button>
          </div>

          <h3 style="font-size: 1.25rem; font-weight: 800; color: #ffffff;">${step.title}</h3>
          <p style="font-size: 0.95rem; line-height: 1.45; color: #ddd7e5;">${step.message}</p>

          <button id="btn-next-tutorial" class="btn btn-primary" style="margin-top: 8px; height: 44px;">
            ${this.currentStepIndex === this.steps.length - 1 ? 'Got it!' : 'Next'}
          </button>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-skip-tutorial')?.addEventListener('click', () => {
      this.completeTutorial();
    });

    this.container.querySelector('#btn-next-tutorial')?.addEventListener('click', () => {
      this.advanceStep();
    });
  }
}
