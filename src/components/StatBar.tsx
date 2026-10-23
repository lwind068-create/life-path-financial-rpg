import type { PlayerStats } from "../content/types";
import { StatGauge } from "./StatGauge";

const STAT_KEYS: (keyof PlayerStats)[] = ["cash", "savings", "debt", "stress"];

interface StatBarProps {
  stats: PlayerStats;
  history?: PlayerStats[];
}

/** Cash (what you spend from), savings, debt and stress. */
export function StatBar({ stats, history = [] }: StatBarProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {STAT_KEYS.map((key) => (
        <StatGauge key={key} statKey={key} value={stats[key]} history={history.map((h) => h[key])} />
      ))}
    </div>
  );
}
