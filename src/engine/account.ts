// Accounts and cloud save.
//
// Every player starts with an anonymous Firebase account (firebaseClient.ts)
// and a unique username (username.ts). Players 13 or older can optionally
// add an email + password; Firebase "links" it to the same account, so the
// uid, username and progress all stay the same. They can then log in on any
// device and pick up where they left off.
//
// Players under 13 never give an email (COPPA) — their progress lives on
// their device, plus a cloud copy tied to their anonymous account.
//
// Cloud save: saves/{uid} holds the same JSON the game keeps in
// localStorage. Only the owner can read or write it (firestore.rules).
import { useEffect, useState } from "react";
import {
  EmailAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, getUid, remoteLoggingEnabled } from "./firebaseClient";

/** Emails allowed to open the private stats dashboard (must be verified). Keep in sync with firestore.rules. */
export const ADMIN_EMAILS = ["lwind068@gmail.com", "windl28@cbchs.org", "lifepathgame@gmail.com"];

const SAVE_KEYS = ["lifepath:profile", "lifepath:progress", "lifepath:decisionLog", "lifepath:trafficSource"] as const;

export interface AuthInfo {
  uid: string | null;
  email: string | null;
  isAnonymous: boolean;
  emailVerified: boolean;
  isAdmin: boolean;
  ready: boolean;
}

function toInfo(user: User | null): AuthInfo {
  const email = user?.email ?? null;
  return {
    uid: user?.uid ?? null,
    email,
    isAnonymous: user?.isAnonymous ?? true,
    emailVerified: Boolean(user?.emailVerified),
    isAdmin: Boolean(user?.emailVerified && email && ADMIN_EMAILS.includes(email.toLowerCase())),
    ready: true,
  };
}

/** Live auth state for UI. */
export function useAuthInfo(): AuthInfo {
  const [info, setInfo] = useState<AuthInfo>({
    uid: null,
    email: null,
    isAnonymous: true,
    emailVerified: false,
    isAdmin: false,
    ready: !auth,
  });
  useEffect(() => {
    if (!auth) return;
    void getUid();
    return onAuthStateChanged(auth, (u) => setInfo(toInfo(u)));
  }, []);
  return info;
}

/** Re-reads the user from Firebase (e.g. after clicking the verification link). */
export async function refreshAuthUser(): Promise<AuthInfo> {
  if (!auth?.currentUser) return toInfo(null);
  await auth.currentUser.reload();
  await auth.currentUser.getIdToken(true);
  return toInfo(auth.currentUser);
}

function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? "";
  if (code.includes("email-already-in-use") || code.includes("credential-already-in-use"))
    return "That email already has an account. Use \"Log in\" instead.";
  if (code.includes("invalid-email")) return "That doesn't look like an email address.";
  if (code.includes("weak-password")) return "Password needs at least 6 characters.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
    return "Email or password is wrong.";
  if (code.includes("too-many-requests")) return "Too many tries. Wait a minute and try again.";
  if (code.includes("network")) return "Couldn't connect. Check your internet.";
  if (code.includes("provider-already-linked")) return "This account already has an email saved. Use \"Log in\" with that email instead.";
  if (code.includes("requires-recent-login")) return "For security, sign out and log back in, then try again.";
  if (code.includes("operation-not-allowed") || code.includes("admin-restricted"))
    return "Email accounts are switched off right now. (Error: " + code + ")";
  console.warn("Account error:", e);
  return "Something went wrong. Try again." + (code ? " (" + code + ")" : "");
}

/** Adds email + password to the current (anonymous) account. Same uid, username and progress. */
export async function addEmailToAccount(email: string, password: string): Promise<string | null> {
  if (!auth) return "Accounts aren't available right now.";
  await getUid();
  const user = auth.currentUser;
  if (!user) return "Couldn't connect. Check your internet.";
  try {
    const cred = await linkWithCredential(user, EmailAuthProvider.credential(email.trim(), password));
    await sendEmailVerification(cred.user).catch(() => {});
    await saveToCloud();
    return null;
  } catch (e) {
    return friendlyError(e);
  }
}

export async function resendVerification(): Promise<void> {
  if (auth?.currentUser && !auth.currentUser.emailVerified) await sendEmailVerification(auth.currentUser);
}

export async function sendReset(email: string): Promise<string | null> {
  if (!auth) return "Accounts aren't available right now.";
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return null;
  } catch (e) {
    return friendlyError(e);
  }
}

/**
 * Logs in with email + password on this device, then replaces this
 * device's progress with the account's cloud save and reloads.
 */
export async function logInWithEmail(email: string, password: string): Promise<string | null> {
  if (!auth || !db) return "Accounts aren't available right now.";
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const snap = await getDoc(doc(db, "saves", cred.user.uid));
    for (const key of SAVE_KEYS) window.localStorage.removeItem(key);
    if (snap.exists()) {
      const data = snap.data() as Record<string, string | undefined>;
      for (const key of SAVE_KEYS) {
        const value = data[key.replace("lifepath:", "")];
        if (typeof value === "string") window.localStorage.setItem(key, value);
      }
    }
    window.location.assign("/");
    return null;
  } catch (e) {
    return friendlyError(e);
  }
}

/** Logs out and clears this device, so the next person starts fresh. */
export async function logOut(): Promise<void> {
  await saveToCloud();
  if (auth) await signOut(auth);
  for (const key of SAVE_KEYS) window.localStorage.removeItem(key);
  window.location.assign("/");
}

let lastSaved = "";

/** Copies this device's progress to saves/{uid}. Best-effort, skips if nothing changed. */
export async function saveToCloud(): Promise<void> {
  if (!remoteLoggingEnabled || !db) return;
  const uid = await getUid();
  if (!uid) return;
  const payload: Record<string, string> = {};
  for (const key of SAVE_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value !== null) payload[key.replace("lifepath:", "")] = value;
  }
  const fingerprint = JSON.stringify(payload);
  if (fingerprint === lastSaved || !payload.profile) return;
  try {
    await setDoc(doc(db, "saves", uid), { ...payload, updatedAt: serverTimestamp() });
    lastSaved = fingerprint;
  } catch {
    // Best-effort; the device copy is still there.
  }
}
