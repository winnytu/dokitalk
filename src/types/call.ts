export interface CallClozeLine {
  id: string;
  speaker: "haru" | "player";
  before: string;
  after: string;
  answer: string;
  options: string[];
  translation: string;
}

export interface CallSpeakLine {
  id: string;
  /** 畫面上顯示的中文提示（告訴玩家要說什麼語意） */
  prompt: string;
  text: string;
  romaji: string;
}

export interface CallClozePhase {
  type: "cloze";
  lines: CallClozeLine[];
}

export interface CallSpeakPhase {
  type: "speak";
  line: CallSpeakLine;
}

export type CallPhase = CallClozePhase | CallSpeakPhase;

export interface CallStage {
  id: string;
  title: string;
  callerName: string;
  reward: number;
  phases: CallPhase[];
  successLine: string;
  successTranslation: string;
}
