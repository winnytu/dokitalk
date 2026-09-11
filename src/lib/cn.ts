import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合併 className 並自動處理 Tailwind 樣式衝突（例如後傳入的 padding 會覆蓋預設值）。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
