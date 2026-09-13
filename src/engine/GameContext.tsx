import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Chapter, PlayerStats, QuestionBeat, RandomEvent } from "../content/types";
import { lifePathArc } from "../content/arcs";
import {
  logDecision,
  getDecisionLog,
  clearDecisionLog,
} from "./logDecision";
import { computeAverageQualityScore, computeKnowledgeGain } from "./scoring";
import { logPlayerSummary } from "./logPlayerSummary";

const PROFILE_KEY = "lifepath:profile";
const PROGRESS_KEY = "lifepath:progress";

const initialStats: PlayerStats = { cash: 0, savings: 0, debt: 0, stress: 0 };

/** Slim shape covering both Choice (single-question chapters) and QuestionChoice (multi-question chapters) — all display/scoring needs, no nextChapterId. */
interface OutcomeChoice {
  id: string;
  label: string;
  outcomeNarrative: string;
  financialQualityScore: number;
  statEffects?: Partial<PlayerStats>;
}

/** The whole game is one character, one save slot — this is that character. */
interface PlayerProfile {
  characterName: string;
  accentId: string | null;
  /** True once the player has explicitly confirmed their color (clicked "Let's go"). */
  onboarded: boolean;
  /** Running total across the whole story. Since there's only ever one save slot now, this is the same as `progress.stats` — kept as its own field so it survives a "play again" without also wiping the character. */
  cumulativeStats: PlayerStats;
}

/** The single, whole-story save slot. */
interface StoryProgress {
  currentChapterId: string;
  /** Index into the current chapter's `questions` array, if it has one. */
  currentQuestionIndex: number;
  /** Which randomly-picked narrative variant is showing for the current question. */
  currentVariantIndex: number;
  stats: PlayerStats;
  /** Snapshot of `stats` after every choice, oldest first — feeds the stat sparklines. */
  statsHistory: PlayerStats[];
  /** Chapters completed so far this run, in order — drives the chapter tracker and the home-screen roadmap. */
  visitedChapterIds: string[];
  /** Increments on every choice made without restarting; resets on "Play again." */
  streak: number;
}

function freshProfile(): PlayerProfile {
  return { characterName: "", accentId: null, onboarded: false, cumulativeStats: { ...initialStats } };
}

function addEffects(base: PlayerStats, effects?: Partial<PlayerStats>): PlayerStats {
  if (!effects) return base;
  const next = { ...base };
  for (const key of Object.keys(effects) as (keyof PlayerStats)[]) {
    next[key] = (next[key] ?? 0) + (effects[key] ?? 0);
  }
  return next;
}

function loadProfile(): PlayerProfile {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return freshProfile();
    return { ...freshProfile(), ...(JSON.parse(raw) as Partial<PlayerProfile>) };
  } catch {
    return freshProfile();
  }
}

function randomIndex(length: number): number {
  return Math.floor(Math.random() * Math.max(1, length));
}

function freshProgress(): StoryProgress {
  const startChapter = lifePathArc.chapters[lifePathArc.startChapterId];
  return {
    currentChapterId: lifePathArc.startChapterId,
    currentQuestionIndex: 0,
    currentVariantIndex: randomIndex(startChapter?.questions?.[0]?.variants.length ?? 1),
    stats: { ...initialStats },
    statsHistory: [{ ...initialStats }],
    visitedChapterIds: [],
    streak: 0,
  };
}

function loadProgress(): StoryProgress {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return freshProgress();
    return { ...freshProgress(), ...(JSON.parse(raw) as Partial<StoryProgress>) };
  } catch {
    return freshProgress();
  }
}

