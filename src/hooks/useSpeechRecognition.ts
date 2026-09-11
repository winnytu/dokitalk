import { useCallback, useEffect, useRef, useState } from "react";

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  /** 辨識結束時（不論成功與否）觸發，帶入最終辨識出的文字（可能是空字串） */
  onFinalResult?: (transcript: string) => void;
}

interface UseSpeechRecognitionResult {
  /** 目前瀏覽器是否支援 Web Speech API */
  isSupported: boolean;
  isListening: boolean;
  /** 即時（含中間結果）的辨識文字，可用來顯示字幕 */
  transcript: string;
  error: string | null;
  start: () => void;
  stop: () => void;
}

/**
 * 包裝瀏覽器原生 Web Speech API (SpeechRecognition) 的 React hook。
 * 用於模組 C 的口說辨識關卡：按住麥克風開始辨識，放開即結束並回傳最終結果。
 */
export function useSpeechRecognition({
  lang = "ja-JP",
  onFinalResult,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionResult {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isSupported = getSpeechRecognitionCtor() !== null;

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("この端末は音声認識に対応していません");
      return;
    }

    // 手機端（尤其 Android）在上一段辨識的音訊資源尚未完全釋放前呼叫 start() 會拋出
    // InvalidStateError，且是同步例外、不會觸發 onerror/onend，導致第二次之後長按都沒反應。
    // 先強制中止殘留的舊 recognition 執行個體，確保麥克風焦點確實釋放。
    recognitionRef.current?.abort();

    transcriptRef.current = "";
    setTranscript("");
    setError(null);

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let combined = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        combined += event.results[i][0].transcript;
      }
      transcriptRef.current = combined;
      setTranscript(combined);
    };

    recognition.onerror = (event) => {
      setError(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      onFinalResultRef.current?.(transcriptRef.current);
    };

    recognitionRef.current = recognition;

    const attemptStart = (retriesLeft: number) => {
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        // 上一段辨識的音訊資源還沒釋放完畢，稍等一下再試一次，避免長按沒反應
        if (retriesLeft > 0) {
          window.setTimeout(() => attemptStart(retriesLeft - 1), 150);
        } else {
          setError("start-failed");
          setIsListening(false);
        }
      }
    };
    attemptStart(3);
  }, [lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return { isSupported, isListening, transcript, error, start, stop };
}
