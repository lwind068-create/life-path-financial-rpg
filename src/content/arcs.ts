// The whole game is ONE continuous story - one save slot, one running set
// of stats, no per-chapter resets. Content is authored across six files
// (one theme each) and threaded together here via each chapter's
// nextChapterId. Play order:
//
//   1 First Job        job_offer (baseline)
//   2 Settling In      housing_decision, car_repair_decision
//   3 The Next Offer   promotion_offer (mirror of job_offer), startup_fork (the Y: corporate vs startup)
//   4 Fine Print       credit_decision, money_traps
//   5 Business         funding_choice (baseline), pricing_decision, growth_offer (mirror)
//   6 Running the Show hiring_decision, cashflow_decision
//   7 The Market       opening_account, trading_floor
//   -> ending (in firstJobArc.ts)
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
  // 14 scenes + the ending chapter itself (pathLength counts the ending as a notch).
  pathLength: 15,
  chapters: {
    ...firstJobArc.chapters,
    ...settlingInArc.chapters,
    ...finePrintArc.chapters,
    ...startingBusinessArc.chapters,
    ...runningTheShowArc.chapters,
    ...playingTheMarketArc.chapters,
  },
};

/** Named landmarks for the home-screen roadmap, in play order (see header comment). */
export const CHAPTER_MARKERS: { title: string; icon: string; sceneIds: string[] }[] = [
  { title: "First Job", icon: "briefcase", sceneIds: ["job_offer"] },
  { title: "Settling In", icon: "home", sceneIds: ["housing_decision", "car_repair_decision"] },
  { title: "The Next Offer", icon: "rocket", sceneIds: ["promotion_offer", "startup_fork"] },
  { title: "Reading the Fine Print", icon: "credit-card", sceneIds: ["credit_decision", "money_traps"] },
  { title: "Starting a Business", icon: "piggy-bank", sceneIds: ["funding_choice", "pricing_decision", "growth_offer"] },
  { title: "Running the Show", icon: "users", sceneIds: ["hiring_decision", "cashflow_decision"] },
  { title: "Playing the Market", icon: "trending-up", sceneIds: ["opening_account", "trading_floor"] },
];

/** Flat play-order list of every real scene id (excludes the final ending chapter). */
export const ORDERED_SCENE_IDS: string[] = CHAPTER_MARKERS.flatMap((m) => m.sceneIds);
