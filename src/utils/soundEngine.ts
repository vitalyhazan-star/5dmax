// Web Audio API engine for real-time Solfeggio tones, binaural beats, and ambient noise

class SoundEngine {
  private ctx: AudioContext | null = null;
  private primaryOsc: OscillatorNode | null = null;
  private binauralLeftOsc: OscillatorNode | null = null;
  private binauralRightOsc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playSolfeggioTone(freqHz: number, volume: number = 0.4) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.stop();

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + 1.2);
      this.gainNode.connect(this.ctx.destination);

      this.primaryOsc = this.ctx.createOscillator();
      this.primaryOsc.type = 'sine';
      this.primaryOsc.frequency.setValueAtTime(freqHz, this.ctx.currentTime);
      this.primaryOsc.connect(this.gainNode);

      this.primaryOsc.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio playback not permitted or failed', e);
    }
  }

  public playBinaural(baseFreq: number, beatFreq: number, volume: number = 0.3) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.stop();

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + 1.2);
      this.gainNode.connect(this.ctx.destination);

      // Stereo splitter / panner
      const merger = this.ctx.createChannelMerger(2);

      this.binauralLeftOsc = this.ctx.createOscillator();
      this.binauralLeftOsc.type = 'sine';
      this.binauralLeftOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      this.binauralRightOsc = this.ctx.createOscillator();
      this.binauralRightOsc.type = 'sine';
      this.binauralRightOsc.frequency.setValueAtTime(baseFreq + beatFreq, this.ctx.currentTime);

      this.binauralLeftOsc.connect(merger, 0, 0);
      this.binauralRightOsc.connect(merger, 0, 1);

      merger.connect(this.gainNode);

      this.binauralLeftOsc.start();
      this.binauralRightOsc.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn('Binaural audio error', e);
    }
  }

  public stop() {
    try {
      if (this.gainNode && this.ctx) {
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      }

      setTimeout(() => {
        if (this.primaryOsc) {
          try { this.primaryOsc.stop(); this.primaryOsc.disconnect(); } catch (e) {}
          this.primaryOsc = null;
        }
        if (this.binauralLeftOsc) {
          try { this.binauralLeftOsc.stop(); this.binauralLeftOsc.disconnect(); } catch (e) {}
          this.binauralLeftOsc = null;
        }
        if (this.binauralRightOsc) {
          try { this.binauralRightOsc.stop(); this.binauralRightOsc.disconnect(); } catch (e) {}
          this.binauralRightOsc = null;
        }
        this.isPlaying = false;
      }, 350);
    } catch (e) {
      this.isPlaying = false;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const soundEngine = new SoundEngine();
