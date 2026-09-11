import { motion } from "framer-motion";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "../../lib/cn";
import type { PlannerSticker } from "../../types/planner";

interface WordStickerProps {
  sticker: PlannerSticker;
  isShaking?: boolean;
  disabled?: boolean;
}

export function WordSticker({ sticker, isShaking, disabled }: WordStickerProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: sticker.id,
    data: { sticker },
    disabled,
  });

  const isAction = sticker.type === "action";

  return (
    <motion.button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={cn(
        "flex touch-none flex-col items-center gap-0.5 px-4 py-2 shadow-peach",
        "cursor-grab active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-60",
        isAction
          ? "rounded-xl bg-success/25 text-text-main"
          : "rounded-full bg-primary-light text-text-main",
        isDragging && "opacity-0",
        isShaking && "animate-shake",
      )}
    >
      <span className="font-jp text-sm font-bold leading-none text-text-main">
        {sticker.label}
      </span>
    </motion.button>
  );
}
