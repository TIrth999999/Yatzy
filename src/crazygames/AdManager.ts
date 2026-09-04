import { CrazyGamesManager } from './CrazyGamesManager';
import { EventBus } from '../core/EventBus';

export class AdManager {
  private static instance: AdManager;
  private cg: CrazyGamesManager = CrazyGamesManager.getInstance();
  private bus: EventBus = EventBus.getInstance();
  private lastAdTime: number = 0;
  private minAdIntervalMs: number = 60000; // 60s minimum interval to avoid spam

  public static getInstance(): AdManager {
    if (!AdManager.instance) {
      AdManager.instance = new AdManager();
    }
    return AdManager.instance;
  }

  /**
   * Request a midgame interstitial ad at natural transition points (e.g. between matches)
   */
  public async requestMidgameAd(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastAdTime < this.minAdIntervalMs) {
      // Cooldown not elapsed, skip ad smoothly
      return false;
    }

    if (!this.cg.hasSDK()) {
      return false;
    }

    const sdk = this.cg.getRawSDK();
    if (!sdk?.ad?.requestAd) {
      return false;
    }

    return new Promise<boolean>(resolve => {
      let resolved = false;

      const finish = (success: boolean) => {
        if (!resolved) {
          resolved = true;
          this.lastAdTime = Date.now();
          this.bus.emit('AD_FINISHED');
          resolve(success);
        }
      };

      const callbacks = {
        adStarted: () => {
          this.bus.emit('AD_STARTED');
        },
        adFinished: () => {
          finish(true);
        },
        adError: (error: any) => {
          console.warn('[CrazyGames] Midgame ad error:', error);
          finish(false);
        }
      };

      try {
        sdk.ad.requestAd('midgame', callbacks);
      } catch (e) {
        console.warn('[CrazyGames] Ad request exception:', e);
        finish(false);
      }

      // Safety timeout: if ad hangs for 10 seconds, never stall the game
      setTimeout(() => finish(false), 10000);
    });
  }

  /**
   * Request an optional rewarded ad (e.g. unlock cosmetic dice skin)
   */
  public async requestRewardedAd(): Promise<boolean> {
    if (!this.cg.hasSDK()) {
      // If SDK not available (e.g. localhost testing), grant reward for testing convenience
      console.log('[CrazyGames] Rewarded ad simulated in dev environment');
      return true;
    }

    const sdk = this.cg.getRawSDK();
    if (!sdk?.ad?.requestAd) {
      return true;
    }

    return new Promise<boolean>(resolve => {
      let resolved = false;

      const finish = (granted: boolean) => {
        if (!resolved) {
          resolved = true;
          this.bus.emit('AD_FINISHED');
          resolve(granted);
        }
      };

      const callbacks = {
        adStarted: () => {
          this.bus.emit('AD_STARTED');
        },
        adFinished: () => {
          finish(true);
        },
        adError: (error: any) => {
          console.warn('[CrazyGames] Rewarded ad error:', error);
          finish(false);
        }
      };

      try {
        sdk.ad.requestAd('rewarded', callbacks);
      } catch (e) {
        console.warn('[CrazyGames] Rewarded ad exception:', e);
        finish(false);
      }

      // 15-second safety timeout
      setTimeout(() => finish(false), 15000);
    });
  }
}
