import { useState } from "react";
import { cn } from "../../lib/cn";
import { playAudio } from "../../lib/audio";
import { callStages } from "../../data/callStages";
import { navigationStages } from "../../data/navigationStages";
import { plannerStages } from "../../data/plannerStages";
import { vocabularyNotes } from "../../data/vocabularyNotes";
import { useDailyQuestStore } from "../../store/useDailyQuestStore";
import { useMemoriesStore } from "../../store/useMemoriesStore";
import type { ModuleId } from "../../types/dashboard";

interface StageOption {
  module: ModuleId;
  stageId: string;
  title: string;
}

const MODULE_LABELS: Record<ModuleId, string> = {
  planner: "📔 羈絆手札",
  navigation: "🚶 城市邂逅",
  call: "📞 專屬來電",
};

/** 合併三大模組的關卡清單，作為學習軌跡的「關卡選擇」清單來源 */
const ALL_STAGES: StageOption[] = [
  ...plannerStages.map((s) => ({
    module: "planner" as const,
    stageId: s.id,
    title: s.title,
  })),
  ...navigationStages.map((s) => ({
    module: "navigation" as const,
    stageId: s.id,
    title: s.title,
  })),
  ...callStages.map((s) => ({
    module: "call" as const,
    stageId: s.id,
    title: s.title,
  })),
];

function stageKey(module: ModuleId, stageId: string): string {
  return `${module}:${stageId}`;
}

/** 依模組分組的關卡清單，供「關卡選擇」區塊顯示分組標題 */
const STAGES_BY_MODULE: { module: ModuleId; stages: StageOption[] }[] = (
  ["planner", "navigation", "call"] as const
).map((module) => ({
  module,
  stages: ALL_STAGES.filter((s) => s.module === module),
}));

/**
 * 回憶錄 Tab 1「學習軌跡」：左側／上方為關卡選擇，
 * 右側／下方顯示該關卡解鎖的單字卡與文法筆記。
 */
export function StudyLog() {
  const clearedStages = useMemoriesStore((s) => s.clearedStages);
  const updateTaskProgress = useDailyQuestStore((s) => s.updateTaskProgress);

  const firstCleared = ALL_STAGES.find((s) =>
    clearedStages.includes(stageKey(s.module, s.stageId)),
  );
  const [selectedModule, setSelectedModule] = useState<ModuleId | null>(
    firstCleared?.module ?? null,
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(
    firstCleared ? stageKey(firstCleared.module, firstCleared.stageId) : null,
  );

  const selectedStage = ALL_STAGES.find(
    (s) => stageKey(s.module, s.stageId) === selectedKey,
  );
  const note = selectedStage
    ? vocabularyNotes.find(
        (n) =>
          n.module === selectedStage.module &&
          n.stageId === selectedStage.stageId,
      )
    : undefined;

  function handlePlayAudio(audioUrl?: string) {
    // 目前僅預留播放語音的 UI／行為，音檔不存在時會靜默失敗，不影響操作。
    playAudio(audioUrl);
    updateTaskProgress("review-vocabulary", 1);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {/* 關卡選擇：先選模組，再顯示該模組的關卡 */}
      <div className="flex shrink-0 flex-col gap-3 sm:w-40">
        <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible">
          {STAGES_BY_MODULE.map(({ module }) => {
            const isSelected = module === selectedModule;
            return (
              <button
                key={module}
                type="button"
                onClick={() => setSelectedModule(module)}
                className={cn(
                  "shrink-0 rounded-2xl px-3 py-2 text-left text-xs font-bold shadow-peach",
                  isSelected ? "bg-primary text-white" : "bg-white/80 text-text-main",
                )}
              >
                {MODULE_LABELS[module]}
              </button>
            );
          })}
        </div>

        {selectedModule && (
          <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-visible sm:max-h-[22rem] sm:overflow-y-auto">
            {STAGES_BY_MODULE.find((m) => m.module === selectedModule)?.stages.map(
              (stage) => {
                const key = stageKey(stage.module, stage.stageId);
                const isCleared = clearedStages.includes(key);
                const isSelected = key === selectedKey;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!isCleared}
                    onClick={() => setSelectedKey(key)}
                    className={cn(
                      "shrink-0 rounded-2xl px-3 py-2 text-left text-xs font-bold shadow-peach",
                      isSelected
                        ? "bg-primary text-white"
                        : isCleared
                          ? "bg-white/80 text-text-main"
                          : "cursor-not-allowed bg-white/40 text-text-muted opacity-50",
                    )}
                  >
                    <p className="font-jp line-clamp-1">
                      {isCleared ? stage.title : "🔒 未解鎖"}
                    </p>
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>

      {/* 單字卡／文法筆記 */}
      <div className="flex-1 rounded-2xl bg-white/60 p-4 shadow-peach">
        {!selectedStage ? (
          <p className="py-8 text-center text-xs font-bold text-text-muted">
            通關任一關卡後，這裡會出現對應的單字卡與文法筆記喔。
          </p>
        ) : !note ? (
          <p className="py-8 text-center text-xs font-bold text-text-muted">
            這關的筆記整理中，敬請期待。
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-xs font-bold text-text-muted">單字卡</p>
              <div className="flex flex-col gap-2">
                {note.vocabulary.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-2 rounded-xl bg-primary-light/30 px-3 py-2"
                  >
                    <div>
                      <p className="font-jp text-sm font-bold text-text-main">
                        {v.word}
                        <span className="ml-1 text-xs font-normal text-text-muted">
                          {v.reading}
                        </span>
                      </p>
                      <p className="text-xs text-text-muted">{v.meaning}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(v.audioUrl)}
                      aria-label={`播放 ${v.word} 的發音`}
                      className="shrink-0 rounded-full bg-white/80 p-2 text-sm shadow-peach"
                    >
                      🔊
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-text-muted">文法筆記</p>
              <div className="flex flex-col gap-2">
                {note.grammar.map((g) => (
                  <div key={g.id} className="rounded-xl bg-primary-light/30 px-3 py-2">
                    <p className="font-jp text-sm font-bold text-text-main">
                      {g.pattern}
                    </p>
                    <p className="text-xs text-text-muted">{g.explanation}</p>
                    <p className="mt-1 font-jp text-xs text-text-main">{g.example}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
