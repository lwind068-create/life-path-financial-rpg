import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { publishLeaderboardEntry } from "./leaderboard";
import { track } from "./analytics";
import { computeLifePoints } from "./lifePoints";
import {
  addQuestProgress,
  applyBoostToPoints,
  dayKey,
  buyBoost,
  depositToVault,
  ensureToday,
  freshBoostState,
  registerActivity,
  withdrawFromVault,
  type BoostId,
  type BoostState,
  type BuyError,
} from "./boosts";
import { getArcadeGame, type ArcadeGameId } from "./arcade";
import { ACCENT_OPTIONS, UNLOCKABLE_ACCENTS, UNLOCKABLE_TITLES, UNLOCKABLE_FRAMES } from "../content/characterOptions";

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
  /** Unique username claimed on first visit (see engine/username.ts). Empty until claimed. */
  username: string;
  characterName: string;
  accentId: string | null;
  /** True once the player has explicitly confirmed their color (clicked "Let's go"). */
  onboarded: boolean;
  /** Running total across the whole story. Since there's only ever one save slot now, this is the same as `progress.stats` — kept as its own field so it survives a "play again" without also wiping the character. */
  cumulativeStats: PlayerStats;
  /** Spendable Life Points balance — see engine/lifePoints.ts. Goes down when a color is unlocked. */
  lifePoints: number;
  /** Lifetime Life Points ever earned, never decreases — drives the player's rank/title. */
  totalLifePointsEarned: number;
  /** Ids of UNLOCKABLE_ACCENTS the player has purchased. */
  unlockedAccentIds: string[];
  /** Equipped title id from UNLOCKABLE_TITLES, or null/"none" for no title. Purely cosmetic. */
  titleId: string | null;
  /** Ids of UNLOCKABLE_TITLES the player has purchased. */
  unlockedTitleIds: string[];
  /** Equipped badge frame id from UNLOCKABLE_FRAMES, or null/"none" for no frame. Purely cosmetic. */
  frameId: string | null;
  /** Ids of UNLOCKABLE_FRAMES the player has purchased. */
  unlockedFrameIds: string[];
  /** Daily streak, daily quests, active boost, freezes, and the Savings Vault — see engine/boosts.ts. */
  boosts: BoostState;
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
  return {
    username: "",
    characterName: "",
    accentId: null,
    onboarded: false,
    cumulativeStats: { ...initialStats },
    lifePoints: 0,
    totalLifePointsEarned: 0,
    unlockedAccentIds: [],
    titleId: null,
    unlockedTitleIds: [],
    frameId: null,
    unlockedFrameIds: [],
    boosts: freshBoostState(),
  };
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
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    // Older saves predate boosts — merge field by field so they get defaults.
    return { ...freshProfile(), ...parsed, boosts: { ...freshBoostState(), ...(parsed.boosts ?? {}) } };
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
  lastOutcome: { choice: OutcomeChoice; statsBefore: PlayerStats; pointsAwarded: number; multiplier: number } | null;
  /** Short toasts (quest done, streak, vault interest). Each auto-clears after a few seconds. */
  notices: { id: number; text: string }[];
  dismissNotice: (id: number) => void;
  /** Spends Life Points on a boost. Returns null on success, or why it couldn't. */
  buyBoostItem: (id: BoostId) => BuyError | null;
  /** Moves up to `amount` spendable Life Points into the Savings Vault. */
  vaultDeposit: (amount: number) => void;
  /** Moves everything in the Savings Vault back to spendable Life Points. */
  vaultWithdraw: () => void;
  /** True if today's free Arcade ticket hasn't been used yet. */
  hasFreeTicket: boolean;
  /** Pays for one Arcade play (free ticket first, then Life Points). Returns false if the player can't afford it. */
  startArcadeGame: (id: ArcadeGameId) => boolean;
  /** Pays out an Arcade reward and records the score. */
  finishArcadeGame: (id: ArcadeGameId, score: number, reward: number) => void;
  totalChapterCount: number;
  setCharacterName: (name: string) => void;
  /** Saves the claimed unique username (also used as the character's name). */
  setUsername: (name: string) => void;
  setAccentId: (id: string) => void;
  completeOnboarding: () => void;
  continueFromNarrative: () => void;
  makeChoice: (choiceId: string) => void;
  acknowledgeOutcome: () => void;
  /** Restarts the story from the top — same character, fresh stats and progress. */
  resetStoryProgress: () => void;
  /** Wipes everything: character, color, progress, the whole decision log. Starts over from the name screen. */
  resetEverything: () => void;
  /**
   * Equips `id` if it's a starter color or already-purchased unlockable one.
   * If it's an unpurchased UNLOCKABLE_ACCENTS color, spends the required
   * Life Points and unlocks it first. Returns false (no-op) if it's an
   * unknown id or the player can't afford it yet.
   */
  unlockAccent: (id: string) => boolean;
  /** Same equip-or-purchase-then-equip behavior as unlockAccent, for cosmetic titles. "none" always equips for free. */
  unlockTitle: (id: string) => boolean;
  /** Same equip-or-purchase-then-equip behavior as unlockAccent, for cosmetic badge frames. "none" always equips for free. */
  unlockFrame: (id: string) => boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PlayerProfile>(loadProfile);
  const [progress, setProgress] = useState<StoryProgress>(loadProgress);
  const [activeRandomEvent, setActiveRandomEvent] = useState<RandomEvent | null>(null);
  const [lastOutcome, setLastOutcome] = useState<{
    choice: OutcomeChoice;
    statsBefore: PlayerStats;
    pointsAwarded: number;
    multiplier: number;
  } | null>(null);
  const [notices, setNotices] = useState<{ id: number; text: string }[]>([]);
  const noticeId = useRef(0);

  // Latest profile for event handlers that compute the next profile directly
  // (rather than via a setState updater) so notices fire exactly once.
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const pushNotices = useCallback((texts: string[]) => {
    if (texts.length === 0) return;
    const added = texts.map((text) => ({ id: ++noticeId.current, text }));
    setNotices((n) => [...n, ...added].slice(-4));
    for (const { id } of added) {
      window.setTimeout(() => setNotices((n) => n.filter((x) => x.id !== id)), 3800);
    }
  }, []);

  const dismissNotice = useCallback((id: number) => {
    setNotices((n) => n.filter((x) => x.id !== id));
  }, []);

  const commitProfile = useCallback((next: PlayerProfile) => {
    profileRef.current = next;
    setProfile(next);
  }, []);

  // Make sure today's quests exist on load and whenever the tab comes back
  // into focus (e.g. left open overnight).
  useEffect(() => {
    const refresh = () => {
      const cur = profileRef.current;
      const boosts = ensureToday(cur.boosts);
      if (boosts !== cur.boosts) commitProfile({ ...cur, boosts });
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [commitProfile]);

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
      username: profile.username,
      avgQualityScore,
      avgKnowledgeGain,
      netWorth,
      chaptersCompleted: progress.visitedChapterIds.length,
      completed: Boolean(currentChapterNode?.isEnding),
    });
    void publishLeaderboardEntry({
      username: profile.username,
      // Same figure the on-screen board shows (Home/EndingScreen).
      netWorth: profile.cumulativeStats.savings - profile.cumulativeStats.debt,
      lifePoints: profile.totalLifePointsEarned,
    });
    track("chapter_completed", { chapters_completed: progress.visitedChapterIds.length });
    if (currentChapterNode?.isEnding) track("game_completed", { net_worth: netWorth });
    // Intentionally keyed only on chapter-completion count — this should
    // fire once per chapter boundary, not on every stat/profile tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.visitedChapterIds.length]);

  // Keep the public score in sync with Life Points earned anywhere (story,
  // quests, Arcade) — debounced so a burst of rewards is one write.
  useEffect(() => {
    if (!profile.username) return;
    const t = window.setTimeout(() => {
      void publishLeaderboardEntry({
        username: profile.username,
        netWorth: profile.cumulativeStats.savings - profile.cumulativeStats.debt,
        lifePoints: profile.totalLifePointsEarned,
      });
    }, 1500);
    return () => window.clearTimeout(t);
  }, [profile.username, profile.totalLifePointsEarned, profile.cumulativeStats.savings, profile.cumulativeStats.debt]);

  const currentChapter = lifePathArc.chapters[progress.currentChapterId] ?? lifePathArc.chapters[lifePathArc.startChapterId];
  const currentQuestion = currentChapter.questions?.[progress.currentQuestionIndex] ?? null;
  const questionProgress = currentChapter.questions
    ? { index: progress.currentQuestionIndex + 1, total: currentChapter.questions.length }
    : null;
  const totalChapterCount = lifePathArc.pathLength;

  const setCharacterName = useCallback((name: string) => {
    setProfile((p) => ({ ...p, characterName: name.trim() || "Player" }));
  }, []);

  const setUsername = useCallback((name: string) => {
    setProfile((p) => ({ ...p, username: name, characterName: name }));
  }, []);

  const setAccentId = useCallback((id: string) => {
    setProfile((p) => ({ ...p, accentId: id }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setProfile((p) => ({ ...p, onboarded: true }));
  }, []);

  const goToChapter = useCallback((chapterId: string) => {
    const target = lifePathArc.chapters[chapterId];
    // Moving off a chapter = finishing it (counts toward the "finish a chapter" quest).
    const cur = profileRef.current;
    const quest = addQuestProgress(cur.boosts, "chapters");
    commitProfile({
      ...cur,
      boosts: quest.state,
      lifePoints: cur.lifePoints + quest.earned,
      totalLifePointsEarned: cur.totalLifePointsEarned + quest.earned,
    });
    pushNotices(quest.notices);
    setProgress((p) => ({
      ...p,
      currentChapterId: chapterId,
      currentQuestionIndex: 0,
      currentVariantIndex: randomIndex(target?.questions?.[0]?.variants.length ?? 1),
      visitedChapterIds: p.visitedChapterIds.includes(chapterId)
        ? p.visitedChapterIds
        : [...p.visitedChapterIds, chapterId],
    }));
  }, [commitProfile, pushNotices]);

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

      const isMeasurementChapter = Boolean(currentChapter.isBaselineChoice || currentChapter.isMirrorChoice);
      const basePoints = computeLifePoints(choice.financialQualityScore, isMeasurementChapter);

      // Boost layer (engine/boosts.ts): daily streak + vault interest, then the
      // active multiplier, then quest progress. The multiplier is the same for
      // every option, so it never changes which choice is "worth" more.
      const cur = profileRef.current;
      const activity = registerActivity(cur.boosts);
      const boosted = applyBoostToPoints(activity.state, basePoints);
      const choiceQuest = addQuestProgress(boosted.state, "choices");
      const isSmart = !isMeasurementChapter && choice.financialQualityScore >= 4;
      const smartQuest = isSmart ? addQuestProgress(choiceQuest.state, "smartChoices") : { ...choiceQuest, earned: 0, notices: [] };
      const pointsAwarded = boosted.points;
      const bonus = activity.earned + choiceQuest.earned + smartQuest.earned;
      const lifetimeOnly = activity.lifetimeOnly ?? 0;

      setActiveRandomEvent(firedEvent);
      setLastOutcome({ choice, statsBefore, pointsAwarded, multiplier: boosted.multiplier });
      setProgress((p) => ({
        ...p,
        stats: statsAfter,
        statsHistory: [...p.statsHistory, statsAfter],
        streak: p.streak + 1,
      }));
      commitProfile({
        ...cur,
        boosts: smartQuest.state,
        cumulativeStats: addEffects(
          addEffects(cur.cumulativeStats, choice.statEffects),
          firedEvent?.statEffects,
        ),
        lifePoints: cur.lifePoints + pointsAwarded + bonus,
        totalLifePointsEarned: cur.totalLifePointsEarned + pointsAwarded + bonus + lifetimeOnly,
      });
      pushNotices([...activity.notices, ...choiceQuest.notices, ...smartQuest.notices]);
    },
    [currentChapter, currentQuestion, progress.stats, commitProfile, pushNotices],
  );

  const buyBoostItem = useCallback(
    (id: BoostId): BuyError | null => {
      const cur = profileRef.current;
      const result = buyBoost(cur.boosts, id, cur.lifePoints);
      if (!result.ok) return result.error;
      commitProfile({
        ...cur,
        boosts: result.state,
        lifePoints: cur.lifePoints - result.cost + result.earned,
        totalLifePointsEarned: cur.totalLifePointsEarned + result.earned,
      });
      pushNotices(result.notices);
      return null;
    },
    [commitProfile, pushNotices],
  );

  const vaultDeposit = useCallback(
    (amount: number) => {
      const cur = profileRef.current;
      const result = depositToVault(cur.boosts, amount, cur.lifePoints);
      if (result.moved === 0) return;
      commitProfile({
        ...cur,
        boosts: result.state,
        lifePoints: cur.lifePoints - result.moved + result.earned,
        totalLifePointsEarned: cur.totalLifePointsEarned + result.earned,
      });
      pushNotices([`Moved ${result.moved} into the Savings Vault`, ...result.notices]);
    },
    [commitProfile, pushNotices],
  );

  const hasFreeTicket = profile.boosts.freeTicketDay !== dayKey();

  const startArcadeGame = useCallback(
    (id: ArcadeGameId) => {
      const game = getArcadeGame(id);
      const cur = profileRef.current;
      if (!game) return false;
      const today = dayKey();
      if (cur.boosts.freeTicketDay !== today) {
        commitProfile({ ...cur, boosts: { ...cur.boosts, freeTicketDay: today } });
        pushNotices(["Free daily Arcade play used 🎟️"]);
        return true;
      }
      if (cur.lifePoints < game.cost) return false;
      commitProfile({ ...cur, lifePoints: cur.lifePoints - game.cost });
      return true;
    },
    [commitProfile, pushNotices],
  );

  const finishArcadeGame = useCallback(
    (id: ArcadeGameId, score: number, reward: number) => {
      const cur = profileRef.current;
      const quest = addQuestProgress(cur.boosts, "arcade");
      const best = Math.max(cur.boosts.arcadeBest[id] ?? 0, score);
      const isNewBest = score > (cur.boosts.arcadeBest[id] ?? 0);
      const earned = Math.max(0, Math.round(reward)) + quest.earned;
      commitProfile({
        ...cur,
        boosts: { ...quest.state, arcadeBest: { ...quest.state.arcadeBest, [id]: best } },
        lifePoints: cur.lifePoints + earned,
        totalLifePointsEarned: cur.totalLifePointsEarned + earned,
      });
      pushNotices([...(isNewBest && score > 0 ? ["New personal best! 🏆"] : []), ...quest.notices]);
    },
    [commitProfile, pushNotices],
  );

  const vaultWithdraw = useCallback(() => {
    const cur = profileRef.current;
    const result = withdrawFromVault(cur.boosts);
    if (result.moved === 0) return;
    commitProfile({ ...cur, boosts: result.state, lifePoints: cur.lifePoints + result.moved });
    pushNotices([`Withdrew ${result.moved} from the Savings Vault`]);
  }, [commitProfile, pushNotices]);

  const unlockAccent = useCallback(
    (id: string) => {
      const isStarter = ACCENT_OPTIONS.some((a) => a.id === id);
      const isAlreadyOwned = isStarter || profile.unlockedAccentIds.includes(id);
      if (isAlreadyOwned) {
        setProfile((p) => ({ ...p, accentId: id }));
        return true;
      }
      const option = UNLOCKABLE_ACCENTS.find((a) => a.id === id);
      if (!option || profile.lifePoints < option.cost) return false;
      setProfile((p) => ({
        ...p,
        lifePoints: p.lifePoints - option.cost,
        unlockedAccentIds: [...p.unlockedAccentIds, id],
        accentId: id,
      }));
      return true;
    },
    [profile],
  );

  const unlockTitle = useCallback(
    (id: string) => {
      const isAlreadyOwned = id === "none" || profile.unlockedTitleIds.includes(id);
      if (isAlreadyOwned) {
        setProfile((p) => ({ ...p, titleId: id }));
        return true;
      }
      const option = UNLOCKABLE_TITLES.find((t) => t.id === id);
      if (!option || profile.lifePoints < option.cost) return false;
      setProfile((p) => ({
        ...p,
        lifePoints: p.lifePoints - option.cost,
        unlockedTitleIds: [...p.unlockedTitleIds, id],
        titleId: id,
      }));
      return true;
    },
    [profile],
  );

  const unlockFrame = useCallback(
    (id: string) => {
      const isAlreadyOwned = id === "none" || profile.unlockedFrameIds.includes(id);
      if (isAlreadyOwned) {
        setProfile((p) => ({ ...p, frameId: id }));
        return true;
      }
      const option = UNLOCKABLE_FRAMES.find((f) => f.id === id);
      if (!option || profile.lifePoints < option.cost) return false;
      setProfile((p) => ({
        ...p,
        lifePoints: p.lifePoints - option.cost,
        unlockedFrameIds: [...p.unlockedFrameIds, id],
        frameId: id,
      }));
      return true;
    },
    [profile],
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
      setUsername,
      setAccentId,
      completeOnboarding,
      continueFromNarrative,
      makeChoice,
      acknowledgeOutcome,
      resetStoryProgress,
      resetEverything,
      unlockAccent,
      unlockTitle,
      unlockFrame,
      notices,
      dismissNotice,
      buyBoostItem,
      vaultDeposit,
      vaultWithdraw,
      hasFreeTicket,
      startArcadeGame,
      finishArcadeGame,
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
      setUsername,
      setAccentId,
      completeOnboarding,
      continueFromNarrative,
      makeChoice,
      acknowledgeOutcome,
      resetStoryProgress,
      resetEverything,
      unlockAccent,
      unlockTitle,
      unlockFrame,
      notices,
      dismissNotice,
      buyBoostItem,
      vaultDeposit,
      vaultWithdraw,
      hasFreeTicket,
      startArcadeGame,
      finishArcadeGame,
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
