import { StatsManager } from '../../persistence/StatsManager';

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
        <div class="modal-content">
          <div class="modal-header">
            <h2>Player Statistics</h2>
            <button class="btn btn-secondary btn-icon" id="btn-close-stats">✕</button>
          </div>
          <div class="modal-body" style="gap: 16px;">
            <!-- Overall Highlight Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <div style="background: rgba(255, 255, 255, 0.05); border-radius: var(--radius-md); padding: 12px; text-align: center;">
                <div style="font-size: 0.72rem; color: var(--text-light-muted); font-weight: 700;">PLAYED</div>
                <div style="font-size: 1.6rem; font-weight: 900;">${stats.gamesPlayed}</div>
              </div>
              <div style="background: rgba(255, 255, 255, 0.05); border-radius: var(--radius-md); padding: 12px; text-align: center;">
                <div style="font-size: 0.72rem; color: var(--accent-gold); font-weight: 700;">WIN RATE</div>
                <div style="font-size: 1.6rem; font-weight: 900; color: var(--accent-gold);">${winRate}%</div>
              </div>
              <div style="background: rgba(255, 255, 255, 0.05); border-radius: var(--radius-md); padding: 12px; text-align: center;">
                <div style="font-size: 0.72rem; color: var(--accent-cyan); font-weight: 700;">BEST SCORE</div>
                <div style="font-size: 1.6rem; font-weight: 900; color: var(--accent-cyan);">${stats.highestScore}</div>
              </div>
            </div>

            <!-- Key Records -->
            <div style="background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-md); padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem;">
              <div style="display: flex; justify-content: space-between;">
                <span>Total Wins / Losses / Ties:</span>
                <strong>${stats.gamesWon}W - ${stats.gamesLost}L - ${stats.gamesDrawn}D</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Average Score:</span>
                <strong>${avgScore} pts</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Current / Best Win Streak:</span>
                <strong>${stats.currentWinStreak} / ${stats.bestWinStreak}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Total Yatzys Scored:</span>
                <strong style="color: var(--primary-coral);">⚡ ${stats.yatzyCount}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Upper Bonuses (+35):</span>
                <strong style="color: var(--accent-gold);">★ ${stats.bonusCount}</strong>
              </div>
            </div>

            <!-- Difficulty Breakdown -->
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--accent-cyan); letter-spacing: 0.06em;">BY DIFFICULTY</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
              ${['easy', 'medium', 'hard'].map(d => {
                const diff = d as 'easy' | 'medium' | 'hard';
                const sub = stats.byDifficulty[diff];
                const subRate = sub.games > 0 ? Math.round((sub.wins / sub.games) * 100) : 0;
                return `
                  <div style="background: rgba(255,255,255,0.04); border-radius: var(--radius-sm); padding: 8px; text-align: center;">
                    <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">${diff}</div>
                    <div style="font-size: 1.1rem; font-weight: 800; margin: 4px 0;">${sub.wins}W / ${sub.games}G</div>
                    <div style="font-size: 0.75rem; color: var(--text-light-muted);">${subRate}% win</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="btn-done-stats" style="width: 100%;">Close</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { this.container.innerHTML = ''; };
    this.container.querySelector('#btn-close-stats')?.addEventListener('click', close);
    this.container.querySelector('#btn-done-stats')?.addEventListener('click', close);
  }
}
