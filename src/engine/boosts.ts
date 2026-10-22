// ---------------------------------------------------------------------------
// Boosts, daily streak, daily quests, and the Savings Vault — the "reason to
// come back tomorrow" layer on top of Life Points (engine/lifePoints.ts).
//
// Everything here is spent and earned in Life Points. None of it changes
// which choice a player makes or how a choice is scored: boosts multiply
// the points a choice pays out (the same multiplier for every option, so
// there is still no incentive to "solve for points" on the baseline/mirror
// measurement chapters), and the "smart choice" quest ignores measurement
// chapters entirely. The hidden research measures in scoring.ts are untouched.
//
// All functions are pure: they take the current BoostState and return a new
// one plus any player-facing notices. GameContext owns persistence.
// ---------------------------------------------------------------------------

// ---------- dates ----------

/** Local calendar day as YYYY-MM-DD (the player's own midnight, not UTC). */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole days from day a to day b (both YYYY-MM-DD). */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000);
}

// ---------- catalog ----------

export type BoostId = "double" | "triple" | "freeze" | "refresh";

export interface BoostDef {
  id: BoostId;
  name: string;
  /** One line: what it does. */
  effect: string;
  /** One line: why you'd want it. */
  why: string;
  cost: number;
}

export const BOOSTS: BoostDef[] = [
  {
    id: "double",
    name: "2× Points",
    effect: "Double Life Points on your next 5 choices.",
    why: "Rank up faster and climb the leaderboard.",
    cost: 60,
  },
  {
    id: "triple",
    name: "3× Power Hour",
    effect: "Triple Life Points on your next 3 choices.",
    why: "Best right before a big chapter.",
    cost: 90,
  },
  {
    id: "freeze",
    name: "Streak Freeze",
    effect: "Saves your daily streak if you miss a day. Hold up to 2.",
    why: "Busy day? Your streak survives.",
    cost: 50,
  },
  {
    id: "refresh",
    name: "New Quests",
    effect: "Swap today's unfinished quests for new ones.",
    why: "Stuck on a quest you can't finish today?",
    cost: 25,
  },
];

export const MAX_FREEZES = 2;
export const VAULT_RATE = 0.05;
export const VAULT_DAILY_CAP = 50;

export const STREAK_MILESTONES: { days: number; reward: number }[] = [
  { days: 3, reward: 25 },
  { days: 7, reward: 60 },
  { days: 14, reward: 120 },
  { days: 30, reward: 250 },
];

// ---------- quests ----------

export type QuestMetric = "choices" | "smartChoices" | "chapters" | "boostUsed" | "vaultDeposit" | "arcade";

export interface QuestDef {
  id: string;
  label: string;
  metric: QuestMetric;
  target: number;
  reward: number;
}

export const QUEST_POOL: QuestDef[] = [
  { id: "choices5", label: "Make 5 choices", metric: "choices", target: 5, reward: 25 },
  { id: "choices10", label: "Make 10 choices", metric: "choices", target: 10, reward: 45 },
  { id: "smart3", label: "Make 3 smart money moves", metric: "smartChoices", target: 3, reward: 35 },
  { id: "smart6", label: "Make 6 smart money moves", metric: "smartChoices", target: 6, reward: 60 },
  { id: "chapter1", label: "Finish a chapter", metric: "chapters", target: 1, reward: 40 },
  { id: "boost1", label: "Use a boost", metric: "boostUsed", target: 1, reward: 20 },
  { id: "vault1", label: "Put points in the Savings Vault", metric: "vaultDeposit", target: 1, reward: 20 },
  { id: "arcade1", label: "Play an Arcade game", metric: "arcade", target: 1, reward: 20 },
  { id: "arcade3", label: "Play 3 Arcade games", metric: "arcade", target: 3, reward: 45 },
];

/** Bonus for finishing all three of today's quests. */
export const ALL_QUESTS_BONUS = 30;

export interface QuestState {
  id: string;
  progress: number;
  done: boolean;
}

export function getQuestDef(id: string): QuestDef | undefined {
  return QUEST_POOL.find((q) => q.id === id);
}

/** QUEST_POOL in a deterministic shuffled order for a given day + salt. */
function shuffledPool(day: string, salt: number): QuestDef[] {
  let seed = (salt + 1) * 7919;
  for (const ch of day) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const pool = [...QUEST_POOL];
  const out: QuestDef[] = [];
  while (pool.length > 0) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    out.push(...pool.splice(seed % pool.length, 1));
  }
  return out;
}

/** Fills up to 3 quests, never two with the same metric, skipping excluded ids where possible. */
function fillQuests(day: string, salt: number, kept: QuestState[], excludeIds: Set<string>): QuestState[] {
  const result = [...kept];
  const usedMetrics = new Set(kept.map((q) => getQuestDef(q.id)?.metric));
  const order = shuffledPool(day, salt);
  for (const pass of [true, false]) {
    for (const q of order) {
      if (result.length >= 3) break;
      if (usedMetrics.has(q.metric) || result.some((r) => r.id === q.id)) continue;
      if (pass && excludeIds.has(q.id)) continue;
      result.push({ id: q.id, progress: 0, done: false });
      usedMetrics.add(q.metric);
    }
  }
  return result;
}

