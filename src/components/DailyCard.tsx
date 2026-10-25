import { Link } from "react-router-dom";
import { Flame, Shield, ShoppingBag, Target, Zap } from "lucide-react";
import { useGame } from "../engine/GameContext";
import { dayKey, streakIsAlive } from "../engine/boosts";

/** Home-screen summary: streak, today's quests, active boost - and the way into the shop. */
export function DailyCard() {
  const { profile } = useGame();
  const b = profile.boosts;
  const streak = streakIsAlive(b) ? b.dailyStreak : 0;
  const playedToday = b.lastActiveDay === dayKey();
  const done = b.quests.filter((q) => q.done).length;

  return (
    <Link
      to="/shop"
      className="flex w-full flex-col gap-3 rounded-2xl border px-5 py-4 text-left transition-colors hover:bg-white/5"
      style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-hud flex items-center gap-1.5 text-base font-bold" style={{ color: streak > 0 ? "#ff8a3d" : "var(--ink-faint)" }}>
          <Flame size={18} strokeWidth={2.5} fill={streak > 0 ? "#ff8a3d" : "none"} />
          {streak}-day streak
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--accent)" }}>
          <ShoppingBag size={14} strokeWidth={2.25} />
          Shop &amp; quests →
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold" style={{ background: "var(--bg-panel-solid)", color: "var(--ink)" }}>
          <Target size={12} strokeWidth={2.5} style={{ color: "var(--accent)" }} />
          {done}/3 quests
        </span>
        {b.activeBoost && (
          <span className="font-hud flex items-center gap-1 rounded-full px-2.5 py-1 font-bold" style={{ background: "color-mix(in srgb, var(--progress) 18%, transparent)", color: "var(--progress-glow)" }}>
            <Zap size={12} strokeWidth={2.5} />
            {b.activeBoost.multiplier}× · {b.activeBoost.choicesLeft} left
          </span>
        )}
        {b.streakFreezes > 0 && (
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold" style={{ background: "var(--bg-panel-solid)", color: "#7cc4ff" }}>
            <Shield size={12} strokeWidth={2.5} />
            {b.streakFreezes} freeze{b.streakFreezes > 1 ? "s" : ""}
          </span>
        )}
      </div>
      {!playedToday && (
        <span className="text-xs text-[var(--ink-dim)]">
          {streak > 0 ? "Make one choice today to keep your streak alive." : "Make one choice today to start a streak."}
        </span>
      )}
    </Link>
  );
}
