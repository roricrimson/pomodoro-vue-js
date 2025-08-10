import { ref, computed, onMounted } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { TodoItem } from '@/types/pomodoro';
import { POMODORO_CONSTANTS } from '@/constants/pomodoro';

export function useTodoList() {
  const todoItems = ref<TodoItem[]>([]);
  const newTodoText = ref('');

  // Computed properties
  const sortedTodoItems = computed(() => {
    return todoItems.value.slice().reverse();
  });

  const emptySlots = computed(() => {
    if (todoItems.value.length >= POMODORO_CONSTANTS.MAX_VISIBLE_TODO_ITEMS) {
      return [];
    }
    return Array.from({ 
      length: POMODORO_CONSTANTS.MAX_VISIBLE_TODO_ITEMS - todoItems.value.length 
    }, (_, i) => i);
  });

  // Initialize data
  onMounted(() => {
    loadTodoItems();
  });

  async function loadTodoItems() {
    try {
      const result = await Preferences.get({ key: POMODORO_CONSTANTS.TODO_STORAGE_KEY });
      if (result.value) {
        todoItems.value = JSON.parse(result.value);
      }
    } catch (error) {
      console.error('Failed to load todo items:', error);
    }
  }

  async function saveTodoItems() {
    try {
      await Preferences.set({
        key: POMODORO_CONSTANTS.TODO_STORAGE_KEY,
        value: JSON.stringify(todoItems.value),
      });
    } catch (error) {
      console.error('Failed to save todo items:', error);
    }
  }

  function addTodoItem() {
    const trimmedText = newTodoText.value.trim();
    if (!trimmedText) return;

    const newItem: TodoItem = {
      id: Date.now(),
      name: trimmedText,
      checked: false,
    };

    todoItems.value.push(newItem);
    newTodoText.value = '';
    saveTodoItems();
  }

  function removeTodoItem(id: number) {
    todoItems.value = todoItems.value.filter(item => item.id !== id);
    saveTodoItems();
  }

  function toggleTodoItem(id: number, isChecked: boolean) {
    const item = todoItems.value.find(item => item.id === id);
    if (item) {
      item.checked = isChecked;
      saveTodoItems();
    }
  }

  function updateTodoItem(id: number, newName: string) {
    const item = todoItems.value.find(item => item.id === id);
    if (item) {
      item.name = newName.trim();
      saveTodoItems();
    }
  }

  return {
    // State
    todoItems,
    newTodoText,
    
    // Computed
    sortedTodoItems,
    emptySlots,
    
    // Methods
    addTodoItem,
    removeTodoItem,
    toggleTodoItem,
    updateTodoItem,
    saveTodoItems,
  };
}
