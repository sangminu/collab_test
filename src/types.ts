export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskCard {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  subTasks: SubTask[];
  priority: number; // 1, 2, 3, etc.
  highlightColor?: 'error' | 'yellow' | 'neutral' | 'primary';
  notes?: string;
  createdAt: string;
}

export type FocusSessionType = 'work' | 'shortBreak' | 'longBreak';

export interface FocusSessionLog {
  id: string;
  date: string; // "YYYY-MM-DD"
  durationMinutes: number;
  type: FocusSessionType;
  timestamp: string;
}

export interface DailyActivity {
  date: string; // "YYYY-MM-DD"
  sessionsCount: number;
  tasksCompletedCount: number;
}

export interface AlertMessage {
  id: string;
  title: string;
  timeLabel: string;
  icon: string;
}

export interface UserSettings {
  username: string;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  dailyGoalMinutes: number;
}
