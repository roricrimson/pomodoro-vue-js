import { computed, ref } from "vue";

export function useCountDownTimer() {
  const timer = ref(20);
  const interval = ref<any>(undefined);
  const status = ref<"counting" | "stop" | "finished" | "reset">("reset");

  const dislapyTimer = computed(() => {
    const tempTimer = Math.max(0, timer.value);

    const hours = Math.floor(tempTimer / 3600);
    const minutes = Math.floor((tempTimer % 3600) / 60);
    const remainingSeconds = tempTimer % 60;

    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(remainingSeconds).padStart(2, "0"),
    };
  });

  function startCountDown() {
    status.value = "counting";
    interval.value = setInterval(() => {
      timer.value--;
      if (timer.value <= 0) {
        clearInterval(interval.value);
        status.value = "finished";
      }
    }, 1000);
  }

  function start(timeInSeconds?: number) {
    timer.value = timeInSeconds ?? timer.value;
    clearInterval(interval.value);
    startCountDown();
  }

  function stop() {
    clearInterval(interval.value);
    status.value = "stop";
  }

  function resume() {
    startCountDown();
  }

  function reset(timeInSeconds: number) {
    timer.value = timeInSeconds;
    clearInterval(interval.value);
    status.value = "reset";
  }

  return { start, stop, resume, dislapyTimer, status, reset ,timer};
}
