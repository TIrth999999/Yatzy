import { GameEngine } from '../core/GameEngine';
import { EventBus } from '../core/EventBus';
import { AudioManager } from '../audio/AudioManager';
import { ScoreHeader } from './components/ScoreHeader';
import { DiceBoard } from './components/DiceBoard';
import { Scorecard } from './components/Scorecard';
import { ConfettiSystem } from './animations/Confetti';
import { ResultModal } from './components/ResultModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { StatsModal } from './components/StatsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { CosmeticsModal } from './components/CosmeticsModal';
import { PauseModal } from './components/PauseModal';
import { DebugPanel } from './components/DebugPanel';
import { TutorialOverlay } from './components/TutorialOverlay';
import { MainMenu } from './screens/MainMenu';

export class UIManager {
  private appRoot: HTMLElement;
  private engine: GameEngine;
  private audio: AudioManager;
  private bus: EventBus = EventBus.getInstance();

  private confetti!: ConfettiSystem;
  private header!: ScoreHeader;
  private diceBoard!: DiceBoard;
  private scorecard!: Scorecard;

  private resultModal!: ResultModal;
  private htpModal!: HowToPlayModal;
  private statsModal!: StatsModal;
  private achModal!: AchievementsModal;
  private settingsModal!: SettingsModal;
  private cosmeticsModal!: CosmeticsModal;
  private pauseModal!: PauseModal;
  private debugPanel!: DebugPanel;
  private tutorialOverlay!: TutorialOverlay;
  private mainMenu!: MainMenu;

  constructor(appRoot: HTMLElement, engine: GameEngine, audio: AudioManager) {
    this.appRoot = appRoot;
    this.engine = engine;
    this.audio = audio;

    this.initLayout();
    this.setupBusEvents();
  }

  private initLayout(): void {
    this.appRoot.innerHTML = `
      <canvas id="confetti-canvas"></canvas>

      <div class="toast-container" id="toast-container"></div>

      <!-- Main Game Container (Reflows via CSS Grid / Flex) -->
      <div class="game-container" id="game-container">
        <!-- Desktop Header / Mobile Header -->
        <header class="desktop-header mobile-header" id="header-container"></header>

        <!-- Desktop Grid Wrapper (reflows into mobile center scroll) -->
        <main class="desktop-main-grid">
          <!-- Left / Mobile Lower: Gameplay & Dice Area -->
          <section class="gameplay-panel" id="gameplay-panel">
            <div id="dice-container" style="width: 100%;"></div>
          </section>

          <!-- Right / Mobile Center: Scorecard -->
          <aside class="desktop-scorecard-panel mobile-scorecard-scroll" id="scorecard-container"></aside>
        </main>
      </div>

      <!-- Overlays & Modals Mount Points -->
      <div id="modal-mount"></div>
      <div id="tutorial-mount"></div>
      <div id="menu-mount"></div>
      <div id="debug-mount"></div>
    `;

    const confettiCanvas = this.appRoot.querySelector('#confetti-canvas') as HTMLCanvasElement;
    this.confetti = new ConfettiSystem(confettiCanvas);

    const headerEl = this.appRoot.querySelector('#header-container') as HTMLElement;
    this.header = new ScoreHeader(headerEl);

    const diceEl = this.appRoot.querySelector('#dice-container') as HTMLElement;
    this.diceBoard = new DiceBoard(diceEl, this.engine);

    const scoreEl = this.appRoot.querySelector('#scorecard-container') as HTMLElement;
    this.scorecard = new Scorecard(scoreEl, this.engine);

    const modalMount = this.appRoot.querySelector('#modal-mount') as HTMLElement;
    this.resultModal = new ResultModal(modalMount, this.confetti);
    this.htpModal = new HowToPlayModal(modalMount);
    this.statsModal = new StatsModal(modalMount);
    this.achModal = new AchievementsModal(modalMount);
    this.settingsModal = new SettingsModal(modalMount);
    this.cosmeticsModal = new CosmeticsModal(modalMount);
    this.pauseModal = new PauseModal(modalMount, this.engine);

    const tutMount = this.appRoot.querySelector('#tutorial-mount') as HTMLElement;
    this.tutorialOverlay = new TutorialOverlay(tutMount);

    const menuMount = this.appRoot.querySelector('#menu-mount') as HTMLElement;
    this.mainMenu = new MainMenu(menuMount);

    const debugMount = this.appRoot.querySelector('#debug-mount') as HTMLElement;
    this.debugPanel = new DebugPanel(debugMount, this.engine);

    // Initial render
    this.renderAll();
    this.showMainMenu();
  }

  public showMainMenu(): void {
    this.mainMenu.show();
  }

  public getAudio(): AudioManager {
    return this.audio;
  }

  public getDebugPanel(): DebugPanel {
    return this.debugPanel;
  }

  public renderAll(): void {
    const state = this.engine.getState();
    this.header.render(state);
    this.diceBoard.render();
    this.scorecard.render();
  }

  private setupBusEvents(): void {
    this.bus.on('MATCH_STARTED', () => {
      this.renderAll();
      if (this.tutorialOverlay.shouldShowTutorial()) {
        this.tutorialOverlay.startTutorial();
      }
    });

    this.bus.on('MATCH_COMPLETED', (data: any) => {
      setTimeout(() => {
        this.resultModal.show(data);
      }, 700);
    });

    this.bus.on('REQUEST_PAUSE', () => {
      this.engine.pause();
      this.pauseModal.show();
    });

    this.bus.on('REQUEST_HOW_TO_PLAY', () => {
      this.htpModal.show();
    });

    this.bus.on('REQUEST_STATS', () => {
      this.statsModal.show();
    });

    this.bus.on('REQUEST_ACHIEVEMENTS', () => {
      this.achModal.show();
    });

    this.bus.on('REQUEST_SETTINGS', () => {
      this.settingsModal.show();
    });

    this.bus.on('REQUEST_COSMETICS', () => {
      this.cosmeticsModal.show();
    });

    this.bus.on('REQUEST_MAIN_MENU', () => {
      this.showMainMenu();
    });

    this.bus.on('REQUEST_REMATCH', () => {
      const s = this.engine.getState();
      this.engine.startMatch(s.mode, s.difficulty);
    });

    this.bus.on('REQUEST_DIFFICULTY_SELECT', () => {
      this.showMainMenu();
    });

    this.bus.on('ACHIEVEMENT_UNLOCKED', (ach: any) => {
      this.showToast(`🏆 Achievement Unlocked: ${ach.title}`, ach.description);
    });
  }

  private showToast(title: string, desc: string): void {
    const container = this.appRoot.querySelector('#toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div style="font-size: 1.6rem;">🏆</div>
      <div>
        <div style="font-weight: 800; font-size: 0.88rem; color: #ffd32a;">${title}</div>
        <div style="font-size: 0.76rem; color: var(--text-light-muted);">${desc}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4200);
  }
}
