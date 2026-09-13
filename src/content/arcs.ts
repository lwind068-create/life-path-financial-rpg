// The whole game is ONE continuous story — one save slot, one running set
// of stats, no per-chapter resets. Content is still authored across six
// files for sanity (one theme each), but they're threaded together here
// into a single StoryArc via each file's own nextChapterId chain (see the
// header comment in each content file for that chapter's local details).
//
// Play order is NOT the same as file order: "The Next Offer" (the
// promotion/startup mirror scene) is threaded in after Settling In rather
// than immediately after First Job, so the story moves through getting a
// job -> building an independent life -> a bigger financial fork, which
// reads better than two job-shaped decisions back to back.
import type { StoryArc } from "./types";
import { firstJobArc } from "./firstJobArc";
import { settlingInArc } from "./settlingInArc";
import { finePrintArc } from "./finePrintArc";
import { startingBusinessArc } from "./startingBusinessArc";
import { runningTheShowArc } from "./runningTheShowArc";
import { playingTheMarketArc } from "./playingTheMarketArc";

export const lifePathArc: StoryArc = {
  id: "life_path",
  title: "Life-Path",
  blurb: "One continuous story, from your first paycheck to playing the market.",
  startChapterId: "job_offer",
  // 12 real scenes + the final ending chapter itself = 13, matching the
  // convention every chapter file already uses (pathLength counts the
  // ending as one of the notches).
  pathLength: 13,
  chapters: {
    ...firstJobArc.chapters,
    ...settlingInArc.chapters,
    ...finePrintArc.chapters,
    ...startingBusinessArc.chapters,
    ...runningTheShowArc.chapters,
    ...playingTheMarketArc.chapters,
  },
};

/** Named landmarks for the home-screen roadmap, in actual play order — not file order (see header comment). */
export const CHAPTER_MARKERS: { title: string; icon: string; sceneIds: string[] }[] = [
  { title: "First Job", icon: "briefcase", sceneIds: ["job_offer"] },
  { title: "Settling In", icon: "home", sceneIds: ["housing_decision", "car_repair_decision"] },
  { title: "The Next Offer", icon: "rocket", sceneIds: ["promotion_offer"] },
  { title: "Reading the Fine Print", icon: "credit-card", sceneIds: ["credit_decision", "pricing_decision"] },
  { title: "Starting a Business", icon: "piggy-bank", sceneIds: ["funding_choice", "growth_offer"] },
  { title: "Running the Show", icon: "users", sceneIds: ["hiring_decision", "cashflow_decision"] },
  { title: "Playing the Market", icon: "trending-up", sceneIds: ["opening_account", "trading_floor"] },
];

/** Flat play-order list of every real scene id (excludes the final ending chapter). */
export const ORDERED_SCENE_IDS: string[] = CHAPTER_MARKERS.flatMap((m) => m.sceneIds);
