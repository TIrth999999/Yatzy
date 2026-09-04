/**
 * Type War - CrazyGames SDK v2/v3 Wrapper
 * Handles gameplayStart, gameplayStop, happytime, mute synchronization, and data saving.
 */
class CrazyGamesIntegration {
  constructor() {
    this.cgsdk = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    if (window.CrazyGames && window.CrazyGames.SDK) {
      try {
        this.cgsdk = window.CrazyGames.SDK;
        await this.cgsdk.init();
        this.isInitialized = true;
        console.log('[CrazyGames] SDK initialized successfully');

        // Listen for mute / ad events
        if (this.cgsdk.ad) {
          this.cgsdk.ad.addEventListener('adStarted', () => {
            if (window.audioManager) {
              window.audioManager.stopBGM();
            }
          });
          this.cgsdk.ad.addEventListener('adFinished', () => {
            if (window.audioManager && window.audioManager.bgmEnabled) {
              window.audioManager.startBGM();
            }
          });
        }
      } catch (err) {
        console.warn('[CrazyGames] SDK init warning (normal in local environment):', err);
      }
    } else {
      console.log('[CrazyGames] Running in standalone/offline mode');
    }
  }

  gameplayStart() {
    try {
      if (this.isInitialized && this.cgsdk && this.cgsdk.game) {
        this.cgsdk.game.gameplayStart();
      }
    } catch (e) {}
  }

  gameplayStop() {
    try {
      if (this.isInitialized && this.cgsdk && this.cgsdk.game) {
        this.cgsdk.game.gameplayStop();
      }
    } catch (e) {}
  }

  happytime() {
    try {
      if (this.isInitialized && this.cgsdk && this.cgsdk.game) {
        this.cgsdk.game.happytime();
      }
    } catch (e) {}
  }

  saveHighScore(score) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.HIGH_SCORE, score.toString());
      if (this.isInitialized && this.cgsdk && this.cgsdk.data) {
        this.cgsdk.data.setItem(CONFIG.STORAGE_KEYS.HIGH_SCORE, score.toString());
      }
    } catch (e) {}
  }

  getHighScore() {
    try {
      const val = localStorage.getItem(CONFIG.STORAGE_KEYS.HIGH_SCORE);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  }
}

window.crazyGames = new CrazyGamesIntegration();
