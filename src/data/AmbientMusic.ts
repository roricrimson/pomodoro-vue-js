import { AmbientSound } from '@/types/pomodoro';
import sunnyMorning from "@/assets/audio/mixkit-birds-chirping-near-the-river-2473.wav";
import lightRain from "@/assets/audio/mixkit-light-rain-loop-2393.wav";
import riverside from "@/assets/audio/mixkit-water-flowing-ambience-loop-3126.wav";
import fireplaceCrackling from "@/assets/audio/mixkit-campfire-crackles-1330.wav";
import writingOnBlackboard from "@/assets/audio/mixkit-writing-on-blackboard-2366.wav";
import typingOnKeyboard from "@/assets/audio/mixkit-slow-typing-on-a-keyboard-2532.wav";

export const ambientSounds: AmbientSound[] = [
  {
    audio: new Audio(sunnyMorning),
    name: "Sunny morning",
    isPlaying: false,
    volume: 50,
  },
  {
    audio: new Audio(lightRain),
    name: "Light rain",
    isPlaying: false,
    volume: 50,
  },
  {
    audio: new Audio(riverside),
    name: "Riverside",
    isPlaying: false,
    volume: 50,
  },
  {
    audio: new Audio(fireplaceCrackling),
    name: "Fireplace crackling",
    isPlaying: false,
    volume: 50,
  },
  {
    audio: new Audio(writingOnBlackboard),
    name: "Writing on blackboard",
    isPlaying: false,
    volume: 50,
  },
  {
    audio: new Audio(typingOnKeyboard),
    name: "Typing on keyboard",
    isPlaying: false,
    volume: 50,
  },
];
