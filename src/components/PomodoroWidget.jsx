import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { useTracker } from '../TrackerContext';
import { WAJIB_SUBJECTS } from '../TrackerContext';
import Swal from 'sweetalert2';
import { ArrowLeft, Play, Pause, RotateCcw, ArrowRightLeft, Timer, Coffee, BookOpen } from 'lucide-react';

export default function PomodoroWidget({ onBack }) {
  const { theme } = useTheme();
  const { activeOptionalSubjects } = useTracker();
  const isDark = theme === 'dark';

  // All available subjects for focus selector
  const allSubjects = [...WAJIB_SUBJECTS, ...activeOptionalSubjects];

  // State
  const [focusSubject, setFocusSubject] = useState(allSubjects[0] || '');
  const [studyMinutes, setStudyMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [isStudying, setIsStudying] = useState(true); // true = study session, false = break
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(studyMinutes * 60);

  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Reset timer when duration inputs change (only if not active)
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(isStudying ? studyMinutes * 60 : breakMinutes * 60);
    }
  }, [studyMinutes, breakMinutes, isStudying, isActive]);

  // Browser title sync
  useEffect(() => {
    if (isActive && !isPaused) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      const mm = String(mins).padStart(2, '0');
      const ss = String(secs).padStart(2, '0');
      document.title = `[${mm}:${ss}] Pomodoro - WhyStudy`;
    } else {
      document.title = 'WhyStudy';
    }
    return () => {
      document.title = 'WhyStudy';
    };
  }, [isActive, isPaused, timeLeft]);

  // Web Audio API chime
  const playChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;

      const playTone = (freq, startTime, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playTone(523.25, now, 0.3);       // C5
      playTone(659.25, now + 0.15, 0.3); // E5
      playTone(783.99, now + 0.3, 0.5);  // G5
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
    // HTML5 Audio fallback (uncomment if needed):
    // try {
    //   const audio = new Audio('/chime.mp3');
    //   audio.volume = 0.5;
    //   audio.play();
    // } catch (e) {
    //   console.warn('HTML5 Audio fallback failed:', e);
    // }
  }, []);

  // Handle session completion
  const handleCompletion = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsActive(false);
    setIsPaused(false);

    playChime();

    const completedType = isStudying ? 'Sesi Belajar' : 'Sesi Istirahat';
    const nextType = isStudying ? 'istirahat' : 'belajar';

    Swal.fire({
      title: `${completedType} Selesai!`,
      text: `Waktunya ${nextType}. Siap melanjutkan?`,
      icon: 'success',
      confirmButtonText: `Mulai ${nextType}`,
      confirmButtonColor: '#2563eb',
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#0f172a',
    }).then(() => {
      const nextIsStudying = !isStudying;
      setIsStudying(nextIsStudying);
      setTimeLeft(nextIsStudying ? studyMinutes * 60 : breakMinutes * 60);
    });
  }, [isStudying, isDark, studyMinutes, breakMinutes, playChime]);

  // Timer interval
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleCompletion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, isPaused, handleCompletion]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Controls
  const handleStart = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      setIsActive(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(isStudying ? studyMinutes * 60 : breakMinutes * 60);
  };

  const handleSwitchMode = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsActive(false);
    setIsPaused(false);
    const nextIsStudying = !isStudying;
    setIsStudying(nextIsStudying);
    setTimeLeft(nextIsStudying ? studyMinutes * 60 : breakMinutes * 60);
  };

  const timerActive = isActive && !isPaused;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`flex items-center gap-2 text-sm font-bold mb-6 transition-colors cursor-pointer ${
          isDark
            ? 'text-slate-400 hover:text-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Pomodoro Timer
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-1">
            Fokus belajar terstruktur dengan subject mapping
          </p>
        </div>

        {/* Focus Subject Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            Apa yang ingin kamu pelajari saat ini?
          </label>
          <select
            value={focusSubject}
            onChange={(e) => setFocusSubject(e.target.value)}
            disabled={isActive}
            className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-blue-600 transition-colors ${
              isActive ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {allSubjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        {/* Duration Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Sesi Belajar (Menit)
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={studyMinutes}
              onChange={(e) => setStudyMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isActive}
              className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-blue-600 transition-colors ${
                isActive ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Sesi Istirahat (Menit)
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isActive}
              className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-blue-600 transition-colors ${
                isActive ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        {/* Timer Display */}
        <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-6">
          {/* Top color bar */}
          <div
            className={`h-1.5 transition-colors duration-300 ${
              isStudying ? 'bg-blue-600' : 'bg-emerald-500'
            }`}
          />

          <div className="p-8 text-center">
            {/* Session label */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {isStudying ? (
                <BookOpen className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              ) : (
                <Coffee className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              )}
              <span
                className={`text-sm font-bold ${
                  isStudying
                    ? isDark ? 'text-blue-400' : 'text-blue-600'
                    : isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}
              >
                {isStudying ? 'Fokus Belajar' : 'Waktu Istirahat'}
              </span>
            </div>

            {/* Big Timer */}
            <div className="text-6xl font-mono font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {formatTime(timeLeft)}
            </div>

            {/* Active focus subject */}
            {isActive && (
              <p className="mt-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                {focusSubject}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Start / Pause */}
          {!isActive || isPaused ? (
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 text-sm font-bold border border-blue-600 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4" />
              {isPaused ? 'Lanjutkan' : 'Mulai'}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 text-sm font-bold transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              Jeda
            </button>
          )}

          {/* Reset */}
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          {/* Switch Mode */}
          <button
            onClick={handleSwitchMode}
            className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-slate-100 transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{isStudying ? 'Istirahat' : 'Belajar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
