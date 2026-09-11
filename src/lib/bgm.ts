import { getAudioContext, loadAudioBuffer, queueAudioRetry, resolveAudioUrl } from "./audio";
import { useSettingsStore } from "../store/useSettingsStore";

const BGM_URLS = {
  planner: "/bgm/planner.mp3",
  navigation: "/bgm/navigation.mp3",
  call: "/bgm/call.mp3",
  ambient: "/bgm/ambient.mp3",
} as const;

export type BgmKey = keyof typeof BGM_URLS;

let bgmGain: GainNode | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentKey: BgmKey | null = null;
let currentBuffer: AudioBuffer | null = null;
let playToken = 0;
let playbackStartedAt = 0; // 目前這段播放開始時的 context.currentTime
let pausedOffset = 0; // 暫停時記錄的播放進度（秒），resumeBgm 用來接續播放
let isPaused = false;
let fallbackAudio: HTMLAudioElement | null = null;

function ensureBgmGain(context: AudioContext) {
  if (!bgmGain) {
    bgmGain = context.createGain();
    bgmGain.gain.value = useSettingsStore.getState().bgmVolume;
    bgmGain.connect(context.destination);
  }
  return bgmGain;
}

// 設定面板調整音量滑桿時，即時套用到正在播放的 BGM，不用等下一首才生效
useSettingsStore.subscribe((state) => {
  if (bgmGain) bgmGain.gain.value = state.bgmVolume;
  if (fallbackAudio) fallbackAudio.volume = state.bgmVolume;
});

function stopCurrentSource() {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      // 尚未真正開始播放就被打斷時 stop() 會丟例外，忽略即可
    }
    currentSource.disconnect();
    currentSource = null;
  }
  if (fallbackAudio) {
    fallbackAudio.pause();
    fallbackAudio = null;
  }
}

function startBufferSource(context: AudioContext, gain: GainNode, buffer: AudioBuffer, offset: number) {
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(gain);
  currentSource = source;
  playbackStartedAt = context.currentTime;
  pausedOffset = offset;
  isPaused = false;

  const start = () => {
    try {
      source.start(0, offset % buffer.duration);
    } catch {
      // 忽略重複啟動造成的例外
    }
  };

  if (context.state === "running") {
    start();
  } else {
    queueAudioRetry(() => {
      context.resume().catch(() => {});
      start();
    });
  }
}

/** Web Audio 解碼失敗時（例如嵌入環境的 CSP 擋下 fetch）退回用 <audio> 元素播放，
 *  音量在 iOS 上可能無法精準調整，但至少確保聽得到聲音 */
function playBgmFallback(key: BgmKey, token: number) {
  if (token !== playToken) return;
  const audio = new Audio(resolveAudioUrl(BGM_URLS[key]));
  audio.loop = true;
  audio.volume = useSettingsStore.getState().bgmVolume;
  fallbackAudio = audio;
  audio.play().catch(() => {
    queueAudioRetry(() => {
      if (fallbackAudio === audio) audio.play().catch(() => {});
    });
  });
}

/** 切換播放對應模組的 BGM；同一首曲子重複呼叫不會重新開始播放；
 *  瀏覽器擋下自動播放則等使用者第一次操作後才補播 */
export function playBgm(key: BgmKey) {
  if (currentKey === key && (currentSource || fallbackAudio) && !isPaused) return;

  const context = getAudioContext();
  const token = ++playToken;
  stopCurrentSource();
  currentKey = key;

  if (!context) {
    playBgmFallback(key, token);
    return;
  }

  const gain = ensureBgmGain(context);

  loadAudioBuffer(context, BGM_URLS[key])
    .then((buffer) => {
      if (token !== playToken) return; // 已經被下一首取代
      currentBuffer = buffer;
      startBufferSource(context, gain, buffer, 0);
    })
    .catch(() => {
      // 解碼失敗（找不到檔案或被 CSP 擋下 fetch）時退回 <audio> 播放
      playBgmFallback(key, token);
    });
}

/** 暫停目前 BGM；用於錄音時讓出音訊焦點給麥克風（Android 上兩者搶焦點會導致辨識收不到聲音） */
export function pauseBgm() {
  if (fallbackAudio) {
    fallbackAudio.pause();
    isPaused = true;
    return;
  }
  if (!currentSource || isPaused) return;
  const context = getAudioContext();
  const elapsed = context ? context.currentTime - playbackStartedAt + pausedOffset : pausedOffset;
  stopCurrentSource();
  pausedOffset = currentBuffer ? elapsed % currentBuffer.duration : elapsed;
  isPaused = true;
}

/** 錄音結束後恢復先前暫停的 BGM */
export function resumeBgm() {
  if (!isPaused) return;
  if (fallbackAudio) {
    isPaused = false;
    fallbackAudio.play().catch(() => {});
    return;
  }
  if (!currentBuffer) return;
  const context = getAudioContext();
  if (!context) return;
  const gain = ensureBgmGain(context);
  startBufferSource(context, gain, currentBuffer, pausedOffset);
}

/** 語音與 BGM 現在共用同一個 AudioContext，這裡沿用同一次手勢一併喚醒即可 */
export function unlockBgmAudioOnFirstGesture() {
  if (typeof window === "undefined") return;
  const unlock = () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    getAudioContext()?.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

