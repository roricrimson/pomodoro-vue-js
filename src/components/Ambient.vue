<template>
  <div class="">
    <div class="flex gap-[10px] mx-[25px] h-[50px]">
      <button
        @click="openDropdown = true"
        class="basis-[80%] bg-[#F6C9D0] rounded-md shadow-[2px_2px_0px_1px_#8F97B0] border-white border"
      >
        <ion-icon slot="icon-only" :icon="options"></ion-icon>
      </button>
      <button
        @click=""
        class="basis-[20%] bg-[#DE79B1] rounded-md shadow-[2px_2px_0px_1px_#8F97B0] border border-white"
      >
        <ion-icon slot="icon-only" :icon="play"></ion-icon>
      </button>
    </div>

    <ion-popover
      alignment="center"
      :show-backdrop="false"
      :is-open="openDropdown"
      @didDismiss="openDropdown = false"
    >
      <ion-content class="p-4">
        <div class="bg-[#EAC9E2]">
          <div v-for="item in listOfmusic">
            <ion-button
              fill="clear"
              @click="toggleAudio(item.audio, item.is_play)"
              ><ion-icon
                slot="icon-only"
                :icon="play"
                v-if="!item.is_play.value"
              ></ion-icon>
              <ion-icon slot="icon-only" :icon="pause" v-else></ion-icon>
            </ion-button>
            <p>{{ item.name }}</p>
            <ion-range
              aria-label="Range with pin"
              :pin="true"
              :pin-formatter="pinFormatter"
              @ionChange="changeVolume($event, item.audio)"
              :value="100"
            ></ion-range>
          </div>
        </div>
      </ion-content>
    </ion-popover>
  </div>
</template>

<script setup lang="ts">
import {
  IonIcon,
  IonButton,
  IonRange,
  IonContent,
  IonPopover,
} from "@ionic/vue";
import { play, pause, options } from "ionicons/icons";
import { Ref, computed, ref, toValue } from "vue";
import { useMusicPlayer } from "@/composables/useMusicPlayer";

const { listOfmusic } = useMusicPlayer();

const openDropdown = ref(false);

const pinFormatter = ref((value: number) => `${value}%`);

function changeVolume(event: any, audio: any) {
  audio.volume = event.detail.value / 100;
}

function toggleAudio(audio: HTMLAudioElement, bool: Ref<boolean>) {
  if (audio.paused) {
    audio.play();
    bool.value = true;
  } else {
    audio.pause();
    bool.value = false;
  }
}
</script>
<style scoped>
ion-popover {
}

ion-icon {
  color: white;
  font-size: 35px;
}
</style>
