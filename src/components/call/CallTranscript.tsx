import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { TranslationReveal } from "../ui/TranslationReveal";
import haruHead from "../../assets/character/haru_head.png";
import meHead from "../../assets/character/me_head.png";
import type { CallStage } from "../../types/call";

interface TranscriptLine {
  id: string;
  speaker: "haru" | "player";
  text: string;
  translation?: string;
}

function buildTranscript(stage: CallStage): TranscriptLine[] {
  const lines: TranscriptLine[] = [];
  for (const phase of stage.phases) {
    if (phase.type === "cloze") {
      for (const line of phase.lines) {
        lines.push({
          id: line.id,
          speaker: line.speaker,
          text: `${line.before}${line.answer}${line.after}`,
          translation: line.translation,
        });
      }
    } else {
      lines.push({
        id: phase.line.id,
        speaker: "player",
        text: phase.line.text,
        translation: phase.line.prompt,
      });
    }
  }
  return lines;
}

interface CallTranscriptProps {
  stage: CallStage;
}

/** 通話結束後回顧這一關的對話，一次只顯示一句，點擊「下一句」往後看 */
export function CallTranscript({ stage }: CallTranscriptProps) {
  const [lines] = useState(() => buildTranscript(stage));
  const [index, setIndex] = useState(0);

  const line = lines[index];
  if (!line) return null;

  const isHaru = line.speaker === "haru";
  const isLast = index >= lines.length - 1;

  return (
    <div className="space-y-3">
      <p className="text-center text-xs font-bold text-text-muted">
        📜 通話回顧 ・ {index + 1}/{lines.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={line.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={cn(
            "flex items-start gap-2",
            !isHaru && "flex-row-reverse",
          )}
        >
          <span
            className={cn(
              "mt-0.5 h-6 w-6 shrink-0 overflow-hidden rounded-full",
              isHaru ? "bg-primary-light" : "bg-success/30",
            )}
          >
            <img
              src={isHaru ? haruHead : meHead}
              alt={isHaru ? "陽" : "你"}
              className="h-full w-full object-cover"
            />
          </span>
          <div
            className={cn(
              "rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-peach",
              isHaru
                ? "rounded-tl-sm bg-primary-light/60 text-text-main"
                : "rounded-tr-sm bg-success/20 text-text-main",
            )}
          >
            <p className="font-jp">{line.text}</p>
            {line.translation && (
              <TranslationReveal
                text={line.translation}
                className="mt-0.5 text-xs text-text-muted"
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(i + 1, lines.length - 1))}
          disabled={isLast}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold shadow-peach",
            isLast
              ? "cursor-not-allowed bg-white/60 text-text-muted"
              : "bg-primary text-white",
          )}
        >
          {isLast ? "已是最後一句" : "下一句 ▶"}
        </button>
      </div>
    </div>
  );
}
