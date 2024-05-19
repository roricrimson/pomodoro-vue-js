<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";

import { Preferences } from "@capacitor/preferences";

async function setMax() {
  await Preferences.set({
    key: "name",
    value: "Max",
  });
}

async function getMax() {
  const result = await Preferences.get({ key: "name" });
  result.value;
  alert(JSON.stringify({ value: result.value }, null, 2));
}

async function removeMax() {
  await Preferences.remove({ key: "name" });
}
</script>
