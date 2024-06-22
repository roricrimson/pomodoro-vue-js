<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="flex flex-col" :class="{ 'h-full': !isKeyBoardVisible }">
        <div
          class="mx-5 mb-0 mt-10 p-5 rounded-3xl shadow-md shadow-[#989e8e] background-image"
        >
          <p class="text-white text-3xl it text-start mb-16 font-handjet">
            {{ statusText }}
          </p>

          <timer :count-timer="countTimer" @onCountDownEnd="updateProgress()" />
        </div>

        <div class="flex gap-2 px-10 py-4">
          <input
            class="flex-1 appearance-none border-[3px] border-[#828e80] rounded-xl h-3 checked:bg-[#828e80]"
            type="radio"
            :checked="numberOfWorkCount > 0"
            disabled
          />
          <input
            class="flex-1 appearance-none border-[3px] border-[#828e80] rounded-xl h-3 checked:bg-[#828e80]"
            type="radio"
            :checked="numberOfWorkCount > 1"
            disabled
          />
          <input
            class="flex-1 appearance-none border-[3px] border-[#828e80] rounded-xl h-3 checked:bg-[#828e80]"
            type="radio"
            :checked="numberOfWorkCount > 2"
            disabled
          />
          <input
            class="flex-1 appearance-none border-[3px] border-[#828e80] rounded-xl h-3 checked:bg-[#828e80]"
            type="radio"
            :checked="numberOfWorkCount > 3"
            disabled
          />
        </div>
        <Ambient />
        <TodoList />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from "@ionic/vue";
import { computed, onMounted, ref, watch } from "vue";
import TodoList from "@/components/todolist.vue";
import Ambient from "../components/Ambient.vue";
import timer from "../components/Timer.vue";
import confirmation_tone from "@/assets/audio/mixkit-confirmation-tone-2867.wav";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";

const isKeyBoardVisible = ref(false);
onMounted(() => {
  if (Capacitor.getPlatform() !== "web") {
    Keyboard.addListener("keyboardWillShow", (info) => {
      console.log("keyboard will show with height:", info.keyboardHeight);
      isKeyBoardVisible.value = true;
    });
    Keyboard.addListener("keyboardDidHide", () => {
      console.log("keyboard did hide");
      isKeyBoardVisible.value = false;
    });
  }
});

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

const statusText = computed(() => {
  if (isWork.value) {
    return "Work Time";
  }
  if (isBreak.value) {
    return "Break Time";
  }
  if (isLongBreak.value) {
    return "Long Break Time";
  }
  return ""; // Default return value if none of the conditions are met
});

const Break_time_sound = new Audio(confirmation_tone);

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
  --background: #fcfef3;
}

ion-content::part(scroll) {
  display: flex;
  flex-direction: column;
}

.sessions input[type="radio"]:checked {
  background-color: #828e80;
}

.background-image {
  background: url("@/assets/img/pomodoro-forest.png");
  background-size: contain;
  background-repeat: repeat-x; /* Ensures the image repeats horizontally */
  animation: slide 10s linear infinite alternate;
}

@keyframes slide {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100% 0;
  }
}
</style>
