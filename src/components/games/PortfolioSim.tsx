import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Minus, Play, Plus, TrendingDown } from "lucide-react";
import {
  ASSETS,
  SAVINGS_BASELINE,
  SIM_YEARS,
  START_CASH,
  portfolioReward,
  simulatePortfolio,
  type AssetId,
  type SimYear,
} from "../../engine/arcade";
import type { GameResult } from "./types";

const STEP = 1000;
const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export function PortfolioSim({ onDone }: { onDone: (r: GameResult) => void }) {
  const [alloc, setAlloc] = useState<Record<AssetId, number>>({ savings: 2000, bonds: 2000, index: 4000, hot: 2000 });
  const [years, setYears] = useState<SimYear[] | null>(null);
  const [shown, setShown] = useState(0);
  const remaining = START_CASH - Object.values(alloc).reduce((a, b) => a + b, 0);

  const adjust = (id: AssetId, delta: number) =>
    setAlloc((a) => {
      const next = Math.max(0, Math.min(START_CASH, a[id] + delta));
      const used = Object.values(a).reduce((x, y) => x + y, 0) - a[id] + next;
      return used > START_CASH ? a : { ...a, [id]: next };
    });

  const run = () => {
    setYears(simulatePortfolio(alloc));
    setShown(0);
  };

  useEffect(() => {
    if (!years || shown >= SIM_YEARS) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), 550);
    return () => window.clearTimeout(t);
  }, [years, shown]);

  const done = years !== null && shown >= SIM_YEARS;
  const final = years ? years[SIM_YEARS].total : 0;

  useEffect(() => {
    if (!done || !years) return;
    const { reward, notes } = portfolioReward(alloc, final);
    const crashYears = years.filter((y) => y.crash).length;
    onDone({
      score: final,
      reward,
      headline: `${money(START_CASH)} → ${money(final)}`,
      lines: [
        `A savings account alone would be ${money(SAVINGS_BASELINE)}.`,
        crashYears ? `You lived through ${crashYears} market crash${crashYears > 1 ? "es" : ""}.` : "No market crashes this decade.",
        ...notes,
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const chart = useMemo(() => {
    if (!years) return null;
    const pts = years.slice(0, shown + 1);
    const max = Math.max(START_CASH * 1.5, ...years.map((y) => y.total)) * 1.05;
    const W = 320, H = 150;
    const x = (i: number) => 8 + (i / SIM_YEARS) * (W - 16);
    const y = (v: number) => H - 8 - (v / max) * (H - 16);
    const path = pts.map((p, i) => `${i ? "L" : "M"}${x(p.year).toFixed(1)} ${y(p.total).toFixed(1)}`).join(" ");
    return { W, H, x, y, path, pts, baseY: y(START_CASH) };
  }, [years, shown]);

  if (!years) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--ink-dim)]">
          Split {money(START_CASH)} between four investments, then watch 10 years play out. Crashes happen — how will your mix hold up?
        </p>
        <div className="flex flex-col gap-2">
          {ASSETS.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "var(--bg-panel-raised)" }}>
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: a.color }} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold text-[var(--ink)]">{a.name}</span>
                <span className="text-[11px] text-[var(--ink-faint)]">{a.blurb}</span>
              </div>
              <button type="button" aria-label={`Less ${a.name}`} onClick={() => adjust(a.id, -STEP)} className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--ink)]" style={{ borderColor: "var(--hairline)" }}>
                <Minus size={14} />
              </button>
              <span className="font-hud w-16 text-center text-sm font-bold text-[var(--ink)]">{money(alloc[a.id])}</span>
              <button type="button" aria-label={`More ${a.name}`} onClick={() => adjust(a.id, STEP)} className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--ink)]" style={{ borderColor: "var(--hairline)" }}>
                <Plus size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-panel-raised)" }}>
          {ASSETS.map((a) => (
            <div key={a.id} style={{ width: `${(alloc[a.id] / START_CASH) * 100}%`, background: a.color }} />
          ))}
        </div>
        <button
          type="button"
          onClick={run}
          disabled={remaining !== 0}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          <Play size={16} strokeWidth={2.5} />
          {remaining === 0 ? "Fast-forward 10 years" : remaining > 0 ? `Invest ${money(remaining)} more` : `Over by ${money(-remaining)}`}
        </button>
      </div>
    );
  }

  const current = years[shown];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <span className="font-hud text-xs font-semibold tracking-wider text-[var(--ink-dim)]">YEAR {current.year} / {SIM_YEARS}</span>
        <motion.span key={current.total} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="font-hud text-2xl font-bold" style={{ color: current.total >= START_CASH ? "var(--stat-savings)" : "var(--stat-debt)" }}>
          {money(current.total)}
        </motion.span>
      </div>
      {chart && (
        <svg viewBox={`0 0 ${chart.W} ${chart.H}`} className="w-full rounded-2xl" style={{ background: "var(--bg-panel-raised)" }}>
          <line x1="8" x2={chart.W - 8} y1={chart.baseY} y2={chart.baseY} stroke="var(--hairline)" strokeDasharray="4 4" />
          {chart.pts.filter((p) => p.crash).map((p) => (
            <rect key={p.year} x={chart.x(p.year) - 6} y="4" width="12" height={chart.H - 8} fill="var(--stat-debt)" opacity="0.15" rx="3" />
          ))}
          <path d={chart.path} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={chart.x(current.year)} cy={chart.y(current.total)} r="5" fill="var(--accent)" />
        </svg>
      )}
      <div className="h-6">
        {current.crash && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "var(--stat-debt)" }}>
            <TrendingDown size={16} /> Market crash in year {current.year}!
          </motion.div>
        )}
      </div>
    </div>
  );
}
