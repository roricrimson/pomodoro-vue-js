import { ref } from 'vue';
import confirmationTone from '@/assets/audio/mixkit-confirmation-tone-2867.wav';

export function useAudio() {
  const sessionCompleteSound = ref(new Audio(confirmationTone));

  function playSessionCompleteSound() {
    try {
      sessionCompleteSound.value.play();
    } catch (error) {
      console.warn('Could not play session complete sound:', error);
    }
  }

  function setAudioLoop(audio: HTMLAudioElement, loop = true) {
    audio.addEventListener('ended', function() {
      if (loop) {
        this.play();
      }
    });
  }

  return {
    playSessionCompleteSound,
    setAudioLoop,
  };
}
