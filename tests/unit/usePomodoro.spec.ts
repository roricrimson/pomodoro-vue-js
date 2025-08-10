import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { usePomodoro } from '@/composables/usePomodoro';
import { DEFAULT_TIMER_DURATIONS } from '@/constants/pomodoro';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('usePomodoro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue();
    vi.mocked(Preferences.remove).mockResolvedValue();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const pomodoro = usePomodoro();
      
      expect(pomodoro.workSessionsCompleted.value).toBe(0);
      expect(pomodoro.isWork.value).toBe(true);
      expect(pomodoro.isBreak.value).toBe(false);
      expect(pomodoro.isLongBreak.value).toBe(false);
      expect(pomodoro.errorMessage.value).toBe('');
    });

    it('should have correct timer durations', () => {
      const pomodoro = usePomodoro();
      
      expect(pomodoro.timerDurations.value.work).toBe(DEFAULT_TIMER_DURATIONS.work);
      expect(pomodoro.timerDurations.value.shortBreak).toBe(DEFAULT_TIMER_DURATIONS.shortBreak);
      expect(pomodoro.timerDurations.value.longBreak).toBe(DEFAULT_TIMER_DURATIONS.longBreak);
    });

    it('should have correct computed properties', () => {
      const pomodoro = usePomodoro();
      
      expect(pomodoro.currentTimerDuration.value).toBe(DEFAULT_TIMER_DURATIONS.work);
      expect(pomodoro.statusText.value).toBe('Work Time');
      expect(pomodoro.progressIndicators.value).toHaveLength(4);
      expect(pomodoro.progressIndicators.value.every(indicator => !indicator.isCompleted)).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should advance from work to short break', () => {
      const pomodoro = usePomodoro();
      
      pomodoro.advanceToNextSession();
      
      expect(pomodoro.workSessionsCompleted.value).toBe(1);
      expect(pomodoro.isWork.value).toBe(false);
      expect(pomodoro.isBreak.value).toBe(true);
      expect(pomodoro.isLongBreak.value).toBe(false);
      expect(pomodoro.statusText.value).toBe('Break Time');
    });

    it('should advance from short break back to work', () => {
      const pomodoro = usePomodoro();
      
      // Set to break state
      pomodoro.isWork.value = false;
      pomodoro.isBreak.value = true;
      pomodoro.workSessionsCompleted.value = 1;
      
      pomodoro.advanceToNextSession();
      
      expect(pomodoro.isWork.value).toBe(true);
      expect(pomodoro.isBreak.value).toBe(false);
      expect(pomodoro.isLongBreak.value).toBe(false);
      expect(pomodoro.workSessionsCompleted.value).toBe(1); // Should not reset
    });

    it('should advance to long break after 4 work sessions', () => {
      const pomodoro = usePomodoro();
      
      // Complete 3 sessions first
      pomodoro.workSessionsCompleted.value = 3;
      
      pomodoro.advanceToNextSession();
      
      expect(pomodoro.workSessionsCompleted.value).toBe(4);
      expect(pomodoro.isWork.value).toBe(false);
      expect(pomodoro.isBreak.value).toBe(false);
      expect(pomodoro.isLongBreak.value).toBe(true);
      expect(pomodoro.statusText.value).toBe('Long Break Time');
    });

    it('should reset sessions after long break', () => {
      const pomodoro = usePomodoro();
      
      // Set to long break state
      pomodoro.isWork.value = false;
      pomodoro.isLongBreak.value = true;
      pomodoro.workSessionsCompleted.value = 4;
      
      pomodoro.advanceToNextSession();
      
      expect(pomodoro.workSessionsCompleted.value).toBe(0);
      expect(pomodoro.isWork.value).toBe(true);
      expect(pomodoro.isBreak.value).toBe(false);
      expect(pomodoro.isLongBreak.value).toBe(false);
    });

    it('should reset pomodoro state correctly', () => {
      const pomodoro = usePomodoro();
      
      // Set to some advanced state
      pomodoro.workSessionsCompleted.value = 3;
      pomodoro.isWork.value = false;
      pomodoro.isBreak.value = true;
      
      pomodoro.resetPomodoro();
      
      expect(pomodoro.workSessionsCompleted.value).toBe(0);
      expect(pomodoro.isWork.value).toBe(true);
      expect(pomodoro.isBreak.value).toBe(false);
      expect(pomodoro.isLongBreak.value).toBe(false);
    });
  });

  describe('Progress Indicators', () => {
    it('should show correct progress after completing sessions', () => {
      const pomodoro = usePomodoro();
      
      pomodoro.workSessionsCompleted.value = 2;
      
      const indicators = pomodoro.progressIndicators.value;
      expect(indicators[0].isCompleted).toBe(true);
      expect(indicators[1].isCompleted).toBe(true);
      expect(indicators[2].isCompleted).toBe(false);
      expect(indicators[3].isCompleted).toBe(false);
    });

    it('should reset progress indicators after long break', () => {
      const pomodoro = usePomodoro();
      
      pomodoro.workSessionsCompleted.value = 4;
      pomodoro.resetPomodoro();
      
      const indicators = pomodoro.progressIndicators.value;
      expect(indicators.every(indicator => !indicator.isCompleted)).toBe(true);
    });
  });

  describe('Timer Duration Computed', () => {
    it('should return work duration during work session', () => {
      const pomodoro = usePomodoro();
      
      expect(pomodoro.currentTimerDuration.value).toBe(DEFAULT_TIMER_DURATIONS.work);
    });

    it('should return short break duration during break', () => {
      const pomodoro = usePomodoro();
      
      pomodoro.isWork.value = false;
      pomodoro.isBreak.value = true;
      
      expect(pomodoro.currentTimerDuration.value).toBe(DEFAULT_TIMER_DURATIONS.shortBreak);
    });

    it('should return long break duration during long break', () => {
      const pomodoro = usePomodoro();
      
      pomodoro.isWork.value = false;
      pomodoro.isLongBreak.value = true;
      
      expect(pomodoro.currentTimerDuration.value).toBe(DEFAULT_TIMER_DURATIONS.longBreak);
    });

    it('should return 0 for invalid state', () => {
      const pomodoro = usePomodoro();
      
      // Set invalid state (all false)
      pomodoro.isWork.value = false;
      pomodoro.isBreak.value = false;
      pomodoro.isLongBreak.value = false;
      
      expect(pomodoro.currentTimerDuration.value).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should show error message', async () => {
      vi.useFakeTimers();
      const pomodoro = usePomodoro();
      
      // Access the internal showError function through the composable
      // Since it's not exposed, we'll test through an error scenario
      vi.mocked(Preferences.get).mockRejectedValue(new Error('Storage error'));
      
      await pomodoro.loadPomodoroState();
      
      // Wait for the error to be processed
      vi.advanceTimersByTime(100);
      
      expect(pomodoro.errorMessage.value).toContain('Failed to load session state');
      
      vi.useRealTimers();
    });

    it('should clear error message', () => {
      const pomodoro = usePomodoro();
      
      // Set an error message first
      pomodoro['errorMessage'].value = 'Test error';
      
      pomodoro.clearError();
      
      expect(pomodoro.errorMessage.value).toBe('');
    });

    it('should auto-clear error message after timeout', async () => {
      vi.useFakeTimers();
      const pomodoro = usePomodoro();
      
      // Trigger an error
      vi.mocked(Preferences.get).mockRejectedValue(new Error('Test error'));
      await pomodoro.loadPomodoroState();
      
      // Check error is set
      vi.advanceTimersByTime(100);
      expect(pomodoro.errorMessage.value).not.toBe('');
      
      // Check error is cleared after timeout (5 seconds)
      vi.advanceTimersByTime(5000);
      expect(pomodoro.errorMessage.value).toBe('');
      
      vi.useRealTimers();
    });
  });

  describe('State Persistence', () => {
    it('should save state on changes', async () => {
      vi.useFakeTimers();
      
      const pomodoro = usePomodoro();
      
      // Change state
      pomodoro.advanceToNextSession();
      
      // Wait for watcher to trigger
      await vi.runAllTimersAsync();
      
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'PomodoroState',
        value: expect.stringContaining('"workSessionsCompleted":1'),
      });
      
      vi.useRealTimers();
    });

    it('should load saved state correctly', async () => {
      const savedState = {
        workSessionsCompleted: 2,
        isBreak: true,
        isWork: false,
        isLongBreak: false,
        timerDurations: DEFAULT_TIMER_DURATIONS,
      };

      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify(savedState),
      });

      const pomodoro = usePomodoro();
      await pomodoro.loadPomodoroState();

      expect(pomodoro.workSessionsCompleted.value).toBe(2);
      expect(pomodoro.isBreak.value).toBe(true);
      expect(pomodoro.isWork.value).toBe(false);
      expect(pomodoro.isLongBreak.value).toBe(false);
    });

    it('should validate state data structure', async () => {
      const invalidState = {
        workSessionsCompleted: 'not a number',
        isBreak: 'not a boolean',
      };

      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify(invalidState),
      });

      const pomodoro = usePomodoro();
      await pomodoro.loadPomodoroState();

      // Should use default values for invalid state
      expect(pomodoro.workSessionsCompleted.value).toBe(0);
      expect(pomodoro.isBreak.value).toBe(false);
      expect(pomodoro.isWork.value).toBe(true);
    });

    it('should handle corrupted JSON gracefully', async () => {
      vi.mocked(Preferences.get).mockResolvedValue({
        value: '{ invalid json',
      });

      const pomodoro = usePomodoro();
      await pomodoro.loadPomodoroState();

      expect(pomodoro.errorMessage.value).toContain('Failed to restore session progress');
    });

    it('should handle storage errors gracefully', async () => {
      vi.mocked(Preferences.get).mockRejectedValue(new Error('Storage unavailable'));

      const pomodoro = usePomodoro();
      await pomodoro.loadPomodoroState();

      expect(pomodoro.errorMessage.value).toContain('Failed to load session state');
    });

    it('should validate session count bounds', async () => {
      const invalidState = {
        workSessionsCompleted: 10, // Above maximum
        isBreak: false,
        isWork: true,
        isLongBreak: false,
        timerDurations: DEFAULT_TIMER_DURATIONS,
      };

      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify(invalidState),
      });

      const pomodoro = usePomodoro();
      await pomodoro.loadPomodoroState();

      // Should use default values for invalid session count
      expect(pomodoro.workSessionsCompleted.value).toBe(0);
    });
  });

  describe('Custom Timer Durations', () => {
    it('should allow updating timer durations', () => {
      const pomodoro = usePomodoro();
      const customDurations = {
        work: 30 * 60 * 1000, // 30 minutes
        shortBreak: 10 * 60 * 1000, // 10 minutes
        longBreak: 20 * 60 * 1000, // 20 minutes
      };

      pomodoro.timerDurations.value = customDurations;

      expect(pomodoro.timerDurations.value).toEqual(customDurations);
      expect(pomodoro.currentTimerDuration.value).toBe(customDurations.work);
    });

    it('should save custom durations to storage', async () => {
      vi.useFakeTimers();
      
      const pomodoro = usePomodoro();
      const customDurations = {
        work: 30 * 60 * 1000,
        shortBreak: 10 * 60 * 1000,
        longBreak: 20 * 60 * 1000,
      };

      pomodoro.timerDurations.value = customDurations;

      // Wait for watcher to trigger
      await vi.runAllTimersAsync();

      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'PomodoroState',
        value: expect.stringContaining('"work":1800000'), // 30 minutes in ms
      });
      
      vi.useRealTimers();
    });
  });
});
