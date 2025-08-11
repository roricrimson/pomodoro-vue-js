import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { POMODORO_CONSTANTS } from '@/constants/pomodoro';
import { TimerState } from '@/types/pomodoro';

/**
 * Global Timer Store for Pomodoro Application
 * 
 * This store centralizes timer state management and provides:
 * - Global access to timer state across components
 * - State persistence and restoration
 * - Timer lifecycle management
 * - Event notifications for timer state changes
 * 
 * Resolution for TECH-001: Implement global state management for timer
 */
export const useTimerStore = defineStore('timer', () => {
  // Core timer state
  const isRunning = ref(false);
  const elapsedTime = ref(0);
  const startTime = ref(0);
  const pausedTime = ref(0);
  const duration = ref(25 * 60 * 1000); // Default 25 minutes
  const wasRunningBeforeHide = ref(false);
  const isStateRestored = ref(false);
  
  // Timer instance
  const timerId = ref<number | undefined>(undefined);
  
  // Event callbacks
  const completionCallbacks = ref<(() => void)[]>([]);
  const stateChangeCallbacks = ref<((state: TimerState) => void)[]>([]);
  
  // Error handling
  const errorMessage = ref('');
  
  // Computed properties
  const remainingTime = computed(() => {
    return Math.max(elapsedTime.value, 0);
  });
  
  const formattedTime = computed(() => {
    const timeToDisplay = elapsedTime.value === 0 ? duration.value : elapsedTime.value;
    const totalSeconds = Math.floor(timeToDisplay / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
  });
  
  const progress = computed(() => {
    if (duration.value === 0) return 0;
    return ((duration.value - elapsedTime.value) / duration.value) * 100;
  });
  
  const currentState = computed((): TimerState => ({
    isRunning: isRunning.value,
    elapsedTime: elapsedTime.value,
    startTime: startTime.value,
    pausedTime: pausedTime.value,
    duration: duration.value,
    lastSaved: Date.now(),
  }));
  
  // State validation
  function isValidTimerState(data: any): data is TimerState {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.isRunning === 'boolean' &&
      typeof data.elapsedTime === 'number' &&
      typeof data.startTime === 'number' &&
      typeof data.pausedTime === 'number' &&
      typeof data.duration === 'number' &&
      typeof data.lastSaved === 'number' &&
      data.elapsedTime >= 0 &&
      data.duration > 0
    );
  }
  
  // Error handling
  function showError(message: string, timeout: number = 5000) {
    errorMessage.value = message;
    setTimeout(() => {
      errorMessage.value = '';
    }, timeout);
  }
  
  function clearError() {
    errorMessage.value = '';
  }
  
  // State persistence
  async function saveTimerState() {
    try {
      const state = currentState.value;
      await Preferences.set({
        key: POMODORO_CONSTANTS.TIMER_STATE_KEY,
        value: JSON.stringify(state),
      });
      
      // Notify state change callbacks
      stateChangeCallbacks.value.forEach(callback => callback(state));
    } catch (error) {
      console.error('Failed to save timer state:', error);
      showError('Failed to save timer progress');
    }
  }
  
  async function loadTimerState() {
    try {
      const result = await Preferences.get({ key: POMODORO_CONSTANTS.TIMER_STATE_KEY });
      
      if (result.value) {
        try {
          const parsedData = JSON.parse(result.value);
          
          if (isValidTimerState(parsedData)) {
            const now = Date.now();
            const timeSinceLastSave = now - parsedData.lastSaved;
            
            // Only restore if the saved duration matches current duration
            if (parsedData.duration === duration.value) {
              if (parsedData.isRunning) {
                // Timer was running when app was terminated
                const expectedEndTime = parsedData.startTime;
                const remainingTimeValue = Math.max(expectedEndTime - now, 0);
                
                if (remainingTimeValue > 0) {
                  // Timer should still be running
                  elapsedTime.value = remainingTimeValue;
                  startTime.value = expectedEndTime;
                  isRunning.value = true;
                  startInternalTimer();
                } else {
                  // Timer should have completed while app was terminated
                  resetTimer();
                  // Trigger completion callbacks
                  setTimeout(() => {
                    completionCallbacks.value.forEach(callback => callback());
                  }, 100);
                }
              } else if (parsedData.pausedTime > 0) {
                // Timer was paused when app was terminated
                elapsedTime.value = parsedData.elapsedTime;
                startTime.value = parsedData.startTime;
                pausedTime.value = parsedData.pausedTime;
                isRunning.value = false;
              } else {
                // Timer was reset or never started
                elapsedTime.value = parsedData.elapsedTime;
                startTime.value = parsedData.startTime;
                pausedTime.value = parsedData.pausedTime;
                isRunning.value = false;
              }
              
              isStateRestored.value = true;
            }
          } else {
            console.warn('Invalid timer state data, using defaults');
            showError('Timer state corrupted, using defaults');
          }
        } catch (parseError) {
          console.error('Failed to parse timer state:', parseError);
          showError('Failed to restore timer state');
        }
      }
    } catch (error) {
      console.error('Failed to load timer state:', error);
      showError('Failed to load timer settings');
    }
  }
  
  async function clearTimerState() {
    try {
      await Preferences.remove({ key: POMODORO_CONSTANTS.TIMER_STATE_KEY });
    } catch (error) {
      console.error('Failed to clear timer state:', error);
    }
  }
  
  // Timer control functions
  function startInternalTimer() {
    if (timerId.value) {
      clearInterval(timerId.value);
    }
    timerId.value = window.setInterval(updateTimer, POMODORO_CONSTANTS.TIMER_UPDATE_INTERVAL);
  }
  
  function updateTimer() {
    const remainingTimeValue = Math.max(startTime.value - Date.now(), 0);
    
    if (remainingTimeValue === 0) {
      resetTimer();
      completionCallbacks.value.forEach(callback => callback());
    } else {
      elapsedTime.value = remainingTimeValue;
      
      // Save state periodically while running (every 5 seconds)
      const now = Date.now();
      if (now % 5000 < POMODORO_CONSTANTS.TIMER_UPDATE_INTERVAL) {
        saveTimerState();
      }
    }

  }
  
  function startTimer() {
    if (isRunning.value) return;
    
    isRunning.value = true;
    const now = Date.now();
    
    if (pausedTime.value > 0) {
      // Resume from paused state
      startTime.value = now + elapsedTime.value;
      pausedTime.value = 0;
    } else {
      // Fresh start
      startTime.value = now + duration.value;
      elapsedTime.value = duration.value;
    }
    
    startInternalTimer();
    saveTimerState();
  }
  
  function pauseTimer() {
    if (!isRunning.value) return;
    
    if (timerId.value) {
      clearInterval(timerId.value);
      timerId.value = undefined;
    }
    isRunning.value = false;
    pausedTime.value = Date.now();
    
    saveTimerState();
  }
  
  function resetTimer() {
    if (timerId.value) {
      clearInterval(timerId.value);
      timerId.value = undefined;
    }
    elapsedTime.value = duration.value;
    isRunning.value = false;
    startTime.value = 0;
    pausedTime.value = 0;
    
    clearTimerState();
  }
  
  function setDuration(newDuration: number) {
    if (newDuration <= 0) return;
    
    // If timer is not running, update duration and reset elapsed time
    if (!isRunning.value) {
      duration.value = newDuration;
      elapsedTime.value = newDuration;
      clearTimerState();
    }
  }
  
  // Event management
  function onComplete(callback: () => void) {
    completionCallbacks.value.push(callback);
    
    // Return cleanup function
    return () => {
      const index = completionCallbacks.value.indexOf(callback);
      if (index > -1) {
        completionCallbacks.value.splice(index, 1);
      }
    };
  }
  
  function onStateChange(callback: (state: TimerState) => void) {
    stateChangeCallbacks.value.push(callback);
    
    // Return cleanup function
    return () => {
      const index = stateChangeCallbacks.value.indexOf(callback);
      if (index > -1) {
        stateChangeCallbacks.value.splice(index, 1);
      }
    };
  }
  
  // Cleanup function
  function cleanup() {
    if (timerId.value) {
      clearInterval(timerId.value);
      timerId.value = undefined;
    }
    completionCallbacks.value = [];
    stateChangeCallbacks.value = [];
  }
  
  // Handle page visibility changes
  function handleVisibilityChange() {
    if (document.hidden) {
      wasRunningBeforeHide.value = isRunning.value;
    } else {
      if (wasRunningBeforeHide.value && startTime.value > 0) {
        const now = Date.now();
        const remainingTimeValue = Math.max(startTime.value - now, 0);
        
        if (remainingTimeValue === 0) {
          resetTimer();
          completionCallbacks.value.forEach(callback => callback());
        } else {
          elapsedTime.value = remainingTimeValue;
          if (wasRunningBeforeHide.value && !isRunning.value) {
            isRunning.value = true;
            startInternalTimer();
          }
        }
      }
      wasRunningBeforeHide.value = false;
    }
  }
  
  // Initialize store
  function init() {
    // Set up page visibility listener
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Load saved state
    loadTimerState();
  }
  
  // Cleanup on store disposal
  function dispose() {
    cleanup();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Save final state
    if (isRunning.value || pausedTime.value > 0) {
      saveTimerState();
    }
  }
  
  // Watch for duration changes to handle session transitions
  watch(duration, async (newDuration, oldDuration) => {
    if (newDuration !== oldDuration && !isRunning.value) {
      await clearTimerState();
      elapsedTime.value = newDuration;
      startTime.value = 0;
      pausedTime.value = 0;
    }
  });
  
  return {
    // State
    isRunning,
    elapsedTime,
    duration,
    isStateRestored,
    errorMessage,
    
    // Computed
    remainingTime,
    formattedTime,
    progress,
    currentState,
    
    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    setDuration,
    
    // Event management
    onComplete,
    onStateChange,
    
    // Lifecycle
    init,
    dispose,
    
    // Error handling
    showError,
    clearError,
    
    // State management (for testing)
    saveTimerState,
    loadTimerState,
    clearTimerState,
    
    // Internal state (for testing)
    completionCallbacks,
    stateChangeCallbacks,
    startTime,
    wasRunningBeforeHide,
  };
});
