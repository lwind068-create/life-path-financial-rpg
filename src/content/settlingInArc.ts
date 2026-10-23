// "Settling In" — content only. No game-engine logic lives here.
//
// housing_decision -> car_repair_decision -> promotion_offer.
// Choices here set flags (rent, insurance, savings habits) that keep
// costing or paying the player in every later chapter — see
// src/content/economy.ts (RECURRING_COSTS) and Chapter.consequences.
//
// Money rule of thumb for content: thinking/judgment choices have no money
// effect. Buying something = cash goes down. Saving = cash moves to
// savings. The engine handles running out (cash -> savings -> credit card).
import type { StoryArc } from "./types";

export const settlingInArc: StoryArc = {
  id: "settling_in",
  title: "Settling In",
  blurb: "First apartment, first car repair, first real budget.",
  startChapterId: "housing_decision",
  pathLength: 3,
  chapters: {
    housing_decision: {
      id: "housing_decision",
      title: "Your first place",
      icon: "home",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 22 · Your first month at work",
        situation:
          "You started your new job and your first paychecks just came in. Now you need an apartment. Everything you pick here — rent, lease, insurance — becomes a bill you'll pay every month for the rest of the game.",
        goal: "Find a place you can afford and keep enough cash so one surprise doesn't put you in debt.",
        terms: [
          { term: "Take-home pay", meaning: "What lands in your account after taxes. Yours is about $2,950 a month." },
          { term: "The 30% rule", meaning: "A common guideline: keep rent under about 30% of your income. For you, that's under about $1,000 a month." },
          { term: "Security deposit", meaning: "Money you pay up front that you get back when you move out, if nothing's damaged." },
          { term: "Renter's insurance", meaning: "Cheap insurance (about $15/month) that pays to replace your stuff after a fire, flood or theft." },
        ],
        trend: "Rents in the U.S. rose fast in the early 2020s. Many young adults now live with roommates to keep housing affordable.",
      },
      economy: { paycheck: 5900, payByFlag: { job_meridian: 1000 }, paycheckLabel: "Your first paychecks (2 months, after taxes)", bills: 3900 },
      consequences: [
        { id: "bonus_meridian", text: "Meridian signing bonus ($2,000 before taxes)", ifAll: ["job_meridian"], statEffects: { cash: 1500 } },
        { id: "bonus_harbor", text: "Because you asked, Harbor & Finch gave you a $1,000 signing bonus (before taxes)", ifAll: ["job_harbor", "asked_bonus"], statEffects: { cash: 750 } },
      ],
      questions: [
        {
          id: "housing_q1_budget_cap",
          icon: "home",
          sliderStyle: true,
          variants: [{ id: "v1", narrative: "You take home about $2,950 a month. Before you look at apartments, do you set a max rent?" }],
          choices: [
            { id: "h1_firm_cap", label: "Yes — under $900", outcomeNarrative: "A clear limit makes every listing easy to judge.", financialQualityScore: 5 },
            { id: "h1_rough_number", label: "Sort of — around $1,000", outcomeNarrative: "A loose limit that could stretch.", financialQualityScore: 3 },
            { id: "h1_see_as_you_go", label: "No — I'll see what I like", outcomeNarrative: "Without a limit, the nicest place usually wins.", financialQualityScore: 2, statEffects: { stress: 1 } },
          ],
        },
        {
          id: "housing_q2_roommate",
          icon: "home",
          menuStyle: true,
          mathChallenge: { prompt: "Living alone costs $1,050/month. Splitting costs $700. How much more is living alone per year?", answer: 4200, unit: "$" },
          randomEvent: { id: "housing_app_fee", chance: 0.3, bannerText: "Two apartment application fees: $80 gone.", statEffects: { cash: -80 } },
          variants: [{ id: "v1", narrative: "Three places you like. Which one do you rent?" }],
          choices: [
            { id: "h2_sounds_nice", label: "Studio, just you — $1,050/mo", outcomeNarrative: "Your own space — at about 36% of your take-home pay, over the 30% rule.", financialQualityScore: 2, amount: -1050, tone: "negative", sets: ["rent_solo"] },
            { id: "h2_price_the_gap", label: "2-bedroom with a friend — $700/mo", outcomeNarrative: "Half the rent, still your own room. That saves $4,200 a year vs. living alone.", financialQualityScore: 5, amount: -700, tone: "positive", sets: ["rent_split"] },
            { id: "h2_rule_out", label: "Room in a shared house — $550/mo", outcomeNarrative: "Cheapest option. More people, but way more money left over.", financialQualityScore: 4, amount: -550, tone: "positive", sets: ["rent_shared"] },
          ],
        },
        {
          id: "housing_q3_lease_length",
          icon: "home",
          variants: [{ id: "v1", narrative: "The landlord offers a 12-month lease, or month-to-month for $150 more per month. Which do you pick?" }],
          choices: [
            { id: "h3_month_to_month", label: "Month-to-month — I like flexibility", outcomeNarrative: "Flexibility costs $1,800 a year. You'll see it on every rent bill.", financialQualityScore: 2, statEffects: { stress: 1 }, sets: ["rent_monthly"] },
            { id: "h3_compare_total", label: "12-month lease — I'm not planning to move", outcomeNarrative: "Since you're staying anyway, the lease saves you $1,800 a year.", financialQualityScore: 5 },
            { id: "h3_default_year", label: "12-month — without reading the lease", outcomeNarrative: "Right choice, but you never read what you signed.", financialQualityScore: 3 },
          ],
        },
        {
          id: "housing_q8_first_month",
          icon: "home",
          variants: [{ id: "v1", narrative: "Move-in day: first month's rent plus a security deposit — $1,500 due now. How do you pay?" }],
          choices: [
            { id: "h8_saved_ahead", label: "Pay it from my cash", outcomeNarrative: "Paid in full. Your cash takes a hit, but you owe nobody.", financialQualityScore: 5, statEffects: { cash: -1500 } },
            { id: "h8_credit_card", label: "Put it on a credit card", outcomeNarrative: "Now you owe $1,500 on a card that charges about 24% interest a year.", financialQualityScore: 2, statEffects: { debt: 1500, stress: 2 } },
            { id: "h8_family_front", label: "Ask my parents to cover it — I'll pay them back", outcomeNarrative: "They agree. You'll owe them $1,500 out of your next paychecks.", financialQualityScore: 3, statEffects: { stress: 1 }, sets: ["owe_parents"] },
          ],
        },
        {
          id: "housing_q4_furnishing",
          icon: "home",
          menuStyle: true,
          variants: [{ id: "v1", narrative: "The apartment is empty. How do you furnish it?" }],
          choices: [
            { id: "h4_only_what_needed", label: "Used basics: bed, table, chair", outcomeNarrative: "Not fancy, but it works — and you spent $400 instead of $2,000.", financialQualityScore: 5, statEffects: { cash: -400 }, amount: -400, tone: "positive" },
            { id: "h4_financed_set", label: "Store financing: $250 every 2 months", outcomeNarrative: "Nice furniture now. You'll make payments for a while.", financialQualityScore: 3, statEffects: { stress: 1 }, amount: -250, tone: "neutral", sets: ["furniture_plan"] },
            { id: "h4_all_at_once", label: "Brand-new everything", outcomeNarrative: "It looks great. Your bank account doesn't.", financialQualityScore: 2, statEffects: { cash: -2000, stress: 1 }, amount: -2000, tone: "negative" },
          ],
        },
        {
          id: "housing_q6_renters_insurance",
          icon: "home",
          variants: [{ id: "v1", narrative: "Renter's insurance is $15 a month. It covers your stuff if there's a fire, flood or break-in. Get it?" }],
          choices: [
            { id: "h6_skip", label: "Skip it", outcomeNarrative: "You save $15 a month — and take the risk yourself.", financialQualityScore: 2, statEffects: { stress: 1 }, sets: ["no_renters"] },
            { id: "h6_get_basic", label: "Get it", outcomeNarrative: "$15 a month to protect everything you own.", financialQualityScore: 5, sets: ["renters_insurance"] },
            { id: "h6_mean_to", label: "Maybe later", outcomeNarrative: "\"Later\" usually means never. You're uninsured for now.", financialQualityScore: 3, sets: ["no_renters"] },
          ],
        },
      ],
      nextChapterId: "car_repair_decision",
    },

    car_repair_decision: {
      id: "car_repair_decision",
      title: "Car trouble",
      icon: "car",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 23 · Six months later",
        situation:
          "You're settled in. Rent and bills now come out automatically every month (see the list below). Then one morning your car starts making a grinding noise. You need it to get to work.",
        goal: "Get the car fixed without overpaying — and get ready for the next surprise.",
        terms: [
          { term: "Emergency fund", meaning: "Savings set aside only for surprises, like car repairs. A common goal is 3–6 months of expenses." },
          { term: "Quote", meaning: "A price estimate from a shop. Prices for the same repair can vary a lot." },
          { term: "Upsell", meaning: "When a shop pushes extra services you may not need." },
        ],
        trend: "Car repair costs have climbed in recent years, and many Americans say they couldn't cover a surprise $1,000 bill from savings.",
      },
      economy: { paycheck: 5900, payByFlag: { job_meridian: 1000 }, bills: 3900 },
      consequences: [
        { id: "pay_parents", text: "Paying your parents back for move-in", ifAll: ["owe_parents"], statEffects: { cash: -1500 } },
        { id: "break_in_insured", text: "Someone broke into your apartment. Renter's insurance paid for your laptop — you paid only the $250 deductible", ifAll: ["renters_insurance"], chance: 0.35, statEffects: { cash: -250 } },
        { id: "break_in_uninsured", text: "Someone broke into your apartment. With no renter's insurance, replacing your laptop and TV cost you", ifAll: ["no_renters"], chance: 0.35, statEffects: { cash: -1600, stress: 2 } },
        { id: "er_meridian", text: "Because your job has no health insurance, an urgent-care visit and X-ray cost you", ifAll: ["job_meridian"], chance: 0.5, statEffects: { cash: -1200, stress: 2 } },
      ],
      questions: [
        {
          id: "car_q1_quotes",
          icon: "car",
          randomEvent: { id: "loyalty_discount", chance: 0.25, bannerText: "The shop gives you a $40 first-time customer discount.", statEffects: { cash: 40 } },
          variants: [{ id: "v1", narrative: "The first shop quotes $800. What do you do?" }],
          choices: [
            { id: "c1_two_more_quotes", label: "Call two more shops for quotes", outcomeNarrative: "Ten minutes of calls. One shop quotes $620 for the same fix.", financialQualityScore: 5 },
            { id: "c1_first_shop", label: "Go with this shop", outcomeNarrative: "Easy, but you don't know if $800 is fair.", financialQualityScore: 3 },
            { id: "c1_closest_shop", label: "Go to whatever shop is closest", outcomeNarrative: "Closest isn't the same as cheapest or best.", financialQualityScore: 2 },
          ],
        },
        {
          id: "car_q3_choosing_shop",
          icon: "car",
          menuStyle: true,
          variants: [{ id: "v1", narrative: "Three options for the repair. Which do you choose?" }],
          choices: [
            { id: "c3_go_dealer", label: "Dealer — $800", outcomeNarrative: "Good work, highest price.", financialQualityScore: 3, statEffects: { cash: -800 }, amount: -800, tone: "neutral" },
            { id: "c3_check_independent", label: "Independent shop, great reviews — $620", outcomeNarrative: "Same repair, $180 cheaper, and the reviews checked out.", financialQualityScore: 5, statEffects: { cash: -620 }, amount: -620, tone: "positive" },
            { id: "c3_friend_mention", label: "Cheap patch job — $300", outcomeNarrative: "Cheapest today. The real problem is still there.", financialQualityScore: 2, statEffects: { cash: -300, stress: 1 }, amount: -300, tone: "negative", sets: ["cheap_fix"] },
          ],
        },
        {
          id: "car_q4_financing",
          icon: "piggy-bank",
          variants: [
            { id: "v1", narrative: "That repair was a wake-up call. Do you start saving for the next surprise?" },
          ],
          narrativeIf: [
            { ifAll: ["cheap_fix"], narrative: "The patch job saved money today, but the mechanic warned the real problem is still there. Do you start saving for the next surprise?" },
          ],
          choices: [
            { id: "c4_emergency_fund", label: "Yes — auto-move $200 a month to savings", outcomeNarrative: "It happens automatically now, every paycheck. You'll see it in every chapter.", financialQualityScore: 5, sets: ["auto_save"] },
            { id: "c4_credit_card", label: "I'll save whatever's left at the end of the month", outcomeNarrative: "There's rarely anything left at the end of the month.", financialQualityScore: 3 },
            { id: "c4_cheapest_fix", label: "Not now — I'll use my credit card if needed", outcomeNarrative: "A credit card isn't an emergency fund. It's a loan at about 24%.", financialQualityScore: 2, statEffects: { stress: 1 } },
          ],
        },
        {
          id: "car_q6_maintenance",
          icon: "car",
          variants: [{ id: "v1", narrative: "The mechanic says you'll need new brakes (about $300) in a few months. What do you do?" }],
          choices: [
            { id: "c6_deal_later", label: "Deal with it when it happens", outcomeNarrative: "You'll pay for it later — from whatever's around.", financialQualityScore: 3 },
            { id: "c6_maintenance_fund", label: "Set aside $50 a month for car costs", outcomeNarrative: "When the brakes come due, the money's already there.", financialQualityScore: 5, sets: ["car_fund"] },
            { id: "c6_stop_thinking", label: "Ignore it — the car seems fine", outcomeNarrative: "Worn brakes get more expensive the longer you wait.", financialQualityScore: 2, statEffects: { stress: 1 }, sets: ["skip_maintenance"] },
          ],
        },
        {
          id: "car_q8_addons",
          icon: "car",
          randomEvent: { id: "parking_ticket", chance: 0.3, bannerText: "Parking ticket outside the shop: $65.", statEffects: { cash: -65 } },
          variants: [{ id: "v1", narrative: "At pickup, the shop offers a $120 \"full inspection package.\" Your answer?" }],
          choices: [
            { id: "c8_yes_to_all", label: "Sure, add it", outcomeNarrative: "Most of it wasn't needed for a car your age.", financialQualityScore: 2, statEffects: { cash: -120 } },
            { id: "c8_no_to_all", label: "No to everything", outcomeNarrative: "Saved $120 — but you didn't check if anything mattered.", financialQualityScore: 3 },
            { id: "c8_ask_relevant", label: "Ask which checks my car actually needs", outcomeNarrative: "Only the tire check matters at your mileage. $30.", financialQualityScore: 5, statEffects: { cash: -30 } },
          ],
        },
      ],
      nextChapterId: "promotion_offer",
    },
  },
};
