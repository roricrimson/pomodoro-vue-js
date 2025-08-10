<template>
  <div class="w-full flex gap-2 px-5 h-14">
    <!-- Audio activation button (shown when audio context is suspended) -->
    <button
      v-if="isAudioContextSuspended || needsUserInteraction"
      @click="enableAudio"
      class="bg-red-500 w-16 rounded-xl shadow-[2px_2px_3px_0_#989e8e] p-2 flex justify-center items-center animate-pulse"
      :disabled="isEnablingAudio"
    >
      <ion-icon 
        class="text-white text-3xl" 
        :icon="isEnablingAudio ? refresh : volumeOff"
        :class="{ 'animate-spin': isEnablingAudio }"
      ></ion-icon>
    </button>
    <!-- Regular options button -->
    <button
      v-else
      @click="isDropdownOpen = true"
      class="bg-[#c6c8ba] w-16 rounded-xl shadow-[2px_2px_3px_0_#989e8e] p-2 flex justify-center items-center"
    >
      <ion-icon class="text-white text-3xl" :icon="options"></ion-icon>
    </button>
    <div
      class="bg-[#F5EEDE] shadow-[2px_2px_3px_0_#989e8e] rounded-xl w-full text-[#C4C7B4] text-start font-semibold px-6 flex"
    >
      <MusicWaveAnimation :play="!areAllSoundsPaused" />
    </div>
  </div>

  <!-- Audio Context Notification -->
  <div 
    v-if="(isAudioContextSuspended || needsUserInteraction) && !errorMessage" 
    class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg"
  >
    <div class="flex items-center gap-2">
      <ion-icon :icon="volumeOff" class="text-lg animate-pulse"></ion-icon>
      <span class="text-sm">Audio is disabled. Tap the red button to enable sound.</span>
    </div>
  </div>

  <!-- Error Toast Notification -->
  <div 
    v-if="errorMessage" 
    class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
  >
    <div class="flex items-center gap-2">
      <ion-icon :icon="alertCircle" class="text-lg"></ion-icon>
      <span class="text-sm">{{ errorMessage }}</span>
      <button @click="clearError" class="ml-2 text-white hover:text-gray-200">
        <ion-icon :icon="close" class="text-lg"></ion-icon>
      </button>
    </div>
  </div>

  <ion-popover
    alignment="center"
    :show-backdrop="false"
    :is-open="isDropdownOpen"
    @didDismiss="isDropdownOpen = false"
  >
    <ion-content>
      <div
        class="p-4 bg-[#F5EEDE] rounded-3xl shadow-[2px_2px_3px_0_#989e8e] h-full"
      >
        <div class="flex justify-between mb-2">
          <button fill="clear" @click="isDropdownOpen = false">
            <ion-icon
              class="text-[#7F8579] text-2xl"
              slot="icon-only"
              :icon="close"
            ></ion-icon>
          </button>
          <button
            class="bg-[#7F8579] p-2 py-1 rounded-md highlights"
            v-if="playbackHistory.length > 0"
            @click="toggleAllSounds()"
            :disabled="isAnyAudioLoading"
          >
            <p class="text-[12px] text-white" v-if="areAllSoundsPaused">Resume</p>
            <p class="text-[12px] text-white" v-else>Pause All</p>
          </button>
        </div>
        <div class="rounded-lg">
          <div v-for="sound in soundsList" :key="sound.name">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <p class="text-[15px] text-[#7F8579]" :class="{ 'opacity-50': sound.hasError }">
                  {{ sound.name }}
                </p>
                <!-- Loading indicator -->
                <div v-if="sound.isLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-[#7F8579] border-t-transparent"></div>
                <!-- Error indicator -->
                <ion-icon 
                  v-if="sound.hasError" 
                  :icon="alertCircle" 
                  class="text-red-500 text-sm"
                  @click="showErrorDetails(sound)"
                ></ion-icon>
              </div>
              <ion-button 
                fill="clear" 
                @click="toggleSound(sound)"
                :disabled="sound.hasError || sound.isLoading"
              >
                <ion-icon
                  class="text-[#7F8579] text-2xl"
                  :class="{ 'opacity-50': sound.hasError || sound.isLoading }"
                  slot="icon-only"
                  :icon="play"
                  v-if="!sound.isPlaying"
                ></ion-icon>
                <ion-icon
                  class="text-[#7F8579] text-2xl"
                  slot="icon-only"
                  :icon="pause"
                  v-else
                ></ion-icon>
              </ion-button>
            </div>
            <!-- Error message display -->
            <div v-if="sound.hasError && sound.errorMessage" class="text-xs text-red-500 mb-2 ml-2">
              {{ sound.errorMessage }}
              <button @click="retryAudio(sound)" class="ml-2 underline hover:no-underline">
                Retry
              </button>
            </div>
            <div class="flex">
              <ion-icon
                slot="icon-only"
                :icon="volumeHigh"
                class="m-2 text-[#7F8579] text-2xl"
                :class="{ 'opacity-50': sound.hasError }"
              ></ion-icon>
              <ion-range
                aria-label="Range with pin"
                :pin="true"
                :pin-formatter="volumeFormatter"
                @ionChange="adjustVolume($event, sound)"
                :value="sound.volume"
                :disabled="sound.hasError"
              ></ion-range>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-popover>
