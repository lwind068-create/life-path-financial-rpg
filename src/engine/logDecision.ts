// Single abstraction point for persisting decisions.
//
// Every choice the player makes flows through logDecision(). It always
// writes to localStorage first — that's what powers the in-session Debug
// view and never depends on the network. It then makes a best-effort,
// fire-and-forget write to Firestore (see firebaseClient.ts) so decisions
// from every real player can be aggregated in one place instead of staying
// trapped in each player's own browser. If no Firebase project is
// configured, or the write fails (offline, blocked, etc.), that second
// step silently no-ops — it must never throw, block, or affect gameplay.
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { DecisionLogEntry } from "../content/types";
import { db, remoteLoggingEnabled } from "./firebaseClient";
import { getSessionId } from "./sessionId";

const STORAGE_KEY = "lifepath:decisionLog";

export function logDecision(entry: DecisionLogEntry): void {
  const log = getDecisionLog();
  log.push(entry);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));

  void logDecisionRemote(entry);
}

async function logDecisionRemote(entry: DecisionLogEntry): Promise<void> {
  if (!remoteLoggingEnabled || !db) return;
  try {
    await addDoc(collection(db, "decisions"), {
      ...entry,
      sessionId: getSessionId(),
      createdAt: serverTimestamp(),
    });
  } catch {
    // Network hiccup, ad blocker, quota, whatever — the local log is the
    // source of truth for gameplay, so this failure is invisible to the
    // player and not retried.
  }
}

export function getDecisionLog(): DecisionLogEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getDecisionLogForArc(arcId: string): DecisionLogEntry[] {
  return getDecisionLog().filter((entry) => entry.arcId === arcId);
}

/** Wipes the entire decision log, across every arc. Used by the debug route. */
export function clearDecisionLog(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Wipes only one arc's entries, leaving other arcs' logs intact. Used by "Play again." */
export function clearDecisionLogForArc(arcId: string): void {
  const remaining = getDecisionLog().filter((entry) => entry.arcId !== arcId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}
