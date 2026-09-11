import haruHead from "../assets/character/haru_head.png";
import haruMain from "../assets/character/haru_main.png";
import haruQ from "../assets/character/haru_q.png";
import call1 from "../assets/cg/call_1.png";
import nav1 from "../assets/cg/nav_1.png";
import nav1Video from "../assets/cg/nav_1.mp4";
import nav2 from "../assets/cg/nav_2.png";
import plan1 from "../assets/cg/plan_1.png";
import plan2 from "../assets/cg/plan_2.png";

/**
 * collectibles.json 的 `thumbnail` 欄位是查表用的 key，這裡對應到實際打包後的縮圖／CG 圖片資源。
 * CollectionBinder（珍藏卡冊）與各關卡的通關解鎖畫面共用同一份對照表。
 */
export const THUMBNAIL_MAP: Record<string, string> = {
  haruMain,
  haruQ,
  haruHead,
  plan1,
  plan2,
  nav1,
  nav2,
  call1,
};

/**
 * type 為 "video" 的收藏品：以 `thumbnail` 欄位查表對應實際影片素材。
 * 尚未提供影片檔的項目不會出現在這張表裡，UI 端需自行處理缺片時的預設顯示。
 */
export const VIDEO_MAP: Record<string, string> = {
  nav1: nav1Video,
};
