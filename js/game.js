/**
 * Type War - Main Game Controller & Gunfight Engine
 * Featuring real-time bullet gunfight, dynamic Player WPM & static Enemy WPM,
 * one-time START countdown, SVG stage parallax, and weapon level-ups.
 */
class Game {
  constructor() {
    this.state = CONFIG.STATES.MENU;
    this.canvas = null;
    this.ctx = null;

    // Entities & Stages
    this.stage = new StageRenderer();
    this.player = new Fighter(true);
    this.enemy = new Fighter(false);

    this.currentStageId = 0;
    this.enemiesDefeated = 0;
    this.killStreak = 0;

    // Gameplay Metrics
    this.playerHp = CONFIG.PLAYER.MAX_HP;
    this.enemyHp = CONFIG.ENEMY.BASE_HP;
    this.enemyMaxHp = CONFIG.ENEMY.BASE_HP;
    this.enemyLevel = 1;
    this.isBossRound = false;

    this.score = 0;
    this.streak = 0;
    this.highScore = 0;

    // WPM Tracking
    this.totalCharsTyped = 0;
    this.totalTypingTimeSec = 0;

    // Enemy Attack System
    this.enemyAttackTimer = 0;
    this.enemyAttackInterval = CONFIG.ENEMY.BASE_ATTACK_INTERVAL;

    // Sentence & Typing Progress
    this.currentSentence = '';
    this.typedIndex = 0;
    this.sentenceMistakes = 0;
    this.sentenceStartTime = 0;

    // Timers
    this.lastFrameTime = 0;
    this.countdownTimer = null;
    this.walkTimer = 0;
    this.rewardBannerTimer = null;

    // UI Cache
    this.ui = {};
  }

