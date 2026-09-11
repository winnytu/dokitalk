import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsState {
  /** 語音（角色台詞／單字發音等）音量，範圍 0～1 */
  voiceVolume: number;
  /** 背景音樂音量，範圍 0～1 */
  bgmVolume: number;

  setVoiceVolume: (volume: number) => void;
  setBgmVolume: (volume: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      voiceVolume: 1,
      bgmVolume: 0.1,

      setVoiceVolume: (volume) =>
        set({ voiceVolume: Math.min(1, Math.max(0, volume)) }),
      setBgmVolume: (volume) =>
        set({ bgmVolume: Math.min(1, Math.max(0, volume)) }),
    }),
    {
      name: "dokitalk-settings", // localStorage key
    },
  ),
);
