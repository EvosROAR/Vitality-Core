import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Activity,
  Heart,
  Music,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ActivePaceTimerProps {
  currentHeartRate: number | null;
  defaultRestSeconds?: number;
}

export default function ActivePaceTimer({
  currentHeartRate,
  defaultRestSeconds = 60,
}: ActivePaceTimerProps) {
  // Timer States
  const [restSeconds, setRestSeconds] = useState<number>(defaultRestSeconds);
  const [timeLeft, setTimeLeft] = useState<number>(defaultRestSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Metronome / Pacing States
  const [metronomeBpm, setMetronomeBpm] = useState<number>(60); // Rep pace in ticks
  const [isMetronomeActive, setIsMetronomeActive] = useState<boolean>(false);
  const [tempoPhase, setTempoPhase] = useState<"eccentric" | "pause" | "concentric" | "hold">("concentric");
  const [tempoStep, setTempoStep] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Synchronize Rest Timer
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playBeep(880, 150); // double beep at end
            setTimeout(() => playBeep(880, 150), 200);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Handle Metronome / Tempo cycle
  // Standard 4-step lifting tempo: Concentric (2s), Hold (1s), Eccentric (2s), Pause (1s)
  useEffect(() => {
    if (isMetronomeActive) {
      const intervalMs = (60 / metronomeBpm) * 1000;
      metronomeIntervalRef.current = setInterval(() => {
        setTempoStep((prev) => {
          const nextStep = prev === 4 ? 1 : prev + 1;
          
          // Set text phases based on step
          if (nextStep === 1) {
            setTempoPhase("concentric");
            playBeep(600, 50); // Medium beep
          } else if (nextStep === 2) {
            setTempoPhase("hold");
            playBeep(500, 40); // Low feedback
          } else if (nextStep === 3) {
            setTempoPhase("eccentric");
            playBeep(600, 50); // Medium beep
          } else if (nextStep === 4) {
            setTempoPhase("pause");
            playBeep(500, 40); // Low feedback
          }
          return nextStep;
        });
      }, intervalMs);
    } else {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    }
    return () => {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, [isMetronomeActive, metronomeBpm]);

  // Adjust tempo BPM slightly based on real-time wearable heart rate for athletic recovery
  useEffect(() => {
    if (currentHeartRate) {
      // If heart rate is high, slow down metronome rep cadence to encourage oxygen flow
      if (currentHeartRate > 140) {
        setMetronomeBpm(45); // Slower reps
      } else if (currentHeartRate < 100) {
        setMetronomeBpm(65); // Faster reps
      } else {
        setMetronomeBpm(55);
      }
    }
  }, [currentHeartRate]);

  // Helper sound function (Web Audio API synthesis)
  const playBeep = (frequency: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      // Exponential decay
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      console.warn("AudioContext not supported or active yet", e);
    }
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    playBeep(700, 80);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    playBeep(500, 80);
  };

  const handleResetTimer = (seconds: number) => {
    setRestSeconds(seconds);
    setTimeLeft(seconds);
    setIsTimerRunning(false);
    playBeep(600, 100);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Determine heart rate strain category
  const recoveryZone = currentHeartRate
    ? currentHeartRate > 150
      ? "Anaerobic Recovery (Prolonged rest needed)"
      : currentHeartRate > 120
      ? "Aerobic Zone (Standard rest)"
      : "Active Recovery (Optimized rest)"
    : "Standard Resting Profile";

  return (
    <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-900/80 flex flex-col gap-4 mt-3" id="active-pace-timer">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-400" />
          <span className="text-[11px] font-bold text-white uppercase tracking-wider font-display">
            Active Set Companion
          </span>
        </div>
        <button
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={`p-1.5 rounded-lg border text-xs flex items-center justify-center cursor-pointer transition-colors ${
            soundEnabled
              ? "bg-indigo-500/15 border-indigo-500/35 text-indigo-400"
              : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400"
          }`}
          title={soundEnabled ? "Mute audio cues" : "Unmute audio cues"}
          id="toggle-timer-sound"
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rest Interval countdown timer */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850/80 flex flex-col items-center justify-center gap-2.5 relative overflow-hidden">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">
            Inter-Set Rest countdown
          </span>

          <span className="text-3xl font-black text-indigo-400 font-mono tracking-wider">
            {formatTime(timeLeft)}
          </span>

          <div className="flex gap-2">
            {!isTimerRunning ? (
              <button
                onClick={handleStartTimer}
                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                id="start-rest-btn"
              >
                <Play className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handlePauseTimer}
                className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                id="pause-rest-btn"
              >
                <Pause className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={() => handleResetTimer(restSeconds)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              title="Reset timer"
              id="reset-rest-btn"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-1.5 mt-1">
            {[30, 60, 90].map((secs) => (
              <button
                key={secs}
                onClick={() => handleResetTimer(secs)}
                className={`px-2 py-1 text-[9px] font-mono font-bold rounded-md border transition-all cursor-pointer ${
                  restSeconds === secs
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                    : "bg-slate-950 text-slate-500 border-slate-900 hover:text-slate-400"
                }`}
                id={`preset-rest-${secs}`}
              >
                {secs}s
              </button>
            ))}
          </div>
        </div>

        {/* Lifting Pace Metronome & Heart Rate recovery tracker */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850/80 flex flex-col gap-2 relative">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">
              Lift Tempo Metronome
            </span>

            <button
              onClick={() => {
                setIsMetronomeActive((prev) => !prev);
                playBeep(500, 80);
              }}
              className={`px-2 py-1 text-[9px] uppercase font-bold tracking-wider rounded border cursor-pointer transition-colors ${
                isMetronomeActive
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse"
                  : "bg-slate-950 text-slate-400 border-slate-900 hover:text-slate-300"
              }`}
              id="toggle-metronome"
            >
              {isMetronomeActive ? "Running" : "Start"}
            </button>
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold">
                Recovery Cadence
              </span>
              <span className="text-sm font-black text-slate-200 mt-0.5 font-mono">
                {metronomeBpm} reps/min
              </span>
            </div>

            <AnimatePresence mode="wait">
              {isMetronomeActive ? (
                <motion.div
                  key={tempoPhase}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className={`px-2.5 py-1 text-[9px] rounded-lg font-black uppercase tracking-wider font-mono shrink-0 ${
                    tempoPhase === "concentric"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : tempoPhase === "hold"
                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                      : tempoPhase === "eccentric"
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}
                >
                  {tempoPhase}
                </motion.div>
              ) : (
                <span className="text-[9px] text-slate-600 font-bold uppercase font-mono">
                  METRONOME IDLE
                </span>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-2 text-[9px] text-slate-500 font-semibold leading-relaxed border-t border-white/5 pt-2 flex flex-col gap-0.5">
            <div className="flex justify-between items-center">
              <span>Biometric Zone:</span>
              <span className="text-slate-300 font-bold">{recoveryZone}</span>
            </div>
            {currentHeartRate && (
              <div className="flex justify-between items-center text-rose-400 font-bold">
                <span>Real-Time Pulse Sync:</span>
                <span className="flex items-center gap-1">
                  <Heart className="h-2.5 w-2.5 fill-rose-500 text-rose-500 animate-pulse" />
                  {currentHeartRate} BPM
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
