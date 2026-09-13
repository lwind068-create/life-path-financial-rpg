import { useState } from "react";
import { motion } from "framer-motion";

interface SliderChoiceLike {
  id: string;
  label: string;
}

interface BudgetSliderProps {
  /** Exactly 3, left-to-right zones on the track. Position is cosmetic-random per question (see content headers) — never tied to which one is "best." */
  choices: SliderChoiceLike[];
  onSelect: (choiceId: string) => void;
}

const ZONE_COLORS = ["#38bdf8", "#c084fc", "#fbbf24"];

/** A draggable three-zone slider — a different physical gesture than tapping a card, used for a handful of "where does this money go" questions. Still resolves to one of the normal three choices underneath. */
export function BudgetSlider({ choices, onSelect }: BudgetSliderProps) {
  const [value, setValue] = useState(50);
  const [locked, setLocked] = useState(false);
  const zoneIndex = value < 34 ? 0 : value < 67 ? 1 : 2;
  const active = choices[zoneIndex];
  const color = ZONE_COLORS[zoneIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative flex h-3 w-full overflow-hidden rounded-full">
        {ZONE_COLORS.map((c, i) => (
          <div
            key={i}
            className="h-full flex-1 transition-colors duration-200"
            style={{ background: `color-mix(in srgb, ${c} ${i === zoneIndex ? 55 : 18}%, var(--bg-panel-raised))` }}
          />
        ))}
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          disabled={locked}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="Drag to weigh your options"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
        />
        <motion.div
          className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 shadow-lg"
          style={{ left: `${value}%`, background: color, borderColor: "var(--bg-void)" }}
          animate={{ left: `${value}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <motion.div
        key={zoneIndex}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border px-4 py-3.5"
        style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}
      >
        <p className="font-display text-sm leading-snug text-[var(--ink)] sm:text-base">{active.label}</p>
      </motion.div>

      <button
        type="button"
        onClick={() => {
          setLocked(true);
          onSelect(active.id);
        }}
        disabled={locked}
        className="self-start rounded-lg px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: color, color: "var(--bg-void)" }}
      >
        Lock it in
      </button>
    </div>
  );
}
