import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AnimatePresence } from "framer-motion";
import { useProgressStore } from "../../store/useProgressStore";
import { usePlannerGameStore } from "../../store/usePlannerGameStore";
import { useMemoriesStore } from "../../store/useMemoriesStore";
import { collectibles } from "../../data/collectibles";
import { THUMBNAIL_MAP, VIDEO_MAP } from "../../data/collectibleAssets";
import { GlassCard } from "../ui/GlassCard";
import { SpringButton } from "../ui/SpringButton";
import { StampEffect } from "../ui/StampEffect";
import { DialoguePanel } from "./DialoguePanel";
import { DayCell } from "./DayCell";
import { StickerTray } from "./StickerTray";
import { WordSticker } from "./WordSticker";
import { CollectibleRevealOverlay } from "../memories/CollectibleRevealOverlay";
import type { DayId, PlannerStage } from "../../types/planner";
import type { Collectible } from "../../types/memories";

const DAY_ORDER: DayId[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

interface PlannerBoardProps {
  stage: PlannerStage;
  onGoHome: () => void;
  onGoNext?: () => void;
}

export function PlannerBoard({ stage, onGoHome, onGoNext }: PlannerBoardProps) {
  const completeStage = useProgressStore((s) => s.completeStage);
  const completedStages = useProgressStore((s) => s.completedStages.planner);
  const alreadyCompleted = completedStages.includes(stage.id);

  const unlockCollectible = useMemoriesStore((s) => s.unlockCollectible);
  const [revealCollectible, setRevealCollectible] = useState<Collectible | null>(null);

  const placements = usePlannerGameStore((s) => s.placements);
  const isComplete = usePlannerGameStore((s) => s.isComplete);
  const placeSticker = usePlannerGameStore((s) => s.placeSticker);
  const removeSticker = usePlannerGameStore((s) => s.removeSticker);
  const checkAnswer = usePlannerGameStore((s) => s.checkAnswer);
  const resetGame = usePlannerGameStore((s) => s.reset);

  useEffect(() => {
    resetGame();
  }, [stage.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeId, setActiveId] = useState<string | null>(null);
  const [wrongDay] = useState<DayId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const activeSticker = useMemo(
    () => stage.stickers.find((s) => s.id === activeId) ?? null,
    [activeId, stage.stickers],
  );

  const placedStickerIds = useMemo(() => {
    const ids = new Set<string>();
    for (const day of DAY_ORDER) {
      for (const id of placements[day]) {
        ids.add(id);
      }
    }
    return ids;
  }, [placements]);

  const trayStickers = stage.stickers.filter((s) => !placedStickerIds.has(s.id));

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const sticker = stage.stickers.find((s) => s.id === active.id);
    if (!sticker) return;

    if (over.id === "tray") {
      removeSticker(sticker.id);
      return;
    }

    const targetDay = String(over.id).replace("day-", "") as DayId;

    // 放置貼紙（不限類型、不限數量）
    placeSticker(targetDay, sticker.id);

    // 檢查是否全部正確
    const tempPlacements = { ...placements };
    tempPlacements[targetDay] = [...tempPlacements[targetDay], sticker.id];

    const allCorrect = DAY_ORDER.every((d) => {
      const exp = stage.expectedAnswers[d] ?? [];
      const placed = tempPlacements[d];
      if (placed.length !== exp.length) return false;
      const sortedPlaced = [...placed].sort();
      const sortedExp = [...exp].sort();
      return sortedPlaced.every((v, i) => v === sortedExp[i]);
    });

    if (allCorrect) {
      checkAnswer(stage);
      completeStage("planner", stage.id, stage.reward);
      unlockStageRewards();
    }
  }

  function getStickersByIds(ids: string[]) {
    return ids
      .map((id) => stage.stickers.find((s) => s.id === id))
      .filter(Boolean) as typeof stage.stickers;
  }

  /** 第一次通關此關卡時，解鎖對應的珍藏卡冊收藏品（可能不止一項）並自動彈出播放畫面 */
  function unlockStageRewards() {
    if (alreadyCompleted) return;

    const unlockedItems = collectibles.filter(
      (item) =>
        item.unlockCondition.module === "planner" &&
        item.unlockCondition.stageId === stage.id,
    );
    if (unlockedItems.length === 0) return;

    unlockedItems.forEach((item) => unlockCollectible(item.id));
    setRevealCollectible(unlockedItems[0]);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <GlassCard
        padding="md"
        className="relative flex h-full w-full flex-col overflow-hidden"
      >
        <AnimatePresence>{isComplete && <StampEffect key="stamp" />}</AnimatePresence>
        {
          isComplete &&  <header className="mb-3 flex shrink-0 flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            
              <div className="flex shrink-0 gap-2">
                <SpringButton size="sm" variant="ghost" onClick={onGoHome}>
                  🏠 回到主頁
                </SpringButton>
                {onGoNext && (
                  <SpringButton size="sm" onClick={onGoNext}>
                    ➡️ 下一關
                  </SpringButton>
                )}
              </div>
          </div>
        </header>
        } 
       

        <div className="grid min-h-0 flex-[7] gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="min-h-0 overflow-y-auto pr-1">
            <DialoguePanel dialogues={stage.dialogues} />
          </div>

          <div className="min-h-0 space-y-3 overflow-y-auto border-t-2 border-dashed border-primary-light pt-4 pr-1 md:border-l-2 md:border-t-0 md:pl-6 md:pt-0">
            {DAY_ORDER.map((day) => (
              <DayCell
                key={day}
                day={day}
                placedStickers={getStickersByIds(placements[day])}
                isWrong={wrongDay === day}
                disabled={isComplete}
                onRemoveSticker={removeSticker}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex shrink-0 flex-col gap-2 overflow-hidden">
          <p className="shrink-0 text-xs font-bold text-text-muted">
            貼紙（拖拉來貼上）
          </p>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
            <StickerTray
              stickers={trayStickers}
              disabled={isComplete}
            />
          </div>
        </div>
      </GlassCard>

      <DragOverlay>
        {activeSticker ? <WordSticker sticker={activeSticker} /> : null}
      </DragOverlay>

      <AnimatePresence>
        {revealCollectible && (
          <CollectibleRevealOverlay
            key={revealCollectible.id}
            collectible={revealCollectible}
            imageSrc={THUMBNAIL_MAP[revealCollectible.thumbnail]}
            videoSrc={VIDEO_MAP[revealCollectible.thumbnail]}
            onClose={() => setRevealCollectible(null)}
          />
        )}
      </AnimatePresence>
    </DndContext>
  );
}
