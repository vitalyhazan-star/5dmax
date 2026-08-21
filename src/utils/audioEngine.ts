// Web Audio API Synthesizer Engine for 5DMAXING

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Master nodes
  private masterGain: GainNode | null = null;
  private binauralGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private noiseGain: GainNode | null = null;
  private chimesGain: GainNode | null = null;

  // Binaural nodes
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private merger: ChannelMergerNode | null = null;

  // Drone nodes
  private droneOscs: OscillatorNode[] = [];
  private droneFilter: BiquadFilterNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Cosmic Noise nodes
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;

  private isPlaying = false;

  private initContext() {
    if (this.ctx && this.ctx.state !== 'closed') return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Sub-busses
    this.binauralGain = this.ctx.createGain();
    this.binauralGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    this.binauralGain.connect(this.masterGain);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.noiseGain.connect(this.masterGain);

    this.chimesGain = this.ctx.createGain();
    this.chimesGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.chimesGain.connect(this.masterGain);

    this.isInitialized = true;
  }

  public async startSoundscape(options: {
    baseFreq?: number;
    beatFreq?: number;
    solfeggioFreq?: number;
    droneChord?: number[];
  }) {
    this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.stopSoundscape();

    const baseFreq = options.baseFreq || 216;
    const beatFreq = options.beatFreq || 10;
    const solfeggio = options.solfeggioFreq || 528;
    const droneFrequencies = options.droneChord || [solfeggio / 4, solfeggio / 2, baseFreq, baseFreq * 1.5];

    const now = this.ctx.currentTime;

    // --- 1. True Stereo Binaural Beats ---
    this.merger = this.ctx.createChannelMerger(2);

    this.leftOsc = this.ctx.createOscillator();
    this.leftOsc.type = 'sine';
    this.leftOsc.frequency.setValueAtTime(baseFreq, now);

    this.rightOsc = this.ctx.createOscillator();
    this.rightOsc.type = 'sine';
    this.rightOsc.frequency.setValueAtTime(baseFreq + beatFreq, now);

    const leftGain = this.ctx.createGain();
    const rightGain = this.ctx.createGain();
    leftGain.gain.setValueAtTime(0.5, now);
    rightGain.gain.setValueAtTime(0.5, now);

    this.leftOsc.connect(leftGain);
    this.rightOsc.connect(rightGain);

    leftGain.connect(this.merger, 0, 0); // Left ear
    rightGain.connect(this.merger, 0, 1); // Right ear

    if (this.binauralGain) {
      this.merger.connect(this.binauralGain);
    }

    this.leftOsc.start(now);
    this.rightOsc.start(now);

    // --- 2. Hypnotic Ambient 5D Drone ---
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(320, now);
    this.droneFilter.Q.setValueAtTime(3.5, now);

    // Slow LFO for cosmic breathing filter sweep
    this.lfoOsc = this.ctx.createOscillator();
    this.lfoOsc.type = 'sine';
    this.lfoOsc.frequency.setValueAtTime(0.08, now); // 12.5s period sweep

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(140, now);

    this.lfoOsc.connect(this.lfoGain);
    this.lfoGain.connect(this.droneFilter.frequency);
    this.lfoOsc.start(now);

    this.droneOscs = [];
    droneFrequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Slight detune for warm cosmic chorus
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((idx - 1.5) * 4, now);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.25 / droneFrequencies.length, now);

      osc.connect(oscGain);
      if (this.droneFilter) {
        oscGain.connect(this.droneFilter);
      }
      osc.start(now);
      this.droneOscs.push(osc);
    });

    if (this.droneGain && this.droneFilter) {
      this.droneFilter.connect(this.droneGain);
    }

    // --- 3. Cosmic Space Pink Noise Generator ---
    this.startCosmicNoise();

    this.isPlaying = true;
  }

  private startCosmicNoise() {
    if (!this.ctx || !this.noiseGain) return;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds looped
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.noiseFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseNode.start();
  }

  // Play a resonant Tibetan singing bowl chime for breath cues
  public playSingingBowl(fundamental = 528, duration = 4.5) {
    this.initContext();
    if (!this.ctx || !this.chimesGain) return;
    const now = this.ctx.currentTime;

    const harmonics = [1, 2.76, 5.4, 8.93];
    const amplitudes = [0.6, 0.3, 0.15, 0.07];

    harmonics.forEach((ratio, idx) => {
      if (!this.ctx || !this.chimesGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * ratio, now);

      const amp = amplitudes[idx];
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(amp, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.chimesGain);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    });
  }

  public setVolumes(volumes: {
    master?: number;
    binaural?: number;
    drone?: number;
    noise?: number;
    chimes?: number;
  }) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (volumes.master !== undefined && this.masterGain) {
      this.masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volumes.master)), now + 0.05);
    }
    if (volumes.binaural !== undefined && this.binauralGain) {
      this.binauralGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volumes.binaural)), now + 0.05);
    }
    if (volumes.drone !== undefined && this.droneGain) {
      this.droneGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volumes.drone)), now + 0.05);
    }
    if (volumes.noise !== undefined && this.noiseGain) {
      this.noiseGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volumes.noise)), now + 0.05);
    }
    if (volumes.chimes !== undefined && this.chimesGain) {
      this.chimesGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volumes.chimes)), now + 0.05);
    }
  }

  public stopSoundscape() {
    if (this.leftOsc) {
      try { this.leftOsc.stop(); this.leftOsc.disconnect(); } catch (e) {}
      this.leftOsc = null;
    }
    if (this.rightOsc) {
      try { this.rightOsc.stop(); this.rightOsc.disconnect(); } catch (e) {}
      this.rightOsc = null;
    }
    if (this.lfoOsc) {
      try { this.lfoOsc.stop(); this.lfoOsc.disconnect(); } catch (e) {}
      this.lfoOsc = null;
    }
    this.droneOscs.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    this.droneOscs = [];
    if (this.noiseNode) {
      try { this.noiseNode.stop(); this.noiseNode.disconnect(); } catch (e) {}
      this.noiseNode = null;
    }
    this.isPlaying = false;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }
}

export const audioEngine = new AudioEngine();
