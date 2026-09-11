import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MemoriesState {
  /** 已解鎖學習筆記的關卡清單，格式為 `${module}:${stageId}`，例如 "navigation:1-1" */
  clearedStages: string[];
  /** 已解鎖的珍藏卡冊收藏品 id 清單 */
  unlockedCollectibles: string[];

  /** 標記某關卡的學習筆記已解鎖（重複呼叫同一個 key 不會有副作用） */
  unlockStage: (stageKey: string) => void;
  /** 標記某個收藏品已解鎖（重複呼叫同一個 id 不會有副作用） */
  unlockCollectible: (collectibleId: string) => void;
}

export const useMemoriesStore = create<MemoriesState>()(
  persist(
    (set, get) => ({
      clearedStages: [],
      unlockedCollectibles: [],

      unlockStage: (stageKey) => {
        if (get().clearedStages.includes(stageKey)) return;
        set((state) => ({
          clearedStages: [...state.clearedStages, stageKey],
        }));
      },

      unlockCollectible: (collectibleId) => {
        if (get().unlockedCollectibles.includes(collectibleId)) return;
        set((state) => ({
          unlockedCollectibles: [...state.unlockedCollectibles, collectibleId],
        }));
      },
    }),
    {
      name: "dokitalk-memories", // localStorage key
    },
  ),
);
