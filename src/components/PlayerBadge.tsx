import { motion } from "framer-motion";
import type { Frame } from "../content/characterOptions";

interface PlayerBadgeProps {
  name: string;
  size?: "sm" | "md" | "lg";
  /** Optional purchased badge frame - a decorative ring/glow layered on top of the accent ring. */
  frame?: Frame;
}

const SIZE_CLASSES = { sm: "h-9 w-9 text-xs", md: "h-12 w-12 text-sm", lg: "h-16 w-16 text-lg" };

/** Identity badge: the player's initial on their chosen color. No avatar/face. */
export function PlayerBadge({ name, size = "md", frame }: PlayerBadgeProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const hasFrame = Boolean(frame && frame.id !== "none");
  const boxShadow = hasFrame
    ? `0 0 0 2px color-mix(in srgb, var(--accent) 55%, transparent), ${frame!.ring}`
    : "0 0 0 2px color-mix(in srgb, var(--accent) 55%, transparent)";

  return (
    <motion.div
      className={`font-display flex shrink-0 items-center justify-center rounded-full font-bold ${SIZE_CLASSES[size]}`}
      style={{
        background: "linear-gradient(135deg, var(--accent), var(--accent-deep))",
        color: "var(--accent-ink)",
        boxShadow,
      }}
      animate={hasFrame ? { scale: [1, 1.05, 1] } : undefined}
      transition={hasFrame ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {initial}
    </motion.div>
  );
}
