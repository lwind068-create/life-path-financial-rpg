// Unique usernames. Each username can belong to exactly one player, ignoring
// capitals ("Luke" and "luke" are the same name).
//
// Firestore layout (enforced in firestore.rules):
//   usernames/{lowercase name} = { username, uid, createdAt }  — create-only
//   users/{uid}                = { username, createdAt }       — create-only
// Both are written in one batch; the rules require them to point at each
// other, so a name can't be claimed twice and a player can't claim two names.
import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db, getUid, remoteLoggingEnabled } from "./firebaseClient";

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 16;

// Kept short and generic on purpose: blocks obvious bad words and
// impersonation of staff. Matching is on the lowercase name with
// separators removed.
const BLOCKED = [
  "admin", "moderator", "official", "lifepath", "support",
  "fuck", "shit", "bitch", "cunt", "dick", "cock", "pussy", "nigg", "fag", "slut", "whore",
  "rape", "nazi", "hitler", "porn", "sex", "penis", "vagina", "asshole", "retard",
];

export function normalizeUsername(name: string): string {
  return name.trim().toLowerCase();
}

/** Null if the name is OK to try, otherwise a message to show. */
export function validateUsername(name: string): string | null {
  const n = name.trim();
  if (n.length < USERNAME_MIN) return `At least ${USERNAME_MIN} characters.`;
  if (n.length > USERNAME_MAX) return `${USERNAME_MAX} characters max.`;
  if (!/^[A-Za-z0-9_]+$/.test(n)) return "Letters, numbers and _ only (no spaces).";
  const flat = n.toLowerCase().replace(/_/g, "");
  if (BLOCKED.some((w) => flat.includes(w))) return "Pick a different username.";
  return null;
}

export type ClaimResult =
  | { ok: true; username: string }
  | { ok: false; reason: "taken" | "invalid" | "offline"; message: string };

/** The username this player already owns (e.g. after clearing site data), if any. */
export async function fetchMyUsername(): Promise<string | null> {
  if (!remoteLoggingEnabled || !db) return null;
  const uid = await getUid();
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? ((snap.data().username as string) ?? null) : null;
  } catch {
    return null;
  }
}

export async function isUsernameAvailable(name: string): Promise<boolean | null> {
  if (!remoteLoggingEnabled || !db) return true;
  try {
    const snap = await getDoc(doc(db, "usernames", normalizeUsername(name)));
    return !snap.exists();
  } catch {
    return null;
  }
}

export async function claimUsername(name: string): Promise<ClaimResult> {
  const username = name.trim();
  const invalid = validateUsername(username);
  if (invalid) return { ok: false, reason: "invalid", message: invalid };

  // No Firebase configured (local dev): accept locally.
  if (!remoteLoggingEnabled || !db) return { ok: true, username };

  const uid = await getUid();
  if (!uid) return { ok: false, reason: "offline", message: "Couldn't connect. Check your internet and try again." };

  // Already own a name? Use it (one name per player).
  const existing = await fetchMyUsername();
  if (existing) return { ok: true, username: existing };

  const available = await isUsernameAvailable(username);
  if (available === false) return { ok: false, reason: "taken", message: `"${username}" is taken. Try another.` };

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, "usernames", normalizeUsername(username)), { username, uid, createdAt: serverTimestamp() });
    batch.set(doc(db, "users", uid), { username, createdAt: serverTimestamp() });
    await batch.commit();
    return { ok: true, username };
  } catch {
    // The rules reject the write if someone grabbed the name a moment ago.
    const stillFree = await isUsernameAvailable(username);
    if (stillFree === false) return { ok: false, reason: "taken", message: `"${username}" is taken. Try another.` };
    return { ok: false, reason: "offline", message: "Couldn't save your username. Try again." };
  }
}
