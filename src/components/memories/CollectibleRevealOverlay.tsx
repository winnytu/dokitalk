import { useState } from "react";
import { motion } from "framer-motion";
import type { Collectible } from "../../types/memories";

interface CollectibleRevealOverlayProps {
  collectible: Collectible;
  imageSrc: string;
  /** 有對應影片素材時，會先全螢幕播放這段影片，播完（或按下略過）才進入 CG 揭曉畫面 */
  videoSrc?: string;
  onClose: () => void;
}

/**
 * 關卡「首次」通關時的收藏品解鎖播放流程：
 * 若收藏品附有影片，先全螢幕播放該段劇情影片；播放結束或使用者按下略過後，
 * 再顯示「獲得 CG 圖」的翻牌揭曉卡片。沒有影片素材的收藏品則直接進入揭曉畫面。
 */
export function CollectibleRevealOverlay({
  collectible,
  imageSrc,
  videoSrc,
  onClose,
}: CollectibleRevealOverlayProps) {
  const [phase, setPhase] = useState<"video" | "reveal">(videoSrc ? "video" : "reveal");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 p-6 backdrop-blur-sm"
    >
      {phase === "video" && videoSrc ? (
        <div className="relative w-full max-w-md">
          <video
            src={videoSrc}
            autoPlay
            playsInline
            controls
            onEnded={() => setPhase("reveal")}
            className="w-full rounded-3xl shadow-peach-lg"
          />
          <button
            type="button"
            onClick={() => setPhase("reveal")}
            className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-bold text-text-main shadow-peach"
          >
            略過 ▶
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-peach-lg"
        >
          <div className="bg-gradient-to-b from-primary to-primary-light px-4 py-2 text-center">
            <p className="font-jp text-sm font-black text-white">🎉 獲得 CG 圖！</p>
          </div>
          <img src={imageSrc} alt={collectible.title} className="max-h-[60dvh] w-full object-cover" />
          <div className="p-4 text-center">
            <p className="font-jp text-base font-bold text-text-main">{collectible.title}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full rounded-full bg-primary py-2 text-sm font-bold text-white shadow-peach"
            >
              收下回憶
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
