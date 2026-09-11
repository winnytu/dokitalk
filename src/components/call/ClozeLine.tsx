import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import { cn } from "../../lib/cn";
import { SpringButton } from "../ui/SpringButton";
import { TranslationReveal } from "../ui/TranslationReveal";
import { playAudio, callAudioUrl } from "../../lib/audio";
import type { CallClozeLine } from "../../types/call";

interface ClozeLineProps {
  stageId: string;
  line: CallClozeLine;
  isDone: boolean;
  wrongOption: string | null;
  onSelect: (option: string) => void;
}

export function ClozeLine({ stageId, line, isDone, wrongOption, onSelect }: ClozeLineProps) {
  const isHaru = line.speaker === "haru";

  // 句子出現時自動播放語音；玩家（女主角）自己要講的台詞不需要語音
  useEffect(() => {
    if (isHaru) {
      playAudio(callAudioUrl(stageId, line.id));
    }
  }, [line.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="space-y-1"
    >
      <p className="text-[10px] font-bold text-white/70">
        {isHaru ? "🐶 Haru" : "💭 你"}
      </p>
      <p className="font-jp text-lg leading-relaxed text-white">
        {line.before}
        <span
          className={cn(
            "mx-1 inline-block min-w-[3.5rem] rounded-lg px-2 text-center font-bold",
            isDone
              ? "bg-success/25 text-success"
              : " text-primary",
          )}
        >
          {isDone ? line.answer : "＿＿＿"}
        </span>
        {line.after}
      </p>
      <TranslationReveal text={line.translation} className="text-xs text-white/70" />

      {!isDone &&
        // 用 portal 掛到 body：父層 motion.div 有 transform，會讓 fixed 定位失效變成相對父層置中
        createPortal(
          <div className="fixed inset-x-0 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-2 px-6">
            {line.options.map((option) => (
              <SpringButton
                key={option}
                size="sm"
                variant={wrongOption === option ? "error" : "ghost"}
                onClick={() => onSelect(option)}
              >
                {option}
              </SpringButton>
            ))}
          </div>,
          document.body,
        )}
    </motion.div>
  );
}
