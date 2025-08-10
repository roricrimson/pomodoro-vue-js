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
}

export interface TodoItem {
  id: number;
  name: string;
  checked: boolean;
}
