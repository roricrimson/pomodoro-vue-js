<script setup lang="ts">
import {
  IonContent,
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/vue";
import { onMounted, ref } from "vue";
import { Keyboard } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";

import { settings } from "ionicons/icons";
</script>
<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <ion-header :translucent="true">
        <ion-toolbar class="px-4">
          <ion-title>Header</ion-title>
        </ion-toolbar>
      </ion-header> 
    </ion-content>
  </ion-page>
</template>

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
