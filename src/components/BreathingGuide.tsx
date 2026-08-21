import React, { useEffect, useState, useRef } from 'react';
import { BreathingPattern } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface BreathingGuideProps {
  pattern: BreathingPattern;
  isActive: boolean;
  onScaleChange?: (scale: number) => void;
  enableAudioChimes?: boolean;
  enableHaptics?: boolean;
}

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

export const BreathingGuide: React.FC<BreathingGuideProps> = ({
  pattern,
  isActive,
  onScaleChange,
  enableAudioChimes = true,
  enableHaptics = true,
}) => {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState<number>(pattern.inhale);
  const [progress, setProgress] = useState<number>(0);

  const phaseRef = useRef<BreathPhase>('inhale');
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const currentDurationRef = useRef<number>(pattern.inhale);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('inhale');
      phaseRef.current = 'inhale';
      setSecondsLeft(pattern.inhale);
      setProgress(0);
      onScaleChange?.(0.5);
      return;
    }

    startTimeRef.current = Date.now();
    currentDurationRef.current = pattern.inhale;
    setSecondsLeft(pattern.inhale);

    if (enableAudioChimes) {
      audioEngine.playSingingBowl(528, 3.5);
    }
    if (enableHaptics && navigator.vibrate) {
      navigator.vibrate(50);
    }

    const interval = 50; // update 20 times a sec for butter-smooth visual ring
    timerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const duration = currentDurationRef.current;
      const remaining = Math.max(0, Math.ceil(duration - elapsed));
      setSecondsLeft(remaining);

      const ratio = Math.min(1, elapsed / duration);
      setProgress(ratio);

      // Compute continuous breath scale (0 to 1)
      let scale = 0.5;
      const curPhase = phaseRef.current;

      if (curPhase === 'inhale') {
        // Ease in-out from 0 to 1
        scale = 0.5 - 0.5 * Math.cos(ratio * Math.PI);
      } else if (curPhase === 'hold1') {
        scale = 1.0;
      } else if (curPhase === 'exhale') {
        // Ease in-out from 1 to 0
        scale = 0.5 + 0.5 * Math.cos(ratio * Math.PI);
      } else if (curPhase === 'hold2') {
        scale = 0.0;
      }

      onScaleChange?.(scale);

      // Transition to next phase
      if (elapsed >= duration) {
        let nextPhase: BreathPhase = 'inhale';
        let nextDur = pattern.inhale;

        if (curPhase === 'inhale') {
          if (pattern.hold1 > 0) {
            nextPhase = 'hold1';
            nextDur = pattern.hold1;
          } else {
            nextPhase = 'exhale';
            nextDur = pattern.exhale;
          }
        } else if (curPhase === 'hold1') {
          nextPhase = 'exhale';
          nextDur = pattern.exhale;
        } else if (curPhase === 'exhale') {
          if (pattern.hold2 > 0) {
            nextPhase = 'hold2';
            nextDur = pattern.hold2;
          } else {
            nextPhase = 'inhale';
            nextDur = pattern.inhale;
          }
        } else if (curPhase === 'hold2') {
          nextPhase = 'inhale';
          nextDur = pattern.inhale;
        }

        phaseRef.current = nextPhase;
        setPhase(nextPhase);
        currentDurationRef.current = nextDur;
        startTimeRef.current = Date.now();

        // Audio & Haptic cues
        if (enableAudioChimes) {
          const chimeFreq = nextPhase === 'inhale' ? 528 : nextPhase === 'exhale' ? 432 : 639;
          audioEngine.playSingingBowl(chimeFreq, 3.0);
        }
        if (enableHaptics && navigator.vibrate) {
          navigator.vibrate(nextPhase === 'inhale' ? [40, 30, 40] : 40);
        }
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, pattern, enableAudioChimes, enableHaptics, onScaleChange]);

  const getPhaseMeta = () => {
    switch (phase) {
      case 'inhale':
        return {
          title: 'Вдох',
          subtitle: 'Насыщение праной & расширение поля',
          color: 'from-cyan-400 to-blue-500',
          textColor: 'text-cyan-400',
          borderColor: 'border-cyan-500/50',
          glow: 'glow-cyan',
        };
      case 'hold1':
        return {
          title: 'Задержка',
          subtitle: 'Фиксация в сингулярности сознания',
          color: 'from-purple-400 to-fuchsia-500',
          textColor: 'text-fuchsia-400',
          borderColor: 'border-fuchsia-500/50',
          glow: 'glow-purple',
        };
      case 'exhale':
        return {
          title: 'Выдох',
          subtitle: 'Сброс 3D-шума & растворение зажимов',
          color: 'from-pink-500 to-rose-500',
          textColor: 'text-pink-400',
          borderColor: 'border-pink-500/50',
          glow: 'glow-magenta',
        };
      case 'hold2':
        return {
          title: 'Пауза',
          subtitle: 'Нулевая точка квантового покоя',
          color: 'from-amber-400 to-yellow-500',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/50',
          glow: 'glow-gold',
        };
    }
  };

  const meta = getPhaseMeta();

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Outer Pulse Indicator */}
      <div className="relative flex items-center justify-center">
        {/* Glow Ring */}
        <div
          className={`absolute rounded-full transition-all duration-300 blur-md opacity-75 bg-gradient-to-r ${meta.color}`}
          style={{
            width: `${120 + progress * 40}px`,
            height: `${120 + progress * 40}px`,
          }}
        />

        {/* Central HUD Dial */}
        <div
          className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-white/20 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-2 shadow-2xl transition-all duration-300 ${meta.glow}`}
        >
          <span className={`text-xs uppercase tracking-widest font-mono font-bold ${meta.textColor}`}>
            {meta.title}
          </span>
          <span className="text-3xl sm:text-4xl font-display font-black text-white my-0.5 tabular-nums">
            {secondsLeft}s
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {pattern.name.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Instructional Subtitle */}
      <div className="mt-3 text-center">
        <p className={`text-sm font-medium transition-colors duration-300 ${meta.textColor}`}>
          {meta.subtitle}
        </p>
        <p className="text-xs text-slate-400 mt-0.5 font-mono">
          {pattern.ratioLabel}
        </p>
      </div>
    </div>
  );
};
