import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/cn";

const paddingClasses = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
} as const;

const roundedClasses = {
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
} as const;

export interface GlassCardProps extends HTMLMotionProps<"div"> {
  /** 內距，預設 md */
  padding?: keyof typeof paddingClasses;
  /** 圓角尺寸，預設 3xl（大量圓角是本 App 的核心視覺語言） */
  rounded?: keyof typeof roundedClasses;
  /** 是否顯示半透明白色邊框，增加毛玻璃的「玻璃邊緣」質感 */
  bordered?: boolean;
}

/**
 * 全站共用的毛玻璃卡片容器：半透明底色 + backdrop-blur + 粉色彌散陰影。
 * 用於手帳本、通話字幕框、關卡結算面板等所有卡片式 UI。
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      padding = "md",
      rounded = "3xl",
      bordered = true,
      children,
      ...motionProps
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={cn(
          "bg-white/60 shadow-peach backdrop-blur-md",
          bordered && "border border-white/60",
          roundedClasses[rounded],
          paddingClasses[padding],
          className,
        )}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  },
);

GlassCard.displayName = "GlassCard";
