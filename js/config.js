/**
 * Type War / Typing Fighter - Configuration and Constants
 */
const CONFIG = {
  // Color Palette (Purple-shaded street fight & retro arcade theme)
  COLORS: {
    BG: '#101018',
    DEEP_BG: '#181827',
    PANEL: '#24243A',
    PANEL_BORDER: '#4A3F75',
    PANEL_BORDER_LIGHT: '#6C5CE7',
    PRIMARY: '#F04F4F',
    SECONDARY: '#4FD1C5',
    ACCENT_PURPLE: '#9D4EDD',
    NEON_MAGENTA: '#FF007F',
    HIGHLIGHT: '#FFD166',
    SUCCESS: '#62D26F',
    TEXT: '#F5F0D8',
    MUTED: '#8C8C9A',
    DANGER: '#E84855',
    HUD_BG: '#151524',
    HUD_BORDER: '#342D54',
  },

  // Player Settings
  PLAYER: {
    MAX_HP: 100,
    MISTAKE_DAMAGE: 5,
    STREAK_HEAL_EVERY: 3, // Heal player every 3 enemy defeat streak
    STREAK_HEAL_AMOUNT: 15,
  },

  // Enemy Settings & Attack Behavior
  ENEMY: {
    BASE_HP: 60,
    HP_PER_LEVEL: 20,
    MAX_NORMAL_HP: 260,
    BOSS_HP_MULTIPLIER: 2.2, // Boss has much more HP
    BOSS_EVERY_N: 10,        // Boss every 10th enemy

    // Enemy Attack Timers (Scaling with level)
    BASE_ATTACK_INTERVAL: 4.2, // Seconds before enemy attacks at lvl 1
    MIN_ATTACK_INTERVAL: 2.0,  // Fastest enemy attack at high levels
    ATTACK_WINDUP_SEC: 0.6,    // Visual attack preparation before hit
    BASE_DAMAGE: 6,            // Enemy damage at level 1
    MAX_DAMAGE: 16,            // Enemy damage at high level
  },

  // Scoring Settings
  SCORE: {
    BASE_PER_ENEMY: 120,
    PERFECT_BONUS: 50,
    STREAK_BONUS_FACTOR: 20,
    WPM_FACTOR: 1.5,
  },

  // 7 Unique City Stages
  STAGES: [
    { id: 0, name: 'NEON ALLEY', color: '#9D4EDD' },
    { id: 1, name: 'CYBER DOWNTOWN', color: '#4FD1C5' },
    { id: 2, name: 'UNDERGROUND SUBWAY', color: '#FF70A6' },
    { id: 3, name: 'ROOFTOP ARENA', color: '#FFD166' },
    { id: 4, name: 'INDUSTRIAL DOCKS', color: '#6C5CE7' },
    { id: 5, name: 'CHINATOWN BAZAAR', color: '#F04F4F' },
    { id: 6, name: 'CYBER HIGHWAY', color: '#00F5D4' }
  ],

  // Game States
  STATES: {
    MENU: 'MENU',
    WALKING: 'WALKING',
    COUNTDOWN: 'COUNTDOWN',
    PLAYER_TYPING: 'PLAYER_TYPING',
    ATTACK: 'ATTACK',
    GAME_OVER: 'GAME_OVER',
    PAUSED: 'PAUSED',
    SETTINGS: 'SETTINGS',
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    HIGH_SCORE: 'type_war_high_score',
    SETTINGS: 'type_war_settings',
  }
};

window.CONFIG = CONFIG;
