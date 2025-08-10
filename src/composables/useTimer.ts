import { ref, computed, Ref, onMounted, onUnmounted } from 'vue';
import { POMODORO_CONSTANTS } from '@/constants/pomodoro';

export function useTimer(duration: Ref<number> | number, onComplete?: () => void) {
  const timer = ref<number | undefined>(undefined);
  const isRunning = ref(false);
  const elapsedTime = ref(0);
  const startTime = ref(0);
  const pausedTime = ref(0);
  const wasRunningBeforeHide = ref(false);
  
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
  }

  function pauseTimer() {
    if (!isRunning.value) return;
    
    clearInterval(timer.value);
    isRunning.value = false;
    pausedTime.value = Date.now();
  }

  function resetTimer() {
    clearInterval(timer.value);
    elapsedTime.value = 0;
    isRunning.value = false;
    startTime.value = 0;
    pausedTime.value = 0;
  }

  function updateTimer() {
    const remainingTime = Math.max(startTime.value - Date.now(), 0);
    
    if (remainingTime === 0) {
      resetTimer();
      onComplete?.();
    }
    
    elapsedTime.value = remainingTime;
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

  // Set up page visibility listener on mount
  onMounted(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  });

  // Clean up event listener on unmount
  onUnmounted(() => {
    clearInterval(timer.value);
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  });

  return {
    // State
    isRunning,
    elapsedTime,
    
    // Computed
    formattedTime,
    
    // Methods
    startTimer,
    pauseTimer,
    resetTimer,
  };
}
