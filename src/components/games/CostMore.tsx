import { useState } from "react";
import { motion } from "framer-motion";
import { COST_ROUNDS, COST_ROUNDS_PER_GAME, costMoreReward, shuffle, type CostRound } from "../../engine/arcade";
import type { GameResult } from "./types";

const money = (n: number) => `$${n.toLocaleString()}`;

export function CostMore({ onDone }: { onDone: (r: GameResult) => void }) {
  // Each round: pick 5, and randomly flip which side is shown first.
  const [rounds] = useState(() =>
    shuffle(COST_ROUNDS)
      .slice(0, COST_ROUNDS_PER_GAME)
      .map((r) => ({ r, flip: Math.random() < 0.5 })),
  );
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  const [correct, setCorrect] = useState(0);

  const { r, flip } = rounds[i];
  const left = flip ? { label: r.b, total: r.bTotal, side: "b" as const } : { label: r.a, total: r.aTotal, side: "a" as const };
  const right = flip ? { label: r.a, total: r.aTotal, side: "a" as const } : { label: r.b, total: r.bTotal, side: "b" as const };
  const answer: "a" | "b" = r.aTotal > r.bTotal ? "a" : "b";

  const choose = (side: "a" | "b") => {
    if (picked) return;
    setPicked(side);
    if (side === answer) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (i + 1 >= rounds.length) {
      const total = correct;
      onDone({
        score: total,
        reward: costMoreReward(total),
        headline: `${total} / ${rounds.length} right`,
        lines: ["Small things you buy over and over often cost more than one big purchase. Multiply by how often — that's the real price."],
      });
      return;
    }
    setI(i + 1);
    setPicked(null);
  };

  const card = (opt: { label: string; total: number; side: "a" | "b" }, round: CostRound) => {
    const isAnswer = opt.side === answer;
    const showResult = picked !== null;
    return (
      <button
        type="button"
        onClick={() => choose(opt.side)}
        className="flex min-h-28 flex-col justify-between gap-2 rounded-2xl border p-4 text-left"
        style={{
          borderColor: showResult ? (isAnswer ? "var(--stat-savings)" : picked === opt.side ? "var(--stat-debt)" : "var(--hairline)") : "var(--hairline)",
          background: "var(--bg-panel-raised)",
        }}
      >
        <span className="text-sm font-semibold leading-snug text-[var(--ink)]">{opt.label}</span>
        {showResult && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-hud text-lg font-bold" style={{ color: isAnswer ? "var(--stat-savings)" : "var(--ink-dim)" }}>
            {money(opt.total)}
          </motion.span>
        )}
        {showResult && opt.side === "a" && <span className="text-[11px] text-[var(--ink-faint)]">{round.math}</span>}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-hud text-xs font-semibold tracking-wider text-[var(--ink-dim)]">ROUND {i + 1} / {rounds.length}</span>
        <span className="font-hud text-xs font-bold text-[var(--ink)]">{correct} right</span>
      </div>
      <p className="text-base font-bold text-[var(--ink)]">Which costs more?</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {card(left, r)}
        {card(right, r)}
      </div>
      {picked && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-bold" style={{ color: picked === answer ? "var(--stat-savings)" : "var(--stat-debt)" }}>
            {picked === answer ? "Correct! +3" : "Not quite."}
          </span>
          <button type="button" onClick={next} className="rounded-lg px-5 py-2.5 text-sm font-semibold" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
            {i + 1 >= rounds.length ? "See results" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
