import { motion } from "framer-motion";
import { unlockAudio } from "../../lib/audio";
import { Waveform } from "./Waveform";
import haruHead from "../../assets/character/haru_head.png";

interface IncomingCallGateProps {
  callerName: string;
  onAnswer: () => void;
}

/**
 * 進入地圖／來電關卡前的「接聽電話」畫面：強制玩家先按下接聽鈕才會開始關卡。
 * 這個按下動作同時是整個關卡第一個真正的使用者操作，藉此解除瀏覽器的自動播放限制，
 * 讓進場的第一句語音提示也能順利播放，不必等玩家先操作過一次才聽得到。
 */
export function IncomingCallGate({ callerName, onAnswer }: IncomingCallGateProps) {
  function handleAnswer() {
    unlockAudio();
    onAnswer();
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-6 rounded-3xl bg-gradient-to-b from-primary/95 to-primary-light/90 p-6 text-center text-white backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white/20"
      >
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-white/60"
          animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
        <img src={haruHead} alt={callerName} className="h-full w-full object-cover" />
      </motion.div>

      <div className="space-y-1">
        <p className="text-lg font-bold">{callerName} 的來電</p>
      </div>

      <Waveform active />

      <motion.button
        type="button"
        onClick={handleAnswer}
        whileTap={{ scale: 0.92 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-3xl shadow-peach-lg"
        aria-label="接聽"
      >
        📞
      </motion.button>
    </div>
  );
}
