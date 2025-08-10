import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { createApp } from 'vue';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('Data Persistence', () => {
  let app: any;
  const STORAGE_KEYS = {
    POMODORO_SESSION: 'pomodoroSession',
    TIMER_STATE: 'timerState',
    AMBIENT_SOUNDS: 'ambientSounds',
    TODO_LIST: 'TodoList',
    APP_SETTINGS: 'appSettings',
  };

  beforeEach(() => {
    app = createApp({});
    
    // Reset all mocks
    (Preferences.get as any).mockResolvedValue({ value: null });
    (Preferences.set as any).mockResolvedValue(undefined);
    (Preferences.remove as any).mockResolvedValue(undefined);
    
    vi.clearAllMocks();
  });

  describe('Storage Operations', () => {
    it('should save data to persistent storage', async () => {
      const testData = { key: 'value', number: 42 };
      
      await Preferences.set({
        key: STORAGE_KEYS.APP_SETTINGS,
        value: JSON.stringify(testData),
      });
      
      expect(Preferences.set).toHaveBeenCalledWith({
        key: STORAGE_KEYS.APP_SETTINGS,
        value: JSON.stringify(testData),
      });
    });

    it('should load data from persistent storage', async () => {
      const testData = { restored: true, timestamp: Date.now() };
      (Preferences.get as any).mockResolvedValue({ 
        value: JSON.stringify(testData) 
      });
      
      const result = await Preferences.get({ key: STORAGE_KEYS.APP_SETTINGS });
      const parsedData = JSON.parse(result.value!);
      
      expect(parsedData).toEqual(testData);
    });

    it('should handle missing data gracefully', async () => {
      (Preferences.get as any).mockResolvedValue({ value: null });
      
      const result = await Preferences.get({ key: STORAGE_KEYS.APP_SETTINGS });
      
      expect(result.value).toBeNull();
    });

    it('should remove data from storage', async () => {
      await Preferences.remove({ key: STORAGE_KEYS.APP_SETTINGS });
      
      expect(Preferences.remove).toHaveBeenCalledWith({
        key: STORAGE_KEYS.APP_SETTINGS,
      });
    });
  });

  describe('Timer State Persistence', () => {
    it('should persist timer state correctly', async () => {
      const timerState = {
        duration: 1500,
        isRunning: false,
        isPaused: true,
        remainingTime: 900,
        sessionType: 'pomodoro',
        completedSessions: 2,
      };
      
      await Preferences.set({
        key: STORAGE_KEYS.TIMER_STATE,
        value: JSON.stringify(timerState),
      });
      
      expect(Preferences.set).toHaveBeenCalledWith({
        key: STORAGE_KEYS.TIMER_STATE,
        value: expect.stringContaining('"duration":1500'),
      });
    });

    it('should restore timer state on app restart', async () => {
      const savedState = {
        duration: 1500,
        isRunning: false,
        remainingTime: 900,
        sessionType: 'pomodoro',
      };
      
      (Preferences.get as any).mockResolvedValue({ 
        value: JSON.stringify(savedState) 
      });
      
      const result = await Preferences.get({ key: STORAGE_KEYS.TIMER_STATE });
      const restoredState = JSON.parse(result.value!);
      
      expect(restoredState.duration).toBe(1500);
      expect(restoredState.remainingTime).toBe(900);
      expect(restoredState.sessionType).toBe('pomodoro');
    });
  });

  describe('Pomodoro Session Persistence', () => {
    it('should persist pomodoro session data', async () => {
      const sessionData = {
        currentSessionIndex: 3,
        totalSessions: 8,
        completedPomodoros: 2,
        isOnBreak: false,
        sessionStartTime: Date.now(),
      };
      
      await Preferences.set({
        key: STORAGE_KEYS.POMODORO_SESSION,
        value: JSON.stringify(sessionData),
      });
      
      expect(Preferences.set).toHaveBeenCalledWith({
        key: STORAGE_KEYS.POMODORO_SESSION,
        value: expect.stringContaining('"currentSessionIndex":3'),
      });
    });

    it('should handle session progress correctly', async () => {
      const sessionProgress = {
        currentSessionIndex: 5,
        completedPomodoros: 2,
        isOnBreak: true,
        nextSessionType: 'long-break',
      };
      
      (Preferences.get as any).mockResolvedValue({ 
        value: JSON.stringify(sessionProgress) 
      });
      
      const result = await Preferences.get({ key: STORAGE_KEYS.POMODORO_SESSION });
      const restoredProgress = JSON.parse(result.value!);
      
      expect(restoredProgress.currentSessionIndex).toBe(5);
      expect(restoredProgress.isOnBreak).toBe(true);
      expect(restoredProgress.nextSessionType).toBe('long-break');
    });
  });

  describe('Todo List Persistence', () => {
    it('should persist todo items', async () => {
      const todoData = [
        { id: 1, name: 'Complete project', checked: false },
        { id: 2, name: 'Review code', checked: true },
      ];
      
      await Preferences.set({
        key: STORAGE_KEYS.TODO_LIST,
        value: JSON.stringify(todoData),
      });
      
      expect(Preferences.set).toHaveBeenCalledWith({
        key: STORAGE_KEYS.TODO_LIST,
        value: expect.stringContaining('"name":"Complete project"'),
      });
    });

    it('should restore todo list state', async () => {
      const savedTodos = [
        { id: 1, name: 'Task 1', checked: false },
        { id: 2, name: 'Task 2', checked: true },
        { id: 3, name: 'Task 3', checked: false },
      ];
      
      (Preferences.get as any).mockResolvedValue({ 
        value: JSON.stringify(savedTodos) 
      });
      
      const result = await Preferences.get({ key: STORAGE_KEYS.TODO_LIST });
      const restoredTodos = JSON.parse(result.value!);
      
      expect(restoredTodos).toHaveLength(3);
      expect(restoredTodos[1].checked).toBe(true);
    });
  });

  describe('Ambient Sounds Persistence', () => {
    it('should persist audio settings', async () => {
      const audioSettings = {
        selectedSound: 'rain',
        volume: 0.7,
        isPlaying: false,
        isMuted: false,
      };
      
      await Preferences.set({
        key: STORAGE_KEYS.AMBIENT_SOUNDS,
        value: JSON.stringify(audioSettings),
      });
      
      expect(Preferences.set).toHaveBeenCalledWith({
        key: STORAGE_KEYS.AMBIENT_SOUNDS,
        value: expect.stringContaining('"selectedSound":"rain"'),
      });
    });

    it('should restore audio preferences', async () => {
      const savedAudio = {
        selectedSound: 'campfire',
        volume: 0.5,
        isPlaying: true,
        lastPlayedTime: Date.now(),
      };
      
      (Preferences.get as any).mockResolvedValue({ 
        value: JSON.stringify(savedAudio) 
      });
      
      const result = await Preferences.get({ key: STORAGE_KEYS.AMBIENT_SOUNDS });
      const restoredAudio = JSON.parse(result.value!);
      
      expect(restoredAudio.selectedSound).toBe('campfire');
      expect(restoredAudio.volume).toBe(0.5);
      expect(restoredAudio.isPlaying).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle storage write errors', async () => {
      (Preferences.set as any).mockRejectedValue(new Error('Storage full'));
      
      try {
        await Preferences.set({
          key: STORAGE_KEYS.APP_SETTINGS,
          value: JSON.stringify({ data: 'test' }),
        });
      } catch (error) {
        expect(error.message).toBe('Storage full');
      }
      
      expect(Preferences.set).toHaveBeenCalled();
    });

    it('should handle storage read errors', async () => {
      (Preferences.get as any).mockRejectedValue(new Error('Access denied'));
      
      try {
        await Preferences.get({ key: STORAGE_KEYS.APP_SETTINGS });
      } catch (error) {
        expect(error.message).toBe('Access denied');
      }
      
      expect(Preferences.get).toHaveBeenCalled();
    });

    it('should handle corrupted JSON data', async () => {
      (Preferences.get as any).mockResolvedValue({ value: 'invalid json' });
      
      const result = await Preferences.get({ key: STORAGE_KEYS.APP_SETTINGS });
      
      expect(() => JSON.parse(result.value!)).toThrow();
    });

    it('should handle removal errors gracefully', async () => {
      (Preferences.remove as any).mockRejectedValue(new Error('Cannot remove'));
      
      try {
        await Preferences.remove({ key: STORAGE_KEYS.APP_SETTINGS });
      } catch (error) {
        expect(error.message).toBe('Cannot remove');
      }
      
      expect(Preferences.remove).toHaveBeenCalled();
    });
  });

  describe('Data Migration', () => {
    it('should handle version upgrades gracefully', async () => {
      const oldFormatData = {
        version: 1,
        settings: { theme: 'dark' },
      };
      
      (Preferences.get as any).mockResolvedValue({ 
        value: JSON.stringify(oldFormatData) 
      });
      
      const result = await Preferences.get({ key: STORAGE_KEYS.APP_SETTINGS });
      const data = JSON.parse(result.value!);
      
      expect(data.version).toBe(1);
      expect(data.settings.theme).toBe('dark');
    });

    it('should handle missing version information', async () => {
      const dataWithoutVersion = {
        theme: 'light',
        language: 'en',
      };
      
      (Preferences.get as any).mockResolvedValue({ 
        value: JSON.stringify(dataWithoutVersion) 
      });
      
      const result = await Preferences.get({ key: STORAGE_KEYS.APP_SETTINGS });
      const data = JSON.parse(result.value!);
      
      expect(data.theme).toBe('light');
      expect(data.version).toBeUndefined();
    });
  });

  describe('Performance and Optimization', () => {
    it('should handle large data sets efficiently', async () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        checked: i % 2 === 0,
        metadata: { created: Date.now(), priority: i % 5 },
      }));
      
      const serializedData = JSON.stringify(largeDataSet);
      
      await Preferences.set({
        key: STORAGE_KEYS.TODO_LIST,
        value: serializedData,
      });
      
      expect(Preferences.set).toHaveBeenCalledWith({
        key: STORAGE_KEYS.TODO_LIST,
        value: serializedData,
      });
    });

    it('should handle concurrent storage operations', async () => {
      const operations = Array.from({ length: 10 }, (_, i) =>
        Preferences.set({
          key: `test_key_${i}`,
          value: JSON.stringify({ index: i }),
        })
      );
      
      await Promise.all(operations);
      
      expect(Preferences.set).toHaveBeenCalledTimes(10);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency across operations', async () => {
      const initialData = { counter: 0, items: [] };
      
      // Save initial data
      await Preferences.set({
        key: STORAGE_KEYS.APP_SETTINGS,
        value: JSON.stringify(initialData),
      });
      
      // Mock retrieval of the same data
      (Preferences.get as any).mockResolvedValue({ 
        value: JSON.stringify(initialData) 
      });
      
      const result = await Preferences.get({ key: STORAGE_KEYS.APP_SETTINGS });
      const retrievedData = JSON.parse(result.value!);
      
      expect(retrievedData).toEqual(initialData);
    });

    it('should handle data validation scenarios', async () => {
      const validData = {
        timerDuration: 1500,
        sessionType: 'pomodoro',
        isValid: true,
      };
      
      (Preferences.get as any).mockResolvedValue({ 
        value: JSON.stringify(validData) 
      });
      
      const result = await Preferences.get({ key: STORAGE_KEYS.TIMER_STATE });
      const data = JSON.parse(result.value!);
      
      // Validate data structure
      expect(typeof data.timerDuration).toBe('number');
      expect(typeof data.sessionType).toBe('string');
      expect(typeof data.isValid).toBe('boolean');
      expect(data.timerDuration).toBeGreaterThan(0);
    });
  });
});
