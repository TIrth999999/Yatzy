import { Icons } from '../icons/Icons';

export class HowToPlayModal {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public show(): void {
    this.container.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-content" style="max-width: 480px;">
          <div class="modal-header">
            <h2>${Icons.book(22, '#1e354d')} How to Play Yatzy</h2>
            <button class="modal-close-btn" id="btn-close-htp" aria-label="Close">
              ${Icons.close(18, '#1e354d')}
            </button>
          </div>
          <div class="modal-body" style="gap: 14px;">
            <!-- Step 1 -->
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <h4 style="color: #ff5252; font-size: 0.95rem; font-weight: 900; letter-spacing: 0.04em;">1. ROLL & HOLD</h4>
                <span class="score-pill coral">3 ROLLS</span>
              </div>
              <p style="color: #334155; font-size: 0.88rem; line-height: 1.45;">
                On each turn, you can roll the 5 dice up to <strong>3 times</strong>. Tap any dice to <strong>hold (keep)</strong> them, and re-roll the rest to build high-scoring combinations.
              </p>
            </div>

            <!-- Step 2 -->
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <h4 style="color: #00b4d8; font-size: 0.95rem; font-weight: 900; letter-spacing: 0.04em;">2. CHOOSE A CATEGORY</h4>
                <span class="score-pill">13 ROUNDS</span>
              </div>
              <p style="color: #334155; font-size: 0.88rem; line-height: 1.45;">
                After rolling, choose <strong>one category</strong> on your scorecard to bank points. Each of the 13 categories can only be scored <strong>once</strong> per match!
              </p>
            </div>

            <!-- Step 3 -->
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <h4 style="color: #7b2cbf; font-size: 0.95rem; font-weight: 900; letter-spacing: 0.04em;">3. UPPER SECTION BONUS</h4>
                <span class="score-pill gold">+35 BONUS</span>
              </div>
              <p style="color: #334155; font-size: 0.88rem; line-height: 1.45;">
                Categories 1 through 6 sum matching dice. Reach <strong>63 or more</strong> points in the Upper Section to earn a massive <strong>+35 bonus</strong>!
              </p>
            </div>

            <!-- Step 4 -->
            <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px;">
              <h4 style="color: #16a34a; font-size: 0.95rem; font-weight: 900; margin-bottom: 10px; letter-spacing: 0.04em;">4. SPECIAL COMBINATIONS</h4>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.86rem; color: #334155;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span><strong>3 & 4 of a Kind:</strong> 3 or 4 matching dice</span>
                  <span class="score-pill">Sum of all 5</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span><strong>Full House:</strong> 3 of one + 2 of another</span>
                  <span class="score-pill gold">25 pts</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span><strong>Small Straight:</strong> 4 sequential dice</span>
                  <span class="score-pill">30 pts</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span><strong>Large Straight:</strong> 5 sequential dice</span>
                  <span class="score-pill">40 pts</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span><strong>Yatzy:</strong> All 5 dice identical</span>
                  <span class="score-pill coral">50 pts!</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span><strong>Chance:</strong> Any dice combination</span>
                  <span class="score-pill">Sum of all 5</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="btn-done-htp" style="width: 100%; height: 48px; font-size: 1.05rem;">
              Got It, Let's Play!
            </button>
          </div>
        </div>
      </div>
    `;

    const close = () => { this.container.innerHTML = ''; };
    this.container.querySelector('#btn-close-htp')?.addEventListener('click', close);
    this.container.querySelector('#btn-done-htp')?.addEventListener('click', close);
  }
}
