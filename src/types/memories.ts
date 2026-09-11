import type { ModuleId } from "./dashboard";

/** 單字卡 */
export interface VocabularyItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  /** 語音檔路徑，供播放按鈕使用；目前僅預留 UI，檔案不存在時播放會靜默失敗 */
  audioUrl?: string;
}

/** 文法筆記 */
export interface GrammarNote {
  id: string;
  pattern: string;
  explanation: string;
  example: string;
}

/**
 * 某個關卡解鎖的學習筆記（單字＋文法）。
 * 以 module + stageId 對應到 planner／navigation／call 既有的關卡資料。
 */
export interface StudyNote {
  module: ModuleId;
  stageId: string;
  vocabulary: VocabularyItem[];
  grammar: GrammarNote[];
}

export type CollectibleType = "image" | "video";

/**
 * 珍藏卡冊裡的單一收藏品（劇情 CG／專屬影片）。
 * `thumbnail` 為靜態資源查表用的 key（見 CollectionBinder 的 THUMBNAIL_MAP），
 * 而非直接的圖片路徑，方便日後新增收藏品時仍能走 JSON 靜態資料驅動。
 */
export interface Collectible {
  id: string;
  type: CollectibleType;
  title: string;
  thumbnail: string;
  /** 解鎖條件：玩家通關指定模組的指定關卡即解鎖 */
  unlockCondition: { module: ModuleId; stageId: string };
}
