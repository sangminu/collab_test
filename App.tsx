import React, { useState, useEffect } from 'react';
import { TaskCard, FocusSessionLog, AlertMessage, UserSettings, FocusSessionType } from './types';
import {
  getTasks,
  saveTasks,
  getSettings,
  saveSettings,
  getSessionLogs,
  saveSessionLogs,
  getAlerts,
  saveAlerts
} from './utils/storage';

import TaskTab from './components/TaskTab';
import CalendarTab from './components/CalendarTab';
import FocusTab from './components/FocusTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<number>(0); // 0: Tasks, 1: Calendar, 2: Focus, 3: Settings

  // State elements
  const [tasks, setTasks] = useState<TaskCard[]>([]);
  const [sessionLogs, setSessionLogs] = useState<FocusSessionLog[]>([]);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Shared countdown timer states
  const [sharedMinutes, setSharedMinutes] = useState(25);
  const [sharedSeconds, setSharedSeconds] = useState(0);
  const [sharedType, setSharedType] = useState<FocusSessionType>('work');
  const [sharedIsRunning, setSharedIsRunning] = useState(false);

  // Initialize and load persistent data
  useEffect(() => {
    setTasks(getTasks());
    setSessionLogs(getSessionLogs());
    setAlerts(getAlerts());
    
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
    setSharedMinutes(loadedSettings.workMinutes);
  }, []);

  const getDurationForMode = (type: FocusSessionType): number => {
    if (!settings) return 25;
    if (type === 'work') return settings.workMinutes;
    if (type === 'shortBreak') return settings.shortBreakMinutes;
    return settings.longBreakMinutes;
  };

  // Sync with settings whenever config variables update
  useEffect(() => {
    if (!sharedIsRunning && settings) {
      if (sharedType === 'work') setSharedMinutes(settings.workMinutes);
      else if (sharedType === 'shortBreak') setSharedMinutes(settings.shortBreakMinutes);
      else setSharedMinutes(settings.longBreakMinutes);
      setSharedSeconds(0);
    }
  }, [settings, sharedType, sharedIsRunning]);

  const playNotificationSound = () => {
    if (!settings || !settings.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(freq, start);
        gainNode.gain.setValueAtTime(0.2, start);
        gainNode.gain.exponentialRampToValueAtTime(0.01, start + duration);
        
        osc.start(start);
        osc.stop(start + duration);
      };

      playTone(523.25, now, 0.4); // C5
      playTone(659.25, now + 0.1, 0.4); // E5
      playTone(783.99, now + 0.2, 0.6); // G5
    } catch (e) {
      console.warn('Audio feedback failed or not supported in this iframe context', e);
    }
  };

  // Global continuous countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (sharedIsRunning) {
      interval = setInterval(() => {
        if (sharedSeconds > 0) {
          setSharedSeconds(prev => prev - 1);
        } else if (sharedSeconds === 0) {
          if (sharedMinutes > 0) {
            setSharedMinutes(prev => prev - 1);
            setSharedSeconds(59);
          } else {
            // Timer Completed!
            playNotificationSound();
            handleSessionComplete(sharedType, getDurationForMode(sharedType));
            
            // Auto transition to breaks or work interval
            if (sharedType === 'work') {
              setSharedType('shortBreak');
              setSharedMinutes(settings?.shortBreakMinutes ?? 5);
              setSharedSeconds(0);
              if (settings?.autoStartBreaks) {
                setSharedIsRunning(true);
              } else {
                setSharedIsRunning(false);
              }
            } else {
              setSharedType('work');
              setSharedMinutes(settings?.workMinutes ?? 25);
              setSharedSeconds(0);
              if (settings?.autoStartWork) {
                setSharedIsRunning(true);
              } else {
                setSharedIsRunning(false);
              }
            }
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sharedIsRunning, sharedMinutes, sharedSeconds, sharedType, settings]);

  // Save changes wrapper callbacks
  const handleTasksChange = (updatedTasks: TaskCard[]) => {
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const handleSettingsChange = (updatedSettings: UserSettings) => {
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  // Log focus session into the Activity Graph
  const handleSessionComplete = (type: FocusSessionType, durationMins: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newSessionLog: FocusSessionLog = {
      id: `session-${Date.now()}`,
      date: todayStr,
      durationMinutes: durationMins,
      type: type,
      timestamp: new Date().toISOString()
    };
    
    // Use callback update state to avoid stale closure refs
    setSessionLogs(prevLogs => {
      const updated = [newSessionLog, ...prevLogs];
      saveSessionLogs(updated);
      return updated;
    });

    // Show a temporary alert notification
    const newAlert: AlertMessage = {
      id: `alert-comp-${Date.now()}`,
      title: `${type === 'work' ? 'Deep Work' : 'Break'} interval completed!`,
      timeLabel: 'Just now',
      icon: 'done_all'
    };
    setAlerts(prevAlerts => {
      const updated = [newAlert, ...prevAlerts.slice(0, 4)];
      saveAlerts(updated);
      return updated;
    });
  };

  // Let user log a fake custom focus activity on heatmap dates
  const handleLogCustomSession = (customDate: string, durationMins: number) => {
    const newSessionLog: FocusSessionLog = {
      id: `session-custom-${Date.now()}`,
      date: customDate,
      durationMinutes: durationMins,
      type: 'work', // default work unit
      timestamp: new Date(`${customDate}T12:00:00`).toISOString()
    };
    setSessionLogs(prevLogs => {
      const updated = [newSessionLog, ...prevLogs];
      saveSessionLogs(updated);
      return updated;
    });
  };

  // Add tasks from the Quick Add dashboard
  const handleAddTask = (newTask: Omit<TaskCard, 'id' | 'createdAt' | 'completed'>) => {
    const taskRecord: TaskCard = {
      ...newTask,
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString()
    };
    const updated = [taskRecord, ...tasks];
    setTasks(updated);
    saveTasks(updated);
  };

  // Lifted Timer Actions
  const handleTogglePlayPause = () => {
    setSharedIsRunning(!sharedIsRunning);
  };

  const handleResetTimer = (mode: FocusSessionType = sharedType) => {
    setSharedIsRunning(false);
    setSharedSeconds(0);
    if (!settings) return;
    if (mode === 'work') setSharedMinutes(settings.workMinutes);
    else if (mode === 'shortBreak') setSharedMinutes(settings.shortBreakMinutes);
    else setSharedMinutes(settings.longBreakMinutes);
  };

  const handleModeChange = (mode: FocusSessionType) => {
    setSharedType(mode);
    setSharedIsRunning(false);
    setSharedSeconds(0);
    if (!settings) return;
    if (mode === 'work') setSharedMinutes(settings.workMinutes);
    else if (mode === 'shortBreak') setSharedMinutes(settings.shortBreakMinutes);
    else setSharedMinutes(settings.longBreakMinutes);
  };

  const handleResetAllData = () => {
    if (window.confirm('Wipe complete data? This action will reload the page.')) {
      localStorage.removeItem('focusflow_tasks');
      localStorage.removeItem('focusflow_sessions');
      localStorage.removeItem('focusflow_alerts');
      localStorage.removeItem('focusflow_settings');
      window.location.reload();
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#4350be] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[#454653] font-bold uppercase tracking-wider">Starting FocusFlow Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f9f9ff] text-[#111c2d]">
      
      {/* Top Header Navigation matching screenshots */}
      <header className="bg-[#f9f9ff] sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <button 
              className="text-[#4350be] hover:bg-slate-100 p-2 rounded-full transition-colors flex items-center justify-center"
              aria-label="Navigation Menu decorative button"
            >
              <span className="material-symbols-outlined font-normal">menu</span>
            </button>
            <h1 className="font-display text-xl font-extrabold tracking-tight text-[#4350be]">
              FocusFlow
            </h1>
          </div>

          {/* Desktop navbar links shown values */}
          <nav className="hidden md:flex gap-6">
            <button
              onClick={() => setActiveTab(0)}
              className={`font-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 0 
                  ? 'text-[#4350be] bg-indigo-50 font-bold' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              Tasks
            </button>

            <button
              onClick={() => setActiveTab(1)}
              className={`font-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 1 
                  ? 'text-[#4350be] bg-indigo-50 font-bold' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              Calendar
            </button>

            <button
              onClick={() => setActiveTab(2)}
              className={`font-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 2 
                  ? 'text-[#4350be] bg-indigo-50 font-bold' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">timer</span>
              Focus
            </button>

            <button
              onClick={() => setActiveTab(3)}
              className={`font-sans text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 3 
                  ? 'text-[#4350be] bg-indigo-50 font-bold' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Settings
            </button>
          </nav>

          {/* Current global active timer indicator in header */}
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full py-1.5 px-3">
            <span className={`w-2 h-2 rounded-full ${sharedIsRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
            <span className="text-xs font-sans font-extrabold text-[#4350be] tabular-nums">
              {String(sharedMinutes).padStart(2, '0')}:{String(sharedSeconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container workspace viewports */}
      <main className="flex-grow max-w-5xl mx-auto px-5 pt-4 pb-24 w-full flex flex-col">
        {activeTab === 0 && (
          <TaskTab 
            tasks={tasks}
            onTasksChange={handleTasksChange}
          />
        )}

        {activeTab === 1 && (
          <CalendarTab 
            tasks={tasks}
            sessionLogs={sessionLogs}
            alerts={alerts}
            settings={settings}
            sharedMinutes={sharedMinutes}
            sharedSeconds={sharedSeconds}
            sharedIsRunning={sharedIsRunning}
            sharedType={sharedType}
            onNavigateToTab={setActiveTab}
            onAddTask={handleAddTask}
            onLogCustomSession={handleLogCustomSession}
          />
        )}

        {activeTab === 2 && (
          <FocusTab 
            settings={settings}
            sharedMinutes={sharedMinutes}
            sharedSeconds={sharedSeconds}
            sharedType={sharedType}
            sharedIsRunning={sharedIsRunning}
            onTogglePlayPause={handleTogglePlayPause}
            onResetTimer={handleResetTimer}
            onModeChange={handleModeChange}
          />
        )}

        {activeTab === 3 && (
          <SettingsTab 
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Responsive Bottom Navigation Bar for Mobile Viewports strictly mimicking screens style */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] rounded-t-2xl">
        
        {/* Tasks Tab */}
        <button 
          onClick={() => setActiveTab(0)}
          className={`flex flex-col items-center justify-center transition-all group w-16 cursor-pointer ${
            activeTab === 0 ? 'text-[#4350be] font-bold' : 'text-slate-400'
          }`}
        >
          <div className={`px-4 py-1.5 rounded-full mb-1 transition-all ${
            activeTab === 0 ? 'bg-indigo-50 border border-indigo-100/40 text-[#4350be]' : 'hover:bg-slate-50'
          }`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 0 ? "'FILL' 1" : "" }}>
              check_circle
            </span>
          </div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Tasks</span>
        </button>

        {/* Calendar Tab */}
        <button 
          onClick={() => setActiveTab(1)}
          className={`flex flex-col items-center justify-center transition-all group w-16 cursor-pointer ${
            activeTab === 1 ? 'text-[#4350be] font-bold' : 'text-slate-400'
          }`}
        >
          <div className={`px-4 py-1.5 rounded-full mb-1 transition-all ${
            activeTab === 1 ? 'bg-indigo-50 border border-indigo-100/40 text-[#4350be]' : 'hover:bg-slate-50'
          }`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 1 ? "'FILL' 1" : "" }}>
              calendar_today
            </span>
          </div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Calendar</span>
        </button>

        {/* Focus Timer Tab */}
        <button 
          onClick={() => setActiveTab(2)}
          className={`flex flex-col items-center justify-center transition-all group w-16 cursor-pointer ${
            activeTab === 2 ? 'text-[#4350be] font-bold' : 'text-slate-400'
          }`}
        >
          <div className={`px-4 py-1.5 rounded-full mb-1 transition-all ${
            activeTab === 2 ? 'bg-indigo-50 border border-indigo-100/40 text-[#4350be]' : 'hover:bg-slate-50'
          }`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 2 ? "'FILL' 1" : "" }}>
              timer
            </span>
          </div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Focus</span>
        </button>

        {/* Settings Tab */}
        <button 
          onClick={() => setActiveTab(3)}
          className={`flex flex-col items-center justify-center transition-all group w-16 cursor-pointer ${
            activeTab === 3 ? 'text-[#4350be] font-bold' : 'text-slate-400'
          }`}
        >
          <div className={`px-4 py-1.5 rounded-full mb-1 transition-all ${
            activeTab === 3 ? 'bg-indigo-50 border border-indigo-100/40 text-[#4350be]' : 'hover:bg-slate-50'
          }`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 3 ? "'FILL' 1" : "" }}>
              settings
            </span>
          </div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider">Settings</span>
        </button>
      </nav>
    </div>
  );
}
