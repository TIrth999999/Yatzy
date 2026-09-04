/**
 * Type War - Lightweight Retro Pixel Particle Engine, Screen Shake & Bullet Projectiles
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.bullets = [];
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
  }

  triggerShake(intensity = 6) {
    this.shakeIntensity = Math.min(this.shakeIntensity + intensity, 16);
  }

  getShakeOffset() {
    if (this.shakeIntensity <= 0.2) {
      this.shakeIntensity = 0;
      return { x: 0, y: 0 };
    }
    const x = (Math.random() * 2 - 1) * this.shakeIntensity;
    const y = (Math.random() * 2 - 1) * this.shakeIntensity;
    this.shakeIntensity *= this.shakeDecay;
    return { x, y };
  }

  // Active Bullet / Laser Projectile
  spawnBullet(fromX, fromY, targetX, targetY, isPlayer = true, color = '#FFD166') {
    const dx = targetX - fromX;
    const dy = targetY - fromY;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = 750; // Fast laser velocity

    this.bullets.push({
      x: fromX,
      y: fromY,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      targetX: targetX,
      targetY: targetY,
      isPlayer: isPlayer,
      color: color,
      life: 0.45
    });
  }

  // Hit sparks when attack lands
  spawnHitSparks(x, y, count = 16, color = '#FFD166') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 5.0;
      this.particles.push({
        x: x + (Math.random() * 10 - 5),
        y: y + (Math.random() * 10 - 5),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.floor(Math.random() * 3) + 3,
        color: Math.random() > 0.3 ? color : '#FF8C00',
        life: 1.0,
        decay: 0.03 + Math.random() * 0.04,
        gravity: 0.15
      });
    }
  }

  // Red damage burst on typo
  spawnTypoBurst(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3,
        color: '#E84855',
        life: 1.0,
        decay: 0.05,
        gravity: 0.1
      });
    }
  }

  // Healing sparkles for streak HP restoration
  spawnHealingSparkles(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 3.0;
      this.particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y + (Math.random() * 30 - 15),
        vx: Math.cos(angle) * speed * 0.5,
        vy: -Math.abs(Math.sin(angle) * speed) - 1.2,
        size: Math.floor(Math.random() * 3) + 3,
        color: Math.random() > 0.3 ? '#62D26F' : '#4FD1C5',
        life: 1.0,
        decay: 0.025,
        gravity: -0.05
      });
    }
  }

  // Dramatic pixel explosion on enemy KO
  spawnDefeatExplosion(x, y) {
    const colors = ['#9D4EDD', '#FF007F', '#4FD1C5', '#FFD166', '#FFFFFF'];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.0 + Math.random() * 7.0;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        size: Math.floor(Math.random() * 4) + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.02 + Math.random() * 0.025,
        gravity: 0.2
      });
    }
  }

  // Floating text like "+120", "-5 HP"
  addFloatingText(text, x, y, color = '#FFD166', size = 16) {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      vy: -1.8,
      color: color,
      size: size,
      life: 1.0,
      decay: 0.022
    });
  }

  update(dt = 0.016) {
    // Update active bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      // Check arrival at target
      const dx = b.targetX - b.x;
      const arrived = (b.isPlayer && dx <= 10) || (!b.isPlayer && dx >= -10) || (b.life <= 0);

      if (arrived) {
        this.spawnHitSparks(b.targetX, b.targetY, 8, b.color);
        this.bullets.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.life -= t.decay;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  render(ctx) {
    // Render glowing laser bullets
    for (let i = 0; i < this.bullets.length; i++) {
      const b = this.bullets[i];
      ctx.save();
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      // Laser projectile capsule
      const len = 18;
      const w = 4;
      if (b.isPlayer) {
        ctx.fillRect(Math.floor(b.x - len), Math.floor(b.y - w / 2), len, w);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(Math.floor(b.x - 4), Math.floor(b.y - w / 2), 4, w);
      } else {
        ctx.fillRect(Math.floor(b.x), Math.floor(b.y - w / 2), len, w);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(Math.floor(b.x), Math.floor(b.y - w / 2), 4, w);
      }
      ctx.restore();
    }

    // Render square retro particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }

    // Render floating arcade texts
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "Courier New", monospace';
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const t = this.floatingTexts[i];
      ctx.globalAlpha = Math.max(0, t.life);

      ctx.fillStyle = '#000000';
      ctx.fillText(t.text, Math.floor(t.x) + 2, Math.floor(t.y) + 2);

      ctx.fillStyle = t.color;
      ctx.fillText(t.text, Math.floor(t.x), Math.floor(t.y));
    }
    ctx.globalAlpha = 1.0;
  }

  clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.bullets = [];
    this.shakeIntensity = 0;
  }
}

window.particleSystem = new ParticleSystem();
