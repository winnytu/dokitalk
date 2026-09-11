import raw from "./navigationStages.json";
import type { NavigationStage } from "../types/navigation";

/**
 * 模組 B「城市邂逅」的關卡資料，由靜態 JSON 驅動。
 */
export const navigationStages = raw as unknown as NavigationStage[];
