import { ref, computed, Ref } from 'vue';
import { POMODORO_CONSTANTS } from '@/constants/pomodoro';

export function useTimer(duration: Ref<number> | number, onComplete?: () => void) {
  const timer = ref<number | undefined>(undefined);
  const isRunning = ref(false);
  const elapsedTime = ref(0);
  const startTime = ref(0);
  
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
    startTime.value = Date.now() + (elapsedTime.value !== 0 ? elapsedTime.value : currentDuration.value);
    timer.value = window.setInterval(updateTimer, POMODORO_CONSTANTS.TIMER_UPDATE_INTERVAL);
  }

  function pauseTimer() {
    if (!isRunning.value) return;
    
    clearInterval(timer.value);
    isRunning.value = false;
  }

  function resetTimer() {
    clearInterval(timer.value);
    elapsedTime.value = 0;
    isRunning.value = false;
    startTime.value = 0;
  }

  function updateTimer() {
    const remainingTime = Math.max(startTime.value - Date.now(), 0);
    
    if (remainingTime === 0) {
      resetTimer();
      onComplete?.();
    }
    
    elapsedTime.value = remainingTime;
  }

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
