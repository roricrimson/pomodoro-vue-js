import { ref, readonly } from 'vue';
import confirmationTone from '@/assets/audio/mixkit-confirmation-tone-2867.wav';

export interface AudioErrorDetails {
  code: string;
  message: string;
  audio: HTMLAudioElement;
}

export interface AudioPlaybackResult {
  success: boolean;
  error?: AudioErrorDetails;
}

export function useAudio() {
  const sessionCompleteSound = ref(new Audio(confirmationTone));
  const audioContext = ref<AudioContext | null>(null);
  const isAudioContextSuspended = ref(false);
  const needsUserInteraction = ref(false);

  // Initialize audio context with error handling
  function initializeAudioContext(): Promise<AudioContext> {
    return new Promise((resolve, reject) => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Listen for audio context state changes
        const handleStateChange = () => {
          isAudioContextSuspended.value = context.state === 'suspended';
          needsUserInteraction.value = context.state === 'suspended';
        };
        
        context.addEventListener('statechange', handleStateChange);
        
        // Handle suspended context (common in browsers that require user interaction)
        if (context.state === 'suspended') {
          isAudioContextSuspended.value = true;
          needsUserInteraction.value = true;
          // Don't automatically try to resume - require user interaction
          audioContext.value = context;
          resolve(context);
        } else {
          isAudioContextSuspended.value = false;
          needsUserInteraction.value = false;
          audioContext.value = context;
          resolve(context);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  // Function to resume audio context after user interaction
  async function resumeAudioContext(): Promise<boolean> {
    try {
      if (!audioContext.value) {
        await initializeAudioContext();
      }

      if (audioContext.value && audioContext.value.state === 'suspended') {
        await audioContext.value.resume();
        isAudioContextSuspended.value = false;
        needsUserInteraction.value = false;
        return true;
      }
      return true;
    } catch (error) {
      console.warn('Failed to resume audio context:', error);
      return false;
    }
  }

  // Check if audio context needs user interaction
  function checkAudioContextState(): { suspended: boolean; needsInteraction: boolean } {
    const suspended = !audioContext.value || audioContext.value.state === 'suspended';
    return {
      suspended,
      needsInteraction: suspended && needsUserInteraction.value
    };
  }

  // Enhanced audio loading with comprehensive error handling
  function loadAudio(audioElement: HTMLAudioElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const handleLoad = () => {
        audioElement.removeEventListener('canplaythrough', handleLoad);
        audioElement.removeEventListener('error', handleError);
        resolve();
      };

      const handleError = () => {
        audioElement.removeEventListener('canplaythrough', handleLoad);
        audioElement.removeEventListener('error', handleError);
        
        const error = audioElement.error;
        let errorMessage = 'Unknown audio loading error';
        let errorCode = 'UNKNOWN_ERROR';

        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'Audio loading was aborted';
              errorCode = 'LOADING_ABORTED';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error occurred while loading audio';
              errorCode = 'NETWORK_ERROR';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Audio file could not be decoded';
              errorCode = 'DECODE_ERROR';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Audio format not supported';
              errorCode = 'FORMAT_NOT_SUPPORTED';
              break;
          }
        }

        reject({
          code: errorCode,
          message: errorMessage,
          audio: audioElement
        } as AudioErrorDetails);
      };

      // Set up event listeners
      audioElement.addEventListener('canplaythrough', handleLoad);
      audioElement.addEventListener('error', handleError);

      // Start loading if not already loaded
      if (audioElement.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        handleLoad();
      } else {
        audioElement.load();
      }
    });
  }

  // Enhanced play function with comprehensive error handling
  async function playAudio(audioElement: HTMLAudioElement): Promise<AudioPlaybackResult> {
    try {
      // Ensure audio context is initialized
      if (!audioContext.value) {
        await initializeAudioContext();
      }

      // Check if context is suspended and requires user interaction
      if (audioContext.value && audioContext.value.state === 'suspended') {
        // Don't automatically resume - throw specific error for user interaction requirement
        const audioError: AudioErrorDetails = {
          code: 'CONTEXT_SUSPENDED',
          message: 'Audio is disabled. Tap the audio activation button to enable sound.',
          audio: audioElement
        };
        return { success: false, error: audioError };
      }

      // Ensure audio is loaded
      if (audioElement.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
        await loadAudio(audioElement);
      }

      // Attempt to play
      await audioElement.play();
      
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Audio playback failed';
      let errorCode = 'PLAYBACK_FAILED';

      if (error.name === 'NotAllowedError') {
        errorMessage = 'Audio playback not allowed. Please enable audio and try again.';
        errorCode = 'NOT_ALLOWED';
        needsUserInteraction.value = true;
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Audio playback not supported';
        errorCode = 'NOT_SUPPORTED';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Audio playback was aborted';
        errorCode = 'ABORTED';
      } else if (error.code || error.message) {
        errorMessage = error.message || 'Audio loading failed';
        errorCode = error.code || 'LOADING_FAILED';
      }

      const audioError: AudioErrorDetails = {
        code: errorCode,
        message: errorMessage,
        audio: audioElement
      };

      console.warn('Audio playback error:', audioError);
      return { success: false, error: audioError };
    }
  }

  // Enhanced session complete sound with error handling
  async function playSessionCompleteSound(): Promise<AudioPlaybackResult> {
    return await playAudio(sessionCompleteSound.value);
  }

  // Enhanced loop setup with error handling
  function setAudioLoop(audio: HTMLAudioElement, loop = true): void {
    // Remove any existing event listeners to prevent duplicates
    const existingHandler = (audio as any)._loopHandler;
    if (existingHandler) {
      audio.removeEventListener('ended', existingHandler);
    }

    if (loop) {
      const loopHandler = async function(this: HTMLAudioElement) {
        try {
          // Reset to beginning and play again
          this.currentTime = 0;
          const result = await playAudio(this);
          if (!result.success) {
            console.warn('Loop playback failed:', result.error);
          }
        } catch (error) {
          console.warn('Error in audio loop:', error);
        }
      };

      // Store handler reference for cleanup
      (audio as any)._loopHandler = loopHandler;
      audio.addEventListener('ended', loopHandler);
    }
  }

  // Pause audio safely
  function pauseAudio(audioElement: HTMLAudioElement): void {
    try {
      if (!audioElement.paused) {
        audioElement.pause();
      }
    } catch (error) {
      console.warn('Error pausing audio:', error);
    }
  }

  // Stop audio and reset position
  function stopAudio(audioElement: HTMLAudioElement): void {
    try {
      audioElement.pause();
      audioElement.currentTime = 0;
    } catch (error) {
      console.warn('Error stopping audio:', error);
    }
  }

  // Cleanup audio resources
  function cleanupAudio(audioElement: HTMLAudioElement): void {
    try {
      audioElement.pause();
      audioElement.currentTime = 0;
      
      // Remove loop handler if exists
      const existingHandler = (audioElement as any)._loopHandler;
      if (existingHandler) {
        audioElement.removeEventListener('ended', existingHandler);
        delete (audioElement as any)._loopHandler;
      }

      // Remove src to free memory
      audioElement.removeAttribute('src');
      audioElement.load();
    } catch (error) {
      console.warn('Error cleaning up audio:', error);
    }
  }

  return {
    playSessionCompleteSound,
    playAudio,
    loadAudio,
    setAudioLoop,
    pauseAudio,
    stopAudio,
    cleanupAudio,
    initializeAudioContext,
    resumeAudioContext,
    checkAudioContextState,
    isAudioContextSuspended: readonly(isAudioContextSuspended),
    needsUserInteraction: readonly(needsUserInteraction),
  };
}
