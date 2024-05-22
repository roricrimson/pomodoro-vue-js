<template>
  <h1>{{ data }}</h1>
  <div class="ambient-player">
    <div v-for="item in listOfmusic">
      <ion-button fill="clear" @click="toggleAudio(item.audio, item.is_play)"
        ><ion-icon
          slot="icon-only"
          :icon="playOutline"
          v-if="!item.is_play.value"
        ></ion-icon>
        <ion-icon slot="icon-only" :icon="pauseOutline" v-else></ion-icon>
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
</template>

<script setup lang="ts">
import { IonIcon, IonButton, IonRange } from "@ionic/vue";
import {
  playOutline,
  pauseOutline,
  chevronUpOutline,
  chevronDownOutline,
} from "ionicons/icons";
import { computed, ref, toValue } from "vue";
import { useMusicPlayer } from "@/composables/useMusicPlayer";

const { listOfmusic } = useMusicPlayer();

const pinFormatter = ref((value: number) => `${value}%`);

const data = ref<any>(null);

function changeVolume(event: any, audio: any) {
  console.log(event.detail.value);
  console.log(audio);
  audio.volume = event.detail.value / 100
}

function toggleAudio(audio: HTMLAudioElement, bool: any) {
    if (audio.paused) {
      audio.play();
      bool.value= true;
    } else {
      audio.pause();
      bool.value = false;
    }
  }
</script>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Londrina+Outline&family=Roboto:wght@100;300;400;500;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Indie+Flower&family=Londrina+Outline&family=Roboto:wght@100;300;400;500;700&display=swap");

.audio-player ion-icon,
.dropdown ion-icon {
  color: white;
  font-size: 50px;
}
.audio-player {
  margin: 100px;
  margin-top: 200px;
  position: relative;
  width: 350px;
  @media (max-width: 990px) {
    margin: auto;
    margin-top: 120px;
  }
}
.audio-player ion-icon {
  font-size: 40px;
  margin-bottom: 7px;
}
.music-name {
  color: white;
  font-family: "Indie Flower", cursive;
  font-size: 20px;
  margin: 0;
  margin-right: auto;
}

.controls {
  display: flex;
  align-items: center;
}

.audio-player .arrow-btn {
  font-size: 25px;
}

.dropdown {
  height: 410px;
  overflow: scroll;
  overflow-x: hidden;
  background-color: #a9c6e0;
}

::-webkit-scrollbar {
  display: none;
}

ion-popover {
  --width: calc(80%, 400px);
}
</style>
