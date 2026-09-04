import './styles/main.css';
import './styles/dice.css';
import './styles/desktop.css';
import './styles/mobile.css';

import { GameEngine } from './core/GameEngine';
import { EventBus } from './core/EventBus';
import { AudioManager } from './audio/AudioManager';
import { StatsManager } from './persistence/StatsManager';
import { AchievementManager } from './persistence/AchievementManager';
import { SettingsManager } from './settings/SettingsManager';
import { CrazyGamesManager } from './crazygames/CrazyGamesManager';
import { AdManager } from './crazygames/AdManager';
import { UIManager } from './ui/UIManager';

async function bootstrap() {
  console.log('[Yatzy Clash] Initializing Game Engine...');

  const cgManager = CrazyGamesManager.getInstance();
  await cgManager.init();
  cgManager.loadingStart();

  const bus = EventBus.getInstance();
  const engine = new GameEngine();
  const audio = AudioManager.getInstance();
  const stats = StatsManager.getInstance();
  const achievements = AchievementManager.getInstance();
  const settings = SettingsManager.getInstance();
  const adManager = AdManager.getInstance();

  // Apply initial settings
  const s = settings.getSettings();
  if (s.fastAnimation) document.body.classList.add('fast-animation');
  if (s.reducedMotion) document.body.classList.add('reduced-motion');
  if (s.selectedDiceSkin !== 'classic') document.body.classList.add(`skin-${s.selectedDiceSkin}`);

  // User gesture audio context unlocker
  const unlockAudio = () => {
    audio.unlockAudio();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  // Wiring Game Lifecycle to Stats, Achievements & CrazyGames
  bus.on('MATCH_STARTED', () => {
    cgManager.gameplayStart();
  });

  bus.on('MATCH_PAUSED', () => {
    cgManager.gameplayStop();
  });

  bus.on('MATCH_RESUMED', () => {
    cgManager.gameplayStart();
  });

  bus.on('START_MATCH', (options: { mode: any; difficulty: any }) => {
    engine.startMatch(options.mode, options.difficulty);
  });

  bus.on('MATCH_COMPLETED', async (data: any) => {
    cgManager.gameplayStop();

    // 1. Record stats
    stats.recordMatch(data.winner, data.playerScore, data.difficulty);

    // 2. Achievements checks
    achievements.unlock('first_roll');

    if (data.winner === 'player') {
      achievements.unlock('first_win');
      if (data.difficulty === 'hard') {
        achievements.unlock('hard_win');
      }
      const st = stats.getStats();
      if (st.currentWinStreak >= 3) achievements.unlock('win_streak_3');
      if (st.currentWinStreak >= 5) achievements.unlock('win_streak_5');
    }

    if (data.playerScore >= 250) {
      achievements.unlock('high_roller');
    }

    const pCard = data.playerScorecard;
    if (pCard.scores.smallStraight !== undefined && pCard.scores.smallStraight > 0 &&
        pCard.scores.largeStraight !== undefined && pCard.scores.largeStraight > 0) {
      achievements.unlock('straight_shooter');
    }

    if (pCard.scores.fullHouse !== undefined && pCard.scores.fullHouse >= 25) {
      achievements.unlock('full_house_king');
    }

    // 3. Graceful interstitial ad between completed games
    await adManager.requestMidgameAd();
  });

  bus.on('YATZY_SCORED', (data: any) => {
    if (data.player === 'player') {
      stats.recordYatzy();
      achievements.unlock('yatzy');
    }
  });

  bus.on('BONUS_AWARDED', (data: any) => {
    if (data.player === 'player') {
      stats.recordBonus();
      achievements.unlock('bonus_master');
    }
  });

  bus.on('PLATFORM_MUTE_CHANGED', (muted: boolean) => {
    audio.setPlatformMute(muted);
  });

  // Mount UI
  const root = document.getElementById('app');
  if (root) {
    new UIManager(root, engine, audio);
  }

  // Signal loading finished
  cgManager.loadingStop();
  console.log('[Yatzy Clash] Game successfully booted and ready!');
}

window.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch(err => {
    console.error('[Yatzy Clash] Bootstrapping failure:', err);
  });
});
