import { ScorecardState } from '../../types/game';
import { ConfettiSystem } from '../animations/Confetti';
import { EventBus } from '../../core/EventBus';

export interface MatchResultData {
  winner: 'player' | 'bot' | 'draw';
  playerScore: number;
  botScore: number;
  scoreDifference: number;
  playerScorecard: ScorecardState;
  botScorecard: ScorecardState;
  difficulty: string;
}

export class ResultModal {
  private container: HTMLElement;
  private confetti: ConfettiSystem;
  private bus: EventBus = EventBus.getInstance();

  constructor(container: HTMLElement, confetti: ConfettiSystem) {
    this.container = container;
    this.confetti = confetti;
  }

  public show(data: MatchResultData): void {
    if (data.winner === 'player') {
      this.confetti.explode(100);
    }

    const isWin = data.winner === 'player';
    const isDraw = data.winner === 'draw';

    let title = 'YOU WIN!';
    let titleColor = 'var(--accent-gold)';
    let subtitle = `Crushed the bot by ${data.scoreDifference} points!`;

    if (isDraw) {
      title = 'TIED MATCH!';
      titleColor = 'var(--text-light)';
      subtitle = 'An extraordinary draw! Identical scores.';
    } else if (!isWin) {
      title = 'BOT WINS!';
      titleColor = 'var(--accent-cyan)';
      subtitle = `You were ${data.scoreDifference} points behind.`;
    }

    this.container.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-content" style="text-align: center; max-width: 480px;">
          <div class="modal-body" style="gap: 16px; padding: 28px 24px;">
            <div style="font-size: 3rem;">${isWin ? '🏆' : isDraw ? '🤝' : '🎲'}</div>
            <h2 style="font-size: 2.2rem; font-weight: 900; color: ${titleColor}; line-height: 1;">
              ${title}
            </h2>
            <p style="font-size: 0.95rem; color: var(--text-light-muted);">${subtitle}</p>

            <!-- Score Comparison Cards -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 12px 0;">
              <div style="background: rgba(255, 94, 87, 0.15); border: 1px solid var(--primary-coral); border-radius: var(--radius-md); padding: 14px;">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--primary-coral);">YOU</div>
                <div style="font-size: 2.4rem; font-weight: 900; color: #ffffff;">${data.playerScore}</div>
                <div style="font-size: 0.75rem; color: var(--text-light-muted);">
                  Upper: ${data.playerScorecard.upperSubtotal} ${data.playerScorecard.bonusAchieved ? '(+35)' : ''}
                </div>
              </div>

              <div style="background: rgba(0, 210, 211, 0.15); border: 1px solid var(--accent-cyan); border-radius: var(--radius-md); padding: 14px;">
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-cyan);">BOT (${data.difficulty.toUpperCase()})</div>
                <div style="font-size: 2.4rem; font-weight: 900; color: #ffffff;">${data.botScore}</div>
                <div style="font-size: 0.75rem; color: var(--text-light-muted);">
                  Upper: ${data.botScorecard.upperSubtotal} ${data.botScorecard.bonusAchieved ? '(+35)' : ''}
                </div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 10px;">
              <button class="btn btn-primary" id="btn-result-rematch" style="height: 52px; font-size: 1.15rem;">
                PLAY AGAIN
              </button>
              <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary" id="btn-result-diff" style="flex: 1; height: 44px;">
                  CHANGE DIFFICULTY
                </button>
                <button class="btn btn-secondary" id="btn-result-menu" style="flex: 1; height: 44px;">
                  MAIN MENU
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.querySelector('#btn-result-rematch')?.addEventListener('click', () => {
      this.close();
      this.bus.emit('REQUEST_REMATCH');
    });

    this.container.querySelector('#btn-result-diff')?.addEventListener('click', () => {
      this.close();
      this.bus.emit('REQUEST_DIFFICULTY_SELECT');
    });

    this.container.querySelector('#btn-result-menu')?.addEventListener('click', () => {
      this.close();
      this.bus.emit('REQUEST_MAIN_MENU');
    });
  }

  public close(): void {
    this.container.innerHTML = '';
  }
}