function pickQuests(day: string): QuestState[] {
  return fillQuests(day, 0, [], new Set());
}

// ---------- state ----------

export interface BoostState {
  /** Consecutive days with at least one choice made. */
  dailyStreak: number;
  bestStreak: number;
  /** Last day (YYYY-MM-DD) the player made a choice; null if never. */
  lastActiveDay: string | null;
  streakFreezes: number;
  /** Active points multiplier and how many more choices it lasts. */
  activeBoost: { id: BoostId; multiplier: number; choicesLeft: number } | null;
  questDay: string | null;
  quests: QuestState[];
  questRefreshes: number;
  allQuestsBonusClaimed: boolean;
  /** Life Points parked in the Savings Vault (not spendable until withdrawn). */
  vault: number;
  /** Day (YYYY-MM-DD) the free daily Arcade ticket was used; null if never. */
  freeTicketDay: string | null;
  /** Best score per Arcade game id. */
  arcadeBest: Record<string, number>;
  /** Lifetime engagement counters (for the stats dashboard). */
  totals: EngagementTotals;
}

export interface EngagementTotals {
  daysPlayed: number;
  questsCompleted: number;
  boostsBought: number;
  arcadePlays: number;
  /** Arcade plays per game id. */
  arcadePlaysByGame: Record<string, number>;
}

export function freshTotals(): EngagementTotals {
  return { daysPlayed: 0, questsCompleted: 0, boostsBought: 0, arcadePlays: 0, arcadePlaysByGame: {} };
}

export function freshBoostState(): BoostState {
  return {
    dailyStreak: 0,
    bestStreak: 0,
    lastActiveDay: null,
    streakFreezes: 0,
    activeBoost: null,
    questDay: null,
    quests: [],
    questRefreshes: 0,
    allQuestsBonusClaimed: false,
    vault: 0,
    freeTicketDay: null,
    arcadeBest: {},
    totals: freshTotals(),
  };
}

/** Result of every state change: new state, Life Points earned (spendable + lifetime), and toasts to show. */
export interface BoostResult {
  state: BoostState;
  /** Spendable Life Points to add to the balance (also counts toward lifetime). */
  earned: number;
  /** Points earned that stay locked in the vault — count toward lifetime only. */
  lifetimeOnly?: number;
  notices: string[];
}

/** Makes sure today's quests exist. Safe to call any time (on load, on focus). */
export function ensureToday(state: BoostState, today: string = dayKey()): BoostState {
  if (state.questDay === today && state.quests.length > 0) return state;
  return { ...state, questDay: today, quests: pickQuests(today), questRefreshes: 0, allQuestsBonusClaimed: false };
}

/** Is the streak still alive today (played yesterday or today, or freezes cover the gap)? */
export function streakIsAlive(state: BoostState, today: string = dayKey()): boolean {
  if (!state.lastActiveDay) return false;
  const missed = daysBetween(state.lastActiveDay, today) - 1;
  return missed <= state.streakFreezes;
}

/** Adds progress to every unfinished quest with this metric; pays out finished ones. */
export function addQuestProgress(state: BoostState, metric: QuestMetric, amount = 1): BoostResult {
  const s = ensureToday(state);
  let earned = 0;
  const notices: string[] = [];
  const quests = s.quests.map((q) => {
    const def = getQuestDef(q.id);
    if (!def || q.done || def.metric !== metric) return q;
    const progress = Math.min(def.target, q.progress + amount);
    const done = progress >= def.target;
    if (done) {
      earned += def.reward;
      notices.push(`Quest complete: ${def.label} · +${def.reward}`);
    }
    return { ...q, progress, done };
  });
  const newlyDone = quests.filter((q, i) => q.done && !s.quests[i]?.done).length;
  let allQuestsBonusClaimed = s.allQuestsBonusClaimed;
  if (!allQuestsBonusClaimed && quests.length > 0 && quests.every((q) => q.done)) {
    allQuestsBonusClaimed = true;
    earned += ALL_QUESTS_BONUS;
    notices.push(`All daily quests done! Bonus +${ALL_QUESTS_BONUS}`);
  }
  const totals = { ...freshTotals(), ...s.totals };
  return {
    state: { ...s, quests, allQuestsBonusClaimed, totals: { ...totals, questsCompleted: totals.questsCompleted + newlyDone } },
    earned,
    notices,
  };
}

/**
 * Call once per choice, before computing points. Updates the daily streak,
 * spends freezes to cover missed days, pays streak milestones, and pays the
 * Savings Vault's interest once per new active day.
 */
