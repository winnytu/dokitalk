import { motion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right";

interface DirectionPadProps {
  onMove: (dir: Direction) => void;
  disabled?: boolean;
}

const BUTTONS: { dir: Direction; label: string; pos: string }[] = [
  { dir: "up", label: "↑", pos: "col-start-2 row-start-1" },
  { dir: "left", label: "←", pos: "col-start-1 row-start-2" },
  { dir: "right", label: "→", pos: "col-start-3 row-start-2" },
  { dir: "down", label: "↓", pos: "col-start-2 row-start-3" },
];

export function DirectionPad({ onMove, disabled }: DirectionPadProps) {
  return (
    <div className="grid w-fit touch-none select-none grid-cols-3 grid-rows-3 gap-0.5 sm:gap-1">
      {BUTTONS.map(({ dir, label, pos }) => (
        <motion.button
          key={dir}
          type="button"
          disabled={disabled}
          onClick={() => onMove(dir)}
          onContextMenu={(e) => e.preventDefault()}
          whileHover={disabled ? undefined : { scale: 1.1 }}
          whileTap={disabled ? undefined : { scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={`${pos} flex h-9 w-9 select-none items-center justify-center rounded-2xl bg-white/70 text-lg font-bold text-text-main shadow-peach backdrop-blur-sm disabled:opacity-40 sm:h-12 sm:w-12 sm:text-xl`}
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
}
