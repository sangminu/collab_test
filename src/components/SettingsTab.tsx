import React, { useState } from 'react';
import { UserSettings } from '../types';

interface SettingsTabProps {
  settings: UserSettings;
  onSettingsChange: (updated: UserSettings) => void;
  onResetAllData: () => void;
}

export default function SettingsTab({ settings, onSettingsChange, onResetAllData }: SettingsTabProps) {
  const [username, setUsername] = useState(settings.username);
  const [workMinutes, setWorkMinutes] = useState(settings.workMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(settings.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(settings.longBreakMinutes);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [autoStartBreaks, setAutoStartBreaks] = useState(settings.autoStartBreaks);
  const [autoStartWork, setAutoStartWork] = useState(settings.autoStartWork);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(settings.dailyGoalMinutes);

  const [notif, setNotif] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSettingsChange({
      username,
      workMinutes: Number(workMinutes),
      shortBreakMinutes: Number(shortBreakMinutes),
      longBreakMinutes: Number(longBreakMinutes),
      soundEnabled,
      autoStartBreaks,
      autoStartWork,
      dailyGoalMinutes: Number(dailyGoalMinutes)
    });
    setNotif('Settings saved successfully!');
    setTimeout(() => setNotif(null), 2500);
  };

  const handleRestoreDefault = () => {
    if (window.confirm('Restore default Pomodoro work/break intervals?')) {
      setWorkMinutes(25);
      setShortBreakMinutes(5);
      setLongBreakMinutes(15);
      setDailyGoalMinutes(50);
      setSoundEnabled(true);
      setAutoStartBreaks(true);
      setAutoStartWork(false);
      
      onSettingsChange({
        username,
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        soundEnabled: true,
        autoStartBreaks: true,
        autoStartWork: false,
        dailyGoalMinutes: 50
      });
      setNotif('Default settings restored!');
      setTimeout(() => setNotif(null), 2500);
    }
  };

  return (
    <div className="flex-grow flex flex-col gap-6 animate-fade-in pb-10 max-w-lg mx-auto w-full">
      {/* Settings Title */}
      <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="font-display font-medium text-3xl text-[#111c2d] dark:text-white tracking-tight">Focus Settings</h2>
        <p className="text-xs text-[#454653] dark:text-slate-400 font-medium font-sans">
          Configure work timers, profile info, sound toggles, and data resets.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#4350be] dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">account_circle</span>
            User Profile
          </h3>
          
          <div>
            <label className="block text-xs font-bold text-[#454653] dark:text-slate-300 mb-1">Nickname</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#111c2d] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4350be]"
              placeholder="Alex"
              required
            />
          </div>
        </div>

        {/* Pomodoro Intervals Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#4350be] dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            Focus Timer Intervals (Minutes)
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Deep Work</label>
              <input
                type="number"
                min={1}
                max={120}
                value={workMinutes}
                onChange={e => setWorkMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#111c2d] dark:text-white focus:outline-none text-center"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Short Break</label>
              <input
                type="number"
                min={1}
                max={45}
                value={shortBreakMinutes}
                onChange={e => setShortBreakMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#111c2d] dark:text-white focus:outline-none text-center"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Long Break</label>
              <input
                type="number"
                min={1}
                max={60}
                value={longBreakMinutes}
                onChange={e => setLongBreakMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-[#111c2d] dark:text-white focus:outline-none text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#454653] dark:text-slate-300 mb-1">
              Daily Goal (Minutes of Work): <span className="font-bold text-[#4350be] dark:text-indigo-300">{dailyGoalMinutes}m</span>
            </label>
            <input
              type="range"
              min={10}
              max={300}
              step={10}
              value={dailyGoalMinutes}
              onChange={e => setDailyGoalMinutes(Number(e.target.value))}
              className="w-full select-none accent-[#4350be]"
            />
          </div>
        </div>

        {/* Sounds & Automation Options */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#4350be] dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">tune</span>
            Audio & Automation
          </h3>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl cursor-pointer"
               onClick={() => setSoundEnabled(!soundEnabled)}>
            <div>
              <p className="text-xs font-bold text-[#111c2d] dark:text-slate-200">Synthesizer Sound Alerts</p>
              <p className="text-[10px] text-slate-400">Play an elegant chime wave when timer completes</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-all relative ${soundEnabled ? 'bg-[#4350be]' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${soundEnabled ? 'right-1' : 'left-1'}`} />
            </div>
          </div>

          {/* Auto Start Breaks Toggle */}
          <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl cursor-pointer"
               onClick={() => setAutoStartBreaks(!autoStartBreaks)}>
            <div>
              <p className="text-xs font-bold text-[#111c2d] dark:text-slate-200">Auto Start Breaks</p>
              <p className="text-[10px] text-slate-400">Automatically trigger Break mode right when Work finishes</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-all relative ${autoStartBreaks ? 'bg-[#4350be]' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${autoStartBreaks ? 'right-1' : 'left-1'}`} />
            </div>
          </div>

          {/* Auto Start Work Toggle */}
          <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl cursor-pointer"
               onClick={() => setAutoStartWork(!autoStartWork)}>
            <div>
              <p className="text-xs font-bold text-[#111c2d] dark:text-slate-200">Auto Start Focus Work</p>
              <p className="text-[10px] text-slate-400">Launch Work interval automatically when Break runs out</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-all relative ${autoStartWork ? 'bg-[#4350be]' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${autoStartWork ? 'right-1' : 'left-1'}`} />
            </div>
          </div>
        </div>

        {/* Save button and restore default action alerts */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-grow py-3 bg-[#4350be] hover:bg-[#5d6ad9] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            Save Settings
          </button>
          
          <button
            type="button"
            onClick={handleRestoreDefault}
            className="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all"
          >
            Reset Defaults
          </button>
        </div>
      </form>

      {/* Save Notification Toast */}
      {notif && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 p-3 bg-emerald-600 border border-emerald-500 text-white font-sans text-xs font-bold rounded-xl shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          {notif}
        </div>
      )}

      {/* Danger Zone: Wipin localState */}
      <div className="mt-8 pt-6 border-t border-red-100 dark:border-red-950/30 space-y-3">
        <h4 className="text-rose-600 dark:text-rose-400 font-sans font-bold text-xs uppercase tracking-widest flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">gavel</span>
          Danger Zone
        </h4>
        <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Wipe Database & State</p>
            <p className="text-[10px] text-rose-600/80 dark:text-rose-400">Deletes all local task changes and focus sessions history.</p>
          </div>
          <button
            type="button"
            onClick={onResetAllData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            Reset App Data
          </button>
        </div>
      </div>
    </div>
  );
}
