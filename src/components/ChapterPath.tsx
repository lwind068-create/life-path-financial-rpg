import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, Trophy } from "lucide-react";
import { ChapterIcon } from "./ChapterIcon";

export interface PathMarker {
  title: string;
  icon: string;
  sceneIds: string[];
}

interface ChapterPathProps {
  markers: PathMarker[];
  orderedSceneIds: string[];
  /** 0-based index into orderedSceneIds of where the player currently is; equals orderedSceneIds.length once the story is finished. */
  currentIndex: number;
  hasCharacter: boolean;
  isDone: boolean;
  /** "Start" | "Continue" | "Play again" — same label already shown on the main CTA. */
  ctaLabel: string;
  onActivate: () => void;
}

type NodeState = "locked" | "current" | "completed";

const ROW_HEIGHT = 122;
const TOP_PAD = 58;
const BOTTOM_PAD = 58;
const CENTER_X = 150;
const SWING = 78;
const NODE_SIZE = 60;
const CURRENT_NODE_SIZE = 68;

/** Smooth vertical S-curve through a list of points, node-to-node. */
function buildPathD(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const midY = (prev.y + cur.y) / 2;
    d += ` C ${prev.x} ${midY}, ${cur.x} ${midY}, ${cur.x} ${cur.y}`;
  }
  return d;
}

const BUBBLE_TEXT: Record<string, string> = {
  Start: "START",
  Continue: "CONTINUE",
  "Play again": "REPLAY",
};

export function ChapterPath({
  markers,
  orderedSceneIds,
  currentIndex,
  hasCharacter,
  isDone,
  ctaLabel,
  onActivate,
}: ChapterPathProps) {
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);

  const nodes = useMemo(() => {
    return markers.map((marker) => {
      const indices = marker.sceneIds.map((id) => orderedSceneIds.indexOf(id));
      const minIndex = Math.min(...indices);
      const maxIndex = Math.max(...indices);
      const done = maxIndex < currentIndex;
      const isCurrent =
        (hasCharacter && !isDone && currentIndex >= minIndex && currentIndex <= maxIndex) ||
        (!hasCharacter && minIndex === 0);
      const state: NodeState = done ? "completed" : isCurrent ? "current" : "locked";
      return { marker, state };
    });
  }, [markers, orderedSceneIds, currentIndex, hasCharacter, isDone]);

  // Trophy/ending node appended after every chapter marker.
  const endingState: NodeState = isDone ? "current" : "locked";
  const allStates: NodeState[] = [...nodes.map((n) => n.state), endingState];

  const points = allStates.map((_, i) => ({
    x: CENTER_X + Math.round(SWING * Math.sin((i * Math.PI) / 2)),
    y: TOP_PAD + i * ROW_HEIGHT,
  }));

  const svgHeight = TOP_PAD + (allStates.length - 1) * ROW_HEIGHT + BOTTOM_PAD;
  const pathD = buildPathD(points);

  // Rough overall completion fraction, used only to color the connecting line.
  const progressFraction = Math.min(1, Math.max(0, currentIndex / Math.max(1, orderedSceneIds.length)));

  const handleNodeClick = (index: number, state: NodeState) => {
    if (state === "locked") {
      setShakeIndex(index);
      window.setTimeout(() => setShakeIndex((cur) => (cur === index ? null : cur)), 400);
      return;
    }
    onActivate();
  };

  const bubbleText = BUBBLE_TEXT[ctaLabel] ?? "GO";

  return (
    <div className="relative mx-auto w-full max-w-[300px]" style={{ height: svgHeight }}>
      <svg
        className="pointer-events-none absolute inset-0"
        width="100%"
        height={svgHeight}
        viewBox={`0 0 300 ${svgHeight}`}
        fill="none"
      >
        <path
          d={pathD}
          stroke="var(--hairline)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray="2 14"
        />
        <path
          d={pathD}
          stroke="var(--accent)"
          strokeWidth={6}
          strokeLinecap="round"
          style={{
            opacity: progressFraction > 0 ? 1 : 0,
            clipPath: `inset(0 0 ${(1 - progressFraction) * 100}% 0)`,
          }}
        />
      </svg>

      {[...nodes.map((n) => n.marker), null].map((markerOrNull, i) => {
        const state = allStates[i];
        const isEnding = markerOrNull === null;
        const point = points[i];
        const size = state === "current" ? CURRENT_NODE_SIZE : NODE_SIZE;

        const bg =
          state === "locked"
            ? "var(--bg-panel-solid)"
            : isEnding
              ? "linear-gradient(180deg, var(--progress-glow), var(--progress))"
              : "linear-gradient(180deg, var(--accent-soft), var(--accent))";
        const rim = state === "locked" ? "var(--hairline)" : isEnding ? "#b8790a" : "var(--accent-deep)";
        const iconColor = state === "locked" ? "var(--ink-faint)" : isEnding ? "var(--progress-ink)" : "var(--accent-ink)";

        return (
          <div
            key={isEnding ? "ending" : markerOrNull!.title}
            className="absolute flex flex-col items-center"
            style={{
              left: point.x,
              top: point.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <AnimatePresence>
              {state === "current" && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: [0, -5, 0], scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } }}
                  className="font-display absolute -top-11 whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-bold tracking-wide"
                  style={{
                    background: "var(--ink)",
                    color: "var(--bg-void)",
                  }}
                >
                  {bubbleText}
                  <div
                    className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45"
                    style={{ background: "var(--ink)" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={() => handleNodeClick(i, state)}
              whileHover={state !== "locked" ? { scale: 1.06 } : undefined}
              whileTap={state !== "locked" ? { scale: 0.94 } : undefined}
              animate={
                shakeIndex === i
                  ? { x: [0, -6, 6, -6, 6, 0] }
                  : state === "current"
                    ? { scale: [1, 1.05, 1] }
                    : { scale: 1 }
              }
              transition={
                shakeIndex === i
                  ? { duration: 0.4 }
                  : state === "current"
                    ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                    : undefined
              }
              className="relative flex shrink-0 items-center justify-center rounded-full"
              style={{
                width: size,
                height: size,
                background: bg,
                color: iconColor,
                boxShadow: `0 6px 0 ${rim}, 0 8px 14px rgba(0,0,0,0.35)`,
                cursor: state === "locked" ? "not-allowed" : "pointer",
              }}
              aria-label={isEnding ? "Ending" : markerOrNull!.title}
            >
              {state === "locked" ? (
                <Lock size={isEnding ? 24 : 20} color={iconColor} strokeWidth={2.25} />
              ) : state === "completed" ? (
                <Check size={isEnding ? 26 : 22} color={iconColor} strokeWidth={3} />
              ) : isEnding ? (
                <Trophy size={26} color={iconColor} strokeWidth={2.25} />
              ) : (
                <ChapterIcon name={markerOrNull!.icon} size={22} className="" />
              )}
            </motion.button>

            <span
              className="font-display mt-2 max-w-[90px] text-center text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: state === "locked" ? "var(--ink-faint)" : "var(--ink-dim)" }}
            >
              {isEnding ? "The Ending" : markerOrNull!.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
