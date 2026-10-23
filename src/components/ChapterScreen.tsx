import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../engine/GameContext";
import { CHAPTER_MARKERS } from "../content/arcs";
import { ChoiceButton } from "./ChoiceButton";
import { OutcomeAnimation } from "./OutcomeAnimation";
import { StatBar } from "./StatBar";
import { StreakIndicator } from "./StreakIndicator";
import { PlayerBadge } from "./PlayerBadge";
import { getFrame } from "../content/characterOptions";
import { ChapterIcon } from "./ChapterIcon";
import { StockTicker } from "./StockTicker";
import { MathChallenge } from "./MathChallenge";
import { SpendingMenu } from "./SpendingMenu";
import { BudgetSlider } from "./BudgetSlider";
import { ChapterBriefing } from "./ChapterBriefing";
import { consequenceApplies } from "../engine/money";

function markerIndexForScene(sceneId: string): number {
  return CHAPTER_MARKERS.findIndex((m) => m.sceneIds.includes(sceneId));
}

export function ChapterScreen() {
  const {
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
    dismissBriefing,
  } = useGame();

  const showingOutcome = lastOutcome !== null;
  const markerIndex = markerIndexForScene(currentChapter.id);
  const marker = CHAPTER_MARKERS[markerIndex];

  // Every chapter opens with a briefing: what's going on, what changed
  // money-wise since last time (and why), the goal, and key terms.
  if (progress.briefingFor === currentChapter.id && currentChapter.briefing && !showingOutcome) {
    return (
      <ChapterBriefing
        chapter={currentChapter}
        chapterNumber={markerIndex + 1}
        chapterTitle={marker?.title ?? currentChapter.title}
        icon={marker?.icon ?? currentChapter.icon ?? "briefcase"}
        ledger={progress.ledger}
        stats={progress.stats}
        statsHistory={progress.statsHistory}
        moneyHistory={progress.moneyHistory}
        onStart={dismissBriefing}
      />
    );
  }

  const activeVariant = currentQuestion?.variants[progress.currentVariantIndex] ?? currentQuestion?.variants[0];
  // A question can refer back to an earlier choice (QuestionBeat.narrativeIf).
  const flagNarrative = currentQuestion?.narrativeIf?.find((n) => consequenceApplies(n, progress.flags))?.narrative;
  const narrative = currentQuestion ? flagNarrative ?? activeVariant?.narrative ?? "" : currentChapter.narrative;
  const choices = currentQuestion ? currentQuestion.choices : currentChapter.choices;
  const icon = currentQuestion?.icon ?? currentChapter.icon;
  const beatKey = currentQuestion ? `${currentChapter.id}-q${progress.currentQuestionIndex}` : currentChapter.id;

  // Answering a question ticks the bar forward immediately, not just at scene boundaries.
  const completedQuestions = showingOutcome ? progress.currentQuestionIndex + 1 : progress.currentQuestionIndex;
  const withinScenePct = currentChapter.questions ? completedQuestions / currentChapter.questions.length : 0;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-5 py-10 sm:py-16">
      <div className="flex items-center gap-3">
        {profile.characterName && <PlayerBadge name={profile.characterName} size="sm" frame={getFrame(profile.frameId)} />}
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
              multiplier={lastOutcome.multiplier}
              moneyNotes={lastOutcome.moneyNotes}
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
