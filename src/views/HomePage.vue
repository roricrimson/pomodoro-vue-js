<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <pomodoroTimer />
      <ambient />
      <todolist />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from "@ionic/vue";
import { computed, ref, watch } from "vue";
import pomodoroTimer from "../components/PomodoroTimer.vue";
import todolist from "../components/TodoList.vue";
import ambient from "../components/Ambient.vue";
</script>
<style scoped>
ion-content {
  --background: #e2dbc9;
}
</style>
