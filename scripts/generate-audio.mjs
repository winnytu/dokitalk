#!/usr/bin/env node
/**
 * 從 src/data/*.json 彙整所有需要語音的台詞，呼叫 ElevenLabs Text to Speech API
 * 產生 mp3 並存到 public/<audioUrl> 對應路徑。
 *
 * 使用方式：
 *   ELEVENLABS_API_KEY=xxx node scripts/generate-audio.mjs
 *   node scripts/generate-audio.mjs --only=planner,vocab
 *   node scripts/generate-audio.mjs --force   # 覆蓋已存在的檔案
 *
 * 需要的環境變數（放在 .env，參考 .env.example）：
 *   ELEVENLABS_API_KEY   ElevenLabs API Key
 *   HARU_VOICE_ID        男主角 Haru 的 voice id
 *   PLAYER_VOICE_ID      玩家／女主角的 voice id
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "src/data");
const publicDir = path.join(rootDir, "public");

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? new Set(onlyArg.replace("--only=", "").split(",")) : null;

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("缺少 ELEVENLABS_API_KEY，請設定在 .env 或環境變數中。");
  process.exit(1);
}

const HARU_VOICE_ID = process.env.HARU_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";
const PLAYER_VOICE_ID = process.env.PLAYER_VOICE_ID ?? HARU_VOICE_ID;
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_v3";

const client = new ElevenLabsClient({ apiKey });

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8"));
}

function voiceIdFor(speaker) {
  return speaker === "player" ? PLAYER_VOICE_ID : HARU_VOICE_ID;
}

/** @returns {{ id: string, text: string, speaker: "haru"|"player", audioUrl: string }[]} */
function collectTasks() {
  const tasks = [];

  const planner = readJson("plannerStages.json");
  planner.forEach((stage) => {
    stage.dialogues.forEach((d) => {
      tasks.push({
        id: `planner/${stage.id}/${d.id}`,
        text: d.text,
        speaker: d.speaker,
        audioUrl: d.audioUrl,
      });
    });
  });

  const vocab = readJson("vocabularyNotes.json");
  vocab.forEach((entry) => {
    entry.vocabulary.forEach((v) => {
      tasks.push({
        id: `vocab/${v.id}`,
        text: v.reading,
        speaker: "haru",
        audioUrl: v.audioUrl,
      });
    });
  });

  const navigation = readJson("navigationStages.json");
  navigation.forEach((stage) => {
    stage.tasks.forEach((t) => {
      if (t.type === "map") {
        tasks.push({
          id: `navigation/${stage.id}/${t.id}`,
          text: t.hint,
          speaker: "haru",
          audioUrl: `/audio/navigation/${stage.id}/${t.id}.mp3`,
        });
      } else if (t.type === "indoor" && t.haruLine) {
        tasks.push({
          id: `navigation/${stage.id}/${t.id}`,
          text: t.haruLine,
          speaker: "haru",
          audioUrl: `/audio/navigation/${stage.id}/${t.id}.mp3`,
        });
      }
    });
    tasks.push({
      id: `navigation/${stage.id}/success`,
      text: stage.successLine,
      speaker: "haru",
      audioUrl: `/audio/navigation/${stage.id}/success.mp3`,
    });
  });

  const call = readJson("callStages.json");
  call.forEach((stage) => {
    stage.phases.forEach((phase) => {
      if (phase.type === "cloze") {
        phase.lines.forEach((l) => {
          tasks.push({
            id: `call/${stage.id}/${l.id}`,
            text: `${l.before}${l.answer}${l.after}`,
            speaker: l.speaker,
            audioUrl: `/audio/call/${stage.id}/${l.id}.mp3`,
          });
        });
      } else if (phase.type === "speak") {
        const l = phase.line;
        tasks.push({
          id: `call/${stage.id}/${l.id}`,
          text: l.text,
          speaker: "player",
          audioUrl: `/audio/call/${stage.id}/${l.id}.mp3`,
        });
      }
    });
    tasks.push({
      id: `call/${stage.id}/success`,
      text: stage.successLine,
      speaker: "haru",
      audioUrl: `/audio/call/${stage.id}/success.mp3`,
    });
  });

  const greetings = readJson("greetings.json");
  greetings.forEach((g) => {
    tasks.push({
      id: `greetings/${g.id}`,
      text: g.text,
      speaker: "haru",
      audioUrl: `/audio/greetings/${g.id}.mp3`,
    });
  });

  if (only) {
    return tasks.filter((t) => only.has(t.id.split("/")[0]));
  }
  return tasks;
}

async function synthesize(task) {
  const outPath = path.join(publicDir, task.audioUrl.replace(/^\//, ""));
  if (!force && fs.existsSync(outPath)) {
    console.log(`skip (exists): ${task.audioUrl}`);
    return;
  }

  const audio = await client.textToSpeech.convert(voiceIdFor(task.speaker), {
    text: task.text,
    modelId: MODEL_ID,
    outputFormat: "mp3_44100_128",
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const chunks = [];
  for await (const chunk of audio) chunks.push(chunk);
  fs.writeFileSync(outPath, Buffer.concat(chunks));
  console.log(`done: ${task.audioUrl}`);
}

async function main() {
  const tasks = collectTasks();
  console.log(`共 ${tasks.length} 筆台詞待處理${only ? `（僅限：${[...only].join(", ")}）` : ""}`);

  for (const task of tasks) {
    try {
      await synthesize(task);
    } catch (err) {
      console.error(`failed: ${task.audioUrl} -`, err.message ?? err);
    }
  }
}

main();
