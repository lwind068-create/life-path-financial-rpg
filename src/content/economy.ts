// Recurring money tied to flags that choices set (see QuestionChoice.sets).
// Applied at the start of every chapter after the flag is set — this is how
// a decision in one chapter keeps costing (or paying) you later.
// Amounts are per chapter "stretch" (about two months).
import type { LedgerLine } from "../engine/money";

export interface RecurringItem {
  label: string;
  amount: number;
  target?: LedgerLine["target"];
  /** Show as a "because you…" line. */
  because?: boolean;
  /** Moves money from cash into savings (amount = how much), instead of creating it. */
  transfer?: boolean;
  /** Pays down debt from cash (amount = the most it pays), instead of creating money. */
  payment?: boolean;
  /** For payments: pay at least this share of the balance (like a card's minimum payment). */
  paymentPct?: number;
}

export const RECURRING_COSTS: Record<string, RecurringItem> = {
  // Job (set in First Job)
  job_harbor: { label: "Harbor & Finch 401(k) match (retirement money, counted in savings)", amount: 290, target: "savings", because: true },
  // Housing (set in Settling In)
  rent_solo: { label: "Rent — living alone ($1,050/mo)", amount: -2100 },
  rent_split: { label: "Rent — splitting with a roommate ($700/mo)", amount: -1400 },
  rent_shared: { label: "Rent — room in a shared house ($550/mo)", amount: -1100 },
  rent_monthly: { label: "Because you chose month-to-month, rent costs $150/mo more", amount: -300, because: true },
  renters_insurance: { label: "Renter's insurance ($15/mo)", amount: -30 },
  furniture_plan: { label: "Because you financed furniture, the payment plan", amount: -250, because: true },
  // Savings habits
  auto_save: { label: "Because you set up auto-save, moved from checking to savings", amount: 400, transfer: true, because: true },
  car_fund: { label: "Car maintenance fund (moved to savings)", amount: 100, transfer: true },
  // Raises (set in The Next Offer)
  raise_big: { label: "Because you negotiated, your raise is $8,500 a year", amount: 1100, because: true },
  raise_mid: { label: "Your raise ($6,800 a year)", amount: 880 },
  raise_base: { label: "Your raise ($6,000 a year, as first offered)", amount: 780 },
  raise_saved: { label: "Because you banked your raise, moved straight to savings", amount: 700, transfer: true, because: true },
  raise_half: { label: "Half your raise, moved to savings", amount: 350, transfer: true },
  lifestyle_creep: { label: "Because spending crept up with your raise", amount: -500, because: true },
  // Credit (set in Reading the Fine Print)
  autopay_full: { label: "Autopay paid your credit card in full", amount: 100000, payment: true },
  autopay_min: { label: "Autopay paid the minimum on your card (the rest keeps charging interest)", amount: 50, paymentPct: 0.06, payment: true, because: true },
  manual_pay: { label: "You paid part of your card bill when you remembered", amount: 300, payment: true },
  private_insurance: { label: "Health insurance you bought yourself", amount: -700 },
  cheap_insurance: { label: "Bare-bones health insurance", amount: -400 },
  // Modern money traps
  subs_many: { label: "Because you kept every subscription, streaming & apps", amount: -180, because: true },
  subs_trimmed: { label: "Subscriptions you kept (trimmed)", amount: -40 },
  bnpl_habit: { label: "Because you got used to Buy Now Pay Later, stacked installments", amount: -320, because: true },
  side_hustle: { label: "Because you started a side hustle, extra income", amount: 500, because: true },
  // Business
  biz_loan: { label: "Business loan payment", amount: -380 },
  family_loan: { label: "Paying your parents back for the business loan", amount: -250 },
  biz_card_debt: { label: "Card payment on the business startup costs", amount: 300, payment: true },
  biz_profit_high: { label: "Coffee cart profit you paid yourself (priced for real margin)", amount: 1100, because: true },
  biz_profit_mid: { label: "Coffee cart profit you paid yourself", amount: 700 },
  biz_profit_low: { label: "Because you priced low, the cart barely profits", amount: 250, because: true },
  biz_expanded: { label: "Second location profit", amount: 600 },
  biz_loan_big: { label: "Expansion loan payment", amount: -450 },
  biz_loan_good: { label: "Because you negotiated, a smaller expansion loan payment", amount: -330, because: true },
  biz_cushion: { label: "Business cushion (moved to savings)", amount: 150, transfer: true },
  employee_payroll: { label: "Your part-time employee's pay", amount: -900 },
  employee_help: { label: "Extra sales because you have help at the cart", amount: 700 },
  // Investing
  roth_ira: { label: "Roth IRA contribution (moved to long-term savings)", amount: 200, transfer: true },
  index_auto: { label: "Auto-investing into your index fund (moved to savings)", amount: 150, transfer: true },
};
