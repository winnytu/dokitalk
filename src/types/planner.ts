export type DayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type StickerType = "action" | "mood";

export interface PlannerSticker {
  id: string;
  label: string;
  type: StickerType;
}

export interface PlannerDialogue {
  id: string;
  speaker: "haru" | "player";
  text: string;
  translation: string;
  audioUrl: string;
}

export interface PlannerStage {
  id: string;
  title: string;
  reward: number;
  dialogues: PlannerDialogue[];
  stickers: PlannerSticker[];
  /** 每天應該放入的貼紙 ID 陣列；空陣列代表該天不應放任何貼紙 */
  expectedAnswers: Record<DayId, string[]>;
}
