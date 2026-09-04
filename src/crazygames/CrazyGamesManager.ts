import { EventBus } from '../core/EventBus';

export class CrazyGamesManager {
  private static instance: CrazyGamesManager;
  private isAvailable: boolean = false;
  private sdk: any = null;
  private bus: EventBus = EventBus.getInstance();

  public static getInstance(): CrazyGamesManager {
    if (!CrazyGamesManager.instance) {
      CrazyGamesManager.instance = new CrazyGamesManager();
    }
    return CrazyGamesManager.instance;
  }

  public async init(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && (window as any).CrazyGames?.SDK) {
        this.sdk = (window as any).CrazyGames.SDK;
        if (typeof this.sdk.init === 'function') {
          await this.sdk.init();
        }
        this.isAvailable = true;
        console.log('[CrazyGames] SDK successfully initialized');

        // Setup mute listener if supported
        if (this.sdk.game?.onMute) {
          this.sdk.game.onMute((muted: boolean) => {
            this.bus.emit('PLATFORM_MUTE_CHANGED', muted);
          });
        }
        return true;
      }
    } catch (e) {
      console.warn('[CrazyGames] SDK not available or running outside portal:', e);
    }
    this.isAvailable = false;
    return false;
  }

  public loadingStart(): void {
    if (this.isAvailable && this.sdk?.game?.loadingStart) {
      try {
        this.sdk.game.loadingStart();
      } catch (e) {
        console.warn('[CrazyGames] loadingStart error:', e);
      }
    }
  }

  public loadingStop(): void {
    if (this.isAvailable && this.sdk?.game?.loadingStop) {
      try {
        this.sdk.game.loadingStop();
      } catch (e) {
        console.warn('[CrazyGames] loadingStop error:', e);
      }
    }
  }

  public gameplayStart(): void {
    if (this.isAvailable && this.sdk?.game?.gameplayStart) {
      try {
        this.sdk.game.gameplayStart();
      } catch (e) {
        console.warn('[CrazyGames] gameplayStart error:', e);
      }
    }
  }

  public gameplayStop(): void {
    if (this.isAvailable && this.sdk?.game?.gameplayStop) {
      try {
        this.sdk.game.gameplayStop();
      } catch (e) {
        console.warn('[CrazyGames] gameplayStop error:', e);
      }
    }
  }

  public hasSDK(): boolean {
    return this.isAvailable;
  }

  public getRawSDK(): any {
    return this.sdk;
  }
}
