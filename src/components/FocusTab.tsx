import React from 'react';
import { FocusSessionType, UserSettings } from '../types';

interface FocusTabProps {
  settings: UserSettings;
  sharedMinutes: number;
  sharedSeconds: number;
  sharedType: FocusSessionType;
  sharedIsRunning: boolean;
  onTogglePlayPause: () => void;
  onResetTimer: (mode?: FocusSessionType) => void;
  onModeChange: (mode: FocusSessionType) => void;
}

export default function FocusTab({
  settings,
  sharedMinutes,
  sharedSeconds,
  sharedType,
  sharedIsRunning,
  onTogglePlayPause,
  onResetTimer,
  onModeChange
}: FocusTabProps) {

  const getDurationForMode = (mode: FocusSessionType): number => {
    switch (mode) {
      case 'work': return settings.workMinutes;
      case 'shortBreak': return settings.shortBreakMinutes;
      case 'longBreak': return settings.longBreakMinutes;
    }
  };

  const formatModeName = (mode: FocusSessionType): string => {
    switch (mode) {
      case 'work': return 'Deep Work';
      case 'shortBreak': return 'Short Break';
      case 'longBreak': return 'Long Break';
    }
  };

  // Circular progress math
  const maxSeconds = getDurationForMode(sharedType) * 60;
  const currentSecondsLeft = sharedMinutes * 60 + sharedSeconds;
  const percentageOfCompletion = maxSeconds > 0 ? (maxSeconds - currentSecondsLeft) / maxSeconds : 0;
  
  const circumference = 880; // 2 * pi * r
  const strokeDashoffset = circumference * (1 - percentageOfCompletion);

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-2 animate-fade-in">
      {/* Mode Selectors */}
      <div className="flex p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-full gap-1 mb-8">
        <button
          onClick={() => onModeChange('work')}
          className={`px-5 py-2 rounded-full font-sans text-xs font-semibold transition-all ${
            sharedType === 'work'
              ? 'bg-[#4350be] text-white shadow-sm'
              : 'text-[#454653] dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Deep Work
        </button>
        <button
          onClick={() => onModeChange('shortBreak')}
          className={`px-5 py-2 rounded-full font-sans text-xs font-semibold transition-all ${
            sharedType === 'shortBreak'
              ? 'bg-[#4350be] text-white shadow-sm'
              : 'text-[#454653] dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Short Break
        </button>
        <button
          onClick={() => onModeChange('longBreak')}
          className={`px-5 py-2 rounded-full font-sans text-xs font-semibold transition-all ${
            sharedType === 'longBreak'
              ? 'bg-[#4350be] text-white shadow-sm'
              : 'text-[#454653] dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Long Break
        </button>
      </div>

      {/* Timer Circle */}
      <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square flex items-center justify-center mb-10">
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 300 300">
          <circle
            className="stroke-[#dee8ff] dark:stroke-slate-700/60"
            cx="150"
            cy="150"
            fill="none"
            r="140"
            strokeWidth="4"
          />
          {/* Progress Circle with beautiful deep focus blue */}
          <circle
            className="stroke-[#4350be] transition-all duration-350"
            cx="150"
            cy="150"
            fill="none"
            r="140"
            strokeLinecap="round"
            strokeWidth="8"
            style={{
              strokeDasharray: 880,
              strokeDashoffset: strokeDashoffset
            }}
          />
        </svg>

        {/* Text inside */}
        <div className="z-10 flex flex-col items-center justify-center text-center">
          <div className="font-sans font-bold text-5xl sm:text-6xl text-[#111c2d] dark:text-white tabular-nums tracking-tight">
            {String(sharedMinutes).padStart(2, '0')}:{String(sharedSeconds).padStart(2, '0')}
          </div>
          <div className="font-sans text-sm sm:text-base text-[#454653] dark:text-slate-300 font-medium mt-2">
            {formatModeName(sharedType)}
          </div>
          
          {/* Quick status dots */}
          <div className="flex gap-1.5 mt-3">
            <span className={`w-2 h-2 rounded-full ${sharedIsRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
            <span className="text-xs text-[#454653] dark:text-slate-400 font-mono">
              {sharedIsRunning ? 'active' : 'idle'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls layout targeting the reference buttons style */}
      <div className="flex items-center gap-6">
        {/* Stop action button */}
        <button
          onClick={() => onResetTimer()}
          title="Stop and Reset"
          className="w-14 h-14 rounded-full bg-[#d8e3fb] dark:bg-slate-800 text-[#111c2d] dark:text-slate-200 hover:bg-[#dee8ff] dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            stop
          </span>
        </button>

        {/* Play / Pause main focus action */}
        <button
          onClick={onTogglePlayPause}
          title={sharedIsRunning ? 'Pause' : 'Play Focus session'}
          className="w-20 h-20 rounded-full bg-[#4350be] text-white hover:bg-[#5d6ad9] active:scale-95 transition-all hover:scale-105 flex items-center justify-center shadow-lg shadow-[#4350be]/20"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '36px', fontVariationSettings: "'FILL' 1" }}>
            {sharedIsRunning ? 'pause' : 'play_arrow'}
          </span>
        </button>

        {/* Reset button click */}
        <button
          onClick={() => onResetTimer(sharedType)}
          title="Restart current mode"
          className="w-14 h-14 rounded-full bg-[#d8e3fb] dark:bg-slate-800 text-[#111c2d] dark:text-slate-200 hover:bg-[#dee8ff] dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center shadow-sm"
        >
          <span className="material-symbols-outlined">
            refresh
          </span>
        </button>
      </div>

      {/* Daily Progress indicator */}
      <div className="mt-8 px-6 py-3 bg-[#f0f3ff] dark:bg-slate-900 rounded-2xl border border-[#dfe0ff] dark:border-slate-800 text-center">
        <p className="text-xs text-[#454653] dark:text-slate-400 font-medium">
          Daily Goal: <span className="text-[#4350be] dark:text-indigo-400 font-bold">{settings.dailyGoalMinutes} mins</span>
        </p>
      </div>
    </div>
  );
}
