import { App, BackButtonListenerEvent } from "@capacitor/app";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useBackButtonStore = defineStore("useBackButtonStore", () => {
  const shouldMinimizeApp = ref(true);

  function setupAppListener() {
    App.removeAllListeners();
    App.addListener("backButton", handleBackButton);
    setInterval(() => {
      console.log("here", shouldMinimizeApp.value);
    }, 1000);
  }

  function handleBackButton(event: BackButtonListenerEvent) {
    console.log("this ran2", shouldMinimizeApp.value);
    if (!event.canGoBack && shouldMinimizeApp.value) {
      App.minimizeApp();
    }
  }

  return {
    setupAppListener,
    shouldMinimizeApp,
  };
});
