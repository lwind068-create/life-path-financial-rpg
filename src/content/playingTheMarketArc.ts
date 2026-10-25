// "Playing the Market" - content only. No game-engine logic lives here.
//
// opening_account -> trading_floor -> ending.
// In this game, money you invest counts toward the Savings number. Buying
// an investment moves cash into savings; gains and losses show up later as
// "because you…" lines (consequences) - including on the ending screen.
//
// trading_floor's first question shows a live stock board with 12-month
// trend lines (QuestionBeat.tickers) and a "six months later" board
// (outcomeTickers). The money effects of that question match what the
// six-months-later board shows.
import type { StoryArc } from "./types";

const DAY_JOB = { paycheck: 5900, payByFlag: { job_meridian: 1000 }, bills: 3900 };

export const playingTheMarketArc: StoryArc = {
  id: "playing_the_market",
  title: "Playing the Market",
  blurb: "Stocks, hype, and the pull to chase whatever already went up.",
  startChapterId: "opening_account",
  pathLength: 3,
  chapters: {
    opening_account: {
      id: "opening_account",
      title: "Your first investment",
      icon: "trending-up",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 30 · The next year",
        situation:
          "Money sitting in a bank account barely grows. You want to start investing so your money grows over time. (In this game, money you invest counts in your Savings number, and it can go up or down.)",
        goal: "Start investing the boring, smart way, and don't panic when prices drop.",
        terms: [
          { term: "Stock", meaning: "A tiny piece of one company. Can rise or fall a lot." },
          { term: "Index fund", meaning: "One investment that owns small pieces of hundreds of companies. Less risky than picking single stocks." },
          { term: "Fees / expense ratio", meaning: "What a fund or app charges you each year. Small % differences add up over decades." },
          { term: "Diversification", meaning: "Spreading money across many investments so one bad pick can't sink you." },
        ],
        trend: "Over long periods, the U.S. stock market has averaged roughly 10% a year, but with big drops along the way, like about −34% in early 2020 before it recovered.",
      },
      economy: DAY_JOB,
      consequences: [
        { id: "biz_anniversary", text: "Your coffee business had its best month yet", chance: 0.5, statEffects: { cash: 500 } },
        { id: "car_tires", text: "New tires for the car", chance: 0.4, statEffects: { cash: -480 } },
      ],
      questions: [
        {
          id: "opening_q1_first_pick",
          icon: "trending-up",
          variants: [{ id: "v1", narrative: "You have $500 to invest for the first time. A friend swears a stock called SURG is \"about to blow up.\" What do you buy?" }],
          choices: [
            { id: "op1_index_fund", label: "A broad index fund", outcomeNarrative: "You now own a tiny piece of hundreds of companies.", financialQualityScore: 5, statEffects: { cash: -500, savings: 500 }, sets: ["index_fund"] },
            { id: "op1_all_in_tip", label: "All $500 in SURG", outcomeNarrative: "All your eggs in one basket: your friend's basket.", financialQualityScore: 2, statEffects: { cash: -500, savings: 500, stress: 2 }, sets: ["surg_bet"] },
            { id: "op1_split_it", label: "Half SURG, half index fund", outcomeNarrative: "Less risky than all-in. Still a gamble on half.", financialQualityScore: 3, statEffects: { cash: -500, savings: 500, stress: 1 }, sets: ["surg_half", "index_fund"] },
          ],
        },
        {
          id: "opening_q2_fees",
          icon: "trending-up",
          mathChallenge: { prompt: "A $6.95 fee on each $50 monthly investment. How much is that in fees per year?", answer: 83.4, unit: "$" },
          variants: [{ id: "v1", narrative: "You'll invest $50 a month. App A charges $0 per trade. App B charges $6.95 per trade. Which do you use?" }],
          choices: [
            { id: "op2_ignore_fees", label: "Whichever app my friends use", outcomeNarrative: "Lucky, it's the free one.", financialQualityScore: 3 },
            { id: "op2_pick_familiar", label: "App B, it's a bigger name", outcomeNarrative: "$6.95 out of every $50 is a 14% fee. Ouch.", financialQualityScore: 2, sets: ["high_fees"] },
            { id: "op2_compare_fees", label: "App A: $0 fees", outcomeNarrative: "Every dollar you invest stays invested.", financialQualityScore: 5 },
          ],
        },
        {
          id: "opening_q4_emergency_fund",
          icon: "piggy-bank",
          variants: [{ id: "v1", narrative: "A video says \"Cash is trash, invest every dollar!\" Do you keep an emergency fund?" }],
          choices: [
            { id: "op4_invest_all", label: "No, invest everything", outcomeNarrative: "If the market drops when you need cash, you'll have to sell low.", financialQualityScore: 2, statEffects: { stress: 1 } },
            { id: "op4_invest_half", label: "Keep a small one, invest the rest", outcomeNarrative: "Some protection. Maybe not enough.", financialQualityScore: 3 },
            { id: "op4_build_cushion", label: "Yes: 3 to 6 months of expenses stay in savings", outcomeNarrative: "Your emergency fund is for emergencies. Investing is for the long run.", financialQualityScore: 5 },
          ],
        },
        {
          id: "opening_q5_panic_check",
          icon: "trending-up",
          variants: [{ id: "v1", narrative: "A rough week: your $500 is now worth $430. What do you do?" }],
          choices: [
            { id: "op5_sell_now", label: "Sell before it drops more", outcomeNarrative: "You lock in a $70 loss. A month later, prices are back up.", financialQualityScore: 2, statEffects: { savings: -70, stress: 1 }, sets: ["sold_low"] },
            { id: "op5_check_less", label: "Hold, I'm investing for years, not weeks", outcomeNarrative: "Drops are normal. You stop checking every day.", financialQualityScore: 5 },
            { id: "op5_keep_watching", label: "Hold, but check the app constantly", outcomeNarrative: "You hold on, but it stresses you out.", financialQualityScore: 3, statEffects: { stress: 2 } },
          ],
        },
        {
          id: "opening_q8_expense_ratio",
          icon: "trending-up",
          variants: [{ id: "v1", narrative: "Two index funds own the exact same companies. Fund A charges 0.03% a year. Fund B charges 0.75%. Which one?" }],
          choices: [
            { id: "op8_pick_either", label: "Whichever shows up first", outcomeNarrative: "It was Fund B. You pay 25× more for the same thing.", financialQualityScore: 2, sets: ["high_fees"] },
            { id: "op8_assume_similar", label: "The one with the more familiar name", outcomeNarrative: "Lucky, it was the cheap one this time.", financialQualityScore: 3 },
            { id: "op8_check_ratio", label: "Fund A, same thing, lower fee", outcomeNarrative: "Over 30 years, that difference could be worth thousands.", financialQualityScore: 5 },
          ],
        },
        {
          id: "opening_q6_lump_sum",
          icon: "piggy-bank",
          randomEvent: { id: "phone_price", chance: 0.25, bannerText: "Your phone plan raised its price, an extra $60 this year.", statEffects: { cash: -60 } },
          variants: [{ id: "v1", narrative: "You want to keep investing. How?" }],
          choices: [
            { id: "op6_spread_out", label: "Auto-invest $75 a month, every month", outcomeNarrative: "It happens automatically, whether the market is up or down.", financialQualityScore: 5, sets: ["index_auto"] },
            { id: "op6_wait_for_dip", label: "Wait for prices to drop first", outcomeNarrative: "Nobody can time the market. You keep waiting.", financialQualityScore: 2 },
            { id: "op6_invest_all_now", label: "Put $2,000 in right now, then stop", outcomeNarrative: "A good one-time move. Habits matter more.", financialQualityScore: 3, statEffects: { cash: -2000, savings: 2000 } },
          ],
        },
      ],
      nextChapterId: "trading_floor",
    },

    trading_floor: {
      id: "trading_floor",
      title: "Hype vs. patience",
      icon: "trending-up",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 31 · A year later",
        situation:
          "You've been investing for a year. Now the market is loud: one stock everyone's talking about, influencers promising \"guaranteed\" wins, and your app offering to lend you money to invest more.",
        goal: "Stick to the plan when hype and fear try to pull you off it.",
        terms: [
          { term: "Trend line", meaning: "A chart of a price over time. A stock that already went way up isn't guaranteed to keep going." },
          { term: "Margin", meaning: "Borrowing money from your broker to invest. Losses get bigger, and you pay interest." },
          { term: "Roth IRA", meaning: "A retirement account where your money grows tax-free." },
          { term: "Sunk cost", meaning: "Money already lost. It shouldn't decide what you do next." },
        ],
        trend: "Many \"meme stocks\" that soared on social media hype later lost most of their value.",
      },
      economy: DAY_JOB,
      consequences: [
        { id: "surg_crash", text: "Because you bet on your friend's tip, SURG dropped 60%", ifAll: ["surg_bet"], statEffects: { savings: -300, stress: 1 } },
        { id: "surg_half_crash", text: "Because you put half in SURG, that half dropped 60%", ifAll: ["surg_half"], statEffects: { savings: -150 } },
        { id: "index_growth", text: "Because you chose an index fund, it grew with the market", ifAll: ["index_fund"], statEffects: { savings: 60 } },
        { id: "fees_cost", text: "Because you picked the high-fee option, fees ate part of your returns", ifAll: ["high_fees"], statEffects: { savings: -80 } },
        { id: "sold_low_missed", text: "Because you sold during the dip, you missed the rebound", ifAll: ["sold_low"] },
      ],
      questions: [
        {
          id: "trade_q1_allocation",
          icon: "trending-up",
          tickers: [
            { symbol: "NOVA", name: "Nova AI Robotics", price: 85, history: [30, 31, 34, 33, 38, 41, 47, 52, 58, 66, 74, 80] },
            { symbol: "QUIK", name: "QuikBite Foods", price: 22, history: [24, 23, 23, 22, 23, 21, 22, 22, 21, 22, 23, 22] },
            { symbol: "BRIK", name: "Brickline REIT", price: 46, history: [41, 42, 41, 43, 42, 44, 43, 44, 45, 44, 45, 46] },
            { symbol: "STDY", name: "Steadygrow Utilities", price: 31, history: [28, 28, 29, 28, 29, 29, 30, 29, 30, 30, 31, 31] },
          ],
          outcomeTickers: [
            { symbol: "NOVA", name: "Nova AI Robotics", price: 39, history: [85, 80, 72, 75, 61, 55, 48, 52, 44, 41, 40, 38] },
            { symbol: "QUIK", name: "QuikBite Foods", price: 17, history: [22, 22, 21, 20, 21, 19, 19, 18, 18, 17, 18, 17] },
            { symbol: "BRIK", name: "Brickline REIT", price: 51, history: [46, 46, 47, 46, 48, 47, 49, 48, 50, 49, 50, 51] },
            { symbol: "STDY", name: "Steadygrow Utilities", price: 33, history: [31, 31, 32, 31, 32, 32, 33, 32, 33, 32, 33, 33] },
          ],
          variants: [{ id: "v1", narrative: "You have $1,000 to invest. Look at the trend lines: NOVA nearly tripled this year and everyone's talking about it. Where does your money go?" }],
          choices: [
            { id: "trade1_split_four", label: "Split it across all four stocks", outcomeNarrative: "Six months later: NOVA crashed, the others held up. Your $1,000 is worth about $850.", financialQualityScore: 3, statEffects: { cash: -1000, savings: 850, stress: 1 } },
            { id: "trade1_index_fund", label: "An index fund instead of picking", outcomeNarrative: "Six months later: the whole market is up a bit. Your $1,000 is worth about $1,080.", financialQualityScore: 5, statEffects: { cash: -1000, savings: 1080 }, sets: ["index_fund"] },
            { id: "trade1_all_in_nova", label: "All in on NOVA, look at that trend!", outcomeNarrative: "Six months later: NOVA fell from $85 to $39. Your $1,000 is worth $460. A past trend isn't a promise.", financialQualityScore: 2, statEffects: { cash: -1000, savings: 460, stress: 2 } },
          ],
        },
        {
          id: "trade_q2_watching_daily",
          icon: "trending-up",
          variants: [{ id: "v1", narrative: "A bad week: your investments are down 14%. You've opened the app 11 times today. What now?" }],
          choices: [
            { id: "trade2_sell_out", label: "Sell everything to stop the losses", outcomeNarrative: "You lock in the loss. The market recovers a few weeks later, without you.", financialQualityScore: 2, statEffects: { savings: -140, stress: 1 }, sets: ["sold_low"] },
            { id: "trade2_keep_checking", label: "Hold, but keep checking", outcomeNarrative: "You hold. Your stress doesn't.", financialQualityScore: 3, statEffects: { stress: 2 } },
            { id: "trade2_delete_app_check", label: "Turn off alerts, check once a week", outcomeNarrative: "Less noise, same plan. It recovers.", financialQualityScore: 5 },
          ],
        },
        {
          id: "trade_q3_margin",
          icon: "credit-card",
          variants: [{ id: "v1", narrative: "Your app offers to lend you $500 to invest more (at interest). Take it?" }],
          choices: [
            { id: "trade3_decline_margin", label: "No, only invest money I have", outcomeNarrative: "No debt, no forced selling.", financialQualityScore: 5 },
            { id: "trade3_small_margin", label: "Borrow $200", outcomeNarrative: "Smaller risk. Still risk on borrowed money.", financialQualityScore: 3, statEffects: { debt: 200, savings: 200, stress: 1 }, sets: ["margin"] },
            { id: "trade3_take_margin", label: "Borrow the full $500", outcomeNarrative: "Bigger gains if it goes up. Bigger losses (and a loan) if it doesn't.", financialQualityScore: 2, statEffects: { debt: 500, savings: 500, stress: 2 }, sets: ["margin"] },
          ],
        },
        {
          id: "trade_q6_influencer",
          icon: "phone",
          variants: [{ id: "v1", narrative: "An influencer with 2 million followers says a penny stock is a \"guaranteed 10x.\" Buy?" }],
          choices: [
            { id: "trade6_skip_influencer", label: "No, nothing is guaranteed", outcomeNarrative: "Correct. \"Guaranteed\" is a red flag.", financialQualityScore: 5 },
            { id: "trade6_small_amount", label: "$50, just for fun", outcomeNarrative: "Entertainment money. You treat it that way.", financialQualityScore: 3, statEffects: { cash: -50 } },
            { id: "trade6_follow_call", label: "$400: 2 million people can't be wrong", outcomeNarrative: "Influencers are sometimes paid to hype stocks. You're in.", financialQualityScore: 2, statEffects: { cash: -400, savings: 400, stress: 1 }, sets: ["influencer_bet"] },
          ],
        },
        {
          id: "trade_q7_retirement_account",
          icon: "piggy-bank",
          variants: [{ id: "v1", narrative: "You want to invest $100 a month for retirement. Where?" }],
          choices: [
            { id: "trade7_regular_account", label: "A regular investing account", outcomeNarrative: "It works, but you'll pay taxes on the gains.", financialQualityScore: 2, sets: ["index_auto"] },
            { id: "trade7_split_accounts", label: "Split between both", outcomeNarrative: "Half gets the tax break.", financialQualityScore: 3, sets: ["index_auto"] },
            { id: "trade7_roth_ira", label: "A Roth IRA, it grows tax-free", outcomeNarrative: "Every dollar of growth is yours to keep in retirement.", financialQualityScore: 5, sets: ["roth_ira"] },
          ],
        },
        {
          id: "trade_q8_sunk_cost",
          icon: "trending-down",
          variants: [{ id: "v1", narrative: "One stock you own is down 40%, and the company is doing worse. Sell or hold?" }],
          choices: [
            { id: "trade8_hold_stubborn", label: "Hold, selling means admitting I lost", outcomeNarrative: "The loss is real whether you sell or not.", financialQualityScore: 2, statEffects: { stress: 1 }, sets: ["held_loser"] },
            { id: "trade8_sell_reassess", label: "Sell and move the money to my index fund", outcomeNarrative: "You stop the bleeding and put the money somewhere better.", financialQualityScore: 5 },
            { id: "trade8_sell_half", label: "Sell half, keep half", outcomeNarrative: "Half a decision.", financialQualityScore: 3 },
          ],
        },
        {
          id: "trade_q9_windfall_spending",
          icon: "piggy-bank",
          menuStyle: true,
          randomEvent: { id: "work_bonus", chance: 0.3, bannerText: "Surprise: your manager gives you a $250 spot bonus.", statEffects: { cash: 250 } },
          variants: [{ id: "v1", narrative: "A $600 bonus from work lands. What do you do with it?" }],
          choices: [
            { id: "w_spend_as_found", label: "Spend it, it's bonus money", outcomeNarrative: "Bonus money spends just as fast as any other money.", financialQualityScore: 2, amount: 0, tone: "negative" },
            { id: "w_split_it", label: "Half invested, half fun", outcomeNarrative: "$300 invested.", financialQualityScore: 3, statEffects: { savings: 300 }, amount: 300, tone: "neutral" },
            { id: "w_reinvest_all", label: "Invest all of it (pay off any card first)", outcomeNarrative: "Treat every dollar the same: give it a job.", financialQualityScore: 5, debtFirst: 600, amount: 600, tone: "positive" },
          ],
        },
      ],
      nextChapterId: "ending",
    },
  },
};
