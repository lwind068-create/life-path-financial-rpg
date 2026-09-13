import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";

interface RivalConfig {
  name: string;
  color: string;
  baseNetWorth: number;
}

/**
 * Fictional in-story peers, not real other players — there's no backend
 * behind this app yet to aggregate real player data against. Their numbers
 * drift a little every few seconds so the board feels alive while you play,
 * same trick as StockTicker.
 */
const RIVALS: RivalConfig[] = [
  { name: "Jordan", color: "var(--accent)", baseNetWorth: 2100 },
  { name: "Sam", color: "var(--stat-savings)", baseNetWorth: 850 },
  { name: "Ade", color: "var(--progress-glow)", baseNetWorth: 3400 },
  { name: "Riley", color: "var(--stat-stress)", baseNetWorth: 400 },
  { name: "Priya", color: "var(--stat-debt)", baseNetWorth: -300 },
];

interface LeaderboardProps {
  playerName: string;
  playerNetWorth: number;
  compact?: boolean;
}

export function Leaderboard({ playerName, playerNetWorth, compact = false }: LeaderboardProps) {
  const [rivalWorths, setRivalWorths] = useState(() => RIVALS.map((r) => r.baseNetWorth));
  const base = useRef(RIVALS.map((r) => r.baseNetWorth));

  useEffect(() => {
    const interval = setInterval(() => {
      setRivalWorths((prev) =>
        prev.map((_v, i) => {
          const drift = (Math.random() - 0.5) * 120;
          return Math.round(base.current[i] + drift);
        }),
      );
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const rows = [
    { name: playerName || "You", color: "var(--accent)", worth: playerNetWorth, isPlayer: true },
    ...RIVALS.map((r, i) => ({ name: r.name, color: r.color, worth: rivalWorths[i], isPlayer: false })),
  ].sort((a, b) => b.worth - a.worth);

  return (
    <div
      className="flex flex-col gap-2.5 rounded-2xl border px-4 py-4 sm:px-5"
      style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}
    >
      <div className="flex items-center gap-2">
        <Trophy size={15} style={{ color: "var(--accent)" }} strokeWidth={2.25} />
        <span className="font-hud text-xs font-semibold uppercase tracking-wider text-[var(--ink-dim)]">
          Leaderboard · net worth
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.slice(0, compact ? 3 : rows.length).map((row, i) => (
          <motion.div
            key={row.name}
            layout
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-3 rounded-xl px-3 py-2"
            style={{
              background: row.isPlayer
                ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                : "var(--bg-panel-solid)",
              boxShadow: row.isPlayer ? "inset 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent)" : undefined,
            }}
          >
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-hud text-xs font-bold"
              style={{ background: "var(--bg-panel-raised)", color: "var(--ink-dim)" }}
            >
              {i === 0 ? <Crown size={13} style={{ color: "var(--accent)" }} /> : i + 1}
            </span>
            <span
              className="flex-1 truncate text-sm font-semibold"
              style={{ color: row.isPlayer ? "var(--ink)" : "var(--ink-dim)" }}
            >
              {row.name}
              {row.isPlayer && <span className="ml-1.5 text-[10px] font-normal text-[var(--ink-faint)]">(you)</span>}
            </span>
            <AnimatedNumber
              value={row.worth}
              prefix="$"
              durationMs={700}
              className="font-hud text-sm font-bold"
              style={{ color: row.color }}
            />
          </motion.div>
        ))}
      </div>
      {!compact && (
        <p className="text-[11px] leading-relaxed text-[var(--ink-faint)]">
          Ranked by savings minus debt across your whole run. The rest of the board is fictional —
          this app doesn't have a live server tracking real players yet.
        </p>
      )}
    </div>
  );
}
