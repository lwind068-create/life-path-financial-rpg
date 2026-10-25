// "Reading the Fine Print" — content only. No game-engine logic lives here.
//
// credit_decision -> money_traps -> funding_choice.
// credit_decision is about credit cards; money_traps is about the money
// trends young people actually run into now (Buy Now Pay Later,
// subscriptions, crypto/FinTok hype, side hustles). Flags set here drive
// recurring costs (economy.ts) and later "because you…" consequences.
import type { StoryArc } from "./types";

export const finePrintArc: StoryArc = {
  id: "fine_print",
  title: "Reading the Fine Print",
  blurb: "Credit cards, subscriptions, and the money traps in your feed.",
  startChapterId: "credit_decision",
  pathLength: 3,
  chapters: {
    credit_decision: {
      id: "credit_decision",
      title: "Credit cards",
      icon: "credit-card",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 24 · A few months after your raise",
        situation:
          "Credit card offers keep showing up — in the mail, in apps, at the checkout counter. A credit card lets you buy now and pay later. If you pay the full bill every month, it's free. If you don't, the leftover balance becomes debt that grows with interest.",
        goal: "Use credit without letting it turn into debt — and read the rules before you agree to them.",
        terms: [
          { term: "APR", meaning: "The yearly interest rate on what you owe. At 24% APR, a $1,000 balance costs about $240 a year if you don't pay it off." },
          { term: "Minimum payment", meaning: "The smallest amount you must pay each month. Paying only this keeps most of your debt — and the interest — around." },
          { term: "0% promo rate", meaning: "No interest for a while (like 12 months). After that, the normal high rate kicks in." },
          { term: "Credit score", meaning: "A number (300–850) that shows lenders how reliably you pay. Late payments hurt it; on-time payments help." },
        ],
        trend: "The average credit card interest rate in the U.S. has been above 20% in recent years — one of the most expensive ways to borrow money.",
      },
      economy: { paycheck: 5900, payByFlag: { job_meridian: 1000 }, bills: 3900 },
      consequences: [
        { id: "joined_startup", text: "You joined the startup: your old raise is gone and the pay is lower — but you own equity now", ifAll: ["path_startup"], clears: ["raise_big", "raise_mid", "raise_base", "raise_saved", "raise_half", "job_harbor", "job_meridian"], sets: ["startup_pay"] },
      ],
      questions: [
        {
          id: "credit_q0_espp",
          icon: "trending-up",
          showIf: { ifAll: ["path_corp"] },
          variants: [{ id: "v1", narrative: "Your company offers a stock plan: put up to 10% of each paycheck into company stock at a 15% discount. How do you use it?" }],
          choices: [
            { id: "espp_skip", label: "Skip it", outcomeNarrative: "Simple — but you passed on a built-in 15% discount.", financialQualityScore: 3 },
            { id: "espp_smart", label: "Buy in, then sell regularly and spread the money out", outcomeNarrative: "You lock in the discount without betting everything on one company.", financialQualityScore: 5, sets: ["espp_buy", "espp_smart"] },
            { id: "espp_allin", label: "Max it out and never sell — I believe in us", outcomeNarrative: "Your job AND your savings now depend on one company. Huge upside, huge risk.", financialQualityScore: 2, statEffects: { stress: 1 }, sets: ["espp_buy", "espp_allin"] },
          ],
        },
        {
          id: "credit_q0_startup_crunch",
          icon: "rocket",
          showIf: { ifAll: ["path_startup"] },
          variants: [{ id: "v1", narrative: "The startup hits a rough patch. The founder offers everyone a choice: take a 20% pay cut for extra equity, or keep your pay." }],
          narrativeIf: [
            { ifAny: ["auto_save", "raise_saved", "car_fund"], narrative: "The startup hits a rough patch. The founder offers: take a 20% pay cut for extra equity, or keep your pay. Your savings habit means you could handle the cut." },
          ],
          choices: [
            { id: "crunch_extra_equity", label: "Take the cut for extra equity — my savings can cover it", outcomeNarrative: "Tighter months, bigger slice of the upside.", financialQualityScore: 5, statEffects: { savings: -1500 }, sets: ["more_equity"] },
            { id: "crunch_keep_pay", label: "Keep my pay — no extra risk", outcomeNarrative: "Safe choice. Your slice stays the same.", financialQualityScore: 4 },
            { id: "crunch_panic", label: "Take the cut and put rent on a credit card", outcomeNarrative: "Bigger slice — and growing card debt.", financialQualityScore: 2, statEffects: { debt: 1500, stress: 2 }, sets: ["more_equity"] },
          ],
        },
        {
          id: "credit_q1_store_card",
          icon: "credit-card",
          variants: [{ id: "v1", narrative: "You're buying $150 of work clothes. The cashier says: \"Open our store card and get 20% off today!\" The card's APR is 29.99%. What do you do?" }],
          choices: [
            { id: "cr1_sign_up", label: "Sign up — 20% off!", outcomeNarrative: "You save $30 today and now have a 30% interest card in your wallet.", financialQualityScore: 2, statEffects: { cash: -120 }, sets: ["store_card"] },
            { id: "cr1_ask_apr", label: "Skip the card, pay normally", outcomeNarrative: "You pay $150 and skip a 30% interest card. Easy.", financialQualityScore: 5, statEffects: { cash: -150 } },
            { id: "cr1_pay_off_plan", label: "Sign up, then pay it off right away", outcomeNarrative: "If you really pay it off, this works. Most people don't.", financialQualityScore: 3, statEffects: { cash: -120 } },
          ],
        },
        {
          id: "credit_q5_fine_print",
          icon: "scroll",
          variants: [{ id: "v1", narrative: "Your bank offers a regular card: 0% interest for 12 months. The terms are 6 pages long. Do you read them?" }],
          choices: [
            { id: "cr5_find_after_rate", label: "Yes — at least find the rate after the 12 months", outcomeNarrative: "Found it: 24.99% after month 12. Good to know.", financialQualityScore: 5 },
            { id: "cr5_skim_alarming", label: "Skim for anything scary", outcomeNarrative: "You miss the part where it jumps to 24.99%.", financialQualityScore: 3 },
            { id: "cr5_skip_entirely", label: "No — just click Agree", outcomeNarrative: "You have no idea what happens after month 12.", financialQualityScore: 2, sets: ["missed_promo"] },
          ],
        },
        {
          id: "credit_q3_autopay",
          icon: "credit-card",
          variants: [{ id: "v1", narrative: "The card is approved. How do you pay the bill each month?" }],
          choices: [
            { id: "cr3_autopay_plus_reminder", label: "Autopay the full balance every month", outcomeNarrative: "You'll never pay interest or a late fee. This is how credit cards stay free.", financialQualityScore: 5, sets: ["autopay_full"] },
            { id: "cr3_manual", label: "Autopay just the minimum", outcomeNarrative: "No late fees — but any balance you carry keeps growing with interest.", financialQualityScore: 3, sets: ["autopay_min"] },
            { id: "cr3_skip_autopay", label: "I'll pay it myself when I remember", outcomeNarrative: "Most of the time you'll remember. One miss costs a fee and hurts your score.", financialQualityScore: 2, sets: ["manual_pay"] },
          ],
        },
        {
          id: "credit_q6_first_purchase",
          icon: "credit-card",
          menuStyle: true,
          variants: [{ id: "v1", narrative: "First purchase on the new card. What do you buy?" }],
          narrativeIf: [
            { ifAll: ["missed_promo"], narrative: "First purchase on the new card. It's 0% for now (you didn't check for how long). What do you buy?" },
          ],
          choices: [
            { id: "cr6_wanted_item", label: "A $900 TV — it's 0% for a year!", outcomeNarrative: "Now you owe $900. If it's not paid off when the promo ends, interest kicks in.", financialQualityScore: 2, statEffects: { debt: 900, stress: 1 }, amount: -900, tone: "negative", sets: ["big_card_buy"] },
            { id: "cr6_planned_expense", label: "Groceries + gas I'd buy anyway — $150", outcomeNarrative: "Normal spending on the card. Just pay it off.", financialQualityScore: 4, statEffects: { debt: 150 }, amount: -150, tone: "neutral" },
            { id: "cr6_essential_only", label: "Just my $50 phone bill", outcomeNarrative: "A small, regular bill that builds your credit score when paid on time.", financialQualityScore: 5, statEffects: { debt: 50 }, amount: -50, tone: "positive" },
          ],
        },
        {
          id: "credit_q8_private_insurance",
          icon: "briefcase",
          showIf: { ifAll: ["job_meridian"] },
          variants: [{ id: "v1", narrative: "Your job at Meridian still has no health insurance. You can buy a plan yourself. What do you do?" }],
          choices: [
            { id: "cr8_compare_and_enroll", label: "Compare plans and buy a solid one — $350/mo", outcomeNarrative: "It's expensive, but one hospital visit could cost more than a year of it.", financialQualityScore: 5, sets: ["private_insurance"] },
            { id: "cr8_cheapest_plan", label: "Buy the cheapest plan — $200/mo", outcomeNarrative: "Cheaper, but it has a huge deductible. Better than nothing.", financialQualityScore: 3, sets: ["cheap_insurance"] },
            { id: "cr8_keep_waiting", label: "Keep going without insurance", outcomeNarrative: "You keep the money — and all the risk.", financialQualityScore: 2, statEffects: { stress: 1 }, sets: ["uninsured"] },
          ],
        },
        {
          id: "credit_q9_credit_score",
          icon: "credit-card",
          randomEvent: { id: "birthday_money", chance: 0.3, bannerText: "Birthday card from your grandma — $100 inside.", statEffects: { cash: 100 } },
          variants: [{ id: "v1", narrative: "Your bank app shows your credit score: 680. You'd like it higher before you ever need a loan. What helps most?" }],
          choices: [
            { id: "cr9_more_cards", label: "Open a few more cards", outcomeNarrative: "New applications can actually lower your score for a while.", financialQualityScore: 2 },
            { id: "cr9_on_time_low", label: "Pay on time and keep balances low", outcomeNarrative: "Those are the two biggest parts of your score.", financialQualityScore: 5 },
            { id: "cr9_check_often", label: "Check it every day", outcomeNarrative: "Checking doesn't hurt it — but it doesn't help either.", financialQualityScore: 3 },
          ],
        },
      ],
      nextChapterId: "money_traps",
    },

    money_traps: {
      id: "money_traps",
      title: "Money in your feed",
      icon: "phone",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 25 · The next year",
        situation:
          "Your phone is full of ways to spend: \"Pay in 4\" buttons on every checkout, subscriptions that renew on their own, and videos of people your age who say they got rich from crypto or a side hustle. Some of it is useful. A lot of it is designed to get your money.",
        goal: "Spot the traps, keep the good stuff — and find a real way to earn more.",
        terms: [
          { term: "Buy Now, Pay Later (BNPL)", meaning: "Splitting a purchase into 4 payments. Easy to stack up — and miss — across many purchases." },
          { term: "Subscription creep", meaning: "Small monthly charges that add up because you forget about them." },
          { term: "Crypto", meaning: "Digital currencies like Bitcoin. Prices can rise or crash very fast." },
          { term: "FOMO", meaning: "\"Fear of missing out\" — buying something because everyone else is." },
          { term: "Side hustle", meaning: "Extra work outside your main job, like tutoring or deliveries." },
        ],
        trend: "Bitcoin fell about 75% from its late-2021 peak to late 2022. Many people who bought at the hype lost most of their money.",
      },
      economy: { paycheck: 5900, payByFlag: { job_meridian: 1000 }, bills: 3900 },
      consequences: [
        { id: "late_fee", text: "Because you didn't set up autopay, you missed a card payment: $35 late fee and a lower credit score", ifAll: ["manual_pay"], chance: 0.7, statEffects: { cash: -35, stress: 1 } },
        { id: "store_card_interest", text: "Because you opened the store card, you forgot a bill: late fee plus 30% interest", ifAll: ["store_card"], chance: 0.6, statEffects: { cash: -70 } },
        { id: "promo_ended", text: "Because you didn't read the terms, your 0% promo ended — interest kicked in on the TV", ifAll: ["missed_promo", "big_card_buy"], statEffects: { debt: 220, stress: 1 } },
        { id: "uninsured_er", text: "Because you had no health insurance, a trip to the ER cost you", ifAll: ["uninsured"], chance: 0.5, statEffects: { cash: -2400, stress: 2 } },
        { id: "cheap_plan_deductible", text: "A sprained ankle. Your cheap plan's high deductible meant you paid most of the bill", ifAll: ["cheap_insurance"], chance: 0.4, statEffects: { cash: -800 } },
        { id: "rent_increase", text: "Your landlord raised the rent at renewal — this year's extra cost", ifAny: ["rent_solo", "rent_split", "rent_shared"], statEffects: { cash: -400 } },
      ],
      questions: [
        {
          id: "traps_q1_bnpl",
          icon: "phone",
          variants: [{ id: "v1", narrative: "Sneakers you want: $240. The checkout says \"Or 4 payments of $60 — no interest!\" What do you do?" }],
          choices: [
            { id: "tr1_bnpl", label: "Pay in 4 — it's only $60", outcomeNarrative: "Easy. So easy you start using it for everything — and the payments stack up.", financialQualityScore: 2, statEffects: { cash: -60 }, sets: ["bnpl_habit"] },
            { id: "tr1_wait", label: "Wait until I really want them and can pay in full", outcomeNarrative: "A week later you barely want them. $240 stays in your account.", financialQualityScore: 5 },
            { id: "tr1_cash", label: "Buy them now with cash", outcomeNarrative: "You can afford it and owe nothing. Just don't make it a habit.", financialQualityScore: 4, statEffects: { cash: -240 } },
          ],
        },
        {
          id: "traps_q2_subscriptions",
          icon: "phone",
          mathChallenge: { prompt: "9 subscriptions averaging $10 each per month. How much is that per year?", answer: 1080, unit: "$" },
          variants: [{ id: "v1", narrative: "You check your bank app: 9 subscriptions — 4 streaming services, 2 music apps, a gym you don't go to, and 2 apps you forgot about. About $90 a month. What do you do?" }],
          choices: [
            { id: "tr2_keep_all", label: "Keep them all — they're small", outcomeNarrative: "Small × 9 × 12 = over $1,000 a year.", financialQualityScore: 2, sets: ["subs_many"] },
            { id: "tr2_cancel_one", label: "Cancel the gym", outcomeNarrative: "One down. The forgotten apps keep charging.", financialQualityScore: 3, sets: ["subs_many"] },
            { id: "tr2_cancel_unused", label: "Cancel everything I don't use weekly", outcomeNarrative: "Down to 2 subscriptions. That's about $840 a year back.", financialQualityScore: 5, sets: ["subs_trimmed"] },
          ],
        },
        {
          id: "traps_q3_crypto",
          icon: "trending-up",
          randomEvent: { id: "cracked_screen", chance: 0.3, bannerText: "You dropped your phone. Screen repair: $180.", statEffects: { cash: -180 } },
          variants: [{ id: "v1", narrative: "A coin called ZOOMR is up 300% this month. Your feed is full of people posting gains. A friend says \"get in before it's too late.\" What do you do?" }],
          choices: [
            { id: "tr3_research", label: "Skip it — hype isn't a reason to invest", outcomeNarrative: "You don't buy. Your money stays safe.", financialQualityScore: 5 },
            { id: "tr3_big_bet", label: "Put in $1,000", outcomeNarrative: "You're in. You check the price 30 times a day.", financialQualityScore: 2, statEffects: { cash: -1000, stress: 2 }, sets: ["crypto_bet"] },
            { id: "tr3_small_fun", label: "Put in $50 just for fun", outcomeNarrative: "Money you can afford to lose. You treat it like a ticket to a show.", financialQualityScore: 3, statEffects: { cash: -50 } },
          ],
        },
        {
          id: "traps_q4_side_hustle",
          icon: "banknote",
          variants: [{ id: "v1", narrative: "You want to earn more. Three ideas come up. Which one do you go with?" }],
          choices: [
            { id: "tr4_course", label: "A $497 online course: \"Make $10K a month!\"", outcomeNarrative: "The course is mostly ads for a more expensive course. $497 gone.", financialQualityScore: 2, statEffects: { cash: -497, stress: 1 } },
            { id: "tr4_tutor", label: "Tutor math two evenings a week", outcomeNarrative: "Real skills, real pay. About $250 extra a month.", financialQualityScore: 5, sets: ["side_hustle"] },
            { id: "tr4_nothing", label: "Not now — my job is enough", outcomeNarrative: "Fair. Rest matters too.", financialQualityScore: 3 },
          ],
        },
        {
          id: "traps_q5_refund",
          icon: "piggy-bank",
          menuStyle: true,
          variants: [{ id: "v1", narrative: "Your tax refund just hit: $900. What do you do with it?" }],
          narrativeIf: [
            { ifAny: ["big_card_buy", "store_card"], narrative: "Your tax refund just hit: $900. You still have some credit card balance. What do you do with it?" },
          ],
          choices: [
            { id: "tr5_trip", label: "Weekend trip with friends", outcomeNarrative: "Great memories. The refund is gone by Monday.", financialQualityScore: 2, amount: 0, tone: "negative" },
            { id: "tr5_half", label: "Half to savings, half for fun", outcomeNarrative: "$450 saved, $450 enjoyed.", financialQualityScore: 3, debtFirst: 450, amount: 450, tone: "neutral" },
            { id: "tr5_save", label: "Pay off any card balance, save the rest", outcomeNarrative: "Debt first, then savings. Every dollar of it works for you.", financialQualityScore: 5, debtFirst: 900, amount: 900, tone: "positive" },
          ],
        },
      ],
      nextChapterId: "funding_choice",
    },
  },
};
