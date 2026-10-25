import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Flame, Gamepad2, Landmark, Rocket, Shield, Shuffle, Sparkles, Target, Zap } from "lucide-react";
import { useGame } from "../engine/GameContext";
import {
  ALL_QUESTS_BONUS,
  BOOSTS,
  MAX_FREEZES,
  STREAK_MILESTONES,
  VAULT_DAILY_CAP,
  VAULT_RATE,
  getQuestDef,
  streakIsAlive,
  type BoostId,
  type BuyError,
} from "../engine/boosts";

const BOOST_ICONS: Record<BoostId, typeof Zap> = {
  double: Zap,
  triple: Rocket,
  freeze: Shield,
  refresh: Shuffle,
};

const ERROR_TEXT: Record<BuyError, string> = {
  cant_afford: "Not enough Life Points yet. Make some smart choices first.",
  already_active: "You already have a points boost running. Use it up first.",
  max_freezes: `You can hold up to ${MAX_FREEZES} Streak Freezes.`,
  nothing_to_refresh: "All of today's quests are already done!",
  unknown: "Something went wrong.",
};

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-3xl border p-5 sm:p-6 ${className}`}
      style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Zap; children: React.ReactNode }) {
  return (
    <h2 className="font-display flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--ink-dim)]">
      <Icon size={15} strokeWidth={2.5} style={{ color: "var(--accent)" }} />
      {children}
    </h2>
  );
}

export function Shop() {
  const { profile, buyBoostItem, vaultDeposit, vaultWithdraw } = useGame();
  const [message, setMessage] = useState<{ id: string; text: string } | null>(null);
  const b = profile.boosts;
  const alive = streakIsAlive(b);
  const streak = alive ? b.dailyStreak : 0;
  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > streak);
  const doneCount = b.quests.filter((q) => q.done).length;
  const interestPreview = b.vault > 0 ? Math.min(VAULT_DAILY_CAP, Math.max(1, Math.round(b.vault * VAULT_RATE))) : 0;

  const buy = (id: BoostId) => {
    const err = buyBoostItem(id);
    setMessage({ id, text: err ? ERROR_TEXT[err] : "Activated!" });
    window.setTimeout(() => setMessage((m) => (m?.id === id ? null : m)), 2600);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col gap-6 px-5 py-10 sm:py-14">
      <Link
        to="/"
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        Home
      </Link>

      {/* Header: balance, streak, active boost */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Panel>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-extrabold text-[var(--ink)]">Shop &amp; Quests</h1>
              <p className="text-sm text-[var(--ink-dim)]">Spend Life Points on boosts. Come back every day to keep your streak.</p>
            </div>
            <div className="flex shrink-0 flex-col items-end">
              <span className="font-hud flex items-center gap-1 text-xl font-bold" style={{ color: "var(--progress)" }}>
                <Zap size={17} strokeWidth={2.5} fill="var(--progress)" />
                {profile.lifePoints}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-[var(--ink-faint)]">Life Points</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-2xl px-2 py-3" style={{ background: "var(--bg-panel-raised)" }}>
              <span className="font-hud flex items-center gap-1 text-lg font-bold" style={{ color: streak > 0 ? "#ff8a3d" : "var(--ink-faint)" }}>
                <Flame size={16} strokeWidth={2.5} fill={streak > 0 ? "#ff8a3d" : "none"} />
                {streak}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-[var(--ink-faint)]">Day streak</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-2xl px-2 py-3" style={{ background: "var(--bg-panel-raised)" }}>
              <span className="font-hud flex items-center gap-1 text-lg font-bold" style={{ color: "#7cc4ff" }}>
                <Shield size={16} strokeWidth={2.5} />
                {b.streakFreezes}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-[var(--ink-faint)]">Freezes</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-2xl px-2 py-3" style={{ background: "var(--bg-panel-raised)" }}>
              <span className="font-hud text-lg font-bold" style={{ color: b.activeBoost ? "var(--progress-glow)" : "var(--ink-faint)" }}>
                {b.activeBoost ? `${b.activeBoost.multiplier}×` : "-"}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-[var(--ink-faint)]">
                {b.activeBoost ? `${b.activeBoost.choicesLeft} choices left` : "No boost"}
              </span>
            </div>
          </div>
          {nextMilestone && (
            <p className="text-xs text-[var(--ink-faint)]">
              Reach a {nextMilestone.days}-day streak for +{nextMilestone.reward} bonus Life Points.
            </p>
          )}
        </Panel>
      </motion.div>

      {/* Daily quests */}
      <Panel>
        <div className="flex items-center justify-between">
          <SectionTitle icon={Target}>Today's quests</SectionTitle>
          <span className="font-hud text-xs font-bold text-[var(--ink-dim)]">{doneCount}/3</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {b.quests.map((q) => {
            const def = getQuestDef(q.id);
            if (!def) return null;
            const pct = Math.min(1, q.progress / def.target);
            return (
              <div key={q.id} className="flex flex-col gap-1.5 rounded-2xl px-4 py-3" style={{ background: "var(--bg-panel-raised)" }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: q.done ? "var(--ink-dim)" : "var(--ink)" }}>
                    {q.done && <Check size={14} strokeWidth={3} style={{ color: "var(--accent)" }} />}
                    {def.label}
                  </span>
                  <span className="font-hud flex items-center gap-0.5 text-xs font-bold" style={{ color: "var(--progress)" }}>
                    <Zap size={11} strokeWidth={2.5} />+{def.reward}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-panel-solid)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: q.done ? "var(--accent)" : "linear-gradient(90deg, var(--progress), var(--progress-glow))" }}
                    initial={false}
                    animate={{ width: `${pct * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-[var(--ink-faint)]">
                  {q.progress}/{def.target}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[var(--ink-faint)]">
          {b.allQuestsBonusClaimed
            ? "All done for today, new quests tomorrow."
            : `Finish all three for a +${ALL_QUESTS_BONUS} bonus. New quests every day.`}
        </p>
      </Panel>

      {/* Boosts */}
      <Panel>
        <SectionTitle icon={Sparkles}>Boosts</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {BOOSTS.map((boost) => {
            const Icon = BOOST_ICONS[boost.id];
            const affordable = profile.lifePoints >= boost.cost;
            const isRunning = (boost.id === "double" || boost.id === "triple") && b.activeBoost?.id === boost.id;
            return (
              <div
                key={boost.id}
                className="flex flex-col gap-2 rounded-2xl border p-4"
                style={{
                  borderColor: isRunning ? "var(--progress)" : "var(--hairline)",
                  background: "var(--bg-panel-raised)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "color-mix(in srgb, var(--progress) 16%, transparent)", color: "var(--progress-glow)" }}
                  >
                    <Icon size={18} strokeWidth={2.25} />
                  </span>
                  <span className="text-sm font-bold text-[var(--ink)]">{boost.name}</span>
                  {boost.id === "freeze" && (
                    <span className="ml-auto text-[11px] text-[var(--ink-faint)]">
                      {b.streakFreezes}/{MAX_FREEZES} held
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-[var(--ink)]">{boost.effect}</p>
                <p className="text-[11px] leading-relaxed text-[var(--ink-faint)]">{boost.why}</p>
                <button
                  type="button"
                  onClick={() => buy(boost.id)}
                  className="font-hud mt-1 flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-bold transition-opacity hover:opacity-90"
                  style={{
                    background: affordable ? "var(--progress)" : "var(--bg-panel-solid)",
                    color: affordable ? "var(--progress-ink)" : "var(--ink-faint)",
                  }}
                >
                  <Zap size={13} strokeWidth={2.5} />
                  {isRunning ? "Running" : boost.cost}
                </button>
                {message?.id === boost.id && (
                  <span className="text-[11px]" style={{ color: message.text === "Activated!" ? "var(--accent)" : "var(--stat-debt)" }}>
                    {message.text}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Savings Vault */}
      <Panel>
        <SectionTitle icon={Landmark}>Savings Vault</SectionTitle>
        <p className="text-sm leading-relaxed text-[var(--ink-dim)]">
          Park Life Points here and they earn <strong className="text-[var(--ink)]">{Math.round(VAULT_RATE * 100)}% interest</strong> every
          day you play (up to {VAULT_DAILY_CAP} a day). Interest earns interest too: that's compound interest, the same thing that grows
          real savings.
        </p>
        <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "var(--bg-panel-raised)" }}>
          <div className="flex flex-col">
            <span className="font-hud flex items-center gap-1 text-xl font-bold" style={{ color: "var(--stat-savings)" }}>
              <Zap size={16} strokeWidth={2.5} />
              {b.vault}
            </span>
            <span className="text-[11px] text-[var(--ink-faint)]">
              {b.vault > 0 ? `+${interestPreview} next day you play` : "Empty"}
            </span>
          </div>
          <button
            type="button"
            onClick={vaultWithdraw}
            disabled={b.vault === 0}
            className="rounded-xl border px-3 py-2 text-xs font-bold text-[var(--ink)] transition-opacity disabled:opacity-40"
            style={{ borderColor: "var(--hairline)" }}
          >
            Withdraw all
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[25, 50, profile.lifePoints].map((amt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => vaultDeposit(amt)}
              disabled={profile.lifePoints === 0 || (i < 2 && profile.lifePoints < amt)}
              className="font-hud rounded-xl px-3 py-2 text-xs font-bold transition-opacity disabled:opacity-40"
              style={{ background: "color-mix(in srgb, var(--stat-savings) 18%, transparent)", color: "var(--stat-savings)" }}
            >
              {i === 2 ? "Deposit all" : `Deposit ${amt}`}
            </button>
          ))}
        </div>
      </Panel>

      <Link
        to="/arcade"
        className="flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--hairline)" }}
      >
        <Gamepad2 size={15} strokeWidth={2} style={{ color: "var(--accent)" }} />
        Play the Arcade →
      </Link>

      <Link
        to="/character"
        className="flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-white/5"
        style={{ borderColor: "var(--hairline)" }}
      >
        <Sparkles size={15} strokeWidth={2} style={{ color: "var(--accent)" }} />
        Colors, frames &amp; titles →
      </Link>
    </div>
  );
}
