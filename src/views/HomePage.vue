<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="timer">
        <div class="flex">
          <div class="timer-btn">
            <ion-button
              fill="clear"
              @click="startTimer"
              v-if="status === 'reset' || status === 'finished'"
            >
              <ion-icon slot="icon-only" :icon="playOutline"></ion-icon>
            </ion-button>
            <ion-button fill="clear" @click="stop" v-if="status === 'counting'"
              ><ion-icon slot="icon-only" :icon="pauseOutline"></ion-icon
            ></ion-button>
            <ion-button fill="clear" @click="resume" v-if="status === 'stop'"
              ><ion-icon slot="icon-only" :icon="playOutline"></ion-icon
            ></ion-button>
            <ion-button
              fill="clear"
              @click="resetTimer"
              v-if="status === 'stop'"
              ><ion-icon slot="icon-only" :icon="stopOutline"></ion-icon
            ></ion-button>
          </div>

          <div class="timer-content">
            <div class="time">
              <p>{{ dislapyTimer.minutes }}</p>
              <p>{{ dislapyTimer.seconds }}</p>
            </div>
          </div>
        </div>
        <div class="sessions">
          <input type="radio" :checked="numberOfWorkCount > 0" disabled />
          <input type="radio" :checked="numberOfWorkCount > 1" disabled />
          <input type="radio" :checked="numberOfWorkCount > 2" disabled />
          <input type="radio" :checked="numberOfWorkCount > 3" disabled />
        </div>
        <p class="status" v-if="!isBreak">Work Time</p>
        <p class="status" v-if="isBreak && numberOfWorkCount <= 3">
          Break Time
        </p>
        <p class="status" v-if="isBreak && numberOfWorkCount > 3">
          Long Break Time
        </p>
      </div>
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

      <ambient />
      <todolist />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonIcon, IonButton } from "@ionic/vue";
import {
  playOutline,
  pauseOutline,
  stopOutline,
  chevronUpOutline,
  chevronDownOutline,
} from "ionicons/icons";
import { useCountDownTimer } from "@/composables/useCountDownTimer";
// import { useMusicPlayer } from "@/composables/useMusicPlayer";
import Sound from "@/assets/audio/short-success-sound-glockenspiel-treasure-video-game-6346.mp3";
import { computed, ref, watch } from "vue";
import todolist from "../components/TodoList.vue";
import ambient from "../components/Ambient.vue";

const { start, stop, resume, dislapyTimer, status, reset, timer } =
  useCountDownTimer();

// const { toggleAudio, is_play, listOfmusic } = useMusicPlayer();

const isBreak = ref(false);
const numberOfWorkCount = ref(0);
const Work_time = ref(20);
const Break_time = ref(5);
const Long_break_time = ref(10);
const afterLongBreak = ref(false);
// const openDropdown = ref(false);
const alarmSound = new Audio(Sound);

watch(status, (value) => {
  console.log(value);
  console.log(isBreak.value);
  if (value === "finished") {
    isBreak.value = !isBreak.value;
    if (isBreak.value && numberOfWorkCount.value > 3) {
      alarmSound.play();
      setTimeout(() => {
        start(Long_break_time.value);
      }, 1000);
      afterLongBreak.value = true;
    } else if (isBreak.value) {
      alarmSound.play();
      setTimeout(() => {
        start(Break_time.value);
      }, 1000);
    }
  }
});

function startTimer() {
  if (!isBreak.value) {
    start(Work_time.value);
    numberOfWorkCount.value++;
    if (afterLongBreak.value) {
      numberOfWorkCount.value = 1;
      afterLongBreak.value = false;
    }
  }
}

function resetTimer() {
  if (!isBreak.value && !afterLongBreak.value) {
    numberOfWorkCount.value--;
  }
  reset(Work_time.value);
}

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
  --background: #a9c6e0;
}

.timer {
  margin: 120px;
  width: 450px;
  margin-left: auto;
  display: flex;
  flex-direction: column;
  color: white;

  @media (max-width: 990px) {
    position: relative;
    margin: 120px auto;
    margin-bottom: 0;
    width: 250px;
  }
}

.flex {
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 990px) {
    flex-direction: column-reverse;
    gap: 60px;
  }
}

.timer-btn {
  display: flex;
  flex-direction: column;
  @media (max-width: 990px) {
    flex-direction: row;
  }
}

.time {
  display: flex;
  align-items: center;
  gap: 20px;
  height: 150px;

  @media (max-width: 990px) {
    height: 120px;
    gap: 10px;
  }
}

.time p {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 150px;
  border: 4px solid white;
  border-radius: 35px;
  font-size: 80px;
  padding: 20px;
  font-family: "Londrina Outline", cursive;
  font-weight: 700;
  letter-spacing: 8px;
  padding-left: 25px;

  @media (max-width: 990px) {
    width: 120px;
    height: 120px;
    border-radius: 25px;
    font-size: 70px;
  }
}

.sessions {
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 90px;
  @media (max-width: 990px) {
    margin: 0;
    position: absolute;
    top: 120px;
    left: 50%;
    transform: translate(-50%);
  }
}

.sessions input[type="radio"] {
  appearance: none;
  background-color: #c0d3e4;
  border: 2px solid white;
  width: 25px;
  height: 7px;
  border-radius: 10px;
  margin: 3px;
}

.sessions input[type="radio"]:checked {
  background-color: white;
}

.status {
  display: inline-block;
  font-family: "Indie Flower", cursive;
  font-size: 20px;
  margin: 30px;
  margin-left: 225px;
  @media (max-width: 990px) {
    margin: 30px auto;
  }
}

.timer ion-icon,
.audio-player ion-icon {
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
}

::-webkit-scrollbar {
  display: none;
}

ion-popover {
  --width: calc(80%, 400px);
}
</style>
