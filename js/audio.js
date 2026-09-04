/**
 * Type War - Procedural Web Audio 8-bit / 16-bit Synthesizer & Chiptune Engine
 * 100% self-contained, no external sound files required!
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.bgmEnabled = true;
    this.sfxEnabled = true;
    this.isBgmPlaying = false;
    this.bgmInterval = null;
    this.bgmStep = 0;
    this.bpm = 126;

    // Load saved settings
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.bgm === 'boolean') this.bgmEnabled = parsed.bgm;
        if (typeof parsed.sfx === 'boolean') this.sfxEnabled = parsed.sfx;
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage', e);
    }
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.bgmEnabled ? 0.22 : 0.0, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 0.35 : 0.0, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setBgmEnabled(val) {
    this.bgmEnabled = !!val;
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(this.bgmEnabled ? 0.22 : 0.0, this.ctx.currentTime, 0.05);
    }
    if (!this.bgmEnabled && this.isBgmPlaying) {
      this.stopBGM();
    } else if (this.bgmEnabled && !this.isBgmPlaying) {
      this.startBGM();
    }
    this.saveSettings();
  }

  setSfxEnabled(val) {
    this.sfxEnabled = !!val;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxEnabled ? 0.35 : 0.0, this.ctx.currentTime, 0.05);
    }
    this.saveSettings();
  }

  saveSettings() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify({
        bgm: this.bgmEnabled,
        sfx: this.sfxEnabled
      }));
    } catch (e) {}
  }

  // --- Chiptune Procedural Background Music ---
  // A driving 90s cyber-street arcade theme in A minor
  startBGM() {
    if (!this.bgmEnabled) return;
    this.ensureContext();
    if (!this.ctx || this.isBgmPlaying) return;

    this.isBgmPlaying = true;
    this.bgmStep = 0;
    const stepTime = (60 / this.bpm) / 4; // 16th notes

    // Bassline notes (MIDI pitch converted to freq)
    // Am -> F -> C -> G
    const bassline = [
      45, 45, 57, 45, 45, 45, 57, 45, // A2, A3
      41, 41, 53, 41, 41, 41, 53, 41, // F2, F3
      48, 48, 60, 48, 48, 48, 60, 48, // C3, C4
      43, 43, 55, 43, 47, 48, 50, 52  // G2, G3 run
    ];

    // Lead melody arpeggio notes
    const melody = [
      69, 0, 72, 76, 69, 0, 72, 79,   // A4, C5, E5, G5
      65, 0, 69, 72, 65, 0, 69, 77,   // F4, A4, C5, F5
      67, 0, 72, 76, 67, 0, 72, 74,   // G4, C5, E5, D5
      64, 67, 71, 74, 76, 74, 71, 67  // E4 arpeggio
    ];

    const noteToFreq = (m) => (m ? 440 * Math.pow(2, (m - 69) / 12) : 0);

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || this.ctx.state !== 'running') return;
      const t = this.ctx.currentTime;
      const s = this.bgmStep % 32;

      // 1. Play Bass Note (Sawtooth / low-pass)
      const bassMidi = bassline[s];
      if (bassMidi) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(noteToFreq(bassMidi), t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, t);

        gain.gain.setValueAtTime(0.32, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 1.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(t);
        osc.stop(t + stepTime * 1.9);
      }

      // 2. Play Arp / Lead (Square wave retro 8-bit)
      const melMidi = melody[s];
      if (melMidi && s % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(noteToFreq(melMidi), t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + stepTime * 1.4);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(t);
        osc.stop(t + stepTime * 1.5);
      }

      // 3. Chiptune Percussion (Hihat noise on offbeats, Snare on 4, 12, 20, 28)
      if (s % 8 === 4) {
        // Retro snare noise
        this.playChipSnare(t);
      } else if (s % 2 === 0) {
        // Subtle hihat
        this.playChipHat(t);
      }

      this.bgmStep++;
    };

    this.bgmInterval = setInterval(playStep, stepTime * 1000);
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  playChipSnare(t) {
    if (!this.ctx || !this.bgmEnabled) return;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    noise.start(t);
    noise.stop(t + 0.06);
  }

  playChipHat(t) {
    if (!this.ctx || !this.bgmEnabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(6500, t);

    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(t);
    osc.stop(t + 0.02);
  }

  // --- Sound Effects (Procedural Synthesized SFX) ---

  // 1. Correct Character Type: Crisp, non-fatiguing arcade blip
  playKeyStroke() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Random slight variation around high C/E for tactile mechanical feel
    const pitches = [523.25, 587.33, 659.25, 783.99];
    const pitch = pitches[Math.floor(Math.random() * pitches.length)];

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, t + 0.04);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // 2. Mistake / Typo: Low buzz buzz/thud
  playTypo() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // 3. Attack / Punch Whoosh & Impact
  // Sci-Fi Blaster / Laser Gunshot (Player)
  playBlasterShot() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.09);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  // Enemy Gunshot (Heavier bullet crack)
  playEnemyShot() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playAttack() {
    this.playBlasterShot();
  }

  // 4. Enemy Hit Impact
  playHitImpact() {
    if (!this.sfxEnabled || !this.ctx) return;
    const t = this.ctx.currentTime;

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 0.1);
  }

  // 5. Enemy Defeated / Round Win Explosion
  playEnemyDefeat() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Deep sub drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.35);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.4);

    // Chime arpeggio
    setTimeout(() => {
      this.playStreakBonus();
    }, 150);
  }

  // 6. Streak Milestone Chime
  playStreakBonus() {
    if (!this.sfxEnabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C

    notes.forEach((freq, idx) => {
      const startT = t + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.22, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startT);
      osc.stop(startT + 0.15);
    });
  }

  // 7. Countdown Beep (High for GO, low for 3,2,1)
  playCountdown(isGo = false) {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(isGo ? 880 : 440, t);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isGo ? 0.3 : 0.12));

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + (isGo ? 0.35 : 0.15));
  }

  // 8. Game Over Jingle
  playGameOver() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [440, 415.3, 392, 349.23]; // A, Ab, G, F (descending sad 8-bit)

    notes.forEach((freq, idx) => {
      const startT = t + idx * 0.15;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.3, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startT);
      osc.stop(startT + 0.25);
    });
  }

  // 9. Button UI Click
  playButtonClick() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.04);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }
}

window.audioManager = new AudioManager();
