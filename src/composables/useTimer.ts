import { computed, onMounted, onUnmounted, Ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
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
 * - Reactive duration updates when props change
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

  // Cleanup function for completion callback
  let cleanupCallback: (() => void) | undefined;

  // Initialize store and set duration
  onMounted(() => {
    timerStore.init();
    setStoreDuration();
    
    // Register completion callback if provided
    if (onComplete) {
      cleanupCallback = timerStore.onComplete(onComplete);
    }
  });

  // Watch for duration changes and update store
  const stopWatching = watch(currentDuration, (newDuration) => {
    setStoreDuration();
  }, { immediate: false });

  onUnmounted(() => {
    // Stop watching duration changes
    stopWatching();
    
    // Cleanup completion callback
    if (cleanupCallback) {
      cleanupCallback();
    }
  });

  return {
    // State (reactive refs from store)
    ...storeToRefs(timerStore),
    
    // Methods (delegated to store)
    startTimer: timerStore.startTimer,
    pauseTimer: timerStore.pauseTimer,
    resetTimer: timerStore.resetTimer,
  };
}