interface GameContextValue {
  arc: typeof lifePathArc;
  currentChapter: Chapter;
  /** The active question within currentChapter, if it's a multi-question chapter. */
  currentQuestion: QuestionBeat | null;
  /** 1-based position of currentQuestion within its chapter, e.g. "3 of 8". Null for single-question chapters. */
  questionProgress: { index: number; total: number } | null;
  profile: PlayerProfile;
  progress: StoryProgress;
  /** Set on the most recent choice, if its random event fired; cleared on advance. */
  activeRandomEvent: RandomEvent | null;
  /** Set right after a choice is made, so the outcome screen can render it before advancing. */
  lastOutcome: { choice: OutcomeChoice; statsBefore: PlayerStats } | null;
  totalChapterCount: number;
  setCharacterName: (name: string) => void;
  setAccentId: (id: string) => void;
  completeOnboarding: () => void;
  continueFromNarrative: () => void;
  makeChoice: (choiceId: string) => void;
  acknowledgeOutcome: () => void;
  /** Restarts the story from the top — same character, fresh stats and progress. */
  resetStoryProgress: () => void;
  /** Wipes everything: character, color, progress, the whole decision log. Starts over from the name screen. */
  resetEverything: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);
  const [progress, setProgress] = useState<StoryProgress>(loadProgress);
  const [activeRandomEvent, setActiveRandomEvent] = useState<RandomEvent | null>(null);
  const [lastOutcome, setLastOutcome] = useState<{
    choice: OutcomeChoice;
    statsBefore: PlayerStats;
  } | null>(null);

  useEffect(() => {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  // Upserts this player's remote summary doc (see logPlayerSummary.ts)
  // after every completed chapter, not just at the ending — so a player
  // who quits partway through still shows up in the aggregate data instead
  // of only ever-finishing players counting. visitedChapterIds only grows
  // when goToChapter moves the player off a completed chapter (including
  // onto the ending chapter itself), so this fires exactly at "end of
  // chapter" boundaries. No-ops entirely if Firebase isn't configured.
  useEffect(() => {
    if (progress.visitedChapterIds.length === 0) return;
    const log = getDecisionLog();
    const avgQualityScore = computeAverageQualityScore(log, lifePathArc.id);
    const gainResults = computeKnowledgeGain(log, lifePathArc);
    const validGains = gainResults.map((r) => r.gain).filter((g): g is number => g !== null);
    const avgKnowledgeGain = validGains.length
      ? validGains.reduce((a, b) => a + b, 0) / validGains.length
      : null;
    const netWorth = progress.stats.savings - progress.stats.debt;
    const currentChapterNode = lifePathArc.chapters[progress.currentChapterId];
    void logPlayerSummary({
      arcId: lifePathArc.id,
      characterName: profile.characterName,
      avgQualityScore,
      avgKnowledgeGain,
      netWorth,
      chaptersCompleted: progress.visitedChapterIds.length,
      completed: Boolean(currentChapterNode?.isEnding),
    });
    // Intentionally keyed only on chapter-completion count — this should
    // fire once per chapter boundary, not on every stat/profile tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.visitedChapterIds.length]);

  const currentChapter = lifePathArc.chapters[progress.currentChapterId] ?? lifePathArc.chapters[lifePathArc.startChapterId];
  const currentQuestion = currentChapter.questions?.[progress.currentQuestionIndex] ?? null;
  const questionProgress = currentChapter.questions
    ? { index: progress.currentQuestionIndex + 1, total: currentChapter.questions.length }
    : null;
  const totalChapterCount = lifePathArc.pathLength;

  const setCharacterName = useCallback((name: string) => {
    setProfile((p) => ({ ...p, characterName: name.trim() || "Player" }));
  }, []);

  const setAccentId = useCallback((id: string) => {
    setProfile((p) => ({ ...p, accentId: id }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setProfile((p) => ({ ...p, onboarded: true }));
  }, []);

  const goToChapter = useCallback((chapterId: string) => {
    const target = lifePathArc.chapters[chapterId];
    setProgress((p) => ({
      ...p,
      currentChapterId: chapterId,
      currentQuestionIndex: 0,
      currentVariantIndex: randomIndex(target?.questions?.[0]?.variants.length ?? 1),
      visitedChapterIds: p.visitedChapterIds.includes(chapterId)
        ? p.visitedChapterIds
        : [...p.visitedChapterIds, chapterId],
    }));
  }, []);

  const continueFromNarrative = useCallback(() => {
    const next = currentChapter.nextChapterId;
    if (next && next !== "END") goToChapter(next);
  }, [currentChapter, goToChapter]);

  const makeChoice = useCallback(
    (choiceId: string) => {
      const choice: OutcomeChoice | undefined = currentQuestion
        ? currentQuestion.choices.find((c) => c.id === choiceId)
        : currentChapter.choices.find((c) => c.id === choiceId);
      if (!choice) return;

      logDecision({
        arcId: lifePathArc.id,
        chapterId: currentChapter.id,
        choiceId: choice.id,
        financialQualityScore: choice.financialQualityScore,
        timestamp: Date.now(),
      });

      const statsBefore = progress.stats;
      const randomEventSource = currentQuestion?.randomEvent ?? currentChapter.randomEvent;
      let firedEvent: RandomEvent | null = null;

      if (randomEventSource && Math.random() < randomEventSource.chance) {
        firedEvent = randomEventSource;
      }

      const statsAfter = addEffects(addEffects(statsBefore, choice.statEffects), firedEvent?.statEffects);

      setActiveRandomEvent(firedEvent);
      setLastOutcome({ choice, statsBefore });
      setProgress((p) => ({
        ...p,
        stats: statsAfter,
        statsHistory: [...p.statsHistory, statsAfter],
        streak: p.streak + 1,
      }));
      setProfile((prof) => ({
        ...prof,
        cumulativeStats: addEffects(
          addEffects(prof.cumulativeStats, choice.statEffects),
          firedEvent?.statEffects,
        ),
      }));
    },
    [currentChapter, currentQuestion, progress.stats],
  );

  const acknowledgeOutcome = useCallback(() => {
    if (!lastOutcome) return;
    setLastOutcome(null);
    setActiveRandomEvent(null);

    if (currentChapter.questions) {
      const isLast = progress.currentQuestionIndex >= currentChapter.questions.length - 1;
      if (isLast) {
        const next = currentChapter.nextChapterId;
        if (next && next !== "END") goToChapter(next);
      } else {
        const nextQuestion = currentChapter.questions[progress.currentQuestionIndex + 1];
        setProgress((p) => ({
          ...p,
          currentQuestionIndex: p.currentQuestionIndex + 1,
          currentVariantIndex: randomIndex(nextQuestion.variants.length),
        }));
      }
      return;
    }

    // Legacy single-question chapter: each Choice carries its own nextChapterId.
    const choice = currentChapter.choices.find((c) => c.id === lastOutcome.choice.id);
    const next = choice?.nextChapterId;
    if (next && next !== "END") goToChapter(next);
  }, [lastOutcome, currentChapter, progress.currentQuestionIndex, goToChapter]);

  const resetStoryProgress = useCallback(() => {
    clearDecisionLog();
    window.localStorage.removeItem(PROGRESS_KEY);
    setProgress(freshProgress());
    setProfile((p) => ({ ...p, cumulativeStats: { ...initialStats } }));
    setLastOutcome(null);
    setActiveRandomEvent(null);
  }, []);

  const resetEverything = useCallback(() => {
    clearDecisionLog();
    window.localStorage.removeItem(PROFILE_KEY);
    window.localStorage.removeItem(PROGRESS_KEY);
    setProfile(freshProfile());
    setProgress(freshProgress());
    setLastOutcome(null);
    setActiveRandomEvent(null);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      arc: lifePathArc,
      currentChapter,
      currentQuestion,
      questionProgress,
      profile,
      progress,
      activeRandomEvent,
      lastOutcome,
      totalChapterCount,
      setCharacterName,
      setAccentId,
      completeOnboarding,
      continueFromNarrative,
      makeChoice,
      acknowledgeOutcome,
      resetStoryProgress,
      resetEverything,
    }),
    [
      currentChapter,
      currentQuestion,
      questionProgress,
      profile,
      progress,
      activeRandomEvent,
      lastOutcome,
      totalChapterCount,
      setCharacterName,
      setAccentId,
      completeOnboarding,
      continueFromNarrative,
      makeChoice,
      acknowledgeOutcome,
      resetStoryProgress,
      resetEverything,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}

export function useDecisionLog() {
  return getDecisionLog();
}

export { clearDecisionLog };
