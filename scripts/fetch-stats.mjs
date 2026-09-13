#!/usr/bin/env node
// Pulls the numbers Luke actually needs for college applications:
// total unique players, total logged decisions, completion rate, and
// average knowledge gain — straight from Firestore via the Admin SDK
// (which bypasses firestore.rules, unlike the game client).
//
// Usage:
//   1. Firebase console -> Project settings -> Service accounts ->
//      "Generate new private key". Save the downloaded JSON as
//      serviceAccountKey.json in the project root (already gitignored).
//   2. node scripts/fetch-stats.mjs
//
// See SETUP_FIREBASE.md for the full walkthrough.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = join(__dirname, "..", "serviceAccountKey.json");

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));
} catch {
  console.error(
    `Couldn't read ${keyPath}.\n` +
      "Download a service account key from the Firebase console " +
      "(Project settings -> Service accounts -> Generate new private key), " +
      "save it as serviceAccountKey.json in the project root, and re-run this script.",
  );
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function average(nums) {
  const valid = nums.filter((n) => typeof n === "number" && !Number.isNaN(n));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

async function main() {
  const [decisionsSnap, playersSnap] = await Promise.all([
    db.collection("decisions").get(),
    db.collection("players").get(),
  ]);

  // One players/{sessionId} doc per session, upserted after every chapter
  // (see src/engine/GameContext.tsx) — so this collection includes players
  // who dropped off partway through, not just finishers. `completed`
  // distinguishes the two.
  const players = playersSnap.docs.map((d) => d.data());
  const completedPlayers = players.filter((p) => p.completed === true);
  const uniqueSessionsInDecisions = new Set(
    decisionsSnap.docs.map((d) => d.data().sessionId).filter(Boolean),
  );

  // Knowledge-gain is only non-null once a player has answered both sides
  // of a baseline/mirror pair, so averaging across ALL summary docs (not
  // just completed ones) already self-filters to players far enough along
  // for the figure to mean anything.
  const avgQualityScore = average(players.map((p) => p.avgQualityScore));
  const avgKnowledgeGain = average(players.map((p) => p.avgKnowledgeGain));

  console.log("=== Life-Path Financial RPG — data snapshot ===");
  console.log(`Total logged decisions:             ${decisionsSnap.size}`);
  console.log(`Unique players who made a choice:   ${uniqueSessionsInDecisions.size}`);
  console.log(`Players with any recorded progress: ${players.length}`);
  console.log(`Players who reached an ending:       ${completedPlayers.length}`);
  console.log(
    `Completion rate (of those w/ progress): ${
      players.length ? `${((completedPlayers.length / players.length) * 100).toFixed(1)}%` : "n/a"
    }`,
  );
  console.log(
    `Avg. financial decision quality:    ${avgQualityScore !== null ? avgQualityScore.toFixed(2) : "n/a"} / 5`,
  );
  console.log(
    `Avg. knowledge gain (baseline→mirror): ${
      avgKnowledgeGain !== null ? avgKnowledgeGain.toFixed(2) : "n/a"
    } points`,
  );
  console.log("");
  console.log(
    "These are the raw numbers behind any 'X players, average knowledge gain of Y' claim — keep this output alongside your application materials as the source data.",
  );
}

main().catch((err) => {
  console.error("Failed to fetch stats:", err);
  process.exit(1);
});
