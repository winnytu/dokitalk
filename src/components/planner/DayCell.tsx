import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import type { DayId, PlannerSticker } from "../../types/planner";

const DAY_LABELS: Record<DayId, string> = {
  mon: "月",
  tue: "火",
  wed: "水",
  thu: "木",
  fri: "金",
  sat: "土",
  sun: "日",
};

interface DayCellProps {
  day: DayId;
  placedStickers: PlannerSticker[];
  isWrong: boolean;
  disabled?: boolean;
  onRemoveSticker?: (stickerId: string) => void;
}

export function DayCell({ day, placedStickers, isWrong, disabled, onRemoveSticker }: DayCellProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${day}`, disabled });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[68px] items-center gap-3 rounded-2xl border-2 border-dashed border-primary-light/70 bg-white/40 px-4 py-3 transition-colors",
        isOver && !isWrong && "border-primary bg-primary-light/50",
        isWrong && "animate-shake border-error bg-error/10",
      )}
    >
      <span className="w-6 shrink-0 font-jp text-lg font-bold text-text-main">
        {DAY_LABELS[day]}
      </span>
      <div className="flex flex-1 flex-wrap gap-2">
        {placedStickers.length === 0 && (
          <span className="text-xs text-text-muted">貼在這裡吧</span>
        )}
        {placedStickers.map((sticker) => (
          <motion.span
            key={sticker.id}
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 font-jp text-sm font-bold text-text-main shadow-sm",
              sticker.type === "action"
                ? "rounded-xl bg-success/30"
                : "rounded-full bg-primary/25",
            )}
          >
            {sticker.label}
            {!disabled && onRemoveSticker && (
              <button
                type="button"
                onClick={() => onRemoveSticker(sticker.id)}
                aria-label="移除貼紙"
                className="-mr-1 rounded-full px-1 text-text-muted hover:text-error"
              >
                ✕
              </button>
            )}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
