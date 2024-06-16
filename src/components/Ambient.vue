<template>
  <div class="w-[100%] flex justify-end">
    <button
      @click="openDropdown = true"
      class="bg-[#F6C9D0] rounded-2xl highlights mr-[25px] ml-[100px] h-[50px] w-[100%]"
    >
      <ion-icon slot="icon-only" :icon="options"></ion-icon>
    </button>
  </div>

  <ion-popover
    alignment="center"
    :show-backdrop="false"
    :is-open="openDropdown"
    @didDismiss="openDropdown = false"
  >
    <ion-content>
      <div class="flex justify-between bg-[#EAC9E2]">
        <div>
          <button
            class="bg-[#DE79B1] p-2 rounded-3 highlights"
            v-if="tempListOfMusic.length > 0"
            @click="toggleAllAudio()"
          >
            <p class="text-[12px] text-white" v-if="isAllAudioPaused">Resume</p>
            <p class="text-[12px] text-white" v-else>Pause All</p>
          </button>
        </div>

        <button fill="clear" @click="openDropdown = false">
          <ion-icon slot="icon-only" :icon="close"></ion-icon>
        </button>
      </div>
      <div class="bg-[#EAC9E2]">
        <div v-for="item in listOfAmbient">
          <div class="flex items-center justify-between">
            <p class="text-[15px] text-white">{{ item.name }}</p>
            <ion-button fill="clear" @click="toggleAudio(item)"
              ><ion-icon
                slot="icon-only"
                :icon="play"
                v-if="!item.is_play"
              ></ion-icon>
              <ion-icon slot="icon-only" :icon="pause" v-else></ion-icon>
            </ion-button>
          </div>
          <div class="flex">
            <ion-icon
              slot="icon-only"
              :icon="volumeHigh"
              class="m-2"
            ></ion-icon>
            <ion-range
              aria-label="Range with pin"
              :pin="true"
              :pin-formatter="pinFormatter"
              @ionChange="changeVolume($event, item.audio)"
              :value="50"
            ></ion-range>
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
    console.log("run");
  });
  e.audio.volume = 0.5
});

function changeVolume(event: any, audio: any) {
  audio.volume = event.detail.value / 100;
}

function toggleAudio(object: any) {
  if (object.audio.paused) {
    if (isAllAudioPaused.value && tempListOfMusic.value.length > 0) {
      tempListOfMusic.value = [];
    }
    object.audio.play();
    object.is_play = true;
    
    tempListOfMusic.value.push(object);
  } else {
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
<style scoped>
ion-popover {
  height: 400px;
  margin-top: 120px;
}
ion-popover::part(content) {
  border-radius: 15px;
  padding: 20px;
  background-color: #eac9e2;
  border-top: 2px solid white;
  border-left: 2px solid white;
  box-shadow: 1px 3px 3px #683a5481;
}

ion-icon {
  color: white;
  font-size: 25px;
}

ion-range {
  --bar-background: white;
  --bar-background-active: white;
  --bar-height: 3px;
  --bar-border-radius: 8px;
  --knob-background: #d790af;
  --knob-size: 25px;
  --pin-background: #d790af;
  --pin-color: #fff;
  padding: 0;
  margin-right: 20px;
}

.highlights {
  border-top: 2px solid white;
  border-left: 2px solid white;
  box-shadow: 1px 3px 3px #683a5481;
}
</style>
