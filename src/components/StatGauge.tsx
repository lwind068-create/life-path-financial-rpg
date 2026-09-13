import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PiggyBank, CreditCard, Activity, type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";

interface StatGaugeProps {
  statKey: "savings" | "debt" | "stress";
  value: number;
  history: number[];
}

interface StatConfig {
  label: string;
  Icon: LucideIcon;
  color: string;
  colorDim: string;
  colorVivid: string;
  min: number;
  max: number;
  prefix: string;
  /** Higher raw value reads as "worse" (debt, stress) vs "better" (savings) — flips the intensity ramp. */
  risingIsBad: boolean;
}

const STAT_CONFIG: Record<StatGaugeProps["statKey"], StatConfig> = {
  savings: {
    label: "Savings",
    Icon: PiggyBank,
    color: "var(--stat-savings)",
    colorDim: "#8fe8c6",
    colorVivid: "#2fe6a4",
    min: -1000,
    max: 2000,
    prefix: "$",
    risingIsBad: false,
  },
  debt: {
    label: "Debt",
    Icon: CreditCard,
    color: "var(--stat-debt)",
    colorDim: "#ffb3c1",
    colorVivid: "#ff2249",
    min: 0,
    max: 1200,
    prefix: "$",
    risingIsBad: true,
  },
  stress: {
    label: "Stress",
    Icon: Activity,
    color: "var(--stat-stress)",
    colorDim: "#dcc9ff",
    colorVivid: "#a259ff",
    min: 0,
    max: 10,
    prefix: "",
    risingIsBad: true,
  },
};

function lerpHex(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const mixed = pa.map((c, i) => Math.round(c + (pb[i] - c) * t));
  return `#${mixed.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function buildSparklinePoints(history: number[], min: number, max: number): string {
  const w = 64;
  const h = 22;
  const span = Math.max(1, max - min);
  const points = history.slice(-8);
  if (points.length < 2) return "";
  return points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const clamped = Math.min(max, Math.max(min, v));
      const y = h - ((clamped - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function StatGauge({ statKey, value, history }: StatGaugeProps) {
  const cfg = STAT_CONFIG[statKey];
  const prevValue = useRef(value);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      setPulsing(true);
      const t = setTimeout(() => setPulsing(false), 700);
      return () => clearTimeout(t);
    }
  }, [value]);

  const clamped = Math.min(cfg.max, Math.max(cfg.min, value));
  const fillPct = ((clamped - cfg.min) / (cfg.max - cfg.min)) * 100;
  const zeroPct = cfg.min < 0 ? (0 - cfg.min) / (cfg.max - cfg.min) * 100 : null;

  const rawIntensity = cfg.max === cfg.min ? 0 : (clamped - Math.max(0, cfg.min)) / (cfg.max - Math.max(0, cfg.min));
  const intensity = Math.min(1, Math.max(0, rawIntensity));
  const numberColor = lerpHex(cfg.colorDim, cfg.colorVivid, cfg.risingIsBad ? intensity : intensity * 0.7 + 0.3);

  const sparkPoints = buildSparklinePoints(history, cfg.min, cfg.max);

  return (
    <div
      className={`relative flex flex-col gap-2 overflow-hidden rounded-2xl border px-3.5 py-3 ${pulsing ? "stat-pulse" : ""}`}
      style={
        {
          borderColor: "var(--hairline)",
          background: `linear-gradient(160deg, color-mix(in srgb, ${cfg.color} 10%, var(--bg-panel-raised)), var(--bg-panel-raised))`,
          "--pulse-color": cfg.color,
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)` }}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <cfg.Icon size={13} style={{ color: cfg.color }} strokeWidth={2.25} />
          <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-dim)]">
            {cfg.label}
          </span>
        </div>
        {sparkPoints && (
          <svg width="48" height="18" viewBox="0 0 64 22" className="opacity-80">
            <polyline
              points={sparkPoints}
              fill="none"
              stroke={cfg.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      <AnimatedNumber
        value={value}
        prefix={cfg.prefix}
        className="font-hud text-xl font-bold sm:text-2xl"
        style={{ color: numberColor }}
      />

      <div className="relative h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-panel-solid)" }}>
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${fillPct}%`, background: cfg.color }}
        />
        {zeroPct !== null && (
          <div
            className="absolute top-0 h-full w-px bg-white/40"
            style={{ left: `${zeroPct}%` }}
          />
        )}
      </div>
    </div>
  );
}
