<template>
  <div class="flex items-end relative">
    <div class="flex gap-2 items-center" v-if="elapsedTime === 0">
      <p class="timer-digits font-bold">
        {{
          `${String(Math.floor(Math.floor(countTimer / 1000) / 60)).padStart(
            2,
            "0"
          )}`
        }}
      </p>
      <p class="timer-digits font-bold">
        {{ `${String(Math.floor(countTimer / 1000) % 60).padStart(2, "0")}` }}
      </p>
    </div>
    <div class="flex gap-[10px] items-center" v-else>
      <p class="timer-digits font-bold">{{ formatted.minutes }}</p>
      <p class="timer-digits font-bold">{{ formatted.seconds }}</p>
    </div>

    <div class="ms-auto self-end flex flex-row gap-1 relative">
      <button class="block leading-[0px]" @click="resetTimer" v-if="!isRunning">
        <ion-icon
          class="text-white text-2xl bottom-1"
          slot="icon-only"
          :icon="refresh"
        >
        </ion-icon>
      </button>
      <button class="block leading-[0px]" @click="startTimer" v-if="!isRunning">
        <ion-icon class="text-white text-2xl" slot="icon-only" :icon="play">
        </ion-icon>
      </button>
      <button class="block leading-[0px]" @click="stopTimer" v-else>
        <ion-icon class="text-white text-2xl" slot="icon-only" :icon="pause">
        </ion-icon>
      </button>
    </div>
  </div>
  <div></div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { IonIcon } from "@ionic/vue";
import { play, pause, refresh } from "ionicons/icons";
export interface Props {
  countTimer?: number;
}

const props = withDefaults(defineProps<Props>(), {
  countTimer: 25000,
});
const emit = defineEmits(["onCountDownEnd"]);

const timer = ref<NodeJS.Timer | undefined>(undefined);
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
  let seconds = Math.floor(elapsedTime.value / 1000);
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  const remainingMinutes = minutes % 60;

  return {
    minutes: `${String(remainingMinutes).padStart(2, "0")}`,
    seconds: `${String(seconds).padStart(2, "0")}`,
  };
});
</script>

<style scoped>
.highlights {
  background-color: #c6c8ba;
  border-radius: 15px;
  height: 50px;
  box-shadow: 1px 3px 3px #989e8e;
  position: absolute;
  bottom: -102px;
  left: -15px;
}
</style>
