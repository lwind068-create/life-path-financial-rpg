// ---------------------------------------------------------------------------
// The money system.
//
// Four numbers: cash (checking - what you spend from), savings, debt (credit
// card / loans) and stress. Spending works the way it does in real life:
//
//   1. Purchases come out of CASH.
//   2. If cash runs out, the rest comes out of SAVINGS.
//   3. If savings runs out too, the rest goes on your CREDIT CARD as DEBT.
//
// Every chapter (a "stretch" of a few months) opens with a ledger: the
// paychecks that came in, rent and bills, recurring costs from earlier
// choices, card interest, savings interest, and any "because you…"
// consequences from past decisions. That's what makes choices carry
// forward. Nothing here touches the hidden research scoring in scoring.ts.
// ---------------------------------------------------------------------------
import type { Chapter, Consequence, PlayerStats } from "../content/types";
import { RECURRING_COSTS } from "../content/economy";

export const STARTING_STATS: PlayerStats = { cash: 900, savings: 1500, debt: 0, stress: 2 };

/** Per-chapter interest on card debt (~24% a year) and on savings (~3% a year). */
export const DEBT_RATE = 0.04;
export const SAVINGS_RATE = 0.005;

export interface MoneyNote {
  text: string;
  tone: "good" | "bad" | "neutral";
}

export function netWorth(s: PlayerStats): number {
  return Math.round(s.cash + s.savings - s.debt);
}

function clampStress(v: number): number {
  return Math.max(0, Math.min(10, v));
}

const money = (n: number) => `$${Math.round(Math.abs(n)).toLocaleString()}`;

/**
 * Applies a choice's or event's money effects with the cash → savings →
 * debt waterfall. Returns the new stats plus plain-English notes about
 * anything the player should notice (e.g. "$300 went on your card").
 */
export function applyMoney(stats: PlayerStats, effects: Partial<PlayerStats> | undefined): { stats: PlayerStats; notes: MoneyNote[] } {
  const s = { ...stats };
  const notes: MoneyNote[] = [];
  if (!effects) return { stats: s, notes };

  // Debt changes first (borrowing adds cash elsewhere in the same effect; paying down is paired with a cash cost).
  if (effects.debt) s.debt = Math.max(0, s.debt + effects.debt);

  // Savings withdrawals first (beyond the balance they fall through to cash, then the card).
  // Deposits are added AFTER spending below, so money moving cash → savings/investments
  // never looks like it "came out of savings".
  if (effects.savings) {
    if (effects.savings < 0) {
      const want = -effects.savings;
      const fromSavings = Math.min(want, Math.max(0, s.savings));
      s.savings -= fromSavings;
      const rest = want - fromSavings;
      if (rest > 0) spendCash(s, rest, notes, false);
    }
  }

  // Cash: income adds; spending uses the waterfall.
  if (effects.cash) {
    if (effects.cash >= 0) s.cash += effects.cash;
    else spendCash(s, -effects.cash, notes, true);
  }

  if (effects.savings && effects.savings > 0) s.savings += effects.savings;

  if (effects.stress) s.stress = clampStress(s.stress + effects.stress);

  s.cash = Math.round(s.cash);
  s.savings = Math.round(s.savings);
  s.debt = Math.round(s.debt);
  return { stats: s, notes };
}

function spendCash(s: PlayerStats, amount: number, notes: MoneyNote[], allowSavings: boolean) {
  const fromCash = Math.min(amount, Math.max(0, s.cash));
  s.cash -= fromCash;
  let rest = amount - fromCash;
  if (rest <= 0) return;
  if (allowSavings) {
    const fromSavings = Math.min(rest, Math.max(0, s.savings));
    if (fromSavings > 0) {
      s.savings -= fromSavings;
      rest -= fromSavings;
      notes.push({ text: `Not enough cash: ${money(fromSavings)} came out of your savings.`, tone: "bad" });
    }
  }
  if (rest > 0) {
    s.debt += rest;
    notes.push({ text: `You ran out of money: ${money(rest)} went on your credit card (≈24% interest).`, tone: "bad" });
  }
}

export interface LedgerLine {
  label: string;
  /** Change in cash (or savings/debt, see `target`). Positive = money in. */
  amount: number;
  target: "cash" | "savings" | "debt";
  /** A "because you…" consequence line, shown with emphasis. */
  because?: boolean;
}

/**
 * Runs the between-chapters economy when a new chapter (stretch of months)
 * starts: paychecks, bills, recurring costs from flags, interest, and
 * consequences of earlier choices. Returns the ledger to show the player.
 */
