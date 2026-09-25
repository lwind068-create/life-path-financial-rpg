import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useGame } from "../engine/GameContext";
import { CHAPTER_MARKERS } from "../content/arcs";
import { ChoiceButton } from "./ChoiceButton";
import { OutcomeAnimation } from "./OutcomeAnimation";
import { StatBar } from "./StatBar";
import { StreakIndicator } from "./StreakIndicator";
import { PlayerBadge } from "./PlayerBadge";
import { ChapterIcon } from "./ChapterIcon";
import { StockTicker } from "./StockTicker";
import { MathChallenge } from "./MathChallenge";
import { SpendingMenu } from "./SpendingMenu";
import { BudgetSlider } from "./BudgetSlider";

function markerIndexForScene(sceneId: string): number {
  return CHAPTER_MARKERS.findIndex((m) => m.sceneIds.includes(sceneId));
}

export function ChapterScreen() {
  const {
    arc,
    currentChapter,
    currentQuestion,
    questionProgress,
    profile,
    progress,
    activeRandomEvent,
    lastOutcome,
    totalChapterCount,
    continueFromNarrative,
    makeChoice,
    acknowledgeOutcome,
  } = useGame();

  // Shown once per scene, right when a NEW named chapter starts (not the
  // very first one) — dismissed with a tap, then this scene's first
  // question shows normally. Tracks the chapterId it was last dismissed
  // for, so re-rendering the same scene never re-shows it.
  const [dismissedTransitionFor, setDismissedTransitionFor] = useState<string | null>(null);

  const showingOutcome = lastOutcome !== null;
  const markerIndex = markerIndexForScene(currentChapter.id);
  const isMarkerStart = CHAPTER_MARKERS[markerIndex]?.sceneIds[0] === currentChapter.id;
  const isVeryFirstScene = currentChapter.id === arc.startChapterId;
  const showTransition =
    isMarkerStart &&
    !isVeryFirstScene &&
    !currentChapter.isEnding &&
    progress.currentQuestionIndex === 0 &&
    !showingOutcome &&
    dismissedTransitionFor !== currentChapter.id;

  if (showTransition) {
    const prevMarker = CHAPTER_MARKERS[markerIndex - 1];
    const nextMarker = CHAPTER_MARKERS[markerIndex];
    return (
      <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-8 px-5 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex w-full flex-col items-center gap-6 rounded-3xl border p-8 shadow-2xl shadow-black/40"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}
        >
          <span className="font-hud text-xs font-semibold uppercase tracking-widest text-[var(--ink-faint)]">
            End of Chapter {markerIndex} · {prevMarker?.title}
          </span>
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "color-mix(in srgb, var(--accent) 16%, transparent)",
              boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent)",
              color: "var(--accent)",
            }}
          >
            <ChapterIcon name={nextMarker.icon} size={30} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              Chapter {markerIndex + 1}
            </span>
            <h2 className="text-2xl font-bold text-[var(--ink)]">{nextMarker.title}</h2>
          </div>
          <button
            type="button"
            onClick={() => setDismissedTransitionFor(currentChapter.id)}
            className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
          >
            Continue
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </motion.div>
      </div>
    );
  }

  const activeVariant = currentQuestion?.variants[progress.currentVariantIndex] ?? currentQuestion?.variants[0];
  const narrative = currentQuestion ? activeVariant?.narrative ?? "" : currentChapter.narrative;
  const choices = currentQuestion ? currentQuestion.choices : currentChapter.choices;
  const icon = currentQuestion?.icon ?? currentChapter.icon;
  const beatKey = currentQuestion ? `${currentChapter.id}-q${progress.currentQuestionIndex}` : currentChapter.id;

  // Answering a question ticks the bar forward immediately, not just at scene boundaries.
  const completedQuestions = showingOutcome ? progress.currentQuestionIndex + 1 : progress.currentQuestionIndex;
  const withinScenePct = currentChapter.questions ? completedQuestions / currentChapter.questions.length : 0;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-5 py-10 sm:py-16">
      <div className="flex items-center gap-3">
        {profile.characterName && <PlayerBadge name={profile.characterName} size="sm" />}
        <StreakIndicator
          visitedCount={progress.visitedChapterIds.length}
          totalCount={totalChapterCount}
          streak={progress.streak}
          withinScenePct={withinScenePct}
        />
      </div>
      {!showingOutcome && <StatBar stats={progress.stats} history={progress.statsHistory} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={showingOutcome ? `${beatKey}-outcome` : beatKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-6 rounded-3xl border p-6 shadow-2xl shadow-black/40 sm:p-8"
          style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}
        >
          {!showingOutcome && (icon || questionProgress) && (
            <div className="flex items-center justify-between">
              {icon && (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 16%, transparent)",
                    boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--accent) 30%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  <ChapterIcon name={icon} size={28} />
                </div>
              )}
              {questionProgress && (
                <span className="font-hud text-xs font-semibold tracking-wider text-[var(--ink-dim)]">
                  {questionProgress.index} / {questionProgress.total}
                </span>
              )}
            </div>
          )}

          {!showingOutcome && currentQuestion?.tickers && (
            <StockTicker tickers={currentQuestion.tickers} mode="live" />
          )}

          {!showingOutcome && currentQuestion?.mathChallenge && (
            <MathChallenge
              prompt={currentQuestion.mathChallenge.prompt}
              answer={currentQuestion.mathChallenge.answer}
              unit={currentQuestion.mathChallenge.unit}
            />
          )}

          {!showingOutcome && (
            <p className="font-narrative whitespace-pre-line text-lg sm:text-xl leading-relaxed text-[var(--ink)]">
              {narrative}
            </p>
          )}

          {showingOutcome && lastOutcome && (
            <OutcomeAnimation
              choice={lastOutcome.choice}
              statsAfter={progress.stats}
              statsHistory={progress.statsHistory}
              randomEvent={activeRandomEvent}
              outcomeTickers={currentQuestion?.outcomeTickers}
              pointsAwarded={lastOutcome.pointsAwarded}
              onContinue={acknowledgeOutcome}
            />
          )}

          {!showingOutcome && choices.length === 0 && (
            <button
              type="button"
              onClick={continueFromNarrative}
              className="self-start rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            >
              Continue
            </button>
          )}

          {!showingOutcome && choices.length > 0 && currentQuestion?.menuStyle && (
            <SpendingMenu choices={choices} onSelect={makeChoice} />
          )}

          {!showingOutcome && choices.length > 0 && currentQuestion?.sliderStyle && (
            <BudgetSlider choices={choices} onSelect={makeChoice} />
          )}

          {!showingOutcome && choices.length > 0 && !currentQuestion?.menuStyle && !currentQuestion?.sliderStyle && (
            <div className="flex flex-col gap-3">
              {choices.map((choice, i) => (
                <ChoiceButton key={choice.id} choice={choice} index={i} onSelect={makeChoice} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
