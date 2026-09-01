// Web Audio API Focus Sound Generator & Haptic Audio Feedback

class SoundManager {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isNoisePlaying = false;
  private muted = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopNoise();
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  // Soft modern completion chime
  playCompletionChime() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Major Chord)
      freqs.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        
        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 1.2);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 1.25);
      });
    } catch (e) {
      console.warn('Audio not supported or blocked', e);
    }
  }

  // Micro haptic click for UI interactions
  playClick() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      // ignore
    }
  }

  // Success / Level up unlock chime
  playLevelUp() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      freqs.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0.01, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.65);
      });
    } catch (e) {
      // ignore
    }
  }

  // Subtle error buzz
  playError() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {
      // ignore
    }
  }

  // 40Hz Gamma Focus Tone (Binaural Focus for Deep Work)
  startGammaFocus(volume = 0.08) {
    if (this.muted) return;
    try {
      this.stopNoise();
      this.initContext();
      if (!this.ctx) return;

      const baseFreq = 200; // 200 Hz Carrier
      const beatFreq = 40;  // 40 Hz Gamma wave

      // Left oscillator (200 Hz)
      const oscL = this.ctx.createOscillator();
      oscL.type = 'sine';
      oscL.frequency.value = baseFreq;

      // Right oscillator (240 Hz) -> 40Hz beat difference
      const oscR = this.ctx.createOscillator();
      oscR.type = 'sine';
      oscR.frequency.value = baseFreq + beatFreq;

      // Stereo panner / merger
      const merger = this.ctx.createChannelMerger(2);
      oscL.connect(merger, 0, 0); // left
      oscR.connect(merger, 0, 1); // right

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.5);

      merger.connect(gain);
      gain.connect(this.ctx.destination);

      oscL.start();
      oscR.start();

      this.gainNode = gain;
      this.noiseNode = merger;
      this.isNoisePlaying = true;
    } catch (e) {
      console.warn('Gamma focus audio error', e);
    }
  }

  // Pink / Brown Deep Focus Noise
  startBrownNoise(volume = 0.08) {
    if (this.muted) return;
    try {
      this.stopNoise();
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain compensation
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400; // Deep rumble warm tone

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.5);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();

      this.gainNode = gain;
      this.noiseNode = whiteNoise;
      this.isNoisePlaying = true;
    } catch (e) {
      console.warn('Brown noise error', e);
    }
  }

  stopNoise() {
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          if (this.noiseNode) {
            (this.noiseNode as unknown as { stop?: () => void }).stop?.();
            this.noiseNode.disconnect();
            this.noiseNode = null;
          }
          this.gainNode = null;
          this.isNoisePlaying = false;
        }, 500);
      } catch (e) {
        this.isNoisePlaying = false;
      }
    }
  }

  isPlaying() {
    return this.isNoisePlaying;
  }
}

export const soundManager = new SoundManager();
