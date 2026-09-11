import raw from "./callStages.json";
import type { CallStage } from "../types/call";

/**
 * 模組 C「沉浸式雙向通話」的關卡資料，由靜態 JSON 驅動。
 */
export const callStages = raw as CallStage[];
