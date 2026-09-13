import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Check, X } from "lucide-react";

interface MathChallengeProps {
  prompt: string;
  answer: number;
  unit?: string;
}

/** Small self-checked arithmetic prompt — flavor and engagement only, never gates progress or feeds scoring. */
export function MathChallenge({ prompt, answer, unit = "" }: MathChallengeProps) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState<"correct" | "wrong" | null>(null);

  const check = () => {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return;
    setChecked(Math.abs(num - answer) < 0.5 ? "correct" : "wrong");
  };

  return (
    <div
      className="flex flex-col gap-2.5 rounded-xl border px-4 py-3.5"
      style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}
    >
      <div
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--accent)" }}
      >
        <Calculator size={13} strokeWidth={2.25} />
        Quick math
      </div>
      <p className="text-sm text-[var(--ink)]">{prompt}</p>
      <div className="flex flex-wrap items-center gap-2">
        {unit && <span className="text-sm text-[var(--ink-dim)]">{unit}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setChecked(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && check()}
          className="w-24 rounded-lg border px-2.5 py-1.5 text-sm text-[var(--ink)] outline-none"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}
          placeholder="?"
        />
        <button
          type="button"
          onClick={check}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          Check
        </button>
        {checked === "correct" && (
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--stat-savings)" }}
          >
            <Check size={14} strokeWidth={2.5} /> Nice, exactly right.
          </motion.span>
        )}
        {checked === "wrong" && (
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--stat-debt)" }}
          >
            <X size={14} strokeWidth={2.5} /> Close — it's {unit}
            {answer}.
          </motion.span>
        )}
      </div>
    </div>
  );
}
