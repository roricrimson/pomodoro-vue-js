<template>
  <div class="flex content-center gap-[15px] w-[200px] relative">
    <p class="timer-digits">{{ formatted.minutes }}</p>
    <p class="timer-digits">{{ formatted.seconds }}</p>
    <ion-button
      fill="clear"
      @click="resetTimer"
      class="absolute left-48 bottom-0"
      ><ion-icon slot="icon-only" :icon="refresh"></ion-icon
    ></ion-button>
    <ion-button fill="clear" class="highlights" @click="startTimer" v-if="!isRunning"> 
      <ion-icon slot="icon-only" :icon="play"></ion-icon>
    </ion-button>
    <ion-button fill="clear" class="highlights" @click="stopTimer" v-else
      ><ion-icon slot="icon-only" :icon="pause"></ion-icon
    ></ion-button>
  </div>
  <div>
    
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { IonIcon, IonButton } from "@ionic/vue";
import { play, pause, refresh } from "ionicons/icons";
export interface Props {
  countTimer?: number;
}

const props = withDefaults(defineProps<Props>(), {
  countTimer: 25000,
});
const emit = defineEmits(["onCountDownEnd"]);

const timer = ref<number | undefined>(undefined);
const isRunning = ref(false);
const elapsedTime = ref(0);
const startTime = ref(0);

function startTimer() {
  if (isRunning.value) return;
  isRunning.value = true;
  startTime.value =
    Date.now() +
    (elapsedTime.value !== 0 ? elapsedTime.value : props.countTimer);
  timer.value = setInterval(update, 10);
}

function stopTimer() {
  if (!isRunning.value) return;
  clearInterval(timer.value);
  isRunning.value = false;
}

function resetTimer() {
  clearInterval(timer.value);
  startTime.value = Date.now() + 25000;
  elapsedTime.value = 0;
  isRunning.value = false;
}

function update() {
  const _elapsedTime = Math.max(startTime.value - Date.now(), 0);
  if (_elapsedTime === 0) {
    resetTimer();
    emit("onCountDownEnd");
  }
  elapsedTime.value = _elapsedTime;
}

const formatted = computed(() => {
  const milliseconds = Math.floor((elapsedTime.value % 1000) / 10);
  let seconds = Math.floor(elapsedTime.value / 1000);
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return {
    minutes: `${String(remainingMinutes).padStart(2, "0")}`,
    seconds: `${String(seconds).padStart(2, "0")}`,
  };
});
</script>

<style scoped>
ion-icon {
  color: white;
  font-size: 30px;
 
}

.highlights {
  background-color: #DE79B1;
  border-radius: 10px;
  height: 50px;
  border-top: 2px solid white;
  border-left: 2px solid white;
  box-shadow: 1px 3px 3px #683a5481;
  position: absolute;
  bottom: -100px;
  left: -22px;
}
</style>
