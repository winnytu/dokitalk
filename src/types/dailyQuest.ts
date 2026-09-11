/** 每日任務的類型，決定進度是被什麼行為觸發（登入／完成關卡／複習單字...） */
export type DailyTaskType = "login" | "clearStage" | "reviewVocabulary";

/** 任務靜態設定（來自 dailyTasks.json）。日後新增任務只需編輯 JSON，不需改動邏輯程式碼。 */
export interface DailyTaskDefinition {
  id: string;
  type: DailyTaskType;
  title: string;
  description: string;
  /** 達成目標次數，例如「複習 3 個單字」= 3 */
  goal: number;
  /** 完成後獲得的金幣獎勵 */
  rewardCoins: number;
  /** 完成後獲得的活躍度獎勵（會累加進 0～100 的活躍度進度條） */
  rewardActivity: number;
  /**
   * 「前往」按鈕要導向的模組（可選）。
   * 例如 clearStage 任務會導向 "navigation"，reviewVocabulary 任務會導向 "memories"。
   * 不需要導向其他畫面的任務（如每日登入）可省略此欄位。
   */
  target?: "navigation" | "memories";
}

/** 單一任務的即時進度，存放在 useDailyQuestStore（會隨每日重置而歸零）。 */
export interface DailyTaskProgress {
  id: string;
  progress: number;
  isClaimed: boolean;
}

/** 任務卡片實際渲染時使用的合併資料（靜態定義 + 玩家的即時進度）。 */
export interface DailyTaskView extends DailyTaskDefinition, DailyTaskProgress {}
