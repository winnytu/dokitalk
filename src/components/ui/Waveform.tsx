import { motion } from "framer-motion";

interface WaveformProps {
  /** 是否處於活躍狀態（例如正在說話／聆聽），會加快跳動速度與幅度 */
  active?: boolean;
}

/**
 * 模擬語音播放中的音波動畫。用於通話介面與城市邂逅的聽力線索卡。
 */
export function Waveform({ active = true }: WaveformProps) {
  const bars = 9;

  return (
    <div className="flex h-5 items-center justify-center gap-1.5">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-white/85"
          animate={{ height: active ? [6, 6 + ((i * 7) % 20), 8] : 6}}
          transition={{
            duration: active ? 0.5 + (i % 3) * 0.12 : 0.3,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
