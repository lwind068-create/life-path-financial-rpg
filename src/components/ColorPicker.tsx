import { motion } from "framer-motion";
import { ACCENT_OPTIONS } from "../content/characterOptions";
import { PlayerBadge } from "./PlayerBadge";

interface ColorPickerProps {
  name: string;
  accentId: string | null;
  onSelectAccent: (id: string) => void;
  onConfirm: () => void;
}

export function ColorPicker({ name, accentId, onSelectAccent, onConfirm }: ColorPickerProps) {
  const canConfirm = Boolean(accentId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center gap-4">
        <PlayerBadge name={name} size="lg" />
        <div>
          <p className="font-display text-lg font-semibold text-[var(--ink)]">
            Nice to meet you, {name}.
          </p>
          <p className="text-sm text-[var(--ink-dim)]">Pick a color that's yours.</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-display text-xs font-semibold uppercase tracking-wide text-[var(--ink-dim)]">
          Your color
        </span>
        <div className="flex gap-3">
          {ACCENT_OPTIONS.map((accent) => {
            const selected = accent.id === accentId;
            return (
              <motion.button
                key={accent.id}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onSelectAccent(accent.id)}
                aria-label={accent.label}
                className="h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-[var(--bg-panel-solid)] transition-shadow"
                style={{
                  background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})`,
                  // @ts-expect-error CSS custom property in ring color
                  "--tw-ring-color": selected ? accent.primary : "transparent",
                }}
              />
            );
          })}
        </div>
      </div>

      <button
        type="button"
        disabled={!canConfirm}
        onClick={onConfirm}
        className="self-start rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40"
        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
      >
        Let's go
      </button>
    </motion.div>
  );
}
