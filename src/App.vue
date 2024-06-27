<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { useBackButtonStore } from "./stores/useBackButtonStore";
const { setupAppListener } = useBackButtonStore();
setupAppListener();
</script>
