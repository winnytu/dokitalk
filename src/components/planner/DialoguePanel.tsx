import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { playAudio } from "../../lib/audio";
import { TranslationReveal } from "../ui/TranslationReveal";
import haruHead from "../../assets/character/haru_head.png";
import meHead from "../../assets/character/me_head.png";
import type { PlannerDialogue } from "../../types/planner";

interface DialoguePanelProps {
  dialogues: PlannerDialogue[];
}

export function DialoguePanel({ dialogues }: DialoguePanelProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold text-text-muted">💬 對話提示</p>
      {dialogues.map((d, i) => {
        const isHaru = d.speaker === "haru";
        return (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, x: isHaru ? -12 : 12, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
              delay: i * 0.08,
            }}
            className={cn(
              "flex items-start gap-2",
              !isHaru && "flex-row-reverse",
            )}
          >
            <span
              className={cn(
                "mt-0.5 h-7 w-7 shrink-0 overflow-hidden rounded-full",
                isHaru ? "bg-primary-light" : "bg-success/30",
              )}
            >
              <img
                src={isHaru ? haruHead : meHead}
                alt={isHaru ? "陽" : "前輩"}
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
              <div className="flex items-center gap-1.5">
                <p className="font-jp">{d.text}</p>
                <button
                  type="button"
                  onClick={() => playAudio(d.audioUrl)}
                  aria-label="播放語音"
                  className="shrink-0 text-xs opacity-70 hover:opacity-100"
                >
                  🔊
                </button>
              </div>
              {d.translation && (
                <TranslationReveal
                  text={d.translation}
                  className="mt-0.5 text-xs text-text-muted"
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
