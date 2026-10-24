import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { TickerConfig } from "../content/types";
import { AnimatedNumber } from "./AnimatedNumber";

const COLORS = [
  "var(--accent)",
  "var(--stat-savings)",
  "var(--progress-glow)",
  "var(--stat-stress)",
];

interface StockTickerProps {
  tickers: TickerConfig[];
  /** "live" jitters every couple seconds, purely for flavor. "settled" holds still — used on the outcome reveal. */
  mode?: "live" | "settled";
  label?: string;
}

/** Tiny trend line for a ticker's past prices (plus the current price). */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const w = 100;
  const h = 26;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 2 - ((v - min) / span) * (h - 4)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-6 w-full" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * A small trading-floor board. In "live" mode the displayed prices jitter
 * within a tight band every ~1.4s for a "the market never sits still"
 * feel — this motion is cosmetic and never tied to which choice the player
 * picked. In "settled" mode it just renders the given prices once, used to
 * show the "months later" reveal on the outcome screen.
 */
export function StockTicker({ tickers, mode = "live", label }: StockTickerProps) {
  const [prices, setPrices] = useState(() => tickers.map((t) => t.price));
  const [directions, setDirections] = useState(() => tickers.map(() => true));
  const basePrices = useRef(tickers.map((t) => t.price));

  useEffect(() => {
    if (mode !== "live") return;
    const interval = setInterval(() => {
      setPrices((prev) =>
        prev.map((p, i) => {
          const drift = (Math.random() - 0.5) * 0.05;
          const next = Math.max(1, basePrices.current[i] * (1 + drift));
          setDirections((prevDir) => {
            const nextDir = [...prevDir];
            nextDir[i] = next >= p;
            return nextDir;
          });
          return next;
        }),
      );
    }, 1400);
    return () => clearInterval(interval);
  }, [mode]);

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="font-hud text-xs font-semibold uppercase tracking-wider text-[var(--ink-faint)]">
          {label}
        </span>
      )}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {tickers.map((t, i) => {
          const color = COLORS[i % COLORS.length];
          const first = t.history?.[0];
          const change = first ? ((prices[i] - first) / first) * 100 : null;
          const up = change !== null ? change >= 0 : directions[i];
          return (
            <div
              key={t.symbol}
              className="flex flex-col gap-1 rounded-xl border px-3 py-2.5"
              style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}
            >
              <div className="flex items-center justify-between">
                <span className="font-hud text-xs font-bold tracking-wide" style={{ color }}>
                  {t.symbol}
                </span>
                <motion.span
                  key={mode === "live" ? `${i}-${up}` : `${i}-settled`}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ color: up ? "var(--stat-savings)" : "var(--stat-debt)" }}
                >
                  {up ? <TrendingUp size={13} strokeWidth={2.25} /> : <TrendingDown size={13} strokeWidth={2.25} />}
                </motion.span>
              </div>
              <span className="truncate text-[11px] text-[var(--ink-faint)]">{t.name}</span>
              <div className="flex items-baseline justify-between gap-2">
                <AnimatedNumber
                  value={Math.round(prices[i])}
                  prefix="$"
                  durationMs={mode === "live" ? 900 : 1200}
                  className="font-hud text-base font-bold text-[var(--ink)]"
                />
                {change !== null && (
                  <span className="font-hud text-[11px] font-bold" style={{ color: change >= 0 ? "var(--stat-savings)" : "var(--stat-debt)" }}>
                    {change >= 0 ? "+" : ""}
                    {Math.round(change)}%
                  </span>
                )}
              </div>
              {t.history && <Sparkline values={[...t.history, prices[i]]} color={change !== null && change < 0 ? "var(--stat-debt)" : "var(--stat-savings)"} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
