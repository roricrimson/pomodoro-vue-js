import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { useTimerStore } from '@/stores/useTimerStore';
import { setActivePinia, createPinia } from 'pinia';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

// Mock document for visibility API
Object.defineProperty(document, 'hidden', {
  writable: true,
  value: false,
});

describe('useTimerStore', () => {
  let store: ReturnType<typeof useTimerStore>;

  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Mock successful Preferences operations by default
    vi.mocked(Preferences.get).mockResolvedValue({ value: null });
    vi.mocked(Preferences.set).mockResolvedValue();
    vi.mocked(Preferences.remove).mockResolvedValue();
    
    // Create store instance
    store = useTimerStore();
  });

  afterEach(() => {
    // Clean up timers and event listeners
    store.dispose();
    vi.clearAllTimers();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      expect(store.isRunning).toBe(false);
      expect(store.elapsedTime).toBe(0);
      expect(store.duration).toBe(25 * 60 * 1000); // 25 minutes
      expect(store.isStateRestored).toBe(false);
      expect(store.errorMessage).toBe('');
    });

    it('should have correct computed properties', () => {
      store.setDuration(10000); // 10 seconds
      expect(store.formattedTime.minutes).toBe('00');
      expect(store.formattedTime.seconds).toBe('10');
      expect(store.progress).toBe(0);
    });
  });

  describe('Timer Control', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      store.setDuration(5000); // 5 seconds for faster tests
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should start timer correctly', () => {
      store.startTimer();
      
      expect(store.isRunning).toBe(true);
      expect(store.elapsedTime).toBe(5000);
      expect(Preferences.set).toHaveBeenCalled();
    });

    it('should not start timer if already running', () => {
      store.startTimer();
      const callCount = vi.mocked(Preferences.set).mock.calls.length;
      
      store.startTimer(); // Try to start again
      
      expect(vi.mocked(Preferences.set).mock.calls.length).toBe(callCount);
    });

    it('should pause timer correctly', () => {
      store.startTimer();
      store.pauseTimer();
      
      expect(store.isRunning).toBe(false);
      expect(store.elapsedTime).toBeGreaterThan(0);
      expect(Preferences.set).toHaveBeenCalledTimes(2); // Start + pause
    });

    it('should reset timer correctly', () => {
      store.startTimer();
      store.resetTimer();
      
      expect(store.isRunning).toBe(false);
      expect(store.elapsedTime).toBe(5000); // Back to duration
      expect(Preferences.remove).toHaveBeenCalled();
    });

    it('should resume from paused state', () => {
      store.startTimer();
      vi.advanceTimersByTime(1000);
      store.pauseTimer();
      
      const pausedElapsedTime = store.elapsedTime;
      
      store.startTimer(); // Resume
      
      expect(store.isRunning).toBe(true);
      expect(store.elapsedTime).toBeLessThanOrEqual(pausedElapsedTime);
    });

    it('should complete timer and trigger callbacks', () => {
      const completionCallback = vi.fn();
      store.onComplete(completionCallback);
      
      store.startTimer();
      vi.advanceTimersByTime(5000); // Complete the timer
      
      expect(store.isRunning).toBe(false);
      expect(store.elapsedTime).toBe(5000); // Reset to duration
      expect(completionCallback).toHaveBeenCalled();
    });

    it('should save state periodically while running', () => {
      store.startTimer();
      
      // Clear the initial save call
      vi.mocked(Preferences.set).mockClear();
      
      // Advance time by multiple intervals to ensure periodic save triggers
      // The periodic save logic checks `now % 5000 < TIMER_UPDATE_INTERVAL`
      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(1000); // 1 second at a time
      }
      
      // Should save periodically
      expect(Preferences.set).toHaveBeenCalled();
    });
  });

  describe('Duration Management', () => {
    it('should set duration correctly when not running', () => {
      const newDuration = 15 * 60 * 1000; // 15 minutes
      store.setDuration(newDuration);
      
      expect(store.duration).toBe(newDuration);
      expect(store.elapsedTime).toBe(newDuration);
    });

    it('should not change duration while timer is running', () => {
      const originalDuration = store.duration;
      store.startTimer();
      
      store.setDuration(10000);
      
      expect(store.duration).toBe(originalDuration);
    });

    it('should ignore invalid durations', () => {
      const originalDuration = store.duration;
      
      store.setDuration(0);
      expect(store.duration).toBe(originalDuration);
      
      store.setDuration(-1000);
      expect(store.duration).toBe(originalDuration);
    });
  });

  describe('State Persistence', () => {
    it('should save timer state correctly', async () => {
      store.startTimer();
      
      await store.saveTimerState();
      
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'TimerState',
        value: expect.stringContaining('"isRunning":true'),
      });
    });

    it('should load valid timer state', async () => {
      const mockState = {
        isRunning: false,
        elapsedTime: 15000,
        startTime: 0,
        pausedTime: Date.now(),
        duration: 25 * 60 * 1000,
        lastSaved: Date.now(),
      };

      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify(mockState),
      });

      await store.loadTimerState();

      expect(store.elapsedTime).toBe(15000);
      expect(store.isStateRestored).toBe(true);
    });

    it('should handle invalid state data gracefully', async () => {
      vi.mocked(Preferences.get).mockResolvedValue({
        value: '{ invalid json',
      });

      await store.loadTimerState();

      expect(store.errorMessage).toContain('Failed to restore timer state');
    });

    it('should handle corrupted state object', async () => {
      const invalidState = {
        isRunning: 'not a boolean',
        elapsedTime: 'not a number',
      };

      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify(invalidState),
      });

      await store.loadTimerState();

      expect(store.errorMessage).toContain('Timer state corrupted');
    });

    it('should restore running timer correctly', async () => {
      vi.useFakeTimers();
      const now = Date.now();
      const mockState = {
        isRunning: true,
        elapsedTime: 20000,
        startTime: now + 20000, // Timer has 20 seconds left
        pausedTime: 0,
        duration: 25 * 60 * 1000,
        lastSaved: now - 1000, // Saved 1 second ago
      };

      store.setDuration(25 * 60 * 1000);
      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify(mockState),
      });

      await store.loadTimerState();

      expect(store.isRunning).toBe(true);
      expect(store.isStateRestored).toBe(true);
      
      vi.useRealTimers();
    });

    it('should trigger completion for expired timer', async () => {
      vi.useFakeTimers();
      const completionCallback = vi.fn();
      store.onComplete(completionCallback);
      
      const now = Date.now();
      const mockState = {
        isRunning: true,
        elapsedTime: 20000,
        startTime: now - 5000, // Timer expired 5 seconds ago
        pausedTime: 0,
        duration: 25 * 60 * 1000,
        lastSaved: now - 10000,
      };

      store.setDuration(25 * 60 * 1000);
      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify(mockState),
      });

      await store.loadTimerState();

      // Advance timers to trigger completion callback
      vi.advanceTimersByTime(100);

      expect(store.isRunning).toBe(false);
      expect(completionCallback).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      vi.mocked(Preferences.set).mockRejectedValue(new Error('Storage full'));

      await store.saveTimerState();

      expect(store.errorMessage).toContain('Failed to save timer progress');
    });

    it('should handle load errors gracefully', async () => {
      vi.mocked(Preferences.get).mockRejectedValue(new Error('Storage unavailable'));

      await store.loadTimerState();

      expect(store.errorMessage).toContain('Failed to load timer settings');
    });

    it('should clear error messages after timeout', () => {
      vi.useFakeTimers();
      
      store.showError('Test error', 1000);
      expect(store.errorMessage).toBe('Test error');
      
      vi.advanceTimersByTime(1000);
      expect(store.errorMessage).toBe('');
      
      vi.useRealTimers();
    });

    it('should clear error manually', () => {
      store.showError('Test error');
      expect(store.errorMessage).toBe('Test error');
      
      store.clearError();
      expect(store.errorMessage).toBe('');
    });
  });

  describe('Event Management', () => {
    it('should register and trigger completion callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      store.onComplete(callback1);
      store.onComplete(callback2);
      
      // Trigger completion by manually calling callbacks
      store.completionCallbacks.forEach(cb => cb());
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should remove completion callbacks', () => {
      const callback = vi.fn();
      const cleanup = store.onComplete(callback);
      
      cleanup(); // Remove callback
      
      // Trigger completion
      store.completionCallbacks.forEach(cb => cb());
      
      expect(callback).not.toHaveBeenCalled();
    });

    it('should register and trigger state change callbacks', async () => {
      const callback = vi.fn();
      store.onStateChange(callback);
      
      await store.saveTimerState();
      
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({
        isRunning: false,
        elapsedTime: expect.any(Number),
        duration: expect.any(Number),
      }));
    });

    it('should remove state change callbacks', async () => {
      const callback = vi.fn();
      const cleanup = store.onStateChange(callback);
      
      cleanup(); // Remove callback
      
      await store.saveTimerState();
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Lifecycle Management', () => {
    it('should initialize correctly', () => {
      store.init();
      
      expect(Preferences.get).toHaveBeenCalled();
    });

    it('should cleanup on disposal', () => {
      store.startTimer();
      expect(store.isRunning).toBe(true);
      
      store.dispose();
      
      // Should save final state
      expect(Preferences.set).toHaveBeenCalled();
    });

    it('should clear state when duration changes', async () => {
      vi.useFakeTimers();
      
      store.setDuration(10000);
      store.resetTimer(); // Ensure not running
      
      // Change duration
      store.setDuration(20000);
      
      // Should clear stored state
      await vi.runAllTimersAsync();
      expect(Preferences.remove).toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('Page Visibility Handling', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      store.init(); // Initialize to set up event listeners
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should handle page becoming hidden', () => {
      store.startTimer();
      
      // Simulate page becoming hidden
      Object.defineProperty(document, 'hidden', { value: true });
      document.dispatchEvent(new Event('visibilitychange'));
      
      expect(store.wasRunningBeforeHide).toBe(true);
    });

    it('should restore timer when page becomes visible', () => {
      const now = Date.now();
      store.startTimer();
      store.startTime = now + 10000; // 10 seconds remaining
      
      // Simulate page becoming hidden then visible
      Object.defineProperty(document, 'hidden', { value: true });
      document.dispatchEvent(new Event('visibilitychange'));
      
      store.wasRunningBeforeHide = true;
      store.isRunning = false; // Simulate timer stopped
      
      Object.defineProperty(document, 'hidden', { value: false });
      document.dispatchEvent(new Event('visibilitychange'));
      
      expect(store.isRunning).toBe(true);
    });

    it('should complete timer if expired while hidden', () => {
      const completionCallback = vi.fn();
      store.onComplete(completionCallback);
      
      const now = Date.now();
      store.startTimer();
      store.startTime = now - 1000; // Timer expired 1 second ago
      
      // Simulate page becoming visible
      Object.defineProperty(document, 'hidden', { value: false });
      store.wasRunningBeforeHide = true;
      document.dispatchEvent(new Event('visibilitychange'));
      
      expect(store.isRunning).toBe(false);
      expect(completionCallback).toHaveBeenCalled();
    });
  });
});