export function registerActivity(state: BoostState, today: string = dayKey()): BoostResult {
  const s = ensureToday(state, today);
  const notices: string[] = [];
  let earned = 0;
  if (s.lastActiveDay === today) return { state: s, earned, notices };

  let dailyStreak: number;
  let streakFreezes = s.streakFreezes;
  if (!s.lastActiveDay) {
    dailyStreak = 1;
  } else {
    const missed = daysBetween(s.lastActiveDay, today) - 1;
    if (missed <= 0) {
      dailyStreak = s.dailyStreak + 1;
    } else if (missed <= streakFreezes) {
      streakFreezes -= missed;
      dailyStreak = s.dailyStreak + 1;
      notices.push(`Streak Freeze used — your ${s.dailyStreak}-day streak is safe`);
    } else {
      dailyStreak = 1;
      if (s.dailyStreak > 1) notices.push(`Your ${s.dailyStreak}-day streak ended. New streak started!`);
    }
  }
  if (dailyStreak > 1 && !notices.some((n) => n.startsWith("Streak Freeze"))) {
    notices.push(`🔥 ${dailyStreak}-day streak!`);
  }
  const milestone = STREAK_MILESTONES.find((m) => m.days === dailyStreak);
  if (milestone) {
    earned += milestone.reward;
    notices.push(`${milestone.days}-day streak reward · +${milestone.reward}`);
  }

  let vault = s.vault;
  let interest = 0;
  if (vault > 0 && s.lastActiveDay) {
    // Interest compounds inside the vault; it counts toward lifetime points
    // (rank, leaderboard) but isn't spendable until withdrawn.
    interest = Math.min(VAULT_DAILY_CAP, Math.max(1, Math.round(vault * VAULT_RATE)));
    vault += interest;
    notices.push(`Savings Vault earned +${interest} interest`);
  }

  const totals = { ...freshTotals(), ...s.totals };
  return {
    state: {
      ...s,
      dailyStreak,
      bestStreak: Math.max(s.bestStreak, dailyStreak),
      lastActiveDay: today,
      streakFreezes,
      vault,
      totals: { ...totals, daysPlayed: totals.daysPlayed + 1 },
    },
    earned,
    lifetimeOnly: interest,
    notices,
  };
}

/** Applies the active boost's multiplier to a choice's base points and uses up one charge. */
export function applyBoostToPoints(state: BoostState, basePoints: number): { state: BoostState; points: number; multiplier: number } {
  const b = state.activeBoost;
  if (!b || b.choicesLeft <= 0) return { state: { ...state, activeBoost: null }, points: basePoints, multiplier: 1 };
  const choicesLeft = b.choicesLeft - 1;
  return {
    state: { ...state, activeBoost: choicesLeft > 0 ? { ...b, choicesLeft } : null },
    points: basePoints * b.multiplier,
    multiplier: b.multiplier,
  };
}

export type BuyError = "cant_afford" | "already_active" | "max_freezes" | "nothing_to_refresh" | "unknown";

/** Buys and immediately applies a boost. `balance` is the player's spendable Life Points. */
export function buyBoost(
  state: BoostState,
  id: BoostId,
  balance: number,
): { ok: true; state: BoostState; cost: number; earned: number; notices: string[] } | { ok: false; error: BuyError } {
  const def = BOOSTS.find((b) => b.id === id);
  if (!def) return { ok: false, error: "unknown" };
  if (balance < def.cost) return { ok: false, error: "cant_afford" };
  let s = ensureToday(state);

  if (id === "double" || id === "triple") {
    if (s.activeBoost) return { ok: false, error: "already_active" };
    s = {
      ...s,
      activeBoost: id === "double" ? { id, multiplier: 2, choicesLeft: 5 } : { id, multiplier: 3, choicesLeft: 3 },
    };
  } else if (id === "freeze") {
    if (s.streakFreezes >= MAX_FREEZES) return { ok: false, error: "max_freezes" };
    s = { ...s, streakFreezes: s.streakFreezes + 1 };
  } else if (id === "refresh") {
    if (s.quests.every((q) => q.done)) return { ok: false, error: "nothing_to_refresh" };
    const refreshes = s.questRefreshes + 1;
    const kept = s.quests.filter((q) => q.done);
    const swappedOut = new Set(s.quests.filter((q) => !q.done).map((q) => q.id));
    s = { ...s, quests: fillQuests(s.questDay ?? dayKey(), refreshes, kept, swappedOut), questRefreshes: refreshes };
  }

  const t = { ...freshTotals(), ...s.totals };
  s = { ...s, totals: { ...t, boostsBought: t.boostsBought + 1 } };
  const usedBoost = addQuestProgress(s, "boostUsed");
  return { ok: true, state: usedBoost.state, cost: def.cost, earned: usedBoost.earned, notices: usedBoost.notices };
}

export function depositToVault(state: BoostState, amount: number, balance: number): BoostResult & { moved: number } {
  const moved = Math.max(0, Math.min(Math.floor(amount), balance));
  if (moved === 0) return { state, earned: 0, notices: [], moved };
  const s = { ...state, vault: state.vault + moved };
  const quest = addQuestProgress(s, "vaultDeposit");
  return { ...quest, moved };
}

export function withdrawFromVault(state: BoostState): { state: BoostState; moved: number } {
  return { state: { ...state, vault: 0 }, moved: state.vault };
}
