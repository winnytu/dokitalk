import { useState } from "react";
import { entryPoints } from "../../data/entryPoints";
import { greetings } from "../../data/greetings";
import { utilityEntryPoints } from "../../data/utilityEntryPoints";
import { useProgressStore } from "../../store/useProgressStore";
import { useTimeOfDay } from "../../hooks/useTimeOfDay";
import { playAudio, greetingAudioUrl } from "../../lib/audio";
import { DashboardBackground } from "./DashboardBackground";
import { EntryMenu } from "./EntryMenu";
import { GreetingBubble } from "./GreetingBubble";
import { HaruPortrait } from "./HaruPortrait";
import { TopBar } from "./TopBar";
import type { Greeting, ModuleId, UtilityModuleId } from "../../types/dashboard";

const GREETING_DISPLAY_MS = 3200;

interface DashboardProps {
  onEnterModule: (module: ModuleId) => void;
  onOpenUtility: (utility: UtilityModuleId) => void;
  onOpenSettings: () => void;
}

/**
 * 專屬陪伴大廳（Dashboard）：全站首頁，展示陽的立繪、好感度／HeartPoints，
 * 並作為三大常設關卡的入口。
 */
export function Dashboard({ onEnterModule, onOpenUtility, onOpenSettings }: DashboardProps) {
  const timeOfDay = useTimeOfDay();
  const heartPoints = useProgressStore((s) => s.heartPoints);
  const intimacyLevel = useProgressStore((s) => s.intimacyLevel);

  const [activeGreeting, setActiveGreeting] = useState<Greeting | null>(null);
  const [pokeToken, setPokeToken] = useState(0);

  function handlePoke() {
    const next = greetings[Math.floor(Math.random() * greetings.length)];
    setActiveGreeting(next);
    setPokeToken((t) => t + 1);
    playAudio(greetingAudioUrl(next.id));
    window.setTimeout(() => setActiveGreeting(null), GREETING_DISPLAY_MS);
  }

  return (
    <div className="relative isolate flex h-dvh w-full flex-col items-center overflow-hidden">
      <DashboardBackground timeOfDay={timeOfDay} />

      <TopBar
        heartPoints={heartPoints}
        intimacyLevel={intimacyLevel}
        utilityEntryPoints={utilityEntryPoints}
        onOpenUtility={onOpenUtility}
        onOpenSettings={onOpenSettings}
      />

      <div className="flex min-h-0 w-full flex-1 items-stretch justify-between gap-2 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-8 sm:pb-0">
        <div className="flex min-h-0 flex-1 flex-col items-center gap-2 pt-14 sm:pt-0">
          <div className="relative h-full sm:-translate-x-20">
            <HaruPortrait onPoke={handlePoke} />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 sm:bottom-auto sm:left-full sm:top-10 sm:mb-0 sm:ml-2 sm:translate-x-0">
              <GreetingBubble greeting={activeGreeting} token={pokeToken} />
            </div>
          </div>
        </div>

        <EntryMenu entryPoints={entryPoints} onSelect={onEnterModule} />
      </div>
    </div>
  );
}
