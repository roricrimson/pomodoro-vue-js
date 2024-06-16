<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div
        class="bg-[#9c7ebc] mx-[25px] mb-0 mt-[50px] p-[15px] rounded-3xl border-4 border-white"
      >
        <p class="timer-status" v-if="isWork">Work Time</p>
        <p class="timer-status" v-if="isBreak">Break Time</p>
        <p class="timer-status" v-if="isLongBreak">Long Break Time</p>

        <timer :count-timer="countTimer" @onCountDownEnd="updateProgress()" />
      </div>
      
      <div class="sessions">
        <input type="radio" :checked="numberOfWorkCount > 0" disabled />
        <input type="radio" :checked="numberOfWorkCount > 1" disabled />
        <input type="radio" :checked="numberOfWorkCount > 2" disabled />
        <input type="radio" :checked="numberOfWorkCount > 3" disabled />
      </div>
      <ambient />
      <todolist />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from "@ionic/vue";
import { computed, ref, watch } from "vue";
import todolist from "../components/TodoList.vue";
import ambient from "../components/Ambient.vue";
import timer from "../components/Timer.vue";
import confirmation_tone from "@/assets/audio/mixkit-confirmation-tone-2867.wav";

const numberOfWorkCount = ref(0);
const isBreak = ref(false);
const isWork = ref(true);
const isLongBreak = ref(false);
const Work_time = ref(25 * 60 * 1000);
const Break_time = ref(5 * 60 * 1000);
const Long_break_time = ref(15 * 60 * 1000);

const countTimer = computed(() => {
  if (isWork.value) {
    return Work_time.value;
  } else if (isBreak.value) {
    return Break_time.value;
  } else if (isLongBreak.value) {
    return Long_break_time.value;
  }
});

const Break_time_sound =  new Audio(confirmation_tone)

function updateProgress() {
  if (isWork.value) {
    Break_time_sound.play();
    numberOfWorkCount.value++;
    if (numberOfWorkCount.value > 3) {
      isLongBreak.value = true;
      isBreak.value = false;
    } else {
      isBreak.value = true;
      isLongBreak.value = false;
    }
    isWork.value = false;
  } else if (isBreak.value) {
    Break_time_sound.play();
    isWork.value = true;
    isBreak.value = false;
    isLongBreak.value = false;
  } else if (isLongBreak.value) {
    Break_time_sound.play();
    isWork.value = true;
    isBreak.value = false;
    isLongBreak.value = false;
    numberOfWorkCount.value = 0;
  }
}
</script>
<style scoped>
ion-content {
  --background: #e2dbc9;
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
  border: 2px solid white;
  width: 100%;
  height: 5px;
  border-radius: 10px;
  margin: 3px;
}

.sessions input[type="radio"]:checked {
  background-color: white;
}
</style>
