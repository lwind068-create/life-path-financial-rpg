import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Gamepad2, LineChart, Scale, ShoppingBag, Ticket, Timer, Trophy, Zap } from "lucide-react";
import { useGame } from "../engine/GameContext";
import { ARCADE_GAMES, type ArcadeGameId } from "../engine/arcade";
import { PortfolioSim } from "../components/games/PortfolioSim";
import { NeedOrWant } from "../components/games/NeedOrWant";
import { CostMore } from "../components/games/CostMore";
import type { GameResult } from "../components/games/types";

const ICONS: Record<ArcadeGameId, typeof Zap> = { portfolio: LineChart, blitz: Timer, costmore: Scale };

function formatBest(id: ArcadeGameId, score: number) {
  return id === "portfolio" ? `$${score.toLocaleString()}` : String(score);
}

export function Arcade() {
  const { profile, hasFreeTicket, startArcadeGame, finishArcadeGame } = useGame();
  const [active, setActive] = useState<ArcadeGameId | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [shake, setShake] = useState<ArcadeGameId | null>(null);
  const [runKey, setRunKey] = useState(0);

  const play = (id: ArcadeGameId) => {
    if (!startArcadeGame(id)) {
      setShake(id);
      window.setTimeout(() => setShake(null), 400);
      return;
    }
    setResult(null);
    setActive(id);
    setRunKey((k) => k + 1);
  };

  const onDone = useCallback(
    (r: GameResult) => {
      if (!active) return;
      finishArcadeGame(active, r.score, r.reward);
      setResult(r);
    },
    [active, finishArcadeGame],
  );

  const game = ARCADE_GAMES.find((g) => g.id === active);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col gap-6 px-5 py-10 sm:py-14">
      <div className="flex items-center justify-between">
        {active ? (
          <button type="button" onClick={() => { setActive(null); setResult(null); }} className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)]">
            <ArrowLeft size={16} strokeWidth={2.5} /> Arcade
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)]">
            <ArrowLeft size={16} strokeWidth={2.5} /> Home
          </Link>
        )}
        <span className="font-hud flex items-center gap-1 text-base font-bold" style={{ color: "var(--progress)" }}>
          <Zap size={15} strokeWidth={2.5} fill="var(--progress)" />
          {profile.lifePoints}
        </span>
      </div>

      {!active && (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="flex items-center gap-2 text-2xl font-extrabold text-[var(--ink)]">
              <Gamepad2 size={24} style={{ color: "var(--accent)" }} /> Arcade
            </h1>
            <p className="text-sm text-[var(--ink-dim)]">
              Spend Life Points to play money mini-games. Play smart and win more points back.
            </p>
            <div
              className="flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
              style={{
                background: hasFreeTicket ? "color-mix(in srgb, var(--accent) 18%, transparent)" : "var(--bg-panel-raised)",
                color: hasFreeTicket ? "var(--accent)" : "var(--ink-faint)",
              }}
            >
              <Ticket size={13} strokeWidth={2.5} />
              {hasFreeTicket ? "1 free play today!" : "Free play used — new one tomorrow"}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {ARCADE_GAMES.map((g) => {
              const Icon = ICONS[g.id];
              const best = profile.boosts.arcadeBest[g.id];
              const canPlay = hasFreeTicket || profile.lifePoints >= g.cost;
              return (
                <motion.div
                  key={g.id}
                  animate={shake === g.id ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-3 rounded-3xl border p-5"
                  style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)" }}>
                      <Icon size={22} strokeWidth={2.25} />
                    </span>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-base font-bold text-[var(--ink)]">{g.name}</span>
                      <span className="text-sm text-[var(--ink-dim)]">{g.tagline}</span>
                      <span className="text-[11px] text-[var(--ink-faint)]">Teaches: {g.lesson}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col text-[11px] text-[var(--ink-faint)]">
                      <span>Win up to <strong style={{ color: "var(--progress)" }}>{g.maxReward}</strong> Life Points</span>
                      {best !== undefined && (
                        <span className="flex items-center gap-1"><Trophy size={11} /> {g.scoreLabel}: {formatBest(g.id, best)}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => play(g.id)}
                      className="font-hud flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
                      style={{
                        background: canPlay ? "var(--progress)" : "var(--bg-panel-raised)",
                        color: canPlay ? "var(--progress-ink)" : "var(--ink-faint)",
                      }}
                    >
                      {hasFreeTicket ? (
                        <><Ticket size={14} strokeWidth={2.5} /> Play free</>
                      ) : (
                        <><Zap size={13} strokeWidth={2.5} /> Play · {g.cost}</>
                      )}
                    </button>
                  </div>
                  {shake === g.id && <span className="text-[11px]" style={{ color: "var(--stat-debt)" }}>Not enough Life Points — make some smart choices in the story first.</span>}
                </motion.div>
              );
            })}
          </div>

          <Link to="/shop" className="flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-white/5" style={{ borderColor: "var(--hairline)" }}>
            <ShoppingBag size={15} style={{ color: "var(--progress)" }} /> Boosts, quests &amp; Savings Vault →
          </Link>
        </>
      )}

      {active && game && (
        <div className="flex flex-col gap-5 rounded-3xl border p-5 sm:p-6" style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}>
          <h1 className="text-xl font-extrabold text-[var(--ink)]">{game.name}</h1>
          {!result && (
            <div key={runKey}>
              {active === "portfolio" && <PortfolioSim onDone={onDone} />}
              {active === "blitz" && <NeedOrWant onDone={onDone} />}
              {active === "costmore" && <CostMore onDone={onDone} />}
            </div>
          )}
          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              <span className="font-hud text-2xl font-bold text-[var(--ink)]">{result.headline}</span>
              <span className="font-hud flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-base font-bold" style={{ background: "color-mix(in srgb, var(--progress) 18%, transparent)", color: "var(--progress-glow)" }}>
                <Zap size={15} strokeWidth={2.5} fill="var(--progress-glow)" /> +{result.reward} Life Points
              </span>
              <ul className="flex flex-col gap-1.5">
                {result.lines.map((l) => (
                  <li key={l} className="text-sm leading-relaxed text-[var(--ink-dim)]">• {l}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => play(game.id)} className="font-hud flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-bold" style={{ background: "var(--progress)", color: "var(--progress-ink)" }}>
                  {hasFreeTicket ? "Play again free" : <><Zap size={13} /> Play again · {game.cost}</>}
                </button>
                <button type="button" onClick={() => { setActive(null); setResult(null); }} className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-[var(--ink)]" style={{ borderColor: "var(--hairline)" }}>
                  Back to Arcade
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
