/**
 * Typing Fighter - CrazyGames SDK v2/v3 Wrapper
 * Handles loadingStart, loadingStop, gameplayStart, gameplayStop, happytime, mute synchronization, and data saving.
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
        this.loadingStop();

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

  loadingStart() {
    try {
      if (this.isInitialized && this.cgsdk && this.cgsdk.game && typeof this.cgsdk.game.loadingStart === 'function') {
        this.cgsdk.game.loadingStart();
      }
    } catch (e) {}
  }

  loadingStop() {
    try {
      if (this.isInitialized && this.cgsdk && this.cgsdk.game && typeof this.cgsdk.game.loadingStop === 'function') {
        this.cgsdk.game.loadingStop();
      }
    } catch (e) {}
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
    this.saveData(CONFIG.STORAGE_KEYS.HIGH_SCORE, score.toString());
  }

  getHighScore() {
    const val = this.getData(CONFIG.STORAGE_KEYS.HIGH_SCORE);
    return val ? parseInt(val, 10) : 0;
  }

  // Unified persistent storage (CrazyGames Cloud Data API + localStorage fallback)
  saveData(key, value) {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    try {
      localStorage.setItem(key, str);
    } catch (e) {}

    try {
      if (this.isInitialized && this.cgsdk && this.cgsdk.data && typeof this.cgsdk.data.setItem === 'function') {
        this.cgsdk.data.setItem(key, str);
      }
    } catch (e) {}
  }

  getData(key) {
    let val = null;
    try {
      val = localStorage.getItem(key);
    } catch (e) {}

    try {
      if (this.isInitialized && this.cgsdk && this.cgsdk.data && typeof this.cgsdk.data.getItem === 'function') {
        const cloudVal = this.cgsdk.data.getItem(key);
        if (cloudVal !== null && cloudVal !== undefined) {
          val = cloudVal;
        }
      }
    } catch (e) {}

    return val;
  }

  // Midgame Video Ad (runs on Game Over)
  requestMidgameAd(onComplete) {
    if (!this.isInitialized || !this.cgsdk || !this.cgsdk.ad) {
      if (typeof onComplete === 'function') onComplete();
      return;
    }

    try {
      this.cgsdk.ad.requestAd('midgame', {
        adStarted: () => {
          if (window.audioManager) window.audioManager.stopBGM();
        },
        adFinished: () => {
          if (window.audioManager && window.audioManager.bgmEnabled) window.audioManager.startBGM();
          if (typeof onComplete === 'function') onComplete();
        },
        adError: (error) => {
          console.warn('[CrazyGames] Midgame ad error / adblock:', error);
          if (window.audioManager && window.audioManager.bgmEnabled) window.audioManager.startBGM();
          if (typeof onComplete === 'function') onComplete();
        }
      });
    } catch (e) {
      if (typeof onComplete === 'function') onComplete();
    }
  }

  // Rewarded Video Ad (runs in Store for free credits!)
  requestRewardedAd(onSuccess, onFail) {
    if (!this.isInitialized || !this.cgsdk || !this.cgsdk.ad) {
      // If running locally or offline, simulate reward for testing!
      console.log('[CrazyGames] Standalone mode: simulated rewarded ad grant');
      if (typeof onSuccess === 'function') onSuccess();
      return;
    }

    try {
      this.cgsdk.ad.requestAd('rewarded', {
        adStarted: () => {
          if (window.audioManager) window.audioManager.stopBGM();
        },
        adFinished: () => {
          if (window.audioManager && window.audioManager.bgmEnabled) window.audioManager.startBGM();
          if (typeof onSuccess === 'function') onSuccess();
        },
        adError: (error) => {
          console.warn('[CrazyGames] Rewarded ad error:', error);
          if (window.audioManager && window.audioManager.bgmEnabled) window.audioManager.startBGM();
          if (typeof onFail === 'function') onFail(error);
        }
      });
    } catch (e) {
      if (typeof onFail === 'function') onFail(e);
    }
  }
}

window.crazyGames = new CrazyGamesIntegration();
