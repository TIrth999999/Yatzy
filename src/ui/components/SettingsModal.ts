import { SettingsManager } from '../../settings/SettingsManager';
import { StatsManager } from '../../persistence/StatsManager';
import { AchievementManager } from '../../persistence/AchievementManager';
import { Icons } from '../icons/Icons';

export class SettingsModal {
  private container: HTMLElement;
  private settingsMgr = SettingsManager.getInstance();
  private statsMgr = StatsManager.getInstance();
  private achMgr = AchievementManager.getInstance();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public show(): void {
    const s = this.settingsMgr.getSettings();

    this.container.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Game Settings</h2>
            <button class="circle-header-btn" id="btn-close-settings" style="width: 36px; height: 36px;">
              ${Icons.close(18, '#2d2538')}
            </button>
          </div>
          <div class="modal-body" style="gap: 16px;">
            <!-- Sound FX Toggle & Volume -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label for="setting-sound" style="font-weight: 700;">Sound Effects</label>
                <input type="checkbox" id="setting-sound" ${s.soundEnabled ? 'checked' : ''} style="transform: scale(1.4);">
              </div>
              <input type="range" id="setting-sfx-vol" min="0" max="1" step="0.05" value="${s.sfxVolume}" style="width: 100%;">
            </div>

            <!-- Music Toggle & Volume -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <label for="setting-music" style="font-weight: 700;">Background Music</label>
                <input type="checkbox" id="setting-music" ${s.musicEnabled ? 'checked' : ''} style="transform: scale(1.4);">
              </div>
              <input type="range" id="setting-music-vol" min="0" max="1" step="0.05" value="${s.musicVolume}" style="width: 100%;">
            </div>

            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08);">

            <!-- Fast Animations -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 700;">Fast Animation</div>
                <div style="font-size: 0.78rem; color: var(--text-light-muted);">Speed up dice roll animations</div>
              </div>
              <input type="checkbox" id="setting-fast-anim" ${s.fastAnimation ? 'checked' : ''} style="transform: scale(1.4);">
            </div>

            <!-- Reduced Motion -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 700;">Reduced Motion</div>
                <div style="font-size: 0.78rem; color: var(--text-light-muted);">Disable tumbles and rotations</div>
              </div>
              <input type="checkbox" id="setting-reduced-motion" ${s.reducedMotion ? 'checked' : ''} style="transform: scale(1.4);">
            </div>

            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08);">

            <!-- Tutorial Replay -->
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700;">First-Game Tutorial</span>
              <button class="btn btn-secondary" id="btn-replay-tutorial" style="height: 36px; font-size: 0.82rem;">
                Replay Tutorial
              </button>
            </div>

            <!-- Reset Progress -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
              <span style="font-weight: 700; color: #ff5252;">Reset Game Data</span>
              <button class="btn btn-secondary" id="btn-reset-data" style="height: 36px; font-size: 0.82rem; border-color: rgba(255, 82, 82, 0.4); color: #ff5252;">
                Reset Data
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="btn-save-settings" style="width: 100%;">Done</button>
          </div>
        </div>
      </div>
    `;

    this.attachHandlers();
  }

  private attachHandlers(): void {
    const close = () => { this.container.innerHTML = ''; };

    this.container.querySelector('#btn-close-settings')?.addEventListener('click', close);
    this.container.querySelector('#btn-save-settings')?.addEventListener('click', close);

    const soundCheck = this.container.querySelector('#setting-sound') as HTMLInputElement;
    soundCheck?.addEventListener('change', () => {
      this.settingsMgr.updateSettings({ soundEnabled: soundCheck.checked });
    });

    const sfxVol = this.container.querySelector('#setting-sfx-vol') as HTMLInputElement;
    sfxVol?.addEventListener('input', () => {
      this.settingsMgr.updateSettings({ sfxVolume: parseFloat(sfxVol.value) });
    });

    const musicCheck = this.container.querySelector('#setting-music') as HTMLInputElement;
    musicCheck?.addEventListener('change', () => {
      this.settingsMgr.updateSettings({ musicEnabled: musicCheck.checked });
    });

    const musicVol = this.container.querySelector('#setting-music-vol') as HTMLInputElement;
    musicVol?.addEventListener('input', () => {
      this.settingsMgr.updateSettings({ musicVolume: parseFloat(musicVol.value) });
    });

    const fastAnim = this.container.querySelector('#setting-fast-anim') as HTMLInputElement;
    fastAnim?.addEventListener('change', () => {
      this.settingsMgr.updateSettings({ fastAnimation: fastAnim.checked });
      document.body.classList.toggle('fast-animation', fastAnim.checked);
    });

    const reducedMotion = this.container.querySelector('#setting-reduced-motion') as HTMLInputElement;
    reducedMotion?.addEventListener('change', () => {
      this.settingsMgr.updateSettings({ reducedMotion: reducedMotion.checked });
      document.body.classList.toggle('reduced-motion', reducedMotion.checked);
    });

    this.container.querySelector('#btn-replay-tutorial')?.addEventListener('click', () => {
      this.settingsMgr.setTutorialCompleted(false);
      close();
      alert('Tutorial reset! It will appear on your next game roll.');
    });

    this.container.querySelector('#btn-reset-data')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all your statistics and achievements? This cannot be undone.')) {
        this.statsMgr.resetStats();
        this.achMgr.reset();
        this.settingsMgr.resetToDefaults();
        close();
        alert('All game data has been reset.');
      }
    });
  }
}
