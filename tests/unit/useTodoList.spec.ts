import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTodoList } from '../../src/composables/useTodoList';
import { Preferences } from '@capacitor/preferences';
import { createApp } from 'vue';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('useTodoList', () => {
  let app: any;

  beforeEach(() => {
    // Create a Vue app instance for proper context
    app = createApp({});
    
    // Mock Preferences
    (Preferences.get as any).mockResolvedValue({ value: null });
    (Preferences.set as any).mockResolvedValue(undefined);
    
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty todo list', () => {
      const todoList = useTodoList();
      
      expect(todoList.todoItems.value).toEqual([]);
      expect(todoList.errorMessage.value).toBe('');
      expect(todoList.isLoading.value).toBe(false);
    });

    it('should have correct computed properties', () => {
      const todoList = useTodoList();
      
      expect(todoList.sortedTodoItems.value).toEqual([]);
      expect(todoList.emptySlots.value).toHaveLength(4); // MAX_VISIBLE_TODO_ITEMS
    });
  });

  describe('Todo Operations', () => {
    it('should add new todo item', () => {
      const todoList = useTodoList();
      
      todoList.newTodoText.value = 'Test todo';
      todoList.addTodoItem();
      
      expect(todoList.todoItems.value).toHaveLength(1);
      expect(todoList.todoItems.value[0].name).toBe('Test todo');
      expect(todoList.todoItems.value[0].checked).toBe(false);
      expect(todoList.newTodoText.value).toBe('');
    });

    it('should not add empty todo item', () => {
      const todoList = useTodoList();
      
      todoList.newTodoText.value = '';
      todoList.addTodoItem();
      
      expect(todoList.todoItems.value).toHaveLength(0);
    });

    it('should toggle todo item checked state', () => {
      const todoList = useTodoList();
      
      todoList.newTodoText.value = 'Test todo';
      todoList.addTodoItem();
      const todoId = todoList.todoItems.value[0].id;
      
      todoList.toggleTodoItem(todoId, true);
      
      expect(todoList.todoItems.value[0].checked).toBe(true);
    });

    it('should delete todo item', () => {
      const todoList = useTodoList();
      
      todoList.newTodoText.value = 'Test todo';
      todoList.addTodoItem();
      const todoId = todoList.todoItems.value[0].id;
      
      todoList.removeTodoItem(todoId);
      
      expect(todoList.todoItems.value).toHaveLength(0);
    });

    it('should update todo item name', () => {
      const todoList = useTodoList();
      
      todoList.newTodoText.value = 'Original name';
      todoList.addTodoItem();
      const todoId = todoList.todoItems.value[0].id;
      
      todoList.updateTodoItem(todoId, 'Updated name');
      
      expect(todoList.todoItems.value[0].name).toBe('Updated name');
    });

    it('should not update todo item with empty name', () => {
      const todoList = useTodoList();
      
      todoList.newTodoText.value = 'Original name';
      todoList.addTodoItem();
      const todoId = todoList.todoItems.value[0].id;
      
      todoList.updateTodoItem(todoId, '');
      
      expect(todoList.todoItems.value[0].name).toBe('Original name');
      expect(todoList.errorMessage.value).toContain('cannot be empty');
    });
  });

  describe('Data Persistence', () => {
    it('should save todos to storage on changes', () => {
      const todoList = useTodoList();
      
      todoList.newTodoText.value = 'Test todo';
      todoList.addTodoItem();
      
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'TodoList',
        value: expect.stringContaining('"name":"Test todo"'),
      });
    });

    it('should load todos from storage', async () => {
      const mockData = JSON.stringify([
        { id: 1, name: 'Saved todo', checked: false }
      ]);
      
      (Preferences.get as any).mockResolvedValue({ value: mockData });
      
      const todoList = useTodoList();
      await todoList.loadTodoItems();
      
      expect(todoList.todoItems.value).toHaveLength(1);
      expect(todoList.todoItems.value[0].name).toBe('Saved todo');
    });

    it('should handle corrupted JSON gracefully', async () => {
      (Preferences.get as any).mockResolvedValue({ value: 'invalid json' });
      
      const todoList = useTodoList();
      await todoList.loadTodoItems();
      
      expect(todoList.errorMessage.value).toContain('Failed to load saved todos');
      expect(todoList.todoItems.value).toEqual([]);
    });

    it('should handle storage errors gracefully', async () => {
      (Preferences.get as any).mockRejectedValue(new Error('Storage error'));
      
      const todoList = useTodoList();
      await todoList.loadTodoItems();
      
      expect(todoList.errorMessage.value).toContain('Failed to load saved todos');
    });

    it('should retry failed operations', async () => {
      let callCount = 0;
      (Preferences.get as any).mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({ value: JSON.stringify([]) });
      });
      
      const todoList = useTodoList();
      await todoList.loadTodoItems();
      
      expect(Preferences.get).toHaveBeenCalledTimes(3); // Initial + 2 retries
      expect(todoList.todoItems.value).toEqual([]);
    });

    it('should show error after max retries', async () => {
      (Preferences.get as any).mockRejectedValue(new Error('Persistent failure'));
      
      const todoList = useTodoList();
      await todoList.loadTodoItems();
      
      expect(todoList.errorMessage.value).toContain('Failed to load saved todos');
      expect(Preferences.get).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Error Handling', () => {
    it('should show error messages', () => {
      const todoList = useTodoList();
      
      todoList.newTodoText.value = 'a'.repeat(201); // Too long
      todoList.addTodoItem();
      
      expect(todoList.errorMessage.value).toContain('too long');
    });

    it('should clear error messages', () => {
      const todoList = useTodoList();
      
      todoList.newTodoText.value = 'a'.repeat(201);
      todoList.addTodoItem();
      
      todoList.clearError();
      
      expect(todoList.errorMessage.value).toBe('');
    });
  });

  describe('ID Generation', () => {
    it('should generate unique IDs for todos', () => {
      const todoList = useTodoList();
      
      todoList.newTodoText.value = 'Todo 1';
      todoList.addTodoItem();
      
      todoList.newTodoText.value = 'Todo 2';
      todoList.addTodoItem();
      
      const id1 = todoList.todoItems.value[0].id;
      const id2 = todoList.todoItems.value[1].id;
      
      expect(id1).not.toBe(id2);
    });
  });

  describe('Text Validation', () => {
    it('should trim whitespace from todo names', () => {
      const todoList = useTodoList();
      
      todoList.newTodoText.value = '  Test todo  ';
      todoList.addTodoItem();
      
      expect(todoList.todoItems.value[0].name).toBe('Test todo');
    });

    it('should handle special characters in todo names', () => {
      const todoList = useTodoList();
      const specialName = '🎯 Complete project & test @home #important';
      
      todoList.newTodoText.value = specialName;
      todoList.addTodoItem();
      
      expect(todoList.todoItems.value[0].name).toBe(specialName);
    });
  });

  describe('Edge Cases', () => {
    it('should handle operations on non-existent todos gracefully', () => {
      const todoList = useTodoList();
      
      // Try to operate on non-existent ID
      todoList.toggleTodoItem(999, true);
      todoList.removeTodoItem(999);
      todoList.updateTodoItem(999, 'New name');
      
      // Should not throw errors
      expect(todoList.todoItems.value).toEqual([]);
    });

    it('should handle rapid consecutive operations', () => {
      const todoList = useTodoList();
      
      // Add multiple todos rapidly
      for (let i = 0; i < 10; i++) {
        todoList.newTodoText.value = `Todo ${i}`;
        todoList.addTodoItem();
      }
      
      expect(todoList.todoItems.value).toHaveLength(10);
    });
  });
});
