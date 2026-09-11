# DokiTalk — 開發銜接文檔

> 本文件旨在讓任何 AI 助手或開發者能零門檻接手本專案，涵蓋產品背景、技術架構、模組設計、資料模型、元件關係、開發規範與已知限制。

---

## 目錄

1. [產品概述](#1-產品概述)
2. [技術棧與環境](#2-技術棧與環境)
3. [目錄結構](#3-目錄結構)
4. [設計系統](#4-設計系統)
5. [全域狀態管理](#5-全域狀態管理)
6. [模組 A：交換手帳 (Planner)](#6-模組-a交換手帳-planner)
7. [模組 B：心跳導航 (Navigation)](#7-模組-b心跳導航-navigation)
8. [模組 C：深夜通話 (Call)](#8-模組-c深夜通話-call)
9. [Dashboard 大廳](#9-dashboard-大廳)
10. [共用元件 (UI)](#10-共用元件-ui)
11. [自訂 Hooks](#11-自訂-hooks)
12. [關卡資料格式](#12-關卡資料格式)
13. [開發規範與約定](#13-開發規範與約定)
14. [已知限制與未來方向](#14-已知限制與未來方向)

---

## 1. 產品概述

**DokiTalk** 是一款結合乙女戀愛模擬（Otome）與日語學習的 Web MVP 應用。玩家透過三個核心互動模組，與男主角「陽 (Haru)」建立關係的同時，自然習得 N5~N4 日語。

### 角色設定
- **陽 (Haru)**：犬系年下男，對玩家（前輩）使用敬語，性格溫暖、撒嬌、有點笨拙但超級認真。
- **玩家 (前輩)**：由使用者操控的女主角。

### 設計語言
- **情緒基調**：柔軟、溫暖、透明感、高情緒價值。
- **視覺風格**：Glassmorphism（毛玻璃）、Spring 物理動畫、蜜桃粉暖色系。

---

## 2. 技術棧與環境

| 類別 | 技術 | 版本 |
|------|------|------|
| Framework | React + Vite | React 19, Vite 5 |
| Language | TypeScript | 6.x |
| Styling | Tailwind CSS | 3.4 |
| Animation | Framer Motion | 12.x |
| State | Zustand (persist) | 5.x |
| Drag & Drop | @dnd-kit/core | 6.x |
| Speech | Web Speech API | 原生瀏覽器 |
| Lint | oxlint | - |

### 必要指令

```bash
npm install          # 安裝依賴
npm run dev          # 啟動開發伺服器 (Vite, port 5173)
npm run build        # TypeScript 編譯 + Vite 打包
npm run lint         # OxLint 檢查
npm run preview      # 預覽 dist 建置結果
```

### TypeScript 設定重點
- `target: "es2023"`, `module: "esnext"`, `moduleResolution: "bundler"`
- `resolveJsonModule: true`（JSON 直接 import）
- `noUnusedLocals: true`, `noUnusedParameters: true`（嚴格未使用檢查）
- `verbatimModuleSyntax: true`（必須使用 `import type` 語法）

---

## 3. 目錄結構

```
src/
├── App.tsx                    # 頂層路由與視圖切換
├── main.tsx                   # React 掛載入口
├── index.css                  # Tailwind base/components/utilities
├── assets/                    # 靜態圖片
├── components/
│   ├── call/                  # 模組 C 元件
│   ├── dashboard/             # 大廳首頁元件
│   ├── navigation/            # 模組 B 元件
│   ├── planner/               # 模組 A 元件
│   └── ui/                    # 共用 UI 原子元件
├── data/                      # JSON 關卡資料 + TS re-export
├── hooks/                     # 自訂 React Hooks
├── lib/                       # 工具函式
├── store/                     # Zustand Stores
└── types/                     # TypeScript 型別定義
```

### 資料層慣例
每個關卡資料集由兩個檔案組成：
- `xxxStages.json`：原始資料。
- `xxxStages.ts`：re-export 並附加型別斷言（`as unknown as XxxStage[]`）。

---

## 4. 設計系統

### 色票 (tailwind.config.js)

| Token | Hex | 用途 |
|-------|-----|------|
| `primary` | `#FF99A8` | 主色：按鈕、強調 |
| `primary-light` | `#FFE5E9` | 淺粉：背景、hover |
| `background` | `#FFFDFD` | 全局底色 |
| `text-main` | `#5C4B49` | 主要文字 |
| `text-muted` | `#9E8C8A` | 次要文字 |
| `success` | `#86D5B7` | 正確回饋 |
| `error` | `#FFB3A7` | 錯誤回饋 |
| `night` | `#3B2A3E` | 夜間場景 |
| `night-light` | `#5C4363` | 夜間次色 |

### 字體
- **日文/漢字**：Zen Maru Gothic
- **英數**：Nunito → Zen Maru Gothic (fallback)

### 動畫規範（強制）
**所有** Framer Motion 動畫必須使用 `type: "spring"`：
```tsx
transition={{ type: "spring", stiffness: 400, damping: 15 }}
```
禁止使用 `type: "tween"` 或 `duration` 作為主要動畫方式。

### 陰影
- `shadow-peach`：`0 8px 24px rgba(255, 153, 168, 0.12)` — 卡片/按鈕
- `shadow-peach-lg`：`0 12px 32px rgba(255, 153, 168, 0.2)` — 強調

### className 工具
使用 `cn()` 函式（`clsx` + `tailwind-merge`）處理條件式/衝突 class：
```tsx
import { cn } from "../../lib/cn";
className={cn("base-class", isActive && "active-class")}
```

---

## 5. 全域狀態管理

### useProgressStore (持久化)

**localStorage key**: `dokitalk-progress`

```typescript
interface GameProgressState {
  completedStages: {
    planner: string[];
    navigation: string[];
    call: string[];
  };
  heartPoints: number;      // 戀愛代幣
  intimacyLevel: number;    // 好感度等級（每 50 HP 升一級）

  completeStage(module, stageId, reward): void;  // 同一關不重複發獎
  resetProgress(): void;
}
```

**關鍵行為**：
- `completeStage` 內建防重複（`alreadyCompleted` 檢查）。
- `intimacyLevel = Math.floor(heartPoints / 50) + 1`。

### 模組級 Store（非持久化）

| Store | 用途 |
|-------|------|
| `usePlannerGameStore` | 貼紙拖放位置、驗證邏輯 |
| `useNavigationGameStore` | 玩家座標、碰撞、任務進度 |

---

## 6. 模組 A：交換手帳 (Planner)

### 概念
玩家聽取 Haru 的語音留言（對話），理解情境後將正確的日文/中文貼紙拖放到對應星期的格子中。

### 資料模型 (`types/planner.ts`)

```typescript
type DayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type StickerType = "action" | "mood";

interface PlannerSticker {
  id: string;
  label: string;
  type: StickerType;  // 視覺區分用，不影響拖放
}

interface PlannerDialogue {
  id: string;
  speaker: "haru" | "player";
  text: string;          // 日文台詞
  translation: string;   // 中文翻譯
  audioUrl: string;      // 音檔 URL（預留）
}

interface PlannerStage {
  id: string;
  title: string;
  reward: number;
  dialogues: PlannerDialogue[];
  stickers: PlannerSticker[];
  expectedAnswers: Record<DayId, string[]>;  // 每天應放的貼紙 ID 陣列
}
```

### 核心邏輯

- **拖放**：使用 `@dnd-kit/core`，`DndContext` → `DragOverlay`。
- **不限類型、不限數量**：任何貼紙可拖到任何天、同一天可放多張。
- **驗證**：點擊「確認送出」按鈕觸發 `checkAnswer()`，以 **sorted array 比較** 判定正確性（order-independent）。
- **回饋**：錯誤天顯示 `animate-shake`，全對顯示 `StampEffect`。

### 元件結構

```
PlannerBoard (主控)
├── DialoguePanel          → 對話氣泡列表
├── DayCell × 7            → 每天的 DropZone
├── StickerTray            → 剩餘未放置的貼紙容器
│   └── WordSticker × N    → 可拖動貼紙
└── DragOverlay            → 拖動時的浮動影子
```

---

## 7. 模組 B：心跳導航 (Navigation)

### 概念
2D RPG 俯視角地圖移動 + 室內情境選擇題。玩家根據 Haru 的方位語音提示，操控 Q 版角色走到目標建築物，進入後解答日語相關問題。

### 資料模型 (`types/navigation.ts`)

```typescript
type TileValue = 0 | 1 | 2;
// 0 = Walkable（道路）
// 1 = Obstacle（障礙：樹/牆）
// 2 = Trigger（建築物入口）

interface TriggerInfo {
  buildingId: string;
  emoji: string;
  label: string;
  wrongMessage?: string;  // 走錯時 Haru 的台詞
}

interface MapTask {
  type: "map";
  id: string;
  targetBuildingId: string;  // 對應 triggers 的 buildingId
  hint: string;              // Haru 的日語方位指示
  hintTranslation: string;
}

interface IndoorTask {
  type: "indoor";
  id: string;
  sceneEmoji: string;
  sceneLabel: string;
  haruLine?: string;
  haruTranslation?: string;
  question: string;
  options: IndoorOption[];   // { id, label, isCorrect }
}

type NavigationTask = MapTask | IndoorTask;

interface NavigationStage {
  id: string;
  title: string;
  reward: number;
  mapGrid: TileValue[][];            // 二維陣列 [row][col]
  tileSize: number;                   // 每格像素大小
  playerStart: GridPosition;          // { x, y }
  triggers: Record<string, TriggerInfo>;  // key: "x,y"
  tasks: NavigationTask[];            // 交替的地圖/室內任務序列
  successLine: string;
  successTranslation: string;
}
```

### 核心邏輯 (useNavigationGameStore)

**移動三段式碰撞偵測**：
1. **邊界檢查**：`nx < 0 || nx >= cols || ny < 0 || ny >= rows` → 忽略。
2. **tile === 1**：阻斷 + 顯示 `haruMessage`。
3. **tile === 2**：阻斷 + 觸發建築驗證：
   - 比對 `trigger.buildingId === currentMapTask.targetBuildingId`。
   - 正確 → `taskIndex++`（推進到下一任務）。
   - 錯誤 → 顯示 `trigger.wrongMessage`。

**無「進入建築」按鈕**——走向觸發格即自動觸發。

**角色移動動畫**：CSS `transform: translate()` + `transition: 0.18s ease-in-out`。

### 視覺層（Phase 1：色塊測試模式）

| Tile | 顏色 |
|------|------|
| `0` | `bg-stone-200`（灰色路面） |
| `1` | `bg-green-700/60`（綠色障礙） |
| `2` | `bg-amber-300/80`（琥珀色建築 + emoji） |

**Phase 2 升級路徑**：將色塊設為 `opacity-0`，外層容器加 `background-image: url(pixel-map.png)` 即可瞬間完成視覺升級。

### 元件結構

```
NavigationBoard (主控)
├── Hint Card              → Haru 的方位指示（漸層粉紫卡）
├── Haru Message Bubble    → 碰撞/錯誤即時氣泡
├── GridMap                → Tilemap 色塊 + Player 角色
├── DirectionPad           → 虛擬十字方向鍵
└── IndoorScene            → 室內選擇題畫面
```

---

## 8. 模組 C：深夜通話 (Call)

### 概念
模擬語音通話場景。Haru 和玩家交替說話，通過「聽力填空」和「口說辨識」兩種 Phase 類型交替測驗日語聽力與口說能力。

### 資料模型 (`types/call.ts`)

```typescript
interface CallClozeLine {
  id: string;
  speaker: "haru" | "player";
  before: string;       // 空格前的日文
  after: string;        // 空格後的日文
  answer: string;       // 正確答案
  options: string[];    // 選項陣列
  translation: string;  // 中文翻譯
}

interface CallSpeakLine {
  id: string;
  prompt: string;   // 中文畫面提示（告訴玩家要表達什麼）
  text: string;     // 要朗讀的日文
  romaji: string;   // 羅馬拼音參考
}

interface CallClozePhase {
  type: "cloze";
  lines: CallClozeLine[];  // 一個 cloze phase 可含多句連續填空
}

interface CallSpeakPhase {
  type: "speak";
  line: CallSpeakLine;
}

type CallPhase = CallClozePhase | CallSpeakPhase;

interface CallStage {
  id: string;
  title: string;
  callerName: string;
  reward: number;
  phases: CallPhase[];         // 任意數量、任意交替
  successLine: string;
  successTranslation: string;
}
```

### 核心邏輯

- `phaseIndex` 追蹤目前 phase 位置。
- `clozeLineIndex` 追蹤 cloze phase 內的句子位置。
- **Cloze**：選錯選項 → 該選項短暫標紅 (`variant="error"`)，選對 → 推進。
- **Speak**：使用 Web Speech API (`lang: "ja-JP"`)，辨識結果經 `isSpeechMatch()` 寬鬆比對。
- 所有 phase 完成 → 顯示 `successLine` + 通關動畫。

### 語音辨識容錯
`speechMatch.ts` 會移除空白和標點，用「完全相同 ∨ 互相包含」的寬鬆規則比對：
```typescript
normalizedTranscript === normalizedTarget ||
normalizedTranscript.includes(normalizedTarget) ||
normalizedTarget.includes(normalizedTranscript)
```

### 元件結構

```
CallBoard (主控)
├── Waveform             → 語音波形動畫
├── ClozeLine × N        → 填空題句子
├── MicButton            → 麥克風按住辨識
└── Success Card         → 通關回饋
```

---

## 9. Dashboard 大廳

### 視覺
- **全螢幕背景**：根據現實時間自動切換（白天/夜晚）。
- **Haru 半身像**：靜態圖片 + 呼吸感 spring 動畫。
- **戳一戳互動**：點擊 Haru → 隨機日語問候氣泡（含羅馬拼音）。

### 導航流程

```
Dashboard → 點擊模組入口 → LevelDrawer 彈出（底部抽屜）
         → 選擇關卡 → 進入模組畫面
         → 頂部導覽列可「← 回大廳」或「關卡選單」
```

### LevelDrawer 狀態邏輯

| 關卡狀態 | 視覺表現 |
|----------|----------|
| ✅ 已完關 | 粉色卡片，顯示獲得的 HP（可重玩） |
| 🔓 當前解鎖 | 高亮描邊 + 呼吸動畫 |
| 🔒 未解鎖 | 灰階半透明 + 鎖頭 icon，不可點擊 |

### 元件結構

```
Dashboard
├── DashboardBackground   → 時段背景
├── TopBar                → 頭像 + 好感度 + HP
├── HaruPortrait          → 互動角色
├── GreetingBubble        → 日語氣泡
└── EntryMenu             → 三個模組入口卡
```

---

## 10. 共用元件 (UI)

| 元件 | 用途 | 重要 Props |
|------|------|-----------|
| `GlassCard` | 毛玻璃容器 | `padding`, `rounded`, `className` |
| `SpringButton` | Spring 動畫按鈕 | `variant`, `size`, `onClick` |
| `StampEffect` | 通關蓋章動畫 | `title`, `subtitle` |
| `Waveform` | 語音波形動畫 | `active` |

---

## 11. 自訂 Hooks

### `useSpeechRecognition`
- 包裝 Web Speech API。
- 預設 `lang: "ja-JP"`。
- 回傳：`isSupported`, `isListening`, `transcript`, `error`, `start()`, `stop()`。
- `onFinalResult` callback 在辨識結束時觸發。

### `useTimeOfDay`
- 回傳 `"day" | "night"`。
- 6:00~18:00 為白天，其餘為夜晚。
- 每 60 秒重新檢查一次。

---

## 12. 關卡資料格式

### 命名規範
- 難度一：`"1-1"`, `"1-2"`, `"1-3"` ...
- 難度二：`"2-1"`, `"2-2"`, `"2-3"` ...

### 現有關卡數量

| 模組 | 難度一 | 難度二 |
|------|--------|--------|
| Planner (A) | 1-1 ~ 1-3 | 2-1 ~ 2-6 |
| Navigation (B) | 1-1 ~ 1-3 | — |
| Call (C) | 1-1 ~ 1-3 | 2-1 ~ 2-3 |

### 新增關卡步驟
1. 在 `src/data/xxxStages.json` 新增物件（遵照同檔案的格式）。
2. TypeScript 自動透過 `.ts` re-export 取得型別。
3. 確保 `id` 唯一且符合 `"X-Y"` 命名。
4. 執行 `npm run build` 驗證型別安全。

---

## 13. 開發規範與約定

### 動畫
- ✅ 永遠使用 `type: "spring"`
- ❌ 禁止 `type: "tween"` 或裸 `duration`
- 標準參數：`stiffness: 400, damping: 15`（或因上下文微調 damping 至 20）

### 元件
- Framer Motion 的 `motion.div/button` 處理動畫。
- 禁止裸 `<div>` 上直接寫 `onClick`，應使用 `<button>` 或 `SpringButton`。
- `AnimatePresence` 包裹所有需要 exit 動畫的元素。

### 型別
- 模型定義集中於 `src/types/`。
- 禁止 `any`，型別安全是優先事項。
- JSON import 使用 `as unknown as Type[]` 過渡轉型。

### 狀態管理
- 全局持久化狀態 → `useProgressStore`（Zustand + persist）。
- 模組內部遊戲狀態 → 對應的 `useXxxGameStore`（不持久化）。
- 每次切換關卡時呼叫 `reset(stage, alreadyCompleted)` 初始化。

### 樣式
- 使用 Tailwind 工具類為主。
- 需要條件式 className 時使用 `cn()` 工具。
- 重複出現的視覺模式（如毛玻璃卡片）封裝為 UI 元件。

### 程式碼品質
- `npm run build` 必須通過（含 TypeScript 嚴格檢查）。
- 不要留下未使用的 import 或變數。
- 不寫冗餘註解（「import the module」之類）。

---

## 14. 已知限制與未來方向

### 已知限制
1. **音檔未實裝**：所有 `audioUrl` 欄位目前為空字串，尚無實際語音檔案。
2. **模組 B 視覺仍為色塊**：Phase 1 開發完成（邏輯正確），Phase 2（像素底圖）尚未實裝。
3. **Web Speech API 瀏覽器支援有限**：主要支援 Chrome，Safari 部分功能受限。
4. **無後端**：所有資料為前端靜態 JSON，無用戶雲端存檔。
5. **無路由**：使用 React state 控制頁面切換，非 react-router。

### 已規劃的未來方向
- 模組 B Phase 2：替換像素風 RPG 底圖與 Q 版角色 sprite。
- 音效/BGM 系統：接入 Howler.js 或 Web Audio API。
- 更多難度關卡（難度三：N4 文法）。
- 角色劇情線：好感度達標解鎖新劇情。
- 行動裝置適配：D-Pad 尺寸與觸控手感優化。
- 考慮引入 react-router 或 TanStack Router 做正式路由。

---

## 附錄：App.tsx 路由邏輯

```
View = "dashboard" | "planner" | "navigation" | "call"

Dashboard 模式：
  → 點擊入口 → setDrawerModule(moduleId) → 開啟 LevelDrawer

模組模式：
  → 頂部導覽列（回大廳/關卡選單/HP顯示）
  → key={stage.id} 確保切換關卡時 Board 完整重新掛載
```

---

*最後更新：2026-07-27*
