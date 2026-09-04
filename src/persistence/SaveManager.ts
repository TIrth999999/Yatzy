export class SaveManager {
  private static instance: SaveManager;
  private prefix: string = 'yatzy_clash_';

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  public save<T>(key: string, data: T): boolean {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.prefix + key, serialized);

      // Also sync to CrazyGames data module if available
      if (typeof window !== 'undefined' && (window as any).CrazyGames?.SDK?.data?.setItem) {
        try {
          (window as any).CrazyGames.SDK.data.setItem(this.prefix + key, serialized);
        } catch {
          // Non-blocking
        }
      }
      return true;
    } catch (e) {
      console.warn(`Failed to save key "${key}":`, e);
      return false;
    }
  }

  public load<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
    } catch (e) {
      console.warn(`Failed to load key "${key}":`, e);
    }
    return fallback;
  }

  public remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (e) {
      console.warn(`Failed to remove key "${key}":`, e);
    }
  }

  public clearAll(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
  }
}
