import { AnimatePresence, motion } from "framer-motion";
import type { Greeting } from "../../types/dashboard";

interface GreetingBubbleProps {
  greeting: Greeting | null;
  /** 每次戳一戳遞增的計數器，用來強制重新播放進場動畫（即使抽到同一句話） */
  token: number;
}

/**
 * 戳一戳陽之後，在陽「右側」浮現的日常問候對話框，附帶羅馬拼音方便學習。
 * 尾巴指向左邊（陽的方向），由外層容器（見 Dashboard.tsx）決定絕對定位位置。
 */
export function GreetingBubble({ greeting, token }: GreetingBubbleProps) {
  return (
    <AnimatePresence mode="wait">
      {greeting && (
        <motion.div
          key={token}
          initial={{ opacity: 0, x: -10, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -6, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="relative w-[220px] rounded-3xl bg-white/90 px-5 py-3 text-center shadow-peach backdrop-blur-md sm:-ml-10"
        >
          <p className="font-jp text-base font-bold text-text-main">
            {greeting.text}
          </p>
          <span className="absolute left-1/2 bottom-0 h-3 w-3 -translate-x-1/2 translate-y-1/2 rotate-45 bg-white/90 sm:left-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

