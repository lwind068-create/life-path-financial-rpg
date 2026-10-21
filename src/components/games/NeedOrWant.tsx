import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BLITZ_ITEMS, BLITZ_SECONDS, blitzReward, shuffle, type BlitzItem } from "../../engine/arcade";
import type { GameResult } from "./types";

export function NeedOrWant({ onDone }: { onDone: (r: GameResult) => void }) {
  const [started, setStarted] = useState(false);
  const [deck, setDeck] = useState<BlitzItem[]>(() => shuffle(BLITZ_ITEMS));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BLITZ_SECONDS);
  const [flash, setFlash] = useState<"right" | "wrong" | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const t = window.setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [started, timeLeft]);

  useEffect(() => {
    if (!started || timeLeft > 0 || finished.current) return;
    finished.current = true;
    onDone({
      score,
      reward: blitzReward(score),
      headline: `${score} sorted right`,
      lines: [
        `${misses} mix-up${misses === 1 ? "" : "s"}.`,
        "Needs keep you housed, fed, healthy and able to work. Everything else is a want — fine in a budget, but it comes after the needs.",
      ],
    });
  }, [started, timeLeft, score, misses, onDone]);

  const answer = (saysNeed: boolean) => {
    if (timeLeft <= 0) return;
    const item = deck[index];
    const right = item.need === saysNeed;
    setFlash(right ? "right" : "wrong");
    window.setTimeout(() => setFlash(null), 220);
    if (right) {
      setScore((s) => s + 1);
      setCombo((c) => c + 1);
    } else {
      setMisses((m) => m + 1);
      setCombo(0);
    }
    if (index + 1 >= deck.length) {
      setDeck(shuffle(BLITZ_ITEMS));
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <p className="text-sm text-[var(--ink-dim)]">
          An expense pops up — is it a <strong className="text-[var(--ink)]">Need</strong> or a <strong className="text-[var(--ink)]">Want</strong>? You have {BLITZ_SECONDS} seconds.
        </p>
        <button type="button" onClick={() => setStarted(true)} className="rounded-xl px-8 py-3 text-base font-bold" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
          Go!
        </button>
      </div>
    );
  }

  const item = deck[index];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-hud text-sm font-bold" style={{ color: timeLeft <= 5 ? "var(--stat-debt)" : "var(--ink-dim)" }}>⏱ {timeLeft}s</span>
        <span className="font-hud text-sm font-bold text-[var(--ink)]">Score {score}</span>
        <span className="font-hud text-sm font-bold" style={{ color: combo >= 3 ? "var(--progress-glow)" : "var(--ink-faint)" }}>
          {combo >= 3 ? `🔥 ${combo} combo` : `combo ${combo}`}
        </span>
      </div>
      <div
        className="flex h-32 items-center justify-center rounded-2xl px-6 text-center transition-colors"
        style={{
          background:
            flash === "right"
              ? "color-mix(in srgb, var(--stat-savings) 22%, var(--bg-panel-raised))"
              : flash === "wrong"
                ? "color-mix(in srgb, var(--stat-debt) 22%, var(--bg-panel-raised))"
                : "var(--bg-panel-raised)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span key={`${index}-${item.label}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.12 }} className="text-xl font-bold text-[var(--ink)]">
            {item.label}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => answer(true)} className="rounded-2xl py-4 text-lg font-extrabold" style={{ background: "color-mix(in srgb, var(--stat-savings) 22%, transparent)", color: "var(--stat-savings)" }}>
          Need
        </button>
        <button type="button" onClick={() => answer(false)} className="rounded-2xl py-4 text-lg font-extrabold" style={{ background: "color-mix(in srgb, var(--stat-stress) 22%, transparent)", color: "var(--stat-stress)" }}>
          Want
        </button>
      </div>
    </div>
  );
}
