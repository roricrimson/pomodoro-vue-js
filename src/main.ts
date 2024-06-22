import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { autoAnimatePlugin } from "@formkit/auto-animate/vue";

import { IonicVue } from "@ionic/vue";
import "./assets/fonts/Patrick_Hand/patrick-hand.css";
import "./assets/fonts/Handjet/handjet.css";
import "./assets/css/main.css";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

const app = createApp(App).use(IonicVue).use(router).use(autoAnimatePlugin);

router.isReady().then(() => {
  app.mount("#app");
});
