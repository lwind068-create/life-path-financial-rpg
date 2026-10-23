import { useState } from "react";

export interface MoneyPoint {
  label: string;
  cash: number;
  savings: number;
  debt: number;
}

const SERIES = [
  { key: "savings", label: "Savings", color: "var(--stat-savings)" },
  { key: "cash", label: "Cash", color: "#7cc4ff" },
  { key: "debt", label: "Debt", color: "var(--stat-debt)" },
] as const;

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

/** Line chart of cash, savings and debt at the start of each chapter. Hover/tap a point for values. */
export function MoneyChart({ points }: { points: MoneyPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length < 2) return null;
  const W = 340, H = 150, padL = 40, padR = 54, padT = 10, padB = 22;
  const max = Math.max(1000, ...points.flatMap((p) => [p.cash, p.savings, p.debt])) * 1.1;
  const x = (i: number) => padL + (i / (points.length - 1)) * (W - padL - padR);
  const y = (v: number) => H - padB - (Math.max(0, v) / max) * (H - padT - padB);
  const ticks = [0, max / 2, max].map((t) => Math.round(t / 100) * 100);
  const last = points.length - 1;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3 text-[11px] text-[var(--ink-dim)]">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{ background: s.color }} /> {s.label}
          </span>
        ))}
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Your cash, savings and debt over time">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--hairline)" strokeWidth="1" />
              <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="var(--ink-faint)">
                {t >= 1000 ? `$${Math.round(t / 1000)}k` : `$${t}`}
              </text>
            </g>
          ))}
          {points.map((p, i) => {
            // Keep x labels readable: show about six, always including the last.
            const step = Math.ceil(points.length / 6);
            if (i % step !== 0 && i !== points.length - 1) return null;
            if (i !== points.length - 1 && points.length - 1 - i < step) return null;
            return (
              <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--ink-faint)">
                {p.label}
              </text>
            );
          })}
          {SERIES.map((s) => (
            <g key={s.key}>
              <polyline
                points={points.map((p, i) => `${x(i)},${y(p[s.key])}`).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx={x(last)} cy={y(points[last][s.key])} r="4" fill={s.color} stroke="var(--bg-panel-solid)" strokeWidth="2" />
              <text x={x(last) + 8} y={y(points[last][s.key]) + 3} fontSize="9" fill="var(--ink-dim)">
                {money(points[last][s.key])}
              </text>
            </g>
          ))}
          {points.map((_, i) => (
            <rect
              key={i}
              x={x(i) - (W - padL - padR) / (points.length - 1) / 2}
              y={padT}
              width={(W - padL - padR) / (points.length - 1)}
              height={H - padT - padB}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setHover(hover === i ? null : i)}
            />
          ))}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="var(--ink-faint)" strokeDasharray="3 3" pointerEvents="none" />}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 rounded-lg border px-2.5 py-1.5 text-[11px]"
            style={{
              left: `${(x(hover) / W) * 100}%`,
              transform: hover > last / 2 ? "translateX(-105%)" : "translateX(5%)",
              borderColor: "var(--hairline)",
              background: "var(--bg-panel-solid)",
              color: "var(--ink)",
            }}
          >
            <div className="font-semibold">{points[hover].label}</div>
            {SERIES.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5">
                <span className="h-0.5 w-2.5 rounded" style={{ background: s.color }} />
                {s.label}: {money(points[hover][s.key])}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
