import raw from "./collectibles.json";
import type { Collectible } from "../types/memories";

/**
 * 珍藏卡冊的收藏品清單，由 collectibles.json 驅動。
 * 新增收藏品只需在 JSON 追加一筆，並在 CollectionBinder 的 THUMBNAIL_MAP
 * 補上對應的縮圖資源即可。
 */
export const collectibles = raw as Collectible[];
