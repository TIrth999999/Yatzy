import { DiceSkin } from '../../types/game';
import { SettingsManager } from '../../settings/SettingsManager';
import { StatsManager } from '../../persistence/StatsManager';
import { AdManager } from '../../crazygames/AdManager';
import { Icons } from '../icons/Icons';

export interface CosmeticOption {
  id: DiceSkin;
  name: string;
  description: string;
  icon: string;
  requiredWins: number;
}

const SKINS: CosmeticOption[] = [
  { id: 'classic', name: 'Classic Ivory', description: 'Traditional casino dice', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2d2538" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="2" fill="#ff5e57"/></svg>', requiredWins: 0 },
  { id: 'ruby', name: 'Ruby Flame', description: 'Deep red gemstone with bright pips', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="#e84d43"><path d="M12 2l8 8-8 12L4 10z"/></svg>', requiredWins: 2 },
  { id: 'cyber', name: 'Cyber Neon', description: 'Futuristic glowing cyan circuit theme', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d2d3" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M12 2v20M2 12h20"/></svg>', requiredWins: 4 },
  { id: 'gold', name: 'Royal Gold', description: 'Prestigious metallic gold dice', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="#ffd200"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9"/></svg>', requiredWins: 7 },
  { id: 'ocean', name: 'Ocean Wave', description: 'Azure aquatic pearl with white pips', icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#54b7cb" stroke-width="2"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>', requiredWins: 10 }
];

export class CosmeticsModal {
  private container: HTMLElement;
  private settingsMgr = SettingsManager.getInstance();
  private statsMgr = StatsManager.getInstance();
  private adMgr = AdManager.getInstance();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public show(): void {
    const s = this.settingsMgr.getSettings();
    const stats = this.statsMgr.getStats();

    this.container.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Dice Themes</h2>
            <button class="circle-header-btn" id="btn-close-cosmetics" style="width: 36px; height: 36px;">
              ${Icons.close(18, '#2d2538')}
            </button>
          </div>
          <div class="modal-body" style="gap: 12px;">
            ${SKINS.map(skin => {
              const isUnlocked = stats.gamesWon >= skin.requiredWins;
              const isSelected = s.selectedDiceSkin === skin.id;

              return `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 14px;
                  padding: 12px 16px;
                  border-radius: var(--radius-md);
                  background: ${isSelected ? 'rgba(255, 94, 87, 0.15)' : 'rgba(255, 255, 255, 0.03)'};
                  border: 1px solid ${isSelected ? 'var(--primary-coral)' : 'rgba(255, 255, 255, 0.06)'};
                ">
                  <div style="font-size: 2.2rem;">${skin.icon}</div>
                  <div style="flex: 1;">
                    <div style="font-weight: 800; font-size: 1rem;">${skin.name}</div>
                    <div style="font-size: 0.78rem; color: var(--text-light-muted);">${skin.description}</div>
                  </div>

                  <div>
                    ${isSelected
                      ? '<span style="font-size: 0.78rem; font-weight: 800; color: var(--primary-coral);">EQUIPPED</span>'
                      : isUnlocked
                      ? `<button class="btn btn-secondary btn-equip-skin" data-skin="${skin.id}" style="height: 36px; padding: 0 14px;">Equip</button>`
                      : `
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                          <span style="font-size: 0.7rem; color: var(--text-light-muted);">${stats.gamesWon}/${skin.requiredWins} Wins</span>
                          <button class="btn btn-gold btn-reward-unlock" data-skin="${skin.id}" style="height: 30px; font-size: 0.72rem; padding: 0 8px;">
                            📺 Unlock Now
                          </button>
                        </div>
                      `
                    }
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-done-cosmetics" style="width: 100%;">Close</button>
          </div>
        </div>
      </div>
    `;

    this.attachHandlers();
  }

  private attachHandlers(): void {
    const close = () => { this.container.innerHTML = ''; };
    this.container.querySelector('#btn-close-cosmetics')?.addEventListener('click', close);
    this.container.querySelector('#btn-done-cosmetics')?.addEventListener('click', close);

    this.container.querySelectorAll('.btn-equip-skin').forEach(btn => {
      btn.addEventListener('click', () => {
        const skin = btn.getAttribute('data-skin') as DiceSkin;
        if (skin) {
          this.applySkin(skin);
          this.show();
        }
      });
    });

    this.container.querySelectorAll('.btn-reward-unlock').forEach(btn => {
      btn.addEventListener('click', async () => {
        const skin = btn.getAttribute('data-skin') as DiceSkin;
        const granted = await this.adMgr.requestRewardedAd();
        if (granted && skin) {
          this.applySkin(skin);
          this.show();
        }
      });
    });
  }

  public applySkin(skin: DiceSkin): void {
    this.settingsMgr.updateSettings({ selectedDiceSkin: skin });
    document.body.classList.remove('skin-ruby', 'skin-cyber', 'skin-gold', 'skin-ocean');
    if (skin !== 'classic') {
      document.body.classList.add(`skin-${skin}`);
    }
  }
}
