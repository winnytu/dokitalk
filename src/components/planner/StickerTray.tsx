import { useDroppable } from "@dnd-kit/core";
import { cn } from "../../lib/cn";
import { WordSticker } from "./WordSticker";
import type { PlannerSticker } from "../../types/planner";

interface StickerTrayProps {
  stickers: PlannerSticker[];
  disabled?: boolean;
}

export function StickerTray({ stickers, disabled }: StickerTrayProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "tray" });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-text-muted/30 bg-white/40 p-3 transition-colors",
        isOver && "border-primary bg-primary-light/30",
      )}
    >
      {stickers.length === 0 ? (
        <p className="text-sm font-bold text-success">全部貼完了！真棒！</p>
      ) : (
        stickers.map((sticker) => (
          <WordSticker
            key={sticker.id}
            sticker={sticker}
            disabled={disabled}
          />
        ))
      )}
    </div>
  );
}
