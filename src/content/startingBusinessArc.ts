// "Starting a Business" — content only. No game-engine logic lives here.
//
// funding_choice (baseline) -> pricing_decision -> growth_offer (mirror)
// -> hiring_decision. funding_choice / growth_offer are the second research
// pair: their question/choice ids and scores are kept from the original
// version, and they never use showIf. pricing_decision is regular play.
//
// The player keeps their day job; the coffee cart runs on weekends and
// evenings, so paychecks continue and cart profit is extra income.
import type { StoryArc } from "./types";

const DAY_JOB = { paycheck: 5900, payByFlag: { job_meridian: 1000 }, bills: 3900 };

export const startingBusinessArc: StoryArc = {
  id: "starting_business",
  title: "Starting a Business",
  blurb: "Fund it, price it, then decide: grow or sell.",
  startChapterId: "funding_choice",
  pathLength: 4,
  chapters: {
    funding_choice: {
      id: "funding_choice",
      title: "Paying for the cart",
      icon: "piggy-bank",
      isBaselineChoice: true,
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 26 · A year later",
        situation:
          "You've wanted to start a weekend coffee cart for a while. You'll keep your day job. The cart, espresso machine, permits and first supplies cost about $8,000. You need to decide where that money comes from.",
        goal: "Pay for the business in a way that won't sink you if it struggles at first.",
        terms: [
          { term: "Startup costs", meaning: "Everything you have to buy before you make your first sale." },
          { term: "Loan", meaning: "Borrowed money you pay back over time, plus interest." },
          { term: "Personal guarantee", meaning: "A promise that YOU will repay a business loan from your own money if the business can't." },
          { term: "Cash flow", meaning: "Money coming in vs. going out each month. A business can be popular and still run out of cash." },
        ],
        trend: "Roughly 1 in 5 new U.S. businesses close within their first year, often because they run out of cash.",
      },
      economy: DAY_JOB,
      consequences: [
        { id: "crypto_crash", text: "Because you bought ZOOMR at the hype, it crashed 80% — you sold your $1,000 for just $200", ifAll: ["crypto_bet"], statEffects: { cash: 200, stress: 1 } },
        { id: "furniture_done", text: "Your furniture payment plan is finally paid off", ifAll: ["furniture_plan"], clears: ["furniture_plan"] },
        { id: "bonus_work", text: "Year-end bonus from work", chance: 0.5, statEffects: { cash: 600 } },
      ],
      questions: [
        {
          id: "fund_q1_how_much",
          icon: "piggy-bank",
          randomEvent: { id: "preorder_surprise", chance: 0.25, bannerText: "A neighbor prepays for 10 coffees to support you: +$40.", statEffects: { cash: 40 } },
          variants: [{ id: "v1", narrative: "How do you figure out how much money you need to start?" }],
          choices: [
            { id: "f1_line_item", label: "List every cost: cart, machine, permits, supplies", outcomeNarrative: "The list comes to $7,600. Now you know your real number.", financialQualityScore: 5 },
            { id: "f1_round_up", label: "Guess, then add some extra to be safe", outcomeNarrative: "Probably enough. You don't really know.", financialQualityScore: 3 },
            { id: "f1_ask_around", label: "Use what a friend's business cost", outcomeNarrative: "Their business isn't yours. The number could be way off.", financialQualityScore: 2 },
          ],
        },
        {
          id: "fund_q2_compare_sources",
          icon: "piggy-bank",
          variants: [{ id: "v1", narrative: "Options: your own savings, a 9% bank loan, a loan from your parents, or a credit card at 24%. How do you choose?" }],
          choices: [
            { id: "f2_first_that_comes", label: "Go with the first idea I had", outcomeNarrative: "Maybe fine. You didn't compare.", financialQualityScore: 3 },
            { id: "f2_lay_out_tradeoffs", label: "Compare what each one really costs", outcomeNarrative: "The card is the most expensive by far. Savings + a small loan looks best.", financialQualityScore: 5 },
            { id: "f2_fastest", label: "Whatever's fastest", outcomeNarrative: "Fastest is usually the credit card — also the most expensive.", financialQualityScore: 2, statEffects: { stress: 1 } },
          ],
        },
        {
          id: "fund_q3_rate_shopping",
          icon: "piggy-bank",
          variants: [{ id: "v1", narrative: "The first bank offers 11% interest on a $5,000 loan. What do you do?" }],
          choices: [
            { id: "f3_first_lender", label: "Take it — applying again is a hassle", outcomeNarrative: "You may have left money on the table.", financialQualityScore: 2 },
            { id: "f3_one_more", label: "Ask one other bank casually", outcomeNarrative: "A little better than nothing.", financialQualityScore: 3 },
            { id: "f3_get_quotes", label: "Get quotes from 2–3 lenders and compare", outcomeNarrative: "A credit union offers 9%. That saves you real money.", financialQualityScore: 5 },
          ],
        },
        {
          id: "fund_q4_guarantee",
          icon: "scroll",
          variants: [{ id: "v1", narrative: "The loan paperwork mentions a \"personal guarantee.\" What do you do?" }],
          choices: [
            { id: "f4_ask_directly", label: "Ask what it means before signing", outcomeNarrative: "It means your own money is on the line if the cart fails. Now you know.", financialQualityScore: 5 },
            { id: "f4_assume_standard", label: "Assume it's normal paperwork", outcomeNarrative: "It is common — and it puts your savings at risk.", financialQualityScore: 3 },
            { id: "f4_skip_section", label: "Skip that part", outcomeNarrative: "You signed something you didn't understand.", financialQualityScore: 2, statEffects: { stress: 1 } },
          ],
        },
        {
          id: "fund_q7_savings_boundary",
          icon: "piggy-bank",
          variants: [{ id: "v1", narrative: "How much of your own savings are you willing to put into the cart?" }],
          choices: [
            { id: "f7_set_max", label: "Set a limit now and stick to it", outcomeNarrative: "If things go badly, you still have a safety net.", financialQualityScore: 5 },
            { id: "f7_as_needed", label: "Whatever it needs, as it comes up", outcomeNarrative: "No limit means it could take everything.", financialQualityScore: 3 },
            { id: "f7_whatever_it_takes", label: "All of it — I believe in this", outcomeNarrative: "Belief is great. An empty safety net isn't.", financialQualityScore: 2, statEffects: { stress: 1 } },
          ],
        },
        {
          id: "fund_q8_final_mix",
          icon: "piggy-bank",
          variants: [{ id: "v1", narrative: "Time to pay for it. How do you fund the $8,000?" }],
          choices: [
            { id: "f8_credit_card_all", label: "Put it all on a credit card", outcomeNarrative: "You owe $8,000 at about 24% interest. That's roughly $160 of interest a month.", financialQualityScore: 2, statEffects: { debt: 8000, stress: 2 }, sets: ["biz_card_debt"] },
            { id: "f8_plan_and_loan", label: "$3,000 from savings + a $5,000 bank loan", outcomeNarrative: "A plan with a fixed monthly payment you can see coming.", financialQualityScore: 5, statEffects: { savings: -3000 }, sets: ["biz_loan"] },
            { id: "f8_family_loan", label: "Borrow it all from my parents", outcomeNarrative: "They say yes. You'll pay them back a little at a time — and it'll come up at dinner.", financialQualityScore: 3, statEffects: { stress: 1 }, sets: ["family_loan"] },
          ],
        },
      ],
      nextChapterId: "pricing_decision",
    },

    pricing_decision: {
      id: "pricing_decision",
      title: "Opening day",
      icon: "tags",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 26 · A month later",
        situation:
          "The cart is ready. Each cup of coffee costs you about $1.60 to make (beans, milk, cup, lid, plus a share of the permit and gas). Now you need a price. The price you pick decides how much profit the cart makes for the rest of the game.",
        goal: "Set a price that covers your costs and leaves real profit.",
        terms: [
          { term: "Cost per unit", meaning: "What it costs you to make one item — here, about $1.60 per cup." },
          { term: "Profit margin", meaning: "What's left of the price after costs. A $4.50 cup that costs $1.60 leaves $2.90." },
          { term: "Inflation", meaning: "Prices rising over time — including what YOU pay for beans and milk." },
        ],
        trend: "U.S. prices rose about 20% from 2020 to 2024. Small businesses had to raise their own prices to keep up.",
      },
      economy: DAY_JOB,
      questions: [
        {
          id: "price_q1_initial_approach",
          icon: "tags",
          mathChallenge: { prompt: "A cup costs you $1.60 to make. If you charge $4.50, what's your profit per cup?", answer: 2.9, unit: "$" },
          randomEvent: { id: "generous_tip", chance: 0.3, bannerText: "A customer leaves a $20 tip on opening day.", statEffects: { cash: 20 } },
          variants: [{ id: "v1", narrative: "How do you start figuring out your price?" }],
          choices: [
            { id: "pr1_feels_right", label: "Pick what feels about right", outcomeNarrative: "Feelings don't know what your beans cost.", financialQualityScore: 3 },
            { id: "pr1_cost_per_unit", label: "Start from my cost per cup ($1.60)", outcomeNarrative: "Now every price you consider has a known profit.", financialQualityScore: 5 },
            { id: "pr1_price_low", label: "Price it really low so people buy", outcomeNarrative: "People will buy. You might lose money on every cup.", financialQualityScore: 2 },
          ],
        },
        {
          id: "price_q2_competitor_research",
          icon: "tags",
          variants: [{ id: "v1", narrative: "Nearby coffee shops charge $4 to $5.50. A friend says you should charge $3. What do you do?" }],
          choices: [
            { id: "pr2_assume_friend", label: "Listen to my friend", outcomeNarrative: "Your friend isn't paying for your beans.", financialQualityScore: 2 },
            { id: "pr2_glance_one", label: "Check one shop and match it", outcomeNarrative: "One data point. Better than none.", financialQualityScore: 3 },
            { id: "pr2_check_several", label: "Check several shops and see where I fit", outcomeNarrative: "You're cheaper than the cafés and faster. $4.50 fits.", financialQualityScore: 5 },
          ],
        },
        {
          id: "price_q3_launch_discount",
          icon: "tags",
          variants: [{ id: "v1", narrative: "Want to run a launch deal to bring in customers?" }],
          choices: [
            { id: "pr3_flat_20", label: "20% off everything for a month", outcomeNarrative: "Busy month, thin profit.", financialQualityScore: 3, statEffects: { cash: -150 } },
            { id: "pr3_calc_discount", label: "$1 off for opening week only", outcomeNarrative: "Short, cheap, and it still covers your costs.", financialQualityScore: 5, statEffects: { cash: -40 } },
            { id: "pr3_no_discount", label: "Free coffee all week", outcomeNarrative: "Lots of fans. $400 of free coffee.", financialQualityScore: 2, statEffects: { cash: -400 } },
          ],
        },
        {
          id: "price_q8_final_call",
          icon: "tags",
          menuStyle: true,
          variants: [{ id: "v1", narrative: "Pick your price per cup. (Each cup costs you $1.60.)" }],
          choices: [
            { id: "pr8_stay_low", label: "$2.50 — cheapest in town", outcomeNarrative: "Lines are long, but you make only $0.90 a cup. The cart barely profits.", financialQualityScore: 2, statEffects: { stress: 2 }, amount: 0.9, tone: "negative", sets: ["biz_profit_low"] },
            { id: "pr8_bump_by_feel", label: "$3.50 — a little under the cafés", outcomeNarrative: "Decent profit: $1.90 a cup.", financialQualityScore: 3, amount: 1.9, tone: "neutral", sets: ["biz_profit_mid"] },
            { id: "pr8_real_margin", label: "$4.50 — fair for the quality", outcomeNarrative: "$2.90 profit a cup. Customers still find it cheaper than the cafés.", financialQualityScore: 5, amount: 2.9, tone: "positive", sets: ["biz_profit_high"] },
          ],
        },
        {
          id: "price_q9_first_profit_spending",
          icon: "piggy-bank",
          menuStyle: true,
          variants: [{ id: "v1", narrative: "First profitable month: $300 left after every cost. What do you do with it?" }],
          choices: [
            { id: "pr9_spend_on_self", label: "Treat myself — I earned it", outcomeNarrative: "Fun. But the business has no cushion for a slow month.", financialQualityScore: 2, amount: 0, tone: "negative" },
            { id: "pr9_set_aside_cushion", label: "Start a business cushion fund", outcomeNarrative: "$300 saved, and a little more every month from now on.", financialQualityScore: 5, statEffects: { savings: 300 }, amount: 300, tone: "positive", sets: ["biz_cushion"] },
            { id: "pr9_split_it", label: "Half cushion, half treat", outcomeNarrative: "$150 set aside. A start.", financialQualityScore: 3, statEffects: { savings: 150 }, amount: 150, tone: "neutral" },
          ],
        },
      ],
      nextChapterId: "growth_offer",
    },

    growth_offer: {
      id: "growth_offer",
      title: "Grow or sell?",
      icon: "building-2",
      isMirrorChoice: true,
      mirrorOf: "funding_choice",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 28 · Two years later",
        situation:
          "The cart is doing well. Two offers arrive in the same week: a local coffee chain wants to buy your cart for $45,000, or your bank will lend you $20,000 to open a second cart across town.",
        goal: "Decide with real numbers — what the business is worth and what a second location could cost you if it struggles.",
        terms: [
          { term: "Valuation", meaning: "What a business is worth. Often based on how much profit it makes per year." },
          { term: "Expansion", meaning: "Growing the business — like opening a second location." },
          { term: "Risk", meaning: "The chance things go worse than planned. Borrowed money makes risk bigger." },
        ],
        trend: "Buyers often value small businesses at a few times their yearly profit — so knowing your profit is how you know a fair price.",
      },
      economy: DAY_JOB,
      consequences: [
        { id: "family_loan_talk", text: "Because you borrowed from your parents, Thanksgiving included a long talk about the cart's finances", ifAll: ["family_loan"], statEffects: { stress: 1 } },
        { id: "cart_repair", text: "The espresso machine broke — repair", chance: 0.4, statEffects: { cash: -450 } },
      ],
      questions: [
        {
          id: "grow_q1_valuation",
          icon: "building-2",
          variants: [{ id: "v1", narrative: "The chain offers $45,000. Do you know what your cart is actually worth?" }],
          choices: [
            { id: "g1_value_yourself", label: "Figure it out from my own profit numbers first", outcomeNarrative: "Your numbers say it's worth $40,000–$55,000. Now you can judge the offer.", financialQualityScore: 5 },
            { id: "g1_rough_estimate", label: "Use a quick online calculator", outcomeNarrative: "A rough range. Better than nothing.", financialQualityScore: 3 },
            { id: "g1_trust_their_offer", label: "Trust their number — they do this a lot", outcomeNarrative: "They do it a lot because it works for THEM.", financialQualityScore: 2 },
          ],
        },
        {
          id: "grow_q2_loan_terms",
          icon: "scroll",
          variants: [{ id: "v1", narrative: "The $20,000 loan has new terms. Do you check them?" }],
          choices: [
            { id: "g2_assume_similar", label: "Assume they're like my first loan", outcomeNarrative: "They're not quite. The rate is higher.", financialQualityScore: 3 },
            { id: "g2_compare_terms", label: "Compare them with my first loan and another lender", outcomeNarrative: "Another lender beats it by 2%. That's leverage.", financialQualityScore: 5 },
            { id: "g2_skip_comparing", label: "Skip it — I've done this before", outcomeNarrative: "Experience isn't the same as checking.", financialQualityScore: 2 },
          ],
        },
        {
          id: "grow_q3_risk_exposure",
          icon: "building-2",
          variants: [{ id: "v1", narrative: "What if the second cart has a slow first year?" }],
          choices: [
            { id: "g3_assume_similar", label: "It'll do as well as the first one", outcomeNarrative: "Maybe. New spots often start slow.", financialQualityScore: 2 },
            { id: "g3_vague_sense", label: "It's riskier, but I don't put a number on it", outcomeNarrative: "You know it's risky. You don't know how risky.", financialQualityScore: 3 },
            { id: "g3_calculate_cost", label: "Calculate what a slow year would cost me", outcomeNarrative: "About $5,000 out of pocket. You'd survive it — barely.", financialQualityScore: 5 },
          ],
        },
        {
          id: "grow_q4_mentor",
          icon: "users",
          variants: [{ id: "v1", narrative: "Do you get advice before deciding?" }],
          choices: [
            { id: "g4_casual_friend", label: "Ask a friend what they think", outcomeNarrative: "Nice to hear. Not much help.", financialQualityScore: 3 },
            { id: "g4_ask_mentor", label: "Ask someone who's grown a business", outcomeNarrative: "They spot two costs you missed.", financialQualityScore: 5 },
            { id: "g4_decide_alone", label: "No — I know my business best", outcomeNarrative: "You do. Others still see what you can't.", financialQualityScore: 2 },
          ],
        },
        {
          id: "grow_q5_leverage",
          icon: "building-2",
          variants: [{ id: "v1", narrative: "You have two real offers. Do you use one to improve the other?" }],
          choices: [
            { id: "g5_mention_passing", label: "Mention the other offer, but don't push", outcomeNarrative: "Nothing changes much.", financialQualityScore: 3 },
            { id: "g5_take_as_presented", label: "No — take one as-is", outcomeNarrative: "You left room to negotiate unused.", financialQualityScore: 2 },
            { id: "g5_use_as_leverage", label: "Yes — use it to get better terms", outcomeNarrative: "The bank lowers the rate to keep your business.", financialQualityScore: 5 },
          ],
        },
        {
          id: "grow_q8_final_call",
          icon: "building-2",
          variants: [{ id: "v1", narrative: "Final decision. What do you do?" }],
          choices: [
            { id: "g8_model_and_negotiate", label: "Expand, using the better loan I negotiated", outcomeNarrative: "Second cart opens with a smaller monthly payment than the original offer.", financialQualityScore: 5, sets: ["biz_expanded", "biz_loan_good"] },
            { id: "g8_take_buyout", label: "Sell the cart for $45,000", outcomeNarrative: "After paying off what you owe and taxes, about $16,000 lands in your savings. You'll start fresh.", financialQualityScore: 3, statEffects: { savings: 16000 }, sets: ["biz_sold"], clears: ["biz_profit_low", "biz_profit_mid", "biz_profit_high", "biz_loan", "family_loan", "biz_card_debt"] },
            { id: "g8_take_loan", label: "Expand with the bank's loan as offered", outcomeNarrative: "Second cart opens. So does a bigger monthly payment.", financialQualityScore: 2, statEffects: { stress: 1 }, sets: ["biz_expanded", "biz_loan_big"] },
          ],
        },
        {
          id: "grow_q9_payout_spending",
          icon: "piggy-bank",
          menuStyle: true,
          variants: [{ id: "v1", narrative: "Your best summer ever: $4,000 of extra profit. What do you do with it?" }],
          choices: [
            { id: "g9_spend_to_celebrate", label: "Celebrate big — trip and new stuff", outcomeNarrative: "Worth it for the memories. $800 is left.", financialQualityScore: 3, statEffects: { cash: 800 }, amount: 800, tone: "neutral" },
            { id: "g9_pay_down_then_save", label: "Pay off any card debt, save the rest", outcomeNarrative: "Debt first, then savings. Every dollar works.", financialQualityScore: 5, debtFirst: 4000, amount: 4000, tone: "positive" },
            { id: "g9_let_it_sit", label: "Leave it in checking, no plan", outcomeNarrative: "Money with no job tends to disappear into everyday spending.", financialQualityScore: 2, statEffects: { cash: 4000 }, amount: 4000, tone: "negative", sets: ["lifestyle_creep"] },
          ],
        },
      ],
      nextChapterId: "hiring_decision",
    },
  },
};