</template>

<script setup lang="ts">
import {
  IonIcon,
  IonButton,
  IonRange,
  IonContent,
  IonPopover,
} from "@ionic/vue";
import { play, pause, options, volumeHigh, close, alertCircle, volumeOff, refresh } from "ionicons/icons";
import { computed, ref, watchEffect, onMounted, onUnmounted } from "vue";
import { ambientSounds } from "@/data/AmbientMusic";
import MusicWaveAnimation from "@/components/MusicWaveAnimation.vue";
import { useBackButtonStore } from "@/stores/useBackButtonStore";
import { storeToRefs } from "pinia";
import type { AmbientSound } from "@/types/pomodoro";
import { useAudio } from "@/composables/useAudio";

const { shouldMinimizeApp } = storeToRefs(useBackButtonStore());
const { 
  setAudioLoop, 
  playAudio, 
  pauseAudio, 
  loadAudio, 
  cleanupAudio, 
  initializeAudioContext,
  resumeAudioContext,
  checkAudioContextState,
  isAudioContextSuspended,
  needsUserInteraction
} = useAudio();

const soundsList = ref<AmbientSound[]>(ambientSounds);
const isDropdownOpen = ref(false);
const playbackHistory = ref<AmbientSound[]>([]);
const errorMessage = ref<string>('');
const errorTimeout = ref<NodeJS.Timeout | null>(null);
const isEnablingAudio = ref(false);

// Initialize audio settings with error handling
onMounted(async () => {
  try {
    // Initialize audio context early
    await initializeAudioContext();
    
    // Set up each sound with error handling
    for (const sound of soundsList.value) {
      try {
        sound.isLoading = true;
        await loadAudio(sound.audio);
        setAudioLoop(sound.audio);
        sound.audio.volume = sound.volume / 100;
        sound.hasError = false;
        sound.errorMessage = '';
      } catch (error: any) {
        console.warn(`Failed to load audio for ${sound.name}:`, error);
        sound.hasError = true;
        sound.errorMessage = error.message || 'Failed to load audio';
        showError(`Failed to load "${sound.name}": ${error.message || 'Unknown error'}`);
      } finally {
        sound.isLoading = false;
      }
    }
  } catch (error) {
    console.warn('Failed to initialize audio system:', error);
    showError('Audio system initialization failed. Some features may not work properly.');
  }
});

// Function to enable audio after user interaction
async function enableAudio() {
  isEnablingAudio.value = true;
  
  try {
    const success = await resumeAudioContext();
    if (success) {
      showError('Audio enabled successfully!', 2000);
      
      // Try to load any failed audio files
      for (const sound of soundsList.value) {
        if (sound.hasError) {
          try {
            await retryAudio(sound);
          } catch (error) {
            console.warn(`Failed to retry ${sound.name} after enabling audio:`, error);
          }
        }
      }
    } else {
      showError('Failed to enable audio. Please try again.');
    }
  } catch (error: any) {
    console.warn('Error enabling audio:', error);
    showError(`Failed to enable audio: ${error.message || 'Unknown error'}`);
  } finally {
    isEnablingAudio.value = false;
  }
}

// Clean up audio resources on unmount
onUnmounted(() => {
  soundsList.value.forEach(sound => {
    cleanupAudio(sound.audio);
  });
  
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value);
  }
});

watchEffect(() => {
  shouldMinimizeApp.value = !isDropdownOpen.value;
});

const volumeFormatter = (value: number) => `${value}%`;

const areAllSoundsPaused = computed(() => {
  return soundsList.value.every(sound => !sound.isPlaying);
});

const isAnyAudioLoading = computed(() => {
  return soundsList.value.some(sound => sound.isLoading);
});

// Error handling functions
function showError(message: string, duration = 5000) {
  errorMessage.value = message;
  
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value);
  }
  
  errorTimeout.value = setTimeout(() => {
    clearError();
  }, duration);
}

function clearError() {
  errorMessage.value = '';
  if (errorTimeout.value) {
    clearTimeout(errorTimeout.value);
    errorTimeout.value = null;
  }
}

function showErrorDetails(sound: AmbientSound) {
  if (sound.errorMessage) {
    showError(`${sound.name}: ${sound.errorMessage}`, 8000);
  }
}

async function retryAudio(sound: AmbientSound) {
  try {
    sound.isLoading = true;
    sound.hasError = false;
    sound.errorMessage = '';
    
    // Recreate audio element
    const oldAudio = sound.audio;
    cleanupAudio(oldAudio);
    sound.audio = new Audio(oldAudio.src);
    
    await loadAudio(sound.audio);
    setAudioLoop(sound.audio);
    sound.audio.volume = sound.volume / 100;
    
    showError(`"${sound.name}" loaded successfully!`, 3000);
  } catch (error: any) {
    console.warn(`Retry failed for ${sound.name}:`, error);
    sound.hasError = true;
    sound.errorMessage = error.message || 'Retry failed';
    showError(`Retry failed for "${sound.name}": ${error.message || 'Unknown error'}`);
  } finally {
    sound.isLoading = false;
  }
}

