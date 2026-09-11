import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { isSpeechMatch, diffTranscript, getMatchRatio } from "../../lib/speechMatch";
import { playAudio, stopAudio, callAudioUrl } from "../../lib/audio";
import { pauseBgm, resumeBgm } from "../../lib/bgm";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useProgressStore } from "../../store/useProgressStore";
import { useMemoriesStore } from "../../store/useMemoriesStore";
import { collectibles } from "../../data/collectibles";
import { THUMBNAIL_MAP, VIDEO_MAP } from "../../data/collectibleAssets";
import { SpringButton } from "../ui/SpringButton";
import { StampEffect } from "../ui/StampEffect";
import { Waveform } from "../ui/Waveform";
import { ClozeLine } from "./ClozeLine";
import { MicButton } from "./MicButton";
import { CollectibleRevealOverlay } from "../memories/CollectibleRevealOverlay";
import { IncomingCallGate } from "../ui/IncomingCallGate";
import haruHead from "../../assets/character/haru_head.png";
import haruNight from "../../assets/character/haru_night.png";
import call1Bg from "../../assets/bg/call_bg.png";
import type { CallStage } from "../../types/call";
import type { Collectible } from "../../types/memories";

type SpeakFeedback = "idle" | "correct" | "wrong";

interface CallBoardProps {
  stage: CallStage;
  onGoHome: () => void;
  onGoNext?: () => void;
}

