import raw from "./entryPoints.json";
import type { EntryPoint } from "../types/dashboard";

/** 大廳底部三大常設關卡入口，由靜態 JSON 驅動。 */
export const entryPoints = raw as EntryPoint[];
