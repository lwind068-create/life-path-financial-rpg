import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calculator, Check, Eye, SkipForward, X } from "lucide-react";

interface MathChallengeProps {
  prompt: string;
  answer: number;
  unit?: string;
}

/**
 * Optional quick-math prompt. Never gates progress or affects scoring.
 * A wrong answer says "try again" — the right answer only appears if the
 * player taps "Show answer". "Skip" hides the whole box.
 */
export function MathChallenge({ prompt, answer, unit = "" }: MathChallengeProps) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"open" | "correct" | "wrong" | "revealed" | "skipped">("open");
  const [tries, setTries] = useState(0);

  const check = () => {
    const num = parseFloat(value.replace(/[$,\s]/g, ""));
    if (Number.isNaN(num)) return;
    setTries((t) => t + 1);
    setState(Math.abs(num - answer) < 0.5 ? "correct" : "wrong");
  };

  if (state === "skipped") return null;
  const done = state === "correct" || state === "revealed";

  return (
    <div
      className="flex flex-col gap-2.5 rounded-xl border px-4 py-3.5"
      style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent)" }}>
          <Calculator size={13} strokeWidth={2.25} />
          Quick math (optional)
        </span>
        {!done && (
          <button
            type="button"
            onClick={() => setState("skipped")}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--ink-faint)] transition-colors hover:text-[var(--ink)]"
          >
            <SkipForward size={13} /> Skip
          </button>
        )}
      </div>
      <p className="text-sm text-[var(--ink)]">{prompt}</p>
      {!done && (
        <div className="flex flex-wrap items-center gap-2">
          {unit && <span className="text-sm text-[var(--ink-dim)]">{unit}</span>}
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (state === "wrong") setState("open");
            }}
            onKeyDown={(e) => e.key === "Enter" && check()}
            className="w-28 rounded-lg border px-2.5 py-1.5 text-sm text-[var(--ink)] outline-none"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}
            placeholder="Your answer"
            aria-label="Your answer"
          />
          <button
            type="button"
            onClick={check}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
          >
            Check
          </button>
        </div>
      )}
      <AnimatePresence mode="wait">
        {state === "wrong" && (
          <motion.div
            key={`wrong-${tries}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-3 text-xs font-semibold"
          >
            <span className="flex items-center gap-1" style={{ color: "var(--stat-debt)" }}>
              <X size={14} strokeWidth={2.5} /> Not quite — try again.
            </span>
            <button
              type="button"
              onClick={() => setState("revealed")}
              className="flex items-center gap-1 text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]"
            >
              <Eye size={13} /> Show answer
            </button>
          </motion.div>
        )}
        {state === "correct" && (
          <motion.span
            key="correct"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--stat-savings)" }}
          >
            <Check size={14} strokeWidth={2.5} /> Nailed it — {unit}
            {answer.toLocaleString()}.
          </motion.span>
        )}
        {state === "revealed" && (
          <motion.span key="revealed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[var(--ink-dim)]">
            The answer is {unit}
            {answer.toLocaleString()}.
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
