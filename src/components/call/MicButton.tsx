import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

interface MicButtonProps {
  isListening: boolean;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
}

/**
 * 按住說話的麥克風按鈕。使用 Pointer Events 統一處理滑鼠與觸控，
 * 按住開始辨識、放開（或手指滑出按鈕）結束辨識。
 */
export function MicButton({ isListening, disabled, onStart, onStop }: MicButtonProps) {
  // Android 觸控比 iOS 更容易在長按時判定手指「滑出」按鈕範圍，
  // 用 setPointerCapture 讓按鈕在整段長按期間持續收到同一根手指的事件，避免提早觸發放開。
  const capturedPointerId = useRef<number | null>(null);

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onPointerDown={(e) => {
        if (disabled) return;
        capturedPointerId.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        onStart();
      }}
      onPointerUp={(e) => {
        if (isListening) onStop();
        if (capturedPointerId.current === e.pointerId) {
          e.currentTarget.releasePointerCapture(e.pointerId);
          capturedPointerId.current = null;
        }
      }}
      onPointerCancel={(e) => {
        if (isListening) onStop();
        if (capturedPointerId.current === e.pointerId) {
          e.currentTarget.releasePointerCapture(e.pointerId);
          capturedPointerId.current = null;
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      animate={isListening ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={
        isListening
          ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" }
          : { type: "spring", stiffness: 400, damping: 15 }
      }
      style={{ WebkitTouchCallout: "none" }}
      className={cn(
        "flex h-16 w-16 touch-none select-none items-center justify-center rounded-full text-2xl shadow-peach-lg transition-colors",
        isListening ? "bg-error text-white" : "bg-white text-primary",
        disabled && "opacity-50",
      )}
    >
      🎤
    </motion.button>
  );
}
