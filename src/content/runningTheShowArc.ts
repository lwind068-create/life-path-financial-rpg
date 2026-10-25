// "Running the Show" - content only. No game-engine logic lives here.
//
// hiring_decision -> cashflow_decision -> opening_account.
// Hiring choices set flags that come back as consequences (fines, turnover);
// the slow-month chapter rewards players who built a business cushion.
import type { StoryArc } from "./types";

const DAY_JOB = { paycheck: 5900, payByFlag: { job_meridian: 1000 }, bills: 3900 };

export const runningTheShowArc: StoryArc = {
  id: "running_the_show",
  title: "Running the Show",
  blurb: "Your first hire, and your first slow month.",
  startChapterId: "hiring_decision",
  pathLength: 3,
  chapters: {
    hiring_decision: {
      id: "hiring_decision",
      title: "Your first hire",
      icon: "users",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 29 · The next spring",
        situation:
          "The coffee business is busier than ever and you can't run it alone on top of your day job. A friend wants to work 15 hours a week. Hiring someone means following the rules for pay, taxes and paperwork.",
        goal: "Hire the right way: fair pay, clear expectations, legal paperwork.",
        terms: [
          { term: "Employee vs. contractor", meaning: "Employees work on your schedule under your direction; you must withhold taxes for them. Contractors run their own work. Getting it wrong can mean fines." },
          { term: "Payroll", meaning: "The system for paying employees and handling their taxes." },
          { term: "Minimum wage", meaning: "The lowest hourly pay allowed by law. Many states set it higher than the federal $7.25." },
          { term: "Trial period", meaning: "A set time (like 30 days) to see if a new hire is a good fit." },
        ],
        trend: "Many U.S. states and cities have raised minimum wages to $15 an hour or more in recent years.",
      },
      economy: DAY_JOB,
      consequences: [
        { id: "new_cart_after_sale", text: "Because you sold your first cart, you used $8,000 of the sale money to open a new one in a busier spot", ifAll: ["biz_sold"], statEffects: { savings: -8000 }, sets: ["biz_profit_mid"] },
        { id: "second_cart_slow", text: "Your second cart had a slow first season, you covered the gap", ifAll: ["biz_expanded"], chance: 0.5, statEffects: { cash: -1500, stress: 1 } },
        { id: "card_balance_check", text: "Because you put the business on a credit card, interest is still eating into your profit", ifAll: ["biz_card_debt"], statEffects: { stress: 1 } },
      ],
      questions: [
        {
          id: "hire_q1_classification",
          icon: "users",
          variants: [{ id: "v1", narrative: "Your friend will work set hours, at your cart, doing what you tell them. Employee or contractor?" }],
          choices: [
            { id: "hi1_whatever_simpler", label: "Whatever's simpler, don't overthink it", outcomeNarrative: "Simple now can mean fines later.", financialQualityScore: 2 },
            { id: "hi1_assume_contractor", label: "Contractor, less paperwork", outcomeNarrative: "With set hours and your direction, they're really an employee. That's a risk.", financialQualityScore: 3, sets: ["misclassified"] },
            { id: "hi1_look_up_criteria", label: "Look up the rules. Sounds like an employee", outcomeNarrative: "Right. Set hours + your direction = employee.", financialQualityScore: 5 },
          ],
        },
        {
          id: "hire_q2_wage",
          icon: "banknote",
          mathChallenge: { prompt: "15 hours a week at $16/hour. What's the weekly pay?", answer: 240, unit: "$" },
          variants: [{ id: "v1", narrative: "Similar jobs nearby pay $15–$17 an hour. What do you offer?" }],
          choices: [
            { id: "hi2_research_market", label: "$16, fair for the area, and the cart can afford it", outcomeNarrative: "Fair pay, and you checked the budget first.", financialQualityScore: 5 },
            { id: "hi2_feels_fair", label: "$18, I want to be generous", outcomeNarrative: "Generous, but you didn't check if the cart can sustain it.", financialQualityScore: 3, statEffects: { cash: -200 } },
            { id: "hi2_lowest_accept", label: "$12, the least they'll accept", outcomeNarrative: "Cheap now. People leave jobs that underpay them.", financialQualityScore: 2, sets: ["low_wage"] },
          ],
        },
        {
          id: "hire_q4_trial_period",
          icon: "users",
          variants: [{ id: "v1", narrative: "How do you start the job?" }],
          choices: [
            { id: "hi4_commit_indefinite", label: "Full commitment from day one", outcomeNarrative: "Hard to fix if it doesn't work out.", financialQualityScore: 2 },
            { id: "hi4_vague_trial", label: "Say it's a \"trial,\" without details", outcomeNarrative: "Neither of you knows what that means.", financialQualityScore: 3 },
            { id: "hi4_defined_trial", label: "A 30-day trial with a check-in date", outcomeNarrative: "Clear for both of you.", financialQualityScore: 5 },
          ],
        },
        {
          id: "hire_q7_paying_on_time",
          icon: "banknote",
          variants: [{ id: "v1", narrative: "How will you pay them?" }],
          choices: [
            { id: "hi7_whenever", label: "Whenever I get to it", outcomeNarrative: "Late pay is the fastest way to lose good help.", financialQualityScore: 2, sets: ["low_wage"] },
            { id: "hi7_rough_payday", label: "Around the same day each week", outcomeNarrative: "Mostly works.", financialQualityScore: 3 },
            { id: "hi7_fixed_system", label: "A payroll app on a fixed payday", outcomeNarrative: "Automatic, on time, taxes handled.", financialQualityScore: 5 },
          ],
        },
        {
          id: "hire_q8_final_call",
          icon: "scroll",
          randomEvent: { id: "catering_gig", chance: 0.3, bannerText: "A local office books your cart for an event: +$350.", statEffects: { cash: 350 } },
          variants: [{ id: "v1", narrative: "Last step: making it official. What do you do?" }],
          choices: [
            { id: "hi8_do_it_right", label: "Set up real payroll and paperwork first", outcomeNarrative: "Takes an afternoon. Everything is legal.", financialQualityScore: 5, sets: ["employee_payroll", "employee_help"] },
            { id: "hi8_figure_it_out", label: "Start now, do paperwork later", outcomeNarrative: "\"Later\" takes three months. It works out, barely.", financialQualityScore: 3, statEffects: { stress: 1 }, sets: ["employee_payroll", "employee_help"] },
            { id: "hi8_cash_off_books", label: "Pay cash, off the books", outcomeNarrative: "Simple, and illegal. If it's found, the fines are big.", financialQualityScore: 2, statEffects: { stress: 2 }, sets: ["employee_payroll", "employee_help", "off_books"] },
          ],
        },
      ],
      nextChapterId: "cashflow_decision",
    },

    cashflow_decision: {
      id: "cashflow_decision",
      title: "A slow month",
      icon: "cloud-rain",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 29 · That winter",
        situation:
          "Cold weather, fewer customers. This month the cart brings in $1,400 less than usual, but the bills don't shrink. Rent for your cart spot, supplies, and your employee's pay are all due.",
        goal: "Get through the slow month without panic, and without new expensive debt.",
        terms: [
          { term: "Cash flow gap", meaning: "When money going out is bigger than money coming in for a while." },
          { term: "Business cushion", meaning: "Savings set aside just for the business's slow months." },
          { term: "Line of credit", meaning: "A loan you can borrow from as needed, up to a limit." },
          { term: "Fixed vs. variable costs", meaning: "Fixed costs (rent) stay the same; variable costs (supplies) go down when you sell less." },
        ],
        trend: "Most small businesses have seasonal ups and downs. Many keep a cushion of 1–3 months of expenses for the slow ones.",
      },
      economy: DAY_JOB,
      consequences: [
        { id: "off_books_fine", text: "Because you paid your employee off the books, a tax audit found it: back taxes and a fine", ifAll: ["off_books"], statEffects: { cash: -2000, stress: 2 } },
        { id: "misclass_fine", text: "Because you treated your employee as a contractor, you owed back payroll taxes", ifAll: ["misclassified"], chance: 0.6, statEffects: { cash: -800, stress: 1 } },
        { id: "quit_low_pay", text: "Because pay was low or late, your employee quit. Finding and training someone new cost you", ifAll: ["low_wage"], statEffects: { cash: -500, stress: 1 } },
      ],
      questions: [
        {
          id: "cash_q1_tracking",
          icon: "cloud-rain",
          variants: [{ id: "v1", narrative: "Revenue is down $1,400. Do you know where all your money is going?" }],
          choices: [
            { id: "ca1_rough_sense", label: "Roughly, I know the big bills", outcomeNarrative: "The small ones add up too.", financialQualityScore: 3 },
            { id: "ca1_pull_all", label: "List every expense this month", outcomeNarrative: "You find $150 of supplies you're over-ordering.", financialQualityScore: 5 },
            { id: "ca1_skip_review", label: "No, just pay bills as they come", outcomeNarrative: "Flying blind in a slow month.", financialQualityScore: 2, statEffects: { stress: 1 } },
          ],
        },
        {
          id: "cash_q2_prioritize",
          icon: "cloud-rain",
          variants: [{ id: "v1", narrative: "Spot rent ($900), supplier bill ($400) and your own pay ($300). You can't pay all of them on time. What comes first?" }],
          choices: [
            { id: "ca2_first_arrive", label: "Whatever bill shows up first", outcomeNarrative: "The order bills arrive isn't the order that matters.", financialQualityScore: 3 },
            { id: "ca2_own_draw_first", label: "Pay myself first", outcomeNarrative: "You need to eat, but losing your spot would end the business.", financialQualityScore: 2 },
            { id: "ca2_rank_protect", label: "Rent first, then key suppliers", outcomeNarrative: "You protect what keeps the business open.", financialQualityScore: 5 },
          ],
        },
        {
          id: "cash_q3_vendor_comms",
          icon: "users",
          variants: [{ id: "v1", narrative: "Your $400 supplier bill will be a few days late. What do you do?" }],
          choices: [
            { id: "ca3_say_nothing", label: "Say nothing and pay late", outcomeNarrative: "They add a $40 late fee and trust you less.", financialQualityScore: 2, statEffects: { cash: -40 } },
            { id: "ca3_ask_ahead", label: "Call before it's due and ask for a few extra days", outcomeNarrative: "\"No problem, thanks for the heads-up.\"", financialQualityScore: 5 },
            { id: "ca3_mention_after", label: "Apologize after it's late", outcomeNarrative: "They waive the fee this once.", financialQualityScore: 3 },
          ],
        },
        {
          id: "cash_q5_cutting_costs",
          icon: "cloud-rain",
          variants: [{ id: "v1", narrative: "Can you cut costs this month?" }],
          choices: [
            { id: "ca5_leave_as_is", label: "No, keep everything the same", outcomeNarrative: "The full $1,400 gap stays.", financialQualityScore: 2 },
            { id: "ca5_easiest_cut", label: "Cut my employee's hours in half", outcomeNarrative: "Saves money, but they're upset and service slows.", financialQualityScore: 3, statEffects: { stress: 1 } },
            { id: "ca5_identify_pause", label: "Pause ads and extra supplies just for this month", outcomeNarrative: "That trims $350 off the gap without hurting the business.", financialQualityScore: 5, statEffects: { cash: 350 } },
          ],
        },
        {
          id: "cash_q8_final_response",
          icon: "piggy-bank",
          variants: [{ id: "v1", narrative: "There's still a $1,400 gap. How do you cover it?" }],
          narrativeIf: [{ ifAll: ["biz_cushion"], narrative: "There's still a $1,400 gap. Good news: you've been building a business cushion since your first profitable month. How do you cover it?" }],
          choices: [
            { id: "ca8_personal_savings", label: "Pull from my personal savings, no tracking", outcomeNarrative: "Covered, but your personal safety net shrank and you didn't note it.", financialQualityScore: 2, statEffects: { savings: -1400, stress: 1 } },
            { id: "ca8_business_card", label: "Put it on a credit card", outcomeNarrative: "Covered, at about 24% interest until you pay it off.", financialQualityScore: 3, statEffects: { debt: 1400, stress: 1 } },
            { id: "ca8_emergency_fund", label: "Use the business cushion, that's what it's for", outcomeNarrative: "Covered, no new debt. The cushion did its job.", financialQualityScore: 5, statEffects: { savings: -1400 } },
          ],
        },
        {
          id: "cash_q9_rebound_spending",
          icon: "piggy-bank",
          menuStyle: true,
          randomEvent: { id: "medical_copay", chance: 0.3, bannerText: "Doctor's visit copay and a prescription: $90.", statEffects: { cash: -90 } },
          variants: [{ id: "v1", narrative: "Spring comes back strong: an extra $800 this month. What do you do with it?" }],
          choices: [
            { id: "ca9_let_it_relax", label: "Relax, things are fine now", outcomeNarrative: "It slips away on small stuff. Next winter you'll be back where you started.", financialQualityScore: 2, amount: 0, tone: "negative" },
            { id: "ca9_refill_fund_first", label: "Refill the cushion (or pay off any card first)", outcomeNarrative: "Ready for next winter.", financialQualityScore: 5, debtFirst: 800, amount: 800, tone: "positive" },
            { id: "ca9_split_it", label: "Half to the cushion, half breathing room", outcomeNarrative: "Partly refilled.", financialQualityScore: 3, statEffects: { savings: 400, cash: 400 }, amount: 400, tone: "neutral" },
          ],
        },
      ],
      nextChapterId: "opening_account",
    },
  },
};
