/**
 * High-Fidelity Procedural Sound Engine for FedCausalFreshNet Showcase
 * Uses Web Audio API without requiring external audio asset files.
 */

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Audio context will be activated on first user interaction
    const initAudio = () => {
      this.init();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };

    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
  }

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.isInitialized = true;

      // Master FX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);

      // Start gentle ambient hum (micro-climate airflow drone)
      this.startAmbientHum();
    } catch (e) {
      console.warn('Web Audio init skipped:', e);
    }
  }

  private startAmbientHum() {
    if (!this.ctx || !this.sfxGain) return;

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, this.ctx.currentTime);

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low 55Hz soothing drone

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      osc.start();
    } catch (e) {
      // Ignore background audio autoplay issues
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public playTransitionChime(index: number = 0) {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [220, 261.63, 329.63, 392, 440, 523.25, 659.25, 783.99]; // Pentatonic scale
      const freq = notes[index % notes.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch (e) {}
  }

  public playCausalLiftPulse() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      // Uplifting arpeggio: C5, E5, G5, C6
      const freqs = [523.25, 659.25, 783.99, 1046.50];

      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const noteTime = now + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.15, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(noteTime);
        osc.stop(noteTime + 0.32);
      });
    } catch (e) {}
  }

  public playFederatedPulse() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(440, now);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  public playWarningAlert() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(260, now + 0.1);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  public playCameraShutter() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      // 1. Mechanical Shutter Click (Short white noise burst with rapid decay)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.008));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, now);
      noise.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(now);

      // 2. High-Tech Confirmation Chime (1200Hz -> 1800Hz digital chirp)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now + 0.03);
      osc.frequency.exponentialRampToValueAtTime(1750, now + 0.12);
      gain.gain.setValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + 0.03);
      osc.stop(now + 0.24);
    } catch (e) {}
  }

  /**
   * Chapter 07: High-Definition Procedural Apple Crunch Sound Effect
   * Synthesizes crisp cellular fracture, secondary tooth crunch, and juicy resonance pop.
   */
  public playAppleCrunchSound() {
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Initial High-Frequency Cellular Fracture (Sharp crisp crack)
      const crackBufSize = Math.floor(this.ctx.sampleRate * 0.06);
      const crackBuf = this.ctx.createBuffer(1, crackBufSize, this.ctx.sampleRate);
      const crackData = crackBuf.getChannelData(0);
      for (let i = 0; i < crackBufSize; i++) {
        crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.012));
      }
      const crackSource = this.ctx.createBufferSource();
      crackSource.buffer = crackBuf;

      const crackFilter = this.ctx.createBiquadFilter();
      crackFilter.type = 'bandpass';
      crackFilter.frequency.setValueAtTime(3600, now);
      crackFilter.Q.setValueAtTime(3.5, now);

      const crackGain = this.ctx.createGain();
      crackGain.gain.setValueAtTime(0.45, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      crackSource.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(this.sfxGain);
      crackSource.start(now);

      // 2. Secondary Tooth Crunch & Crush (Lower crunchy body)
      const crunchBufSize = Math.floor(this.ctx.sampleRate * 0.14);
      const crunchBuf = this.ctx.createBuffer(1, crunchBufSize, this.ctx.sampleRate);
      const crunchData = crunchBuf.getChannelData(0);
      for (let i = 0; i < crunchBufSize; i++) {
        const env = Math.sin((i / crunchBufSize) * Math.PI) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
        crunchData[i] = (Math.random() * 2 - 1) * env;
      }
      const crunchSource = this.ctx.createBufferSource();
      crunchSource.buffer = crunchBuf;

      const crunchFilter = this.ctx.createBiquadFilter();
      crunchFilter.type = 'bandpass';
      crunchFilter.frequency.setValueAtTime(2200, now + 0.02);
      crunchFilter.Q.setValueAtTime(2.0, now + 0.02);

      const crunchGain = this.ctx.createGain();
      crunchGain.gain.setValueAtTime(0.38, now + 0.02);
      crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      crunchSource.connect(crunchFilter);
      crunchFilter.connect(crunchGain);
      crunchGain.connect(this.sfxGain);
      crunchSource.start(now + 0.02);

      // 3. Juicy Cavity Resonance Pop (Low-frequency tooth impact)
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = 'triangle';
      popOsc.frequency.setValueAtTime(380, now);
      popOsc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

      popGain.gain.setValueAtTime(0.28, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      popOsc.connect(popGain);
      popGain.connect(this.sfxGain);
      popOsc.start(now);
      popOsc.stop(now + 0.1);
    } catch (e) {
      console.warn('Apple crunch sound synthesis error:', e);
    }
  }
}

