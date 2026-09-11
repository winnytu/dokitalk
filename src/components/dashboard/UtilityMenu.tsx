import { motion } from "framer-motion";
import type { UtilityEntryPoint, UtilityModuleId } from "../../types/dashboard";

interface UtilityMenuProps {
  entryPoints: UtilityEntryPoint[];
  onSelect: (id: UtilityModuleId) => void;
}

/**
 * 大廳頂部的工具型入口（每日任務／回憶錄），與下方三大常設關卡入口
 * 分開呈現，因為這兩者是單一畫面的工具，沒有「關卡選單」的概念。
 */
export function UtilityMenu({ entryPoints, onSelect }: UtilityMenuProps) {
  return (
    <div className="hidden min-w-0 flex-1 flex-nowrap items-center justify-items-start gap-2 sm:flex">
      {entryPoints.map((entry, i) => (
        <motion.button
          key={entry.id}
          type="button"
          onClick={() => onSelect(entry.id)}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
            delay: i * 0.08,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          className="flex min-w-0 shrink items-center gap-1 rounded-full bg-white/60 px-2 py-1.5 text-[11px] font-bold text-text-main shadow-peach backdrop-blur-md sm:gap-1.5 sm:px-3.5 sm:text-xs"
        >
          <span className="shrink-0 text-sm">{entry.emoji}</span>
          <span className="truncate">{entry.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
