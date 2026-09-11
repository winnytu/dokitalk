import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SpringButton } from "../ui/SpringButton";
import { TranslationReveal } from "../ui/TranslationReveal";
import { Waveform } from "../ui/Waveform";
import { playAudio, navigationAudioUrl } from "../../lib/audio";
import type { IndoorTask } from "../../types/navigation";

interface IndoorSceneProps {
  stageId: string;
  step: IndoorTask;
  onAnswer: (optionId: string) => boolean;
}

export function IndoorScene({ stageId, step, onAnswer }: IndoorSceneProps) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [haruRevealed, setHaruRevealed] = useState(false);

  // 進入場景時自動播放 Haru 台詞語音
  useEffect(() => {
    if (step.haruLine) {
      playAudio(navigationAudioUrl(stageId, step.id));
    }
  }, [step.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSelect(optionId: string) {
    const correct = onAnswer(optionId);
    if (!correct) {
      setWrongId(optionId);
      window.setTimeout(() => setWrongId(null), 600);
    }
  }

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="flex flex-col items-center gap-4 rounded-3xl bg-white/60 p-6 backdrop-blur-md"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light/40 text-5xl">
        {step.sceneEmoji}
      </div>
      <p className="text-xs font-bold text-text-muted">{step.sceneLabel}</p>

      {/* Haru 台詞：語音自動播放，字幕預設收合，點擊後才顯示 */}
      {step.haruLine && !haruRevealed && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={() => setHaruRevealed(true)}
          className="flex w-full items-center justify-between gap-2 rounded-2xl bg-primary-light/50 px-4 py-3 text-text-main"
        >
          <span className="text-xs font-bold opacity-80">🐶 Haru</span>
          <Waveform active />
          <span className="text-xs font-bold opacity-80">顯示字幕</span>
        </motion.button>
      )}

      {step.haruLine && haruRevealed && (
        <div className="w-full rounded-2xl bg-primary-light/50 px-4 py-3 text-center">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-muted opacity-80">🐶 Haru</span>
            <button
              type="button"
              onClick={() => setHaruRevealed(false)}
              aria-label="收合字幕"
              className="-mt-1 -mr-1 rounded-full px-2 py-0.5 text-xs font-bold text-text-muted hover:text-text-main"
            >
              ✕
            </button>
          </div>
          <Waveform active />
          <p className="mt-2 font-jp text-sm font-bold text-text-main">
            {step.haruLine}
          </p>
          {step.haruTranslation && (
            <TranslationReveal
              text={step.haruTranslation}
              className="mt-1 text-xs text-text-muted"
            />
          )}
        </div>
      )}

      <p className="text-sm font-bold text-text-main">{step.question}</p>

      <div className="flex flex-wrap justify-center gap-3">
        <AnimatePresence>
          {step.options.map((opt) => (
            <SpringButton
              key={opt.id}
              variant={wrongId === opt.id ? "error" : "ghost"}
              onClick={() => handleSelect(opt.id)}
            >
              {opt.label}
            </SpringButton>
          ))}
        </AnimatePresence>
      </div>

      {wrongId && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-bold text-error"
        >
          再想想看！
        </motion.p>
      )}
    </motion.div>
  );
}
