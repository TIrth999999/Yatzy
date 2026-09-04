import { SoundSynth } from './SoundSynth';
import { MusicSynth } from './MusicSynth';
import { SettingsManager } from '../settings/SettingsManager';
import { EventBus } from '../core/EventBus';

export class AudioManager {
  private static instance: AudioManager;
  private sound: SoundSynth;
  private music: MusicSynth;
  private settingsMgr: SettingsManager;
  private bus: EventBus;
  private isMutedByPlatform: boolean = false;

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  constructor() {
    this.sound = new SoundSynth();
    this.music = new MusicSynth();
    this.settingsMgr = SettingsManager.getInstance();
    this.bus = EventBus.getInstance();

    this.applySettings();
    this.setupEventListeners();
  }

  public init(): void {
    this.sound.init();
    this.music.init();
  }

  public unlockAudio(): void {
    this.sound.ensureContext();
    if (this.settingsMgr.getSettings().musicEnabled && !this.isMutedByPlatform) {
      this.music.start();
    }
  }

  public setPlatformMute(muted: boolean): void {
    this.isMutedByPlatform = muted;
    this.applySettings();
  }

  public applySettings(): void {
    const s = this.settingsMgr.getSettings();
    const effectiveSound = s.soundEnabled && !this.isMutedByPlatform;
    const effectiveMusic = s.musicEnabled && !this.isMutedByPlatform;

    this.sound.setEnabled(effectiveSound);
    this.sound.setVolume(s.sfxVolume);

    this.music.setEnabled(effectiveMusic);
    this.music.setVolume(s.musicVolume);
  }

  private setupEventListeners(): void {
    this.bus.on('SETTINGS_UPDATED', () => this.applySettings());

    this.bus.on('DICE_ROLLED', (data: any) => {
      this.sound.playDiceRoll();
      // Schedule landing clatter
      const count = data.rolledIndices ? data.rolledIndices.length : 5;
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          this.sound.playDiceLand(0.9 + i * 0.1);
        }, 180 + i * 40);
      }
    });

    this.bus.on('DIE_HOLD_TOGGLED', (data: any) => {
      if (data.isHeld) {
        this.sound.playDieHold();
      } else {
        this.sound.playDieRelease();
      }
    });

    this.bus.on('SCORE_COMMITTED', () => {
      this.sound.playScoreCommitted();
    });

    this.bus.on('BONUS_AWARDED', () => {
      this.sound.playBonusAchieved();
    });

    this.bus.on('YATZY_SCORED', () => {
      this.sound.playYatzy();
    });

    this.bus.on('MATCH_COMPLETED', (data: any) => {
      if (data.winner === 'player') {
        this.sound.playVictory();
      } else if (data.winner === 'bot') {
        this.sound.playDefeat();
      } else {
        this.sound.playDraw();
      }
    });
  }

  public playButtonClick(): void {
    this.sound.playButtonClick();
  }

  public playCategoryHover(): void {
    this.sound.playCategoryHover();
  }
}
