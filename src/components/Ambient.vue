<template>
  <div class="w-[100%] flex gap-2 px-5">
    <button
      @click="openDropdown = true"
      class="bg-[#c6c8ba] rounded-xl shadow-md shadow-[#989e8e] p-2 flex justify-center items-center"
    >
      <ion-icon class="text-white text-3xl" :icon="options"></ion-icon>
    </button>
    <div
      class="bg-[#F5EEDE] shadow-md shadow-[#989e8e]  rounded-xl w-[100%] text-[#C4C7B4] text-start font-semibold px-6"
    >
      <div :class="isAllAudioPaused ? 'loader' : 'loader animated'">
        <span class="loader__element"></span>
        <span class="loader__element"></span>
        <span class="loader__element"></span>
        <span class="loader__element"></span>
        <span class="loader__element"></span>
        <span class="loader__element"></span>
        <span class="loader__element"></span>
        <span class="loader__element"></span>
        <span class="loader__element"></span>
        <span class="loader__element"></span>
      </div>
    </div>
  </div>
  <ion-popover
    alignment="center"
    :show-backdrop="false"
    :is-open="openDropdown"
    @didDismiss="openDropdown = false"
  >
    <ion-content>
      <div
        class="p-4 bg-[#F5EEDE] rounded-3xl shadow-md shadow-[#989e8e] h-full"
      >
        <div class="flex justify-between mb-2">
          <button fill="clear" @click="openDropdown = false">
            <ion-icon
              class="text-[#7F8579] text-2xl"
              slot="icon-only"
              :icon="close"
            ></ion-icon>
          </button>
          <button
            class="bg-[#7F8579] p-2 rounded-3 highlights"
            v-if="tempListOfMusic.length > 0"
            @click="toggleAllAudio()"
          >
            <p class="text-[12px] text-white" v-if="isAllAudioPaused">Resume</p>
            <p class="text-[12px] text-white" v-else>Pause All</p>
          </button>
        </div>
        <div class="rounded-lg">
          <div v-for="item in listOfAmbient">
            <div class="flex items-center justify-between">
              <p class="text-[15px] text-[#7F8579]">{{ item.name }}</p>
              <ion-button fill="clear" @click="toggleAudio(item)"
                ><ion-icon
                  class="text-[#7F8579] text-2xl"
                  slot="icon-only"
                  :icon="play"
                  v-if="!item.is_play"
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
                :pin-formatter="pinFormatter"
                @ionChange="changeVolume($event, item)"
                :value="item.volume"
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
import { Ref, computed, ref, toValue, watch } from "vue";
import { useAmbientList } from "@/composables/useAmbientList";

const { listOfAmbient } = useAmbientList();

const openDropdown = ref(false);

const pinFormatter = ref((value: number) => `${value}%`);

const tempListOfMusic = ref(<any>[]);

const isAllAudioPaused = computed(() => {
  var bool = true;
  listOfAmbient.value.forEach((e) => {
    if (e.is_play) {
      bool = false;
      return;
    }
  });
  return bool;
});

listOfAmbient.value.forEach((e) => {
  e.audio.addEventListener("ended", function () {
    this.play();
  });
  e.audio.volume = 0.5;
});

function changeVolume(event: any, object: any) {
  object.volume = event.detail.value
  object.audio.volume = object.volume / 100;
}

function toggleAudio(object: any) {
  if (object.audio.paused) {
    if (isAllAudioPaused.value && tempListOfMusic.value.length > 0) {
      tempListOfMusic.value = [];
    }
    object.audio.play();
    object.is_play = true;

    tempListOfMusic.value.push(object);
  } else if(object.audio.played) {
    object.audio.pause();
    object.is_play = false;
    tempListOfMusic.value = tempListOfMusic.value.filter(
      (i: any) => i.name !== object.name
    );
  }
}

function toggleAllAudio() {
  if (!isAllAudioPaused.value) {
    listOfAmbient.value.forEach((e) => {
      e.audio.pause();
      e.is_play = false;
    });
  } else {
    tempListOfMusic.value.forEach((e: any) => {
      e.audio.play();
      e.is_play = true;
    });
  }
}
</script>
<style>
:root {
  --point-color: #999C89;
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
  --bar-background-active: #7F8579;
  --bar-height: 3px;
  --bar-border-radius: 8px;
  --knob-background: #7F8579;
  --knob-size: 25px;
  --pin-background: #7F8579;
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

.loader {
  overflow: hidden;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 10px;
  z-index: 100000;
}

.loader__element {
  border-radius: 100%;
  border: var(--size) solid var(--point-color);
}
.loader.animated .loader__element:nth-child(1) {
  animation: preloader 0.6s ease-in-out alternate infinite;
}
.loader.animated .loader__element:nth-child(2) {
  animation: preloader 0.6s ease-in-out alternate 0.2s infinite;
}
.loader.animated 
.loader__element:nth-child(3) {
  animation: preloader 0.6s ease-in-out alternate 0.4s infinite;
}
.loader.animated .loader__element:nth-child(4) {
  animation: preloader 0.6s ease-in-out alternate 0.6s infinite;
}
.loader.animated .loader__element:nth-child(5) {
  animation: preloader 0.6s ease-in-out alternate 0.8s infinite;
}
.loader.animated .loader__element:nth-child(6) {
  animation: preloader 0.6s ease-in-out alternate 1s infinite;
}
.loader.animated .loader__element:nth-child(7) {
  animation: preloader 0.6s ease-in-out alternate 1.2s infinite;
}
.loader.animated .loader__element:nth-child(8) {
  animation: preloader 0.6s ease-in-out alternate 1.4s infinite;
}
.loader.animated .loader__element:nth-child(9) {
  animation: preloader 0.6s ease-in-out alternate 1.6s infinite;
}
.loader.animated .loader__element:nth-child(10) {
  animation: preloader 0.6s ease-in-out alternate 1.8s infinite;
}

@keyframes preloader {
  100% {
    transform: scale(2);
  }
}
</style>