function adjustVolume(event: CustomEvent, sound: AmbientSound) {
  const newVolume = event.detail.value;
  sound.volume = newVolume;
  
  try {
    sound.audio.volume = newVolume / 100;
  } catch (error) {
    console.warn(`Error adjusting volume for ${sound.name}:`, error);
  }
}

async function toggleSound(sound: AmbientSound) {
  if (sound.hasError) {
    showError(`Cannot play "${sound.name}" due to an error. Try retrying first.`);
    return;
  }

  if (sound.isLoading) {
    showError(`"${sound.name}" is still loading. Please wait.`);
    return;
  }

  try {
    if (sound.audio.paused) {
      // Clear history if all sounds were paused and we're starting a new one
      if (areAllSoundsPaused.value && playbackHistory.value.length > 0) {
        playbackHistory.value = [];
      }
      
      sound.isLoading = true;
      const result = await playAudio(sound.audio);
      
      if (result.success) {
        sound.isPlaying = true;
        playbackHistory.value.push(sound);
        sound.hasError = false;
        sound.errorMessage = '';
      } else {
        sound.hasError = true;
        sound.errorMessage = result.error?.message || 'Playback failed';
        
        // Special handling for context suspension
        if (result.error?.code === 'CONTEXT_SUSPENDED') {
          showError('Audio is disabled. Tap the red audio button to enable sound.', 5000);
        } else if (result.error?.code === 'NOT_ALLOWED') {
          showError('Audio blocked by browser. Tap the audio activation button.', 5000);
        } else {
          showError(`Failed to play "${sound.name}": ${result.error?.message || 'Unknown error'}`);
        }
      }
    } else {
      pauseAudio(sound.audio);
      sound.isPlaying = false;
      playbackHistory.value = playbackHistory.value.filter(
        (historicalSound) => historicalSound.name !== sound.name
      );
    }
  } catch (error: any) {
    console.warn(`Error toggling sound ${sound.name}:`, error);
    sound.hasError = true;
    sound.errorMessage = error.message || 'Playback error';
    sound.isPlaying = false;
    showError(`Error with "${sound.name}": ${error.message || 'Unknown error'}`);
  } finally {
    sound.isLoading = false;
  }
}

async function toggleAllSounds() {
  if (isAnyAudioLoading.value) {
    showError('Please wait for audio to finish loading.');
    return;
  }

  try {
    if (!areAllSoundsPaused.value) {
      // Pause all currently playing sounds
      soundsList.value.forEach((sound) => {
        if (sound.isPlaying) {
          pauseAudio(sound.audio);
          sound.isPlaying = false;
        }
      });
    } else {
      // Resume previously playing sounds
      const soundsToResume = playbackHistory.value.filter(sound => !sound.hasError);
      
      if (soundsToResume.length === 0) {
        showError('No sounds to resume or all previous sounds have errors.');
        return;
      }

      for (const sound of soundsToResume) {
        try {
          const result = await playAudio(sound.audio);
          if (result.success) {
            sound.isPlaying = true;
            sound.hasError = false;
            sound.errorMessage = '';
          } else {
            sound.hasError = true;
            sound.errorMessage = result.error?.message || 'Resume failed';
            
            // Special handling for context suspension
            if (result.error?.code === 'CONTEXT_SUSPENDED') {
              showError('Audio is disabled. Tap the red audio button to enable sound.', 5000);
              break; // Stop trying other sounds
            } else if (result.error?.code === 'NOT_ALLOWED') {
              showError('Audio blocked by browser. Tap the audio activation button.', 5000);
              break; // Stop trying other sounds
            }
            
            console.warn(`Failed to resume ${sound.name}:`, result.error);
          }
        } catch (error: any) {
          console.warn(`Error resuming ${sound.name}:`, error);
          sound.hasError = true;
          sound.errorMessage = error.message || 'Resume error';
        }
      }
    }
  } catch (error: any) {
    console.warn('Error toggling all sounds:', error);
    showError(`Error managing audio: ${error.message || 'Unknown error'}`);
  }
}
</script>

<style>
:root {
  --point-color: #999c89;
  --size: 5px;
}
</style>

<style scoped>
ion-popover {
  --width: 90%;
  --height: 100%;
  --box-shadow: none;
}
ion-popover::part(content) {
  background-color: transparent;
}
ion-content {
  --background: transparent;
}
ion-content::part(scroll) {
  padding: 4px;
  height: 100%;
}

ion-range {
  --bar-background: #cad7c5;
  --bar-background-active: #7f8579;
  --bar-height: 3px;
  --bar-border-radius: 8px;
  --knob-background: #7f8579;
  --knob-size: 25px;
  --pin-background: #7f8579;
  --pin-color: #fff;
  padding: 0;
  margin-right: 20px;
}

ion-range {
  pointer-events: none;
}

ion-range::part(knob),
ion-range::part(pin) {
  pointer-events: auto;
}
</style>
