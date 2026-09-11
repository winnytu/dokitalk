import { useState } from "react";
import { cn } from "../../lib/cn";

interface TranslationRevealProps {
  text: string;
  className?: string;
  buttonClassName?: string;
}

/** 預設隱藏中文翻譯，點擊後才顯示；再次點擊可收合 */
export function TranslationReveal({
  text,
  className,
  buttonClassName,
}: TranslationRevealProps) {
  const [visible, setVisible] = useState(false);

  if (visible) {
    return (
      <button
        type="button"
        onClick={() => setVisible(false)}
        className={cn("block text-left", className)}
      >
        {text}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setVisible(true)}
      className={cn(
        "mt-0.5 text-xs font-bold text-primary underline decoration-dotted",
        buttonClassName,
      )}
    >
      翻譯
    </button>
  );
}
