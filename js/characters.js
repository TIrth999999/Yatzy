/**
 * Typing Fighter - Character & Stage Rendering System
 * Articulated Multi-Limb Skeletal Kinematics, Fluid Street Walking Strides,
 * Cyberpunk Street Fighter Visuals, and Dramatic Arcade Knockouts.
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
      'assets/stages/stage_0_neon_alley.png',
      'assets/stages/stage_1_cyber_downtown.png',
      'assets/stages/stage_2_underground_subway.png',
      'assets/stages/stage_3_rooftop_arena.png',
      'assets/stages/stage_4_industrial_docks.png',
      'assets/stages/stage_5_chinatown_bazaar.png',
      'assets/stages/stage_6_cyber_highway.png'
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
 * High-Fidelity Fighter Animator with Modular Limb Kinematics & Walking Strides
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
    this.deathDuration = isPlayer ? 1.6 : 1.35;
    this._hasSlammed = false;

    this.enemyType = 0;
    this.enemyLevel = 1;
    this.isBoss = false;

    // Last footstep phase for realistic asphalt dust bursts
    this._lastStepPhase = 0;
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
      this._hasSlammed = false;
    }
  }

  getMuzzlePosition(scale = 1.0) {
    const effectiveScale = (this.isBoss ? scale * 1.35 : scale);
    if (this.isPlayer) {
      return {
        x: this.x + 52 * effectiveScale,
        y: this.y - 94 * effectiveScale
      };
    } else {
      const dx = this.isBoss ? -72 : -52;
      const dy = this.isBoss ? -108 : -94;
      return {
        x: this.x + dx * effectiveScale,
        y: this.y + dy * effectiveScale
      };
    }
  }

  getHitTargetPosition(scale = 1.0) {
    const effectiveScale = (this.isBoss ? scale * 1.35 : scale);
    return {
      x: this.x + (this.isPlayer ? 8 : -8) * effectiveScale,
      y: this.y - 88 * effectiveScale
    };
  }

  update(dt, targetX) {
    this.animTime += dt;

    if (this.state === 'DEFEAT') {
      this.deathTimer += dt;
      return;
    }

    // Street foot dust triggered on precise foot contact frames
    if (this.state === 'WALK') {
      const walkCadence = 7.2;
      const stepPhase = Math.floor(this.animTime * walkCadence / Math.PI);
      if (stepPhase !== this._lastStepPhase) {
        this._lastStepPhase = stepPhase;
        if (window.particleSystem) {
          const dustX = this.x + (this.isPlayer ? -14 : 14);
          window.particleSystem.spawnGroundDust(dustX, this.y, 5);
        }
      }
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

    const effectiveScale = (this.isBoss ? scale * 1.35 : scale) * 0.88;
    let posX = this.x;
    let posY = this.y;
    let rotation = 0;
    let alpha = 1.0;
    const dir = this.isPlayer ? -1 : 1;

    // --- Kinematics & Stride Angles ---
    let backThigh = 0;
    let backKnee = 0;
    let frontThigh = 0;
    let frontKnee = 0;
    let torsoBounce = 0;
    let torsoLean = 0;
    let backArm = 0;
    let gunArm = 0;
    let gunRecoil = 0;

    const isFiring = (this.shootTimer > 0);
    const isFlashing = (this.state === 'HURT' && Math.floor(this.animTime * 30) % 2 === 0);

    if (this.state === 'DEFEAT') {
      const p = Math.min(1.0, this.deathTimer / this.deathDuration);

      // Phase 1 (0 to 0.24): Lethal blow lifts character into airborne recoil arc
      if (p < 0.24) {
        const t1 = p / 0.24;
        posY -= Math.sin(t1 * Math.PI) * 32;
        posX += dir * Math.sin(t1 * Math.PI * 0.5) * 38;
        rotation = dir * Math.sin(t1 * Math.PI * 0.5) * 0.55;
        backThigh = 0.3;
        frontThigh = -0.2;
      }
      // Phase 2 (0.24 to 0.48): Heavy pavement impact slam & settling bounce
      else if (p < 0.48) {
        const t2 = (p - 0.24) / 0.24;
        if (!this._hasSlammed) {
          this._hasSlammed = true;
          if (window.particleSystem) {
            window.particleSystem.triggerShake(4.0);
            window.particleSystem.spawnGroundDust(posX, this.y, 14);
          }
        }
        const bounce = Math.sin(t2 * Math.PI) * Math.max(0, 1.0 - t2) * 8;
        posY = this.y - bounce;
        posX += dir * (38 + t2 * 14);
        rotation = dir * (0.55 + t2 * (Math.PI * 0.48 - 0.55));
        backThigh = 0.2;
        frontThigh = 0.1;
      }
      // Phase 3 (0.48 to 1.0): Defeated flat on ground, voxel disintegration
      else {
        const t3 = (p - 0.48) / 0.52;
        posX += dir * 52;
        posY = this.y;
        rotation = dir * (Math.PI * 0.48);

        if (p > 0.48 && p < 0.92 && Math.random() < 0.35 && window.particleSystem) {
          window.particleSystem.spawnGlitchVoxels(posX, this.y - 15, 3);
        }
        if (p < 0.85 && Math.floor(this.animTime * 35) % 3 === 0) {
          alpha = 0.45;
        }
        if (t3 > 0.3) {
          alpha = Math.max(0, 1.0 - ((t3 - 0.3) / 0.7));
        }
      }
    } else {
      // Idle & Fluid Real Walking Strides
      if (this.state === 'IDLE') {
        const breathe = Math.sin(this.animTime * 3.2);
        torsoBounce = breathe * 1.5;
        torsoLean = this.isPlayer ? 0.03 : -0.03;
        backThigh = -0.08;
        backKnee = 0.06;
        frontThigh = 0.10;
        frontKnee = 0.12; // Combat ready flex
        backArm = 0.08 + breathe * 0.03;
        gunArm = breathe * 0.04;
      } else if (this.state === 'WALK') {
        const walkCadence = 7.4;
        const cycle = this.animTime * walkCadence;
        const stride = Math.sin(cycle); // -1.0 to 1.0

        // Real forward/backward leg strides
        backThigh = -stride * 0.42;
        backKnee = Math.max(0, stride) * 0.48; // bends upward on forward swing

        frontThigh = stride * 0.42;
        frontKnee = Math.max(0, -stride) * 0.48;

        // Two-beat human gait bounce (drops on step contact, rises at mid-stride)
        torsoBounce = -Math.abs(Math.sin(cycle)) * 4.5;
        torsoLean = (this.isPlayer ? 0.07 : -0.07) + Math.cos(cycle) * 0.025;

        // Natural arm counter-swing
        backArm = -stride * 0.38;
        gunArm = Math.sin(cycle) * 0.06;
      }

      if (isFiring) {
        gunRecoil = -8;
        torsoLean += this.isPlayer ? -0.04 : 0.04;
      }
      if (this.state === 'HURT') {
        torsoLean += this.isPlayer ? -0.14 : 0.14;
        torsoBounce -= 3;
      }
    }

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // Ground Shadow
    if (this.state !== 'DEFEAT' || this.deathTimer < this.deathDuration * 0.9) {
      ctx.save();
      const shadowRadius = (this.isBoss ? 46 : 32) * effectiveScale;
      const shadowAlpha = (this.state === 'DEFEAT') ? alpha * 0.35 : 0.45;
      ctx.fillStyle = `rgba(10, 8, 20, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(posX, this.y, shadowRadius, 7 * effectiveScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Apply translation & overall scale
    ctx.translate(posX, posY + torsoBounce);
    ctx.rotate(rotation);
    ctx.scale(effectiveScale, effectiveScale);

    if (this.isPlayer) {
      this.drawArticulatedPlayer(ctx, {
        backThigh, backKnee, frontThigh, frontKnee,
        torsoLean, backArm, gunArm, gunRecoil,
        isFiring, isFlashing
      });
    } else {
      this.drawArticulatedEnemy(ctx, {
        backThigh, backKnee, frontThigh, frontKnee,
        torsoLean, backArm, gunArm, gunRecoil,
        isFiring, isFlashing
      });
    }

    ctx.restore();
  }

  // --- Dynamic Articulated Player (Hero) Renderer ---
  drawArticulatedPlayer(ctx, anim) {
    const skin = window.storeManager ? window.storeManager.getActiveSkinData() : null;
    const skinId = skin ? skin.id : 'classic';

    // Skin Color Palettes
    let jacketColor = '#E11D48'; // Varsity Red
    let jacketShade = '#881337';
    let sleeveColor = '#F8FAFC';
    let sleeveShade = '#CBD5E1';
    let pantsColor = '#1E293B';  // Indigo Denim
    let pantsShade = '#0F172A';
    let shoeColor = '#00F5D4';   // Electric Cyan
    let gunColor = '#334155';
    let visorColor = '#00F5D4';
    let flashColor = skin ? skin.bulletColor : '#FFD166';

    if (skinId === 'shadow') {
      jacketColor = '#0F172A';
      jacketShade = '#020617';
      sleeveColor = '#1E293B';
      sleeveShade = '#0F172A';
      pantsColor = '#0B0F19';
      pantsShade = '#020617';
      shoeColor = '#00F5D4';
      gunColor = '#1E293B';
      visorColor = '#00F5D4';
    } else if (skinId === 'neon') {
      jacketColor = '#7B2CBF';
      jacketShade = '#3C096C';
      sleeveColor = '#C77DFF';
      sleeveShade = '#9D4EDD';
      pantsColor = '#1A102F';
      pantsShade = '#0F081D';
      shoeColor = '#9D4EDD';
      gunColor = '#4A154B';
      visorColor = '#FF007F';
    } else if (skinId === 'gold') {
      jacketColor = '#F59E0B';
      jacketShade = '#B45309';
      sleeveColor = '#FEF3C7';
      sleeveShade = '#FDE68A';
      pantsColor = '#78350F';
      pantsShade = '#451A03';
      shoeColor = '#FDE68A';
      gunColor = '#B45309';
      visorColor = '#FEF08A';
    }

    if (anim.isFlashing) {
      jacketColor = '#FFFFFF';
      jacketShade = '#E2E8F0';
      sleeveColor = '#FFFFFF';
      sleeveShade = '#E2E8F0';
      pantsColor = '#FFFFFF';
      pantsShade = '#E2E8F0';
      shoeColor = '#FFFFFF';
    }

    // 1. Back Arm (counter-balance swing behind body)
    ctx.save();
    ctx.translate(-8, -98);
    ctx.rotate(anim.backArm);
    ctx.fillStyle = sleeveShade;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 10, 24, 4);
    ctx.fill();
    // Wristband
    ctx.fillStyle = jacketShade;
    ctx.fillRect(-5, 20, 10, 4);
    // Clenched fist
    ctx.fillStyle = '#6E3C23';
    ctx.beginPath();
    ctx.arc(0, 27, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Back Leg (Left Leg)
    this.drawLeg(ctx, -9, -68, anim.backThigh, anim.backKnee, false, pantsShade, pantsShade, shoeColor, true);

    // 3. Front Leg (Right Leg)
    this.drawLeg(ctx, 7, -68, anim.frontThigh, anim.frontKnee, true, pantsColor, pantsShade, shoeColor, true);

    // 4. Torso & Athletic Varsity Jacket
    ctx.save();
    ctx.translate(0, -70);
    ctx.rotate(anim.torsoLean);

    // Tactical Belt & Buckle
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(-15, -2, 30, 6);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-3, -2.5, 6, 7);

    // V-Taper Jacket Torso
    ctx.fillStyle = jacketColor;
    ctx.beginPath();
    ctx.roundRect(-16, -46, 32, 44, [5, 5, 2, 2]);
    ctx.fill();

    // Jacket Shading & Athletic Side Seam
    ctx.fillStyle = jacketShade;
    ctx.fillRect(-16, -46, 11, 44);

    // Zipper with Metallic Pull
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -44);
    ctx.lineTo(0, -4);
    ctx.stroke();

    // Chest Lightning Emblem / Star
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.moveTo(5, -36);
    ctx.lineTo(11, -36);
    ctx.lineTo(7, -30);
    ctx.lineTo(12, -30);
    ctx.lineTo(4, -22);
    ctx.lineTo(7, -29);
    ctx.lineTo(3, -29);
    ctx.closePath();
    ctx.fill();

    // Ribbed Striped Collar & Hem
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-16, -6, 32, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-16, -4, 32, 1);

    // Gold Chain Necklace with Medallion
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -38, 7, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(0, -30, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Head & Cyber Visor (Facing Right)
    ctx.save();
    ctx.translate(0, -48);
    // Muscular Neck
    ctx.fillStyle = '#73422A';
    ctx.fillRect(-4, -8, 8, 8);
    // Face & Chin
    ctx.fillStyle = '#9A6348';
    ctx.beginPath();
    ctx.roundRect(-10, -28, 21, 22, [6, 6, 4, 3]);
    ctx.fill();
    // Cyber Ear Comm
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-10, -18, 3, 6);
    ctx.fillStyle = visorColor;
    ctx.fillRect(-9, -16, 2, 2);

    // Layered Cyberpunk Wind-Swept Hair
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.moveTo(-13, -24);
    ctx.quadraticCurveTo(-14, -40, 4, -40);
    ctx.quadraticCurveTo(15, -38, 16, -30);
    ctx.lineTo(12, -22);
    ctx.lineTo(4, -24);
    ctx.lineTo(-13, -22);
    ctx.closePath();
    ctx.fill();

    // Neon Cyber Hair Highlights
    ctx.fillStyle = visorColor;
    ctx.beginPath();
    ctx.moveTo(-6, -38);
    ctx.lineTo(6, -37);
    ctx.lineTo(13, -31);
    ctx.lineTo(9, -32);
    ctx.lineTo(2, -35);
    ctx.closePath();
    ctx.fill();

    // Glowing Cyber Eyewear / HUD Visor
    ctx.fillStyle = visorColor;
    ctx.shadowColor = visorColor;
    ctx.shadowBlur = 8;
    ctx.fillRect(-2, -23, 15, 8);
    // Digital Scanline HUD Glint
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(1, -21, 10, 2);
    ctx.shadowBlur = 0;
    ctx.restore(); // end head

    // 6. Front Arm & Cyber Blaster (Aiming Forward Right)
    ctx.save();
    ctx.translate(10, -36);
    ctx.rotate(anim.gunArm);

    // Bicep / Shoulder Seam
    ctx.fillStyle = jacketColor;
    ctx.beginPath();
    ctx.roundRect(-2, -6, 7, 12, 3);
    ctx.fill();

    // Forearm Sleeve
    ctx.fillStyle = sleeveColor;
    ctx.beginPath();
    ctx.roundRect(4, -5, 20, 10, 4);
    ctx.fill();
    // Sleeve Stripe
    ctx.fillStyle = jacketColor;
    ctx.fillRect(20, -5, 4, 10);
    // Fingerless Tactical Glove & Hand
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(23, -4, 5, 8);
    ctx.fillStyle = '#73422A';
    ctx.beginPath();
    ctx.arc(28, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Advanced Cyber Blaster Pistol
    const rx = anim.gunRecoil;
    // Main Body Frame
    ctx.fillStyle = gunColor;
    ctx.fillRect(26 + rx, -8, 22, 11);
    // Top Heat Vent Rail
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(28 + rx, -10, 16, 2);
    ctx.fillRect(32 + rx, -7, 3, 2);
    ctx.fillRect(38 + rx, -7, 3, 2);
    // Heavy Emitter Muzzle
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(48 + rx, -6, 6, 7);
    // Neon Energy Capacitor Tube
    ctx.fillStyle = visorColor;
    ctx.shadowColor = visorColor;
    ctx.shadowBlur = 4;
    ctx.fillRect(30 + rx, -3, 12, 2.5);
    // Reflex Optical Sight
    ctx.fillStyle = '#FF007F';
    ctx.fillRect(31 + rx, -12, 5, 2);
    ctx.shadowBlur = 0;

    // Muzzle Flash Spark
    if (anim.isFiring) {
      this.renderMuzzleFlash(ctx, 54 + rx, -3, true, flashColor);
    }
    ctx.restore(); // end front arm

    ctx.restore(); // end torso
  }

  // --- Dynamic Articulated Enemy Renderer ---
  drawArticulatedEnemy(ctx, anim) {
    let vestColor = '#1F2937';
    let vestShade = '#111827';
    let pantsColor = '#2563EB';
    let pantsShade = '#1E3A8A';
    let bootColor = '#6F421D';
    let gunColor = '#475569';
    let opticColor = '#FF007F';
    let flashColor = '#FF007F';

    if (this.isBoss) {
      vestColor = '#881337';
      vestShade = '#4C0519';
      pantsColor = '#1E1B4B';
      pantsShade = '#0F172A';
      bootColor = '#1E293B';
      gunColor = '#0F172A';
      opticColor = '#E11D48';
      flashColor = '#E11D48';
    } else if (this.enemyLevel >= 6) {
      // Cyborg
      vestColor = '#334155';
      vestShade = '#0F172A';
      pantsColor = '#0284C7';
      pantsShade = '#0369A1';
      bootColor = '#1E293B';
      gunColor = '#0F172A';
      opticColor = '#00F5D4';
      flashColor = '#00F5D4';
    } else if (this.enemyLevel >= 3) {
      // Mercenary
      vestColor = '#581C87';
      vestShade = '#3B0764';
      pantsColor = '#1E293B';
      pantsShade = '#0F172A';
      bootColor = '#374151';
      gunColor = '#1F2937';
      opticColor = '#A855F7';
      flashColor = '#9333EA';
    }

    if (anim.isFlashing) {
      vestColor = '#FFFFFF';
      vestShade = '#E2E8F0';
      pantsColor = '#FFFFFF';
      pantsShade = '#E2E8F0';
      bootColor = '#FFFFFF';
    }

    // 1. Back Arm (swinging behind torso)
    ctx.save();
    ctx.translate(8, -98);
    ctx.rotate(-anim.backArm);
    ctx.fillStyle = vestShade;
    ctx.beginPath();
    ctx.roundRect(-5, 0, 10, 24, 4);
    ctx.fill();
    // Gauntlet cuff
    ctx.fillStyle = '#111827';
    ctx.fillRect(-5, 18, 10, 4);
    // Fist
    ctx.fillStyle = '#B47B5A';
    ctx.beginPath();
    ctx.arc(0, 26, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Back Leg (Right Leg)
    this.drawLeg(ctx, 9, -68, anim.backThigh, anim.backKnee, false, pantsShade, pantsShade, bootColor, false);

    // 3. Front Leg (Left Leg)
    this.drawLeg(ctx, -7, -68, anim.frontThigh, anim.frontKnee, true, pantsColor, pantsShade, bootColor, false);

    // 4. Torso & Combat Vest (Facing Left)
    ctx.save();
    ctx.translate(0, -70);
    ctx.rotate(anim.torsoLean);

    // Tactical Webbing Belt
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-15, -2, 30, 6);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(-4, -2.5, 8, 7);

    // Armored Vest Body
    ctx.fillStyle = vestColor;
    ctx.beginPath();
    ctx.roundRect(-16, -46, 32, 44, [5, 5, 2, 2]);
    ctx.fill();

    // Shaded Plate & Lapel
    ctx.fillStyle = vestShade;
    ctx.fillRect(5, -46, 11, 44);

    // Tactical Ammo Pouches & Chrome Studs
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(-12, -28, 6, 6);
    ctx.fillRect(-4, -28, 6, 6);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-10, -32, 4, 3);
    ctx.fillRect(-2, -32, 4, 3);

    // Boss Warlord Epaulets / Shoulder Pads
    if (this.isBoss) {
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-18, -48, 10, 5);
      ctx.fillRect(8, -48, 10, 5);
    }

    // 5. Head (Facing Left)
    ctx.save();
    ctx.translate(0, -48);
    // Neck
    ctx.fillStyle = '#B45309';
    ctx.fillRect(-4, -8, 8, 8);
    // Face
    ctx.fillStyle = '#F1C2A5';
    ctx.beginPath();
    ctx.roundRect(-11, -28, 21, 22, [6, 6, 3, 4]);
    ctx.fill();

    // Headgear / Hair according to enemy tier
    if (this.isBoss) {
      // Warlord peaked officer cap
      ctx.fillStyle = '#4C0519';
      ctx.fillRect(-13, -33, 26, 8);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-12, -26, 24, 2.5);
      ctx.fillRect(-15, -24, 9, 3); // visor bill
    } else if (this.enemyLevel >= 6) {
      // Cyborg Titanium skull plate & optic wires
      ctx.fillStyle = '#64748B';
      ctx.fillRect(-12, -30, 24, 10);
      ctx.fillStyle = '#00F5D4';
      ctx.fillRect(4, -24, 6, 2);
    } else if (this.enemyLevel >= 3) {
      // Mercenary Ballistic Helmet
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(0, -22, 13, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(-13, -24, 16, 4);
    } else {
      // Punk Razor Mohawk
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.moveTo(-9, -26);
      ctx.lineTo(0, -42);
      ctx.lineTo(7, -26);
      ctx.closePath();
      ctx.fill();
    }

    // Glowing Cyber Eye / Targeting Optics (Facing Left)
    ctx.fillStyle = opticColor;
    ctx.shadowColor = opticColor;
    ctx.shadowBlur = 8;
    ctx.fillRect(-13, -23, 8, 7);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-11, -21, 4, 3);
    ctx.shadowBlur = 0;
    ctx.restore(); // end head

    // 6. Front Arm & Weapon (Aiming Left)
    ctx.save();
    ctx.translate(-10, -36);
    ctx.rotate(-anim.gunArm);

    // Shoulder & Sleeve
    ctx.fillStyle = vestColor;
    ctx.beginPath();
    ctx.roundRect(-24, -5, 24, 10, 4);
    ctx.fill();
    // Arm cuff
    ctx.fillStyle = vestShade;
    ctx.fillRect(-22, -5, 4, 10);
    // Hand
    ctx.fillStyle = '#F1C2A5';
    ctx.beginPath();
    ctx.arc(-26, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Weapon SMG / Heavy Pistol
    const rx = -anim.gunRecoil;
    ctx.fillStyle = gunColor;
    ctx.fillRect(-46 + rx, -8, 22, 11);
    // Heavy Barrel Emitter
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-53 + rx, -6, 7, 7);
    // Scope / Optic Tube
    ctx.fillStyle = opticColor;
    ctx.fillRect(-43 + rx, -11, 14, 3);
    // Ammo Magazine Well
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-34 + rx, 3, 5, 7);

    // Muzzle Flash
    if (anim.isFiring) {
      this.renderMuzzleFlash(ctx, -55 + rx, -3, false, flashColor);
    }
    ctx.restore(); // end front arm

    ctx.restore(); // end torso
  }

  // Helper to draw realistic articulated leg with thigh, knee, calf, and sneaker/boot
  drawLeg(ctx, hipX, hipY, thighAngle, kneeAngle, isFront, legColor, shadeColor, shoeColor, isFacingRight = true) {
    ctx.save();
    ctx.translate(hipX, hipY);
    ctx.rotate(thighAngle);

    const dir = isFacingRight ? 1 : -1;

    // 1. Athletic Thigh (contoured silhouette)
    ctx.fillStyle = isFront ? legColor : shadeColor;
    ctx.beginPath();
    ctx.roundRect(-6.5, 0, 13, 33, [4, 4, 2, 2]);
    ctx.fill();

    // Thigh muscle contour / inner shadow
    ctx.fillStyle = shadeColor;
    ctx.fillRect(dir > 0 ? -6.5 : 2, 0, 4.5, 33);

    // 2. Knee joint & Tactical Armor Pad
    ctx.translate(0, 32);
    ctx.rotate(kneeAngle);

    // Tactical Knee Pad
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(dir > 0 ? -2 : -6, -5, 8, 9, 3);
    ctx.fill();
    ctx.fillStyle = isFacingRight ? '#38BDF8' : '#F43F5E';
    ctx.fillRect(dir > 0 ? 0 : -4, -3, 4, 5);

    // 3. Tapered Calf / Combat Shin Guard
    ctx.fillStyle = isFront ? legColor : shadeColor;
    ctx.beginPath();
    ctx.roundRect(-5.5, 0, 11, 35, [2, 2, 3, 3]);
    ctx.fill();

    // Shin shading line
    ctx.fillStyle = shadeColor;
    ctx.fillRect(dir > 0 ? -5.5 : 1.5, 2, 4, 32);

    // 4. Detailed Arcade High-Top Sneaker / Combat Boot
    ctx.translate(0, 34);

    // Sneaker Ankle Collar
    ctx.fillStyle = shoeColor;
    ctx.beginPath();
    ctx.roundRect(dir > 0 ? -6.5 : -17.5, -3, 24, 13, 3);
    ctx.fill();

    // Sneaker Tongue & Laces
    ctx.fillStyle = '#FFFFFF';
    if (dir > 0) {
      ctx.fillRect(-1, -1, 7, 2);
      ctx.fillRect(0, 2, 6, 2);
      ctx.fillRect(1, 5, 5, 2);
    } else {
      ctx.fillRect(-6, -1, 7, 2);
      ctx.fillRect(-6, 2, 6, 2);
      ctx.fillRect(-6, 5, 5, 2);
    }

    // Rubber Foxing / Outsole
    ctx.fillStyle = isFacingRight ? '#FFFFFF' : '#0F172A';
    ctx.fillRect(dir > 0 ? -7.5 : -18.5, 8, 26, 4.5);

    // Colored Tread Groove
    ctx.fillStyle = isFacingRight ? '#00F5D4' : '#E11D48';
    ctx.fillRect(dir > 0 ? -6 : -17, 10.5, 23, 2);

    // Toe Cap
    ctx.fillStyle = isFacingRight ? '#E2E8F0' : '#1E293B';
    ctx.beginPath();
    ctx.roundRect(dir > 0 ? 11 : -18.5, 5, 7.5, 6, [2, 4, 2, 0]);
    ctx.fill();

    ctx.restore();
  }

  // Visual Muzzle Flash Spark
  renderMuzzleFlash(ctx, x, y, isFacingRight = true, color = '#FFD166') {
    ctx.save();
    ctx.translate(x, y);
    const dir = isFacingRight ? 1 : -1;

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(dir * 22, -7);
    ctx.lineTo(dir * 16, 0);
    ctx.lineTo(dir * 24, 7);
    ctx.closePath();
    ctx.fill();

    // Center Hot White Core
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

window.StageRenderer = StageRenderer;
window.Fighter = Fighter;
