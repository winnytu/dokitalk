import raw from "./plannerStages.json";
import type { PlannerStage } from "../types/planner";

/**
 * 模組 A「羈絆手札」的關卡資料，由靜態 JSON 驅動。
 * 若要新增關卡，只需編輯 plannerStages.json，不需要改動任何邏輯程式碼。
 */
export const plannerStages = raw as PlannerStage[];
