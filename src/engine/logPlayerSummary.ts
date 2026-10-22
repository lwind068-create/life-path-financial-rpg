// Writes/updates one summary document per anonymous player, called after
// every chapter (see GameContext.tsx) rather than only at the ending — so
// someone who plays three chapters and closes the tab still shows up in
// the aggregate data instead of vanishing entirely. `completed` is what
// distinguishes a finished run from a dropped-off one; scripts/fetch-stats.mjs
// uses it to report completion rate honestly instead of assuming every
// summary doc means a finished game.
//
// Same rule as logDecision: localStorage/gameplay never depends on this.
// If Firebase isn't configured, or the write fails, it silently no-ops.
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db, getUid, remoteLoggingEnabled } from "./firebaseClient";
import { getSessionId } from "./sessionId";
import { getTrafficSource } from "./analytics";

export interface PlayerSummaryInput {
  arcId: string;
  characterName: string;
  /** Unique username (may be empty for players from before usernames existed). */
  username: string;
  avgQualityScore: number | null;
  avgKnowledgeGain: number | null;
  netWorth: number;
  /** How many chapters this player has finished so far this run. */
  chaptersCompleted: number;
  /** True once they've reached the arc's ending chapter. */
  completed: boolean;
}

export async function logPlayerSummary(input: PlayerSummaryInput): Promise<void> {
  if (!remoteLoggingEnabled || !db) return;
  try {
    // One summary doc per player account (players/{uid}) — see firestore.rules.
    const uid = await getUid();
    if (!uid) return;
    const source = getTrafficSource();
    await setDoc(
      doc(db, "players", uid),
      {
        uid,
        sessionId: getSessionId(),
        firstSeenAt: source.firstSeenAt ?? null,
        arcId: input.arcId,
        characterName: input.characterName,
        username: input.username,
        avgQualityScore: input.avgQualityScore,
        avgKnowledgeGain: input.avgKnowledgeGain,
        netWorth: input.netWorth,
        chaptersCompleted: input.chaptersCompleted,
        completed: input.completed,
        // First-touch channel (utm_source / referrer) — see analytics.ts.
        trafficSource: source.source,
        trafficCampaign: source.campaign,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    // Best-effort only — see header comment.
  }
}

export interface EngagementInput {
  arcId: string;
  username: string;
  lifePoints: number;
  totalLifePointsEarned: number;
  dailyStreak: number;
  bestStreak: number;
  vault: number;
  arcadeBest: Record<string, number>;
  totals: {
    daysPlayed: number;
    questsCompleted: number;
    boostsBought: number;
    arcadePlays: number;
    arcadePlaysByGame: Record<string, number>;
  };
}

/** Merges engagement numbers (points, streaks, quests, boosts, Arcade) into players/{uid}. Best-effort. */
export async function logEngagement(input: EngagementInput): Promise<void> {
  if (!remoteLoggingEnabled || !db) return;
  try {
    const uid = await getUid();
    if (!uid) return;
    await setDoc(
      doc(db, "players", uid),
      {
        uid,
        sessionId: getSessionId(),
        arcId: input.arcId,
        username: input.username,
        lifePoints: input.lifePoints,
        totalLifePointsEarned: input.totalLifePointsEarned,
        dailyStreak: input.dailyStreak,
        bestStreak: input.bestStreak,
        vault: input.vault,
        arcadeBest: input.arcadeBest,
        daysPlayed: input.totals.daysPlayed,
        questsCompleted: input.totals.questsCompleted,
        boostsBought: input.totals.boostsBought,
        arcadePlays: input.totals.arcadePlays,
        arcadePlaysByGame: input.totals.arcadePlaysByGame,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    // Best-effort only.
  }
}
