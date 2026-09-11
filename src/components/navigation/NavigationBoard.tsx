import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProgressStore } from "../../store/useProgressStore";
import { useMemoriesStore } from "../../store/useMemoriesStore";
import { useNavigationGameStore } from "../../store/useNavigationGameStore";
import { townMap } from "../../data/townMap";
import { collectibles } from "../../data/collectibles";
import { THUMBNAIL_MAP, VIDEO_MAP } from "../../data/collectibleAssets";
import { GlassCard } from "../ui/GlassCard";
import { SpringButton } from "../ui/SpringButton";
import { StampEffect } from "../ui/StampEffect";
import { Waveform } from "../ui/Waveform";
import { TranslationReveal } from "../ui/TranslationReveal";
import { playAudio, navigationAudioUrl } from "../../lib/audio";
import { CollectibleRevealOverlay } from "../memories/CollectibleRevealOverlay";
import { IncomingCallGate } from "../ui/IncomingCallGate";
import { DirectionPad } from "./DirectionPad";
import { GridMap } from "./GridMap";
import { IndoorScene } from "./IndoorScene";
import type { NavigationStage } from "../../types/navigation";
import type { Collectible } from "../../types/memories";

interface NavigationBoardProps {
  stage: NavigationStage;
  onGoHome: () => void;
  onGoNext?: () => void;
}

