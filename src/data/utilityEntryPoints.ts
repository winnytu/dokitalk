import raw from "./utilityEntryPoints.json";
import type { UtilityEntryPoint } from "../types/dashboard";

/** 大廳頂部的每日任務／回憶錄入口，由靜態 JSON 驅動。 */
export const utilityEntryPoints = raw as UtilityEntryPoint[];
