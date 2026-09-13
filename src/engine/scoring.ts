// ---------------------------------------------------------------------------
// Ethical framing, read this before touching anything in this file.
//
// This module computes a naturalistic behavioral measure of financial
// decision-making quality, embedded directly in gameplay. It is NOT a
// disguised test dressed up as a game: the player is never told they are
// being scored, but nothing here is designed to mislead a parent, teacher,
// researcher, or reviewer who looks at how it works. The `job_offer` /
// `promotion_offer` chapters are structurally parallel (same tradeoff
// shape, same 1-5 quality tiers) so the pre/post comparison is defensible,
// and the full decision log is always available, unredacted, to anyone
// with legitimate access (see routes/Debug.tsx) — this file must never be
// changed to hide, obfuscate, or misrepresent what data is collected or
// how the "knowledge gain" figure is derived.
//
// Nothing computed here is ever rendered to the player as a number, a
// score, or the word "assessment." The only player-facing use of this data
// is the narrative-flavored, non-numeric social-proof line on the ending
// share card (see ShareCard.tsx).
// ---------------------------------------------------------------------------
import type { DecisionLogEntry } from "../content/types";
import { firstJobArc } from "../content/firstJobArc";

export interface KnowledgeGainResult {
  baselineChapterId: string;
  mirrorChapterId: string;
  baselineScore: number | null;
  mirrorScore: number | null;
  /** mirrorScore - baselineScore. Null if either side is missing. */
  gain: number | null;
}

function averageScoreForChapter(
  decisionLog: DecisionLogEntry[],
  arcId: string,
  chapterId: string,
): number | null {
  const entries = decisionLog.filter((e) => e.arcId === arcId && e.chapterId === chapterId);
  if (entries.length === 0) return null;
  return entries.reduce((sum, e) => sum + e.financialQualityScore, 0) / entries.length;
}

/**
 * Finds the arc's baseline chapter and the chapter(s) that mirror it, then
 * diffs the player's financialQualityScore on each from the decision log.
 * Baseline/mirror chapters may contain several questions (see
 * Chapter.questions) — in that case each side is the AVERAGE score across
 * every question logged under that chapterId, giving a steadier pre/post
 * comparison than a single question would.
 */
export function computeKnowledgeGain(
  decisionLog: DecisionLogEntry[],
  arc = firstJobArc,
): KnowledgeGainResult[] {
  const chapters = Object.values(arc.chapters);
  const baselineChapters = chapters.filter((c) => c.isBaselineChoice);

  return baselineChapters.map((baseline) => {
    const mirror = chapters.find(
      (c) => c.isMirrorChoice && c.mirrorOf === baseline.id,
    );

    const baselineScore = averageScoreForChapter(decisionLog, arc.id, baseline.id);
    const mirrorScore = mirror
      ? averageScoreForChapter(decisionLog, arc.id, mirror.id)
      : null;

    return {
      baselineChapterId: baseline.id,
      mirrorChapterId: mirror?.id ?? "",
      baselineScore,
      mirrorScore,
      gain:
        baselineScore !== null && mirrorScore !== null
          ? mirrorScore - baselineScore
          : null,
    };
  });
}

/** Average financialQualityScore across every logged choice in the arc. */
export function computeAverageQualityScore(
  decisionLog: DecisionLogEntry[],
  arcId = firstJobArc.id,
): number | null {
  const entries = decisionLog.filter((e) => e.arcId === arcId);
  if (entries.length === 0) return null;
  const total = entries.reduce((sum, e) => sum + e.financialQualityScore, 0);
  return total / entries.length;
}

/**
 * Narrative-flavored, non-numeric social-proof line for the share card.
 * Computed from a fixed reference distribution for the MVP (no backend to
 * aggregate real player data against yet) — swap `sampleGain` for a real
 * aggregate once one exists. Never shows a raw score.
 */
export function computeSocialProofPercentile(gain: number | null): number {
  if (gain === null) return 50;
  // Rough reference curve: most players gain 0-2 points, few gain 3+.
  const referenceDistribution = [-1, 0, 0, 1, 1, 1, 2, 2, 3, 3];
  const below = referenceDistribution.filter((g) => g < gain).length;
  const percentile = Math.round((below / referenceDistribution.length) * 100);
  return Math.min(97, Math.max(5, percentile));
}
