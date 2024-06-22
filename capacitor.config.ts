import { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize, KeyboardStyle } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.timegarden.app",
  appName: "Time Garden",
  webDir: "dist",
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Native,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      androidScaleType: "CENTER_CROP",
      splashFullScreen:true,
      splashImmersive:true
    },
  },
};

export default config;
