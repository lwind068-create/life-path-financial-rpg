import { motion } from "framer-motion";
import type { CSSProperties } from "react";

interface ChoiceButtonProps {
  /** Choice or QuestionChoice — only `id`/`label` are used here. */
  choice: { id: string; label: string };
  index: number;
  onSelect: (choiceId: string) => void;
  disabled?: boolean;
}

// Purely cosmetic, index-based — cycles the same 3 hues in the same order
// on every choice screen, unrelated to financialQualityScore. Never let
// this rotation correlate with quality: it would leak the "right answer."
const SLOT_COLORS = ["#38bdf8", "#c084fc", "#fbbf24"];
const SLOT_LETTERS = ["A", "B", "C"];

// Note: financialQualityScore intentionally never touches this component's
// rendering — the player sees only the label, in a neutral, unranked list.
export function ChoiceButton({ choice, index, onSelect, disabled }: ChoiceButtonProps) {
  const slot = SLOT_COLORS[index % SLOT_COLORS.length];
  const letter = SLOT_LETTERS[index % SLOT_LETTERS.length];

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -3, transition: { duration: 0.15 } }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 0 }}
      disabled={disabled}
      onClick={() => onSelect(choice.id)}
      className="group flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left text-sm transition-colors hover:border-[var(--slot)] focus-visible:border-[var(--slot)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 sm:text-base"
      style={
        {
          "--slot": slot,
          borderColor: "var(--hairline)",
          background: "var(--bg-panel-raised)",
          color: "var(--ink)",
        } as CSSProperties
      }
    >
      <span
        className="font-hud flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-transform group-hover:scale-110"
        style={{
          color: slot,
          background: `color-mix(in srgb, ${slot} 18%, transparent)`,
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${slot} 45%, transparent)`,
        }}
      >
        {letter}
      </span>
      <span className="font-display flex-1 leading-snug">{choice.label}</span>
      <span
        className="text-lg opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        style={{ color: slot }}
        aria-hidden="true"
      >
        →
      </span>
    </motion.button>
  );
}
