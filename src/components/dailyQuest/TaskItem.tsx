import { cn } from "../../lib/cn";
import { SpringButton } from "../ui/SpringButton";
import type { DailyTaskView } from "../../types/dailyQuest";

interface TaskItemProps {
  task: DailyTaskView;
  /** 點擊「領取」按鈕 */
  onClaim: () => void;
  /** 點擊「前往」按鈕（僅有 target 的任務才會顯示這顆按鈕） */
  onGo: () => void;
}

/**
 * 手帳便條紙風格的任務卡片。按鈕狀態三選一：
 * - 尚未達標：「前往」（若任務有指定 target 模組，點擊會導航過去）
 * - 已達標未領取：「領取」（高亮強調色）
 * - 已領取：「已完成」（置灰不可點擊）
 */
export function TaskItem({ task, onClaim, onGo }: TaskItemProps) {
  const isDone = task.progress >= task.goal;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-primary-light/60 bg-white/70 p-3 shadow-peach">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-jp text-sm font-bold text-text-main">{task.title}</p>
        <p className="text-xs text-text-muted">{task.description}</p>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-light/50">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min((task.progress / task.goal) * 100, 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] font-bold text-text-muted">
            {Math.min(task.progress, task.goal)}/{task.goal}
          </span>
        </div>
        <p className="text-[10px] font-bold text-primary">
          🪙 {task.rewardCoins} ・ 活躍度 +{task.rewardActivity}
        </p>
      </div>

      {task.isClaimed ? (
        <SpringButton size="sm" variant="ghost" disabled className="shrink-0">
          已完成
        </SpringButton>
      ) : isDone ? (
        <SpringButton
          size="sm"
          variant="primary"
          onClick={onClaim}
          className={cn("shrink-0 animate-pulse")}
        >
          領取
        </SpringButton>
      ) : (
        <SpringButton
          size="sm"
          variant="ghost"
          onClick={onGo}
          disabled={!task.target}
          className="shrink-0"
        >
          前往
        </SpringButton>
      )}
    </div>
  );
}
