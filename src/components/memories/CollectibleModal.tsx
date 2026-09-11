import { motion } from "framer-motion";
import type { Collectible } from "../../types/memories";

interface CollectibleModalProps {
  item: Collectible;
  thumbnailSrc: string;
  /** 有對應影片素材時直接播放，沒有則以縮圖代替並顯示提示文字 */
  videoSrc?: string;
  onClose: () => void;
}

/**
 * 珍藏卡冊的放大檢視（Modal / Lightbox）。
 * 有影片素材則直接播放影片；type 為 "video" 但尚未提供影片時以縮圖代替。
 */
export function CollectibleModal({ item, thumbnailSrc, videoSrc, onClose }: CollectibleModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/70 p-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 12 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md overflow-hidden rounded-3xl bg-white shadow-peach-lg"
      >
        {videoSrc ? (
          <video
            src={videoSrc}
            autoPlay
            playsInline
            controls
            className="max-h-[70dvh] w-full object-cover"
          />
        ) : (
          <img src={thumbnailSrc} alt={item.title} className="max-h-[70dvh] w-full object-cover" />
        )}

        <div className="p-4">
          <p className="font-jp text-base font-bold text-text-main">{item.title}</p>
          {item.type === "video" && !videoSrc && (
            <p className="mt-1 text-xs text-text-muted">🎬 影片準備中，敬請期待</p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="關閉"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-sm font-bold text-text-main shadow-peach"
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
}
