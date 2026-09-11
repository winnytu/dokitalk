/** 移除空白與標點符號，方便寬鬆比對辨識結果 */
export function normalizeJapanese(text: string): string {
  return text.replace(/[\s、。！？!?.,～〜]/g, "").trim();
}

/** 計算兩字串的編輯距離（Levenshtein distance） */
function levenshteinDistance(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/** 兩字串的相似度，0～1，1 代表完全相同 */
function similarityRatio(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

const MATCH_THRESHOLD = 0.5;

/**
 * 判斷語音辨識出的文字是否與目標台詞相符。
 * 完全相同或互相包含直接視為正確；否則以編輯距離換算相似度，
 * 超過 50% 也算正確，以容忍 Web Speech API 常見的辨識誤差。
 */
export function isSpeechMatch(transcript: string, target: string): boolean {
  const normalizedTranscript = normalizeJapanese(transcript);
  const normalizedTarget = normalizeJapanese(target);
  if (!normalizedTranscript || !normalizedTarget) return false;
  if (
    normalizedTranscript === normalizedTarget ||
    normalizedTranscript.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedTranscript)
  ) {
    return true;
  }
  return similarityRatio(normalizedTranscript, normalizedTarget) >= MATCH_THRESHOLD;
}

export interface TranscriptDiffChar {
  char: string;
  correct: boolean;
}

/**
 * 仿 Duolingo 的逐字比對：以最長共同子序列（LCS）找出辨識文字中
 * 有依序對上目標台詞的字元，回傳每個字元是否「答對」，供 UI 上色標示。
 */
export function diffTranscript(transcript: string, target: string): TranscriptDiffChar[] {
  const a = normalizeJapanese(transcript);
  const b = normalizeJapanese(target);
  const m = a.length;
  const n = b.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const matched = new Array(m).fill(false);
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      matched[i - 1] = true;
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i -= 1;
    } else {
      j -= 1;
    }
  }

  return a.split("").map((char, idx) => ({ char, correct: matched[idx] }));
}

/**
 * 正確度：辨識文字中依序對上目標台詞的字元數 ÷ 目標台詞字數，0～1。
 * 用來判斷是否讓玩家送出（低於 50% 不給送出）。
 */
export function getMatchRatio(transcript: string, target: string): number {
  const normalizedTarget = normalizeJapanese(target);
  if (!normalizedTarget) return 0;
  const matchedCount = diffTranscript(transcript, target).filter((c) => c.correct).length;
  return matchedCount / normalizedTarget.length;
}
