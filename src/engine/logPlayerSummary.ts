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
import { db, remoteLoggingEnabled } from "./firebaseClient";
import { getSessionId } from "./sessionId";

export interface PlayerSummaryInput {
  arcId: string;
  characterName: string;
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
    await setDoc(
      doc(db, "players", getSessionId()),
      {
        sessionId: getSessionId(),
        arcId: input.arcId,
        characterName: input.characterName,
        avgQualityScore: input.avgQualityScore,
        avgKnowledgeGain: input.avgKnowledgeGain,
        netWorth: input.netWorth,
        chaptersCompleted: input.chaptersCompleted,
        completed: input.completed,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    // Best-effort only — see header comment.
  }
}
