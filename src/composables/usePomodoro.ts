import { ref, computed } from 'vue';
import { TimerDuration } from '@/types/pomodoro';
import { DEFAULT_TIMER_DURATIONS, POMODORO_CONSTANTS, POMODORO_STATUS_TEXT } from '@/constants/pomodoro';

export function usePomodoro() {
  const workSessionsCompleted = ref(0);
  const isBreak = ref(false);
  const isWork = ref(true);
  const isLongBreak = ref(false);
  
  const timerDurations = ref<TimerDuration>({ ...DEFAULT_TIMER_DURATIONS });

  const currentTimerDuration = computed(() => {
    if (isWork.value) return timerDurations.value.work;
    if (isBreak.value) return timerDurations.value.shortBreak;
    if (isLongBreak.value) return timerDurations.value.longBreak;
    return 0;
  });

  const statusText = computed(() => {
    if (isWork.value) return POMODORO_STATUS_TEXT.WORK;
    if (isBreak.value) return POMODORO_STATUS_TEXT.BREAK;
    if (isLongBreak.value) return POMODORO_STATUS_TEXT.LONG_BREAK;
    return '';
  });

  const progressIndicators = computed(() => {
    return Array.from({ length: POMODORO_CONSTANTS.WORK_SESSIONS_BEFORE_LONG_BREAK }, (_, index) => ({
      isCompleted: workSessionsCompleted.value > index,
    }));
  });

  function advanceToNextSession() {
    if (isWork.value) {
      workSessionsCompleted.value++;
      
      // Check if it's time for a long break
      if (workSessionsCompleted.value >= POMODORO_CONSTANTS.WORK_SESSIONS_BEFORE_LONG_BREAK) {
        isLongBreak.value = true;
        isBreak.value = false;
      } else {
        isBreak.value = true;
        isLongBreak.value = false;
      }
      isWork.value = false;
    } else if (isBreak.value || isLongBreak.value) {
      // Return to work mode
      isWork.value = true;
      isBreak.value = false;
      isLongBreak.value = false;
      
      // Reset session count after long break
      if (isLongBreak.value) {
        workSessionsCompleted.value = 0;
      }
    }
  }

  function resetPomodoro() {
    workSessionsCompleted.value = 0;
    isWork.value = true;
    isBreak.value = false;
    isLongBreak.value = false;
  }

  return {
    // State
    workSessionsCompleted,
    isBreak,
    isWork,
    isLongBreak,
    timerDurations,
    
    // Computed
    currentTimerDuration,
    statusText,
    progressIndicators,
    
    // Methods
    advanceToNextSession,
    resetPomodoro,
  };
}
