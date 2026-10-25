import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { useNavigate } from "react-router-dom";
import { Sparkles, RotateCcw } from "lucide-react";
import { useGame, useDecisionLog } from "../engine/GameContext";
import {
  computeAverageQualityScore,
} from "../engine/scoring";
import { ShareCard } from "./ShareCard";
import { MoneyChart } from "./MoneyChart";
import { StatBar } from "./StatBar";
import { PlayerBadge } from "./PlayerBadge";
import { getFrame } from "../content/characterOptions";
import { Leaderboard } from "./Leaderboard";
import { track } from "../engine/analytics";
import { netWorth as calcNetWorth } from "../engine/money";

const SPARKLE_COLORS = ["var(--progress)", "var(--accent)", "var(--progress-glow)"];

export function EndingScreen() {
  const { arc, profile, progress, resetStoryProgress, resetEverything } = useGame();
  const navigate = useNavigate();
  const decisionLog = useDecisionLog();
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const endingChapter = useMemo(
    () => Object.values(arc.chapters).find((c) => c.isEnding),
    [arc],
  );
  const variants = endingChapter?.endingVariants ?? [];

  const avgScore = useMemo(() => computeAverageQualityScore(decisionLog, arc.id), [decisionLog, arc.id]);

  const finalNetWorth = calcNetWorth(progress.stats);
  const variant = useMemo(() => {
    // A big exit (startup, company stock, business sale) earns its own headline.
    if (finalNetWorth >= 1_000_000) {
      return {
        id: "millionaire",
        minAvgQualityScore: 0,
        headline: `Millionaire by 32 — $${(finalNetWorth / 1_000_000).toFixed(1)}M`,
        narrative:
          "Your earlier choices set this up: the savings cushion that let you take a smart risk, and the moves that made the risk worth taking. Plenty of people take the same shot and get $0 — you gave yourself better odds.",
      };
    }
    const sorted = [...variants].sort((a, b) => b.minAvgQualityScore - a.minAvgQualityScore);
    return (
      sorted.find((v) => (avgScore ?? 0) >= v.minAvgQualityScore) ?? sorted[sorted.length - 1]
    );
  }, [variants, avgScore, finalNetWorth]);

  // "If you keep these habits": grow today's net worth plus yearly saving
  // habits (from flags) at 7% a year from age 32 to 60. An estimate, labeled as one.
  const projection = useMemo(() => {
    const perStretch: Record<string, number> = { auto_save: 400, raise_saved: 700, raise_half: 350, roth_ira: 200, index_auto: 150, job_harbor: 290, espp_buy: 450, biz_cushion: 150 };
    const yearly = progress.flags.reduce((sum, f) => sum + (perStretch[f] ?? 0) * 6, 0);
    const years = 28;
    const growth = Math.pow(1.07, years);
    const value = Math.max(0, finalNetWorth) * growth + yearly * ((growth - 1) / 0.07);
    return { yearly, value: Math.round(value / 1000) * 1000 };
  }, [progress.flags, finalNetWorth]);

  // Real numbers only — no invented comparison to other players. The two
  // baseline/mirror measurement chapters are left out, matching how Life
  // Points treat them, so the card never hints at how those are scored.
  const visibleDecisions = decisionLog.filter((d) => {
    const ch = arc.chapters[d.chapterId];
    return d.arcId === arc.id && !(ch?.isBaselineChoice || ch?.isMirrorChoice);
  });
  const smartMoves = visibleDecisions.filter((d) => d.financialQualityScore >= 4).length;
  const visibleAvg = visibleDecisions.length
    ? visibleDecisions.reduce((sum, d) => sum + d.financialQualityScore, 0) / visibleDecisions.length
    : null;
  const socialProofLine =
    visibleAvg !== null
      ? `Money-move score: ${visibleAvg.toFixed(1)} / 5 · ${smartMoves} smart moves`
      : `${smartMoves} smart money moves`;
  const netWorth = calcNetWorth(profile.cumulativeStats);

  // Remote per-player summary logging (see logPlayerSummary.ts) now happens
  // centrally in GameContext after every chapter — including this one,
  // since reaching the ending is itself just "the last chapter completed."
  // Nothing to trigger from here.

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${profile.characterName || "my"}-life-path.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    track("ending_shared");
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "life-path.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Life-Path",
          text: `${variant?.headline ?? "My Life-Path"} — play yours free at lifepathgame.org`,
        });
        return;
      }
    } catch {
      // fall through to download
    }
    handleDownload();
  };

  if (!variant) return null;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-5 py-10 sm:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-8 overflow-hidden opacity-80">
        {SPARKLE_COLORS.map((color, i) => (
          <motion.span
            key={color}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 20, opacity: [0, 1, 0] }}
            transition={{ duration: 2.4, delay: i * 0.3, repeat: Infinity, repeatDelay: 1.6 }}
          >
            <Sparkles size={20} color={color} strokeWidth={2} />
          </motion.span>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {profile.characterName && <PlayerBadge name={profile.characterName} size="md" frame={getFrame(profile.frameId)} />}
          <span
            className="font-display text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            {profile.characterName || "Your"}'s story — where it lands
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">{variant.headline}</h1>
        <p className="font-narrative text-base sm:text-lg leading-relaxed text-[var(--ink)]">
          {variant.narrative}
        </p>
        <div className="rounded-2xl border p-4" style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)", background: "color-mix(in srgb, var(--accent) 8%, transparent)" }}>
          <span className="font-hud text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">If you keep these habits until 60</span>
          <p className="mt-1 text-2xl font-extrabold text-[var(--ink)]">≈ ${projection.value.toLocaleString()}</p>
          <p className="text-xs leading-relaxed text-[var(--ink-dim)]">
            {projection.yearly > 0
              ? `Your saving habits put away about $${projection.yearly.toLocaleString()} a year. Estimate assumes 7% average yearly growth — real returns go up and down.`
              : "You didn't set up any automatic saving or investing. Even $200 a month from age 32 could grow to about $230,000 by 60 at 7% a year."}
          </p>
        </div>
        <StatBar stats={progress.stats} history={progress.statsHistory} />
        {progress.ledger.some((l) => l.because) && (
          <div className="flex flex-col gap-2 rounded-2xl border p-4" style={{ borderColor: "color-mix(in srgb, var(--progress) 40%, transparent)", background: "color-mix(in srgb, var(--progress) 8%, transparent)" }}>
            <span className="font-hud text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--progress-glow)" }}>
              How your choices played out
            </span>
            {progress.ledger
              .filter((l) => l.because)
              .map((l, i) => (
                <div key={i} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-[var(--ink)]">{l.label}</span>
                  {l.amount !== 0 && (
                    <span className="font-hud shrink-0 font-bold" style={{ color: (l.target === "debt" ? l.amount < 0 : l.amount > 0) ? "var(--stat-savings)" : "var(--stat-debt)" }}>
                      {l.amount > 0 ? "+" : "−"}${Math.abs(l.amount).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}
        {progress.moneyHistory.length >= 2 && (
          <div className="flex flex-col gap-2 rounded-2xl p-4" style={{ background: "var(--bg-panel-raised)" }}>
            <span className="font-hud text-[11px] font-bold uppercase tracking-wider text-[var(--ink-dim)]">Your money, start to finish</span>
            <MoneyChart points={progress.moneyHistory} />
          </div>
        )}
      </div>

      <div
        className="flex flex-col items-center gap-4 rounded-3xl border p-6 shadow-2xl shadow-black/30"
        style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}
      >
        <ShareCard
          ref={cardRef}
          characterName={profile.characterName || "You"}
          accentId={profile.accentId}
          headline={variant.headline}
          socialProofLine={socialProofLine}
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            disabled={downloading}
          >
            Share
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-white/5 disabled:opacity-50"
            style={{ borderColor: "var(--hairline)" }}
            disabled={downloading}
          >
            {downloading ? "Saving…" : "Download image"}
          </button>
        </div>
      </div>

      <Leaderboard playerName={profile.username || profile.characterName} playerNetWorth={netWorth} playerLifePoints={profile.totalLifePointsEarned} />

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            resetStoryProgress();
            navigate("/play");
          }}
          className="flex items-center justify-center gap-2 self-start rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          <RotateCcw size={15} strokeWidth={2.25} />
          Play again with different choices
        </button>
        <button
          type="button"
          onClick={() => {
            resetEverything();
            navigate("/");
          }}
          className="self-start rounded-lg border px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-white/5"
          style={{ borderColor: "var(--hairline)" }}
        >
          Start over as a new character
        </button>
      </div>
    </div>
  );
}
