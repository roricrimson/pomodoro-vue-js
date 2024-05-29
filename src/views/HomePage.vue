<template>
  <ion-page>
    <ion-content :fullscreen="true">


      <!-- 
      <div class="audio-player">
        <div v-for="item in listOfmusic">
          <div v-if="item.is_selected.value" class="controls">
            <ion-button fill="clear" @click="toggleAudio(item.audio)">
              <ion-icon
                slot="icon-only"
                :icon="playOutline"
                v-if="!is_play"
              ></ion-icon>
              <ion-icon :icon="pauseOutline" v-else></ion-icon>
            </ion-button>
            <p class="music-name">{{ item.name }}</p>
            <ion-button fill="clear" @click="openDropdown = !openDropdown">
              <ion-icon
                slot="icon-only"
                :icon="chevronUpOutline"
                class="arrow-btn"
                v-if="!openDropdown"
              ></ion-icon>
              <ion-icon
                slot="icon-only"
                :icon="chevronDownOutline"
                class="arrow-btn"
                v-else
              ></ion-icon>
            </ion-button>
          </div>
        </div>
        <ion-popover
          alignment="center"
          :show-backdrop="false"
          :is-open="openDropdown"
          @didDismiss="openDropdown = false"
        >
          <ion-content class="p-4">
            <div class="dropdown-container">
              <div class="dropdown">
                <div v-for="item in listOfmusic" @click="select(item.name)">
                  <div class="controls" v-if="!item.is_selected.value">
                    <ion-button fill="clear">
                      <ion-icon
                        class="dropdown-button"
                        slot="icon-only"
                        :icon="playOutline"
                      ></ion-icon>
                    </ion-button>
                    <p class="music-name">{{ item.name }}</p>
                  </div>
                </div>
              </div>
            </div>
          </ion-content>
        </ion-popover>
      </div> -->

      <pomodoroTimer/>
      <ambient />
      <todolist />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage} from "@ionic/vue";
// import { useMusicPlayer } from "@/composables/useMusicPlayer";
import { computed, ref, watch } from "vue";
import pomodoroTimer from "../components/PomodoroTimer.vue";
import todolist from "../components/TodoList.vue";
import ambient from "../components/Ambient.vue";


// const { toggleAudio, is_play, listOfmusic } = useMusicPlayer();

// const openDropdown = ref(false);


// function select(musicName: string) {
//   listOfmusic.forEach((element) => {
//     if (element.name === musicName) {
//       element.is_selected.value = true;
//     } else {
//       element.is_selected.value = false;
//       element.audio.pause();
//       is_play.value = false;
//     }
//   });
//   openDropdown.value = false;
// }
</script>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Londrina+Outline&family=Roboto:wght@100;300;400;500;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Indie+Flower&family=Londrina+Outline&family=Roboto:wght@100;300;400;500;700&display=swap");

ion-content {
  --background: #E2DBC9;
}
</style>
