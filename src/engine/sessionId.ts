// A random, anonymous per-browser identifier — not tied to any real-world
// identity — used only to group this browser's decisions/summary together
// in the remote Firestore data (see firebaseClient.ts). Nothing about the
// player's real identity is ever collected. Falls back to a timestamp-based
// id if crypto.randomUUID isn't available (older browsers/webviews).
const STORAGE_KEY = "lifepath:sessionId";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sid_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId(): string {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const fresh = generateId();
    window.localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    // localStorage unavailable (private mode, etc.) — fall back to a
    // per-load id. Remote entries from this session just won't be grouped
    // with any other session from the same browser.
    return generateId();
  }
}