export function runChapterEconomy(
  chapter: Chapter,
  stats: PlayerStats,
  flags: string[],
  firedConsequences: string[],
  rand: () => number = Math.random,
): { stats: PlayerStats; ledger: LedgerLine[]; fired: string[]; cleared: string[]; added: string[]; notes: MoneyNote[] } {
  const ledger: LedgerLine[] = [];
  const fired: string[] = [];
  const cleared: string[] = [];
  const added: string[] = [];
  const notes: MoneyNote[] = [];
  let s = { ...stats };
  const has = (f: string) => flags.includes(f);

  const apply = (line: LedgerLine) => {
    ledger.push(line);
    const eff: Partial<PlayerStats> = { [line.target]: line.amount };
    const r = applyMoney(s, eff);
    s = r.stats;
    notes.push(...r.notes);
  };

  // 1. Interest on what you already had (before new money moves).
  if (s.debt > 0) {
    const interest = Math.round(s.debt * DEBT_RATE);
    if (interest > 0) {
      s.debt += interest;
      ledger.push({ label: "Credit card interest on your balance", amount: interest, target: "debt" });
    }
  }
  if (s.savings > 0) {
    const interest = Math.round(s.savings * SAVINGS_RATE);
    if (interest > 0) {
      s.savings += interest;
      ledger.push({ label: "Interest your savings earned", amount: interest, target: "savings" });
    }
  }

  // 2. Paychecks for this stretch, by job/income flags.
  const econ = chapter.economy;
  if (econ) {
    let pay = econ.paycheck ?? 0;
    for (const [flag, extra] of Object.entries(econ.payByFlag ?? {})) if (has(flag)) pay += extra;
    if (pay !== 0) apply({ label: econ.paycheckLabel ?? "Paychecks this stretch (after taxes)", amount: pay, target: "cash" });
    if (econ.bills) apply({ label: econ.billsLabel ?? "Food, phone, gas and everyday bills", amount: -econ.bills, target: "cash" });

    // 3. Recurring costs/income from earlier choices.
    for (const [flag, item] of Object.entries(RECURRING_COSTS)) {
      if (!has(flag)) continue;
      if (item.payment) {
        // Pay down card debt from cash you actually have.
        const target = Math.max(item.amount, Math.round(s.debt * (item.paymentPct ?? 0)));
        const paid = Math.max(0, Math.min(target, s.cash, s.debt));
        if (paid <= 0) continue;
        s = { ...s, cash: s.cash - paid, debt: s.debt - paid };
        ledger.push({ label: item.label, amount: -paid, target: "debt", because: Boolean(item.because) });
      } else if (item.transfer) {
        // Move money you have (cash → savings); if cash is short it only moves what's there.
        const moved = Math.max(0, Math.min(item.amount, s.cash));
        if (moved <= 0) continue;
        s = { ...s, cash: s.cash - moved };
        apply({ label: item.label, amount: moved, target: "savings", because: Boolean(item.because) });
      } else {
        apply({ label: item.label, amount: item.amount, target: item.target ?? "cash", because: Boolean(item.because) });
      }
    }
  }

  // 4. One-time consequences of earlier choices ("Because you…").
  // Flags as they stand while consequences resolve, so an earlier consequence's
  // sets/clears can gate a later one (e.g. "jackpot" sets a flag that skips "bust").
  let live = [...flags];
  for (const c of chapter.consequences ?? []) {
    if (firedConsequences.includes(c.id)) continue;
    if (!consequenceApplies(c, live)) continue;
    if (c.chance !== undefined && rand() >= c.chance) continue;
    fired.push(c.id);
    cleared.push(...(c.clears ?? []));
    added.push(...(c.sets ?? []));
    live = [...live.filter((f) => !(c.clears ?? []).includes(f)), ...(c.sets ?? [])];
    for (const [key, val] of Object.entries(c.statEffects ?? {}) as [keyof PlayerStats, number][]) {
      if (key === "stress") {
        s.stress = clampStress(s.stress + val);
        continue;
      }
      apply({ label: c.text, amount: val, target: key, because: true });
    }
    if (!c.statEffects || Object.keys(c.statEffects).every((k) => k === "stress")) {
      ledger.push({ label: c.text, amount: 0, target: "cash", because: true });
    }
  }

  return { stats: s, ledger, fired, cleared, added, notes };
}

export function consequenceApplies(c: Pick<Consequence, "ifAll" | "ifAny" | "ifNone">, flags: string[]): boolean {
  const has = (f: string) => flags.includes(f);
  if (c.ifAll && !c.ifAll.every(has)) return false;
  if (c.ifAny && !c.ifAny.some(has)) return false;
  if (c.ifNone && c.ifNone.some(has)) return false;
  return true;
}
