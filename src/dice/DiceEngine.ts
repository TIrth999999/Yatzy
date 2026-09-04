import { DieState, DieValue } from '../types/game';
import { RNGService } from './RNG';

export class DiceEngine {
  private dice: DieState[] = [
    { id: 0, value: 1, held: false },
    { id: 1, value: 2, held: false },
    { id: 2, value: 3, held: false },
    { id: 3, value: 4, held: false },
    { id: 4, value: 5, held: false }
  ];

  private rollCount: number = 0;
  private readonly maxRolls: number = 3;
  private rng: RNGService = RNGService.getInstance();

  constructor(maxRolls: number = 3) {
    this.maxRolls = maxRolls;
  }

  public getDice(): DieState[] {
    return this.dice.map(d => ({ ...d }));
  }

  public getValues(): DieValue[] {
    return this.dice.map(d => d.value);
  }

  public getRollCount(): number {
    return this.rollCount;
  }

  public getMaxRolls(): number {
    return this.maxRolls;
  }

  public getRemainingRolls(): number {
    return Math.max(0, this.maxRolls - this.rollCount);
  }

  public canRoll(): boolean {
    return this.rollCount < this.maxRolls;
  }

  /**
   * Resets dice and holds for a fresh turn
   */
  public resetTurn(): void {
    this.rollCount = 0;
    this.dice.forEach(d => {
      d.held = false;
    });
  }

  /**
   * Toggles the hold state of a specific die.
   * Can only hold dice after at least one roll has been performed!
   */
  public toggleHold(index: number): boolean {
    if (this.rollCount === 0) return false;
    if (index < 0 || index >= this.dice.length) return false;
    this.dice[index].held = !this.dice[index].held;
    return this.dice[index].held;
  }

  public setHold(index: number, held: boolean): void {
    if (this.rollCount === 0) return;
    if (index < 0 || index >= this.dice.length) return;
    this.dice[index].held = held;
  }

  public setAllHolds(holds: boolean[]): void {
    if (this.rollCount === 0) return;
    holds.forEach((held, i) => {
      if (i < this.dice.length) {
        this.dice[i].held = held;
      }
    });
  }

  /**
   * Rolls all non-held dice. Increments rollCount.
   * Returns an array of booleans indicating which dice were rerolled.
   */
  public roll(): { rolledIndices: number[]; newValues: DieValue[] } {
    if (!this.canRoll()) {
      throw new Error('Maximum rolls exceeded for this turn');
    }

    const rolledIndices: number[] = [];
    this.dice.forEach((die, index) => {
      if (!die.held || this.rollCount === 0) {
        die.value = this.rng.rollDie();
        rolledIndices.push(index);
      }
    });

    this.rollCount++;
    return {
      rolledIndices,
      newValues: this.getValues()
    };
  }

  /**
   * For testing & dev debug: directly inject values into dice
   */
  public setDiceValues(values: DieValue[]): void {
    if (values.length !== 5) throw new Error('Expected 5 dice values');
    values.forEach((val, i) => {
      this.dice[i].value = val;
    });
    if (this.rollCount === 0) {
      this.rollCount = 1;
    }
  }

  public setRollCount(count: number): void {
    this.rollCount = Math.max(0, Math.min(this.maxRolls, count));
  }
}
