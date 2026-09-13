// Shared content schema for story arcs.
//
// Keep all narrative/choice content in files under src/content/ (one file
// per arc). Nothing in src/engine or src/components should ever import
// arc-specific text directly — they only know this shape. That's what lets
// a second arc (e.g. "Starting a Business") get added later by dropping in
// a new content file, without touching the game engine.

export interface PlayerStats {
  cash: number;
  savings: number;
  debt: number;
  /** 0-10, purely narrative/flavor stat. Never used for scoring. */
  stress: number;
}

export interface RandomEvent {
  id: string;
  /** 0-1 chance this fires, independent of the choice made. */
  chance: number;
  bannerText: string;
  statEffects?: Partial<PlayerStats>;
}

export interface Choice {
  id: string;
  /** Player-facing choice text. */
  label: string;
  /** What happens next, shown after picking. */
  outcomeNarrative: string;
  /**
   * 1-5 internal judgment-quality rating for this choice. NEVER rendered
   * in player-facing UI. See src/engine/scoring.ts for how this is used.
   */
  financialQualityScore: number;
  nextChapterId: string | "END";
  statEffects?: Partial<PlayerStats>;
}

/**
 * Choice nested inside a QuestionBeat. Usually has no nextChapterId — the
 * parent Chapter's own nextChapterId governs what happens once every
 * question in the sequence is done. The exception is the LAST question in
 * a chapter that branches (e.g. job_offer): give each of its choices its
 * own nextChapterId there to send the player down a different chapter
 * depending on which one they picked, overriding the chapter-level default.
 */
export interface QuestionChoice {
  id: string;
  label: string;
  outcomeNarrative: string;
  financialQualityScore: number;
  statEffects?: Partial<PlayerStats>;
  nextChapterId?: string | "END";
  /** Dollar figure shown as a badge when the parent question has `menuStyle: true`. */
  amount?: number;
  /** Badge color for that amount — positive (banked), negative (spent), neutral (mixed). */
  tone?: "positive" | "negative" | "neutral";
}

export interface NarrativeVariant {
  id: string;
  /** Short scenario-framing text — one of a few random takes on the same underlying question. */
  narrative: string;
}

/** One fictional stock shown on an interactive ticker board (see QuestionBeat.tickers). */
export interface TickerConfig {
  symbol: string;
  name: string;
  price: number;
}

/**
 * One question within a multi-question chapter (see Chapter.questions).
 * `variants` are alternate narrative framings of the SAME decision — one is
 * picked at random each time this question is reached, for replay variety.
 * `choices` stay identical across variants: financialQualityScore integrity
 * (and the position-rotation discipline — see the content files' header
 * comments) must hold regardless of which variant is showing.
 */
export interface QuestionBeat {
  id: string;
  icon?: string;
  variants: NarrativeVariant[];
  choices: QuestionChoice[];
  /** Optional independent random event, scoped to just this one question. */
  randomEvent?: RandomEvent;
  /** Optional live-jittering stock ticker board shown above this question's narrative. Purely ambient/visual — never affects scoring. */
  tickers?: TickerConfig[];
  /** Optional "here's what actually happened" settled ticker snapshot shown on this question's outcome screen. */
  outcomeTickers?: TickerConfig[];
  /** Optional quick self-checked arithmetic prompt shown above this question's narrative. Flavor only — never gates progress or affects scoring. */
  mathChallenge?: { prompt: string; answer: number; unit?: string };
  /** Render `choices` as a visual spending menu (price + pos/neg badge per card) instead of the default choice-button list. Uses each choice's `amount`/`tone`. */
  menuStyle?: boolean;
  /** Render `choices` (must be exactly 3) as a draggable three-zone slider instead of the default choice-button list. */
  sliderStyle?: boolean;
}

export interface Chapter {
  id: string;
  /** In-world title. Never mentions "assessment," "test," "quiz," or "score." */
  title: string;
  /** Icon name (see ChapterIcon.tsx) shown as the chapter's scene badge. */
  icon?: string;
  /** Marks the pre-measurement chapter (there should be exactly one per arc). */
  isBaselineChoice?: boolean;
  /** Marks the post-measurement chapter that mirrors a baseline chapter. */
  isMirrorChoice?: boolean;
  /** Chapter id this mirrors, for scoring purposes. */
  mirrorOf?: string;
  /** Story text shown before the choice. Unused when `questions` is set. */
  narrative: string;
  /** Empty for pure-narrative chapters (e.g. the intro) that just continue. Unused when `questions` is set. */
  choices: Choice[];
  /**
   * A sequence of questions played back-to-back within this one chapter
   * "scene" — the chapter tracker doesn't advance until the last one is
   * answered. When set, `narrative`/`choices` above are ignored.
   */
  questions?: QuestionBeat[];
  /** Chapter id to continue to once there are no more questions (or for intro-style chapters with none at all). */
  nextChapterId?: string | "END";
  /** Optional independent random event system (see Chapter 3 in the design doc). */
  randomEvent?: RandomEvent;
  /** True for the final chapter, which branches on cumulative stats. */
  isEnding?: boolean;
  /**
   * Branching ending narrative, evaluated top-to-bottom; the first variant
   * whose minAvgQualityScore the player's average financialQualityScore
   * meets or exceeds is used. Only present on the ending chapter.
   */
  endingVariants?: EndingVariant[];
}

export interface EndingVariant {
  id: string;
  minAvgQualityScore: number;
  headline: string;
  narrative: string;
}

export interface StoryArc {
  id: string;
  title: string;
  /** One-line description shown on the arc-select card. */
  blurb?: string;
  /** In-world teaser for the next arc, shown on the ending screen. */
  nextArcTeaser?: string;
  startChapterId: string;
  /**
   * Number of chapters in a single playthrough's path (intro through
   * ending), NOT `Object.keys(chapters).length` — that count also includes
   * branch variants a given player never visits. Drives the chapter
   * tracker's notch count, so it must stay the same across every branch.
   */
  pathLength: number;
  chapters: Record<string, Chapter>;
}

export interface DecisionLogEntry {
  arcId: string;
  chapterId: string;
  choiceId: string;
  financialQualityScore: number;
  timestamp: number;
}
