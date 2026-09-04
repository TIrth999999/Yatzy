import { ScorecardState } from '../../types/game';
import { ConfettiSystem } from '../animations/Confetti';
import { EventBus } from '../../core/EventBus';
import { Icons } from '../icons/Icons';

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
    let titleColor = '#e84d43';
    let subtitle = `Crushed the bot by ${data.scoreDifference} points!`;

    if (isDraw) {
      title = 'TIED MATCH!';
      titleColor = '#2d2538';
      subtitle = 'An extraordinary draw! Identical scores.';
    } else if (!isWin) {
      title = 'BOT WINS!';
      titleColor = '#54b7cb';
      subtitle = `You were ${data.scoreDifference} points behind.`;
    }

    this.container.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-content" style="text-align: center; max-width: 480px;">
          <div class="modal-body" style="gap: 16px; padding: 28px 24px;">
            <div style="display: flex; justify-content: center;">
              ${Icons.trophy(56, isWin ? '#ffd200' : '#54b7cb')}
            </div>
            <h2 style="font-size: 2.2rem; font-weight: 900; color: ${titleColor}; line-height: 1;">
              ${title}
            </h2>
            <p style="font-size: 0.95rem; color: var(--text-light-muted);">${subtitle}</p>

            <!-- Score Comparison Cards -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 12px 0;">
              <div style="background: #fff5f5; border: 2px solid #ff5e57; border-radius: var(--radius-md); padding: 14px;">
                <div style="font-size: 0.8rem; font-weight: 800; color: #ff5e57;">YOU</div>
                <div style="font-size: 2.4rem; font-weight: 900; color: #23374d;">${data.playerScore}</div>
                <div style="font-size: 0.76rem; color: #64748b; font-weight: 600;">
                  Upper: ${data.playerScorecard.upperSubtotal} ${data.playerScorecard.bonusAchieved ? '(+35)' : ''}
                </div>
              </div>

              <div style="background: #f0faff; border: 2px solid #00b4d8; border-radius: var(--radius-md); padding: 14px;">
                <div style="font-size: 0.8rem; font-weight: 800; color: #00b4d8;">BOT (${data.difficulty.toUpperCase()})</div>
                <div style="font-size: 2.4rem; font-weight: 900; color: #23374d;">${data.botScore}</div>
                <div style="font-size: 0.76rem; color: #64748b; font-weight: 600;">
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
