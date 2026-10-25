// ---------------------------------------------------------------------------
// Arcade - finance mini-games played with Life Points.
//
// Each play costs Life Points (one free play a day), and good play pays
// Life Points back. Rewards are driven by skill and smart decisions -
// diversifying, sorting needs from wants, doing the math - not by luck
// alone, so it never works like a slot machine. Arcade results are kept
// separate from the story's hidden research scoring (scoring.ts).
// ---------------------------------------------------------------------------

export type ArcadeGameId = "portfolio" | "blitz" | "costmore";

export interface ArcadeGame {
  id: ArcadeGameId;
  name: string;
  tagline: string;
  /** What it teaches, in one line. */
  lesson: string;
  cost: number;
  maxReward: number;
  /** Label for the score shown as a best score. */
  scoreLabel: string;
}

export const ARCADE_GAMES: ArcadeGame[] = [
  {
    id: "portfolio",
    name: "Portfolio Sim",
    tagline: "Invest $10,000 and fast-forward 10 years.",
    lesson: "Diversifying protects you when the market crashes.",
    cost: 15,
    maxReward: 25,
    scoreLabel: "Best portfolio",
  },
  {
    id: "blitz",
    name: "Need or Want?",
    tagline: "30 seconds. Sort as many expenses as you can.",
    lesson: "Needs come first in every budget.",
    cost: 10,
    maxReward: 20,
    scoreLabel: "Best score",
  },
  {
    id: "costmore",
    name: "Which Costs More?",
    tagline: "Little habits vs. big purchases: 5 rounds.",
    lesson: "Small daily spending adds up fast.",
    cost: 8,
    maxReward: 15,
    scoreLabel: "Best score",
  },
];

export function getArcadeGame(id: string): ArcadeGame | undefined {
  return ARCADE_GAMES.find((g) => g.id === id);
}

// ---------- Portfolio Sim ----------

export type AssetId = "savings" | "bonds" | "index" | "hot";

export interface Asset {
  id: AssetId;
  name: string;
  blurb: string;
  /** Average yearly return. */
  mean: number;
  /** Typical yearly swing (standard deviation). */
  swing: number;
  /** Return in a market-crash year. */
  crash: number;
  color: string;
}

export const ASSETS: Asset[] = [
  { id: "savings", name: "Savings account", blurb: "Safe, slow. ~3%/yr.", mean: 0.03, swing: 0.003, crash: 0.03, color: "#2fe6a4" },
  { id: "bonds", name: "Bonds", blurb: "Steady. ~4%/yr, small dips.", mean: 0.04, swing: 0.05, crash: 0.04, color: "#7cc4ff" },
  { id: "index", name: "Index fund", blurb: "Whole market. ~8%/yr, real dips.", mean: 0.08, swing: 0.15, crash: -0.3, color: "#ffb020" },
  { id: "hot", name: "Hot stock", blurb: "One company. Huge swings.", mean: 0.1, swing: 0.45, crash: -0.55, color: "#ff4d6d" },
];

export const START_CASH = 10_000;
export const SIM_YEARS = 10;
const CRASH_CHANCE = 0.15;

