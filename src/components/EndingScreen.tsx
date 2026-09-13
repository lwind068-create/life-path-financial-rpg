import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { useNavigate } from "react-router-dom";
import { Sparkles, RotateCcw } from "lucide-react";
import { useGame, useDecisionLog } from "../engine/GameContext";
import {
  computeAverageQualityScore,
  computeKnowledgeGain,
  computeSocialProofPercentile,
} from "../engine/scoring";
import { ShareCard } from "./ShareCard";
import { StatBar } from "./StatBar";
import { PlayerBadge } from "./PlayerBadge";
import { Leaderboard } from "./Leaderboard";

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

  const variant = useMemo(() => {
    const sorted = [...variants].sort((a, b) => b.minAvgQualityScore - a.minAvgQualityScore);
    return (
      sorted.find((v) => (avgScore ?? 0) >= v.minAvgQualityScore) ?? sorted[sorted.length - 1]
    );
  }, [variants, avgScore]);

  // Silent — never rendered. The story has two baseline/mirror pairs now
  // (job_offer/promotion_offer and funding_choice/growth_offer); average
  // both gains for one overall signal. See engine/scoring.ts for the
  // ethical framing and routes/Debug.tsx to inspect the raw data.
  const gainResults = useMemo(() => computeKnowledgeGain(decisionLog, arc), [decisionLog, arc]);
  const validGains = gainResults.map((r) => r.gain).filter((g): g is number => g !== null);
  const avgGain = validGains.length ? validGains.reduce((a, b) => a + b, 0) / validGains.length : null;
  const percentile = computeSocialProofPercentile(avgGain);

  const socialProofLine = `You made stronger long-term calls than ${percentile}% of players.`;
  const netWorth = profile.cumulativeStats.savings - profile.cumulativeStats.debt;

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
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "life-path.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Life-Path",
          text: variant?.headline,
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
          {profile.characterName && <PlayerBadge name={profile.characterName} size="md" />}
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
        <StatBar stats={progress.stats} history={progress.statsHistory} />
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

      <Leaderboard playerName={profile.characterName} playerNetWorth={netWorth} />

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
