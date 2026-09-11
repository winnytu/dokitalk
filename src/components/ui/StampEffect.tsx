import { motion } from "framer-motion";

interface StampEffectProps {
  title?: string;
  subtitle?: string;
}

/**
 * 全對通關時的慶祝特效，疊加在關卡卡片上方。三大模組共用，
 * 可傳入不同文案（手帳蓋章／導航到站／通話接通）。
 */
export function StampEffect({
  title = "約束完了！",
  subtitle = "HeartPoints Get！",
}: StampEffectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 2.4, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: -12 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ type: "spring", stiffness: 300, damping: 14 }}
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/10"
    >
      <div className="rounded-3xl border-4 border-success bg-white/70 px-8 py-4 text-center shadow-peach-lg backdrop-blur-sm">
        <p className="font-jp text-3xl font-black leading-none text-success">
          {title}
        </p>
        <p className="mt-1 text-xs font-bold text-text-muted">{subtitle}</p>
      </div>
    </motion.div>
  );
}
