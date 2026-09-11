import { useEffect, useState } from "react";

export type TimeOfDay = "day" | "night";

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 18;

function computeTimeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours();
  return hour >= DAY_START_HOUR && hour < DAY_END_HOUR ? "day" : "night";
}

/**
 * 根據使用者裝置的現實時間，回傳現在是「白天」還是「夜晚」，
 * 供大廳背景切換咖啡廳／房間場景使用。每分鐘重新檢查一次，
 * 讓長時間開著頁面時場景也能自動跨越晝夜交界。
 */
export function useTimeOfDay(): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() =>
    computeTimeOfDay(new Date()),
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimeOfDay(computeTimeOfDay(new Date()));
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return timeOfDay;
}
