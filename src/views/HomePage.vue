<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="flex flex-col max-w-[500px] w-full mx-auto" :class="{ 'h-full': !isKeyboardVisible }">
        <div
          class="mx-5 mb-0 mt-10 p-5 rounded-3xl shadow-[2px_2px_3px_0_#989e8e] background-image"
        >
          <p class="text-white text-2xl it text-start mb-16 font-handjet">
            {{ statusText }}
          </p>

          <CountdownTimer :count-timer="currentTimerDuration" @on-countdown-end="handleTimerComplete" />
        </div>

        <!-- Progress Indicators -->
        <div class="flex gap-2 px-10 py-4">
          <input
            v-for="(indicator, index) in progressIndicators"
            :key="index"
            class="flex-1 appearance-none border-[3px] border-[#999C89] rounded-xl h-3 checked:bg-[#999C89]"
            type="radio"
            :checked="indicator.isCompleted"
            disabled
          />
        </div>
        
        <AmbientSoundPlayer />
        <TodoList />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from "@ionic/vue";
import { onMounted, ref } from "vue";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";

import TodoList from "@/components/TodoApp/TodoList.vue";
import AmbientSoundPlayer from "@/components/AmbientSoundPlayer.vue";
import CountdownTimer from "@/components/CountDownTImer.vue";

import { usePomodoro } from "@/composables/usePomodoro";
import { useAudio } from "@/composables/useAudio";

// Keyboard visibility handling for mobile platforms
const isKeyboardVisible = ref(false);

onMounted(() => {
  if (Capacitor.getPlatform() !== "web") {
    Keyboard.addListener("keyboardWillShow", () => {
      isKeyboardVisible.value = true;
    });
    
    Keyboard.addListener("keyboardDidHide", () => {
      isKeyboardVisible.value = false;
    });
  }
});

// Pomodoro logic
const { 
  statusText, 
  currentTimerDuration, 
  progressIndicators, 
  advanceToNextSession 
} = usePomodoro();

// Audio handling
const { playSessionCompleteSound } = useAudio();

function handleTimerComplete() {
  playSessionCompleteSound();
  advanceToNextSession();
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

.background-image {
  background: url("@/assets/img/pomodoro-forest.webp");
  background-size: contain;
  background-repeat: repeat-x; /* Ensures the image repeats horizontally */
  animation: slide 500s linear infinite alternate;
}

@keyframes slide {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -5000% 0;
  }
}
</style>
