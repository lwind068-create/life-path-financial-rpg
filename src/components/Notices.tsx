import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "../engine/GameContext";

/** Toasts for quest completions, streaks, and vault interest. */
export function Notices() {
  const { notices, dismissNotice } = useGame();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-40 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {notices.map((n) => (
          <motion.button
            key={n.id}
            type="button"
            layout
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            onClick={() => dismissNotice(n.id)}
            className="font-display pointer-events-auto rounded-full border px-4 py-2 text-sm font-bold shadow-xl shadow-black/40"
            style={{
              borderColor: "color-mix(in srgb, var(--progress) 45%, transparent)",
              background: "var(--bg-panel-raised)",
              color: "var(--progress-glow)",
            }}
          >
            {n.text}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
