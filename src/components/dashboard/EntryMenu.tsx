import { motion } from "framer-motion";
import callIcon from "../../assets/call_icon.png";
import mapIcon from "../../assets/map_icon.png";
import noteIcon from "../../assets/note_icon.png";
import type { EntryPoint, ModuleId } from "../../types/dashboard";

interface EntryMenuProps {
  entryPoints: EntryPoint[];
  onSelect: (module: ModuleId) => void;
}

const MODULE_ICONS: Record<ModuleId, string> = {
  planner: noteIcon,
  navigation: mapIcon,
  call: callIcon,
};

/**
 * 三大常設關卡入口：手機版置底做成橫向 bottom bar，
 * sm 以上維持大廳右側的毛玻璃圓角卡片縱向排列；
 * 帶依序進場動畫與 hover/tap 的 spring 回饋。
 */
export function EntryMenu({ entryPoints, onSelect }: EntryMenuProps) {
  return (
    <div className="no-scrollbar fixed inset-x-0 bottom-0 z-20 flex w-full items-center justify-center gap-[clamp(0.5rem,4vw,1.5rem)] overflow-x-auto bg-white/40 p-[clamp(0.5rem,2vh,1rem)] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:static sm:inset-auto sm:z-10 sm:h-full sm:min-h-0 sm:w-[clamp(4.5rem,20vw,7rem)] sm:flex-col sm:justify-center sm:gap-[clamp(0.375rem,1.5vh,1rem)] sm:overflow-y-auto sm:bg-transparent sm:p-[clamp(0.375rem,1.5vh,1rem)] sm:backdrop-blur-0">
      {entryPoints.map((entry, i) => (
        <motion.button
          key={entry.id}
          type="button"
          onClick={() => onSelect(entry.id)}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 15,
            delay: i * 0.08,
          }}
          whileHover={{ scale: 1.06, y: -4 }}
          whileTap={{ scale: 0.94 }}
          className="flex w-20 shrink-0 flex-col items-center gap-[clamp(0.25rem,0.8vh,0.375rem)] p-2 shadow-peach sm:w-full sm:p-[clamp(0.375rem,1.5vh,1rem)]"
        >
          <span className="aspect-square w-full max-w-[clamp(4rem,10vh,6rem)] overflow-hidden rounded-2xl shadow-peach">
            <img
              src={MODULE_ICONS[entry.id]}
              alt={entry.label}
              className="h-full w-full object-contain object-top"
            />
          </span>
          <span className="line-clamp-1 text-[12px] leading-tight text-text-main backdrop-blur-md px-2 py-1 rounded-lg shadow-peach bg-white/50">
            {entry.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
