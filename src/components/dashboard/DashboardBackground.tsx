import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import mainBg from "../../assets/bg/main_bg.png";
import type { TimeOfDay } from "../../hooks/useTimeOfDay";

interface DashboardBackgroundProps {
  timeOfDay: TimeOfDay;
}

/**
 * 大廳全螢幕背景，依現實時間切換「白天」／「夜晚」氛圍。
 * 底層使用真正的場景插畫（main_bg.png），上層疊加裝飾性 emoji／光暈
 * 表現白天／夜晚的差異，背景圖本身不做色調濾鏡處理。
 * 容器本身鋪一層對應時段的底色，避免大圖尚未解碼完成前
 * 露出頁面預設的白色底色（閃白）。
 */
export function DashboardBackground({ timeOfDay }: DashboardBackgroundProps) {
  const isDay = timeOfDay === "day";

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden",
        isDay ? "bg-primary-light" : "bg-night",
      )}
    >
      <img
        src={mainBg}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {isDay ? (
        <>
          {/* 咖啡廳窗邊柔光 */}
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-success/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        </>
      ) : (
        <>
          {/* 夜晚房間星光與月色 */}
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/70"
              style={{ top: `${(i * 37) % 90}%`, left: `${(i * 53) % 95}%` }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 2 + (i % 4),
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i % 5) * 0.3,
              }}
            />
          ))}
          <div className="absolute -bottom-10 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        </>
      )}
    </div>
  );
}
