import React, { useState, useMemo } from 'react';
import { TaskCard, FocusSessionLog, AlertMessage, UserSettings } from '../types';

interface CalendarTabProps {
  tasks: TaskCard[];
  sessionLogs: FocusSessionLog[];
  alerts: AlertMessage[];
  settings: UserSettings;
  sharedMinutes: number;
  sharedSeconds: number;
  sharedIsRunning: boolean;
  sharedType: string;
  onNavigateToTab: (tabIndex: number) => void;
  onAddTask: (newTask: Omit<TaskCard, 'id' | 'createdAt' | 'completed'>) => void;
  onLogCustomSession: (date: string, durationMins: number) => void;
}

export default function CalendarTab({
  tasks,
  sessionLogs,
  alerts,
  settings,
  sharedMinutes,
  sharedSeconds,
  sharedIsRunning,
  sharedType,
  onNavigateToTab,
  onAddTask,
  onLogCustomSession
}: CalendarTabProps) {
  const [selectedCell, setSelectedCell] = useState<{ date: string; count: number } | null>(null);
  const [showAddQuickTask, setShowAddQuickTask] = useState(false);
  
  // States for new quick task
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newDate, setNewDate] = useState('2026. 06. 04');
  const [newPriority, setNewPriority] = useState(1);
  const [newColor, setNewColor] = useState<'error' | 'yellow' | 'neutral' | 'primary'>('neutral');

  // Format today's date neatly
  const todayStr = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }, []);

  // Map of activity counts per day "YYYY-MM-DD"
  const activityMap = useMemo(() => {
    const map: Record<string, { sessions: number; tasks: number }> = {};
    
    // Aggregate session logs
    sessionLogs.forEach(log => {
      const d = log.date;
      if (!map[d]) map[d] = { sessions: 0, tasks: 0 };
      map[d].sessions += 1;
    });

    // Aggregate completed subtasks or tasks
    tasks.forEach(t => {
      t.subTasks.forEach(st => {
        if (st.completed) {
          const dStr = new Date(t.createdAt).toISOString().split('T')[0];
          if (!map[dStr]) map[dStr] = { sessions: 0, tasks: 0 };
          map[dStr].tasks += 1;
        }
      });
    });

    return map;
  }, [sessionLogs, tasks]);

  // Construct calendar coordinate columns for a full calendar year
  const heatmapColumns = useMemo(() => {
    const columns = [];
    const now = new Date();
    // Start roughly 52 weeks ago, aligning with Monday
    const startDate = new Date();
    startDate.setDate(now.getDate() - 364);
    
    // Adjust start date to previous Sunday/Monday to align column grids nicely
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek + 1); // Align to Monday

    const currentDateTemp = new Date(startDate);
    
    // Generate 52 columns, each with 7 rows (days)
    for (let c = 0; c < 52; c++) {
      const columnCells = [];
      let colLabel = '';
      
      // Determine label for the month occasionally
      if (c % 4.3 === 0 || c === 0) {
        colLabel = currentDateTemp.toLocaleDateString('en-US', { month: 'short' });
      }

      for (let r = 0; r < 7; r++) {
        const itemDateStr = currentDateTemp.toISOString().split('T')[0];
        const dayActivity = activityMap[itemDateStr] || { sessions: 0, tasks: 0 };
        const totalIntensity = dayActivity.sessions + dayActivity.tasks;
        
        let intensityLevel: 0 | 1 | 2 | 3 | 4 = 0;
        if (totalIntensity >= 6) intensityLevel = 4;
        else if (totalIntensity >= 4) intensityLevel = 3;
        else if (totalIntensity >= 2) intensityLevel = 2;
        else if (totalIntensity > 0) intensityLevel = 1;

        columnCells.push({
          date: itemDateStr,
          sessions: dayActivity.sessions,
          tasks: dayActivity.tasks,
          level: intensityLevel
        });

        // Increment to next day
        currentDateTemp.setDate(currentDateTemp.getDate() + 1);
      }
      columns.push({
        cells: columnCells,
        label: colLabel
      });
    }
    return columns;
  }, [activityMap]);

  // Handle Quick Add Submit
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle,
      notes: newNote,
      date: newDate,
      priority: Number(newPriority),
      highlightColor: newColor,
      subTasks: []
    });

    // Reset fields
    setNewTitle('');
    setNewNote('');
    setNewDate('2026. 06. 04');
    setNewColor('neutral');
    setShowAddQuickTask(false);
  };

  const handleCellClick = (cell: { date: string; sessions: number; tasks: number }) => {
    const total = cell.sessions + cell.tasks;
    setSelectedCell({ date: cell.date, count: total });
  };

  const addFakeSession = () => {
    if (selectedCell) {
      onLogCustomSession(selectedCell.date, 25);
      setSelectedCell(prev => prev ? { ...prev, count: prev.count + 1 } : null);
    }
  };

  // Keep tasks sorted based on priority level
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.priority - b.priority);
  }, [tasks]);

  return (
    <div className="flex-grow flex flex-col gap-6 animate-fade-in pb-10">
      
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <h2 className="font-display font-medium text-4xl text-[#111c2d] dark:text-white tracking-tight">To-do List</h2>
        <p className="font-sans text-sm text-[#454653] dark:text-slate-400 font-medium tracking-wide">
          {todayStr} (오늘 날짜)
        </p>
      </div>

      {/* Dynamic Alerts and Synchronized Timer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Alerts card */}
        <section className="bg-white dark:bg-slate-800 border border-[#dee8ff] dark:border-slate-700/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#4350be]" style={{ fontVariationSettings: "'FILL' 1" }}>
                notifications
              </span>
              <h3 className="font-sans text-base text-[#111c2d] dark:text-slate-200 font-bold">
                알림 (Upcoming Alerts)
              </h3>
            </div>
            
            <div className="space-y-3">
              {alerts.map((al, idx) => (
                <div key={al.id} className="flex items-start gap-3 p-2 bg-[#f0f3ff] dark:bg-slate-700/40 rounded-xl">
                  <span className="material-symbols-outlined text-xs text-[#5d6ad9] mt-0.5">
                    {al.icon}
                  </span>
                  <div>
                    <p className="text-xs text-[#111c2d] dark:text-slate-150 font-semibold">{al.title}</p>
                    <p className="text-[10px] text-[#454653] dark:text-slate-400 font-mono font-medium">{al.timeLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sync Timer Card */}
        <section 
          onClick={() => onNavigateToTab(2)} // Swaps back to timer tab!
          className="bg-gradient-to-br from-[#4350be] to-[#5d6ad9] text-white rounded-2xl p-5 shadow-md relative overflow-hidden flex flex-col items-center justify-center cursor-pointer group hover:scale-[1.02] active:scale-95 transition-all"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/15 transition-all"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-[11px] uppercase tracking-widest font-bold font-sans text-indigo-100 opacity-90 mb-1">
              타이머 (Focus Click)
            </span>
            <div className="font-sans text-4xl font-extrabold mb-1 tracking-tight">
              {String(sharedMinutes).padStart(2, '0')}:{String(sharedSeconds).padStart(2, '0')}
            </div>
            <p className="text-[11px] font-sans font-medium text-white/80 bg-white/10 px-3 py-0.5 rounded-full inline-flex align-middle items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${sharedIsRunning ? 'bg-emerald-400 animate-pulse' : 'bg-white'}`}></span>
              {sharedIsRunning ? `${sharedType === 'work' ? 'Work' : 'Break'} Active` : 'Click to start focusing'}
            </p>
          </div>
        </section>
      </div>

      {/* Contribution Heatmap Container card */}
      <section className="bg-white dark:bg-slate-800 border border-[#dee8ff] dark:border-slate-700/60 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-sans text-base font-bold text-[#111c2d] dark:text-slate-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4b5a9c]" style={{ fontVariationSettings: "'FILL' 1" }}>
              calendar_month
            </span>
            캘린더 (Activity Graph)
          </h3>
          <span className="text-[11px] text-[#454653] dark:text-slate-400 font-mono font-medium">
            Hover or click cells to add log
          </span>
        </div>

        {/* Heatmap Layout with scroll-axis */}
        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-max flex gap-1.5 items-end">
            
            {/* Days indicator row */}
            <div className="flex flex-col justify-around text-[9px] text-slate-400 font-mono font-bold pr-2 h-[88px] pb-1">
              <div>Mon</div>
              <div>Wed</div>
              <div>Fri</div>
            </div>

            {/* Heatmap column builder */}
            {heatmapColumns.map((col, cIdx) => (
              <div key={cIdx} className="flex flex-col gap-1">
                {col.label ? (
                  <div className="text-[10px] text-slate-400 font-mono h-4 font-bold overflow-visible whitespace-nowrap mb-1">
                    {col.label}
                  </div>
                ) : (
                  <div className="h-4 mb-1"></div>
                )}
                
                {col.cells.map((cell, rIdx) => {
                  let cellBg = 'bg-[#f0f3ff] dark:bg-slate-700/50';
                  if (cell.level === 1) cellBg = 'bg-[#cfdaf2]';
                  if (cell.level === 2) cellBg = 'bg-[#a6b5fd]';
                  if (cell.level === 3) cellBg = 'bg-[#5d6ad9]';
                  if (cell.level === 4) cellBg = 'bg-[#4350be]';

                  return (
                    <button
                      key={rIdx}
                      onClick={() => handleCellClick(cell)}
                      title={`${cell.date}: Focus Sessions & Tasks completed: ${cell.sessions + cell.tasks}`}
                      className={`w-2.5 h-2.5 rounded-sm hover:scale-130 active:scale-95 transition-all cursor-pointer ${cellBg}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <a href="#" className="text-[#4350be] dark:text-indigo-400 hover:underline font-medium">
            Learn how we count contributions
          </a>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#f0f3ff] dark:bg-slate-700/50"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#cfdaf2]"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#a6b5fd]"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#5d6ad9]"></div>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#4350be]"></div>
            <span className="text-[11px] text-slate-400">More</span>
          </div>
        </div>

        {/* Interactive Log Drawer when click item */}
        {selectedCell && (
          <div className="mt-4 p-3 bg-[#f0f3ff] dark:bg-slate-700/40 rounded-xl border border-[#dfe0ff] dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-2 animate-fade-in">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-[#111c2d] dark:text-slate-200 block">
                Activity date: <span className="text-[#4350be] dark:text-indigo-300 font-mono font-semibold">{selectedCell.date}</span>
              </span>
              <span className="text-[11px] text-[#454653] dark:text-slate-400">
                Log count today: {selectedCell.count} focus units completed
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={addFakeSession}
                className="px-3.5 py-1.5 bg-[#4350be] text-white text-xs font-semibold rounded-lg hover:bg-[#5d6ad9] transition-all"
              >
                + Log 25m Focus
              </button>
              <button
                onClick={() => setSelectedCell(null)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-[#454653] dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-750 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Priority queue / widget queue card layout */}
      <section className="bg-white dark:bg-slate-800 border border-[#dee8ff] dark:border-slate-700/60 rounded-2xl p-5 shadow-sm">
        
        {/* Card Header matching screen */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700 mb-4">
          <h3 className="font-sans text-lg font-bold text-[#111c2d] dark:text-slate-200">
            List (우선 순위 Queues)
          </h3>
          <div className="bg-red-50 dark:bg-red-950/40 text-rose-600 dark:text-rose-400 px-3.5 py-1 rounded-full font-sans font-bold text-xs tracking-wide uppercase">
            우선 순위 (PRIORITY)
          </div>
        </div>

        {/* Queue Task item rendering */}
        <div className="space-y-3">
          {sortedTasks.map((t, idx) => {
            // Priority circle highlighting
            let priorityBadge = 'bg-[#dee8ff] text-slate-700';
            if (t.highlightColor === 'error') priorityBadge = 'bg-[#ba1a1a] text-white';
            if (t.highlightColor === 'yellow') priorityBadge = 'bg-amber-400 text-slate-900';
            
            return (
              <div 
                key={t.id} 
                className={`flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700/40 hover:bg-slate-50/60 dark:hover:bg-slate-750/30 transition-all flex-col sm:flex-row ${
                  t.highlightColor === 'yellow' ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                }`}
              >
                <div className="flex gap-3 items-center sm:block">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${priorityBadge}`}>
                    {idx + 1}
                  </span>
                  <span className="sm:hidden text-xs text-[#454653] dark:text-slate-400 font-bold">
                    Priority {idx + 1}
                  </span>
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h4 className="font-sans text-base font-semibold text-[#111c2d] dark:text-slate-100">
                      {t.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-700/40 px-2 py-0.5 rounded">
                      {t.date}
                    </span>
                  </div>
                  <p className="text-xs text-[#454653] dark:text-slate-400 mt-1 font-medium">
                    {t.notes || 'No notes added.'}
                  </p>
                </div>
              </div>
            );
          })}

          {sortedTasks.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">All priority queues clear!</p>
          )}
        </div>

        {/* Action redirect button */}
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <button
            onClick={() => setShowAddQuickTask(true)}
            className="flex-grow flex items-center justify-center gap-1.5 py-3 text-[#4350be] dark:text-indigo-400 text-xs font-bold rounded-xl hover:bg-[#dfe0ff] dark:hover:bg-slate-700/50 border border-dashed border-[#4350be] dark:border-indigo-400 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add New Task
          </button>
          
          <button
            onClick={() => onNavigateToTab(0)} // Navigate tasks tab
            className="px-4 py-3 bg-[#dee8ff] dark:bg-slate-700/60 text-[#4350be] dark:text-indigo-300 text-xs font-bold rounded-xl hover:bg-[#a6b5fd]/30 transition-all"
          >
            Manage Detailed Checklists
          </button>
        </div>
      </section>

      {/* Quick Add Dialog modal in Dashboard view */}
      {showAddQuickTask && (
        <div className="fixed inset-0 z-50 bg-[#111c2d]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleQuickAdd}
            className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-fade-in"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-[#f0f3ff] dark:bg-slate-800">
              <h3 className="font-sans font-bold text-base text-[#111c2d] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4350be]">edit_calendar</span>
                Quick Add Priority Task
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddQuickTask(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. 제출 날짜순 (Sort by date)"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-[#111c2d] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4350be]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Due Date / Suffix</label>
                <input
                  type="text"
                  required
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  placeholder="e.g. 2029. 01. 05"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-[#111c2d] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4350be]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description Note</label>
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Describe task actions..."
                  rows={2}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-[#111c2d] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4350be]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Highlight Suffix</label>
                  <select
                    value={newColor}
                    onChange={e => setNewColor(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-[#111c2d] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4350be]"
                  >
                    <option value="neutral">Neutral Slate</option>
                    <option value="error">Error/Red Tag</option>
                    <option value="yellow">Yellow Highlight</option>
                    <option value="primary">Focus Blue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Priority Order</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newPriority}
                    onChange={e => setNewPriority(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-[#111c2d] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4350be]"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddQuickTask(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#4350be] hover:bg-[#5d6ad9] text-white text-xs font-semibold rounded-xl"
              >
                Add to Queues
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
