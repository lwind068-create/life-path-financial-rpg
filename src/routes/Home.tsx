import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, UserRound, Share2, ArrowRight, Check } from "lucide-react";
import { useGame } from "../engine/GameContext";
import { CHAPTER_MARKERS, ORDERED_SCENE_IDS } from "../content/arcs";
import { PlayerBadge } from "../components/PlayerBadge";
import { ChapterIcon } from "../components/ChapterIcon";
import { Leaderboard } from "../components/Leaderboard";

const FEATURES = [
  { Icon: Gamepad2, title: "One continuous story", body: "Chapters flow into each other, real choices throughout." },
  { Icon: UserRound, title: "Build your character", body: "Pick a look and a color that's yours." },
  { Icon: Share2, title: "Shareable ending", body: "Walk away with a card worth posting." },
];

export function Home() {
  const navigate = useNavigate();
  const { profile, progress, currentChapter, resetStoryProgress } = useGame();
  const hasCharacter = Boolean(profile.characterName);
  const isDone = currentChapter.isEnding;

  const currentIndex = isDone
    ? ORDERED_SCENE_IDS.length
    : Math.max(0, ORDERED_SCENE_IDS.indexOf(progress.currentChapterId));

  const label = isDone ? "Play again" : hasCharacter ? "Continue" : "Start";

  const openStory = () => {
    if (isDone) resetStoryProgress();
    navigate("/play");
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center gap-10 px-5 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
          style={{
            background: "color-mix(in srgb, var(--accent) 18%, transparent)",
            color: "var(--accent)",
          }}
        >
          A Life-Sim About Money
        </span>
        <h1 className="text-4xl font-extrabold text-[var(--ink)] sm:text-5xl">
          Life<span style={{ color: "var(--accent)" }}>-Path</span>
        </h1>
        <p className="max-w-md text-base text-[var(--ink-dim)] sm:text-lg">
          Every dollar that comes in or goes out is yours to manage. One story, start to finish,
          one choice at a time.
        </p>
      </motion.div>

      {hasCharacter && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-2xl border px-5 py-3"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}
        >
          <PlayerBadge name={profile.characterName} size="sm" />
          <span className="text-sm text-[var(--ink-dim)]">
            Welcome back, {profile.characterName}.
          </span>
        </motion.div>
      )}

      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={openStory}
        className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-bold transition-opacity hover:opacity-90"
        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
      >
        {label}
        <ArrowRight size={20} strokeWidth={2.5} />
      </motion.button>

      <div className="flex w-full flex-col gap-2.5">
        {CHAPTER_MARKERS.map((marker, i) => {
          const indices = marker.sceneIds.map((id) => ORDERED_SCENE_IDS.indexOf(id));
          const minIndex = Math.min(...indices);
          const maxIndex = Math.max(...indices);
          const done = maxIndex < currentIndex;
          const isCurrent = hasCharacter && !isDone && currentIndex >= minIndex && currentIndex <= maxIndex;

          return (
            <div
              key={marker.title}
              className="flex items-center gap-4 rounded-2xl border px-5 py-3.5 text-left"
              style={{
                borderColor: isCurrent ? "color-mix(in srgb, var(--accent) 45%, var(--hairline))" : "var(--hairline)",
                background: "var(--bg-panel-raised)",
                boxShadow: isCurrent ? "inset 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent)" : undefined,
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: done || isCurrent
                    ? "color-mix(in srgb, var(--accent) 18%, transparent)"
                    : "var(--bg-panel-solid)",
                  color: done || isCurrent ? "var(--accent)" : "var(--ink-faint)",
                }}
              >
                <ChapterIcon name={marker.icon} size={19} />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="font-display text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
                  Chapter {i + 1}
                </span>
                <span
                  className="text-sm font-bold"
                  style={{ color: done || isCurrent ? "var(--ink)" : "var(--ink-dim)" }}
                >
                  {marker.title}
                </span>
              </div>
              {done && (
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: "color-mix(in srgb, var(--stat-savings) 20%, transparent)", color: "var(--stat-savings)" }}
                >
                  <Check size={10} strokeWidth={3} /> Done
                </span>
              )}
              {isCurrent && (
                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                  Now
                </span>
              )}
            </div>
          );
        })}
      </div>

      {hasCharacter && (
        <div className="w-full">
          <Leaderboard
            playerName={profile.characterName}
            playerNetWorth={profile.cumulativeStats.savings - profile.cumulativeStats.debt}
            compact
          />
        </div>
      )}

      <div className="grid w-full gap-3 sm:grid-cols-3">
        {FEATURES.map(({ Icon, title, body }) => (
          <div
            key={title}
            className="flex flex-col items-center gap-1.5 rounded-2xl border px-4 py-5 text-center"
            style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}
          >
            <Icon size={20} style={{ color: "var(--accent)" }} strokeWidth={2} />
            <span className="text-sm font-semibold text-[var(--ink)]">{title}</span>
            <span className="text-xs text-[var(--ink-dim)]">{body}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
