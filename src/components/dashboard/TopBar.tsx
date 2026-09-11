import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import meHead from "../../assets/character/me_head.png";
import { UtilityMenu } from "./UtilityMenu";
import type { UtilityEntryPoint, UtilityModuleId } from "../../types/dashboard";

interface TopBarProps {
  heartPoints: number;
  intimacyLevel: number;
  utilityEntryPoints: UtilityEntryPoint[];
  onOpenUtility: (utility: UtilityModuleId) => void;
  onOpenSettings: () => void;
}

/**
 * 大廳頂部狀態列：左上角玩家頭像＋好感度等級、中間工具型入口（每日任務／回憶錄）、
 * 右上角 HeartPoints。統一使用毛玻璃卡片樣式，白天夜晚背景切換時仍保有清楚的可讀性。
 */
export function TopBar({
  heartPoints,
  intimacyLevel,
  utilityEntryPoints,
  onOpenUtility,
  onOpenSettings,
}: TopBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleOpenUtility(utility: UtilityModuleId) {
    setIsMobileMenuOpen(false);
    onOpenUtility(utility);
  }

  function handleOpenSettings() {
    setIsMobileMenuOpen(false);
    onOpenSettings();
  }

  return (
    <div className="z-10 flex w-full flex-nowrap items-center justify-between gap-1.5 p-3 sm:gap-3 sm:p-6">
      <div className="relative flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          aria-label="開啟功能選單"
          aria-expanded={isMobileMenuOpen}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/70 py-1 pl-1 pr-2.5 shadow-peach backdrop-blur-md sm:pointer-events-none sm:py-1.5 sm:pl-1.5 sm:pr-4"
        >
          <span className="relative h-7 w-7 shrink-0 sm:h-9 sm:w-9">
            <span className="block h-full w-full overflow-hidden rounded-full bg-primary-light">
              <img src={meHead} alt="前輩" className="h-full w-full object-cover" />
            </span>
          </span>
          <span className="text-left leading-tight">
            <p className="whitespace-nowrap text-xs font-bold text-text-main sm:text-sm">Lv.{intimacyLevel}</p>
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-full sm:gap-1.5">
            <span className="text-sm sm:text-lg">💗</span>
            <span className="whitespace-nowrap text-xs font-bold text-text-main sm:text-sm">{heartPoints}</span>
          </span>
          <span
            aria-hidden="true"
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-white bg-primary text-[9px] font-bold leading-none text-white shadow-sm transition-transform sm:hidden ${
              isMobileMenuOpen ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-40 overflow-hidden rounded-2xl bg-white/90 p-1.5 shadow-peach backdrop-blur-md sm:hidden"
            >
              {utilityEntryPoints.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleOpenUtility(entry.id)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-text-main active:bg-primary-light/60"
                >
                  <span>{entry.emoji}</span>
                  <span>{entry.label}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={handleOpenSettings}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold text-text-main active:bg-primary-light/60"
              >
                <span>⚙️</span>
                <span>設定</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>

      <UtilityMenu entryPoints={utilityEntryPoints} onSelect={onOpenUtility} />
              <button
          type="button"
          onClick={onOpenSettings}
          aria-label="設定"
          className="hidden h-10 shrink-0 items-center justify-center rounded-full bg-white/70 text-base shadow-peach backdrop-blur-md sm:flex px-3 font-bold text-text-main sm:text-sm"
        >
          ⚙️ 設定
        </button>
    </div>
  );
}
