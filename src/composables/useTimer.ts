import { ref, computed, Ref, onMounted, onUnmounted, watch } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { POMODORO_CONSTANTS } from '@/constants/pomodoro';
import { TimerState } from '@/types/pomodoro';

/**
 * Timer composable with state persistence for app restoration
 * 
 * Features:
 * - Saves timer state (running, paused, elapsed time) to local storage
 * - Restores timer state when app is restarted
 * - Handles expired timers during app termination
 * - Validates restored state for data integrity
 * - Clears state on session transitions
 * - Periodic state saving during timer execution
 * 
 * Edge Case Resolution (EDGE-021): App State Restoration
 * This implementation ensures users don't lose timer progress when the app
 * is terminated by the system. The timer state is saved to Capacitor Preferences
 * and restored on app restart, maintaining accuracy across app lifecycles.
 */
export function useTimer(duration: Ref<number> | number, onComplete?: () => void) {
  const timer = ref<number | undefined>(undefined);
  const isRunning = ref(false);
  const elapsedTime = ref(0);
  const startTime = ref(0);
  const pausedTime = ref(0);
  const wasRunningBeforeHide = ref(false);
  const isStateRestored = ref(false);
  
  // Get current duration value
  const currentDuration = computed(() => 
    typeof duration === 'number' ? duration : duration.value
  );

  const formattedTime = computed(() => {
    const timeToDisplay = elapsedTime.value === 0 ? currentDuration.value : elapsedTime.value;
    const totalSeconds = Math.floor(timeToDisplay / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
  });

  // State persistence functions
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

  async function saveTimerState() {
    try {
      const state: TimerState = {
        isRunning: isRunning.value,
        elapsedTime: elapsedTime.value,
        startTime: startTime.value,
        pausedTime: pausedTime.value,
        duration: currentDuration.value,
        lastSaved: Date.now(),
      };

      await Preferences.set({
        key: POMODORO_CONSTANTS.TIMER_STATE_KEY,
        value: JSON.stringify(state),
      });
    } catch (error) {
      console.error('Failed to save timer state:', error);
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
            // This ensures we don't restore state from a different session type
            if (parsedData.duration === currentDuration.value) {
              if (parsedData.isRunning) {
                // Timer was running when app was terminated
                // Calculate how much time has passed since app termination
                const expectedEndTime = parsedData.startTime;
                const remainingTime = Math.max(expectedEndTime - now, 0);
                
                if (remainingTime > 0) {
                  // Timer should still be running
                  elapsedTime.value = remainingTime;
                  startTime.value = expectedEndTime;
                  isRunning.value = true;
                  timer.value = window.setInterval(updateTimer, POMODORO_CONSTANTS.TIMER_UPDATE_INTERVAL);
                } else {
                  // Timer should have completed while app was terminated
                  elapsedTime.value = 0;
                  startTime.value = 0;
                  pausedTime.value = 0;
                  isRunning.value = false;
                  // Trigger completion callback
                  setTimeout(() => onComplete?.(), 100);
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
          }
        } catch (parseError) {
          console.error('Failed to parse timer state:', parseError);
        }
      }
    } catch (error) {
      console.error('Failed to load timer state:', error);
    }
  }

  async function clearTimerState() {
    try {
      await Preferences.remove({ key: POMODORO_CONSTANTS.TIMER_STATE_KEY });
    } catch (error) {
      console.error('Failed to clear timer state:', error);
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
      startTime.value = now + currentDuration.value;
    }
    
    timer.value = window.setInterval(updateTimer, POMODORO_CONSTANTS.TIMER_UPDATE_INTERVAL);
    
    // Save state when timer starts
    saveTimerState();
  }

  function pauseTimer() {
    if (!isRunning.value) return;
    
    clearInterval(timer.value);
    isRunning.value = false;
    pausedTime.value = Date.now();
    
    // Save state when timer is paused
    saveTimerState();
  }

  function resetTimer() {
    clearInterval(timer.value);
    elapsedTime.value = 0;
    isRunning.value = false;
    startTime.value = 0;
    pausedTime.value = 0;
    
    // Clear saved state when timer is reset
    clearTimerState();
  }

  function updateTimer() {
    const remainingTime = Math.max(startTime.value - Date.now(), 0);
    
    if (remainingTime === 0) {
      resetTimer();
      onComplete?.();
    } else {
      elapsedTime.value = remainingTime;
      
      // Save state periodically while running (every 5 seconds)
      // This ensures we don't lose too much progress if app crashes
      const now = Date.now();
      if (now % 5000 < POMODORO_CONSTANTS.TIMER_UPDATE_INTERVAL) {
        saveTimerState();
      }
    }
  }

  // Handle page visibility changes to maintain timer accuracy
  function handleVisibilityChange() {
    if (document.hidden) {
      // Page is being hidden/backgrounded
      wasRunningBeforeHide.value = isRunning.value;
    } else {
      // Page is becoming visible again
      if (wasRunningBeforeHide.value && startTime.value > 0) {
        // Recalculate elapsed time based on actual time passed
        const now = Date.now();
        const remainingTime = Math.max(startTime.value - now, 0);
        
        if (remainingTime === 0) {
          // Timer should have completed while backgrounded
          resetTimer();
          onComplete?.();
        } else {
          // Update elapsed time and continue if was running
          elapsedTime.value = remainingTime;
          if (wasRunningBeforeHide.value && !isRunning.value) {
            // Restart timer if it was running before being hidden
            isRunning.value = true;
            timer.value = window.setInterval(updateTimer, POMODORO_CONSTANTS.TIMER_UPDATE_INTERVAL);
          }
        }
      }
      wasRunningBeforeHide.value = false;
    }
  }

  // Set up page visibility listener and load saved state on mount
  onMounted(async () => {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Load previously saved timer state
    await loadTimerState();
  });

  // Watch for duration changes to handle session transitions
  watch(currentDuration, async (newDuration, oldDuration) => {
    // If duration changed and timer is not running, it means we switched sessions
    // Clear the old timer state since it's no longer relevant
    if (newDuration !== oldDuration && !isRunning.value) {
      await clearTimerState();
      elapsedTime.value = 0;
      startTime.value = 0;
      pausedTime.value = 0;
    }
  });

  // Clean up event listener and save final state on unmount
  onUnmounted(async () => {
    clearInterval(timer.value);
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Save final state before unmounting
    if (isRunning.value || pausedTime.value > 0) {
      await saveTimerState();
    }
  });

  return {
    // State
    isRunning,
    elapsedTime,
    isStateRestored,
    
    // Computed
    formattedTime,
    
    // Methods
    startTimer,
    pauseTimer,
    resetTimer,
  };
}
