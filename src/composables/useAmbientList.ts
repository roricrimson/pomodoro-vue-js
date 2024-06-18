import { ref } from "vue";
import Sunny_morning from "@/assets/audio/mixkit-birds-chirping-near-the-river-2473.wav";
import Light_rain from "@/assets/audio/mixkit-light-rain-loop-2393.wav";
import Riverside from "@/assets/audio/mixkit-water-flowing-ambience-loop-3126.wav";
import Fireplace_crackling from "@/assets/audio/mixkit-campfire-crackles-1330.wav";
import Writing_on_blackboard from "@/assets/audio/mixkit-writing-on-blackboard-2366.wav";
import Typing_on_keyboard from "@/assets/audio/mixkit-slow-typing-on-a-keyboard-2532.wav";

export function useAmbientList() {
  const listOfAmbient = ref([
    {
      audio: new Audio(Sunny_morning),
      name: "Sunny morning",
      is_play: false,
      volume: 50,
    },
    {
      audio: new Audio(Light_rain),
      name: "Light rain",
      is_play: false,
      volume: 50,
    },
    {
      audio: new Audio(Riverside),
      name: "Riverside",
      is_play: false,
      volume: 50,
    },
    {
      audio: new Audio(Fireplace_crackling),
      name: "Fireplace_crackling",
      is_play: false,
      volume: 50,
    },
    {
      audio: new Audio(Writing_on_blackboard),
      name: "Writing_on_blackboard",
      is_play: false,
      volume: 50,
    },
    {
      audio: new Audio(Typing_on_keyboard),
      name: "Typing_on_keyboard",
      is_play: false,
      volume: 50,
    },
  ]);

  return { listOfAmbient };
}