  init() {
    this.canvas = document.getElementById('battle-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.cacheUIElements();
    this.bindEvents();

    this.highScore = window.crazyGames.getHighScore();
    this.updateHighScoreDisplay();

    // Hook input
    window.inputManager.init(this.ui.hiddenInput);
    window.inputManager.onCharTyped = (char) => this.handleKeystroke(char);

    // Start loop
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  resizeCanvas() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.virtualWidth = rect.width;
    this.virtualHeight = rect.height;

    if (this.player && this.enemy) {
      this.player.baseX = this.virtualWidth * 0.40;
      this.player.baseY = this.virtualHeight * 0.88;
      this.player.x = this.player.baseX;
      this.player.y = this.player.baseY;

      this.enemy.baseX = this.virtualWidth * 0.60;
      this.enemy.baseY = this.virtualHeight * 0.88;
      if (this.state !== CONFIG.STATES.WALKING) {
        this.enemy.x = this.enemy.baseX;
        this.enemy.y = this.enemy.baseY;
      }
    }
  }

  cacheUIElements() {
    this.ui = {
      menuScreen: document.getElementById('menu-screen'),
      gameplayHud: document.getElementById('gameplay-hud'),
      typingArea: document.getElementById('typing-area'),
      sentenceTiles: document.getElementById('sentence-tiles'),
      countdownOverlay: document.getElementById('countdown-overlay'),
      countdownNum: document.getElementById('countdown-num'),
      gameOverModal: document.getElementById('game-over-modal'),
      pauseModal: document.getElementById('pause-modal'),
      settingsModal: document.getElementById('settings-modal'),
      hiddenInput: document.getElementById('hidden-input'),

      playerHpFill: document.getElementById('player-hp-fill'),
      playerHpText: document.getElementById('player-hp-text'),
      playerWpmText: document.getElementById('player-wpm-text'),
      enemyHpFill: document.getElementById('enemy-hp-fill'),
      enemyLevelText: document.getElementById('enemy-level-text'),
      enemyWpmText: document.getElementById('enemy-wpm-text'),
      stageNameText: document.getElementById('stage-name-text'),
      scoreDisplay: document.getElementById('score-display'),
      streakDisplay: document.getElementById('streak-display'),
      highScoreDisplay: document.getElementById('high-score-display'),
      menuHighScore: document.getElementById('menu-high-score'),

      finalScore: document.getElementById('final-score'),
      bestScoreDisplay: document.getElementById('best-score-display'),
      newHighScoreBanner: document.getElementById('new-highscore-banner'),

      btnPlay: document.getElementById('btn-play'),
      btnSettings: document.getElementById('btn-settings'),
      btnPause: document.getElementById('btn-pause'),
      btnResume: document.getElementById('btn-resume'),
      btnQuit: document.getElementById('btn-quit'),
      btnPlayAgain: document.getElementById('btn-play-again'),
      btnGameOverMenu: document.getElementById('btn-game-over-menu'),
      btnSettingsBack: document.getElementById('btn-settings-back'),

      toggleBgm: document.getElementById('toggle-bgm'),
      toggleSfx: document.getElementById('toggle-sfx'),
      toggleCrt: document.getElementById('toggle-crt'),
      crtOverlay: document.getElementById('crt-overlay'),

      rewardBanner: document.getElementById('reward-banner'),
      rewardTitle: document.getElementById('reward-title'),
      rewardSubtitle: document.getElementById('reward-subtitle'),
    };
  }

  bindEvents() {
    this.ui.btnPlay.addEventListener('click', () => {
      window.audioManager.playButtonClick();
      this.startGame();
    });

    this.ui.btnSettings.addEventListener('click', () => {
      window.audioManager.playButtonClick();
      this.openSettings();
    });

    this.ui.btnPause.addEventListener('click', () => {
      window.audioManager.playButtonClick();
      this.pauseGame();
    });

    this.ui.btnResume.addEventListener('click', () => {
      window.audioManager.playButtonClick();
      this.resumeGame();
    });

    this.ui.btnQuit.addEventListener('click', () => {
      window.audioManager.playButtonClick();
      this.quitToMenu();
    });

    this.ui.btnPlayAgain.addEventListener('click', () => {
      window.audioManager.playButtonClick();
      this.startGame();
    });

    this.ui.btnGameOverMenu.addEventListener('click', () => {
      window.audioManager.playButtonClick();
      this.quitToMenu();
    });

    this.ui.btnSettingsBack.addEventListener('click', () => {
      window.audioManager.playButtonClick();
      this.closeSettings();
    });

    this.ui.toggleBgm.addEventListener('click', () => {
      const next = !window.audioManager.bgmEnabled;
      window.audioManager.setBgmEnabled(next);
      this.updateSettingsUI();
      window.audioManager.playButtonClick();
    });

    this.ui.toggleSfx.addEventListener('click', () => {
      const next = !window.audioManager.sfxEnabled;
      window.audioManager.setSfxEnabled(next);
      this.updateSettingsUI();
      window.audioManager.playButtonClick();
    });

    this.ui.toggleCrt.addEventListener('click', () => {
      const isVisible = this.ui.crtOverlay.classList.contains('crt-active');
      if (isVisible) {
        this.ui.crtOverlay.classList.remove('crt-active');
      } else {
        this.ui.crtOverlay.classList.add('crt-active');
      }
      this.updateSettingsUI();
      window.audioManager.playButtonClick();
    });

    this.ui.typingArea.addEventListener('click', () => {
      if (this.state === CONFIG.STATES.PLAYER_TYPING) {
        window.inputManager.enable();
      }
    });

    this.updateSettingsUI();
  }

  updateSettingsUI() {
    this.ui.toggleBgm.textContent = window.audioManager.bgmEnabled ? 'ON' : 'OFF';
    this.ui.toggleBgm.className = 'retro-toggle ' + (window.audioManager.bgmEnabled ? 'active' : 'inactive');

    this.ui.toggleSfx.textContent = window.audioManager.sfxEnabled ? 'ON' : 'OFF';
    this.ui.toggleSfx.className = 'retro-toggle ' + (window.audioManager.sfxEnabled ? 'active' : 'inactive');

    const crtOn = this.ui.crtOverlay.classList.contains('crt-active');
    this.ui.toggleCrt.textContent = crtOn ? 'ON' : 'OFF';
    this.ui.toggleCrt.className = 'retro-toggle ' + (crtOn ? 'active' : 'inactive');
  }

  updateHighScoreDisplay() {
    this.ui.highScoreDisplay.textContent = this.highScore.toLocaleString();
    this.ui.menuHighScore.textContent = this.highScore.toLocaleString();
  }

  showRewardBanner(title, subtitle, type = 'streak') {
    if (!this.ui.rewardBanner || !this.ui.rewardTitle) return;
    if (this.rewardBannerTimer) {
      clearTimeout(this.rewardBannerTimer);
      this.rewardBannerTimer = null;
    }

    this.ui.rewardTitle.textContent = title;
    this.ui.rewardSubtitle.textContent = subtitle;

    // Reset classes
    this.ui.rewardBanner.className = 'reward-banner ' + ('banner-' + type);
    this.ui.rewardBanner.classList.remove('hidden', 'fade-out');

    // Auto-dismiss after 1.8 seconds
    this.rewardBannerTimer = setTimeout(() => {
      if (!this.ui.rewardBanner) return;
      this.ui.rewardBanner.classList.add('fade-out');
      setTimeout(() => {
        if (!this.ui.rewardBanner) return;
        this.ui.rewardBanner.classList.add('hidden');
        this.ui.rewardBanner.classList.remove('fade-out');
      }, 300);
    }, 1800);
  }

  // --- Start Game & Transitions ---

  startGame() {
    window.audioManager.ensureContext();
    window.audioManager.startBGM();
    window.crazyGames.gameplayStart();

    // Reset battle stats
    this.playerHp = CONFIG.PLAYER.MAX_HP;
    this.enemiesDefeated = 0;
    this.enemyLevel = 1;
    this.currentStageId = 0;
    this.killStreak = 0;
    this.score = 0;
    this.streak = 0;

    // Reset WPM tracking
    this.totalCharsTyped = 0;
    this.totalTypingTimeSec = 0;

    // Reset entities
    this.player.setState('IDLE');
    this.enemy.setState('IDLE');
    this.enemy.enemyLevel = 1;
    window.particleSystem.clear();

    // Hide modals and banners
    if (this.ui.rewardBanner) this.ui.rewardBanner.classList.add('hidden');
    this.ui.menuScreen.classList.add('hidden');
    this.ui.gameOverModal.classList.add('hidden');
    this.ui.pauseModal.classList.add('hidden');
    this.ui.settingsModal.classList.add('hidden');

    this.ui.gameplayHud.classList.remove('hidden');
    this.updateHUD();

    // Show one-time 3-2-1-FIGHT countdown on START button click!
    this.ui.countdownOverlay.classList.remove('hidden');
    let count = 3;
    this.ui.countdownNum.textContent = count;
    window.audioManager.playCountdown(false);

    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        this.ui.countdownNum.textContent = count;
        window.audioManager.playCountdown(false);
      } else if (count === 0) {
        this.ui.countdownNum.textContent = 'FIGHT!';
        window.audioManager.playCountdown(true);
      } else {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this.ui.countdownOverlay.classList.add('hidden');
        // Begin walking to first enemy encounter!
        this.startWalkingToNextEnemy();
      }
    }, 550);
  }

  // Walking transition between enemies
  startWalkingToNextEnemy() {
    this.state = CONFIG.STATES.WALKING;
    // Keep typingArea in layout so canvas doesn't resize or jump!
    this.ui.typingArea.classList.remove('hidden');
    this.ui.sentenceTiles.innerHTML = '<div class="walking-banner"><span class="walking-dot">●</span> ADVANCING TO NEXT ENCOUNTER...</div>';
    window.inputManager.disable();

    // Player enters walking state
    this.player.setState('WALK');

    // Setup next enemy
    const nextEnemyNum = this.enemiesDefeated + 1;
    this.isBossRound = (nextEnemyNum % CONFIG.ENEMY.BOSS_EVERY_N === 0);

    // Shift stage background every 2 enemies
    this.currentStageId = Math.floor(this.enemiesDefeated / 2) % CONFIG.STAGES.length;

    // Calculate enemy health
    const baseHp = CONFIG.ENEMY.BASE_HP + (this.enemyLevel - 1) * CONFIG.ENEMY.HP_PER_LEVEL;
    this.enemyMaxHp = this.isBossRound ? Math.floor(baseHp * CONFIG.ENEMY.BOSS_HP_MULTIPLIER) : Math.min(CONFIG.ENEMY.MAX_NORMAL_HP, baseHp);
    this.enemyHp = this.enemyMaxHp;

    // Setup enemy fighter archetype & weapon upgrade
    this.enemy.isBoss = this.isBossRound;
    this.enemy.enemyType = this.currentStageId;
    this.enemy.enemyLevel = this.enemyLevel;
    this.enemy.setState('WALK');

    // Enemy starts from off-screen right and walks in
    this.enemy.x = this.virtualWidth + 120;
    this.walkTimer = 0;

    this.updateHUD();

    if (this.isBossRound) {
      window.particleSystem.addFloatingText('★ BOSS ENCOUNTER! ★', this.virtualWidth * 0.5, this.virtualHeight * 0.3, CONFIG.COLORS.NEON_MAGENTA, 26);
    }
  }

  // Once characters meet, start typing battle smoothly
  startBattle() {
    this.state = CONFIG.STATES.PLAYER_TYPING;
    this.player.setState('IDLE');
    this.enemy.setState('IDLE');
    this.enemy.x = this.enemy.baseX;

    // Reset enemy attack timer (scales faster with higher levels)
    this.enemyAttackInterval = Math.max(
      CONFIG.ENEMY.MIN_ATTACK_INTERVAL,
      CONFIG.ENEMY.BASE_ATTACK_INTERVAL - (this.enemyLevel - 1) * 0.16
    );
    this.enemyAttackTimer = this.enemyAttackInterval;

    // Get sentence: pure characters for normal, all mixed for boss
    this.currentSentence = window.sentenceManager.getSentence(this.isBossRound);
    this.typedIndex = 0;
    this.sentenceMistakes = 0;
    this.sentenceStartTime = performance.now();

    this.renderSentenceTiles();
    window.inputManager.enable();
  }

  renderSentenceTiles() {
    const container = this.ui.sentenceTiles;
    container.innerHTML = '';

    for (let i = 0; i < this.currentSentence.length; i++) {
      const char = this.currentSentence[i];
      const span = document.createElement('span');
      span.className = 'char-tile';

      if (char === ' ') {
        span.classList.add('space-tile');
        span.innerHTML = '&nbsp;';
      } else {
        span.textContent = char;
      }

      if (i === this.typedIndex) {
        span.classList.add('current');
      } else if (i < this.typedIndex) {
        span.classList.add('completed');
      }

      container.appendChild(span);
    }
  }

  // --- Keystroke & Real-time Bullet Gunfight Logic ---

  handleKeystroke(char) {
    if (this.state !== CONFIG.STATES.PLAYER_TYPING) return;

    const expectedChar = this.currentSentence[this.typedIndex];
    const isMatch = (char === expectedChar) || (char.toLowerCase() === expectedChar.toLowerCase());

    if (isMatch) {
      // 1. Correct character typed!
      this.totalCharsTyped++;

      const tile = this.ui.sentenceTiles.children[this.typedIndex];
      if (tile) {
        tile.classList.remove('current');
        tile.classList.add('completed');
      }

      // 2. Hero fires cyber blaster laser bullet!
      this.player.setState('SHOOT');
      window.audioManager.playBlasterShot();

      const gunX = this.player.x + 36;
      const gunY = this.player.y - 70;
      const targetX = this.enemy.x - 12;
      const targetY = this.enemy.y - 70;
      window.particleSystem.spawnBullet(gunX, gunY, targetX, targetY, true, '#FFD166');

      // 3. Reduce enemy health with EACH correct alphabet typed!
      const dmgPerChar = this.enemyMaxHp / this.currentSentence.length;
      this.enemyHp = Math.max(0, this.enemyHp - dmgPerChar);
      this.enemy.setState('HURT');
      window.particleSystem.triggerShake(2.5);

      this.typedIndex++;
      this.updateHUD();

      // Check if sentence complete
      if (this.typedIndex >= this.currentSentence.length) {
        this.onSentenceComplete();
      } else {
        const nextTile = this.ui.sentenceTiles.children[this.typedIndex];
        if (nextTile) {
          nextTile.classList.add('current');
        }
      }
    } else {
      // Wrong character typed!
      window.audioManager.playTypo();
      window.particleSystem.triggerShake(4);

      const tile = this.ui.sentenceTiles.children[this.typedIndex];
      if (tile) {
        tile.classList.add('error');
        setTimeout(() => tile.classList.remove('error'), 180);
      }

      // Damage player ONLY on mistake
      this.sentenceMistakes++;
      this.streak = 0;
      this.player.setState('HURT');
      this.playerHp = Math.max(0, this.playerHp - CONFIG.PLAYER.MISTAKE_DAMAGE);

      window.particleSystem.spawnTypoBurst(this.player.x + 10, this.player.y - 40);
      window.particleSystem.addFloatingText('-' + CONFIG.PLAYER.MISTAKE_DAMAGE + ' HP', this.player.x, this.player.y - 70, CONFIG.COLORS.DANGER);

      this.updateHUD();

      if (this.playerHp <= 0) {
        this.onGameOver();
      }
    }
  }

  // --- Sentence Completed (Finisher Barrage) ---

  onSentenceComplete() {
    this.state = CONFIG.STATES.ATTACK;
    window.inputManager.disable();

    const elapsedSec = Math.max(0.5, (performance.now() - this.sentenceStartTime) / 1000);
    const wordCount = this.currentSentence.split(' ').length;
    const wpm = Math.round((wordCount / elapsedSec) * 60);

    let sentenceScore = CONFIG.SCORE.BASE_PER_ENEMY;
    const speedBonus = Math.floor(wpm * CONFIG.SCORE.WPM_FACTOR);
    sentenceScore += speedBonus;

    if (this.sentenceMistakes === 0) {
      sentenceScore += CONFIG.SCORE.PERFECT_BONUS;
    }

    this.streak++;
    sentenceScore += this.streak * CONFIG.SCORE.STREAK_BONUS_FACTOR;
    this.score += sentenceScore;

    // Rapid double laser blast finisher!
    this.player.setState('SHOOT');
    window.audioManager.playBlasterShot();
    window.particleSystem.spawnBullet(this.player.x + 36, this.player.y - 70, this.enemy.x - 12, this.enemy.y - 70, true, '#00F5D4');

    setTimeout(() => {
      this.enemy.setState('HURT');
      this.enemyHp = 0; // Enemy knocked out!
      window.particleSystem.triggerShake(9);
      window.particleSystem.spawnHitSparks(this.enemy.x - 15, this.enemy.y - 40, 20);
      window.particleSystem.addFloatingText('+' + sentenceScore, this.enemy.x, this.enemy.y - 75, CONFIG.COLORS.HIGHLIGHT, 20);

      this.updateHUD();
      this.onEnemyDefeated();
    }, 180);
  }

  // --- Enemy Defeated & Streak Health Recovery ---

  onEnemyDefeated() {
    window.audioManager.playEnemyDefeat();
    window.crazyGames.happytime();
    window.particleSystem.triggerShake(14);
    window.particleSystem.spawnDefeatExplosion(this.enemy.x, this.enemy.y - 40);

    // Trigger full enemy death collapse and disintegration
    this.enemy.setState('DEFEAT');

    this.enemiesDefeated++;
    this.enemyLevel++;
    this.killStreak++;

    // Streak Health & Bonus Reward (every 3 consecutive enemies)
    if (this.killStreak > 0 && this.killStreak % CONFIG.PLAYER.STREAK_HEAL_EVERY === 0) {
      const heal = CONFIG.PLAYER.STREAK_HEAL_AMOUNT;
      this.playerHp = Math.min(CONFIG.PLAYER.MAX_HP, this.playerHp + heal);
      this.score += 400;

      window.audioManager.playStreakBonus();
      window.particleSystem.spawnHealingSparkles(this.player.x, this.player.y - 40);
      window.particleSystem.addFloatingText('+' + heal + ' HP HEAL!', this.player.x, this.player.y - 85, CONFIG.COLORS.SUCCESS, 20);
      window.particleSystem.addFloatingText('STREAK x' + this.killStreak + ' BONUS!', this.virtualWidth * 0.5, this.virtualHeight * 0.35, CONFIG.COLORS.SECONDARY, 24);

      // Prominently announce streak heal & points bonus in 1.8s arcade banner!
      this.showRewardBanner(`🔥 ${this.killStreak}X STREAK! 🔥`, `+${heal} HP RESTORED & +400 BONUS!`, 'heal');
    } else if (this.isBossRound) {
      this.score += 1000;
      this.showRewardBanner('👑 BOSS CRUSHED! 👑', '+1,000 BOSS BONUS PTS!', 'boss');
    } else if (this.sentenceMistakes === 0) {
      this.showRewardBanner('⚡ PERFECT COMBO! ⚡', '+200 BONUS PTS!', 'perfect');
    }

    this.updateHUD();

    // Allow full death collapse and disintegration animation (~1.0s) before advancing
    setTimeout(() => {
      this.startWalkingToNextEnemy();
    }, 1050);
  }

  // --- Enemy Gunshot Counter-Attack Loop ---

  handleEnemyAttack(dt) {
    if (this.state !== CONFIG.STATES.PLAYER_TYPING) return;

    this.enemyAttackTimer -= dt;

    if (this.enemyAttackTimer <= 0) {
      // Enemy fires gun at player!
      this.enemyAttackTimer = this.enemyAttackInterval;
      this.enemy.setState('ATTACK');
      window.audioManager.playEnemyShot();

      // Spawn bullet projectile towards player
      const gunX = this.enemy.x - 36;
      const gunY = this.enemy.y - 70;
      const targetX = this.player.x + 12;
      const targetY = this.player.y - 70;
      window.particleSystem.spawnBullet(gunX, gunY, targetX, targetY, false, '#FF007F');

      setTimeout(() => {
        if (this.state !== CONFIG.STATES.PLAYER_TYPING) return;

        // Player takes hit
        const dmg = Math.min(
          CONFIG.ENEMY.MAX_DAMAGE,
          CONFIG.ENEMY.BASE_DAMAGE + Math.floor(this.enemyLevel * 0.7)
        );
        this.playerHp = Math.max(0, this.playerHp - dmg);
        this.player.setState('HURT');

        window.particleSystem.triggerShake(6);
        window.particleSystem.spawnTypoBurst(this.player.x, this.player.y - 40);
        window.particleSystem.addFloatingText('-' + dmg + ' HP', this.player.x, this.player.y - 70, CONFIG.COLORS.DANGER, 18);

        this.updateHUD();

        if (this.playerHp <= 0) {
          this.onGameOver();
        }
      }, 100);
    }
  }

  // --- HUD Updates ---

  updateHUD() {
    // Player HP
    const pPct = Math.max(0, Math.min(100, (this.playerHp / CONFIG.PLAYER.MAX_HP) * 100));
    this.ui.playerHpFill.style.width = pPct + '%';
    this.ui.playerHpText.textContent = Math.ceil(this.playerHp);

    // Live Dynamic Player WPM
    const minutes = Math.max(0.04, this.totalTypingTimeSec / 60);
    const playerWpm = (this.totalTypingTimeSec > 0.3) ? Math.round((this.totalCharsTyped / 5) / minutes) : 0;
    if (this.ui.playerWpmText) {
      this.ui.playerWpmText.textContent = playerWpm;
    }

    // Enemy HP
    const ePct = Math.max(0, Math.min(100, (this.enemyHp / this.enemyMaxHp) * 100));
    this.ui.enemyHpFill.style.width = ePct + '%';
    this.ui.enemyLevelText.textContent = this.isBossRound ? '★ BOSS' : 'LV.' + this.enemyLevel;

    // Static Enemy WPM Benchmark
    const enemyWpm = this.isBossRound ? 85 : Math.min(80, 25 + (this.enemyLevel - 1) * 8);
    if (this.ui.enemyWpmText) {
      this.ui.enemyWpmText.textContent = enemyWpm;
    }

    // Stage Name
    const stageInfo = CONFIG.STAGES[this.currentStageId % CONFIG.STAGES.length];
    if (this.ui.stageNameText) {
      this.ui.stageNameText.textContent = this.isBossRound ? '★ BOSS BATTLE' : stageInfo.name;
      this.ui.stageNameText.style.color = this.isBossRound ? CONFIG.COLORS.NEON_MAGENTA : stageInfo.color;
    }

    // Score & Streak
    this.ui.scoreDisplay.textContent = this.score.toLocaleString();
    this.ui.streakDisplay.textContent = 'x' + this.killStreak;

    // High score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      window.crazyGames.saveHighScore(this.highScore);
    }
    this.updateHighScoreDisplay();
  }

  onGameOver() {
    this.state = CONFIG.STATES.GAME_OVER;
    this.killStreak = 0;
    window.inputManager.disable();
    window.audioManager.stopBGM();
    window.audioManager.playGameOver();
    window.crazyGames.gameplayStop();

    // Trigger hero death animation (collapse backward, drop gun, red glitch)
    this.player.setState('DEFEAT');
    window.particleSystem.triggerShake(12);

    this.ui.finalScore.textContent = this.score.toLocaleString();
    this.ui.bestScoreDisplay.textContent = this.highScore.toLocaleString();

    if (this.score >= this.highScore && this.score > 0) {
      this.ui.newHighScoreBanner.classList.remove('hidden');
    } else {
      this.ui.newHighScoreBanner.classList.add('hidden');
    }

    // Wait for full death collapse animation (~1.25s) before showing game over modal
    setTimeout(() => {
      this.ui.gameOverModal.classList.remove('hidden');
    }, 1250);
  }

  pauseGame() {
    if (this.state === CONFIG.STATES.PLAYER_TYPING || this.state === CONFIG.STATES.WALKING) {
      this.prevState = this.state;
      this.state = CONFIG.STATES.PAUSED;
      window.inputManager.disable();
      window.crazyGames.gameplayStop();
      this.ui.pauseModal.classList.remove('hidden');
    }
  }

  resumeGame() {
    if (this.state === CONFIG.STATES.PAUSED) {
      this.ui.pauseModal.classList.add('hidden');
      this.state = this.prevState || CONFIG.STATES.PLAYER_TYPING;
      if (this.state === CONFIG.STATES.PLAYER_TYPING) {
        window.inputManager.enable();
      }
      window.crazyGames.gameplayStart();
    }
  }

  openSettings() {
    this.ui.settingsModal.classList.remove('hidden');
  }

  closeSettings() {
    this.ui.settingsModal.classList.add('hidden');
  }

  quitToMenu() {
    this.state = CONFIG.STATES.MENU;
    this.killStreak = 0;
    window.inputManager.disable();
    window.audioManager.stopBGM();
    window.crazyGames.gameplayStop();

    if (this.ui.rewardBanner) this.ui.rewardBanner.classList.add('hidden');
    this.ui.gameOverModal.classList.add('hidden');
    this.ui.pauseModal.classList.add('hidden');
    this.ui.settingsModal.classList.add('hidden');
    this.ui.gameplayHud.classList.add('hidden');
    this.ui.typingArea.classList.add('hidden');
    this.ui.countdownOverlay.classList.add('hidden');

    this.ui.menuScreen.classList.remove('hidden');
    this.updateHighScoreDisplay();
  }

  // --- Engine Loop ---

  gameLoop(currentTime) {
    if (!this.lastFrameTime) this.lastFrameTime = currentTime;
    const dt = Math.min(0.1, (currentTime - this.lastFrameTime) / 1000);
    this.lastFrameTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    if (this.state === CONFIG.STATES.PAUSED) return;

    // Handle Walking Sequence
    if (this.state === CONFIG.STATES.WALKING) {
      this.walkTimer += dt;
      this.stage.update(dt, true, 190);

      // Enemy walks in smoothly from right toward baseX
      const dist = this.enemy.x - this.enemy.baseX;
      if (dist > 0) {
        const speed = Math.max(140, dist * 2.5);
        this.enemy.x -= speed * dt;
        if (this.enemy.x <= this.enemy.baseX) {
          this.enemy.x = this.enemy.baseX;
        }
      }

      // Once enemy is at base position and walk time has passed, engage smoothly!
      if (this.walkTimer >= 1.4 && this.enemy.x <= this.enemy.baseX + 2) {
        this.enemy.x = this.enemy.baseX;
        this.startBattle();
      }
    } else {
      this.stage.update(dt, false);
    }

    // Active Combat
    if (this.state === CONFIG.STATES.PLAYER_TYPING) {
      this.totalTypingTimeSec += dt;
      this.handleEnemyAttack(dt);
    }

    // Update characters & bullets
    this.player.update(dt, this.enemy.baseX);
    this.enemy.update(dt, this.player.baseX);
    window.particleSystem.update(dt);
  }

  render() {
    const ctx = this.ctx;
    const w = this.virtualWidth;
    const h = this.virtualHeight;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.save();

    // Screen Shake
    const shake = window.particleSystem.getShakeOffset();
    ctx.translate(shake.x, shake.y);

    // 1. Draw SVG City Stage
    this.stage.render(ctx, w, h, this.currentStageId, this.isBossRound);

    // 2. Draw Characters (Aiming & Shooting Guns)
    const scale = Math.max(1.15, Math.min(1.45, w / 700));
    this.player.render(ctx, scale);
    this.enemy.render(ctx, scale);

    // 3. Draw Projectiles, Sparks & Popups
    window.particleSystem.render(ctx);

    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
  window.game.init();
});
