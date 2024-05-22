import { Ref, computed, ref } from "vue";
import Floater from "@/assets/audio/Floater.mp3";
import Is_This_a_Movie from "@/assets/audio/Is This a Movie_.mp3";
import Naturally_Essenced from "@/assets/audio/Naturally Essenced.mp3";
import Sereno from "@/assets/audio/Sereno.mp3";
import Sunday_Scaries from "@/assets/audio/Sunday Scaries.mp3";
import Sway_Sway from "@/assets/audio/Sway Sway.mp3";
import Thankful from "@/assets/audio/Thankful.mp3";
import The_Vault from "@/assets/audio/The Vault.mp3";
import Welcome_to_My_Lofi from "@/assets/audio/Welcome to My Lofi House.mp3";
import locomotivate from "@/assets/audio/locomotivate.mp3";

export function useMusicPlayer() {
  const listOfmusic = [
    {
      audio: new Audio(Floater),
      name: "Floater - Auxjack",
      is_play: ref(false),
    },
    {
      audio: new Audio(Is_This_a_Movie),
      name: "Is This a Movie - Auxjack",
      is_play: ref(false),
    },
    {
      audio: new Audio(Naturally_Essenced),
      name: "Naturally Essenced - Auxjack",
      is_play: ref(false),
    },
    {
      audio: new Audio(Sereno),
      name: "Sereno - Auxjack",
      is_play: ref(false),
    },
    {
      audio: new Audio(Sunday_Scaries),
      name: "Sunday Scaries - Auxjack",
      is_play: ref(false),
    },
    {
      audio: new Audio(Sway_Sway),
      name: "Sway Sway - Auxjack",
      is_play: ref(false),
    },
    {
      audio: new Audio(Thankful),
      name: "Thankful - Auxjack",
      is_play: ref(false),
    },
    {
      audio: new Audio(The_Vault),
      name: "The Vault - Auxjack",
      is_play: ref(false),
    },
    {
      audio: new Audio(Welcome_to_My_Lofi),
      name: "Welcome to My Lofi - Auxjack",
      is_play: ref(false),
    },
    {
      audio: new Audio(locomotivate),
      name: "locomotivate - Auxjack",
      is_play: ref(false),
    },
  ];


  return { listOfmusic };
}
