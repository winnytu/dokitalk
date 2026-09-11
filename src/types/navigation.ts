export interface GridPosition {
  x: number;
  y: number;
}

/**
 * Tilemap 網格值定義：
 * 0 = Walkable（可通行：道路、草地）
 * 1 = Obstacle（障礙物：樹、牆、水池）
 * 2 = Trigger（事件觸發點：建築物入口）
 */
export type TileValue = 0 | 1 | 2;

/** 觸發點（建築入口）的元資料 */
export interface TriggerInfo {
  buildingId: string;
  emoji: string;
  label: string;
  wrongMessage?: string;
}

/** 模組 B 共用的站前商圈大地圖 */
export interface TownMap {
  /** 二維陣列地圖：[row][col]，值為 0/1/2 */
  mapGrid: TileValue[][];
  /** 每格像素大小 */
  tileSize: number;
  /** 鏡頭可視範圍（格數），用於玩家移動時的視窗跟隨捲動 */
  viewportCols: number;
  viewportRows: number;
  /** 觸發點座標 → 建築資訊映射（key 格式："x,y"） */
  triggers: Record<string, TriggerInfo>;
  /** 地圖背景插畫圖片網址（由 townMap.ts 注入實際 import 路徑） */
  backgroundImage?: string;
}

export interface IndoorOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface MapTask {
  type: "map";
  id: string;
  targetBuildingId: string;
  hint: string;
  hintTranslation: string;
}

export interface IndoorTask {
  type: "indoor";
  id: string;
  sceneEmoji: string;
  sceneLabel: string;
  haruLine?: string;
  haruTranslation?: string;
  question: string;
  options: IndoorOption[];
}

export type NavigationTask = MapTask | IndoorTask;

export interface NavigationStage {
  id: string;
  title: string;
  reward: number;
  /** 玩家在共用大地圖（townMap）上的出發座標 */
  playerStart: GridPosition;
  tasks: NavigationTask[];
  successLine: string;
  successTranslation: string;
}
