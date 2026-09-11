import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

export type LevelStatus = "completed" | "current" | "locked";

interface LevelCardProps {
  levelNumber: string;
  title: string;
  reward: number;
  status: LevelStatus;
  onSelect: () => void;
}

/**
 * 關卡選單裡的單張橫向卡片。
 * - completed：粉色主色卡片，顯示過關獲得的 HeartPoints；點擊會直接重新開始這一關。
 * - current：目前解鎖、尚未通關的關卡，帶 primary-light 光暈外框與呼吸縮放動畫。
 * - locked：灰階／半透明毛玻璃，中央疊加鎖頭圖示，無法點擊。
 */
export function LevelCard({
  levelNumber,
  title,
  reward,
  status,
  onSelect,
}: LevelCardProps) {
  const isLocked = status === "locked";

  return (
    <motion.button
      type="button"
      disabled={isLocked}
      onClick={onSelect}
      whileHover={isLocked ? undefined : { scale: 1.05, y: -3 }}
      whileTap={isLocked ? undefined : { scale: 0.95 }}
      animate={status === "current" ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={
        status === "current"
          ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          : { type: "spring", stiffness: 400, damping: 15 }
      }
      className={cn(
        "relative flex h-24 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-3xl p-3 text-center shadow-peach",
        status === "completed" && "bg-primary text-white",
        status === "current" &&
          "bg-white/80 text-text-main ring-4 ring-primary-light backdrop-blur-md",
        isLocked &&
          "cursor-not-allowed bg-white/40 text-text-muted backdrop-blur-md",
      )}
    >
      <div className={cn("flex flex-col items-center gap-1", isLocked && "opacity-40 grayscale")}>
        <span className="text-xs font-bold opacity-80">{levelNumber}</span>
        <span className="font-jp line-clamp-2 text-xs font-bold leading-tight">
          {title}
        </span>
        {status === "completed" && (
          <span className="mt-1 text-xs font-bold">💗 {reward}</span>
        )}
      </div>

      {status === "completed" && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-xs font-bold">
          ↺
        </span>
      )}

      {isLocked && (
        <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg shadow-peach">
          🔒
        </span>
      )}
    </motion.button>
  );
}
