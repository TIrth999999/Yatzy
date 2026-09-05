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
      <div class="scorecard-modern-card">
        <!-- Upper Section Header -->
        <div class="sc-section-header">
          <span class="sc-header-label">UPPER SECTION</span>
          <div class="sc-header-badges">
            <span class="sc-badge player">YOU</span>
            <span class="sc-badge bot">BOT</span>
          </div>
        </div>

        <!-- Upper Rows -->
        <div class="sc-rows-container">
          ${UPPER_CATEGORIES.map((cat, idx) => {
            const dieVal = idx + 1;
            const names = ['Ones', 'Twos', 'Threes', 'Fours', 'Fives', 'Sixes'];
            return this.renderRow(
              cat,
              names[idx],
              '',
              Icons.dieFaceTile(dieVal),
              pCard,
              bCard,
              potentials,
              recommendation?.category === cat
            );
          }).join('')}
        </div>

        <!-- Upper Total -->
        <div class="sc-subtotal-row">
          <span>UPPER TOTAL</span>
          <div class="sc-subtotal-values">
            <span class="sc-subtotal-num player">${pCard.upperSubtotal}</span>
            <span class="sc-subtotal-num bot">${bCard.upperSubtotal}</span>
          </div>
        </div>

        <!-- Bonus Progress Row (63+) -->
        <div class="sc-bonus-row">
          <div class="sc-bonus-meta">
            <span class="sc-bonus-label">BONUS (63+)</span>
            <div class="sc-bonus-track">
              <div class="sc-bonus-fill" style="width: ${Math.min(100, (pCard.upperSubtotal / 63) * 100)}%;"></div>
            </div>
          </div>
          <div class="sc-bonus-values">
            <span class="sc-bonus-num player">${pCard.upperBonus}</span>
            <span class="sc-bonus-num bot">${bCard.upperBonus}</span>
          </div>
        </div>

        <!-- Lower Section Header -->
        <div class="sc-section-header">
          <span class="sc-header-label">LOWER SECTION</span>
          <div class="sc-header-badges">
            <span class="sc-badge player">YOU</span>
            <span class="sc-badge bot">BOT</span>
          </div>
        </div>

        <!-- Lower Rows -->
        <div class="sc-rows-container">
          ${this.renderRow('threeOfAKind', '3 of a kind', 'Total of all dice', '<span class="sc-icon-tile">3x</span>', pCard, bCard, potentials, recommendation?.category === 'threeOfAKind')}
          ${this.renderRow('fourOfAKind', '4 of a kind', 'Total of all dice', '<span class="sc-icon-tile">4x</span>', pCard, bCard, potentials, recommendation?.category === 'fourOfAKind')}
          ${this.renderRow('fullHouse', 'Full House', '25 points', Icons.house(18, '#1e354d'), pCard, bCard, potentials, recommendation?.category === 'fullHouse')}
          ${this.renderRow('smallStraight', 'Small Straight', '30 points', Icons.cardsSmall(), pCard, bCard, potentials, recommendation?.category === 'smallStraight')}
          ${this.renderRow('largeStraight', 'Large Straight', '40 points', Icons.cardsLarge(), pCard, bCard, potentials, recommendation?.category === 'largeStraight')}
          ${this.renderRow('yatzy', 'Yahtzee', '50 points', '<span class="sc-icon-tile yahtzy-tile">YATZY</span>', pCard, bCard, potentials, recommendation?.category === 'yatzy')}
          ${this.renderRow('chance', 'Chance', 'Total of all dice', Icons.question(18, '#1e354d'), pCard, bCard, potentials, recommendation?.category === 'chance')}
        </div>

        <!-- Lower Total -->
        <div class="sc-subtotal-row">
          <span>LOWER TOTAL</span>
          <div class="sc-subtotal-values">
            <span class="sc-subtotal-num player">${pCard.lowerTotal}</span>
            <span class="sc-subtotal-num bot">${bCard.lowerTotal}</span>
          </div>
        </div>

        <!-- Grand Total -->
        <div class="sc-grand-total-bar">
          <span class="sc-grand-label">GRAND TOTAL</span>
          <div class="sc-grand-values">
            <span class="sc-grand-num player">${pCard.grandTotal}</span>
            <span class="sc-grand-num bot">${bCard.grandTotal}</span>
          </div>
        </div>
      </div>
    `;

    this.attachRowClickHandlers(potentials);
  }

  private renderRow(
    category: ScoreCategory,
    name: string,
    subtext: string,
    iconHTML: string,
    pCard: any,
    bCard: any,
    potentials: Record<ScoreCategory, number> | null,
    isBest: boolean
  ): string {
    const isPlayerScored = pCard.scores[category] !== undefined;
    const isBotScored = bCard.scores[category] !== undefined;

    const pScoreVal = isPlayerScored ? pCard.scores[category] : (potentials ? potentials[category] : '');
    const bScoreVal = isBotScored ? bCard.scores[category] : '';

    const canSelect = !isPlayerScored && potentials !== null;

    let pClass = 'player';
    if (isPlayerScored) {
      pClass += ' committed';
    } else if (canSelect) {
      pClass += ' preview';
    }

    let bClass = 'bot';
    if (isBotScored) {
      bClass += ' committed';
    }

    return `
      <div class="sc-row ${canSelect ? 'row-selectable' : ''} ${isBest ? 'is-best-recommendation' : ''}" data-category="${category}">
        <div class="sc-cell-meta">
          <div class="sc-icon-wrapper">
            ${iconHTML}
          </div>
          <div class="sc-text-wrapper">
            <span class="sc-cat-name">${name}</span>
            ${subtext ? `<span class="sc-cat-desc">${subtext}</span>` : ''}
          </div>
        </div>

        <div class="sc-cell-scores">
          <div class="sc-score-box ${pClass}" title="${canSelect ? 'Tap to score' : ''}">
            <span>${pScoreVal !== '' ? pScoreVal : '-'}</span>
            ${canSelect ? `<span class="sc-dot">●</span>` : ''}
          </div>

          <div class="sc-score-box ${bClass}">
            <span>${bScoreVal !== '' ? bScoreVal : '-'}</span>
          </div>
        </div>
      </div>
    `;
  }

  private attachRowClickHandlers(potentials: Record<ScoreCategory, number> | null): void {
    if (!potentials) return;

    const rows = this.container.querySelectorAll('.sc-row.row-selectable');
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
