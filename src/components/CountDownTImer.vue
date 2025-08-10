<template>
  <div class="flex items-end relative">
    <div class="flex gap-2 items-center" v-if="elapsedTime === 0">
      <p class="timer-digits font-bold">
        {{ initialFormattedTime.minutes }}
      </p>
      <p class="timer-digits font-bold">
        {{ initialFormattedTime.seconds }}
      </p>
    </div>
    <div class="flex gap-[10px] items-center" v-else>
      <p class="timer-digits font-bold">{{ formattedTime.minutes }}</p>
      <p class="timer-digits font-bold">{{ formattedTime.seconds }}</p>
    </div>

    <div class="ms-auto self-end flex flex-row gap-1 relative">
      <button class="block leading-[0px] active:bg-[#d3ddce] transition-colors" @click="resetTimer" v-if="!isRunning">
        <ion-icon
          class="text-white text-2xl bottom-1"
          slot="icon-only"
          :icon="refresh"
        >
        </ion-icon>
      </button>
      <button class="block leading-[0px] active:bg-[#d3ddce] transition-colors" @click="startTimer" v-if="!isRunning">
        <ion-icon class="text-white text-2xl" slot="icon-only" :icon="play">
        </ion-icon>
      </button>
      <button class="block leading-[0px] active:bg-[#d3ddce] transition-colors" @click="pauseTimer" v-else>
        <ion-icon class="text-white text-2xl" slot="icon-only" :icon="pause">
        </ion-icon>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { IonIcon } from "@ionic/vue";
import { play, pause, refresh } from "ionicons/icons";
import { useTimer } from "@/composables/useTimer";

interface Props {
  countTimer?: number;
}

const props = withDefaults(defineProps<Props>(), {
  countTimer: 25000,
});

const emit = defineEmits<{
  onCountdownEnd: [];
}>();

// Convert prop to reactive ref for the composable
const countTimerRef = toRef(props, 'countTimer');

// Use the timer composable
const { 
  isRunning, 
  elapsedTime, 
  formattedTime, 
  startTimer, 
  pauseTimer, 
  resetTimer: resetTimerComposable 
} = useTimer(countTimerRef, () => {
  emit('onCountdownEnd');
});

// Format initial time display
const initialFormattedTime = computed(() => {
  const totalSeconds = Math.floor(props.countTimer / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
});

function resetTimer() {
  resetTimerComposable();
}
</script>
