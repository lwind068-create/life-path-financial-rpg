// Real-player leaderboard backed by Firestore scores/{uid}.
//
// Each doc holds only what's shown publicly: the player's unique username
// and two scores. firestore.rules only lets a signed-in player write their
// own doc, and only under the username they actually own - so names on the
// board are unique and scores can't be overwritten by anyone else. The
// research data in players/ stays unreadable from the client.
//
// Both scores are "best ever": a new run (Play again, or a story update that
// restarts old saves) starts net worth back at the beginning, so we never
// let a write lower what's already on the board.
import { collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db, getUid, remoteLoggingEnabled } from "./firebaseClient";

export type LeaderboardMetric = "netWorth" | "lifePoints";

export interface LeaderboardEntry {
  uid: string;
  name: string;
  netWorth: number;
  lifePoints: number;
}

export async function fetchMyEntry(): Promise<LeaderboardEntry | null> {
  if (!remoteLoggingEnabled || !db) return null;
  const uid = await getUid();
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, "scores", uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return { uid, name: String(data.name ?? ""), netWorth: Number(data.netWorth ?? 0), lifePoints: Number(data.lifePoints ?? 0) };
  } catch {
    return null;
  }
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
    const mine = await fetchMyEntry();
    const sameName = mine && mine.name === input.username;
    const netWorth = Math.round(sameName ? Math.max(mine.netWorth, input.netWorth) : input.netWorth);
    const lifePoints = Math.max(0, Math.round(sameName ? Math.max(mine.lifePoints, input.lifePoints) : input.lifePoints));
    if (sameName && mine.netWorth === netWorth && mine.lifePoints === lifePoints) return; // nothing new
    await setDoc(doc(db, "scores", uid), {
      name: input.username,
      netWorth,
      lifePoints,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("[leaderboard] score not saved", err);
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
  } catch (err) {
    console.warn("[leaderboard] couldn't load", err);
    return null;
  }
}
