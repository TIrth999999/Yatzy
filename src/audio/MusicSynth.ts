/**
 * Procedural Casual Background Music Synthesizer
 * Generates gentle ambient chords and pentatonic arpeggios.
 */
export class MusicSynth {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private enabled: boolean = true;
  private volume: number = 0.35;
  private intervalTimer: number | null = null;

  // Gentle C major pentatonic chord progression (C - G - Am - F)
  private chords = [
    [261.63, 329.63, 392.00, 523.25], // C
    [196.00, 293.66, 392.00, 493.88], // G
    [220.00, 261.63, 329.63, 440.00], // Am
    [174.61, 261.63, 349.23, 440.00]  // F
  ];
  private chordIndex = 0;
  private noteIndex = 0;

  public init(existingCtx?: AudioContext): void {
    if (this.ctx) return;
    this.ctx = existingCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.ctx.destination);
    this.updateVolume();
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.updateVolume();
    if (!enabled && this.isPlaying) {
      this.stop();
    } else if (enabled && !this.isPlaying) {
      this.start();
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    this.updateVolume();
  }

  private updateVolume(): void {
    if (this.musicGain && this.ctx) {
      const target = this.enabled ? this.volume * 0.3 : 0;
      this.musicGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
    }
  }

  public start(): void {
    if (this.isPlaying || !this.enabled) return;
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    this.isPlaying = true;
    this.chordIndex = 0;
    this.noteIndex = 0;

    this.scheduleNextNote();
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.intervalTimer !== null) {
      clearTimeout(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  private scheduleNextNote(): void {
    if (!this.isPlaying || !this.ctx || !this.musicGain) return;

    const currentChord = this.chords[this.chordIndex];
    const freq = currentChord[this.noteIndex];

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0.001, t);
    noteGain.gain.linearRampToValueAtTime(0.08, t + 0.1);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);

    osc.connect(noteGain);
    noteGain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.9);

    this.noteIndex++;
    if (this.noteIndex >= currentChord.length) {
      this.noteIndex = 0;
      this.chordIndex = (this.chordIndex + 1) % this.chords.length;
    }

    this.intervalTimer = window.setTimeout(() => {
      this.scheduleNextNote();
    }, 450); // Relaxed tempo
  }
}
