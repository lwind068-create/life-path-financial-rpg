// Real-player leaderboard backed by Firestore leaderboard/{sessionId}.
//
// Deliberately separate from players/{sessionId}: that collection holds
// research data (knowledge gain, quality scores) and stays unreadable from
// the client. This one holds only what's shown publicly on the board — a
// character name (capped at 16 chars) and two scores — and is world-
// readable by design (see firestore.rules).
//
// If Firebase isn't configured, the rules haven't been published yet, or a
// read fails for any reason, fetchTopEntries returns null and the
// Leaderboard component falls back to showing just the player's own row.
import { collection, doc, getDocs, limit, orderBy, query, setDoc } from "firebase/firestore";
import { db, remoteLoggingEnabled } from "./firebaseClient";
import { getSessionId } from "./sessionId";

export type LeaderboardMetric = "netWorth" | "lifePoints";

export interface LeaderboardEntry {
  sessionId: string;
  name: string;
  netWorth: number;
  lifePoints: number;
}

export const MAX_NAME_LENGTH = 16;

export function publicName(name: string): string {
  return (name.trim() || "Player").slice(0, MAX_NAME_LENGTH);
}

export async function publishLeaderboardEntry(input: {
  name: string;
  netWorth: number;
  lifePoints: number;
}): Promise<void> {
  if (!remoteLoggingEnabled || !db) return;
  const sessionId = getSessionId();
  try {
    await setDoc(doc(db, "leaderboard", sessionId), {
      sessionId,
      name: publicName(input.name),
      netWorth: Math.round(input.netWorth),
      lifePoints: Math.round(input.lifePoints),
    });
  } catch {
    // Best-effort only.
  }
}

export async function fetchTopEntries(
  metric: LeaderboardMetric,
  count: number,
): Promise<LeaderboardEntry[] | null> {
  if (!remoteLoggingEnabled || !db) return null;
  try {
    const snap = await getDocs(query(collection(db, "leaderboard"), orderBy(metric, "desc"), limit(count)));
    return snap.docs.map((d) => d.data() as LeaderboardEntry);
  } catch {
    return null;
  }
}
