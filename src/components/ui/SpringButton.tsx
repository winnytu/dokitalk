import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "success" | "error" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-white shadow-peach",
  secondary: "bg-primary-light text-text-main shadow-peach",
  success: "bg-success text-white shadow-peach",
  error: "bg-error text-white shadow-peach",
  ghost: "border border-primary-light bg-white/50 text-text-main backdrop-blur-md",
};

const spinnerClasses: Record<Variant, string> = {
  primary: "border-white/40 border-t-white",
  success: "border-white/40 border-t-white",
  error: "border-white/40 border-t-white",
  secondary: "border-text-main/30 border-t-text-main",
  ghost: "border-text-main/30 border-t-text-main",
};

const sizeClasses: Record<Size, string> = {
  sm: "gap-1.5 rounded-xl px-4 py-2 text-sm",
  md: "gap-2 rounded-2xl px-6 py-3 text-base",
  lg: "gap-2.5 rounded-2xl px-8 py-4 text-lg",
};

export interface SpringButtonProps extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
  /** 是否撐滿容器寬度 */
  fullWidth?: boolean;
  /** 顯示載入中狀態，會停用按鈕並以轉圈圖示取代內容 */
  isLoading?: boolean;
}

/**
 * 全站共用的 Q 彈按鈕：hover 微放大、按下微縮小，皆採 spring 物理動畫。
 * 用於所有可點擊的主要互動（拖曳提示除外，拖曳互動見 dnd-kit 相關元件）。
 */
export const SpringButton = forwardRef<HTMLButtonElement, SpringButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : { scale: 0.92 }}
        whileHover={isDisabled ? undefined : { scale: 1.04 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={cn(
          "inline-flex select-none items-center justify-center font-bold",
          "disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <motion.span
            aria-hidden
            className={cn(
              "h-4 w-4 rounded-full border-2",
              spinnerClasses[variant],
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          children
        )}
      </motion.button>
    );
  },
);

SpringButton.displayName = "SpringButton";
