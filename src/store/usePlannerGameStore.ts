import { create } from "zustand";
import type { DayId, PlannerStage } from "../types/planner";

const DAYS: DayId[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export type Placements = Record<DayId, string[]>;

interface PlannerGameState {
  placements: Placements;
  isComplete: boolean;

  placeSticker: (day: DayId, stickerId: string) => void;
  removeSticker: (stickerId: string) => void;
  checkAnswer: (stage: PlannerStage) => boolean;
  reset: () => void;
}

function emptyPlacements(): Placements {
  return Object.fromEntries(DAYS.map((d) => [d, [] as string[]])) as Placements;
}

function setsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sorted1 = [...a].sort();
  const sorted2 = [...b].sort();
  return sorted1.every((v, i) => v === sorted2[i]);
}

export const usePlannerGameStore = create<PlannerGameState>()((set, get) => ({
  placements: emptyPlacements(),
  isComplete: false,

  placeSticker: (day, stickerId) => {
    set((state) => {
      const prev = state.placements;
      const dayStickers = prev[day];
      if (dayStickers.includes(stickerId)) return state;
      return {
        placements: { ...prev, [day]: [...dayStickers, stickerId] },
      };
    });
  },

  removeSticker: (stickerId) => {
    set((state) => {
      const next = { ...state.placements };
      for (const day of DAYS) {
        if (next[day].includes(stickerId)) {
          next[day] = next[day].filter((id) => id !== stickerId);
          break;
        }
      }
      return { placements: next };
    });
  },

  checkAnswer: (stage) => {
    const { placements } = get();
    const expected = stage.expectedAnswers;

    for (const day of DAYS) {
      const exp = expected[day] ?? [];
      const placed = placements[day];
      if (!setsEqual(placed, exp)) return false;
    }
    set({ isComplete: true });
    return true;
  },

  reset: () => {
    set({ placements: emptyPlacements(), isComplete: false });
  },
}));
