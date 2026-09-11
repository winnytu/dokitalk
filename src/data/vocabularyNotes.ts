import raw from "./vocabularyNotes.json";
import type { StudyNote } from "../types/memories";

/**
 * 各關卡解鎖的單字卡／文法筆記，由 vocabularyNotes.json 驅動。
 * 新增關卡筆記時只需在 JSON 追加一筆 `{ module, stageId, vocabulary, grammar }`。
 */
export const vocabularyNotes = raw as StudyNote[];
