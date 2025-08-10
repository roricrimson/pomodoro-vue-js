import { TimerDuration } from '@/types/pomodoro';

export const POMODORO_CONSTANTS = {
  WORK_SESSIONS_BEFORE_LONG_BREAK: 4,
  TIMER_UPDATE_INTERVAL: 100, // milliseconds - reduced from 10ms for better performance
  TODO_STORAGE_KEY: 'TodoList',
  POMODORO_STATE_KEY: 'PomodoroState',
  TIMER_STATE_KEY: 'TimerState',
  MAX_VISIBLE_TODO_ITEMS: 4,
} as const;

export const DEFAULT_TIMER_DURATIONS: TimerDuration = {
  work: 25 * 60 * 1000,        // 25 minutes
  shortBreak: 5 * 60 * 1000,   // 5 minutes
  longBreak: 15 * 60 * 1000,   // 15 minutes
} as const;

export const POMODORO_STATUS_TEXT = {
  WORK: 'Work Time',
  BREAK: 'Break Time',
  LONG_BREAK: 'Long Break Time',
} as const;
