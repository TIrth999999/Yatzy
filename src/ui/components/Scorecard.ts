import {
  ScoreCategory,
  UPPER_CATEGORIES
} from '../../types/game';
import { GameEngine } from '../../core/GameEngine';
import { calculateAllCategoryScores } from '../../scoring/ScoreRules';
import { SmartRecommender } from '../../scoring/SmartRecommender';
import { EventBus } from '../../core/EventBus';
import { Icons } from '../icons/Icons';

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

    const potentials = (isPlayer && rollCount > 0)
      ? calculateAllCategoryScores(diceValues)
      : null;

    const recommendation = (isPlayer && rollCount > 0)
      ? SmartRecommender.recommend(diceValues, pCard, rollCount)
      : null;

    this.container.innerHTML = `
      <div class="scorecard-board-reference">
        <!-- Left Column: Upper Section -->
        <div class="board-column upper-col">
          ${UPPER_CATEGORIES.map((cat, idx) => {
            const dieVal = idx + 1;
            return this.renderCategoryRow(
              cat,
              Icons.dieFaceTile(dieVal),
              pCard,
              bCard,
              potentials,
              recommendation?.category === cat
            );
          }).join('')}

          <!-- Bonus Row with Guaranteed True Circles (Matches reference screenshots 1, 3, 5) -->
          <div class="scorecard-row bonus-row">
            <div class="row-tile-icon bonus-label-box">
              <span class="bonus-title">BONUS</span>
              <span class="bonus-plus">+35</span>
            </div>

            <div class="bonus-cell">
              <div class="bonus-ring-circle ${pCard.bonusAchieved ? 'achieved' : ''}">
                <span class="ring-text">${pCard.upperSubtotal}/63</span>
              </div>
            </div>

            <div class="bonus-cell">
              <div class="bonus-ring-circle bot ${bCard.bonusAchieved ? 'achieved' : ''}">
                <span class="ring-text">${bCard.upperSubtotal}/63</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Divider line -->
        <div class="board-divider"></div>

        <!-- Right Column: Lower Section -->
        <div class="board-column lower-col">
          ${this.renderCategoryRow('threeOfAKind', '<span class="text-tile">3x</span>', pCard, bCard, potentials, recommendation?.category === 'threeOfAKind')}
          ${this.renderCategoryRow('fourOfAKind', '<span class="text-tile">4x</span>', pCard, bCard, potentials, recommendation?.category === 'fourOfAKind')}
          ${this.renderCategoryRow('fullHouse', Icons.house(22, '#2d2538'), pCard, bCard, potentials, recommendation?.category === 'fullHouse')}
          ${this.renderCategoryRow('smallStraight', Icons.cardsSmall(), pCard, bCard, potentials, recommendation?.category === 'smallStraight')}
          ${this.renderCategoryRow('largeStraight', Icons.cardsLarge(), pCard, bCard, potentials, recommendation?.category === 'largeStraight')}
          ${this.renderCategoryRow('yatzy', Icons.yatzyLogo(), pCard, bCard, potentials, recommendation?.category === 'yatzy')}
          ${this.renderCategoryRow('chance', Icons.question(22, '#2d2538'), pCard, bCard, potentials, recommendation?.category === 'chance')}
        </div>
      </div>
    `;

    this.attachRowClickHandlers(potentials);
  }

  private renderCategoryRow(
    category: ScoreCategory,
    tileIconHTML: string,
    playerCard: any,
    botCard: any,
    potentials: Record<ScoreCategory, number> | null,
    isBest: boolean
  ): string {
    const isPlayerScored = playerCard.scores[category] !== undefined;
    const isBotScored = botCard.scores[category] !== undefined;

    const pScoreVal = isPlayerScored ? playerCard.scores[category] : (potentials ? potentials[category] : '');
    const bScoreVal = isBotScored ? botCard.scores[category] : '';

    const canSelect = !isPlayerScored && potentials !== null;

    let pSlotClass = 'score-slot player-slot';
    if (isPlayerScored) {
      pSlotClass += ' committed';
      if (playerCard.scores[category] > 0) pSlotClass += ' has-score';
      if (playerCard.scores[category] >= 18) pSlotClass += ' high-score'; // Green highlight like in reference 3!
    } else if (canSelect) {
      pSlotClass += ' selectable';
      if (isBest) pSlotClass += ' best-choice';
    }

    let bSlotClass = 'score-slot bot-slot';
    if (isBotScored) {
      bSlotClass += ' committed';
    }

    return `
      <div class="scorecard-row ${canSelect ? 'row-clickable' : ''}" data-category="${category}">
        <!-- Category Tile Icon -->
        <div class="row-tile-icon">
          ${tileIconHTML}
        </div>

        <!-- Player Score Slot (Coral) -->
        <div class="${pSlotClass}" title="${canSelect ? 'Tap to score' : ''}">
          <span class="slot-number">${pScoreVal}</span>
        </div>

        <!-- Bot Score Slot (Cyan) -->
        <div class="${bSlotClass}">
          <span class="slot-number">${bScoreVal}</span>
        </div>
      </div>
    `;
  }

  private attachRowClickHandlers(potentials: Record<ScoreCategory, number> | null): void {
    if (!potentials) return;

    const rows = this.container.querySelectorAll('.scorecard-row.row-clickable');
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
