import { Settings } from '../types/game';
import { SaveManager } from '../persistence/SaveManager';
import { EventBus } from '../core/EventBus';

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.8,
  musicVolume: 0.4,
  fastAnimation: false,
  reducedMotion: false,
  showBestChoice: true,
  selectedDiceSkin: 'classic',
  selectedBoardTheme: 'sunset',
  tutorialCompleted: false
};

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: Settings;
  private saveMgr = SaveManager.getInstance();
  private bus = EventBus.getInstance();

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  constructor() {
    this.settings = this.saveMgr.load<Settings>('settings', { ...DEFAULT_SETTINGS });
  }

  public getSettings(): Settings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<Settings>): void {
    this.settings = {
      ...this.settings,
      ...partial
    };
    this.saveMgr.save('settings', this.settings);
    this.bus.emit('SETTINGS_UPDATED', this.settings);
  }

  public setTutorialCompleted(completed: boolean): void {
    this.updateSettings({ tutorialCompleted: completed });
  }

  public resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveMgr.save('settings', this.settings);
    this.bus.emit('SETTINGS_UPDATED', this.settings);
  }
}