function gaussian(rand: () => number): number {
  const u = Math.max(1e-9, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface SimYear {
  year: number;
  total: number;
  crash: boolean;
}

/** Runs the 10-year simulation. `alloc` = dollars per asset, summing to START_CASH. */
export function simulatePortfolio(alloc: Record<AssetId, number>, rand: () => number = Math.random): SimYear[] {
  const holdings = { ...alloc };
  const years: SimYear[] = [{ year: 0, total: START_CASH, crash: false }];
  let crashes = 0;
  for (let y = 1; y <= SIM_YEARS; y++) {
    // At most two crash years, so a run isn't just bad luck.
    const crash = crashes < 2 && rand() < CRASH_CHANCE;
    if (crash) crashes++;
    for (const a of ASSETS) {
      const r = crash ? a.crash : a.mean + a.swing * gaussian(rand);
      holdings[a.id] = Math.max(0, holdings[a.id] * (1 + Math.max(-0.95, r)));
    }
    const total = ASSETS.reduce((sum, a) => sum + holdings[a.id], 0);
    years.push({ year: y, total: Math.round(total), crash });
  }
  return years;
}

/** What $10,000 in a savings account becomes in 10 years - the bar to beat. */
export const SAVINGS_BASELINE = Math.round(START_CASH * Math.pow(1.03, SIM_YEARS));

/**
 * Reward for a Portfolio Sim run. Mostly for smart allocation (diversified,
 * not all-in on one stock); a smaller part for the result itself.
 */
export function portfolioReward(alloc: Record<AssetId, number>, finalValue: number): { reward: number; notes: string[] } {
  const notes: string[] = [];
  let reward = 2; // finishing
  const held = ASSETS.filter((a) => alloc[a.id] >= START_CASH * 0.1).length;
  const diversity = Math.min(9, (held - 1) * 3);
  if (diversity > 0) notes.push(`Diversified across ${held} investments +${diversity}`);
  reward += diversity;
  if (alloc.hot / START_CASH <= 0.2) {
    reward += 4;
    notes.push("Kept risky single-stock bets small +4");
  }
  if (finalValue > SAVINGS_BASELINE) {
    reward += 4;
    notes.push("Beat a plain savings account +4");
  }
  if (finalValue > START_CASH * 1.8) {
    reward += 6;
    notes.push("Grew your money 80%+ +6");
  }
  return { reward: Math.min(25, reward), notes };
}

// ---------- Need or Want? ----------

export interface BlitzItem {
  label: string;
  need: boolean;
}

export const BLITZ_ITEMS: BlitzItem[] = [
  { label: "Rent", need: true },
  { label: "Groceries", need: true },
  { label: "Electric bill", need: true },
  { label: "Car insurance", need: true },
  { label: "Bus pass to work", need: true },
  { label: "Prescription medicine", need: true },
  { label: "Phone bill (basic plan)", need: true },
  { label: "Water bill", need: true },
  { label: "Winter coat (yours is torn)", need: true },
  { label: "Minimum loan payment", need: true },
  { label: "Internet for online class", need: true },
  { label: "Work boots", need: true },
  { label: "Concert tickets", need: false },
  { label: "New sneakers (you have 4 pairs)", need: false },
  { label: "4th streaming service", need: false },
  { label: "Gaming skin", need: false },
  { label: "Daily $7 latte", need: false },
  { label: "Phone upgrade (yours works)", need: false },
  { label: "Designer hoodie", need: false },
  { label: "Food delivery (again)", need: false },
  { label: "Movie night snacks", need: false },
  { label: "Lottery tickets", need: false },
  { label: "Spring break trip", need: false },
  { label: "New headphones (yours work)", need: false },
];

export const BLITZ_SECONDS = 30;

/** 1 point per correct answer past the first 5, max 20 - you have to be quick AND right. */
export function blitzReward(score: number): number {
  return Math.max(0, Math.min(20, score - 5));
}

// ---------- Which Costs More? ----------

export interface CostRound {
  a: string;
  aTotal: number;
  b: string;
  bTotal: number;
  /** Shown after answering: the math. */
  math: string;
}

export const COST_ROUNDS: CostRound[] = [
  { a: "$6 lunch out every school day for a year (180 days)", aTotal: 1080, b: "A $900 laptop", bTotal: 900, math: "$6 × 180 days = $1,080" },
  { a: "$5 coffee every day for a year", aTotal: 1825, b: "A $1,200 phone", bTotal: 1200, math: "$5 × 365 = $1,825" },
  { a: "Three $15/month subscriptions for 2 years", aTotal: 1080, b: "A $1,000 used e-bike", bTotal: 1000, math: "3 × $15 × 24 months = $1,080" },
  { a: "$25 a week on snacks & drinks for a year", aTotal: 1300, b: "A $1,500 weekend trip", bTotal: 1500, math: "$25 × 52 weeks = $1,300" },
  { a: "$10 a week on game items for 3 years", aTotal: 1560, b: "A $500 game console", bTotal: 500, math: "$10 × 52 × 3 = $1,560" },
  { a: "$2,000 on a credit card at 24% APR, paying it off over 2 years", aTotal: 2537, b: "$2,400 paid in cash", bTotal: 2400, math: "Monthly payments of ≈$106 × 24 = ≈$2,537" },
  { a: "$40 a month gym you never use, for a year", aTotal: 480, b: "$300 home workout set", bTotal: 300, math: "$40 × 12 = $480" },
  { a: "$12 movie ticket every week for a year", aTotal: 624, b: "$800 bike", bTotal: 800, math: "$12 × 52 = $624" },
  { a: "$3 vending-machine soda every school day (180 days)", aTotal: 540, b: "$450 concert tickets", bTotal: 450, math: "$3 × 180 = $540" },
  { a: "$80 sneakers 4 times a year for 2 years", aTotal: 640, b: "$700 phone", bTotal: 700, math: "$80 × 4 × 2 = $640" },
];

export const COST_ROUNDS_PER_GAME = 5;

export function costMoreReward(correct: number): number {
  return correct * 3;
}

export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
