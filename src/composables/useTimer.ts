import { computed, onMounted, onUnmounted, Ref } from 'vue';
import { useTimerStore } from '@/stores/useTimerStore';

/**
 * Timer composable that wraps the global timer store
 * 
 * This composable provides a familiar interface while using the global store
 * underneath. It maintains backward compatibility while leveraging centralized
 * state management.
 * 
 * Features:
 * - Delegates to global timer store for state management
 * - Provides scoped completion callbacks
 * - Maintains the same API as the original useTimer composable
 * - Handles duration changes for session transitions
 * 
 * Edge Case Resolution (EDGE-021): App State Restoration
 * This implementation ensures users don't lose timer progress when the app
 * is terminated by the system. The timer state is saved to Capacitor Preferences
 * and restored on app restart, maintaining accuracy across app lifecycles.
 * 
 * Resolution for TECH-001: Uses global timer store for state management
 */
export function useTimer(duration: Ref<number> | number, onComplete?: () => void) {
  const timerStore = useTimerStore();
  
  // Get current duration value
  const currentDuration = computed(() => 
    typeof duration === 'number' ? duration : duration.value
  );

  // Set duration when it changes
  const setStoreDuration = () => {
    timerStore.setDuration(currentDuration.value);
  };

  // Initialize store and set duration
  onMounted(() => {
    timerStore.init();
    setStoreDuration();
    
    // Register completion callback if provided
    if (onComplete) {
      const cleanup = timerStore.onComplete(onComplete);
      
      // Store cleanup function for later use
      onUnmounted(cleanup);
    }
  });

  // Update store duration when duration prop changes
  const unwatchDuration = computed(() => {
    setStoreDuration();
    return currentDuration.value;
  });

  onUnmounted(() => {
    // Store handles its own cleanup
  });

  return {
    // State (delegated to store)
    isRunning: timerStore.isRunning,
    elapsedTime: timerStore.elapsedTime,
    isStateRestored: timerStore.isStateRestored,
    
    // Computed (delegated to store)
    formattedTime: timerStore.formattedTime,
    
    // Methods (delegated to store)
    startTimer: timerStore.startTimer,
    pauseTimer: timerStore.pauseTimer,
    resetTimer: timerStore.resetTimer,
  };
}
