import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ModuleKey = "planner" | "navigation" | "call";

export interface GameProgressState {
  /** 各模組已通關的關卡 ID 清單 */
  completedStages: {
    planner: string[]; // 已通關的手帳關卡 ID
    navigation: string[]; // 已通關的導航關卡 ID
    call: string[]; // 已通關的通話關卡 ID
  };
  heartPoints: number; // 戀愛代幣
  intimacyLevel: number; // 好感度等級

  /** 標記某關卡通關並發放獎勵；同一關卡不會重複發放獎勵 */
  completeStage: (module: ModuleKey, stageId: string, reward: number) => void;
  /** 重置全部進度（例如「重新開始故事」功能使用） */
  resetProgress: () => void;
}

const INITIAL_STATE = {
  completedStages: {
    planner: [],
    navigation: [],
    call: [],
  },
  heartPoints: 0,
  intimacyLevel: 1,
} satisfies Pick<
  GameProgressState,
  "completedStages" | "heartPoints" | "intimacyLevel"
>;

/**
 * 每累積這麼多 HeartPoints，好感度等級 (intimacyLevel) 就會提升一級。
 * 之後若需要調整養成曲線，只需修改這個常數。
 */
const HEART_POINTS_PER_LEVEL = 50;

export const useProgressStore = create<GameProgressState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      completeStage: (module, stageId, reward) => {
        const alreadyCompleted = get().completedStages[module].includes(stageId);
        if (alreadyCompleted) return;

        set((state) => {
          const nextHeartPoints = state.heartPoints + reward;
          return {
            completedStages: {
              ...state.completedStages,
              [module]: [...state.completedStages[module], stageId],
            },
            heartPoints: nextHeartPoints,
            intimacyLevel:
              Math.floor(nextHeartPoints / HEART_POINTS_PER_LEVEL) + 1,
          };
        });
      },

      resetProgress: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: "dokitalk-progress", // localStorage key
    },
  ),
);
