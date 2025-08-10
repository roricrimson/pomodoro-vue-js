import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { useTodoList } from '@/composables/useTodoList';
import { usePomodoro } from '@/composables/usePomodoro';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('Data Persistence Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useTodoList', () => {
    it('should handle failed data loading gracefully', async () => {
      // Mock a failed get operation
      vi.mocked(Preferences.get).mockRejectedValue(new Error('Storage unavailable'));

      const { errorMessage, loadTodoItems } = useTodoList();

      await loadTodoItems();

      // Should show error message but not crash
      expect(errorMessage.value).toContain('Failed to load saved todos');
    });

    it('should handle corrupted data gracefully', async () => {
      // Mock corrupted JSON data
      vi.mocked(Preferences.get).mockResolvedValue({
        value: '{ invalid json',
      });

      const { errorMessage, loadTodoItems } = useTodoList();

      await loadTodoItems();

      // Should show error message for corrupted data
      expect(errorMessage.value).toContain('Corrupted todo data detected');
    });

    it('should validate todo item data structure', async () => {
      // Mock invalid todo data structure
      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify([
          { id: 1, name: 'Valid todo', checked: false },
          { id: 'invalid', name: '', checked: 'not-boolean' }, // Invalid item
          { name: 'Missing id', checked: true }, // Missing id
        ]),
      });

      const { todoItems, loadTodoItems } = useTodoList();

      await loadTodoItems();

      // Should only keep valid items
      expect(todoItems.value).toHaveLength(1);
      expect(todoItems.value[0].name).toBe('Valid todo');
    });

    it('should handle failed save operations', async () => {
      // Mock a failed set operation
      vi.mocked(Preferences.set).mockRejectedValue(new Error('Storage full'));

      const { errorMessage, saveTodoItems } = useTodoList();

      await saveTodoItems();

      // Should show error message for failed save
      expect(errorMessage.value).toContain('Failed to save todos');
    });

    it('should validate todo text length', () => {
      const { newTodoText, errorMessage, addTodoItem } = useTodoList();

      // Test text that's too long
      newTodoText.value = 'a'.repeat(201);
      addTodoItem();

      expect(errorMessage.value).toContain('too long');
    });
  });

  describe('usePomodoro', () => {
    it('should handle failed pomodoro state loading', async () => {
      // Mock a failed get operation
      vi.mocked(Preferences.get).mockRejectedValue(new Error('Storage error'));

      const { errorMessage, loadPomodoroState } = usePomodoro();

      await loadPomodoroState();

      // Should show error message
      expect(errorMessage.value).toContain('Failed to load session state');
    });

    it('should validate pomodoro state data', async () => {
      // Mock invalid pomodoro state
      vi.mocked(Preferences.get).mockResolvedValue({
        value: JSON.stringify({
          workSessionsCompleted: -1, // Invalid value
          isBreak: 'not-boolean',
          isWork: true,
          isLongBreak: false,
        }),
      });

      const { workSessionsCompleted, loadPomodoroState } = usePomodoro();

      await loadPomodoroState();

      // Should fallback to default values for invalid data
      expect(workSessionsCompleted.value).toBe(0);
    });

    it('should handle corrupted pomodoro state', async () => {
      // Mock corrupted JSON
      vi.mocked(Preferences.get).mockResolvedValue({
        value: '{ corrupted json',
      });

      const { errorMessage, loadPomodoroState } = usePomodoro();

      await loadPomodoroState();

      // Should show error for corrupted data
      expect(errorMessage.value).toContain('Failed to restore session progress');
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry failed operations with exponential backoff', async () => {
      // Mock first two calls to fail, third to succeed
      vi.mocked(Preferences.get)
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Still failing'))
        .mockResolvedValueOnce({ value: '[]' });

      const { loadTodoItems } = useTodoList();

      await loadTodoItems();

      // Should have retried 3 times
      expect(Preferences.get).toHaveBeenCalledTimes(3);
    });

    it('should show error after max retries exceeded', async () => {
      // Mock all calls to fail
      vi.mocked(Preferences.get).mockRejectedValue(new Error('Persistent failure'));

      const { errorMessage, loadTodoItems } = useTodoList();

      await loadTodoItems();

      // Should show error after retries
      expect(errorMessage.value).toContain('Failed to load todo items');
      expect(Preferences.get).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});
