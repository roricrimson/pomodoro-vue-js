<template>
  <div class="w-full flex gap-2 px-5 h-14">
    <button
      @click="isDropdownOpen = true"
      class="bg-[#c6c8ba] w-16 rounded-xl shadow-[2px_2px_3px_0_#989e8e] p-2 flex justify-center items-center"
    >
      <ion-icon class="text-white text-3xl" :icon="options"></ion-icon>
    </button>
    <div
      class="bg-[#F5EEDE] shadow-[2px_2px_3px_0_#989e8e] rounded-xl w-full text-[#C4C7B4] text-start font-semibold px-6 flex"
    >
      <MusicWaveAnimation :play="!areAllSoundsPaused" />
    </div>
  </div>
  <ion-popover
    alignment="center"
    :show-backdrop="false"
    :is-open="isDropdownOpen"
    @didDismiss="isDropdownOpen = false"
  >
    <ion-content>
      <div
        class="p-4 bg-[#F5EEDE] rounded-3xl shadow-[2px_2px_3px_0_#989e8e] h-full"
      >
        <div class="flex justify-between mb-2">
          <button fill="clear" @click="isDropdownOpen = false">
            <ion-icon
              class="text-[#7F8579] text-2xl"
              slot="icon-only"
              :icon="close"
            ></ion-icon>
          </button>
          <button
            class="bg-[#7F8579] p-2 py-1 rounded-md highlights"
            v-if="playbackHistory.length > 0"
            @click="toggleAllSounds()"
          >
            <p class="text-[12px] text-white" v-if="areAllSoundsPaused">Resume</p>
            <p class="text-[12px] text-white" v-else>Pause All</p>
          </button>
        </div>
        <div class="rounded-lg">
          <div v-for="sound in soundsList" :key="sound.name">
            <div class="flex items-center justify-between">
              <p class="text-[15px] text-[#7F8579]">{{ sound.name }}</p>
              <ion-button fill="clear" @click="toggleSound(sound)"
                ><ion-icon
                  class="text-[#7F8579] text-2xl"
                  slot="icon-only"
                  :icon="play"
                  v-if="!sound.isPlaying"
                ></ion-icon>
                <ion-icon
                  class="text-[#7F8579] text-2xl"
                  slot="icon-only"
                  :icon="pause"
                  v-else
                ></ion-icon>
              </ion-button>
            </div>
            <div class="flex">
              <ion-icon
                slot="icon-only"
                :icon="volumeHigh"
                class="m-2 text-[#7F8579] text-2xl"
              ></ion-icon>
              <ion-range
                aria-label="Range with pin"
                :pin="true"
                :pin-formatter="volumeFormatter"
                @ionChange="adjustVolume($event, sound)"
                :value="sound.volume"
              ></ion-range>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-popover>
</template>

<script setup lang="ts">
import {
  IonIcon,
  IonButton,
  IonRange,
  IonContent,
  IonPopover,
} from "@ionic/vue";
import { play, pause, options, volumeHigh, close } from "ionicons/icons";
import { computed, ref, watchEffect, onMounted } from "vue";
import { ambientSounds } from "@/data/AmbientMusic";
import MusicWaveAnimation from "@/components/MusicWaveAnimation.vue";
import { useBackButtonStore } from "@/stores/useBackButtonStore";
import { storeToRefs } from "pinia";
import type { AmbientSound } from "@/types/pomodoro";
import { useAudio } from "@/composables/useAudio";

const { shouldMinimizeApp } = storeToRefs(useBackButtonStore());
const { setAudioLoop } = useAudio();

const soundsList = ref<AmbientSound[]>(ambientSounds);
const isDropdownOpen = ref(false);
const playbackHistory = ref<AmbientSound[]>([]);

// Initialize audio settings
onMounted(() => {
  soundsList.value.forEach((sound) => {
    setAudioLoop(sound.audio);
    sound.audio.volume = sound.volume / 100;
  });
});

watchEffect(() => {
  shouldMinimizeApp.value = !isDropdownOpen.value;
});

const volumeFormatter = (value: number) => `${value}%`;

const areAllSoundsPaused = computed(() => {
  return soundsList.value.every(sound => !sound.isPlaying);
});

function adjustVolume(event: CustomEvent, sound: AmbientSound) {
  const newVolume = event.detail.value;
  sound.volume = newVolume;
  sound.audio.volume = newVolume / 100;
}

function toggleSound(sound: AmbientSound) {
  if (sound.audio.paused) {
    // Clear history if all sounds were paused and we're starting a new one
    if (areAllSoundsPaused.value && playbackHistory.value.length > 0) {
      playbackHistory.value = [];
    }
    
    sound.audio.play();
    sound.isPlaying = true;
    playbackHistory.value.push(sound);
  } else {
    sound.audio.pause();
    sound.isPlaying = false;
    playbackHistory.value = playbackHistory.value.filter(
      (historicalSound) => historicalSound.name !== sound.name
    );
  }
}

function toggleAllSounds() {
  if (!areAllSoundsPaused.value) {
    // Pause all currently playing sounds
    soundsList.value.forEach((sound) => {
      sound.audio.pause();
      sound.isPlaying = false;
    });
  } else {
    // Resume previously playing sounds
    playbackHistory.value.forEach((sound) => {
      sound.audio.play();
      sound.isPlaying = true;
    });
  }
}
</script>

<style>
:root {
  --point-color: #999c89;
  --size: 5px;
}
</style>

<style scoped>
ion-popover {
  --width: 90%;
  --height: 100%;
  --box-shadow: none;
}
ion-popover::part(content) {
  background-color: transparent;
}
ion-content {
  --background: transparent;
}
ion-content::part(scroll) {
  padding: 4px;
  height: 100%;
}

ion-range {
  --bar-background: #cad7c5;
  --bar-background-active: #7f8579;
  --bar-height: 3px;
  --bar-border-radius: 8px;
  --knob-background: #7f8579;
  --knob-size: 25px;
  --pin-background: #7f8579;
  --pin-color: #fff;
  padding: 0;
  margin-right: 20px;
}

ion-range {
  pointer-events: none;
}

ion-range::part(knob),
ion-range::part(pin) {
  pointer-events: auto;
}
</style>
