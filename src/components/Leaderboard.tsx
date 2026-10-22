import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Crown, Zap } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { fetchTopEntries, type LeaderboardEntry, type LeaderboardMetric } from "../engine/leaderboard";
import { getUid } from "../engine/firebaseClient";

interface LeaderboardProps {
  /** The player's unique username. */
  playerName: string;
  playerNetWorth: number;
  /** Player's lifetime Life Points earned (see engine/lifePoints.ts). */
  playerLifePoints: number;
  /** Small 3-row version for Home/Ending, with a link to the full board. */
  compact?: boolean;
  /** How many players to load. */
  size?: number;
}

interface Row {
  key: string;
  name: string;
  value: number;
  isPlayer: boolean;
}

/**
 * Real players only — read from Firestore scores/{uid} (see
 * engine/leaderboard.ts). Names are unique usernames. The player's own row
 * always uses their live local numbers. If the board can't be loaded, only
 * the player's own row is shown: no made-up rivals.
 */
export function Leaderboard({ playerName, playerNetWorth, playerLifePoints, compact = false, size = 10 }: LeaderboardProps) {
  const [metric, setMetric] = useState<LeaderboardMetric>("lifePoints");
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [myUid, setMyUid] = useState<string | null>(null);

  useEffect(() => {
    void getUid().then(setMyUid);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchTopEntries(metric, size).then((result) => {
      if (cancelled) return;
      setEntries(result);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [metric, size]);

  const playerValue = metric === "netWorth" ? playerNetWorth : playerLifePoints;
  const lowerName = playerName.toLowerCase();
  const others: Row[] = (entries ?? [])
    .filter((e) => e.uid !== myUid && e.name.toLowerCase() !== lowerName)
    .map((e) => ({ key: e.uid, name: e.name, value: metric === "netWorth" ? e.netWorth : e.lifePoints, isPlayer: false }));

  const rows: Row[] = [{ key: "you", name: playerName || "You", value: playerValue, isPlayer: true }, ...others].sort(
    (a, b) => b.value - a.value,
  );

  const limit = compact ? 3 : size;
  let visible = rows.slice(0, limit);
  if (!visible.some((r) => r.isPlayer)) {
    visible = [...visible.slice(0, limit - 1), rows.find((r) => r.isPlayer)!];
  }

  const boardUnavailable = loaded && entries === null;
  const onlyYou = loaded && others.length === 0;

  return (
    <div
      className="flex flex-col gap-2.5 rounded-2xl border px-4 py-4 sm:px-5"
      style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Trophy size={15} style={{ color: "var(--accent)" }} strokeWidth={2.25} />
          <span className="font-hud text-xs font-semibold uppercase tracking-wider text-[var(--ink-dim)]">Leaderboard</span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 rounded-full p-0.5" style={{ background: "var(--bg-panel-solid)" }}>
          {(
            [
              { id: "lifePoints", label: "Points" },
              { id: "netWorth", label: "Net worth" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMetric(tab.id)}
              className="font-hud rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors"
              style={{
                background: metric === tab.id ? "var(--accent)" : "transparent",
                color: metric === tab.id ? "var(--accent-ink)" : "var(--ink-faint)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {visible.map((row) => {
          const rank = rows.indexOf(row) + 1;
          const color = row.isPlayer ? "var(--accent)" : "var(--ink-dim)";
          return (
            <motion.div
              key={row.key}
              layout
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex items-center gap-3 rounded-xl px-3 py-2"
              style={{
                background: row.isPlayer ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "var(--bg-panel-solid)",
                boxShadow: row.isPlayer ? "inset 0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent)" : undefined,
              }}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-hud text-xs font-bold"
                style={{ background: "var(--bg-panel-raised)", color: "var(--ink-dim)" }}
              >
                {rank === 1 ? <Crown size={13} style={{ color: "var(--accent)" }} /> : rank}
              </span>
              <span className="flex-1 truncate text-left text-sm font-semibold" style={{ color: row.isPlayer ? "var(--ink)" : "var(--ink-dim)" }}>
                {row.name}
                {row.isPlayer && <span className="ml-1.5 text-[10px] font-normal text-[var(--ink-faint)]">(you)</span>}
              </span>
              {metric === "lifePoints" && <Zap size={12} strokeWidth={2.5} fill={color} style={{ color }} />}
              <AnimatedNumber
                value={row.value}
                prefix={metric === "netWorth" ? "$" : ""}
                durationMs={700}
                className="font-hud text-sm font-bold"
                style={{ color }}
              />
            </motion.div>
          );
        })}
      </div>
      {(onlyYou || boardUnavailable) && (
        <p className="text-left text-[11px] leading-relaxed text-[var(--ink-faint)]">
          {boardUnavailable
            ? "Couldn't load other players right now — your score is saved on this device."
            : "No one else on the board yet. Share lifepathgame.org and see who beats you."}
        </p>
      )}
      {!compact && !onlyYou && !boardUnavailable && (
        <p className="text-left text-[11px] leading-relaxed text-[var(--ink-faint)]">
          {metric === "netWorth"
            ? "Real players, ranked by savings minus debt."
            : "Real players, ranked by lifetime Life Points earned — story, quests and Arcade all count. Spending never lowers your spot."}
        </p>
      )}
      {compact && (
        <Link to="/leaderboard" className="text-left text-xs font-semibold" style={{ color: "var(--accent)" }}>
          See full leaderboard →
        </Link>
      )}
    </div>
  );
}
