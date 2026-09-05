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

    let title = 'VICTORY!';
    let titleColor = '#ff5252';
    let subtitle = `You won the match by ${data.scoreDifference} points!`;

    if (isDraw) {
      title = 'TIED MATCH!';
      titleColor = '#1e354d';
      subtitle = 'An extraordinary draw! Identical grand scores.';
    } else if (!isWin) {
      title = 'BOT WINS!';
      titleColor = '#00b4d8';
      subtitle = `Bot took the lead by ${data.scoreDifference} points.`;
    }

    this.container.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-content" style="text-align: center; max-width: 440px;">
          <div class="modal-body" style="gap: 14px; padding: 26px 20px;">
            <div style="display: flex; justify-content: center;">
              <div style="
                width: 72px;
                height: 72px;
                border-radius: 50%;
                background: ${isWin ? '#fffbeb' : '#f0f9ff'};
                border: 2px solid ${isWin ? '#fde68a' : '#bae6fd'};
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 14px ${isWin ? 'rgba(255, 210, 0, 0.25)' : 'rgba(0, 180, 216, 0.25)'};
              ">
                ${Icons.trophy(44, isWin ? '#ffd200' : '#00b4d8')}
              </div>
            </div>
            <div>
              <h2 style="font-size: 2.2rem; font-weight: 900; color: ${titleColor}; line-height: 1.1; letter-spacing: -0.01em;">
                ${title}
              </h2>
              <p style="font-size: 0.95rem; font-weight: 600; color: #475569; margin-top: 4px;">${subtitle}</p>
            </div>

            <!-- Score Comparison Cards -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 4px 0;">
              <div style="background: #fef2f2; border: 2.5px solid #ff5252; border-radius: 16px; padding: 14px 10px;">
                <div style="font-size: 0.8rem; font-weight: 900; color: #ff5252; letter-spacing: 0.05em;">YOU</div>
                <div style="font-size: 2.4rem; font-weight: 900; color: #1e354d; line-height: 1.1; margin: 2px 0;">${data.playerScore}</div>
                <div style="font-size: 0.76rem; color: #64748b; font-weight: 700;">
                  Upper: ${data.playerScorecard.upperSubtotal} ${data.playerScorecard.bonusAchieved ? '(+35)' : ''}
                </div>
              </div>

              <div style="background: #f0f9ff; border: 2.5px solid #00b4d8; border-radius: 16px; padding: 14px 10px;">
                <div style="font-size: 0.8rem; font-weight: 900; color: #00b4d8; letter-spacing: 0.05em;">BOT (${data.difficulty.toUpperCase()})</div>
                <div style="font-size: 2.4rem; font-weight: 900; color: #1e354d; line-height: 1.1; margin: 2px 0;">${data.botScore}</div>
                <div style="font-size: 0.76rem; color: #64748b; font-weight: 700;">
                  Upper: ${data.botScorecard.upperSubtotal} ${data.botScorecard.bonusAchieved ? '(+35)' : ''}
                </div>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 6px;">
              <button class="btn btn-primary" id="btn-result-rematch" style="height: 52px; font-size: 1.15rem; width: 100%;">
                PLAY AGAIN
              </button>
              <div style="display: flex; gap: 10px; width: 100%;">
                <button class="btn btn-secondary" id="btn-result-diff" style="flex: 1; height: 44px; font-size: 0.85rem;">
                  CHANGE DIFFICULTY
                </button>
                <button class="btn btn-secondary" id="btn-result-menu" style="flex: 1; height: 44px; font-size: 0.85rem;">
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
