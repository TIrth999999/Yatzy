export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export type ScoreCategory =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  | 'threeOfAKind'
  | 'fourOfAKind'
  | 'fullHouse'
  | 'smallStraight'
  | 'largeStraight'
  | 'yatzy'
  | 'chance';

export const UPPER_CATEGORIES: ScoreCategory[] = [
  'ones',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes'
];

export const LOWER_CATEGORIES: ScoreCategory[] = [
  'threeOfAKind',
  'fourOfAKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'yatzy',
  'chance'
];

export const ALL_CATEGORIES: ScoreCategory[] = [
  ...UPPER_CATEGORIES,
  ...LOWER_CATEGORIES
];

export interface CategoryMeta {
  id: ScoreCategory;
  name: string;
  shortName: string;
  section: 'upper' | 'lower';
  description: string;
  example: string;
}

export const CATEGORY_METAS: Record<ScoreCategory, CategoryMeta> = {
  ones: {
    id: 'ones',
    name: 'Ones',
    shortName: '1',
    section: 'upper',
    description: 'Sum of all dice showing 1',
    example: '1, 1, 1, 4, 6 = 3'
  },
  twos: {
    id: 'twos',
    name: 'Twos',
    shortName: '2',
    section: 'upper',
    description: 'Sum of all dice showing 2',
    example: '2, 2, 4, 5, 6 = 4'
  },
  threes: {
    id: 'threes',
    name: 'Threes',
    shortName: '3',
    section: 'upper',
    description: 'Sum of all dice showing 3',
    example: '3, 3, 3, 5, 6 = 9'
  },
  fours: {
    id: 'fours',
    name: 'Fours',
    shortName: '4',
    section: 'upper',
    description: 'Sum of all dice showing 4',
    example: '4, 4, 2, 3, 6 = 8'
  },
  fives: {
    id: 'fives',
    name: 'Fives',
    shortName: '5',
    section: 'upper',
    description: 'Sum of all dice showing 5',
    example: '5, 5, 1, 2, 6 = 10'
  },
  sixes: {
    id: 'sixes',
    name: 'Sixes',
    shortName: '6',
    section: 'upper',
    description: 'Sum of all dice showing 6',
    example: '6, 6, 6, 2, 4 = 18'
  },
  threeOfAKind: {
    id: 'threeOfAKind',
    name: '3 of a Kind',
    shortName: '3X',
    section: 'lower',
    description: 'At least 3 matching dice. Scores sum of all 5 dice',
    example: '3, 3, 3, 5, 6 = 20'
  },
  fourOfAKind: {
    id: 'fourOfAKind',
    name: '4 of a Kind',
    shortName: '4X',
    section: 'lower',
    description: 'At least 4 matching dice. Scores sum of all 5 dice',
    example: '4, 4, 4, 4, 2 = 18'
  },
  fullHouse: {
    id: 'fullHouse',
    name: 'Full House',
    shortName: 'FULL',
    section: 'lower',
    description: '3 of one value and 2 of another. Scores fixed 25 points',
    example: 'Scores fixed 25 points'
  },
  smallStraight: {
    id: 'smallStraight',
    name: 'Small Straight',
    shortName: 'SMALL',
    section: 'lower',
    description: 'At least 4 consecutive dice (1-2-3-4, 2-3-4-5, 3-4-5-6)',
    example: 'Scores fixed 30 points'
  },
  largeStraight: {
    id: 'largeStraight',
    name: 'Large Straight',
    shortName: 'LARGE',
    section: 'lower',
    description: '5 consecutive dice (1-2-3-4-5 or 2-3-4-5-6)',
    example: 'Scores fixed 40 points'
  },
  yatzy: {
    id: 'yatzy',
    name: 'Yatzy',
    shortName: 'YATZY',
    section: 'lower',
    description: 'All 5 dice matching identically',
    example: 'Scores fixed 50 points'
  },
  chance: {
    id: 'chance',
    name: 'Chance',
    shortName: 'CHANCE',
    section: 'lower',
    description: 'Any combination. Scores sum of all 5 dice',
    example: '6, 5, 3, 2, 4 = 20'
  }
};

export type PlayerType = 'player' | 'bot';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'quick' | 'practice' | 'daily';

export type GamePhase =
  | 'BOOT'
  | 'LOADING'
  | 'MENU'
  | 'PLAYER_READY_TO_ROLL'
  | 'PLAYER_ROLLING'
  | 'PLAYER_DECIDING'
  | 'BOT_WAITING'
  | 'BOT_ROLLING'
  | 'BOT_DECIDING'
  | 'ROUND_TRANSITION'
  | 'GAME_OVER'
  | 'PAUSED';

export interface ScorecardState {
  scores: Partial<Record<ScoreCategory, number>>;
  upperSubtotal: number;
  bonusAchieved: boolean;
  bonusScore: number;
  upperTotal: number;
  lowerTotal: number;
  grandTotal: number;
}

export interface PlayerState {
  id: PlayerType;
  name: string;
  scorecard: ScorecardState;
}

export interface DieState {
  id: number;
  value: DieValue;
  held: boolean;
}

export interface GameRulesConfig {
  upperBonusThreshold: number; // default 63
  upperBonusPoints: number;   // default 35
  fullHousePoints: number;    // default 25
  smallStraightPoints: number;// default 30
  largeStraightPoints: number;// default 40
  yatzyPoints: number;        // default 50
  yatzyCountsAsFullHouse: boolean; // default false
  maxRollsPerTurn: number;    // default 3
  totalRounds: number;        // default 13
}

export const DEFAULT_RULES: GameRulesConfig = {
  upperBonusThreshold: 63,
  upperBonusPoints: 35,
  fullHousePoints: 25,
  smallStraightPoints: 30,
  largeStraightPoints: 40,
  yatzyPoints: 50,
  yatzyCountsAsFullHouse: false,
  maxRollsPerTurn: 3,
  totalRounds: 13
};

export type DiceSkin = 'classic' | 'ruby' | 'cyber' | 'gold' | 'ocean';
export type BoardTheme = 'sunset' | 'night' | 'emerald';

export interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number;   // 0.0 to 1.0
  musicVolume: number; // 0.0 to 1.0
  fastAnimation: boolean;
  reducedMotion: boolean;
  showBestChoice: boolean;
  selectedDiceSkin: DiceSkin;
  selectedBoardTheme: BoardTheme;
  tutorialCompleted: boolean;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  highestScore: number;
  lowestScore: number;
  totalScore: number;
  yatzyCount: number;
  bonusCount: number;
  currentWinStreak: number;
  bestWinStreak: number;
  byDifficulty: Record<Difficulty, {
    games: number;
    wins: number;
    losses: number;
    draws: number;
    highestScore: number;
  }>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}
