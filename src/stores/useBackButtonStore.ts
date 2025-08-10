import { App, BackButtonListenerEvent } from "@capacitor/app";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useBackButtonStore = defineStore("backButtonStore", () => {
  const shouldMinimizeApp = ref(true);

  function setupAppListener() {
    App.removeAllListeners();
    App.addListener("backButton", handleBackButton);
  }

  function handleBackButton(event: BackButtonListenerEvent) {
    if (!event.canGoBack && shouldMinimizeApp.value) {
      App.minimizeApp();
    }
  }

  return {
    setupAppListener,
    shouldMinimizeApp,
  };
});
