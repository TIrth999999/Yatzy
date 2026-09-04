/**
 * Type War - Character & Stage Rendering System
 * Supports modular SVG characters (Player & Tiered Enemies)
 * and rich death collapse & disintegration animations.
 */

// Cache standalone editable SVG assets
const CHARACTER_ASSETS = {
  player: new Image(),
  enemy_punk: new Image(),
  enemy_mercenary: new Image(),
  enemy_cyborg: new Image(),
  enemy_boss: new Image()
};

CHARACTER_ASSETS.player.src = 'assets/characters/player.svg';
CHARACTER_ASSETS.enemy_punk.src = 'assets/characters/enemy_punk.svg';
CHARACTER_ASSETS.enemy_mercenary.src = 'assets/characters/enemy_mercenary.svg';
CHARACTER_ASSETS.enemy_cyborg.src = 'assets/characters/enemy_cyborg.svg';
CHARACTER_ASSETS.enemy_boss.src = 'assets/characters/enemy_boss.svg';

class StageRenderer {
  constructor() {
    this.time = 0;
    this.scrollX = 0;
    this.svgImages = [];
    this.imagesLoaded = false;
    this.loadStages();
  }

  loadStages() {
    const stageFiles = [
      'assets/stages/stage_0_neon_alley.svg',
      'assets/stages/stage_1_cyber_downtown.svg',
      'assets/stages/stage_2_underground_subway.svg',
      'assets/stages/stage_3_rooftop_arena.svg',
      'assets/stages/stage_4_industrial_docks.svg',
      'assets/stages/stage_5_chinatown_bazaar.svg',
      'assets/stages/stage_6_cyber_highway.svg'
    ];

    let loadedCount = 0;
    stageFiles.forEach((path, idx) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= stageFiles.length) {
          this.imagesLoaded = true;
        }
      };
      this.svgImages[idx] = img;
    });
  }

  update(dt, isScrolling = false, speed = 180) {
    this.time += dt;
    if (isScrolling) {
      this.scrollX += speed * dt;
    }
  }

  render(ctx, width, height, stageId = 0, isBoss = false) {
    ctx.save();

    const img = this.svgImages[stageId % this.svgImages.length];
    if (img && img.complete && img.naturalWidth > 0) {
      const scroll = (this.scrollX * 0.65) % width;
      ctx.drawImage(img, -scroll, 0, width, height);
      ctx.drawImage(img, width - scroll, 0, width, height);
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, '#0E0B1F');
      sky.addColorStop(0.5, '#1D1538');
      sky.addColorStop(1, '#15102A');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#221C38';
      ctx.fillRect(0, height * 0.28, width, height * 0.60);
      ctx.fillStyle = '#322B48';
      ctx.fillRect(0, height * 0.88, width, 16);
      ctx.fillStyle = '#1A142D';
      ctx.fillRect(0, height * 0.88 + 16, width, height);
    }

    ctx.restore();
  }
}

/**
 * Fighter Animator with SVG Character Rendering & Death Animation
 */
class Fighter {
  constructor(isPlayer = true) {
    this.isPlayer = isPlayer;
    this.baseX = isPlayer ? 320 : 480;
    this.baseY = 320;
    this.x = this.baseX;
    this.y = this.baseY;

    this.state = 'IDLE'; // IDLE, WALK, SHOOT, ATTACK, HURT, DEFEAT
    this.animTime = 0;
    this.shootTimer = 0;
    this.hurtTimer = 0;
    this.deathTimer = 0;
    this.deathDuration = isPlayer ? 1.2 : 0.95;

    this.enemyType = 0;
    this.enemyLevel = 1;
    this.isBoss = false;
  }

  setState(newState) {
    this.state = newState;
    if (newState === 'SHOOT' || newState === 'ATTACK') {
      this.shootTimer = 0.16; // Muzzle flash & recoil duration
    }
    if (newState === 'HURT') {
      this.hurtTimer = 0.22;
    }
    if (newState === 'DEFEAT') {
      this.deathTimer = 0;
    }
  }