export function CallBoard({ stage, onGoHome, onGoNext }: CallBoardProps) {
  const completeStage = useProgressStore((s) => s.completeStage);
  const completedStages = useProgressStore((s) => s.completedStages.call);
  const alreadyCompleted = completedStages.includes(stage.id);

  const unlockCollectible = useMemoriesStore((s) => s.unlockCollectible);
  const [revealCollectible, setRevealCollectible] = useState<Collectible | null>(null);
  // 進關卡先強制玩家按下接聽鈕，順便讓瀏覽器認定這是使用者操作，之後的自動語音才播得出來
  const [answered, setAnswered] = useState(false);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [clozeLineIndex, setClozeLineIndex] = useState(0);
  const [wrongOption, setWrongOption] = useState<string | null>(null);
  const [speakFeedback, setSpeakFeedback] = useState<SpeakFeedback>("idle");
  const [worryMessage, setWorryMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  // 錄音結束後的最終辨識文字；先讓玩家確認、按下「送出」才會真的送出比對
  const [finalTranscript, setFinalTranscript] = useState<string | null>(null);

  const isDone = phaseIndex >= stage.phases.length;
  const currentPhase = isDone ? null : stage.phases[phaseIndex];
  const speechMatchRatio =
    currentPhase?.type === "speak" && finalTranscript !== null
      ? getMatchRatio(finalTranscript, currentPhase.line.text)
      : 0;

  // 通關時自動播放 Haru 的成功台詞；speak phase 是玩家自己要講的台詞，不需要語音
  useEffect(() => {
    if (isDone && answered) {
      playAudio(callAudioUrl(stage.id, "success"));
    }
  }, [isDone, answered]); // eslint-disable-line react-hooks/exhaustive-deps

  // 一進入需要錄音的 speak 階段就先讓出音訊焦點給麥克風，不等按下錄音鍵才暫停，
  // 讓 Android 有更充裕的時間切換音訊焦點，避免辨識收不到聲音；上一句對話語音若還沒播完也直接切掉
  useEffect(() => {
    if (answered && currentPhase?.type === "speak") {
      stopAudio();
      pauseBgm();
      return () => resumeBgm();
    }
  }, [answered, currentPhase?.type, phaseIndex]);

  function triggerWrongFeedback(message: string) {
    setIsShaking(true);
    setWorryMessage(message);
    window.setTimeout(() => setIsShaking(false), 450);
    window.setTimeout(() => setWorryMessage(null), 2200);
  }

  function advancePhase() {
    const next = phaseIndex + 1;
    if (next >= stage.phases.length) {
      setPhaseIndex(next);
      completeStage("call", stage.id, stage.reward);
      unlockStageRewards();
    } else {
      setPhaseIndex(next);
      setClozeLineIndex(0);
    }
  }

  /** 第一次通關此關卡時，解鎖對應的珍藏卡冊收藏品（可能不止一項）並自動彈出播放畫面 */
  function unlockStageRewards() {
    if (alreadyCompleted) return;

    const unlockedItems = collectibles.filter(
      (item) =>
        item.unlockCondition.module === "call" &&
        item.unlockCondition.stageId === stage.id,
    );
    if (unlockedItems.length === 0) return;

    unlockedItems.forEach((item) => unlockCollectible(item.id));
    setRevealCollectible(unlockedItems[0]);
  }

  function handleClozeSelect(option: string) {
    if (!currentPhase || currentPhase.type !== "cloze") return;
    const line = currentPhase.lines[clozeLineIndex];
    if (!line) return;

    if (option === line.answer) {
      setWrongOption(null);
      const nextLine = clozeLineIndex + 1;
      if (nextLine >= currentPhase.lines.length) {
        advancePhase();
      } else {
        setClozeLineIndex(nextLine);
      }
    } else {
      setWrongOption(option);
      triggerWrongFeedback("嗯～好像不是這個，再聽一次看看？");
      window.setTimeout(() => setWrongOption(null), 600);
    }
  }

  function handleSpeechFinal(transcript: string) {
    if (!currentPhase || currentPhase.type !== "speak") return;
    setFinalTranscript(transcript);
  }

  function handleStartListening() {
    setFinalTranscript(null);
    setSpeakFeedback("idle");
    start();
  }

  function handleSubmitSpeech() {
    if (!currentPhase || currentPhase.type !== "speak" || finalTranscript === null) return;
    if (speechMatchRatio < 0.5) return;
    const line = currentPhase.line;

    if (!finalTranscript.trim()) {
      setSpeakFeedback("wrong");
      triggerWrongFeedback("咦，沒聽到聲音耶。再說一次看看？");
      window.setTimeout(() => setSpeakFeedback("idle"), 900);
      return;
    }

    if (isSpeechMatch(finalTranscript, line.text)) {
      setSpeakFeedback("correct");
      window.setTimeout(() => {
        setSpeakFeedback("idle");
        setFinalTranscript(null);
        advancePhase();
      }, 700);
    } else {
      setSpeakFeedback("wrong");
      triggerWrongFeedback("再說一次同樣的台詞看看？");
      window.setTimeout(() => setSpeakFeedback("idle"), 900);
    }
  }

  const { isSupported, isListening, transcript, error: speechError, start, stop } =
    useSpeechRecognition({ lang: "ja-JP", onFinalResult: handleSpeechFinal });

  const phaseLabel = currentPhase
    ? currentPhase.type === "cloze"
      ? "通話中・看字幕選答案"
      : "通話中・用麥克風回答"
    : "通話結束";

  return (
    <div
      className={cn(
        "relative mx-auto flex h-full w-full flex-col overflow-hidden rounded-3xl shadow-peach-lg",
        isShaking && "animate-shake",
      )}
    >      <img
        src={call1Bg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/5 to-black/10" />

      {!answered && (
        <IncomingCallGate callerName={stage.callerName} onAnswer={() => setAnswered(true)} />
      )}

      <AnimatePresence>
        {isDone && (
          <StampEffect
            key="stamp"
            title="繋がったね！"
            subtitle="HeartPoints Get！"
          />
        )}
      </AnimatePresence>

      {/* 頂部：來電者資訊 */}
      <header className="relative z-20 flex items-center justify-between gap-2 p-4 text-white">
        <div className="flex items-center gap-2">
          <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-white/70">
            <img src={haruHead} alt="陽" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold drop-shadow">
              {stage.callerName} 的來電
            </p>
            <p className="text-[10px] text-white/80">{phaseLabel}</p>
          </div>
        </div>
        <Waveform active={!isDone} />
      </header>

      {/* 男主角立繪（全身站姿，貼齊畫面右下方，疊在字幕上方；玩家自己開口說話時不顯示） */}
      {!isDone && currentPhase?.type !== "speak" && (
        <motion.img
          key={phaseIndex}
          src={haruNight}
          alt={stage.callerName}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="pointer-events-none absolute right-0 bottom-0 z-30 h-[65%] w-[34%] object-contain object-bottom drop-shadow-2xl sm:h-[70%]"
        />
      )}

      {/* 陽的碎念（答錯回饋） */}
      <AnimatePresence>
        {worryMessage && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="relative z-20 mx-4 mb-2 rounded-2xl bg-white/85 px-3 py-2 text-center text-xs font-bold text-text-main backdrop-blur-md"
          >
            陽：{worryMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 對話框（乙女遊戲風格，固定在畫面下方；半透明底＋淺色文字，兼顧立繪透出與字幕可讀性；立繪出現時右側預留等寬留白避免遮字） */}
      <div
        className={cn(
          "relative z-20 mt-auto max-h-[60%] overflow-y-auto rounded-t-3xl bg-white/30 p-4 text-white backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.25)]",
          !isDone && currentPhase?.type !== "speak" && "pr-[36%]",
        )}
      >
        {answered && currentPhase?.type === "cloze" && currentPhase.lines[clozeLineIndex] && (
          <ClozeLine
            key={currentPhase.lines[clozeLineIndex].id}
            stageId={stage.id}
            line={currentPhase.lines[clozeLineIndex]}
            isDone={false}
            wrongOption={wrongOption}
            onSelect={handleClozeSelect}
          />
        )}

        {answered && currentPhase?.type === "speak" && (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-xs font-bold text-primary">
              🎙️ {currentPhase.line.prompt}
            </p>
            <div>
              <p className="font-jp text-lg font-bold text-white">
                {currentPhase.line.text}
              </p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-xs text-white/70">
                  {currentPhase.line.romaji}
                </p>
                <button
                  type="button"
                  onClick={() => playAudio(callAudioUrl(stage.id, currentPhase.line.id))}
                  aria-label="播放示範發音"
                  className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs"
                >
                  🔊
                </button>
              </div>
            </div>

            {!isListening && finalTranscript !== null && speakFeedback === "idle" ? (
              <div className="min-h-[1.25rem] space-y-1">
                <p className="font-jp text-lg font-bold">
                  {diffTranscript(finalTranscript, currentPhase.line.text).map((c, i) => (
                    <span key={i} className={c.correct ? "text-success" : "text-error"}>
                      {c.char}
                    </span>
                  ))}
                </p>
                <p className="text-xs text-white/70">
                  {speechMatchRatio < 0.5
                    &&"正確率不到五成喔，再長按麥克風試一次吧"}
                </p>
              </div>
            ) : (
              <p
                className={cn(
                  "min-h-[1.25rem] text-sm font-bold",
                  speakFeedback === "correct" && "text-success",
                  speakFeedback === "wrong" && "text-error",
                  speakFeedback === "idle" && "text-white/70",
                )}
              >
                {isListening
                  ? transcript || "長按麥克風開始說話"
                  : "長按麥克風開始說話"}
              </p>
            )}

            <div className="flex items-center gap-2">
              <MicButton
                isListening={isListening}
                disabled={!isSupported}
                onStart={handleStartListening}
                onStop={stop}
              />

              {!isListening && finalTranscript !== null && speakFeedback === "idle" && (
                <SpringButton
                  size="sm"
                  disabled={speechMatchRatio < 0.5}
                  onClick={handleSubmitSpeech}
                >
                  送出
                </SpringButton>
              )}
            </div>

            {isSupported && !isListening && speechError && (
              <p className="text-xs text-error">
                {speechError === "not-allowed" || speechError === "service-not-allowed"
                  ? "請允許麥克風權限喔"
                  : "好像沒有聽清楚，再試一次看看"}
              </p>
            )}

            {!isSupported && (
              <div className="space-y-2">
                <p className="text-xs text-white/70">
                  這個裝置不支援語音辨識功能。
                </p>
                <SpringButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setFinalTranscript(currentPhase.line.text)}
                >
                  正解を送る（開発用）
                </SpringButton>
              </div>
            )}
          </div>
        )}

        {isDone && (
          <div className="space-y-4">
            <div className="space-y-1 text-center">
              <p className="font-jp text-white">{stage.successLine}</p>
              <p className="text-xs text-white/70">{stage.successTranslation}</p>
            </div>
            <div className="flex justify-center gap-3">
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
    </div>
  );
}
