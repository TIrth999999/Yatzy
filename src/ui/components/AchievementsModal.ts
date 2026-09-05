import { AchievementManager } from '../../persistence/AchievementManager';
import { Icons } from '../icons/Icons';

export class AchievementsModal {
  private container: HTMLElement;
  private achMgr = AchievementManager.getInstance();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public show(): void {
    const achievements = this.achMgr.getAchievements();
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    this.container.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-content" style="max-width: 480px;">
          <div class="modal-header">
            <h2>${Icons.trophy(22, '#ffd200')} Achievements (${unlockedCount}/${achievements.length})</h2>
            <button class="modal-close-btn" id="btn-close-ach" aria-label="Close">
              ${Icons.close(18, '#1e354d')}
            </button>
          </div>
          <div class="modal-body" style="gap: 10px;">
            ${achievements.map(ach => `
              <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                border-radius: 14px;
                background: ${ach.unlocked ? '#fffbeb' : '#f8fafc'};
                border: 1.5px solid ${ach.unlocked ? '#fde68a' : '#e2e8f0'};
                box-shadow: ${ach.unlocked ? '0 2px 8px rgba(255, 210, 0, 0.15)' : 'none'};
                opacity: ${ach.unlocked ? '1' : '0.75'};
                transition: transform 0.15s ease;
              ">
                <div style="
                  width: 44px;
                  height: 44px;
                  border-radius: 12px;
                  background: ${ach.unlocked ? '#fef3c7' : '#e2e8f0'};
                  border: 1.5px solid ${ach.unlocked ? '#fcd34d' : '#cbd5e1'};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                ">
                  ${ach.icon}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: 800; font-size: 0.95rem; color: ${ach.unlocked ? '#1e354d' : '#64748b'};">
                    ${ach.title}
                  </div>
                  <div style="font-size: 0.78rem; color: ${ach.unlocked ? '#475569' : '#94a3b8'}; margin-top: 2px; line-height: 1.35;">
                    ${ach.description}
                  </div>
                </div>
                <div style="flex-shrink: 0;">
                  ${ach.unlocked
                    ? '<span style="font-size: 0.72rem; color: #15803d; background: #dcfce7; font-weight: 800; border: 1px solid #86efac; border-radius: 6px; padding: 3px 8px;">UNLOCKED</span>'
                    : '<span style="font-size: 0.72rem; color: #64748b; background: #e2e8f0; font-weight: 700; border-radius: 6px; padding: 3px 8px;">LOCKED</span>'
                  }
                </div>
              </div>
            `).join('')}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-done-ach" style="width: 100%; height: 46px; font-size: 1rem;">Close</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { this.container.innerHTML = ''; };
    this.container.querySelector('#btn-close-ach')?.addEventListener('click', close);
    this.container.querySelector('#btn-done-ach')?.addEventListener('click', close);
  }
}