  update(dt, targetX) {
    this.animTime += dt;

    if (this.state === 'DEFEAT') {
      this.deathTimer += dt;
      // Stumble backward in initial collapse
      if (this.deathTimer < 0.35) {
        const stumbleSpeed = this.isPlayer ? -35 : 45;
        this.x += stumbleSpeed * dt;
      }
      return;
    }

    if (this.shootTimer > 0) {
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        if (this.state === 'SHOOT' || this.state === 'ATTACK') {
          this.setState('IDLE');
        }
      }
    }

    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      if (this.hurtTimer <= 0) {
        this.x = this.baseX;
        this.setState('IDLE');
      } else {
        const recoil = Math.sin(this.hurtTimer * 30) * 6;
        this.x = this.baseX + (this.isPlayer ? -recoil : recoil);
      }
    }
  }

  render(ctx, scale = 1.0) {
    ctx.save();

    // Intrinsic scale factor to balance SVG viewBox dimensions (~220px) with canvas height
    const baseSpriteScale = 0.58;
    const effectiveScale = (this.isBoss ? scale * 1.35 : scale) * baseSpriteScale;

    let posX = this.x;
    let posY = this.y;
    let rotation = 0;
    let alpha = 1.0;

    const isFiring = (this.shootTimer > 0);
    const isFlashing = (this.state === 'HURT' && Math.floor(this.animTime * 30) % 2 === 0);

    // Dynamic Death Animation (Collapse, fall backward, fade out)
    if (this.state === 'DEFEAT') {
      const p = Math.min(1.0, this.deathTimer / this.deathDuration);
      const fallProgress = Math.min(1.0, p / 0.35);
      const fallEase = Math.sin(fallProgress * Math.PI * 0.5);

      if (this.isPlayer) {
        // Player collapses backward onto knees/ground
        rotation = fallEase * (Math.PI * 0.44);
        posY += fallEase * 22;
        posX -= fallEase * 18;
      } else {
        // Enemy knocked backward and drops flat
        rotation = -fallEase * (Math.PI * 0.48);
        posY += fallEase * 28;
        posX += fallEase * 24;
      }

      // Disintegration / Fade out in second half of death
      if (p > 0.35) {
        alpha = Math.max(0, 1.0 - ((p - 0.35) / 0.65));
      }

      // Glitch flicker during collapse
      if (p < 0.45 && Math.floor(this.animTime * 40) % 2 === 0) {
        alpha *= 0.5;
      }
    } else {
      // Idle & Walk bobbing
      if (this.state === 'IDLE') {
        posY += Math.sin(this.animTime * 4.8) * 3;
      } else if (this.state === 'WALK') {
        posY += Math.abs(Math.sin(this.animTime * 10)) * 5;
        rotation = Math.sin(this.animTime * 10) * 0.04 * (this.isPlayer ? 1 : -1);
      }

      // Weapon firing recoil
      if (isFiring) {
        posX += this.isPlayer ? -5 : 5;
      }
    }

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // Ground Shadow (scales with life and collapse)
    if (this.state !== 'DEFEAT' || this.deathTimer < this.deathDuration * 0.9) {
      ctx.save();
      const shadowRadius = (this.isBoss ? 48 : 34) * effectiveScale;
      const shadowAlpha = (this.state === 'DEFEAT') ? alpha * 0.35 : 0.45;
      ctx.fillStyle = `rgba(10, 8, 20, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(posX, this.y, shadowRadius, 8 * effectiveScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Apply character position, rotation & scale
    ctx.translate(posX, posY);
    ctx.rotate(rotation);
    ctx.scale(effectiveScale, effectiveScale);

    if (this.isPlayer) {
      this.drawPlayerSVG(ctx, isFiring, isFlashing);
    } else {
      this.drawEnemySVG(ctx, isFiring, isFlashing);
    }

    ctx.restore();
  }

  // --- SVG Player Drawing ---
  drawPlayerSVG(ctx, isFiring, isFlashing) {
    const img = CHARACTER_ASSETS.player;
    const anchorX = 80;
    const anchorY = 208;
    const w = 160;
    const h = 220;

    if (img && img.complete && img.naturalWidth > 0) {
      if (isFlashing) {
        ctx.filter = 'brightness(2.2) contrast(1.5)';
      }
      ctx.drawImage(img, -anchorX, -anchorY, w, h);
      ctx.filter = 'none';

      // Laser Pistol Muzzle Flash
      if (isFiring) {
        this.renderMuzzleFlash(ctx, 72, -128, true, '#FFD166');
      }
    } else {
      this.renderPlayerFallback(ctx, isFlashing, isFiring);
    }
  }

  // --- SVG Tiered Enemy Drawing ---
  drawEnemySVG(ctx, isFiring, isFlashing) {
    let img;
    let anchorX = 80;
    let anchorY = 208;
    let w = 160;
    let h = 220;
    let tipX = -74;
    let tipY = -132;
    let flashColor = '#FF007F';

    if (this.isBoss) {
      img = CHARACTER_ASSETS.enemy_boss;
      anchorX = 90;
      anchorY = 216;
      w = 180;
      h = 230;
      tipX = -60;
      tipY = -136;
      flashColor = '#E11D48';
    } else if (this.enemyLevel >= 6) {
      img = CHARACTER_ASSETS.enemy_cyborg;
      tipX = -106;
      tipY = -128;
      flashColor = '#00F5D4';
    } else if (this.enemyLevel >= 3) {
      img = CHARACTER_ASSETS.enemy_mercenary;
      tipX = -82;
      tipY = -130;
      flashColor = '#9333EA';
    } else {
      img = CHARACTER_ASSETS.enemy_punk;
      tipX = -74;
      tipY = -132;
      flashColor = '#EC4899';
    }

    if (img && img.complete && img.naturalWidth > 0) {
      if (isFlashing) {
        ctx.filter = 'brightness(2.2) contrast(1.5)';
      }
      ctx.drawImage(img, -anchorX, -anchorY, w, h);
      ctx.filter = 'none';

      // Muzzle Flash
      if (isFiring) {
        this.renderMuzzleFlash(ctx, tipX, tipY, false, flashColor);
        if (this.isBoss) {
          this.renderMuzzleFlash(ctx, tipX, tipY + 16, false, flashColor);
        }
      }
    } else {
      this.renderEnemyFallback(ctx, isFlashing, isFiring);
    }
  }

  // Visual Muzzle Flash Spark
  renderMuzzleFlash(ctx, x, y, isFacingRight = true, color = '#FFD166') {
    ctx.save();
    ctx.translate(x, y);
    const dir = isFacingRight ? 1 : -1;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dir * 24, -8);
    ctx.lineTo(dir * 18, 0);
    ctx.lineTo(dir * 28, 8);
    ctx.closePath();
    ctx.fill();

    // Hot center
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- Procedural Fallbacks (Graceful asset loading insurance) ---
  renderPlayerFallback(ctx, isFlashing, isFiring) {
    ctx.fillStyle = isFlashing ? '#FFFFFF' : '#D63031';
    ctx.fillRect(-20, -140, 36, 60);
    ctx.fillStyle = '#E8A882';
    ctx.fillRect(-10, -180, 24, 28);
    ctx.fillStyle = '#2D3436';
    ctx.fillRect(-16, -80, 14, 80);
    ctx.fillRect(4, -80, 14, 80);
  }

  renderEnemyFallback(ctx, isFlashing, isFiring) {
    ctx.fillStyle = isFlashing ? '#FFFFFF' : (this.isBoss ? '#800020' : '#2E865F');
    ctx.fillRect(-18, -140, 36, 60);
    ctx.fillStyle = '#FCD34D';
    ctx.fillRect(-14, -180, 24, 28);
    ctx.fillStyle = '#1E1E2E';
    ctx.fillRect(-14, -80, 12, 80);
    ctx.fillRect(2, -80, 12, 80);
  }
}

window.StageRenderer = StageRenderer;
window.Fighter = Fighter;
