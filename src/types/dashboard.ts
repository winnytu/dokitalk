/** 戳一戳陽時隨機浮現的日常問候台詞 */
export interface Greeting {
  id: string;
  text: string;
  romaji: string;
}

export type ModuleId = "planner" | "navigation" | "call";

/** 大廳底部的常設關卡入口 */
export interface EntryPoint {
  id: ModuleId;
  label: string;
  emoji: string;
  description: string;
}

/** 每日任務／回憶錄這類「工具型」模組的識別碼，不走關卡選單流程 */
export type UtilityModuleId = "dailyQuest" | "memories";

/** 大廳頂部的工具型入口（每日任務／回憶錄） */
export interface UtilityEntryPoint {
  id: UtilityModuleId;
  label: string;
  emoji: string;
  description: string;
}

/**
 * 關卡選單（Level Selection Drawer）用的最小關卡資料。
 * `PlannerStage` / `NavigationStage` / `CallStage` 皆結構相容，可直接傳入。
 */
export interface StageSummary {
  id: string;
  title: string;
  reward: number;
}
