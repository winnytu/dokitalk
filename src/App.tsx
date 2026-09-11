import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CallBoard } from "./components/call/CallBoard";
import { Dashboard } from "./components/dashboard/Dashboard";
import { LevelDrawer } from "./components/dashboard/LevelDrawer";
import { DailyQuestBoard } from "./components/dailyQuest/DailyQuestBoard";
import { MemoriesBoard } from "./components/memories/MemoriesBoard";
import { NavigationBoard } from "./components/navigation/NavigationBoard";
import { PlannerBoard } from "./components/planner/PlannerBoard";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { SpringButton } from "./components/ui/SpringButton";
import { callStages } from "./data/callStages";
import { navigationStages } from "./data/navigationStages";
import { plannerStages } from "./data/plannerStages";
import { playBgm, type BgmKey } from "./lib/bgm";
import { stopAudio } from "./lib/audio";
import { useProgressStore } from "./store/useProgressStore";
import type { ModuleId, StageSummary, UtilityModuleId } from "./types/dashboard";

type View = "dashboard" | ModuleId | UtilityModuleId;

const VIEW_BGM: Record<View, BgmKey> = {
  dashboard: "ambient",
  planner: "planner",
  navigation: "navigation",
  call: "call",
  dailyQuest: "ambient",
  memories: "ambient",
};

const MODULE_TITLES: Record<ModuleId, string> = {
  planner: "📔 羈絆手札",
  navigation: "🚶 城市邂逅",
  call: "📞 專屬來電",
};

const UTILITY_TITLES: Record<UtilityModuleId, string> = {
  dailyQuest: "📝 每日任務",
  memories: "📖 回憶錄",
};

const MODULE_STAGES: Record<ModuleId, StageSummary[]> = {
  planner: plannerStages,
  navigation: navigationStages,
  call: callStages,
};

