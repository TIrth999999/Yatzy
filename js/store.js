/**
 * Typing Fighter - In-Game Cyber Store & Economy Manager
 * Handles persistent bank credits, balanced upgrades (damage, health, streak),
 * hero skins, and UI modal rendering.
 */
class StoreManager {
  constructor() {
    this.STORAGE_KEY = 'typing_fighter_store_v1';

    this.data = {
      credits: 0,
      activeSkin: 'classic',
      unlockedSkins: ['classic'],
      upgrades: {
        damage: 0, // Level 0-5 (+3% dmg per Lv, kept strictly fair & hard to acquire)
        health: 0, // Level 0-5 (+10 HP per Lv)
        streak: 0  // Level 0-3 (+5 streak heal per Lv)
      }
    };

    this.catalog = {
      upgrades: {
        damage: {
          id: 'damage',
          name: 'Blaster Overclock',
          badge: 'DAMAGE',
          description: '+3% Bullet Dmg per Lv (Fair & competitive balance)',
          maxLevel: 5,
          costs: [5000, 12000, 25000, 50000, 100000],
          bonusPerLevel: 0.03
        },
        health: {
          id: 'health',
          name: 'Nanite Body Armor',
          badge: 'MAX HP',
          description: '+10 Max HP per Lv',
          maxLevel: 5,
          costs: [3000, 8000, 18000, 35000, 75000],
          bonusPerLevel: 10
        },
        streak: {
          id: 'streak',
          name: 'Adrenaline Surge',
          badge: 'RECOVERY',
          description: '+5 HP restored on 3x kill streaks',
          maxLevel: 3,
          costs: [6000, 15000, 40000],
          bonusPerLevel: 5
        }
      },
      skins: [
        {
          id: 'classic',
          name: 'Street Classic',
          badge: 'DEFAULT',
          tagline: 'VARSITY BOMBER',
          cost: 0,
          description: 'Red varsity bomber jacket, electric cyan blaster, gold pendant chain.',
          bulletColor: '#FFD166',
          themeColor: '#FF007F'
        },
        {
          id: 'shadow',
          name: 'Shadow Syndicate',
          badge: 'CYBER NINJA',
          tagline: 'STEALTH OPERATIVE',
          cost: 10000,
          description: 'Midnight stealth armor with glowing neon visor & jade plasma laser.',
          bulletColor: '#00F5D4',
          themeColor: '#00F5D4'
        },
        {
          id: 'neon',
          name: 'Neon Overdrive',
          badge: 'CYBERPUNK',
          tagline: 'HIGH-TECH RONIN',
          cost: 25000,
          description: 'Ultraviolet chrome vest with dual purple-plasma blasters.',
          bulletColor: '#9D4EDD',
          themeColor: '#9D4EDD'
        },
        {
          id: 'gold',
          name: 'Arcade Legend',
          badge: 'MYTHIC',
          tagline: 'GOLDEN CHAMPION',
          cost: 60000,
          description: 'Gilded 24K championship jacket with radiant solar beam.',
          bulletColor: '#FFEAA7',
          themeColor: '#FFEAA7'
        }
      ]
    };

    this.activeTab = 'upgrades'; // 'upgrades' or 'skins'
    this.load();
  }

