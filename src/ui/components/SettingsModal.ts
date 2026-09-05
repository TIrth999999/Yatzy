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
        <div class="modal-content" style="max-width: 480px;">
          <div class="modal-header">
            <h2>${Icons.settings(22, '#1e354d')} Game Settings</h2>
            <button class="modal-close-btn" id="btn-close-settings" aria-label="Close">
              ${Icons.close(18, '#1e354d')}
            </button>
          </div>
          <div class="modal-body" style="gap: 12px;">
            <!-- Audio Section -->
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
              <div style="font-size: 0.74rem; font-weight: 900; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase;">AUDIO</div>
              
              <!-- Sound FX -->
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 800; color: #1e354d; font-size: 0.95rem;">Sound Effects</span>
                  <label class="custom-toggle">
                    <input type="checkbox" id="setting-sound" ${s.soundEnabled ? 'checked' : ''}>
                    <span class="slider"></span>
                  </label>
                </div>
                <div style="padding: 4px 0;">
                  <input type="range" class="custom-range" id="setting-sfx-vol" min="0" max="1" step="0.05" value="${s.sfxVolume}">
                </div>
              </div>

              <!-- Music -->
              <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px solid #edf2f7; padding-top: 12px; margin-top: 2px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 800; color: #1e354d; font-size: 0.95rem;">Background Music</span>
                  <label class="custom-toggle">
                    <input type="checkbox" id="setting-music" ${s.musicEnabled ? 'checked' : ''}>
                    <span class="slider"></span>
                  </label>
                </div>
                <div style="padding: 4px 0;">
                  <input type="range" class="custom-range" id="setting-music-vol" min="0" max="1" step="0.05" value="${s.musicVolume}">
                </div>
              </div>
            </div>

            <!-- Gameplay & Motion -->
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
              <div style="font-size: 0.74rem; font-weight: 900; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase;">GAMEPLAY</div>
              
              <!-- Fast Animations -->
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <div style="font-weight: 800; color: #1e354d; font-size: 0.95rem;">Fast Animations</div>
                  <div style="font-size: 0.76rem; color: #64748b;">Speed up rolls and score effects</div>
                </div>
                <label class="custom-toggle">
                  <input type="checkbox" id="setting-fast-anim" ${s.fastAnimation ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
              </div>

              <!-- Reduced Motion -->
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #edf2f7; padding-top: 10px;">
                <div>
                  <div style="font-weight: 800; color: #1e354d; font-size: 0.95rem;">Reduced Motion</div>
                  <div style="font-size: 0.76rem; color: #64748b;">Disable 3D spins & heavy animations</div>
                </div>
                <label class="custom-toggle">
                  <input type="checkbox" id="setting-reduced-motion" ${s.reducedMotion ? 'checked' : ''}>
                  <span class="slider"></span>
                </label>
              </div>
            </div>

            <!-- Manage & Data -->
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 800; color: #1e354d; font-size: 0.9rem;">Tutorial Guide</span>
                <button class="btn btn-secondary" id="btn-replay-tutorial" style="height: 34px; padding: 0 14px; font-size: 0.8rem;">
                  Replay
                </button>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #edf2f7; padding-top: 10px;">
                <div>
                  <span style="font-weight: 800; color: #ef4444; font-size: 0.9rem;">Reset Progress</span>
                  <div style="font-size: 0.72rem; color: #94a3b8;">Clear stats and unlocks</div>
                </div>
                <button class="btn btn-danger" id="btn-reset-data" style="height: 34px; padding: 0 14px; font-size: 0.8rem;">
                  Reset Data
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="btn-save-settings" style="width: 100%; height: 48px; font-size: 1.05rem;">Done</button>
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
    });

    this.container.querySelector('#btn-reset-data')?.addEventListener('click', () => {
      this.statsMgr.resetStats();
      this.achMgr.reset();
      this.settingsMgr.resetToDefaults();
      close();
    });
  }
}
