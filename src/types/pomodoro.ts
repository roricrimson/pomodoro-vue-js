export interface TimerDuration {
  work: number;
  shortBreak: number;
  longBreak: number;
}

export interface AmbientSound {
  audio: HTMLAudioElement;
  name: string;
  isPlaying: boolean;
  volume: number;
  hasError?: boolean;
  errorMessage?: string;
  isLoading?: boolean;
}

export interface TodoItem {
  id: number;
  name: string;
  checked: boolean;
}
