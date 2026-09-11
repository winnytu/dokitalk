import { create } from "zustand";
import type { GridPosition, NavigationStage, TownMap } from "../types/navigation";

export type Direction = "up" | "down" | "left" | "right";

interface NavigationGameState {
  taskIndex: number;
  playerPos: GridPosition;
  /** 玩家目前面向的方向，用於 GridMap 顯示對應的走路 sprite */
  facing: Direction;
  haruMessage: string | null;
  isDone: boolean;

  move: (dir: Direction, stage: NavigationStage, map: TownMap) => void;
  answerIndoor: (optionId: string, stage: NavigationStage) => boolean;
  clearMessage: () => void;
  reset: (stage: NavigationStage, prefill: boolean) => void;
}

const DIR_DELTA: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

/**
 * 建築物範圍並非單一入口格，而是一片連續的障礙格（tile===1）加上旁邊的入口觸發格（tile===2），
 * 因此從撞到的障礙格往外 BFS 找到這片連續建築附近的入口觸發格，以判定玩家是否碰到目標建築範圍。
 */
function findTriggerNearObstacle(
  map: TownMap,
  startX: number,
  startY: number,
  preferredBuildingId?: string,
) {
  const rows = map.mapGrid.length;
  const cols = map.mapGrid[0]?.length ?? 0;
  const visited = new Set<string>([`${startX},${startY}`]);
  const queue: GridPosition[] = [{ x: startX, y: startY }];
  const found: (typeof map.triggers)[string][] = [];

  while (queue.length) {
    const { x: cx, y: cy } = queue.shift()!;
    for (const { dx, dy } of Object.values(DIR_DELTA)) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
      const key = `${nx},${ny}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const tileVal = map.mapGrid[ny][nx];
      if (tileVal === 1) {
        queue.push({ x: nx, y: ny });
      } else if (tileVal === 2) {
        const trigger = map.triggers[key];
        if (trigger) found.push(trigger);
      }
    }
  }

  return found.find((t) => t.buildingId === preferredBuildingId) ?? found[0] ?? null;
}

export const useNavigationGameStore = create<NavigationGameState>()(
  (set, get) => ({
    taskIndex: 0,
    playerPos: { x: 0, y: 0 },
    facing: "down",
    haruMessage: null,
    isDone: false,

    move: (dir, stage, map) => {
      const { playerPos, isDone, taskIndex } = get();
      const task = stage.tasks[taskIndex];
      if (isDone || !task || task.type !== "map") return;

      set({ facing: dir });

      const { dx, dy } = DIR_DELTA[dir];
      const nx = playerPos.x + dx;
      const ny = playerPos.y + dy;

      const rows = map.mapGrid.length;
      const cols = map.mapGrid[0]?.length ?? 0;
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return;

      const tile = map.mapGrid[ny][nx];

      if (tile === 0) {
        // 部分建築的入口格在地圖資料中被標成可通行（例如剛好是玩家出生點旁的路面），
        // 所以走到可通行格時也要順便檢查是否踩到該建築的觸發點
        const trigger = map.triggers[`${nx},${ny}`];
        set({ playerPos: { x: nx, y: ny }, haruMessage: null });
        if (trigger && trigger.buildingId === task.targetBuildingId) {
          const nextIndex = taskIndex + 1;
          if (nextIndex >= stage.tasks.length) {
            set({ taskIndex: nextIndex, isDone: true, haruMessage: null });
          } else {
            set({ taskIndex: nextIndex, haruMessage: null });
          }
        }
        return;
      }

      if (tile === 1) {
        // 碰到障礙時，先確認這片障礙是否連接到某個建築的入口，碰到建築範圍就算抵達，不需要精準走到入口格
        const nearbyTrigger = findTriggerNearObstacle(map, nx, ny, task.targetBuildingId);
        if (nearbyTrigger) {
          if (nearbyTrigger.buildingId === task.targetBuildingId) {
            const nextIndex = taskIndex + 1;
            if (nextIndex >= stage.tasks.length) {
              set({ taskIndex: nextIndex, isDone: true, haruMessage: null });
            } else {
              set({ taskIndex: nextIndex, haruMessage: null });
            }
          } else {
            set({
              haruMessage:
                nearbyTrigger.wrongMessage ?? "前輩、ここじゃないみたいだよ…？",
            });
          }
          return;
        }
        set({ haruMessage: "前輩、そっちは行けないよ！" });
        return;
      }

      // tile === 2: Trigger point
      const triggerKey = `${nx},${ny}`;
      const trigger = map.triggers[triggerKey];
      if (!trigger) return;

      if (trigger.buildingId === task.targetBuildingId) {
        const nextIndex = taskIndex + 1;
        if (nextIndex >= stage.tasks.length) {
          set({ taskIndex: nextIndex, isDone: true, haruMessage: null });
        } else {
          set({ taskIndex: nextIndex, haruMessage: null });
        }
      } else {
        set({
          haruMessage:
            trigger.wrongMessage ?? "前輩、ここじゃないみたいだよ…？",
        });
      }
    },

    answerIndoor: (optionId, stage) => {
      const { taskIndex, isDone } = get();
      const task = stage.tasks[taskIndex];
      if (isDone || !task || task.type !== "indoor") return false;

      const option = task.options.find((o) => o.id === optionId);
      if (!option || !option.isCorrect) return false;

      const nextIndex = taskIndex + 1;
      if (nextIndex >= stage.tasks.length) {
        set({ taskIndex: nextIndex, isDone: true });
      } else {
        set({ taskIndex: nextIndex });
      }
      return true;
    },

    clearMessage: () => set({ haruMessage: null }),

    reset: (stage, prefill) => {
      if (prefill) {
        set({
          taskIndex: stage.tasks.length,
          playerPos: stage.playerStart,
          facing: "down",
          haruMessage: null,
          isDone: true,
        });
      } else {
        set({
          taskIndex: 0,
          playerPos: stage.playerStart,
          facing: "down",
          haruMessage: null,
          isDone: false,
        });
      }
    },
  }),
);
