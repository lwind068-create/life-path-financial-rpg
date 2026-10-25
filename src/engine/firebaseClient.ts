// Optional Firestore backend for aggregating decision-log data across real
// players. Everything else in the app works fine with this fully absent
// (localStorage remains the source of truth for a single browser's own
// Debug view) - this module just adds a best-effort remote copy so data
// can be aggregated across players instead of staying trapped per-device.
//
// Configured via Vite env vars (see .env.example). If any are missing -
// e.g. no Firebase project has been set up yet - `db` is null and every
// caller in this app treats that as "remote logging is off" and silently
// no-ops. Never throws, never blocks gameplay.
import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously, type Auth } from "firebase/auth";

const config: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  // Optional: only present once Google Analytics is enabled on the Firebase
  // project. Without it, engine/analytics.ts quietly skips GA events.
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

const isConfigured = Boolean(config.apiKey && config.projectId && config.appId);

export const remoteLoggingEnabled = isConfigured;

export const firebaseApp: FirebaseApp | null = isConfigured ? initializeApp(config) : null;

export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;

export const analyticsConfigured = Boolean(firebaseApp && config.measurementId);

// Anonymous Firebase Auth: every browser gets an unguessable user id with no
// password. Usernames and leaderboard scores are tied to it in
// firestore.rules, so nobody can claim someone else's name or overwrite
// their score. (It can later be upgraded to email/password sign-in without
// losing the account.)
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

let uidPromise: Promise<string | null> | null = null;

/** Resolves to this browser's Firebase user id, signing in anonymously if needed. Null if Firebase is off or sign-in fails. */
export function getUid(): Promise<string | null> {
  if (!auth) return Promise.resolve(null);
  if (!uidPromise) {
    const a = auth;
    uidPromise = new Promise<string | null>((resolve) => {
      const stop = onAuthStateChanged(a, (user) => {
        stop();
        if (user) return resolve(user.uid);
        signInAnonymously(a)
          .then((cred) => resolve(cred.user.uid))
          .catch(() => {
            uidPromise = null; // allow a retry later
            resolve(null);
          });
      });
    });
  }
  return uidPromise;
}

if (!isConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(
    "[firebaseClient] No Firebase config found, decisions are only logged to localStorage on this device. See .env.example / SETUP_FIREBASE.md to turn on remote data collection.",
  );
}
