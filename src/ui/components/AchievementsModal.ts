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
        <div class="modal-content">
          <div class="modal-header">
            <h2>Achievements (${unlockedCount}/${achievements.length})</h2>
            <button class="circle-header-btn" id="btn-close-ach" style="width: 36px; height: 36px;">
              ${Icons.close(18, '#2d2538')}
            </button>
          </div>
          <div class="modal-body" style="gap: 10px; max-height: 60vh; overflow-y: auto;">
            ${achievements.map(ach => `
              <div style="
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 12px;
                border-radius: var(--radius-md);
                background: ${ach.unlocked ? 'rgba(255, 215, 0, 0.08)' : 'rgba(255, 255, 255, 0.02)'};
                border: 1px solid ${ach.unlocked ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.04)'};
                opacity: ${ach.unlocked ? '1' : '0.5'};
              ">
                <div style="font-size: 2rem; width: 44px; text-align: center;">${ach.icon}</div>
                <div style="flex: 1;">
                  <div style="font-weight: 800; font-size: 0.95rem; color: ${ach.unlocked ? '#ffffff' : 'var(--text-light-muted)'};">
                    ${ach.title}
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-light-muted); margin-top: 2px;">
                    ${ach.description}
                  </div>
                </div>
                <div>
                  ${ach.unlocked
                    ? '<span style="font-size: 0.72rem; color: #4cd137; font-weight: 800; border: 1px solid #4cd137; border-radius: 4px; padding: 2px 6px;">UNLOCKED</span>'
                    : '<span style="font-size: 0.72rem; color: var(--text-light-muted); font-weight: 700;">LOCKED</span>'
                  }
                </div>
              </div>
            `).join('')}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-done-ach" style="width: 100%;">Close</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { this.container.innerHTML = ''; };
    this.container.querySelector('#btn-close-ach')?.addEventListener('click', close);
    this.container.querySelector('#btn-done-ach')?.addEventListener('click', close);
  }
}
