import type { PlayerStats } from "../content/types";
import { StatGauge } from "./StatGauge";

const STAT_KEYS: (keyof Pick<PlayerStats, "savings" | "debt" | "stress">)[] = [
  "savings",
  "debt",
  "stress",
];

interface StatBarProps {
  stats: PlayerStats;
  history?: PlayerStats[];
}

export function StatBar({ stats, history = [] }: StatBarProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {STAT_KEYS.map((key) => (
        <StatGauge key={key} statKey={key} value={stats[key]} history={history.map((h) => h[key])} />
      ))}
    </div>
  );
}
