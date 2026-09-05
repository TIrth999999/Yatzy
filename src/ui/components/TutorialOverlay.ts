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
        background: rgba(18, 38, 58, 0.72);
        backdrop-filter: blur(8px);
        z-index: 90;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
      ">
        <div class="modal-content" style="
          max-width: 400px;
          border: 3px solid #1e354d;
          border-radius: 20px;
          padding: 20px;
          gap: 12px;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="score-pill" style="text-transform: uppercase;">
              Tutorial (${this.currentStepIndex + 1}/${this.steps.length})
            </span>
            <button id="btn-skip-tutorial" style="
              background: #f1f5f9;
              border: 1.5px solid #cbd5e1;
              color: #475569;
              font-size: 0.8rem;
              font-weight: 800;
              cursor: pointer;
              padding: 3px 10px;
              border-radius: 8px;
            ">Skip</button>
          </div>

          <h3 style="font-size: 1.25rem; font-weight: 900; color: #1e354d;">${step.title}</h3>
          <p style="font-size: 0.92rem; line-height: 1.5; color: #334155;">${step.message}</p>

          <button id="btn-next-tutorial" class="btn btn-primary" style="margin-top: 6px; height: 46px; font-size: 1rem;">
            ${this.currentStepIndex === this.steps.length - 1 ? 'Got it, Let\'s Play!' : 'Next'}
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
