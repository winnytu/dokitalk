import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import type { Direction } from "../../store/useNavigationGameStore";
import type { GridPosition, TileValue, TownMap } from "../../types/navigation";
import meWalkFront from "../../assets/character/me_walk_front.png";
import meWalkBack from "../../assets/character/me_walk_back.png";
import meWalkLeft from "../../assets/character/me_walk_left.png";
import meWalkRight from "../../assets/character/me_walk_right.png";

interface GridMapProps {
  map: TownMap;
  playerPos: GridPosition;
  facing: Direction;
}

// 有城鎮插畫背景時，格子本身不再需要色塊填色，碰撞邏輯純粹依賴 mapGrid 數值
const TILE_COLORS: Record<TileValue, string> = {
  0: "bg-transparent",
  1: "bg-transparent",
  2: "bg-transparent",
};

/** 每個方向對應的走路 sprite sheet（3x3 格，共 9 個動作影格） */
const WALK_SPRITES: Record<Direction, string> = {
  down: meWalkFront,
  up: meWalkBack,
  left: meWalkLeft,
  right: meWalkRight,
};

const SPRITE_COLS = 3;
const SPRITE_ROWS = 3;
const FRAME_COUNT = SPRITE_COLS * SPRITE_ROWS;
const FRAME_INTERVAL_MS = 140;

/** 除錯用：顯示格線與每格的 x,y 座標，對齊插畫用完就關掉 */
const DEBUG_GRID = false;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 依目前面向的方向，循環播放 3x3 sprite sheet 的走路動畫影格 */
function useWalkFrame(): number {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % FRAME_COUNT);
    }, FRAME_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);
  return frame;
}

export function GridMap({ map, playerPos, facing }: GridMapProps) {
  const { mapGrid, tileSize, viewportCols, viewportRows, backgroundImage } = map;
  const rows = mapGrid.length;
  const cols = mapGrid[0]?.length ?? 0;
  const frame = useWalkFrame();
  const frameCol = frame % SPRITE_COLS;
  const frameRow = Math.floor(frame / SPRITE_COLS);

  const viewportWidth = viewportCols * tileSize;
  const viewportHeight = viewportRows * tileSize;

  // 容器實際像素尺寸：用來算出「填滿裁切」時每格在螢幕上的實際大小，
  // 而非用固定視窗尺寸再套 CSS scale（那樣長寬比不合時會留白或裁到玩家）
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(el);
    setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    return () => observer.disconnect();
  }, []);

  const hasSize = containerSize.width > 0 && containerSize.height > 0;
  const scale = hasSize
    ? Math.max(containerSize.width / viewportWidth, containerSize.height / viewportHeight)
    : 1;
  const onScreenTile = tileSize * scale;
  // 容器目前實際可看到的格數（cover 縮放下較長的那一軸會超出容器並被裁掉一部分）
  const visibleCols = hasSize ? containerSize.width / onScreenTile : viewportCols;
  const visibleRows = hasSize ? containerSize.height / onScreenTile : viewportRows;

  // 鏡頭跟隨玩家，並限制在地圖邊界內；用實際可見格數而非固定視窗格數，避免玩家被裁到看不見
  const maxCamX = Math.max(cols - visibleCols, 0);
  const maxCamY = Math.max(rows - visibleRows, 0);
  const camX = clamp(playerPos.x - visibleCols / 2, 0, maxCamX);
  const camY = clamp(playerPos.y - visibleRows / 2, 0, maxCamY);

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full overflow-hidden rounded-2xl border-4 border-white/60 shadow-peach"
    >
      <div
        className="absolute left-0 top-0"
        style={{
          width: cols * onScreenTile,
          height: rows * onScreenTile,
          transform: `translate(${-camX * onScreenTile}px, ${-camY * onScreenTile}px)`,
          transition: "transform 0.18s ease-in-out",
        }}
      >
        {/* 城鎮插畫背景：鋪滿整張地圖的像素範圍，格線與碰撞邏輯疊在上面 */}
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            className="pointer-events-none absolute left-0 top-0 select-none object-cover"
            style={{
              width: cols * onScreenTile,
              height: rows * onScreenTile,
            }}
            draggable={false}
          />
        )}

        {/* Tile layer：0/1 為透明碰撞層，2 為建築入口熱點（無視覺提示，觸發邏輯見 triggers） */}
        {mapGrid.map((row, y) =>
          row.map((tile, x) => (
            <div
              key={`${x}-${y}`}
              className={cn(
                "absolute flex items-center justify-center",
                TILE_COLORS[tile as TileValue],
                DEBUG_GRID && "border border-red-500/40",
              )}
              style={{
                left: x * onScreenTile,
                top: y * onScreenTile,
                width: onScreenTile,
                height: onScreenTile,
              }}
            >
              {DEBUG_GRID && (
                <span className="absolute left-0.5 top-0.5 text-[8px] font-bold leading-none text-red-600">
                  {x},{y}
                </span>
              )}
            </div>
          )),
        )}

        {/* Player character：依面向方向播放對應的走路 sprite sheet，放大 2 倍並置中對齊格子 */}
        <div
          className="pointer-events-none absolute z-10"
          style={{
            width: onScreenTile * 2,
            height: onScreenTile * 2,
            transform: `translate(${playerPos.x * onScreenTile - onScreenTile / 2}px, ${playerPos.y * onScreenTile - onScreenTile / 2}px)`,
            transition: "transform 0.18s ease-in-out",
            backgroundImage: `url(${WALK_SPRITES[facing]})`,
            backgroundSize: `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`,
            backgroundPosition: `${(frameCol / (SPRITE_COLS - 1)) * 100}% ${(frameRow / (SPRITE_ROWS - 1)) * 100}%`,
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
    </div>
  );
}
