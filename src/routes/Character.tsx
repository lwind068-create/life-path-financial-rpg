import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Lock, Zap } from "lucide-react";
import { useGame } from "../engine/GameContext";
import { ACCENT_OPTIONS, UNLOCKABLE_ACCENTS, type AccentOption, type UnlockableAccent } from "../content/characterOptions";
import { RANKS, getRank, getRankProgress } from "../engine/lifePoints";
import { PlayerBadge } from "../components/PlayerBadge";

function isUnlockable(option: AccentOption | UnlockableAccent): option is UnlockableAccent {
  return "cost" in option;
}

export function Character() {
  const { profile, unlockAccent } = useGame();
  const [shakeId, setShakeId] = useState<string | null>(null);

  const rank = getRank(profile.totalLifePointsEarned);
  const nextRank = RANKS[RANKS.findIndex((r) => r.id === rank.id) + 1] ?? null;
  const rankProgress = getRankProgress(profile.totalLifePointsEarned);

  const allColors: (AccentOption | UnlockableAccent)[] = [...ACCENT_OPTIONS, ...UNLOCKABLE_ACCENTS];

  const handlePick = (option: AccentOption | UnlockableAccent) => {
    const owned = !isUnlockable(option) || profile.unlockedAccentIds.includes(option.id);
    const affordable = isUnlockable(option) ? profile.lifePoints >= option.cost : true;
    if (!owned && !affordable) {
      setShakeId(option.id);
      window.setTimeout(() => setShakeId((cur) => (cur === option.id ? null : cur)), 400);
      return;
    }
    unlockAccent(option.id);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col gap-8 px-5 py-10 sm:py-16">
      <Link
        to="/"
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 rounded-3xl border p-6 shadow-2xl shadow-black/40 sm:p-8"
        style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}
      >
        <div className="flex items-center gap-4">
          <PlayerBadge name={profile.characterName || "?"} size="lg" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">
              {profile.characterName || "Your character"}
            </h1>
            <span
              className="font-display w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
              style={{ background: "color-mix(in srgb, var(--accent) 18%, transparent)", color: "var(--accent)" }}
            >
              {rank.title}
            </span>
          </div>
          <div className="ml-auto flex flex-col items-end gap-0.5">
            <span className="font-hud flex items-center gap-1 text-lg font-bold" style={{ color: "var(--progress)" }}>
              <Zap size={16} strokeWidth={2.5} fill="var(--progress)" />
              {profile.lifePoints}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-[var(--ink-faint)]">Life Points</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-panel-raised)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, var(--progress), var(--progress-glow))" }}
              initial={false}
              animate={{ width: `${(rankProgress ?? 1) * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <span className="text-xs text-[var(--ink-faint)]">
            {nextRank
              ? `${profile.totalLifePointsEarned - rank.threshold} / ${nextRank.threshold - rank.threshold} to ${nextRank.title}`
              : "Top rank reached"}
          </span>
        </div>
      </motion.div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[var(--ink-dim)]">
          Character color
        </h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {allColors.map((option) => {
            const owned = !isUnlockable(option) || profile.unlockedAccentIds.includes(option.id);
            const equipped = profile.accentId === option.id;
            const affordable = isUnlockable(option) ? profile.lifePoints >= option.cost : true;
            const locked = !owned;

            return (
              <motion.button
                key={option.id}
                type="button"
                onClick={() => handlePick(option)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                animate={shakeId === option.id ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
                transition={shakeId === option.id ? { duration: 0.4 } : undefined}
                className="flex flex-col items-center gap-2 rounded-2xl border p-3 text-center"
                style={{
                  borderColor: equipped ? option.primary : "var(--hairline)",
                  background: "var(--bg-panel-raised)",
                  boxShadow: equipped ? `inset 0 0 0 1px ${option.primary}` : undefined,
                  cursor: locked && !affordable ? "not-allowed" : "pointer",
                }}
              >
                <div
                  className="relative flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${option.primary}, ${option.secondary})`,
                    opacity: locked ? 0.45 : 1,
                  }}
                >
                  {locked && <Lock size={16} color="#fff" strokeWidth={2.5} />}
                  {equipped && (
                    <span
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ background: option.primary, color: option.onPrimary }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-[var(--ink)]">{option.label}</span>
                {isUnlockable(option) && !owned && (
                  <span
                    className="font-hud flex items-center gap-0.5 text-[10px] font-bold"
                    style={{ color: affordable ? "var(--progress)" : "var(--ink-faint)" }}
                  >
                    <Zap size={9} strokeWidth={2.5} />
                    {option.cost}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
