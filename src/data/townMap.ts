import raw from "./townMap.json";
import type { TownMap } from "../types/navigation";
import townIllustration from "../assets/bg/map_bg.png";

/**
 * 模組 B「城市邂逅」共用的站前商圈大地圖。
 * 所有關卡共用同一張地圖，僅玩家出發點與任務目標建築不同。
 */
export const townMap: TownMap = {
  ...(raw as unknown as TownMap),
  backgroundImage: townIllustration,
};
