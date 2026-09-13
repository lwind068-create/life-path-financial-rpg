import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

interface MenuChoice {
  id: string;
  label: string;
  amount?: number;
  tone?: "positive" | "negative" | "neutral";
}

interface SpendingMenuProps {
  choices: MenuChoice[];
  onSelect: (choiceId: string) => void;
  disabled?: boolean;
}

const TONE_COLOR: Record<string, string> = {
  positive: "var(--stat-savings)",
  negative: "var(--stat-debt)",
  neutral: "var(--ink-dim)",
};
const TONE_ICON = { positive: ArrowUpRight, negative: ArrowDownRight, neutral: Minus };

/** A visual spending menu — price + pos/neg badge per card — used for questions flagged `menuStyle`. Still resolves to a normal choice under the hood. */
export function SpendingMenu({ choices, onSelect, disabled }: SpendingMenuProps) {
  return (
    <div className="flex flex-col gap-3">
      {choices.map((choice) => {
        const tone = choice.tone ?? "neutral";
        const color = TONE_COLOR[tone];
        const Icon = TONE_ICON[tone];
        return (
          <motion.button
            key={choice.id}
            type="button"
            whileHover={disabled ? undefined : { y: -3, transition: { duration: 0.15 } }}
            whileTap={disabled ? undefined : { scale: 0.97, y: 0 }}
            disabled={disabled}
            onClick={() => onSelect(choice.id)}
            className="group flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left text-sm transition-colors hover:border-[var(--slot)] focus-visible:border-[var(--slot)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 sm:text-base"
            style={{ "--slot": color, borderColor: "var(--hairline)", background: "var(--bg-panel-raised)", color: "var(--ink)" } as CSSProperties}
          >
            <span
              className="flex h-10 w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl"
              style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 40%, transparent)` }}
            >
              <Icon size={12} style={{ color }} strokeWidth={2.5} />
              <span className="font-hud text-xs font-bold" style={{ color }}>
                {choice.amount ? `$${Math.abs(choice.amount).toLocaleString()}` : "$0"}
              </span>
            </span>
            <span className="font-display flex-1 leading-snug">{choice.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