  load() {
    try {
      let raw = null;
      if (window.crazyGames && typeof window.crazyGames.getData === 'function') {
        raw = window.crazyGames.getData(this.STORAGE_KEY);
      }
      if (!raw) {
        raw = localStorage.getItem(this.STORAGE_KEY);
      }
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (parsed && typeof parsed.credits === 'number') {
          this.data.credits = Math.max(0, parsed.credits);
          this.data.activeSkin = parsed.activeSkin || 'classic';
          this.data.unlockedSkins = Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins : ['classic'];
          this.data.upgrades = Object.assign(this.data.upgrades, parsed.upgrades || {});
        }
      }
    } catch (e) {
      console.warn('Could not read store data', e);
    }
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      if (window.crazyGames && typeof window.crazyGames.saveData === 'function') {
        window.crazyGames.saveData(this.STORAGE_KEY, this.data);
      }
    } catch (e) {
      console.warn('Could not save store data', e);
    }
    this.updateGlobalDisplays();
  }

  addCredits(amount) {
    if (amount > 0) {
      this.data.credits += Math.floor(amount);
      this.save();
    }
    return this.data.credits;
  }

  getCredits() {
    return this.data.credits;
  }

  getDamageMultiplier() {
    const lv = this.data.upgrades.damage || 0;
    return 1 + (lv * this.catalog.upgrades.damage.bonusPerLevel);
  }

  getMaxHpBonus() {
    const lv = this.data.upgrades.health || 0;
    return lv * this.catalog.upgrades.health.bonusPerLevel;
  }

  getStreakHealBonus() {
    const lv = this.data.upgrades.streak || 0;
    return lv * this.catalog.upgrades.streak.bonusPerLevel;
  }

  getActiveSkinData() {
    const skinId = this.data.activeSkin || 'classic';
    return this.catalog.skins.find(s => s.id === skinId) || this.catalog.skins[0];
  }

  buyUpgrade(id) {
    const item = this.catalog.upgrades[id];
    if (!item) return false;
    const currentLv = this.data.upgrades[id] || 0;
    if (currentLv >= item.maxLevel) return false;

    const cost = item.costs[currentLv];
    if (this.data.credits < cost) {
      if (window.audioManager) window.audioManager.playDenied();
      return false;
    }

    this.data.credits -= cost;
    this.data.upgrades[id] = currentLv + 1;
    this.save();
    if (window.audioManager) window.audioManager.playPurchase();
    this.renderStoreModal();
    return true;
  }

  buySkin(id) {
    const skin = this.catalog.skins.find(s => s.id === id);
    if (!skin) return false;

    if (this.data.unlockedSkins.includes(id)) {
      this.equipSkin(id);
      return true;
    }

    if (this.data.credits < skin.cost) {
      if (window.audioManager) window.audioManager.playDenied();
      return false;
    }

    this.data.credits -= skin.cost;
    this.data.unlockedSkins.push(id);
    this.data.activeSkin = id;
    this.save();
    if (window.audioManager) window.audioManager.playPurchase();
    this.renderStoreModal();
    return true;
  }

  equipSkin(id) {
    if (this.data.unlockedSkins.includes(id)) {
      this.data.activeSkin = id;
      this.save();
      if (window.audioManager) window.audioManager.playEquip();
      this.renderStoreModal();
      return true;
    }
    return false;
  }

  updateGlobalDisplays() {
    const menuEl = document.getElementById('menu-credits-val');
    if (menuEl) {
      menuEl.textContent = this.data.credits.toLocaleString();
    }
    const storeEl = document.getElementById('store-wallet-credits');
    if (storeEl) {
      storeEl.textContent = this.data.credits.toLocaleString();
    }
  }

  initUI() {
    this.updateGlobalDisplays();

    const storeModal = document.getElementById('store-modal');
    const btnStore = document.getElementById('btn-store');
    const btnCloseStore = document.getElementById('btn-store-close');

    if (btnStore) {
      btnStore.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playButtonClick();
        this.openStore();
      });
    }

    if (btnCloseStore && storeModal) {
      btnCloseStore.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playButtonClick();
        storeModal.classList.add('hidden');
      });
    }

    const btnWatchAd = document.getElementById('btn-watch-ad-credits');
    if (btnWatchAd) {
      btnWatchAd.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playButtonClick();
        if (window.crazyGames && typeof window.crazyGames.requestRewardedAd === 'function') {
          window.crazyGames.requestRewardedAd(() => {
            this.addCredits(2500);
            if (window.audioManager) window.audioManager.playPurchase();
            this.renderStoreModal();
          }, (err) => {
            console.log('[CrazyGames] Rewarded ad not completed:', err);
          });
        } else {
          this.addCredits(2500);
          if (window.audioManager) window.audioManager.playPurchase();
          this.renderStoreModal();
        }
      });
    }

    const tabUpgrades = document.getElementById('store-tab-upgrades');
    const tabSkins = document.getElementById('store-tab-skins');

    if (tabUpgrades && tabSkins) {
      tabUpgrades.addEventListener('click', () => {
        this.activeTab = 'upgrades';
        tabUpgrades.classList.add('active');
        tabSkins.classList.remove('active');
        if (window.audioManager) window.audioManager.playButtonClick();
        this.renderStoreModal();
      });

      tabSkins.addEventListener('click', () => {
        this.activeTab = 'skins';
        tabSkins.classList.add('active');
        tabUpgrades.classList.remove('active');
        if (window.audioManager) window.audioManager.playButtonClick();
        this.renderStoreModal();
      });
    }
  }

  openStore() {
    const storeModal = document.getElementById('store-modal');
    if (!storeModal) return;
    this.updateGlobalDisplays();
    this.renderStoreModal();
    storeModal.classList.remove('hidden');
  }

  renderStoreModal() {
    const contentEl = document.getElementById('store-items-container');
    if (!contentEl) return;
    contentEl.innerHTML = '';
    this.updateGlobalDisplays();

    if (this.activeTab === 'upgrades') {
      this.renderUpgradesTab(contentEl);
    } else {
      this.renderSkinsTab(contentEl);
    }
  }

  renderUpgradesTab(container) {
    const upgradeKeys = ['damage', 'health', 'streak'];

    upgradeKeys.forEach(key => {
      const item = this.catalog.upgrades[key];
      const currentLv = this.data.upgrades[key] || 0;
      const isMax = currentLv >= item.maxLevel;
      const nextCost = isMax ? null : item.costs[currentLv];
      const canAfford = !isMax && this.data.credits >= nextCost;

      // Build level meter [■■□□□]
      let meterHtml = '';
      for (let i = 0; i < item.maxLevel; i++) {
        meterHtml += `<span class="level-pip ${i < currentLv ? 'filled' : ''}"></span>`;
      }

      const card = document.createElement('div');
      card.className = 'store-card';
      card.innerHTML = `
        <div class="store-card-header">
          <div class="store-card-info">
            <span class="store-item-badge">${item.badge}</span>
            <div class="store-item-title">${item.name}</div>
            <div class="store-item-desc">${item.description}</div>
          </div>
          <div class="store-level-meter">
            <span class="level-text">LV.${currentLv}/${item.maxLevel}</span>
            <div class="pips-container">${meterHtml}</div>
          </div>
        </div>
        <div class="store-card-actions">
          ${isMax 
            ? `<button class="retro-btn secondary maxed" disabled>★ MAX LEVEL</button>` 
            : `<button class="retro-btn ${canAfford ? 'primary' : 'disabled'}" data-upgrade="${item.id}">
                 UPGRADE: <svg class="coin-icon" viewBox="0 0 16 16" width="12" height="12"><circle cx="8" cy="8" r="7" fill="#FFD166" stroke="#B8860B" stroke-width="1.5"/><text x="8" y="11" font-size="8" font-family="sans-serif" font-weight="bold" fill="#784C00" text-anchor="middle">C</text></svg>${nextCost.toLocaleString()}
               </button>`
          }
        </div>
      `;

      const btn = card.querySelector('button[data-upgrade]');
      if (btn) {
        btn.addEventListener('click', () => {
          this.buyUpgrade(item.id);
        });
      }

      container.appendChild(card);
    });
  }

  renderSkinsTab(container) {
    this.catalog.skins.forEach(skin => {
      const isUnlocked = this.data.unlockedSkins.includes(skin.id);
      const isEquipped = this.data.activeSkin === skin.id;
      const canAfford = !isUnlocked && this.data.credits >= skin.cost;

      const card = document.createElement('div');
      card.className = `store-card skin-card ${isEquipped ? 'equipped-card' : ''}`;
      card.innerHTML = `
        <div class="store-card-header">
          <div class="skin-color-orb" style="background: ${skin.themeColor}; box-shadow: 0 0 12px ${skin.themeColor};"></div>
          <div class="store-card-info">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="store-item-badge" style="border-color: ${skin.themeColor}; color: ${skin.themeColor};">${skin.badge}</span>
              ${isEquipped ? `<span class="equipped-tag">EQUIPPED</span>` : ''}
            </div>
            <div class="store-item-title">${skin.name}</div>
            <div class="store-item-desc">${skin.description}</div>
          </div>
        </div>
        <div class="store-card-actions">
          ${isEquipped 
            ? `<button class="retro-btn secondary active-equip" disabled>EQUIPPED</button>` 
            : isUnlocked
              ? `<button class="retro-btn secondary" data-equip-skin="${skin.id}">EQUIP</button>` 
              : `<button class="retro-btn ${canAfford ? 'primary' : 'disabled'}" data-buy-skin="${skin.id}">
                   UNLOCK: <svg class="coin-icon" viewBox="0 0 16 16" width="12" height="12"><circle cx="8" cy="8" r="7" fill="#FFD166" stroke="#B8860B" stroke-width="1.5"/><text x="8" y="11" font-size="8" font-family="sans-serif" font-weight="bold" fill="#784C00" text-anchor="middle">C</text></svg>${skin.cost.toLocaleString()}
                 </button>`
          }
        </div>
      `;

      const btnEquip = card.querySelector('button[data-equip-skin]');
      if (btnEquip) {
        btnEquip.addEventListener('click', () => {
          this.equipSkin(skin.id);
        });
      }

      const btnBuy = card.querySelector('button[data-buy-skin]');
      if (btnBuy) {
        btnBuy.addEventListener('click', () => {
          this.buySkin(skin.id);
        });
      }

      container.appendChild(card);
    });
  }
}

window.storeManager = new StoreManager();
