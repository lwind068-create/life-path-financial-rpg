import { motion } from "framer-motion";
import { Flame } from "lucide-react";

interface StreakIndicatorProps {
  /** How many scene-to-scene transitions have happened — also the 0-based index of the current scene. */
  visitedCount: number;
  totalCount: number;
  streak: number;
  /** 0-1 progress through the questions of the CURRENT scene, so the bar visibly ticks forward on every answer instead of only at scene boundaries. */
  withinScenePct?: number;
}

/** Level tracker — chapter notches along a bar, filled by a smoothly-advancing gradient. */
export function StreakIndicator({ visitedCount, totalCount, streak, withinScenePct = 0 }: StreakIndicatorProps) {
  const segments = Math.max(1, totalCount - 1);
  const sceneIndex = visitedCount;
  const effective = sceneIndex + Math.min(1, Math.max(0, withinScenePct));
  const pct = Math.min(100, (effective / segments) * 100);
  const notches = Array.from({ length: totalCount });

  return (
    <div className="flex flex-1 items-center gap-3">
      <div className="relative h-2.5 flex-1">
        <div
          className="absolute inset-y-0 left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={{ background: "var(--bg-panel-raised)" }}
        />
        <motion.div
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={{ background: "linear-gradient(90deg, var(--progress), var(--progress-glow))" }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        {notches.map((_, i) => {
          const lit = i <= sceneIndex;
          const current = i === sceneIndex;
          const left = totalCount === 1 ? 0 : (i / segments) * 100;
          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{
                left: `${left}%`,
                width: current ? 10 : 7,
                height: current ? 10 : 7,
                background: lit ? "var(--progress)" : "var(--bg-panel-solid)",
                borderColor: lit ? "var(--progress-glow)" : "var(--hairline)",
                boxShadow: current ? "0 0 0 3px color-mix(in srgb, var(--progress) 35%, transparent)" : undefined,
              }}
            />
          );
        })}
      </div>
      {streak > 1 && (
        <motion.span
          key={streak}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-display flex items-center gap-1 whitespace-nowrap text-xs font-semibold"
          style={{ color: "var(--progress)" }}
        >
          <Flame size={13} strokeWidth={2.25} fill="var(--progress)" />
          {streak}
        </motion.span>
      )}
    </div>
  );
}