/** 判斷目前畫面是否為「有關卡選單」的常設關卡模組（planner／navigation／call） */
function isModuleId(view: View): view is ModuleId {
  return view === "planner" || view === "navigation" || view === "call";
}

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [drawerModule, setDrawerModule] = useState<ModuleId | null>(null);
  const [plannerStageId, setPlannerStageId] = useState(plannerStages[0].id);
  const [navigationStageId, setNavigationStageId] = useState(
    navigationStages[0].id,
  );
  const [callStageId, setCallStageId] = useState(callStages[0].id);
  const [showSettings, setShowSettings] = useState(false);

  const heartPoints = useProgressStore((s) => s.heartPoints);
  const intimacyLevel = useProgressStore((s) => s.intimacyLevel);

  useEffect(() => {
    stopAudio();
    playBgm(VIEW_BGM[view]);
  }, [view]);

  const plannerStage =
    plannerStages.find((s) => s.id === plannerStageId) ?? plannerStages[0];
  const navigationStage =
    navigationStages.find((s) => s.id === navigationStageId) ??
    navigationStages[0];
  const callStage =
    callStages.find((s) => s.id === callStageId) ?? callStages[0];

  function handleSelectStage(module: ModuleId, stageId: string) {
    stopAudio();
    if (module === "planner") setPlannerStageId(stageId);
    if (module === "navigation") setNavigationStageId(stageId);
    if (module === "call") setCallStageId(stageId);
    setDrawerModule(null);
    setView(module);
  }

  /** 取得同模組下一關的 stageId，若已是最後一關則回傳 null */
  function getNextStageId(module: ModuleId, currentStageId: string): string | null {
    const stages = MODULE_STAGES[module];
    const index = stages.findIndex((s) => s.id === currentStageId);
    return index >= 0 ? (stages[index + 1]?.id ?? null) : null;
  }

  function handleGoNext(module: ModuleId, currentStageId: string) {
    const nextId = getNextStageId(module, currentStageId);
    if (nextId) handleSelectStage(module, nextId);
  }

  const currentStageTitle =
    view === "planner"
      ? plannerStage.title
      : view === "navigation"
        ? navigationStage.title
        : view === "call"
          ? callStage.title
          : null;

  return (
    <>
      <AnimatePresence>
        {view === "dashboard" ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Dashboard
              onEnterModule={(module) => setDrawerModule(module)}
              onOpenUtility={(utility) => setView(utility)}
              onOpenSettings={() => setShowSettings(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="module-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex h-dvh w-full flex-col items-center gap-4 overflow-hidden bg-background p-2"
          >
            {/* 頂部導覽列：回大廳 ＋ 全域 HeartPoints／好感度；手機版強制單行，元素縮小不換行 */}
            <div className="flex w-full flex-nowrap items-center justify-between gap-2 rounded-3xl bg-white/60 p-2 shadow-peach backdrop-blur-md sm:gap-3 sm:p-3">
              <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 sm:gap-2">
                <SpringButton
                  size="sm"
                  variant="ghost"
                  className="shrink-0 px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
                  onClick={() => setView("dashboard")}
                >
                  ← 大廳
                </SpringButton>
                {/* 手機版右上角是 Viverse 內建 logo，設定鈕改放左側避免重疊 */}
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  aria-label="設定"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-sm shadow-peach sm:h-9 sm:w-9"
                >
                  ⚙️
                </button>
                <span className="min-w-0 flex-1 truncate px-1 text-xs font-bold text-text-main sm:px-2 sm:text-sm">
                  {isModuleId(view)
                    ? (currentStageTitle ?? MODULE_TITLES[view])
                    : UTILITY_TITLES[view]}
                </span>
                {isModuleId(view) && (
                  <SpringButton
                    size="sm"
                    variant="ghost"
                    className="shrink-0 px-2.5 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
                    onClick={() => {
                      stopAudio();
                      setDrawerModule(view);
                    }}
                  >
                    關卡選單
                  </SpringButton>
                )}
              </div>

              <div className="shrink-0 rounded-2xl bg-primary-light/60 px-2.5 py-1.5 text-xs font-bold text-text-main sm:px-4 sm:py-2 sm:text-sm">
                💗 {heartPoints} ・ Lv.{intimacyLevel}
              </div>
            </div>

            {/* key={stage.id} 讓切換關卡時各模組主體重新掛載，內部狀態自動歸零 */}
            <div className="flex min-h-0 w-full flex-1 flex-col items-center overflow-hidden">
              {view === "planner" && (
                <PlannerBoard
                  key={plannerStage.id}
                  stage={plannerStage}
                  onGoHome={() => setView("dashboard")}
                  onGoNext={
                    getNextStageId("planner", plannerStage.id)
                      ? () => handleGoNext("planner", plannerStage.id)
                      : undefined
                  }
                />
              )}
              {view === "navigation" && (
                <NavigationBoard
                  key={navigationStage.id}
                  stage={navigationStage}
                  onGoHome={() => setView("dashboard")}
                  onGoNext={
                    getNextStageId("navigation", navigationStage.id)
                      ? () => handleGoNext("navigation", navigationStage.id)
                      : undefined
                  }
                />
              )}
              {view === "call" && (
                <CallBoard
                  key={callStage.id}
                  stage={callStage}
                  onGoHome={() => setView("dashboard")}
                  onGoNext={
                    getNextStageId("call", callStage.id)
                      ? () => handleGoNext("call", callStage.id)
                      : undefined
                  }
                />
              )}
              {view === "dailyQuest" && (
                <DailyQuestBoard onNavigate={(target) => setView(target)} />
              )}
              {view === "memories" && <MemoriesBoard />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LevelDrawer
        moduleId={drawerModule}
        stages={drawerModule ? MODULE_STAGES[drawerModule] : []}
        onSelectStage={(stageId) =>
          drawerModule && handleSelectStage(drawerModule, stageId)
        }
        onClose={() => setDrawerModule(null)}
      />

      <AnimatePresence>
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
