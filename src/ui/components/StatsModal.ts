import { StatsManager } from '../../persistence/StatsManager';
import { Icons } from '../icons/Icons';

export class StatsModal {
  private container: HTMLElement;
  private statsMgr = StatsManager.getInstance();

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public show(): void {
    const stats = this.statsMgr.getStats();
    const winRate = stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;
    const avgScore = stats.gamesPlayed > 0
      ? Math.round(stats.totalScore / stats.gamesPlayed)
      : 0;

    this.container.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-content" style="max-width: 480px;">
          <div class="modal-header">
            <h2>${Icons.chart(22, '#1e354d')} Player Statistics</h2>
            <button class="modal-close-btn" id="btn-close-stats" aria-label="Close">
              ${Icons.close(18, '#1e354d')}
            </button>
          </div>
          <div class="modal-body" style="gap: 14px;">
            <!-- Overall Highlight Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 12px; text-align: center;">
                <div style="font-size: 0.72rem; color: #64748b; font-weight: 800; letter-spacing: 0.05em;">PLAYED</div>
                <div style="font-size: 1.6rem; font-weight: 900; color: #1e354d; margin-top: 2px;">${stats.gamesPlayed}</div>
              </div>
              <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 14px; padding: 12px; text-align: center;">
                <div style="font-size: 0.72rem; color: #b45309; font-weight: 800; letter-spacing: 0.05em;">WIN RATE</div>
                <div style="font-size: 1.6rem; font-weight: 900; color: #d97706; margin-top: 2px;">${winRate}%</div>
              </div>
              <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 14px; padding: 12px; text-align: center;">
                <div style="font-size: 0.72rem; color: #15803d; font-weight: 800; letter-spacing: 0.05em;">BEST SCORE</div>
                <div style="font-size: 1.6rem; font-weight: 900; color: #16a34a; margin-top: 2px;">${stats.highestScore}</div>
              </div>
            </div>

            <!-- Key Records List -->
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; font-size: 0.88rem; color: #334155;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #edf2f7; padding-bottom: 8px;">
                <span style="font-weight: 600;">Wins / Losses / Ties:</span>
                <strong style="color: #1e354d;">${stats.gamesWon}W - ${stats.gamesLost}L - ${stats.gamesDrawn}D</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #edf2f7; padding-bottom: 8px;">
                <span style="font-weight: 600;">Average Match Score:</span>
                <strong style="color: #1e354d;">${avgScore} pts</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #edf2f7; padding-bottom: 8px;">
                <span style="font-weight: 600;">Current / Best Win Streak:</span>
                <strong style="color: #0284c7;">${stats.currentWinStreak} / ${stats.bestWinStreak}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #edf2f7; padding-bottom: 8px;">
                <span style="font-weight: 600;">Total Yatzys Scored:</span>
                <strong style="color: #ef4444; font-size: 1rem;">${stats.yatzyCount}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">Upper Bonuses (+35):</span>
                <strong style="color: #7b2cbf; font-size: 1rem;">${stats.bonusCount}</strong>
              </div>
            </div>

            <!-- Difficulty Breakdown -->
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="font-size: 0.78rem; font-weight: 900; color: #1e354d; letter-spacing: 0.08em; text-transform: uppercase;">
                BY DIFFICULTY
              </div>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                ${['easy', 'medium', 'hard'].map(d => {
                  const diff = d as 'easy' | 'medium' | 'hard';
                  const sub = stats.byDifficulty[diff];
                  const subRate = sub.games > 0 ? Math.round((sub.wins / sub.games) * 100) : 0;
                  const diffColors = {
                    easy: { title: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                    medium: { title: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
                    hard: { title: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
                  };
                  const c = diffColors[diff];
                  return `
                    <div style="background: ${c.bg}; border: 1.5px solid ${c.border}; border-radius: 12px; padding: 10px 8px; text-align: center;">
                      <div style="font-size: 0.74rem; font-weight: 900; color: ${c.title}; text-transform: uppercase;">${diff}</div>
                      <div style="font-size: 1.05rem; font-weight: 900; color: #1e354d; margin: 3px 0;">${sub.wins}W / ${sub.games}G</div>
                      <div style="font-size: 0.74rem; font-weight: 700; color: #64748b;">${subRate}% win</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-done-stats" style="width: 100%; height: 46px; font-size: 1rem;">Close</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { this.container.innerHTML = ''; };
    this.container.querySelector('#btn-close-stats')?.addEventListener('click', close);
    this.container.querySelector('#btn-done-stats')?.addEventListener('click', close);
  }
}
