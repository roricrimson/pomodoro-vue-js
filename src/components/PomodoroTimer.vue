<template>
  <div class="bg-[#9c7ebc] mx-[25px] mb-0 mt-[50px] p-[15px] rounded-lg border-3 border-white">
    <p class="timer-status" v-if="!isBreak">Work Time</p>
    <p class="timer-status" v-if="isBreak && numberOfWorkCount <= 3">
      Break Time
    </p>
    <p class="timer-status" v-if="isBreak && numberOfWorkCount > 3">
      Long Break Time
    </p>
    <div class="flex">
      <div class="flex content-center gap-[15px] w-[200px]">
        <p class="timer-digits">{{ dislapyTimer.minutes }}</p>
        <p class="timer-digits">{{ dislapyTimer.seconds }}</p>
      </div>

      <div class="flex-col w-[60px] relative">
        <ion-button
          fill="clear"
          class="absolute top-0"
          @click="resetTimer"
          v-if="status === 'stop'"
          ><ion-icon slot="icon-only" :icon="square"></ion-icon
        ></ion-button>
        <ion-button
          fill="clear"
          class="absolute bottom-0"
          @click="startTimer"
          v-if="status === 'reset' || status === 'finished'"
        >
          <ion-icon slot="icon-only" :icon="play"></ion-icon>
        </ion-button>
        <ion-button
          fill="clear"
          class="absolute bottom-0"
          @click="stop"
          v-if="status === 'counting'"
          ><ion-icon slot="icon-only" :icon="pause"></ion-icon
        ></ion-button>
        <ion-button
          fill="clear"
          class="absolute bottom-0"
          @click="resume"
          v-if="status === 'stop'"
          ><ion-icon slot="icon-only" :icon="play"></ion-icon
        ></ion-button>
      </div>
    </div>
  </div>
  <div class="sessions">
    <input type="radio" :checked="numberOfWorkCount > 0" disabled />
    <input type="radio" :checked="numberOfWorkCount > 1" disabled />
    <input type="radio" :checked="numberOfWorkCount > 2" disabled />
    <input type="radio" :checked="numberOfWorkCount > 3" disabled />
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from "@ionic/vue";
import { play, pause, square } from "ionicons/icons";
import { useCountDownTimer } from "@/composables/useCountDownTimer";
import Sound from "@/assets/audio/short-success-sound-glockenspiel-treasure-video-game-6346.mp3";
import { computed, ref, watch } from "vue";

const { start, stop, resume, dislapyTimer, status, reset, timer } =
  useCountDownTimer();

const isBreak = ref(false);
const numberOfWorkCount = ref(0);
const Work_time = ref(20);
const Break_time = ref(5);
const Long_break_time = ref(10);
const afterLongBreak = ref(false);
const alarmSound = new Audio(Sound);

watch(status, (value) => {
  console.log(value);
  console.log(isBreak.value);
  if (value === "finished") {
    isBreak.value = !isBreak.value;
    if (isBreak.value && numberOfWorkCount.value > 3) {
      alarmSound.play();
      setTimeout(() => {
        start(Long_break_time.value);
      }, 1000);
      afterLongBreak.value = true;
    } else if (isBreak.value) {
      alarmSound.play();
      setTimeout(() => {
        start(Break_time.value);
      }, 1000);
    }
  }
});

function startTimer() {
  if (!isBreak.value) {
    start(Work_time.value);
    numberOfWorkCount.value++;
    if (afterLongBreak.value) {
      numberOfWorkCount.value = 1;
      afterLongBreak.value = false;
    }
  }
}

function resetTimer() {
  if (!isBreak.value && !afterLongBreak.value) {
    numberOfWorkCount.value--;
  }
  reset(Work_time.value);
}
</script>
<style scoped>
ion-icon {
  color: white;
  font-size: 35px;
}

.sessions {
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 40px;
}

.sessions input[type="radio"] {
  appearance: none;
  background-color: transparent;
  border: 1px solid white;
  width: 100%;
  height: 5px;
  border-radius: 10px;
  margin: 3px;
}

.sessions input[type="radio"]:checked {
  background-color: white;
}
</style>
