import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import haruMain from "../../assets/character/haru_main.png";

interface HaruPortraitProps {
  onPoke: () => void;
}

/**
 * 畫面正中央的陽（Haru）半身立繪。
 * 使用 haru_main.png 全身立繪，外層 motion.div 負責「呼吸」的上下浮動
 * （持續循環，不受戳一戳影響），內層 motion.button 負責戳一戳時的
 * Q 彈回饋動畫，兩者各自控制不同的 transform 屬性，動畫互不干擾。
 */
export function HaruPortrait({ onPoke }: HaruPortraitProps) {
  const [isPoked, setIsPoked] = useState(false);

  function handleClick() {
    onPoke();
    setIsPoked(true);
    window.setTimeout(() => setIsPoked(false), 500);
  }

  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      className="relative h-full"
    >
      <motion.button
        type="button"
        onClick={handleClick}
        whileTap={{ scale: 0.92 }}
        animate={
          isPoked
            ? { scale: [1, 1.15, 0.95, 1.05, 1], rotate: [0, -4, 4, -2, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
        className="relative flex h-full w-[min(90vw,40rem)] items-start justify-center overflow-hidden rounded-[3rem] sm:w-[min(60dvh,70vw)]"
      >
        <img
          src={haruMain}
          alt="陽"
          className="h-[150%] w-full object-cover object-top drop-shadow-sm top-0"
        />

        <AnimatePresence>
          {isPoked && (
            <motion.span
              key="poke-heart"
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: 1, y: -48, scale: 1.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="pointer-events-none absolute top-6 text-3xl"
            >
              💕
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