export function NavigationBoard({ stage, onGoHome, onGoNext }: NavigationBoardProps) {
  const completeStage = useProgressStore((s) => s.completeStage);
  const completedStages = useProgressStore((s) => s.completedStages.navigation);
  const alreadyCompleted = completedStages.includes(stage.id);

  const unlockStage = useMemoriesStore((s) => s.unlockStage);
  const unlockCollectible = useMemoriesStore((s) => s.unlockCollectible);
  const [revealCollectible, setRevealCollectible] = useState<Collectible | null>(null);
  const [hintRevealed, setHintRevealed] = useState(false);
  // 進關卡先強制玩家按下接聽鈕，順便讓瀏覽器認定這是使用者操作，之後的自動語音才播得出來
  const [answered, setAnswered] = useState(false);

  const taskIndex = useNavigationGameStore((s) => s.taskIndex);
  const playerPos = useNavigationGameStore((s) => s.playerPos);
  const facing = useNavigationGameStore((s) => s.facing);
  const haruMessage = useNavigationGameStore((s) => s.haruMessage);
  const isDone = useNavigationGameStore((s) => s.isDone);
  const move = useNavigationGameStore((s) => s.move);
  const answerIndoor = useNavigationGameStore((s) => s.answerIndoor);
  const clearMessage = useNavigationGameStore((s) => s.clearMessage);
  const resetGame = useNavigationGameStore((s) => s.reset);

  useEffect(() => {
    resetGame(stage, false);
    setAnswered(false);
  }, [stage.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentTask = stage.tasks[taskIndex] ?? null;
  const isMapPhase = currentTask?.type === "map";
  const isIndoorPhase = currentTask?.type === "indoor";

  // 每次切換到新任務時，語音提示需重新收合，待玩家點擊才顯示；地圖任務會自動播放方位語音提示
  useEffect(() => {
    setHintRevealed(false);
    if (currentTask?.type === "map" && answered) {
      playAudio(navigationAudioUrl(stage.id, currentTask.id));
    }
  }, [currentTask?.id, answered]); // eslint-disable-line react-hooks/exhaustive-deps

  // 通關時自動播放 Haru 的成功台詞語音
  useEffect(() => {
    if (isDone && answered) {
      playAudio(navigationAudioUrl(stage.id, "success"));
    }
  }, [isDone, answered]); // eslint-disable-line react-hooks/exhaustive-deps

  /** 第一次通關此關卡時，解鎖對應的珍藏卡冊收藏品（可能不止一項）；有 CG 圖／影片就自動彈出播放畫面 */
  function unlockStageRewards() {
    if (alreadyCompleted) return;

    unlockStage(`navigation:${stage.id}`);

    const unlockedItems = collectibles.filter(
      (item) =>
        item.unlockCondition.module === "navigation" &&
        item.unlockCondition.stageId === stage.id,
    );
    if (unlockedItems.length === 0) return;

    unlockedItems.forEach((item) => unlockCollectible(item.id));
    setRevealCollectible(unlockedItems[0]);
  }

  function handleIndoorAnswer(optionId: string): boolean {
    const correct = answerIndoor(optionId, stage);
    if (useNavigationGameStore.getState().isDone) {
      completeStage("navigation", stage.id, stage.reward);
      unlockStageRewards();
    }
    return correct;
  }

  function handleMove(dir: "up" | "down" | "left" | "right") {
    move(dir, stage, townMap);
    if (useNavigationGameStore.getState().isDone) {
      completeStage("navigation", stage.id, stage.reward);
      unlockStageRewards();
    }
  }

  // PC 操作：地圖階段時可用方向鍵／WASD 直接移動，不必只靠螢幕上的按鈕
  useEffect(() => {
    if (!isMapPhase) return;

    const KEY_TO_DIRECTION: Record<string, "up" | "down" | "left" | "right"> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      W: "up",
      s: "down",
      S: "down",
      a: "left",
      A: "left",
      d: "right",
      D: "right",
    };

    function handleKeyDown(e: KeyboardEvent) {
      const dir = KEY_TO_DIRECTION[e.key];
      if (!dir) return;
      e.preventDefault();
      handleMove(dir);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMapPhase, stage.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeHint = isMapPhase ? currentTask.hint : null;
  const activeHintTranslation = isMapPhase ? currentTask.hintTranslation : null;

  return (
    <>
      <GlassCard padding="md" className="relative flex h-full w-full flex-col overflow-hidden">
      {!answered && (
        <IncomingCallGate callerName="陽" onAnswer={() => setAnswered(true)} />
      )}

      <AnimatePresence>
        {isDone && <StampEffect key="stamp" title="到着！" subtitle="HeartPoints Get！" />}
      </AnimatePresence>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
      {/* 室內階段以外（地圖階段的提示／回饋已改為疊加在地圖上，見下方） */}

      {/* 地圖階段：地圖填滿整個可用區域，Haru 指示、撞牆回饋、方向鍵皆疊加在地圖上 */}
      {isMapPhase && (
        <motion.div
          key={`map-${currentTask.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-full w-full"
        >
          <GridMap map={townMap} playerPos={playerPos} facing={facing} />

          {/* Haru 方位提示卡：語音自動播放，字幕（日文＋翻譯）預設收合，點擊後才顯示 */}
          {activeHint && !hintRevealed && (
            <motion.button
              key={`${currentTask.id}-collapsed`}
              type="button"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => setHintRevealed(true)}
              className="absolute inset-x-2 top-2 z-20 flex items-center justify-between gap-2 rounded-xl bg-gradient-to-b from-primary/100 to-primary-light/100 p-3 text-white shadow-peach"
            >
              <span className="text-center text-xs font-bold opacity-90">📞 陽的指示</span>
              <Waveform active />
              <span className="text-center text-xs font-bold opacity-90">顯示字幕</span>
              
            </motion.button>
          )}

          {activeHint && hintRevealed && (
            <motion.div
              key={currentTask.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="absolute inset-x-2 top-2 z-20 rounded-3xl bg-gradient-to-b from-primary/85 to-primary-light/70 p-3 text-white shadow-peach backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <p className="mb-1 text-xs font-bold opacity-90">📞 陽的指示</p>
                <button
                  type="button"
                  onClick={() => setHintRevealed(false)}
                  aria-label="收合字幕"
                  className="-mt-1 -mr-1 rounded-full px-2 py-0.5 text-xs font-bold text-white/80 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <Waveform active />
              <p className="mt-2 text-center font-jp text-sm font-bold">
                {activeHint}
              </p>
              {activeHintTranslation && (
                <div className="mt-1 text-center flex justify-center items-center">
                  <TranslationReveal
                    text={activeHintTranslation}
                    className="text-xs text-white/80"
                    buttonClassName="text-white underline decoration-dotted"
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Haru 反饋氣泡（撞牆/走錯建築） */}
          <AnimatePresence>
            {haruMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                onClick={clearMessage}
                className="absolute inset-x-6 top-24 z-20 cursor-pointer rounded-2xl bg-error/85 px-4 py-2 text-center text-xs font-bold text-white shadow-peach backdrop-blur-sm"
              >
                🐶 {haruMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 上下左右方向鍵：PC 可用鍵盤操作，只在 mobile 顯示螢幕按鈕 */}
          <div className="absolute inset-x-0 bottom-3 z-20 flex select-none flex-col items-center gap-1">
            <div className="md:hidden">
              <DirectionPad onMove={handleMove} />
            </div>
            <p className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-white md:hidden">
              點畫面按鈕移動 → 走向建築物就會自動進入喲
            </p>
            <p className="hidden rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-white md:block">
              方向鍵／WASD 移動 → 走向建築物就會自動進入喲
            </p>
          </div>
        </motion.div>
      )}

      {/* 室內階段 */}
      {answered && isIndoorPhase && (
        <IndoorScene
          key={currentTask.id}
          stageId={stage.id}
          step={currentTask}
          onAnswer={handleIndoorAnswer}
        />
      )}

      {/* 完成 */}
      {isDone && (
        <div className="mt-4 rounded-2xl bg-success/15 p-4 text-center">
          <p className="font-jp text-sm font-bold text-text-main">
            🐶 {stage.successLine}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {stage.successTranslation}
          </p>
          <div className="mt-3 flex justify-center gap-3">
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
      )}
      </div>
      </GlassCard>

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
    </>
  );
}