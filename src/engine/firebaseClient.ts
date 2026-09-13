// Optional Firestore backend for aggregating decision-log data across real
// players. Everything else in the app works fine with this fully absent
// (localStorage remains the source of truth for a single browser's own
// Debug view) — this module just adds a best-effort remote copy so data
// can be aggregated across players instead of staying trapped per-device.
//
// Configured via Vite env vars (see .env.example). If any are missing —
// e.g. no Firebase project has been set up yet — `db` is null and every
// caller in this app treats that as "remote logging is off" and silently
// no-ops. Never throws, never blocks gameplay.
import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const config: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Boolean(config.apiKey && config.projectId && config.appId);

export const remoteLoggingEnabled = isConfigured;

export const db: Firestore | null = isConfigured
  ? getFirestore(initializeApp(config))
  : null;

if (!isConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(
    "[firebaseClient] No Firebase config found — decisions are only logged to localStorage on this device. See .env.example / SETUP_FIREBASE.md to turn on remote data collection.",
  );
}
