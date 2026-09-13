// "Playing the Market" story arc — content only. No game-engine logic lives here.
//
// Two chapters per playthrough: opening_account -> trading_floor -> ending.
// Neither chapter is flagged as a baseline/mirror pair — like Settling In,
// Reading the Fine Print, and Running the Show, this arc doesn't carry its
// own pre/post measurement. The ending narrative still branches on the
// average financialQualityScore across both chapters (see
// src/engine/scoring.ts), same as every other arc.
//
// trading_floor's first question (trade_q1_allocation) is the one
// "interactive" beat in this arc: it renders a live-jittering stock ticker
// board (QuestionBeat.tickers) above the narrative, and a settled
// "six months later" board (QuestionBeat.outcomeTickers) on its outcome
// screen. Both are purely ambient/visual — the actual decision is still the
// normal three QuestionChoice options underneath, and financialQualityScore
// integrity works exactly like every other question in the game.
//
// The position of the highest-quality choice (score 5) is deliberately
// rotated across A/B/C from question to question — don't let it settle
// into a fixed slot, and vary each choice's opening phrasing so no lexical
// tic gives it away either.
import type { StoryArc } from "./types";

export const playingTheMarketArc: StoryArc = {
  id: "playing_the_market",
  title: "Playing the Market",
  blurb: "Stocks, hype, and the pull to chase whatever already went up.",
  nextArcTeaser: "Your story keeps going. More chapters on the way.",
  startChapterId: "opening_account",
  pathLength: 3,
  chapters: {
    opening_account: {
      id: "opening_account",
      title: "Opening an account",
      icon: "trending-up",
      narrative: "",
      choices: [],
      questions: [
        {
          id: "opening_q1_first_pick",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "You've saved up $500 and want to try investing for the first time. A friend swears a stock called SURG is 'about to blow up.' Do you put your $500 there, or somewhere broader?" },
            { id: "v2", narrative: "$500, ready to go into the market for the first time. One excited friend, one hyped-up stock called SURG. Do you follow the tip, or spread the money out?" },
            { id: "v3", narrative: "Your first $500 as an investor. A single stock a friend is hyping, or something that spreads the risk across hundreds of companies at once?" },
          ],
          choices: [
            { id: "op1_index_fund", label: "Put the $500 into a broad index fund that owns small pieces of hundreds of companies at once.", outcomeNarrative: "One company having a rough year barely moves the needle when you own hundreds of them at once.", financialQualityScore: 5, statEffects: { savings: -500, stress: 0 } },
            { id: "op1_all_in_tip", label: "Put the whole $500 into SURG, the stock your friend's excited about.", outcomeNarrative: "Maybe it takes off. Betting your entire first investment on one tip is still a bet, not a plan.", financialQualityScore: 2, statEffects: { savings: -500, stress: 2 } },
            { id: "op1_split_it", label: "Split it — half into SURG, half into a fund, just in case.", outcomeNarrative: "A reasonable hedge. Also still real money riding on a tip you didn't check.", financialQualityScore: 3, statEffects: { savings: -500, stress: 1 } },
          ],
        },
        {
          id: "opening_q2_fees",
          icon: "trending-up",
          mathChallenge: {
            prompt: "At $6.95 a trade, how much do 12 monthly trades cost you in a year?",
            answer: 83.4,
            unit: "$",
          },
          variants: [
            { id: "v1", narrative: "Picking where to open the account: one app charges $0 per trade, another charges $6.95. You're planning to invest $50 a month. Does the fee matter?" },
            { id: "v2", narrative: "$6.95 a trade versus $0 a trade, on $50-a-month investing. Over a year, that's the difference between $0 and roughly $83 in fees. Worth checking?" },
            { id: "v3", narrative: "Two brokerages, same index funds available on both. One charges $6.95 a trade, one charges nothing. Which do you sign up for?" },
          ],
          choices: [
            { id: "op2_ignore_fees", label: "Go with whichever app your friends already use, without comparing fees.", outcomeNarrative: "It probably works out. You didn't actually check that it was the cheaper option.", financialQualityScore: 3, statEffects: { savings: -5, stress: 0 } },
            { id: "op2_pick_familiar", label: "Pick the $6.95-per-trade brokerage because it's the well-known name.", outcomeNarrative: "Same funds, same market — you're just paying more per trade to get there.", financialQualityScore: 2, statEffects: { savings: -10, stress: 1 } },
            { id: "op2_compare_fees", label: "Compare the fee structures first and pick the $0-commission option.", outcomeNarrative: "Same investments, zero drag from trading fees eating into $50-a-month contributions.", financialQualityScore: 5, statEffects: { savings: 10, stress: 0 } },
          ],
        },
        {
          id: "opening_q3_hot_tip",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "A stock called TIXL is all over your feed — 'everyone' says it's about to double. Do you buy in?" },
            { id: "v2", narrative: "TIXL is trending everywhere this week, with people posting screenshots of quick gains. Does that change what you do with your money?" },
            { id: "v3", narrative: "Social media is loud about TIXL right now. Loud enough to act on?" },
          ],
          choices: [
            { id: "op3_ignore_hype", label: "Skip it — a stock being loud online isn't the same as it being a good investment.", outcomeNarrative: "You miss out on nothing you actually understood in the first place.", financialQualityScore: 5, statEffects: { savings: 60, stress: 0 } },
            { id: "op3_small_bet", label: "Put a small amount in, small enough that losing it wouldn't hurt much.", outcomeNarrative: "It's a controlled bet, at least. Still a bet built on hype instead of research.", financialQualityScore: 3, statEffects: { savings: -100, stress: 1 } },
            { id: "op3_buy_in", label: "Buy in before it's too late to catch the wave.", outcomeNarrative: "Waves that are loud on social media have usually already crested by the time everyone's talking about them.", financialQualityScore: 2, statEffects: { savings: -300, stress: 2 } },
          ],
        },
        {
          id: "opening_q4_emergency_fund",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "You've got $300 total to your name and no emergency cushion yet. Do you invest it, or save it as a cushion first?" },
            { id: "v2", narrative: "The market's tempting, but that $300 is also the only thing standing between you and a credit card if something breaks. What's the move?" },
            { id: "v3", narrative: "$300, no safety net yet. Into the market, or into a cushion first?" },
          ],
          choices: [
            { id: "op4_invest_all", label: "Invest all of it — the market's the priority right now.", outcomeNarrative: "If anything breaks before the market goes up, you're selling at the worst possible time to cover it.", financialQualityScore: 2, statEffects: { savings: -30, stress: 2 } },
            { id: "op4_invest_half", label: "Invest half, keep half as a small cushion.", outcomeNarrative: "A partial buffer. Better than none, thinner than it should be.", financialQualityScore: 3, statEffects: { savings: -10, stress: 1 } },
            { id: "op4_build_cushion", label: "Keep it as an emergency cushion and start investing once there's a real buffer.", outcomeNarrative: "Slower to start investing. Also nothing forces you to sell at a bad time if your car breaks down next month.", financialQualityScore: 5, statEffects: { savings: 30, stress: 0 } },
          ],
        },
        {
          id: "opening_q5_panic_check",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "A rough week drops your $500 investment to $430. You check the app four times a day. What do you do?" },
            { id: "v2", narrative: "Down to $430 from $500 after one bad week. Checking constantly, what's the actual move?" },
            { id: "v3", narrative: "$70 down on paper after a rough week. Do you sell, or do you stop checking so often?" },
          ],
          choices: [
            { id: "op5_sell_now", label: "Sell now before it drops any further.", outcomeNarrative: "You lock in the $70 loss for certain, instead of giving it a chance to recover.", financialQualityScore: 2, statEffects: { savings: 430, stress: 1 } },
            { id: "op5_check_less", label: "Stop checking daily and let the money sit, since you weren't planning to touch it soon anyway.", outcomeNarrative: "A dip you don't watch minute-to-minute is a lot easier not to panic over.", financialQualityScore: 5, statEffects: { savings: 60, stress: 0 } },
            { id: "op5_keep_watching", label: "Keep checking daily but hold off on selling for now.", outcomeNarrative: "You didn't sell, which is the important part. The daily checking isn't doing you any favors either.", financialQualityScore: 3, statEffects: { savings: -10, stress: 2 } },
          ],
        },
        {
          id: "opening_q6_lump_sum",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "A relative gives you a $2,000 graduation gift. Invest it all at once, or spread it out over several months?" },
            { id: "v2", narrative: "$2,000 shows up at once. Put it all in this week, or feed it in $200 at a time over ten months?" },
            { id: "v3", narrative: "$2,000, unexpected. One lump sum into the market, or spaced out over time?" },
          ],
          choices: [
            { id: "op6_spread_out", label: "Spread it in over several months on a fixed schedule, regardless of what prices do.", outcomeNarrative: "You end up buying at a mix of higher and lower prices, and never had to guess which week was 'right.'", financialQualityScore: 5, statEffects: { savings: -2000, stress: 0 } },
            { id: "op6_wait_for_dip", label: "Hold the cash and wait for what feels like a better moment to buy in.", outcomeNarrative: "The 'better moment' is hard to identify in advance — that's true for professionals too.", financialQualityScore: 2, statEffects: { savings: -225, stress: 2 } },
            { id: "op6_invest_all_now", label: "Invest the whole $2,000 right away.", outcomeNarrative: "Historically this does fine on average — though a rough week right after felt worse than it needed to.", financialQualityScore: 3, statEffects: { savings: -2000, stress: 1 } },
          ],
        },
        {
          id: "opening_q7_research",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "You like a company's app — it's slick, everyone your age uses it. Is that enough reason to buy the stock?" },
            { id: "v2", narrative: "Liking a product is one thing. Understanding whether the company behind it actually makes money is another. Do you check?" },
            { id: "v3", narrative: "A company you use every day has a stock ticker. Do you look at what the company actually earns before buying it?" },
          ],
          choices: [
            { id: "op7_liking_it", label: "Buy it because you like the product — that's usually a good enough sign.", outcomeNarrative: "Liking the product tells you it's popular. It doesn't tell you if the company is actually profitable.", financialQualityScore: 2, statEffects: { savings: -60, stress: 1 } },
            { id: "op7_quick_check", label: "Spend a few minutes checking whether the company is actually profitable before buying.", outcomeNarrative: "A few minutes of checking is enough to know if you're buying a business, not just a brand you like.", financialQualityScore: 5, statEffects: { savings: 60, stress: 0 } },
            { id: "op7_assume_fine", label: "Assume it's fine since the company's clearly popular and well-known.", outcomeNarrative: "Popular and profitable aren't always the same thing, but they're easy to mix up.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
          ],
        },
        {
          id: "opening_q8_expense_ratio",
          icon: "trending-up",
          mathChallenge: {
            prompt: "A 0.75% yearly fee on a $5,000 investment costs how much in the first year?",
            answer: 37.5,
            unit: "$",
          },
          variants: [
            { id: "v1", narrative: "Two funds track the same index. One charges a 0.03% yearly fee, the other 0.75%. You're putting $5,000 in. Does the difference matter?" },
            { id: "v2", narrative: "Same index, same holdings — $1.50 a year in fees on one fund, $37.50 a year on the other, for the same $5,000. Which do you pick?" },
            { id: "v3", narrative: "0.03% versus 0.75%, on $5,000, for funds that own the exact same thing. Is that worth comparing?" },
          ],
          choices: [
            { id: "op8_pick_either", label: "Pick whichever one shows up first in the app's search results.", outcomeNarrative: "One of them is quietly charging you 25 times more a year for the identical set of holdings.", financialQualityScore: 2, statEffects: { savings: -550, stress: 1 } },
            { id: "op8_assume_similar", label: "Assume the fees are close enough not to matter and go with the more familiar name.", outcomeNarrative: "0.03% and 0.75% aren't close — over years, that gap compounds into real money.", financialQualityScore: 3, statEffects: { savings: -100, stress: 0 } },
            { id: "op8_check_ratio", label: "Check the expense ratio and pick the 0.03% fund since they track the same thing.", outcomeNarrative: "Same holdings, same returns before fees — the cheaper one keeps more of your money working for you.", financialQualityScore: 5, statEffects: { savings: 550, stress: 0 } },
          ],
        },
      ],
      nextChapterId: "trading_floor",
    },

    trading_floor: {
      id: "trading_floor",
      title: "The trading floor",
      icon: "trending-up",
      narrative: "",
      choices: [],
      questions: [
        {
          id: "trade_q1_allocation",
          icon: "trending-up",
          tickers: [
            { symbol: "NOVA", name: "Nova AI Robotics", price: 85 },
            { symbol: "QUIK", name: "QuikBite Foods", price: 22 },
            { symbol: "BRIK", name: "Brickline REIT", price: 46 },
            { symbol: "STDY", name: "Steadygrow Utilities", price: 31 },
          ],
          outcomeTickers: [
            { symbol: "NOVA", name: "Nova AI Robotics", price: 39 },
            { symbol: "QUIK", name: "QuikBite Foods", price: 17 },
            { symbol: "BRIK", name: "Brickline REIT", price: 51 },
            { symbol: "STDY", name: "Steadygrow Utilities", price: 33 },
          ],
          variants: [
            { id: "v1", narrative: "You've got $1,000 to put to work and four names on the board in front of you. NOVA is the one everyone's talking about this month. How do you allocate it?" },
            { id: "v2", narrative: "$1,000, four tickers on the screen, prices moving in real time. NOVA's the loud one. What's the play?" },
            { id: "v3", narrative: "Four stocks, one $1,000 decision. NOVA's up big this month and everyone's watching it. Where does your money go?" },
          ],
          choices: [
            { id: "trade1_split_four", label: "Split the $1,000 evenly across all four tickers on the board.", outcomeNarrative: "More spread than betting on one name, but you're still picking individual stocks instead of the broader market.", financialQualityScore: 3, statEffects: { savings: -1000, stress: 1 } },
            { id: "trade1_index_fund", label: "Put the whole $1,000 into a low-cost index fund instead of picking among the four.", outcomeNarrative: "You skip guessing which of the four wins and just buy a slice of the whole market instead.", financialQualityScore: 5, statEffects: { savings: -1000, stress: 0 } },
            { id: "trade1_all_in_nova", label: "Go all-in on NOVA — it's the one everyone's excited about.", outcomeNarrative: "It's the loudest stock in the room this month. Loud isn't the same as safe.", financialQualityScore: 2, statEffects: { savings: -1000, stress: 2 } },
          ],
        },
        {
          id: "trade_q2_watching_daily",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "A week later, your $1,000 is down to $860. You've checked the app eleven times today. What now?" },
            { id: "v2", narrative: "$1,000 to $860 in a week. You've refreshed the price more times than you can count. What's the move?" },
            { id: "v3", narrative: "A $140 paper loss in a week, and you can't stop checking. Sell, or step away from the screen?" },
          ],
          choices: [
            { id: "trade2_sell_out", label: "Sell everything to stop the bleeding.", outcomeNarrative: "The $140 loss becomes permanent the moment you sell — before that, it was still just a number on a screen.", financialQualityScore: 2, statEffects: { savings: 860, stress: 1 } },
            { id: "trade2_keep_checking", label: "Keep checking constantly but hold off on selling.", outcomeNarrative: "You didn't sell, which matters most. The constant checking is its own kind of cost.", financialQualityScore: 3, statEffects: { savings: -20, stress: 2 } },
            { id: "trade2_delete_app_check", label: "Turn off notifications and check the account once a week instead of eleven times a day.", outcomeNarrative: "Nothing about your investment changed. Your blood pressure, on the other hand, improved a lot.", financialQualityScore: 5, statEffects: { savings: 110, stress: 0 } },
          ],
        },
        {
          id: "trade_q3_margin",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "Your brokerage offers to lend you an extra $500 to invest, on top of your own money, at interest. Do you take it?" },
            { id: "v2", narrative: "Borrowing $500 from the brokerage to invest more — 'margin,' they call it — is one tap away. Do you tap it?" },
            { id: "v3", narrative: "More buying power is available if you're willing to borrow it. Do you?" },
          ],
          choices: [
            { id: "trade3_decline_margin", label: "Decline — invest only money you actually have.", outcomeNarrative: "If prices drop, you only lose what was yours to begin with, not borrowed money plus interest on top.", financialQualityScore: 5, statEffects: { savings: 60, stress: 0 } },
            { id: "trade3_small_margin", label: "Borrow a small amount, less than the full $500 offered.", outcomeNarrative: "Smaller downside than going all in on borrowed money, but you're still exposed to losses beyond your own cash.", financialQualityScore: 3, statEffects: { debt: 200, stress: 1 } },
            { id: "trade3_take_margin", label: "Take the full $500 — more money invested means more potential upside.", outcomeNarrative: "It also means more potential downside, plus interest owed regardless of which way prices go.", financialQualityScore: 2, statEffects: { debt: 500, stress: 2 } },
          ],
        },
        {
          id: "trade_q4_day_trading",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "One of your stocks jumps and you're sitting on a quick $300 profit after two weeks. Sell now, or hold longer?" },
            { id: "v2", narrative: "A fast $300 gain, two weeks in. Selling now means a bigger tax bill than waiting would. Worth it?" },
            { id: "v3", narrative: "Quick $300 profit, short holding period, a bigger tax hit if you cash out now. What's the call?" },
          ],
          choices: [
            { id: "trade4_sell_quick", label: "Take the quick $300 profit now.", outcomeNarrative: "The gain's real. So is the bigger short-term tax bill that comes with cashing out this fast.", financialQualityScore: 2, statEffects: { savings: 300, stress: 1 } },
            { id: "trade4_partial_sell", label: "Sell part of the position now and let the rest ride.", outcomeNarrative: "Locks in some of the gain, keeps some tax exposure open — a middle path, not a plan.", financialQualityScore: 3, statEffects: { savings: 150, stress: 1 } },
            { id: "trade4_hold_longer", label: "Hold past the one-year mark if the reasons you bought it still hold up.", outcomeNarrative: "Patience pays here literally — long-term gains get taxed at a lower rate than short-term ones.", financialQualityScore: 5, statEffects: { savings: 30, stress: 0 } },
          ],
        },
        {
          id: "trade_q5_rebalance",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "Your $10,000 portfolio started at 80% stocks, 20% safer bonds. A good year later, it's drifted to 92% stocks. Do you rebalance it back?" },
            { id: "v2", narrative: "A strong year pushed your mix from 80/20 to 92/8 without you doing anything. Do you nudge it back on purpose?" },
            { id: "v3", narrative: "Your portfolio's riskier than you originally set it up to be, just from stocks outperforming bonds. Fix it, or let it ride?" },
          ],
          choices: [
            { id: "trade5_ignore_drift", label: "Leave it alone — it's working, why touch it.", outcomeNarrative: "It's working right now. It's also carrying more risk than you originally chose to take on.", financialQualityScore: 2, statEffects: { savings: -1100, stress: 1 } },
            { id: "trade5_rebalance_back", label: "Sell enough stock and buy enough bonds to bring it back to your original 80/20 mix.", outcomeNarrative: "You lock in some of the stock gains and put your risk level back where you actually meant it to be.", financialQualityScore: 5, statEffects: { savings: 1100, stress: 0 } },
            { id: "trade5_partial_rebalance", label: "Nudge it partway back, but not all the way to 80/20.", outcomeNarrative: "Closer to your original plan than doing nothing, not quite all the way there.", financialQualityScore: 3, statEffects: { savings: -200, stress: 0 } },
          ],
        },
        {
          id: "trade_q6_influencer",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "A finance influencer with two million followers is calling a penny stock, TIXL, a 'guaranteed 10x.' Do you buy in?" },
            { id: "v2", narrative: "'Guaranteed' and 'penny stock' showing up in the same sentence from an influencer's video. Believe it?" },
            { id: "v3", narrative: "A big following isn't the same as a good track record. Does that change how you treat this TIXL call?" },
          ],
          choices: [
            { id: "trade6_skip_influencer", label: "Skip it — no legitimate investment is ever actually 'guaranteed.'", outcomeNarrative: "That word alone is usually enough information on its own.", financialQualityScore: 5, statEffects: { savings: 60, stress: 0 } },
            { id: "trade6_small_amount", label: "Put in a small amount, treating it as entertainment money rather than a real investment.", outcomeNarrative: "Framing it honestly as a gamble, not an investment, at least keeps the risk contained.", financialQualityScore: 3, statEffects: { savings: -50, stress: 1 } },
            { id: "trade6_follow_call", label: "Follow the call — two million followers can't all be wrong.", outcomeNarrative: "They can, actually. A big following is proof of reach, not proof of a good pick.", financialQualityScore: 2, statEffects: { savings: -400, stress: 2 } },
          ],
        },
        {
          id: "trade_q7_retirement_account",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "You could put $100 a month into a regular brokerage account, or the same $100 into a Roth IRA that grows tax-free for retirement. Which do you choose?" },
            { id: "v2", narrative: "Same $100 a month, same investments available — one account taxes the growth eventually, one doesn't, ever. Does the difference matter this early?" },
            { id: "v3", narrative: "A Roth IRA versus a regular account, both open to you, both $100 a month. What's the call?" },
          ],
          choices: [
            { id: "trade7_regular_account", label: "Use the regular brokerage account since it's simpler to set up.", outcomeNarrative: "It works fine. You're leaving a real tax advantage on the table for no strong reason.", financialQualityScore: 2, statEffects: { savings: -10, stress: 0 } },
            { id: "trade7_split_accounts", label: "Split the $100 between both accounts.", outcomeNarrative: "Not the most efficient split, but at least some of it gets the tax-free treatment.", financialQualityScore: 3, statEffects: { savings: -5, stress: 0 } },
            { id: "trade7_roth_ira", label: "Open the Roth IRA and put the $100 a month there.", outcomeNarrative: "Decades of growth in that account will never be taxed again — starting this early is most of the advantage.", financialQualityScore: 5, statEffects: { savings: 10, stress: 0 } },
          ],
        },
        {
          id: "trade_q8_sunk_cost",
          icon: "trending-up",
          variants: [
            { id: "v1", narrative: "One of your picks is down 40% and the company's fundamentals have genuinely gotten worse since you bought it. Sell, or hold out for it to come back?" },
            { id: "v2", narrative: "Down 40%, and not from a temporary dip — the business itself is doing worse than when you bought in. Do you sell, or wait it out?" },
            { id: "v3", narrative: "'It'll come back' is tempting to say about a stock down 40% with weakening fundamentals. Is it true here?" },
          ],
          choices: [
            { id: "trade8_hold_stubborn", label: "Hold it — selling now would mean admitting the loss is real.", outcomeNarrative: "The loss is just as real whether or not you sell. Holding doesn't undo it, it just delays deciding.", financialQualityScore: 2, statEffects: { savings: -60, stress: 2 } },
            { id: "trade8_sell_reassess", label: "Sell it and reinvest the remaining money somewhere with better prospects.", outcomeNarrative: "What you already paid for it is gone either way — the only real question left is where the rest of the money works best from here.", financialQualityScore: 5, statEffects: { savings: 600, stress: 0 } },
            { id: "trade8_sell_half", label: "Sell half now, hold the rest just in case it recovers.", outcomeNarrative: "A split decision. Neither fully lets go of the sunk cost nor fully commits to a fresh start.", financialQualityScore: 3, statEffects: { savings: 300, stress: 1 } },
          ],
        },
        {
          id: "trade_q9_windfall_spending",
          icon: "trending-up",
          menuStyle: true,
          variants: [
            { id: "v1", narrative: "The sale clears and $600 lands back in your account. It doesn't feel like 'real' money the way a paycheck does. What do you do with it?" },
            { id: "v2", narrative: "$600, freed up from a position you just closed out. Where does it actually go?" },
            { id: "v3", narrative: "That $600 from the sale is sitting there. Spend it like found money, or treat it like the rest of your savings?" },
          ],
          choices: [
            { id: "w_spend_as_found", label: "Spend a good chunk of it right away — it doesn't feel like money you actually earned.", outcomeNarrative: "It came from your account either way. 'Found money' spends the same as any other kind.", financialQualityScore: 2, statEffects: { savings: 100, stress: 1 }, amount: 100, tone: "negative" },
            { id: "w_split_it", label: "Spend a little, put the rest back into savings.", outcomeNarrative: "A reasonable middle ground — some of it disappears, most of it doesn't.", financialQualityScore: 3, statEffects: { savings: 300, stress: 0 }, amount: 300, tone: "neutral" },
            { id: "w_reinvest_all", label: "Put the whole $600 back into your index fund, the same as any other money that comes in.", outcomeNarrative: "It doesn't matter where a dollar came from — you treat all of it the same way, on purpose.", financialQualityScore: 5, statEffects: { savings: 600, stress: 0 }, amount: 600, tone: "positive" },
          ],
        },
      ],
      nextChapterId: "market_ending",
    },

    market_ending: {
      id: "market_ending",
      title: "A few years in",
      icon: "trophy",
      isEnding: true,
      narrative: "A few years in, your story continues.",
      choices: [],
      endingVariants: [
        {
          id: "high",
          minAvgQualityScore: 4,
          headline: "Boring, on purpose, and it's working",
          narrative:
            "A few years in, your portfolio isn't exciting to talk about at parties — no hot tips, no 10x stories — and that's exactly why it's quietly outgrowing the people chasing whichever stock is loud that month.",
        },
        {
          id: "mixed",
          minAvgQualityScore: 2.8,
          headline: "In the market, mostly steady",
          narrative:
            "A few years in, you've got real money invested and a decent instinct for it, but a hyped tip or a panicked sell here and there cost you more than the boring, disciplined version of you would have lost.",
        },
        {
          id: "lower",
          minAvgQualityScore: 0,
          headline: "Chasing what already moved",
          narrative:
            "A few years in, you're still investing, but usually a step behind — buying what's already hyped, selling when it dips, and watching people who did neither pull ahead without trying nearly as hard.",
        },
      ],
    },
  },
};
