import { ref, computed, onMounted, watch } from 'vue';
import { Preferences } from '@capacitor/preferences';
import { TimerDuration } from '@/types/pomodoro';
import { DEFAULT_TIMER_DURATIONS, POMODORO_CONSTANTS, POMODORO_STATUS_TEXT } from '@/constants/pomodoro';

interface PomodoroState {
  workSessionsCompleted: number;
  isBreak: boolean;
  isWork: boolean;
  isLongBreak: boolean;
  timerDurations: TimerDuration;
}

export function usePomodoro() {
  const workSessionsCompleted = ref(0);
  const isBreak = ref(false);
  const isWork = ref(true);
  const isLongBreak = ref(false);
  const errorMessage = ref<string>('');
  
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

  // Initialize data
  onMounted(() => {
    loadPomodoroState();
  });

  // Save state whenever important values change
  watch([workSessionsCompleted, isBreak, isWork, isLongBreak, timerDurations], () => {
    savePomodoroState();
  }, { deep: true });

  // Helper functions for error handling
  function showError(message: string, duration: number = 5000) {
    errorMessage.value = message;
    setTimeout(() => {
      errorMessage.value = '';
    }, duration);
  }

  function clearError() {
    errorMessage.value = '';
  }

  // Validate pomodoro state data
  function isValidPomodoroState(data: any): data is PomodoroState {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.workSessionsCompleted === 'number' &&
      typeof data.isBreak === 'boolean' &&
      typeof data.isWork === 'boolean' &&
      typeof data.isLongBreak === 'boolean' &&
      data.timerDurations &&
      typeof data.timerDurations.work === 'number' &&
      typeof data.timerDurations.shortBreak === 'number' &&
      typeof data.timerDurations.longBreak === 'number' &&
      data.workSessionsCompleted >= 0 &&
      data.workSessionsCompleted <= POMODORO_CONSTANTS.WORK_SESSIONS_BEFORE_LONG_BREAK
    );
  }

  async function loadPomodoroState() {
    try {
      const result = await Preferences.get({ key: POMODORO_CONSTANTS.POMODORO_STATE_KEY });
      
      if (result.value) {
        try {
          const parsedData = JSON.parse(result.value);
          
          if (isValidPomodoroState(parsedData)) {
            workSessionsCompleted.value = parsedData.workSessionsCompleted;
            isBreak.value = parsedData.isBreak;
            isWork.value = parsedData.isWork;
            isLongBreak.value = parsedData.isLongBreak;
            timerDurations.value = parsedData.timerDurations;
          } else {
            console.warn('Invalid pomodoro state data, using defaults');
          }
        } catch (parseError) {
          console.error('Failed to parse pomodoro state:', parseError);
          showError('Failed to restore session progress');
        }
      }
    } catch (error) {
      console.error('Failed to load pomodoro state:', error);
      showError('Failed to load session state');
    }
  }

  async function savePomodoroState() {
    try {
      const state: PomodoroState = {
        workSessionsCompleted: workSessionsCompleted.value,
        isBreak: isBreak.value,
        isWork: isWork.value,
        isLongBreak: isLongBreak.value,
        timerDurations: timerDurations.value,
      };

      await Preferences.set({
        key: POMODORO_CONSTANTS.POMODORO_STATE_KEY,
        value: JSON.stringify(state),
      });
    } catch (error) {
      console.error('Failed to save pomodoro state:', error);
      showError('Failed to save session progress');
    }
  }

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
      
      // Reset session count after long break
      if (isLongBreak.value) {
        workSessionsCompleted.value = 0;
      }
      
      isLongBreak.value = false;
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
    errorMessage,
    
    // Computed
    currentTimerDuration,
    statusText,
    progressIndicators,
    
    // Methods
    advanceToNextSession,
    resetPomodoro,
    clearError,
    
    // Internal methods (for testing)
    loadPomodoroState,
  };
}
