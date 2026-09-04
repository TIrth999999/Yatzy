import {
  CATEGORY_METAS,
  ScoreCategory,
  UPPER_CATEGORIES,
  LOWER_CATEGORIES
} from '../../types/game';
import { GameEngine } from '../../core/GameEngine';
import { calculateAllCategoryScores } from '../../scoring/ScoreRules';
import { SmartRecommender } from '../../scoring/SmartRecommender';
import { EventBus } from '../../core/EventBus';

export class Scorecard {
  private container: HTMLElement;
  private engine: GameEngine;
  private bus: EventBus = EventBus.getInstance();

  constructor(container: HTMLElement, engine: GameEngine) {
    this.container = container;
    this.engine = engine;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.bus.on('DICE_ROLLED', () => this.render());
    this.bus.on('SCORE_COMMITTED', () => this.render());
    this.bus.on('TURN_STARTED', () => this.render());
  }

  public render(): void {
    const state = this.engine.getState();
    const pCard = state.player.scorecard;
    const bCard = state.bot.scorecard;
    const isPlayer = state.activePlayer === 'player';
    const rollCount = this.engine.getDice().getRollCount();
    const diceValues = this.engine.getDice().getValues();

    // Potential scores if player has rolled
    const potentialScores = (isPlayer && rollCount > 0)
      ? calculateAllCategoryScores(diceValues)
      : null;

    // Best choice recommendation
    const recommendation = (isPlayer && rollCount > 0)
      ? SmartRecommender.recommend(diceValues, pCard, rollCount)
      : null;

    const bonusThreshold = 63;
    const upperSub = pCard.upperSubtotal;
    const bonusPercent = Math.min(100, Math.floor((upperSub / bonusThreshold) * 100));

    this.container.innerHTML = `
      <div class="scorecard-wrapper" style="display: flex; flex-direction: column; height: 100%;">
        <div class="scorecard-table-container">
          <!-- Upper Section Column -->
          <div class="scorecard-column">
            <div class="column-header">UPPER SECTION</div>
            ${UPPER_CATEGORIES.map(cat => this.renderRow(cat, pCard, bCard, potentialScores, recommendation?.category)).join('')}

            <!-- Upper Bonus Progress Bar -->
            <div class="bonus-progress-panel">
              <div class="bonus-info-row">
                <span style="color: var(--accent-gold);">BONUS (+35)</span>
                <span>${upperSub} / ${bonusThreshold}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${bonusPercent}%;"></div>
              </div>
              ${pCard.bonusAchieved ? '<span style="font-size: 0.72rem; color: #4cd137; font-weight: 800;">★ BONUS ACHIEVED (+35)</span>' : ''}
            </div>
          </div>

          <!-- Lower Section Column -->
          <div class="scorecard-column">
            <div class="column-header">LOWER SECTION</div>
            ${LOWER_CATEGORIES.map(cat => this.renderRow(cat, pCard, bCard, potentialScores, recommendation?.category)).join('')}

            <!-- Totals Overview -->
            <div class="totals-row">
              <span>TOTAL</span>
              <div style="display: flex; gap: 16px;">
                <span style="color: var(--primary-coral);">${pCard.grandTotal}</span>
                <span style="color: var(--accent-cyan);">${bCard.grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachRowClickHandlers(potentialScores);
  }

  private renderRow(
    category: ScoreCategory,
    playerCard: any,
    botCard: any,
    potentials: Record<ScoreCategory, number> | null,
    recommendedCategory?: ScoreCategory
  ): string {
    const meta = CATEGORY_METAS[category];
    const playerScored = playerCard.scores[category] !== undefined;
    const botScored = botCard.scores[category] !== undefined;

    const pScoreVal = playerScored ? playerCard.scores[category] : (potentials ? potentials[category] : '-');
    const bScoreVal = botScored ? botCard.scores[category] : '-';

    const isClickable = !playerScored && potentials !== null;
    const isBest = isClickable && recommendedCategory === category;

    let rowClass = 'score-row';
    if (playerScored) rowClass += ' scored';
    else if (isClickable) rowClass += ' clickable';
    if (isBest) rowClass += ' best-choice';

    let badgeClass = 'score-val-badge';
    if (playerScored) {
      badgeClass += playerCard.scores[category] === 0 ? ' zero' : ' committed';
    } else if (potentials !== null) {
      badgeClass += ' potential';
    }

    return `
      <div class="${rowClass}" data-category="${category}">
        <div class="score-category-label">
          <span>${meta.shortName}</span>
          <span style="font-size: 0.72rem; color: var(--text-light-muted); font-weight: 600;">${meta.name}</span>
          ${isBest ? '<span style="font-size: 0.65rem; background: var(--accent-gold); color: #000; font-weight: 800; padding: 1px 5px; border-radius: 4px;">BEST</span>' : ''}
        </div>

        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="${badgeClass}" title="${meta.description}">
            ${pScoreVal}
          </div>
          <div class="bot-score-badge" title="Bot Score">
            ${bScoreVal}
          </div>
        </div>
      </div>
    `;
  }

  private attachRowClickHandlers(potentials: Record<ScoreCategory, number> | null): void {
    if (!potentials) return;

    const rows = this.container.querySelectorAll('.score-row.clickable');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const cat = row.getAttribute('data-category') as ScoreCategory;
        if (cat) {
          this.engine.playerCommitScore(cat);
        }
      });
    });
  }
}
