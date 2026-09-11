import { useSettingsStore } from "../store/useSettingsStore";

let audioContext: AudioContext | null = null;
let audioUnlocked = false;
const pendingRetries: Array<() => void> = [];
const bufferCache = new Map<string, Promise<AudioBuffer>>();

let voiceGain: GainNode | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let fallbackVoice: HTMLAudioElement | null = null;
let playToken = 0;

/** iOS Safari 上 <audio> 元素的 .volume 完全不會生效（Apple 刻意鎖死），
 *  所以語音／BGM 優先解碼成 AudioBuffer，透過 Web Audio 的 GainNode 控制音量，
 *  語音與 BGM 共用同一個 AudioContext（voice/bgm 兩個各自 new 一個在 iOS 上容易撞到瀏覽器對 AudioContext 數量的限制） */
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextCtor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  audioContext ??= new AudioContextCtor();
  return audioContext;
}

function ensureVoiceGain(context: AudioContext) {
  if (!voiceGain) {
    voiceGain = context.createGain();
    voiceGain.gain.value = useSettingsStore.getState().voiceVolume;
    voiceGain.connect(context.destination);
  }
  return voiceGain;
}

/** 設定面板調整音量滑桿時，即時套用到正在播放的語音 */
useSettingsStore.subscribe((state) => {
  if (voiceGain) voiceGain.gain.value = state.voiceVolume;
  if (fallbackVoice) fallbackVoice.volume = state.voiceVolume;
});

/** 把資料裡寫死的 root-absolute 路徑（如 /audio/xxx.mp3）換成部署路徑下的正確網址，
 *  避免 VIVERSE 把打包內容放在子路徑時，音檔仍去網站根目錄要檔案而 404 */
export function resolveAudioUrl(url: string): string {
  return `${import.meta.env.BASE_URL}${url.replace(/^\//, "")}`;
}

/** 下載並解碼音檔為 AudioBuffer；同一個網址重複播放時直接複用已解碼的結果 */
export function loadAudioBuffer(context: AudioContext, url: string): Promise<AudioBuffer> {
  const resolved = resolveAudioUrl(url);
  let pending = bufferCache.get(resolved);
  if (!pending) {
    pending = fetch(resolved)
      .then((res) => res.arrayBuffer())
      .then((data) => context.decodeAudioData(data));
    pending.catch(() => bufferCache.delete(resolved));
    bufferCache.set(resolved, pending);
  }
  return pending;
}

/** 瀏覽器擋下自動播放時，把補播動作暫存起來，等偵測到使用者第一次真的操作過後再重播一次 */
export function queueAudioRetry(retry: () => void) {
  if (audioUnlocked) {
    retry();
    return;
  }
  pendingRetries.push(retry);
}

/** 直接解除瀏覽器自動播放限制並補播所有先前被擋下的語音／BGM；
 *  必須在使用者操作事件的呼叫堆疊內同步呼叫才有效（例如按鈕 onClick 內） */
export function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  getAudioContext()?.resume().catch(() => {});
  pendingRetries.splice(0).forEach((retry) => retry());
}

/** 監聽整頁第一次使用者手勢（VIVERSE 內嵌時，進入關卡當下常常還沒收到任何真正的點擊／觸控，
 *  導致瀏覽器擋下自動播放的語音）；偵測到後補播所有先前被擋下的語音／BGM，只需呼叫一次 */
export function unlockAudioOnFirstGesture() {
  if (typeof window === "undefined" || audioUnlocked) return;
  const unlock = () => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    unlockAudio();
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

function stopCurrentVoiceSource() {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch {
      // 尚未真正開始播放就被打斷時 stop() 會丟例外，忽略即可
    }
    currentSource.disconnect();
    currentSource = null;
  }
  if (fallbackVoice) {
    fallbackVoice.pause();
    fallbackVoice = null;
  }
}

/** Web Audio 解碼失敗時（例如嵌入環境的 CSP 擋下 fetch）退回用 <audio> 元素播放，
 *  音量在 iOS 上可能無法精準調整，但至少確保聽得到聲音 */
function playVoiceFallback(url: string, token: number) {
  if (token !== playToken) return;
  const audio = new Audio(resolveAudioUrl(url));
  audio.volume = useSettingsStore.getState().voiceVolume;
  fallbackVoice = audio;
  audio.play().catch(() => {
    queueAudioRetry(() => {
      if (fallbackVoice === audio) audio.play().catch(() => {});
    });
  });
}

/** 播放語音音檔；播放新的一句前會先切斷上一句還在播的語音，找不到檔案時靜默失敗不影響遊戲進行；
 *  瀏覽器擋下自動播放則等使用者第一次操作後，若目前仍是同一句才補播 */
export function playAudio(url?: string) {
  if (!url) return;
  const context = getAudioContext();
  const token = ++playToken;
  stopCurrentVoiceSource();

  if (!context) {
    playVoiceFallback(url, token);
    return;
  }

  const gain = ensureVoiceGain(context);

  loadAudioBuffer(context, url)
    .then((buffer) => {
      if (token !== playToken) return; // 已經被下一句取代，不用再播
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);
      currentSource = source;

      const start = () => {
        if (token !== playToken) return;
        try {
          source.start(0);
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
    })
    .catch(() => {
      // 解碼失敗（找不到檔案或被 CSP 擋下 fetch）時退回 <audio> 播放
      playVoiceFallback(url, token);
    });
}

/** 停止目前正在播放的語音（跳出關卡／切換關卡時呼叫，避免語音跟著跑到別的畫面） */
export function stopAudio() {
  playToken++; // 讓還在載入中的舊語音作廢，避免補播
  stopCurrentVoiceSource();
}

export function navigationAudioUrl(stageId: string, taskId: string) {
  return `/audio/navigation/${stageId}/${taskId}.mp3`;
}

export function callAudioUrl(stageId: string, lineId: string) {
  return `/audio/call/${stageId}/${lineId}.mp3`;
}

export function greetingAudioUrl(greetingId: string) {
  return `/audio/greetings/${greetingId}.mp3`;
}

