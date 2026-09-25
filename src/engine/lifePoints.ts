// ---------------------------------------------------------------------------
// Life Points — a player-facing reward currency. Deliberately kept separate
// from the hidden `financialQualityScore` research measure in scoring.ts.
//
// On the game's two baseline/mirror measurement chapters (flagged via
// Chapter.isBaselineChoice / isMirrorChoice — currently job_offer /
// promotion_offer and funding_choice / growth_offer), every choice awards
// the SAME flat number of points no matter which one is picked. That keeps
// the points economy from ever creating an incentive to "solve for the
// points" on exactly the two decisions the knowledge-gain comparison
// depends on. Everywhere else in the story, points scale with decision
// quality — same 1-5 financialQualityScore already used for scoring, just
// turned into an ordinary, visible game reward instead of a hidden one.
// ---------------------------------------------------------------------------

const FLAT_MEASUREMENT_POINTS = 20;
const BASE_POINTS = 8;
const QUALITY_MULTIPLIER = 6;

/** Points awarded for one choice. `isMeasurementChapter` should be `Boolean(chapter.isBaselineChoice || chapter.isMirrorChoice)`. */
export function computeLifePoints(financialQualityScore: number, isMeasurementChapter: boolean): number {
  if (isMeasurementChapter) return FLAT_MEASUREMENT_POINTS;
  return BASE_POINTS + financialQualityScore * QUALITY_MULTIPLIER;
}

export interface Rank {
  id: string;
  title: string;
  /** Lifetime Life Points earned needed to reach this rank. */
  threshold: number;
}

export const RANKS: Rank[] = [
  { id: "rookie", title: "Rookie", threshold: 0 },
  { id: "saver", title: "Saver", threshold: 150 },
  { id: "planner", title: "Planner", threshold: 350 },
  { id: "investor", title: "Investor", threshold: 650 },
  { id: "mogul", title: "Mogul", threshold: 1000 },
];

export function getRank(totalLifePointsEarned: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (totalLifePointsEarned >= rank.threshold) current = rank;
  }
  return current;
}

export function getNextRank(totalLifePointsEarned: number): Rank | null {
  const currentIndex = RANKS.findIndex((r) => r.id === getRank(totalLifePointsEarned).id);
  return RANKS[currentIndex + 1] ?? null;
}

/** 0-1 progress from the current rank's threshold to the next rank's, for a progress bar. Null once maxed out. */
export function getRankProgress(totalLifePointsEarned: number): number | null {
  const current = getRank(totalLifePointsEarned);
  const next = getNextRank(totalLifePointsEarned);
  if (!next) return null;
  const span = next.threshold - current.threshold;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (totalLifePointsEarned - current.threshold) / span));
}
