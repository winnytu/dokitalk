import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dailyTasks } from "../data/dailyTasks";
import type { DailyTaskProgress } from "../types/dailyQuest";

/** 取得系統今天的日期字串（YYYY-MM-DD），用來判斷是否已跨日 */
function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 依 dailyTasks 靜態設定產生一份全新（進度歸零）的任務進度陣列 */
function freshTasks(): DailyTaskProgress[] {
  return dailyTasks.map((task) => ({
    id: task.id,
    progress: 0,
    isClaimed: false,
  }));
}

export interface DailyQuestState {
  /** 最後一次「跨日檢查」通過的日期（YYYY-MM-DD），用來判斷今天是否已重置過 */
  lastLoginDate: string;
  /** 活躍度進度條數值，範圍 0～100 */
  activityPoints: number;
  /** 完成任務累積的金幣（獨立於 useProgressStore 的 HeartPoints） */
  coins: number;
  /** 每項任務的即時進度（陣列項目與 dailyTasks 的靜態設定以 id 對應） */
  tasks: DailyTaskProgress[];

  /**
   * 檢查系統日期是否已跨日；若跨日則重置活躍度／金幣以外的每日狀態
   * （金幣是永久累積的貨幣，不隨跨日重置），並自動將「每日登入」任務標記為達標。
   * 建議在每日任務畫面掛載時（useEffect）呼叫一次。
   */
  checkAndResetDaily: () => void;
  /** 增加某項任務的進度，會自動夾在該任務的 goal 以內 */
  updateTaskProgress: (taskId: string, amount?: number) => void;
  /** 領取任務獎勵；任務尚未達標或已經領取過時不會有任何效果 */
  claimTaskReward: (taskId: string) => void;
}

export const useDailyQuestStore = create<DailyQuestState>()(
  persist(
    (set, get) => ({
      lastLoginDate: "",
      activityPoints: 0,
      coins: 0,
      tasks: freshTasks(),

      checkAndResetDaily: () => {
        const today = getTodayString();
        if (get().lastLoginDate === today) return;

        const resetTasks = freshTasks();
        // 「每日登入」任務：只要今天有打開這個畫面就視為達標，之後只差手動領取。
        const loginTask = dailyTasks.find((t) => t.type === "login");
        if (loginTask) {
          const progress = resetTasks.find((t) => t.id === loginTask.id);
          if (progress) progress.progress = loginTask.goal;
        }

        set({
          lastLoginDate: today,
          activityPoints: 0,
          tasks: resetTasks,
        });
      },

      updateTaskProgress: (taskId, amount = 1) => {
        const def = dailyTasks.find((t) => t.id === taskId);
        if (!def) return;

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, progress: Math.min(task.progress + amount, def.goal) }
              : task,
          ),
        }));
      },

      claimTaskReward: (taskId) => {
        const def = dailyTasks.find((t) => t.id === taskId);
        const task = get().tasks.find((t) => t.id === taskId);
        if (!def || !task) return;
        if (task.isClaimed || task.progress < def.goal) return;

        set((state) => ({
          coins: state.coins + def.rewardCoins,
          activityPoints: Math.min(
            state.activityPoints + def.rewardActivity,
            100,
          ),
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, isClaimed: true } : t,
          ),
        }));
      },
    }),
    {
      name: "dokitalk-daily-quest", // localStorage key
    },
  ),
);
