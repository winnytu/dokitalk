import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

interface ActivityProgressBarProps {
  /** 目前活躍度，範圍 0～100 */
  activityPoints: number;
}

/** 進度條上要標示節點的分數門檻 */
const MILESTONES = [20, 40, 60, 80, 100];

/**
 * 手帳本風格的活躍度進度條：滿分 100，在 20/40/60/80/100 分處放置節點，
 * 達標的節點會亮起並播放微小的提示動畫（脈動光暈）。
 */
export function ActivityProgressBar({ activityPoints }: ActivityProgressBarProps) {
  const clamped = Math.min(Math.max(activityPoints, 0), 100);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-text-muted">今日活躍度</span>
        <span className="text-xs font-bold text-text-main">{clamped} / 100</span>
      </div>

      <div className="relative h-3 w-full overflow-visible rounded-full bg-primary-light/50">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
        />

        {MILESTONES.map((threshold) => {
          const isReached = clamped >= threshold;
          return (
            <div
              key={threshold}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${threshold}%` }}
            >
              {isReached && (
                <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-primary/50" />
              )}
              <span
                className={cn(
                  "relative block h-4 w-4 rounded-full border-2 border-white shadow-peach",
                  isReached ? "bg-primary" : "bg-white/80",
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
