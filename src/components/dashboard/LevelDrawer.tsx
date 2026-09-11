import { AnimatePresence, motion } from "framer-motion";
import { useProgressStore } from "../../store/useProgressStore";
import { LevelCard } from "./LevelCard";
import type { LevelStatus } from "./LevelCard";
import type { ModuleId, StageSummary } from "../../types/dashboard";

interface LevelDrawerProps {
  /** 目前開啟的模組，null 代表抽屜關閉 */
  moduleId: ModuleId | null;
  stages: StageSummary[];
  onSelectStage: (stageId: string) => void;
  onClose: () => void;
}

const MODULE_LABELS: Record<ModuleId, string> = {
  planner: "📔 羈絆手札",
  navigation: "🚶 城市邂逅",
  call: "📞 專屬來電",
};

const EMPTY_IDS: string[] = [];

/**
 * 由畫面底部滑出的關卡進度選單（Bottom Sheet Drawer）。
 * 玩家在大廳點擊任一常設關卡入口後開啟，橫向排列所有關卡卡片，
 * 依 useProgressStore 的 completedStages 決定每張卡片是已通關／目前解鎖／未解鎖。
 */
export function LevelDrawer({
  moduleId,
  stages,
  onSelectStage,
  onClose,
}: LevelDrawerProps) {
  const completedIds = useProgressStore((s) =>
    moduleId ? s.completedStages[moduleId] : EMPTY_IDS,
  );

  const isOpen = moduleId !== null;
  const completedCount = stages.filter((s) =>
    completedIds.includes(s.id),
  ).length;
  // 第一個尚未通關的關卡視為「目前解鎖」，在它之後的關卡都還是鎖定狀態
  const currentIndex = stages.findIndex((s) => !completedIds.includes(s.id));

  return (
    <AnimatePresence>
      {isOpen && moduleId && (
        <>
          <motion.div
            key="level-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-text-main/30 backdrop-blur-sm"
          />
          <motion.div
            key="level-drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[2.5rem] bg-white/90 pt-4 shadow-peach-lg backdrop-blur-md"
          >
            <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-primary-light" />

            <div className="flex items-center justify-between pl-5 pr-5">
              <h2 className="font-jp text-lg font-bold text-text-main">
                {MODULE_LABELS[moduleId]}
              </h2>
              <span className="text-sm font-bold text-text-muted">
                {completedCount} / {stages.length}
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto p-5">
              {stages.map((stage, index) => {
                const isCompleted = completedIds.includes(stage.id);
                const status: LevelStatus = isCompleted
                  ? "completed"
                  : index === currentIndex
                    ? "current"
                    : "locked";

                return (
                  <LevelCard
                    key={stage.id}
                    levelNumber={`1-${index + 1}`}
                    title={stage.title}
                    reward={stage.reward}
                    status={status}
                    onSelect={() => onSelectStage(stage.id)}
                  />
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
