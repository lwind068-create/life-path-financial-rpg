import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { PlayerStats, RandomEvent, TickerConfig } from "../content/types";
import { pickAftermath } from "../content/aftermath";
import { StatBar } from "./StatBar";
import { StockTicker } from "./StockTicker";

interface OutcomeAnimationProps {
  /** Choice or QuestionChoice — only `outcomeNarrative`/`financialQualityScore` are used here. */
  choice: { outcomeNarrative: string; financialQualityScore: number };
  statsAfter: PlayerStats;
  statsHistory: PlayerStats[];
  randomEvent: RandomEvent | null;
  /** Optional "months later" settled ticker snapshot for this question. */
  outcomeTickers?: TickerConfig[];
  onContinue: () => void;
}

export function OutcomeAnimation({
  choice,
  statsAfter,
  statsHistory,
  randomEvent,
  outcomeTickers,
  onContinue,
}: OutcomeAnimationProps) {
  // Component remounts fresh on every new outcome (see ChapterScreen's
  // AnimatePresence key), so this re-randomizes each time a choice resolves.
  const [aftermath] = useState(() => pickAftermath(choice.financialQualityScore));
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col gap-5"
    >
      {randomEvent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-start gap-2 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--progress) 40%, transparent)",
            background: "color-mix(in srgb, var(--progress) 12%, transparent)",
            color: "var(--progress-glow)",
          }}
        >
          <Sparkles size={16} className="mt-0.5 shrink-0" strokeWidth={2} />
          {randomEvent.bannerText}
        </motion.div>
      )}

      <p className="font-narrative text-base sm:text-lg leading-relaxed text-[var(--ink)]">
        {choice.outcomeNarrative}
      </p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-sm italic leading-relaxed text-[var(--ink-faint)]"
      >
        {aftermath}
      </motion.p>

      {outcomeTickers && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <StockTicker tickers={outcomeTickers} mode="settled" label="Six months later" />
        </motion.div>
      )}

      {/* Live stat panel — the numbers visibly ticking is the reward moment. */}
      <StatBar stats={statsAfter} history={statsHistory} />

      <button
        type="button"
        onClick={onContinue}
        className="mt-2 self-start rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
      >
        Continue
      </button>
    </motion.div>
  );
}
