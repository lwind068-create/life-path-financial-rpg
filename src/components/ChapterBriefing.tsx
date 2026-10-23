import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Globe, Target } from "lucide-react";
import type { Chapter, PlayerStats } from "../content/types";
import type { LedgerLine } from "../engine/money";
import { netWorth } from "../engine/money";
import { ChapterIcon } from "./ChapterIcon";
import { MoneyChart, type MoneyPoint } from "./MoneyChart";
import { StatBar } from "./StatBar";

const money = (n: number) => `${n < 0 ? "−" : "+"}$${Math.abs(Math.round(n)).toLocaleString()}`;

interface Props {
  chapter: Chapter;
  chapterNumber: number;
  chapterTitle: string;
  icon: string;
  ledger: LedgerLine[];
  stats: PlayerStats;
  statsHistory: PlayerStats[];
  moneyHistory: MoneyPoint[];
  onStart: () => void;
}

/** Opens every chapter: what's going on, what changed money-wise (and why), your goal, key terms. */
export function ChapterBriefing({ chapter, chapterNumber, chapterTitle, icon, ledger, stats, statsHistory, moneyHistory, onStart }: Props) {
  const b = chapter.briefing;
  if (!b) return null;
  const because = ledger.filter((l) => l.because);
  const regular = ledger.filter((l) => !l.because);

  const lineColor = (l: LedgerLine) => {
    const good = l.target === "debt" ? l.amount < 0 : l.amount > 0;
    return l.amount === 0 ? "var(--ink-dim)" : good ? "var(--stat-savings)" : "var(--stat-debt)";
  };
  const where = (l: LedgerLine) => (l.target === "savings" ? " (savings)" : l.target === "debt" ? " (debt)" : "");

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-5 px-5 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 rounded-3xl border p-6 shadow-2xl shadow-black/40 sm:p-8"
        style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)" }}
          >
            <ChapterIcon name={icon} size={28} />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              Chapter {chapterNumber}: {chapterTitle}
            </span>
            <h1 className="text-2xl font-extrabold text-[var(--ink)]">{chapter.title}</h1>
            <span className="text-xs text-[var(--ink-dim)]">{b.when}</span>
          </div>
        </div>

        <p className="font-narrative text-base leading-relaxed text-[var(--ink)] sm:text-lg">{b.situation}</p>

        {because.length > 0 && (
          <div className="flex flex-col gap-2 rounded-2xl border p-4" style={{ borderColor: "color-mix(in srgb, var(--progress) 40%, transparent)", background: "color-mix(in srgb, var(--progress) 8%, transparent)" }}>
            <span className="font-hud text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--progress-glow)" }}>
              Because of your earlier choices
            </span>
            {because.map((l, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-[var(--ink)]">{l.label}</span>
                {l.amount !== 0 && (
                  <span className="font-hud shrink-0 font-bold" style={{ color: lineColor(l) }}>
                    {money(l.target === "debt" ? -l.amount : l.amount)}
                    {where(l)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {regular.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="font-hud text-[11px] font-bold uppercase tracking-wider text-[var(--ink-dim)]">Since last chapter</span>
            {regular.map((l, i) => (
              <div key={i} className="flex items-start justify-between gap-3 border-b pb-1.5 text-sm" style={{ borderColor: "var(--hairline)" }}>
                <span className="text-[var(--ink-dim)]">{l.label}</span>
                <span className="font-hud shrink-0 font-bold" style={{ color: lineColor(l) }}>
                  {l.target === "debt" ? `+$${Math.round(l.amount).toLocaleString()} (debt)` : `${money(l.amount)}${where(l)}`}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="font-hud text-[11px] font-bold uppercase tracking-wider text-[var(--ink-dim)]">Your money now</span>
            <span className="text-xs text-[var(--ink-dim)]">
              Net worth <strong className="text-[var(--ink)]">${netWorth(stats).toLocaleString()}</strong>
            </span>
          </div>
          <StatBar stats={stats} history={statsHistory} />
        </div>

        {moneyHistory.length >= 2 && (
          <div className="flex flex-col gap-2 rounded-2xl p-4" style={{ background: "var(--bg-panel-raised)" }}>
            <span className="font-hud text-[11px] font-bold uppercase tracking-wider text-[var(--ink-dim)]">Your money over time</span>
            <MoneyChart points={moneyHistory} />
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-2xl p-4" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>
          <Target size={18} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
          <p className="text-sm leading-relaxed text-[var(--ink)]">
            <strong>This chapter:</strong> {b.goal}
          </p>
        </div>

        {b.trend && (
          <div className="flex items-start gap-2.5 rounded-2xl border p-4" style={{ borderColor: "var(--hairline)" }}>
            <Globe size={18} className="mt-0.5 shrink-0 text-[var(--ink-dim)]" />
            <p className="text-sm leading-relaxed text-[var(--ink-dim)]">
              <strong className="text-[var(--ink)]">In real life:</strong> {b.trend}
            </p>
          </div>
        )}

        {b.terms && b.terms.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 font-hud text-[11px] font-bold uppercase tracking-wider text-[var(--ink-dim)]">
              <BookOpen size={13} /> Words to know
            </span>
            <dl className="flex flex-col gap-2">
              {b.terms.map((t) => (
                <div key={t.term} className="rounded-xl px-3.5 py-2.5" style={{ background: "var(--bg-panel-raised)" }}>
                  <dt className="text-sm font-bold text-[var(--ink)]">{t.term}</dt>
                  <dd className="text-sm leading-relaxed text-[var(--ink-dim)]">{t.meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <button
          type="button"
          onClick={onStart}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          Start chapter <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </motion.div>
    </div>
  );
}
