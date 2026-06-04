import React, { useState } from 'react';
import { TaskCard, SubTask } from '../types';

interface TaskTabProps {
  tasks: TaskCard[];
  onTasksChange: (updatedTasks: TaskCard[]) => void;
}

export default function TaskTab({ tasks, onTasksChange }: TaskTabProps) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026. 06. 04');
  const [newColor, setNewColor] = useState<'error' | 'yellow' | 'neutral' | 'primary'>('neutral');
  const [newNotes, setNewNotes] = useState('');
  
  // Custom temporary inputs for adding new sub-items inside a card
  const [activeCardIdForSub, setActiveCardIdForSub] = useState<string | null>(null);
  const [newSubText, setNewSubText] = useState('');

  // Calculate task card completion percentage
  const calculateCompletedPercentage = (task: TaskCard): number => {
    if (!task.subTasks || task.subTasks.length === 0) return 0;
    const completedCount = task.subTasks.filter(st => st.completed).length;
    return Math.round((completedCount / task.subTasks.length) * 100);
  };

  // Toggle sub-item checkbox completion state
  const handleToggleSubTask = (cardId: string, subId: string) => {
    const updated = tasks.map(t => {
      if (t.id === cardId) {
        const subUpdated = t.subTasks.map(st => {
          if (st.id === subId) {
            return { ...st, completed: !st.completed };
          }
          return st;
        });

        // If all subtasks are checked, mark parent as completed!
        const allChecked = subUpdated.length > 0 && subUpdated.every(st => st.completed);
        return {
          ...t,
          subTasks: subUpdated,
          completed: allChecked
        };
      }
      return t;
    });
    onTasksChange(updated);
  };

  // Toggle state for complete card lists
  const handleToggleWholeTask = (cardId: string) => {
    const updated = tasks.map(t => {
      if (t.id === cardId) {
        const targetCompleted = !t.completed;
        // Check or uncheck all nested sub-items
        const subUpdated = t.subTasks.map(st => ({
          ...st,
          completed: targetCompleted
        }));

        return {
          ...t,
          completed: targetCompleted,
          subTasks: subUpdated
        };
      }
      return t;
    });
    onTasksChange(updated);
  };

  // Add sub-item inside an individual list card
  const handleAddSubTask = (cardId: string) => {
    if (!newSubText.trim()) return;
    
    const updated = tasks.map(t => {
      if (t.id === cardId) {
        const newSub: SubTask = {
          id: `sub-${Date.now()}`,
          title: newSubText,
          completed: false
        };
        return {
          ...t,
          completed: false, // reset parent completed if new unchecked item exists
          subTasks: [...t.subTasks, newSub]
        };
      }
      return t;
    });

    onTasksChange(updated);
    setNewSubText('');
    setActiveCardIdForSub(null);
  };

  // Handle entire List Card Creation
  const handleCreateListCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCreatedCard: TaskCard = {
      id: `task-${Date.now()}`,
      title: newTitle,
      date: newDate,
      completed: false,
      priority: tasks.length + 1,
      highlightColor: newColor,
      notes: newNotes,
      createdAt: new Date().toISOString(),
      subTasks: []
    };

    onTasksChange([newCreatedCard, ...tasks]);
    setNewTitle('');
    setNewDate('2026. 06. 04');
    setNewColor('neutral');
    setNewNotes('');
    setShowAddCard(false);
  };

  // Delete checklist card
  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this list card?')) {
      const filtered = tasks.filter(t => t.id !== cardId);
      onTasksChange(filtered);
    }
  };

  return (
    <div className="flex-grow flex flex-col gap-6 animate-fade-in relative pb-16">
      
      {/* Centered Heading */}
      <div className="flex items-center justify-center py-2 border-b border-dashed border-slate-200 dark:border-slate-800">
        <h2 className="font-display font-medium text-4xl text-[#111c2d] dark:text-white tracking-tight">to do List</h2>
      </div>

      {/* Checklist List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {tasks.map(t => {
          const compPct = calculateCompletedPercentage(t);
          
          // Style assignments matching screens
          let headerColor = 'text-[#111c2d] dark:text-slate-150';
          let borderStyle = 'border-slate-200 dark:border-slate-700';
          let bgStyle = 'bg-white dark:bg-slate-800';
          
          if (t.highlightColor === 'error') {
            headerColor = 'text-rose-600 dark:text-rose-400';
            borderStyle = 'border-rose-200 dark:border-rose-900/40';
          } else if (t.highlightColor === 'yellow') {
            // Distinctive highlighting as seen in Screen 3
            bgStyle = 'bg-amber-50/50 dark:bg-amber-950/20';
            borderStyle = 'border-amber-200 dark:border-amber-900/30';
          } else if (t.highlightColor === 'primary') {
            borderStyle = 'border-indigo-200 dark:border-indigo-900/40';
          }

          return (
            <div 
              key={t.id}
              className={`task-card ${bgStyle} ${borderStyle} border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between`}
            >
              <div>
                {/* Card Title & Progress Indicator */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-grow max-w-[70%]">
                    <h3 className={`font-sans font-bold text-lg leading-tight line-clamp-2 ${headerColor}`}>
                      {t.title}
                    </h3>
                    <p className="text-[11px] text-[#454653] dark:text-slate-400 font-mono mt-1 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                      {t.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle whole card checkmark */}
                    <button
                      onClick={() => handleToggleWholeTask(t.id)}
                      title="Toggle All items completed"
                      className="text-slate-400 hover:text-[#4350be] transition-all flex items-center"
                    >
                      <span className={`material-symbols-outlined ${compPct === 100 && t.subTasks.length > 0 ? 'text-[#4350be]' : ''}`}>
                        {compPct === 100 && t.subTasks.length > 0 ? 'check_circle' : 'circle'}
                      </span>
                    </button>

                    {/* Progress tracking badge layout */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-full border border-slate-200/50">
                      {/* Sub progress line */}
                      <div className="w-14 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#4350be] transition-all duration-300" 
                          style={{ width: `${compPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold font-mono">
                        {compPct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Optional sub-task list notes */}
                {t.notes && (
                  <p className="text-xs text-slate-400 mb-3 bg-slate-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg border-l-2 border-[#4350be]">
                    {t.notes}
                  </p>
                )}

                {/* Sub-items check rows list */}
                <div className="mt-4 border-t border-slate-100 dark:border-slate-700/65 pt-3 space-y-2">
                  {t.subTasks.map(st => (
                    <div 
                      key={st.id}
                      onClick={() => handleToggleSubTask(t.id, st.id)}
                      className="flex items-center justify-between py-2 px-1 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg cursor-pointer group"
                    >
                      <span className={`font-sans text-xs font-semibold ${
                        st.completed 
                          ? 'text-slate-400 line-through font-normal' 
                          : 'text-[#111c2d] dark:text-slate-200'
                      }`}>
                        {st.title}
                      </span>

                      <span className={`material-symbols-outlined text-sm ${st.completed ? 'text-[#4350be]' : 'text-slate-400'}`}>
                        {st.completed ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </div>
                  ))}

                  {t.subTasks.length === 0 && (
                    <p className="text-xs text-slate-400/80 text-center py-4 italic">No sub-items. Add one below!</p>
                  )}
                </div>
              </div>

              {/* Sub-item Creation Controls */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-2">
                {activeCardIdForSub === t.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add sub-task..."
                      value={newSubText}
                      onChange={e => setNewSubText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSubTask(t.id)}
                      className="flex-grow px-3 py-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs rounded-lg text-[#111c2d] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#4350be]"
                    />
                    <button
                      onClick={() => handleAddSubTask(t.id)}
                      className="bg-[#4350be] hover:bg-[#5d6ad9] text-white text-xs px-3 rounded-lg font-bold"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setActiveCardIdForSub(null);
                        setNewSubText('');
                      }}
                      className="bg-slate-200 dark:bg-slate-700 text-xs px-2 rounded-lg text-slate-500"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30 p-1.5 rounded-xl">
                    <button
                      onClick={() => setActiveCardIdForSub(t.id)}
                      className="text-[11px] text-[#4350be] dark:text-indigo-400 font-bold hover:underline py-1 px-2 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      Add item checklist
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCard(t.id)}
                      title="Delete whole List card"
                      className="md:opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-600 transition-all p-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button for Card Creation */}
      <button
        onClick={() => setShowAddCard(true)}
        aria-label="Add List Card"
        title="Create new list checklist"
        className="fixed bottom-[96px] right-6 p-4 bg-[#4350be] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#5d6ad9] active:scale-95 hover:scale-105 transition-all z-40 cursor-pointer w-14 h-14"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '30px', fontVariationSettings: "'FILL' 1" }}>
          add
        </span>
      </button>

      {/* Checklist Card Creator Modal */}
      {showAddCard && (
        <div className="fixed inset-0 z-50 bg-[#111c2d]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateListCard}
            className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-fade-in"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-[#f0f3ff] dark:bg-slate-800">
              <h3 className="font-sans font-bold text-base text-[#111c2d] dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4350be]">assignment_add</span>
                Create new List Card
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddCard(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">List Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. List 1, Review Assets"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-[#111c2d] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Due Date</label>
                <input
                  type="text"
                  required
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  placeholder="e.g. 2025. 10. 26"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-[#111c2d] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Notes / Description Suffix</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="e.g. Prepare client presentation deck"
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-[#111c2d] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">List Highlighting Vibe</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewColor('neutral')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                      newColor === 'neutral'
                        ? 'bg-slate-200 dark:bg-slate-700 border-[#4350be]'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Slate
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewColor('error')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                      newColor === 'error'
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-400'
                        : 'bg-rose-50/20 dark:bg-rose-950/20 text-rose-400 border-transparent'
                    }`}
                  >
                    Red Error
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewColor('yellow')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                      newColor === 'yellow'
                        ? 'bg-amber-100 text-amber-800 border-amber-400'
                        : 'bg-amber-50/20 text-amber-500 border-transparent'
                    }`}
                  >
                    Yellow
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewColor('primary')}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                      newColor === 'primary'
                        ? 'bg-indigo-50 text-indigo-700 border-[#4350be]'
                        : 'bg-indigo-50/20 text-indigo-400 border-transparent'
                    }`}
                  >
                    Focus Blue
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddCard(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#4350be] hover:bg-[#5d6ad9] text-white text-xs font-semibold rounded-xl"
              >
                Create Card List
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
