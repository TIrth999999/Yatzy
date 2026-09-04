import { Achievement } from '../types/game';
import { SaveManager } from './SaveManager';
import { EventBus } from '../core/EventBus';

export const ACHIEVEMENTS_DEF: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_roll',
    title: 'First Roll',
    description: 'Complete your first Yatzy match',
    icon: '🎲'
  },
  {
    id: 'first_win',
    title: 'First Victory',
    description: 'Win your first match against the bot',
    icon: '🏆'
  },
  {
    id: 'yatzy',
    title: 'YATZY!',
    description: 'Score a full 50-point Yatzy',
    icon: '⚡'
  },
  {
    id: 'bonus_master',
    title: 'Upper Bonus',
    description: 'Reach 63+ in the upper section for +35 bonus',
    icon: '🌟'
  },
  {
    id: 'hard_win',
    title: 'Hardcore Master',
    description: 'Defeat the Hard AI opponent',
    icon: '👑'
  },
  {
    id: 'high_roller',
    title: 'High Roller',
    description: 'Score over 250 points in a single match',
    icon: '💎'
  },
  {
    id: 'straight_shooter',
    title: 'Straight Shooter',
    description: 'Score both Small and Large Straights in one game',
    icon: '🎯'
  },
  {
    id: 'win_streak_3',
    title: 'Hot Streak',
    description: 'Win 3 consecutive matches',
    icon: '🔥'
  },
  {
    id: 'win_streak_5',
    title: 'Unstoppable',
    description: 'Win 5 consecutive matches in a row',
    icon: '🚀'
  },
  {
    id: 'full_house_king',
    title: 'Full House Master',
    description: 'Score a Full House of 25 or higher',
    icon: '🏠'
  }
];

export class AchievementManager {
  private static instance: AchievementManager;
  private achievements: Record<string, Achievement> = {};
  private saveMgr = SaveManager.getInstance();
  private bus = EventBus.getInstance();

  public static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  constructor() {
    const saved = this.saveMgr.load<Record<string, Achievement>>('achievements', {});
    ACHIEVEMENTS_DEF.forEach(def => {
      this.achievements[def.id] = {
        ...def,
        unlocked: saved[def.id]?.unlocked || false,
        unlockedAt: saved[def.id]?.unlockedAt
      };
    });
  }

  public getAchievements(): Achievement[] {
    return Object.values(this.achievements);
  }

  public isUnlocked(id: string): boolean {
    return !!this.achievements[id]?.unlocked;
  }

  public unlock(id: string): boolean {
    const ach = this.achievements[id];
    if (!ach || ach.unlocked) return false;

    ach.unlocked = true;
    ach.unlockedAt = new Date().toISOString();
    this.save();

    this.bus.emit('ACHIEVEMENT_UNLOCKED', {
      id: ach.id,
      title: ach.title,
      description: ach.description,
      icon: ach.icon
    });

    return true;
  }

  public reset(): void {
    ACHIEVEMENTS_DEF.forEach(def => {
      this.achievements[def.id] = {
        ...def,
        unlocked: false
      };
    });
    this.save();
  }

  private save(): void {
    this.saveMgr.save('achievements', this.achievements);
  }
}
