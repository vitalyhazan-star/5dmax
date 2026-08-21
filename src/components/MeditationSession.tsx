import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sliders,
  Sparkles,
  X,
  Layers,
  Wind,
  Radio,
  Eye,
  EyeOff,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { Protocol, VisualizerType, AudioMixerState } from '../types';
import { VisualizerCanvas } from './visualizers/VisualizerCanvas';
import { BreathingGuide } from './BreathingGuide';
import { BREATHING_PATTERNS, BINAURAL_PRESETS } from '../data/protocols';
import { audioEngine } from '../utils/audioEngine';

interface MeditationSessionProps {
  protocol: Protocol;
  durationMinutes: number;
  initialFrequency: number;
  onComplete: (actualDurationSec: number) => void;
  onExit: () => void;
}

export const MeditationSession: React.FC<MeditationSessionProps> = ({
  protocol,
  durationMinutes,
  initialFrequency,
  onComplete,
  onExit,
}) => {
  const totalSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [breathScale, setBreathScale] = useState<number>(0.5);
  const [currentVisualizer, setCurrentVisualizer] = useState<VisualizerType>(protocol.visualizer);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [showMixer, setShowMixer] = useState<boolean>(false);
  const [showGuidance, setShowGuidance] = useState<boolean>(true);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isTTSPlaying, setIsTTSPlaying] = useState<boolean>(false);

  // Audio Mixer State
  const [mixer, setMixer] = useState<AudioMixerState>({
    masterVolume: 0.75,
    binauralVolume: 0.5,
    droneVolume: 0.6,
    pinkNoiseVolume: 0.25,
    chimesVolume: 0.6,
    isMuted: false,
  });

  const selectedBreathing = BREATHING_PATTERNS.find(b => b.id === protocol.breathingId) || BREATHING_PATTERNS[0];
  const selectedPreset = BINAURAL_PRESETS.find(p => p.id === protocol.soundPresetId) || BINAURAL_PRESETS[0];

  // Session progression intensity (0 to 1)
  const progressRatio = Math.max(0, Math.min(1, 1 - secondsRemaining / totalSeconds));

  // Audio start on mount
  useEffect(() => {
    audioEngine.startSoundscape({
      baseFreq: selectedPreset.baseFreq,
      beatFreq: selectedPreset.beatFreq,
      solfeggioFreq: selectedPreset.solfeggioFreq,
      droneChord: selectedPreset.droneChord,
    });

    audioEngine.setVolumes({
      master: mixer.masterVolume,
      binaural: mixer.binauralVolume,
      drone: mixer.droneVolume,
      noise: mixer.pinkNoiseVolume,
      chimes: mixer.chimesVolume,
    });

    return () => {
      audioEngine.stopSoundscape();
    };
  }, [selectedPreset]);

  // Handle Mute & Volume Changes
  useEffect(() => {
    if (mixer.isMuted) {
      audioEngine.setVolumes({ master: 0 });
    } else {
      audioEngine.setVolumes({
        master: mixer.masterVolume,
        binaural: mixer.binauralVolume,
        drone: mixer.droneVolume,
        noise: mixer.pinkNoiseVolume,
        chimes: mixer.chimesVolume,
      });
    }
  }, [mixer]);

  // Main Timer Loop
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(totalSeconds);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, totalSeconds, onComplete]);

  // Rotate guidance steps smoothly over time
  useEffect(() => {
    if (!protocol.guidanceSteps || protocol.guidanceSteps.length === 0) return;
    const intervalSec = Math.max(15, Math.floor(totalSeconds / protocol.guidanceSteps.length));
    const stepTimer = setInterval(() => {
      setCurrentStepIdx(prev => (prev + 1) % protocol.guidanceSteps.length);
    }, intervalSec * 1000);

    return () => clearInterval(stepTimer);
  }, [protocol, totalSeconds]);

  // Play TTS voice prompt for current guidance step
  const handlePlayVoice = async () => {
    const textToSpeak = protocol.guidanceSteps[currentStepIdx] || protocol.affirmation;
    setIsTTSPlaying(true);

    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, voiceName: 'Kore' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const binary = atob(data.audio);
          const array = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const tempCtx = new AudioCtx({ sampleRate: 24000 });
          // Convert 16-bit PCM to AudioBuffer
          const int16Array = new Int16Array(array.buffer);
          const float32Array = new Float32Array(int16Array.length);
          for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
          }
          const audioBuffer = tempCtx.createBuffer(1, float32Array.length, 24000);
          audioBuffer.copyToChannel(float32Array, 0);

          const source = tempCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(tempCtx.destination);
          source.onended = () => setIsTTSPlaying(false);
          source.start();
          return;
        }
      }
    } catch (e) {
      console.warn('Backend TTS failed, using browser SpeechSynthesis fallback', e);
    }

    // Fallback: Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.88;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsTTSPlaying(false);
      utterance.onerror = () => setIsTTSPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsTTSPlaying(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinishEarly = () => {
    const elapsed = totalSeconds - secondsRemaining;
    onComplete(Math.max(10, elapsed));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030008] text-white flex flex-col justify-between overflow-hidden select-none">
      {/* 1. Fullscreen Canvas Visualizer */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <VisualizerCanvas
          type={currentVisualizer}
          breathScale={breathScale}
          intensity={progressRatio}
          speedMultiplier={isPaused ? 0.2 : 1.0}
        />
        {/* Subtle chromatic dark vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#030008]/20 to-[#030008]/85 pointer-events-none" />
      </div>

      {/* 2. Top Header Bar */}
      <header
        className={`relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 transition-opacity duration-300 ${
          isZenMode ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        }`}
      >
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl bg-black/40 border border-white/10 hover:border-red-500/50 hover:bg-red-950/40 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Прервать сессию"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400">
                ПРОТОКОЛ {protocol.number}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                // {selectedPreset.targetWave} {selectedPreset.beatFreq}Hz
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-display font-bold text-white tracking-wide">
              {protocol.title}
            </h1>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Visualizer Selector Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs font-mono hover:border-purple-400 text-slate-200 transition-all cursor-pointer">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span className="capitalize">{currentVisualizer.replace('_', ' ')}</span>
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover:flex flex-col gap-1 w-44 p-1.5 rounded-xl bg-[#090417]/95 border border-purple-500/30 backdrop-blur-xl shadow-2xl z-30">
              {(['tesseract', 'mandala', 'hyperspace', 'quantum_flow', 'torus'] as VisualizerType[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setCurrentVisualizer(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono text-left transition-all ${
                    currentVisualizer === v
                      ? 'bg-purple-600/60 text-white font-bold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {v === 'tesseract' && '5D Гиперкуб'}
                  {v === 'mandala' && 'Сакральная Мандала'}
                  {v === 'hyperspace' && 'Варп-Туннель'}
                  {v === 'quantum_flow' && 'Квантовые Ленты'}
                  {v === 'torus' && 'Тороидальное Поле'}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Mixer Button */}
          <button
            onClick={() => setShowMixer(!showMixer)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showMixer
                ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                : 'bg-black/40 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Микшер частот и бинауральных волн"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Zen Mode Toggle */}
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            className="p-2 rounded-xl bg-black/40 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isZenMode ? 'Показать интерфейс' : 'Zen-режим (скрыть всё)'}
          >
            {isZenMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-black/40 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Во весь экран"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Center HUD: Breathing & Singularity Dial */}
      <main
        className={`relative z-10 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ${
          isZenMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <BreathingGuide
          pattern={selectedBreathing}
          isActive={!isPaused}
          onScaleChange={setBreathScale}
          enableAudioChimes={mixer.chimesVolume > 0 && !mixer.isMuted}
        />

        {/* Live Guidance Prompt with Audio Voice */}
        {showGuidance && protocol.guidanceSteps && protocol.guidanceSteps.length > 0 && (
          <div className="mt-6 max-w-lg w-full text-center px-4 py-3 rounded-2xl bg-black/60 border border-purple-500/20 backdrop-blur-xl animate-fade-in shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">
                Шаг {currentStepIdx + 1}/{protocol.guidanceSteps.length} // Настройка сознания
              </span>
              <button
                onClick={handlePlayVoice}
                disabled={isTTSPlaying}
                className="p-1 rounded-md bg-white/10 hover:bg-cyan-500/30 text-cyan-300 transition-all cursor-pointer"
                title="Озвучить голосом Gemini 5D"
              >
                <Headphones className={`w-3.5 h-3.5 ${isTTSPlaying ? 'animate-pulse text-yellow-300' : ''}`} />
              </button>
            </div>
            <p className="text-sm sm:text-base font-body text-slate-200 leading-relaxed">
              "{protocol.guidanceSteps[currentStepIdx]}"
            </p>
          </div>
        )}
      </main>

      {/* 4. Bottom Controls HUD */}
      <footer
        className={`relative z-20 flex flex-col items-center gap-3 px-4 sm:px-8 py-4 transition-opacity duration-300 ${
          isZenMode ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        }`}
      >
        {/* Progress Bar with Frequency Resonance */}
        <div className="w-full max-w-xl flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Осталось:</span>
              <span className="text-base font-display font-bold text-white tabular-nums">
                {formatTime(secondsRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Частотная плотность: {Math.round(initialFrequency + progressRatio * (protocol.targetHz - initialFrequency))} Hz</span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
              style={{ width: `${progressRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMixer(m => ({ ...m, isMuted: !m.isMuted }))}
            className="p-3 rounded-full bg-black/50 border border-white/15 text-slate-300 hover:text-white hover:border-cyan-400 transition-all cursor-pointer"
            title={mixer.isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {mixer.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-4 rounded-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] hover:scale-105 transition-all cursor-pointer"
            title={isPaused ? 'Продолжить сессию' : 'Пауза'}
          >
            {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6" />}
          </button>

          <button
            onClick={handleFinishEarly}
            className="px-4 py-2 rounded-full bg-black/50 border border-white/15 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white hover:border-emerald-500 hover:bg-emerald-950/40 transition-all cursor-pointer"
            title="Зафиксировать результаты и завершить"
          >
            Завершить
          </button>
        </div>
      </footer>

      {/* 5. Soundscape Mixer Drawer Modal */}
      {showMixer && (
        <div className="fixed right-4 bottom-20 z-40 w-80 sm:w-96 rounded-2xl border border-purple-500/30 bg-[#090417]/95 p-5 shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-display font-bold text-white tracking-wide">
                5D Аудио-Синтезатор
              </h3>
            </div>
            <button
              onClick={() => setShowMixer(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Master Volume */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Общая громкость</span>
                <span>{Math.round(mixer.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={mixer.masterVolume}
                onChange={e => setMixer(m => ({ ...m, masterVolume: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Binaural Beat Volume */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  Бинауральный ритм ({selectedPreset.targetWave} {selectedPreset.beatFreq} Hz)
                </span>
                <span>{Math.round(mixer.binauralVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={mixer.binauralVolume}
                onChange={e => setMixer(m => ({ ...m, binauralVolume: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            {/* Ambient Drone Volume */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-pink-400" />
                  Космический 5D-Дрон
                </span>
                <span>{Math.round(mixer.droneVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={mixer.droneVolume}
                onChange={e => setMixer(m => ({ ...m, droneVolume: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-400"
              />
            </div>

            {/* Cosmic Noise Volume */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  Розовый шум космоса
                </span>
                <span>{Math.round(mixer.pinkNoiseVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={mixer.pinkNoiseVolume}
                onChange={e => setMixer(m => ({ ...m, pinkNoiseVolume: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Sing Bowl Chimes Volume */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Тибетские колокола дыхания
                </span>
                <span>{Math.round(mixer.chimesVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={mixer.chimesVolume}
                onChange={e => setMixer(m => ({ ...m, chimesVolume: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
