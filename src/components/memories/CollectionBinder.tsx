import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { cn } from "../../lib/cn";
import { collectibles } from "../../data/collectibles";
import { THUMBNAIL_MAP, VIDEO_MAP } from "../../data/collectibleAssets";
import { useMemoriesStore } from "../../store/useMemoriesStore";
import { CollectibleModal } from "./CollectibleModal";
import type { Collectible } from "../../types/memories";

/**
 * 回憶錄 Tab 2「珍藏卡冊」：九宮格呈現玩家通關獲得的劇情 CG／專屬影片。
 * 已解鎖項目顯示完整縮圖並可點擊放大檢視；未解鎖項目以上鎖 Icon 呈現。
 */
export function CollectionBinder() {
  const unlockedCollectibles = useMemoriesStore((s) => s.unlockedCollectibles);
  const [selected, setSelected] = useState<Collectible | null>(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {collectibles.map((item) => {
          const isUnlocked = unlockedCollectibles.includes(item.id);
          const thumbnailSrc = THUMBNAIL_MAP[item.thumbnail];

          return (
            <button
              key={item.id}
              type="button"
              disabled={!isUnlocked}
              onClick={() => setSelected(item)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-2xl shadow-peach",
                !isUnlocked && "cursor-not-allowed bg-night/20",
              )}
            >
              {isUnlocked ? (
                <>
                  <img
                    src={thumbnailSrc}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  {item.type === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-2xl">
                      ▶️
                    </span>
                  )}
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-night/10 text-text-muted">
                  <span className="text-2xl">🔒</span>
                  <span className="text-[10px] font-bold">未解鎖</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <CollectibleModal
            item={selected}
            thumbnailSrc={THUMBNAIL_MAP[selected.thumbnail]}
            videoSrc={VIDEO_MAP[selected.thumbnail]}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
