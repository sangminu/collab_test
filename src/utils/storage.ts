import { TaskCard, UserSettings, FocusSessionLog, DailyActivity, AlertMessage } from '../types';

const INITIAL_TASKS: TaskCard[] = [
  {
    id: 'task-1',
    title: 'List 1',
    date: '2025. 10. 26',
    completed: false,
    priority: 1,
    highlightColor: 'error',
    notes: 'Update database queries.',
    createdAt: new Date(2025, 9, 26).toISOString(),
    subTasks: [
      { id: 'sub-1', title: '1.', completed: false }
    ]
  },
  {
    id: 'task-2',
    title: '2. List',
    date: '2029. 01. 05',
    completed: false,
    priority: 2,
    highlightColor: 'yellow',
    notes: 'Check Figma board.',
    createdAt: new Date(2026, 5, 4).toISOString(),
    subTasks: [
      { id: 'sub-2-1', title: 'Review Q3 assets drafts', completed: false },
      { id: 'sub-2-2', title: 'Compile design feedback', completed: false }
    ]
  },
  {
    id: 'task-3',
    title: 'Client Onboarding',
    date: '2026. 06. 10',
    completed: false,
    priority: 3,
    highlightColor: 'neutral',
    notes: 'Prepare welcome slide deck.',
    createdAt: new Date(2026, 5, 4).toISOString(),
    subTasks: [
      { id: 'sub-3-1', title: 'Structure slides deck outline', completed: true },
      { id: 'sub-3-2', title: 'Embed prototype links', completed: false }
    ]
  }
];

const DEFAULT_SETTINGS: UserSettings = {
  username: 'Alex',
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  soundEnabled: true,
  autoStartBreaks: true,
  autoStartWork: false,
  dailyGoalMinutes: 50
};

const INITIAL_ALERTS: AlertMessage[] = [
  {
    id: 'alert-1',
    title: 'Design Review Prep',
    timeLabel: 'In 15 mins',
    icon: 'notifications'
  },
  {
    id: 'alert-2',
    title: 'Hydration reminder',
    timeLabel: 'Drink water now',
    icon: 'local_drink'
  }
];

// Helper to generate a year of activity data
function generateInitialActivity(): FocusSessionLog[] {
  const logs: FocusSessionLog[] = [];
  const now = new Date();
  
  // Fill the last 300 days with random simulated sessions
  for (let i = 0; i < 300; i++) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Random status
    const rand = Math.random();
    if (rand > 0.45) { // 55% chance of some activity
      const numSessions = Math.floor(Math.random() * 4) + 1;
      for (let s = 0; s < numSessions; s++) {
        logs.push({
          id: `log-${i}-${s}`,
          date: dateStr,
          durationMinutes: 25,
          type: 'work',
          timestamp: new Date(d.getTime() - s * 30 * 60000).toISOString()
        });
      }
    }
  }
  return logs;
}

export function getTasks(): TaskCard[] {
  const data = localStorage.getItem('focusflow_tasks');
  if (!data) {
    localStorage.setItem('focusflow_tasks', JSON.stringify(INITIAL_TASKS));
    return INITIAL_TASKS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: TaskCard[]): void {
  localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
}

export function getSettings(): UserSettings {
  const data = localStorage.getItem('focusflow_settings');
  if (!data) {
    localStorage.setItem('focusflow_settings', JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem('focusflow_settings', JSON.stringify(settings));
}

export function getSessionLogs(): FocusSessionLog[] {
  const data = localStorage.getItem('focusflow_sessions');
  if (!data) {
    const initial = generateInitialActivity();
    localStorage.setItem('focusflow_sessions', JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function saveSessionLogs(logs: FocusSessionLog[]): void {
  localStorage.setItem('focusflow_sessions', JSON.stringify(logs));
}

export function getAlerts(): AlertMessage[] {
  const data = localStorage.getItem('focusflow_alerts');
  if (!data) {
    localStorage.setItem('focusflow_alerts', JSON.stringify(INITIAL_ALERTS));
    return INITIAL_ALERTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_ALERTS;
  }
}

export function saveAlerts(alerts: AlertMessage[]): void {
  localStorage.setItem('focusflow_alerts', JSON.stringify(alerts));
}
