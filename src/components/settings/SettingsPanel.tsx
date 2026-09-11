import { motion } from "framer-motion";
import { useSettingsStore } from "../../store/useSettingsStore";

interface SettingsPanelProps {
  onClose: () => void;
}

/**
 * 全域設定面板：可調整語音（角色台詞／單字發音）與背景音樂的音量。
 * 兩者皆即時生效並透過 zustand persist 記住玩家的偏好。
 */
export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const voiceVolume = useSettingsStore((s) => s.voiceVolume);
  const bgmVolume = useSettingsStore((s) => s.bgmVolume);
  const setVoiceVolume = useSettingsStore((s) => s.setVoiceVolume);
  const setBgmVolume = useSettingsStore((s) => s.setBgmVolume);

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
        className="relative w-full max-w-xs rounded-3xl bg-white p-5 shadow-peach-lg"
      >
        <p className="mb-4 text-center text-sm font-bold text-text-main">⚙️ 音效設定</p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between text-xs font-bold text-text-muted">
              <span>🗣️ 語音音量</span>
              <span>{Math.round(voiceVolume * 100)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={voiceVolume}
              onChange={(e) => setVoiceVolume(Number(e.target.value))}
              className="accent-primary"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between text-xs font-bold text-text-muted">
              <span>🎵 背景音樂音量</span>
              <span>{Math.round(bgmVolume * 100)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={bgmVolume}
              onChange={(e) => setBgmVolume(Number(e.target.value))}
              className="accent-primary"
            />
          </label>
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
