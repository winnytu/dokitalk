import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";
import { collectibles } from "../../data/collectibles";
import { useMemoriesStore } from "../../store/useMemoriesStore";
import { useProgressStore } from "../../store/useProgressStore";
import { GlassCard } from "../ui/GlassCard";
import { CollectionBinder } from "./CollectionBinder";
import { StudyLog } from "./StudyLog";
import type { ModuleId } from "../../types/dashboard";

type MemoriesTab = "studyLog" | "collection";

const TABS: { id: MemoriesTab; label: string }[] = [
  { id: "studyLog", label: "📚 學習軌跡" },
  { id: "collection", label: "🖼️ 珍藏卡冊" },
];

const TRACKED_MODULES: ModuleId[] = ["planner", "navigation", "call"];

/**
 * 回憶錄（Memories）主畫面：Tabs 切換「學習軌跡」與「珍藏卡冊」。
 * 掛載時會把 useProgressStore 裡實際的關卡通關紀錄同步進 useMemoriesStore，
 * 讓「已通關關卡才解鎖學習筆記／收藏品」的規則吃到真實遊戲進度。
 */
export function MemoriesBoard() {
  const [tab, setTab] = useState<MemoriesTab>("studyLog");

  const completedStages = useProgressStore((s) => s.completedStages);
  const unlockStage = useMemoriesStore((s) => s.unlockStage);
  const unlockCollectible = useMemoriesStore((s) => s.unlockCollectible);

  useEffect(() => {
    for (const module of TRACKED_MODULES) {
      for (const stageId of completedStages[module]) {
        unlockStage(`${module}:${stageId}`);

        for (const item of collectibles) {
          if (
            item.unlockCondition.module === module &&
            item.unlockCondition.stageId === stageId
          ) {
            unlockCollectible(item.id);
          }
        }
      }
    }
  }, [completedStages, unlockStage, unlockCollectible]);

  return (
    <GlassCard padding="lg" className="relative flex h-full w-full flex-col overflow-hidden">
      <div className="mb-4 flex shrink-0 gap-2 rounded-2xl bg-primary-light/30 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-xl py-2 text-xs font-bold transition-colors",
              tab === t.id
                ? "bg-white text-text-main shadow-peach"
                : "text-text-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
      {tab === "studyLog" ? <StudyLog /> : <CollectionBinder />}
      </div>
    </GlassCard>
  );
}
