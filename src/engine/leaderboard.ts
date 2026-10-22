// Real-player leaderboard backed by Firestore scores/{uid}.
//
// Each doc holds only what's shown publicly: the player's unique username
// and two scores. firestore.rules only lets a signed-in player write their
// own doc, and only under the username they actually own — so names on the
// board are unique and scores can't be overwritten by anyone else. The
// research data in players/ stays unreadable from the client.
import { collection, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db, getUid, remoteLoggingEnabled } from "./firebaseClient";

export type LeaderboardMetric = "netWorth" | "lifePoints";

export interface LeaderboardEntry {
  uid: string;
  name: string;
  netWorth: number;
  lifePoints: number;
}

export async function publishLeaderboardEntry(input: {
  username: string;
  netWorth: number;
  lifePoints: number;
}): Promise<void> {
  if (!remoteLoggingEnabled || !db || !input.username) return;
  const uid = await getUid();
  if (!uid) return;
  try {
    await setDoc(doc(db, "scores", uid), {
      name: input.username,
      netWorth: Math.round(input.netWorth),
      lifePoints: Math.max(0, Math.round(input.lifePoints)),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Best-effort only.
  }
}

export async function fetchTopEntries(metric: LeaderboardMetric, count: number): Promise<LeaderboardEntry[] | null> {
  if (!remoteLoggingEnabled || !db) return null;
  try {
    const snap = await getDocs(query(collection(db, "scores"), orderBy(metric, "desc"), limit(count)));
    return snap.docs.map((d) => {
      const data = d.data();
      return { uid: d.id, name: String(data.name ?? ""), netWorth: Number(data.netWorth ?? 0), lifePoints: Number(data.lifePoints ?? 0) };
    });
  } catch {
    return null;
  }
}
