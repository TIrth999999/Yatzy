/**
 * Procedural Web Audio Sound Synthesizer
 * Generates crisp, zero-latency, zero-asset sound effects.
 */
export class SoundSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private enabled: boolean = true;
  private volume: number = 0.8;

  public init(): void {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateVolume();
    }
  }

  public ensureContext(): void {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.updateVolume();
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    this.updateVolume();
  }

  private updateVolume(): void {
    if (this.sfxGain && this.ctx) {
      const target = this.enabled ? this.volume : 0;
      this.sfxGain.gain.setValueAtTime(target, this.ctx.currentTime);
    }
  }

  /**
   * Generates a burst of filtered white noise for acoustic dice rattle
   */
  private createNoiseBuffer(duration: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Sound: Dice Roll (rattle / shake)
   */
  public playDiceRoll(): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const noiseBuffer = this.createNoiseBuffer(0.25);
    if (!noiseBuffer) return;

    // Rattle burst
    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.25);
    filter.Q.setValueAtTime(3, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noiseNode.start(t);
    noiseNode.stop(t + 0.25);
  }

  /**
   * Sound: Dice Land (wooden clatter knock)
   */
  public playDiceLand(pitchMultiplier: number = 1.0): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Wood knock harmonic
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320 * pitchMultiplier, t);
    osc.frequency.exponentialRampToValueAtTime(110 * pitchMultiplier, t + 0.08);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Sound: Die Held (crisp tactile pop)
   */
  public playDieHold(): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.07);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  /**
   * Sound: Die Released (tactile descending release)
   */
  public playDieRelease(): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(350, t + 0.06);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  /**
   * Sound: Button click / UI tap
   */
  public playButtonClick(): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, t);
    osc.frequency.exponentialRampToValueAtTime(290, t + 0.04);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * Sound: Category hover / selection preview
   */
  public playCategoryHover(): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, t); // C5

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Sound: Score committed (pleasant two-tone lock chime)
   */
  public playScoreCommitted(): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25]; // C5, E5
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.07;
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  /**
   * Sound: Bonus achieved (+35 Upper Bonus chime fanfare)
   */
  public playBonusAchieved(): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.09;
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  /**
   * Sound: Yatzy Achieved! (grand celebration fanfare)
   */
  public playYatzy(): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major extended
    chord.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.06;
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.7);
    });
  }

  /**
   * Sound: Match Victory
   */
  public playVictory(): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const melody = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.5, d: 0.35 }
    ];

    let offset = 0;
    melody.forEach(note => {
      const t = this.ctx!.currentTime + offset;
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, t);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + note.d);
      offset += note.d * 0.9;
    });
  }

  /**
   * Sound: Match Defeat
   */
  public playDefeat(): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const melody = [
      { f: 440.00, d: 0.18 },
      { f: 415.30, d: 0.18 },
      { f: 392.00, d: 0.35 }
    ];

    let offset = 0;
    melody.forEach(note => {
      const t = this.ctx!.currentTime + offset;
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, t);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + note.d);
      offset += note.d * 0.95;
    });
  }

  /**
   * Sound: Match Draw
   */
  public playDraw(): void {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [440, 554.37, 440];
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.14;
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.2);
    });
  }
}
