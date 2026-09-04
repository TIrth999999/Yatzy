import { Icons } from '../icons/Icons';

export class HowToPlayModal {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public show(): void {
    this.container.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal-content">
          <div class="modal-header">
            <h2>How to Play Yatzy</h2>
            <button class="circle-header-btn" id="btn-close-htp" style="width: 36px; height: 36px;">
              ${Icons.close(18, '#2d2538')}
            </button>
          </div>
          <div class="modal-body" style="font-size: 0.92rem; line-height: 1.5; color: #ddd7e5;">
            <div>
              <h4 style="color: var(--primary-coral); font-size: 1rem; margin-bottom: 4px;">1. ROLL & HOLD</h4>
              <p>On each turn, you can roll your 5 dice up to <strong>3 times</strong>. After any roll, tap dice to <strong>keep (hold)</strong> them, and roll again to improve your combinations.</p>
            </div>

            <div>
              <h4 style="color: var(--accent-cyan); font-size: 1rem; margin-bottom: 4px;">2. CHOOSE A CATEGORY</h4>
              <p>After your rolls, select one available category on your scorecard. Each of the 13 categories can only be scored <strong>once</strong> per game.</p>
            </div>

            <div>
              <h4 style="color: var(--accent-gold); font-size: 1rem; margin-bottom: 4px;">3. UPPER SECTION BONUS (+35)</h4>
              <p>Categories 1 through 6 sum the matching dice. If your upper section total reaches <strong>63 or more</strong>, you earn a massive <strong>+35 bonus</strong> points!</p>
            </div>

            <div>
              <h4 style="color: #4cd137; font-size: 1rem; margin-bottom: 4px;">4. SPECIAL COMBINATIONS</h4>
              <ul style="padding-left: 20px; display: flex; flex-direction: column; gap: 4px;">
                <li><strong>3 of a Kind / 4 of a Kind:</strong> Sum of all 5 dice.</li>
                <li><strong>Full House:</strong> 3 of one value + 2 of another (sum of all dice).</li>
                <li><strong>Small Straight:</strong> 4 consecutive dice (15 points).</li>
                <li><strong>Large Straight:</strong> 5 consecutive dice (20 points).</li>
                <li><strong>Yatzy:</strong> All 5 dice matching (50 points!).</li>
                <li><strong>Chance:</strong> Sum of all dice (always available).</li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" id="btn-done-htp" style="width: 100%;">Understood!</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { this.container.innerHTML = ''; };
    this.container.querySelector('#btn-close-htp')?.addEventListener('click', close);
    this.container.querySelector('#btn-done-htp')?.addEventListener('click', close);
  }
}
