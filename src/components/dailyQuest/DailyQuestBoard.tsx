import { useEffect } from "react";
import { dailyTasks } from "../../data/dailyTasks";
import { useDailyQuestStore } from "../../store/useDailyQuestStore";
import { useProgressStore } from "../../store/useProgressStore";
import { GlassCard } from "../ui/GlassCard";
import { ActivityProgressBar } from "./ActivityProgressBar";
import { TaskItem } from "./TaskItem";
import type { DailyTaskView } from "../../types/dailyQuest";

interface DailyQuestBoardProps {
  /** 任務卡片的「前往」按鈕觸發，導航到指定的模組畫面 */
  onNavigate: (target: "navigation" | "memories") => void;
}

/**
 * 每日任務（Daily Quest）主畫面：手帳本／便條紙風格。
 * 顯示活躍度進度條與任務清單，並在掛載時檢查是否跨日以自動重置每日進度。
 */
export function DailyQuestBoard({ onNavigate }: DailyQuestBoardProps) {
  const checkAndResetDaily = useDailyQuestStore((s) => s.checkAndResetDaily);
  const activityPoints = useDailyQuestStore((s) => s.activityPoints);
  const coins = useDailyQuestStore((s) => s.coins);
  const taskProgress = useDailyQuestStore((s) => s.tasks);
  const updateTaskProgress = useDailyQuestStore((s) => s.updateTaskProgress);
  const claimTaskReward = useDailyQuestStore((s) => s.claimTaskReward);

  const navigationCompletedCount = useProgressStore(
    (s) => s.completedStages.navigation.length,
  );

  // 跨日重置：每次進入這個畫面都檢查一次系統日期。
  useEffect(() => {
    checkAndResetDaily();
  }, [checkAndResetDaily]);

  // 「完成地圖關卡」任務與城市邂逅模組的實際通關紀錄同步，
  // 只要玩家曾通關過任一導航關卡，該任務進度就視為達標。
  useEffect(() => {
    if (navigationCompletedCount > 0) {
      updateTaskProgress("clear-navigation-stage", 1);
    }
  }, [navigationCompletedCount, updateTaskProgress]);

  const tasks: DailyTaskView[] = dailyTasks.map((def) => {
    const progress = taskProgress.find((t) => t.id === def.id);
    return {
      ...def,
      progress: progress?.progress ?? 0,
      isClaimed: progress?.isClaimed ?? false,
    };
  });

  return (
    <GlassCard padding="lg" className="relative flex h-full w-full flex-col overflow-hidden">
      <header className="mb-4 shrink-0">
        <p className="text-xs text-text-muted">
          完成任務累積活躍度與金幣 ・ 🪙 {coins}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
      <ActivityProgressBar activityPoints={activityPoints} />

      <div className="mt-5 flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onClaim={() => claimTaskReward(task.id)}
            onGo={() => task.target && onNavigate(task.target)}
          />
        ))}
      </div>
      </div>
    </GlassCard>
  );
}
