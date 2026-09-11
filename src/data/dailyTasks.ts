import raw from "./dailyTasks.json";
import type { DailyTaskDefinition } from "../types/dailyQuest";

/**
 * 每日任務的靜態設定，由 dailyTasks.json 驅動。
 * 日後新增／調整任務只需編輯 JSON，不需要改動 useDailyQuestStore 的邏輯。
 */
export const dailyTasks = raw as DailyTaskDefinition[];
