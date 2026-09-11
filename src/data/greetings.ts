import raw from "./greetings.json";
import type { Greeting } from "../types/dashboard";

/** 大廳「戳一戳」互動用的日常問候台詞，由靜態 JSON 驅動。 */
export const greetings = raw as Greeting[];
