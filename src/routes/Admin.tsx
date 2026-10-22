// Private stats dashboard. Readable only by the verified admin emails in
// engine/account.ts — firestore.rules enforces the same list server-side,
// so this page shows nothing to anyone else even if they find the URL.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Lock, RefreshCw } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../engine/firebaseClient";
import { useAuthInfo } from "../engine/account";

interface PlayerRow {
  id: string;
  username: string;
  trafficSource: string;
  chaptersCompleted: number;
  completed: boolean;
  avgQualityScore: number | null;
  avgKnowledgeGain: number | null;
  netWorth: number;
  firstSeen: number | null;
  updated: number | null;
}

function toMillis(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "toMillis" in v && typeof (v as { toMillis: () => number }).toMillis === "function")
    return (v as { toMillis: () => number }).toMillis();
  return null;
}

const avg = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => typeof x === "number" && !Number.isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl px-4 py-3" style={{ background: "var(--bg-panel-raised)" }}>
      <span className="text-[11px] uppercase tracking-wide text-[var(--ink-faint)]">{label}</span>
      <span className="font-hud text-2xl font-bold text-[var(--ink)]">{value}</span>
      {note && <span className="text-[11px] text-[var(--ink-faint)]">{note}</span>}
    </div>
  );
}

/** Single-series bar chart: new players per day, last 14 days. Hover a bar for its value. */
function DailyChart({ days }: { days: { label: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 180, padL = 28, padB = 22, padT = 10;
  const max = Math.max(1, ...days.map((d) => d.count));
  const step = (W - padL) / days.length;
  const bw = Math.max(6, step - 6);
  const y = (v: number) => H - padB - (v / max) * (H - padB - padT);
  const ticks = [0, Math.ceil(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="New players per day, last 14 days">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="var(--hairline)" strokeWidth="1" />
            <text x={padL - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--ink-faint)">{t}</text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = padL + i * step + (step - bw) / 2;
          const h = Math.max(0, H - padB - y(d.count));
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={padL + i * step} y={padT} width={step} height={H - padB - padT} fill="transparent" />
              {h > 0 && <path d={`M${x} ${H - padB} V${y(d.count) + 4} Q${x} ${y(d.count)} ${x + 4} ${y(d.count)} H${x + bw - 4} Q${x + bw} ${y(d.count)} ${x + bw} ${y(d.count) + 4} V${H - padB} Z`} fill="var(--accent)" opacity={hover === null || hover === i ? 1 : 0.55} />}
              {(i % 2 === 0 || days.length <= 8) && (
                <text x={padL + i * step + step / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="var(--ink-faint)">{d.label}</text>
              )}
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 rounded-lg border px-2.5 py-1.5 text-xs" style={{ left: `${((padL + hover * step + step / 2) / W) * 100}%`, transform: "translateX(-50%)", borderColor: "var(--hairline)", background: "var(--bg-panel-solid)", color: "var(--ink)" }}>
          <span className="text-[var(--ink-dim)]">{days[hover].label}:</span> <strong>{days[hover].count}</strong> new
        </div>
      )}
    </div>
  );
}

export function Admin() {
  const info = useAuthInfo();
  const [rows, setRows] = useState<PlayerRow[] | null>(null);
  const [usernameCount, setUsernameCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!db) return;
    setLoading(true);
    setError(null);
    try {
      const [players, scores] = await Promise.all([getDocs(collection(db, "players")), getDocs(collection(db, "scores"))]);
      setRows(
        players.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            username: String(x.username ?? ""),
            trafficSource: String(x.trafficSource || "(unknown)"),
            chaptersCompleted: Number(x.chaptersCompleted ?? 0),
            completed: x.completed === true,
            avgQualityScore: typeof x.avgQualityScore === "number" ? x.avgQualityScore : null,
            avgKnowledgeGain: typeof x.avgKnowledgeGain === "number" ? x.avgKnowledgeGain : null,
            netWorth: Number(x.netWorth ?? 0),
            firstSeen: toMillis(x.firstSeenAt),
            updated: toMillis(x.updatedAt),
          };
        }),
      );
      setUsernameCount(scores.size);
    } catch {
      setError("Couldn't load data. Make sure you're logged in with a verified admin email.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (info.isAdmin) void load();
  }, [info.isAdmin]);

  const stats = useMemo(() => {
    if (!rows) return null;
    const finished = rows.filter((r) => r.completed).length;
    const bySource = new Map<string, { players: number; finished: number }>();
    for (const r of rows) {
      const s = bySource.get(r.trafficSource) ?? { players: 0, finished: 0 };
      s.players++;
      if (r.completed) s.finished++;
      bySource.set(r.trafficSource, s);
    }
    const today = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - i));
      return d;
    });
    const key = (d: Date) => d.toDateString();
    const counts = new Map(days.map((d) => [key(d), 0]));
    for (const r of rows) {
      const t = r.firstSeen ?? r.updated;
      if (!t) continue;
      const k = key(new Date(t));
      if (counts.has(k)) counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const gains = rows.map((r) => r.avgKnowledgeGain);
    return {
      players: rows.length,
      finished,
      rate: rows.length ? (finished / rows.length) * 100 : 0,
      gain: avg(gains),
      gainN: gains.filter((g) => g !== null).length,
      quality: avg(rows.map((r) => r.avgQualityScore)),
      sources: [...bySource.entries()].sort((a, b) => b[1].players - a[1].players),
      daily: days.map((d) => ({ label: `${d.getMonth() + 1}/${d.getDate()}`, count: counts.get(key(d)) ?? 0 })),
    };
  }, [rows]);

  const exportCsv = () => {
    if (!rows) return;
    const head = ["id", "username", "trafficSource", "chaptersCompleted", "completed", "avgQualityScore", "avgKnowledgeGain", "netWorth", "firstSeen", "updated"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [r.id, r.username, r.trafficSource, r.chaptersCompleted, r.completed, r.avgQualityScore ?? "", r.avgKnowledgeGain ?? "", r.netWorth, r.firstSeen ? new Date(r.firstSeen).toISOString() : "", r.updated ? new Date(r.updated).toISOString() : ""].map(esc).join(","),
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `life-path-players-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col gap-6 px-5 py-10 sm:py-14">
      <Link to="/account" className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)]">
        <ArrowLeft size={16} strokeWidth={2.5} /> Account
      </Link>
      <h1 className="text-2xl font-extrabold text-[var(--ink)]">Stats dashboard</h1>

      {info.ready && !info.isAdmin && (
        <div className="flex items-center gap-2 rounded-2xl border px-4 py-4 text-sm text-[var(--ink-dim)]" style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}>
          <Lock size={16} /> Private. Log in with a verified admin email on the Account page.
        </div>
      )}

      {info.isAdmin && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => void load()} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold text-[var(--ink)]" style={{ borderColor: "var(--hairline)" }}>
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button type="button" onClick={exportCsv} disabled={!rows} className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold text-[var(--ink)] disabled:opacity-40" style={{ borderColor: "var(--hairline)" }}>
              <Download size={13} /> Download players CSV
            </button>
            <a href="https://vercel.com/lwind068-create/life-path-financial-rpg/analytics" target="_blank" rel="noreferrer" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
              Website views (Vercel) ↗
            </a>
          </div>
          {error && <p className="text-sm" style={{ color: "var(--stat-debt)" }}>{error}</p>}
          {stats && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Tile label="Players" value={String(stats.players)} note={usernameCount !== null ? `${usernameCount} on the leaderboard` : undefined} />
                <Tile label="Finished the story" value={String(stats.finished)} />
                <Tile label="Completion rate" value={`${stats.rate.toFixed(0)}%`} />
                <Tile label="Avg knowledge gain" value={stats.gain === null ? "—" : stats.gain.toFixed(2)} note={`baseline → mirror, n=${stats.gainN}`} />
                <Tile label="Avg decision quality" value={stats.quality === null ? "—" : `${stats.quality.toFixed(2)} / 5`} />
              </div>

              <div className="flex flex-col gap-2 rounded-3xl border p-5" style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}>
                <h2 className="text-sm font-bold text-[var(--ink)]">New players per day · last 14 days</h2>
                <DailyChart days={stats.daily} />
              </div>

              <div className="flex flex-col gap-2 rounded-3xl border p-5" style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}>
                <h2 className="text-sm font-bold text-[var(--ink)]">By traffic source</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--ink-faint)]">
                      <th className="py-1.5 font-semibold">Source</th>
                      <th className="py-1.5 text-right font-semibold">Players</th>
                      <th className="py-1.5 text-right font-semibold">Finished</th>
                      <th className="py-1.5 text-right font-semibold">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.sources.map(([src, s]) => (
                      <tr key={src} className="border-t text-[var(--ink)]" style={{ borderColor: "var(--hairline)" }}>
                        <td className="py-2">{src}</td>
                        <td className="py-2 text-right font-hud">{s.players}</td>
                        <td className="py-2 text-right font-hud">{s.finished}</td>
                        <td className="py-2 text-right font-hud">{s.players ? `${Math.round((s.finished / s.players) * 100)}%` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] leading-relaxed text-[var(--ink-faint)]">
                Players = anyone with at least one finished chapter. Knowledge gain compares each player's answer on a baseline decision with a matching later one. Includes players from before usernames existed.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
