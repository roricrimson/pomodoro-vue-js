import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAudio } from '@/composables/useAudio';

// Mock MediaError for test environment
(global as any).MediaError = {
  MEDIA_ERR_ABORTED: 1,
  MEDIA_ERR_NETWORK: 2,
  MEDIA_ERR_DECODE: 3,
  MEDIA_ERR_SRC_NOT_SUPPORTED: 4,
};

describe('useAudio', () => {
  let mockAudio: any;

  beforeEach(() => {
    // Mock the HTML Audio API
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      removeAttribute: vi.fn(),
      currentTime: 0,
      volume: 1,
      loop: false,
      src: '',
      readyState: HTMLMediaElement.HAVE_ENOUGH_DATA,
      paused: false,
      ended: false,
      error: null,
      muted: false,
      duration: 100,
    };

    global.Audio = vi.fn(() => mockAudio);

    // Mock AudioContext
    const mockContext = {
      state: 'running',
      resume: vi.fn().mockResolvedValue(undefined),
      suspend: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    // TypeScript workaround for AudioContext mock
    (global as any).AudioContext = vi.fn(() => mockContext);
    (global as any).webkitAudioContext = vi.fn(() => mockContext);

    vi.clearAllMocks();
  });

  describe('Audio Context', () => {
    it('should initialize audio context', async () => {
      const { initializeAudioContext } = useAudio();
      
      const context = await initializeAudioContext();
      
      expect(context).toBeDefined();
    });

    it('should resume suspended audio context', async () => {
      const { resumeAudioContext } = useAudio();
      
      const result = await resumeAudioContext();
      
      expect(result).toBe(true);
    });

    it('should check audio context state', () => {
      const { checkAudioContextState } = useAudio();
      
      const state = checkAudioContextState();
      
      expect(state).toHaveProperty('suspended');
      expect(state).toHaveProperty('needsInteraction');
    });
  });

  describe('Audio Playback', () => {
    it('should play session complete sound', async () => {
      const { playSessionCompleteSound } = useAudio();
      
      const result = await playSessionCompleteSound();
      
      expect(result.success).toBe(true);
    });

    it('should handle play errors gracefully', async () => {
      const { playAudio } = useAudio();
      
      const playError = new Error('Playback failed');
      playError.name = 'NotAllowedError';
      mockAudio.play.mockRejectedValue(playError);
      
      const result = await playAudio(mockAudio);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_ALLOWED');
    });

    it('should pause audio correctly', () => {
      const { pauseAudio } = useAudio();
      
      pauseAudio(mockAudio);
      
      expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('should stop audio and reset position', () => {
      const { stopAudio } = useAudio();
      
      stopAudio(mockAudio);
      
      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.currentTime).toBe(0);
    });
  });

  describe('Audio Loading', () => {
    it('should load audio with proper error handling', async () => {
      const { loadAudio } = useAudio();
      
      const result = loadAudio(mockAudio);
      
      // Simulate successful load
      const loadHandler = mockAudio.addEventListener.mock.calls.find(call => call[0] === 'canplaythrough')?.[1];
      if (loadHandler) {
        loadHandler();
      }
      
      await expect(result).resolves.not.toThrow();
    });

    it('should handle loading errors', async () => {
      const { loadAudio } = useAudio();
      
      // Set up audio element to not be ready (so it will wait for events)
      mockAudio.readyState = 0; // HAVE_NOTHING
      mockAudio.error = { code: 2 }; // MEDIA_ERR_NETWORK
      
      const result = loadAudio(mockAudio);
      
      // Simulate error event
      const errorHandler = mockAudio.addEventListener.mock.calls.find(call => call[0] === 'error')?.[1];
      if (errorHandler) {
        errorHandler();
      }
      
      await expect(result).rejects.toMatchObject({
        code: 'NETWORK_ERROR',
        message: 'Network error occurred while loading audio',
        audio: mockAudio
      });
    });
  });

  describe('Audio Loop', () => {
    it('should set audio to loop', () => {
      const { setAudioLoop } = useAudio();
      
      setAudioLoop(mockAudio, true);
      
      expect(mockAudio.addEventListener).toHaveBeenCalledWith('ended', expect.any(Function));
    });

    it('should handle loop ended event', async () => {
      const { setAudioLoop } = useAudio();
      
      setAudioLoop(mockAudio, true);
      
      // Find the ended event handler and call it
      const endedHandler = mockAudio.addEventListener.mock.calls.find(call => call[0] === 'ended')?.[1];
      if (endedHandler) {
        await endedHandler.call(mockAudio);
        expect(mockAudio.currentTime).toBe(0);
      }
    });
  });

  describe('Cleanup', () => {
    it('should clean up audio resources', () => {
      const { cleanupAudio } = useAudio();
      
      cleanupAudio(mockAudio);
      
      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.removeAttribute).toHaveBeenCalledWith('src');
      expect(mockAudio.load).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null audio element gracefully', () => {
      const { pauseAudio, stopAudio, cleanupAudio } = useAudio();
      
      const nullAudio = null as any;
      
      expect(() => pauseAudio(nullAudio)).not.toThrow();
      expect(() => stopAudio(nullAudio)).not.toThrow();
      expect(() => cleanupAudio(nullAudio)).not.toThrow();
    });

    it('should handle rapid play/pause operations', async () => {
      const { playAudio, pauseAudio } = useAudio();
      
      await playAudio(mockAudio);
      pauseAudio(mockAudio);
      await playAudio(mockAudio);
      pauseAudio(mockAudio);
      
      expect(mockAudio.play).toHaveBeenCalledTimes(2);
      expect(mockAudio.pause).toHaveBeenCalledTimes(2);
    });
  });
});
