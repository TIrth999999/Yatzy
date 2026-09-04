import { Achievement } from '../types/game';
import { SaveManager } from './SaveManager';
import { EventBus } from '../core/EventBus';

export const ACHIEVEMENTS_DEF: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_roll',
    title: 'First Roll',
    description: 'Complete your first Yatzy match',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6353" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 8h.01M8 8h.01M8 16h.01M16 16h.01M12 12h.01"/></svg>'
  },
  {
    id: 'first_win',
    title: 'First Victory',
    description: 'Win your first match against the bot',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffd200" stroke-width="2"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>'
  },
  {
    id: 'yatzy',
    title: 'YATZY!',
    description: 'Score a full 50-point Yatzy',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="#ffd200"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>'
  },
  {
    id: 'bonus_master',
    title: 'Upper Bonus',
    description: 'Reach 63+ in the upper section for +35 bonus',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="#8938a1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  },
  {
    id: 'hard_win',
    title: 'Hardcore Master',
    description: 'Defeat the Hard AI opponent',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6353" stroke-width="2"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z"/></svg>'
  },
  {
    id: 'high_roller',
    title: 'High Roller',
    description: 'Score over 250 points in a single match',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#54b7cb" stroke-width="2"><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M11 3L8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>'
  },
  {
    id: 'straight_shooter',
    title: 'Straight Shooter',
    description: 'Score both Small and Large Straights in one game',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'
  },
  {
    id: 'win_streak_3',
    title: 'Hot Streak',
    description: 'Win 3 consecutive matches',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="#ff6353"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>'
  },
  {
    id: 'win_streak_5',
    title: 'Unstoppable',
    description: 'Win 5 consecutive matches in a row',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffd200" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>'
  },
  {
    id: 'full_house_king',
    title: 'Full House Master',
    description: 'Score a Full House of 25 or higher',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="#2d2538"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3z"/></svg>'
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
