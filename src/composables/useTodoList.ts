import { ref, computed, onMounted } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { TodoItem } from '@/types/pomodoro';
import { POMODORO_CONSTANTS } from '@/constants/pomodoro';

export function useTodoList() {
  const todoItems = ref<TodoItem[]>([]);
  const newTodoText = ref('');
  const errorMessage = ref<string>('');
  const isLoading = ref<boolean>(false);
  const retryCount = ref<number>(0);

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

  // Helper function to validate todo item structure
  function isValidTodoItem(item: any): item is TodoItem {
    return (
      item &&
      typeof item === 'object' &&
      typeof item.id === 'number' &&
      typeof item.name === 'string' &&
      typeof item.checked === 'boolean' &&
      item.name.trim().length > 0
    );
  }

  // Helper function to validate todo items array
  function validateTodoData(data: any): TodoItem[] {
    if (!Array.isArray(data)) {
      console.warn('Invalid todo data format: not an array');
      return [];
    }

    const validItems = data.filter(isValidTodoItem);
    
    if (validItems.length !== data.length) {
      console.warn(`Filtered out ${data.length - validItems.length} invalid todo items`);
    }

    return validItems;
  }

  // Show error message to user
  function showError(message: string, duration: number = 5000) {
    errorMessage.value = message;
    setTimeout(() => {
      errorMessage.value = '';
    }, duration);
  }

  // Clear error message
  function clearError() {
    errorMessage.value = '';
  }

  // Retry mechanism for failed operations
  async function withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 2
  ): Promise<T | null> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`${operationName} attempt ${attempt + 1} failed:`, error);
        
        if (attempt === maxRetries) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          showError(`Failed to ${operationName.toLowerCase()}: ${errorMsg}. Please try again.`);
          return null;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
    return null;
  }

  async function loadTodoItems() {
    isLoading.value = true;
    clearError();

    const result = await withRetry(async () => {
      const result = await Preferences.get({ key: POMODORO_CONSTANTS.TODO_STORAGE_KEY });
      
      if (result.value) {
        try {
          const parsedData = JSON.parse(result.value);
          return validateTodoData(parsedData);
        } catch (parseError) {
          console.error('Failed to parse todo data:', parseError);
          throw new Error('Corrupted todo data detected');
        }
      }
      
      return [];
    }, 'load todo items');

    if (result !== null) {
      todoItems.value = result;
    } else {
      // Fallback: keep existing todos if load fails
      showError('Failed to load saved todos. Using current state.');
    }

    isLoading.value = false;
  }

  async function saveTodoItems() {
    const result = await withRetry(async () => {
      // Validate data before saving
      const validatedData = validateTodoData(todoItems.value);
      
      await Preferences.set({
        key: POMODORO_CONSTANTS.TODO_STORAGE_KEY,
        value: JSON.stringify(validatedData),
      });
      
      return true;
    }, 'save todo items');

    if (result === null) {
      // If save fails, notify user but don't revert changes
      showError('Failed to save todos. Your changes may be lost when the app restarts.');
    }
  }

  // Manual save function with user feedback
  async function forceSave() {
    isLoading.value = true;
    await saveTodoItems();
    isLoading.value = false;
  }

  function addTodoItem() {
    const trimmedText = newTodoText.value.trim();
    if (!trimmedText) return;

    // Validate text length
    if (trimmedText.length > 200) {
      showError('Todo text is too long. Please keep it under 200 characters.');
      return;
    }

    // Generate a more robust ID
    const newItem: TodoItem = {
      id: Date.now() + Math.random() * 1000, // Reduce collision probability
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
    const trimmedName = newName.trim();
    
    // Validate new name
    if (!trimmedName) {
      showError('Todo name cannot be empty.');
      return;
    }

    if (trimmedName.length > 200) {
      showError('Todo text is too long. Please keep it under 200 characters.');
      return;
    }

    const item = todoItems.value.find(item => item.id === id);
    if (item) {
      item.name = trimmedName;
      saveTodoItems();
    }
  }

  return {
    // State
    todoItems,
    newTodoText,
    errorMessage,
    isLoading,
    
    // Computed
    sortedTodoItems,
    emptySlots,
    
    // Methods
    addTodoItem,
    removeTodoItem,
    toggleTodoItem,
    updateTodoItem,
    saveTodoItems,
    forceSave,
    clearError,
    
    // Internal methods (for testing)
    loadTodoItems,
  };
}
