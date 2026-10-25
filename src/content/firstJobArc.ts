// "First Job" — content only. No game-engine logic lives here.
//
// job_offer (baseline) and promotion_offer (mirror) are the research pair
// — see src/engine/scoring.ts. Their question/choice ids and
// financialQualityScore values are kept from the original version so the
// measure stays comparable, and they never use showIf (every player must
// see the same questions). The ending chapter is shared by the whole game.
//
// Rotate the position of the best (score 5) choice from question to
// question, and don't let the best choice always be the longest one.
import type { StoryArc } from "./types";

export const firstJobArc: StoryArc = {
  id: "first_job",
  title: "First Job",
  blurb: "Graduate. Get a job. Make the calls that shape your twenties.",
  startChapterId: "job_offer",
  pathLength: 3,
  chapters: {
    job_offer: {
      id: "job_offer",
      title: "Two job offers",
      icon: "briefcase",
      isBaselineChoice: true,
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 22 · Two months after graduation",
        situation:
          "You just finished school. You have $900 in checking (that's your Cash — what you spend from) and $1,500 in Savings from summer jobs. No debt yet. Two companies want to hire you, and you have 48 hours to pick one.",
        goal: "Figure out which job is really worth more — the bigger salary isn't always the better deal.",
        terms: [
          { term: "Salary", meaning: "Your yearly pay before taxes. What actually lands in your account (take-home pay) is less." },
          { term: "Benefits", meaning: "Things a job gives you besides pay, like health insurance. They're worth real money." },
          { term: "401(k) match", meaning: "Retirement savings where your employer adds free money when you save. A 4% match on $44,000 is about $1,760 a year." },
          { term: "Signing bonus", meaning: "A one-time payment for accepting the job. It doesn't repeat next year." },
        ],
        trend:
          "An ER visit without insurance can easily cost $2,000 or more, and buying your own health plan often runs a few hundred dollars a month.",
      },
      questions: [
        {
          id: "job_offer_q1_first_look",
          icon: "briefcase",
          variants: [
            {
              id: "v1",
              narrative:
                "Offer 1 — Meridian Logistics: $52,000 a year, no health insurance, no 401(k) match, $2,000 signing bonus.\nOffer 2 — Harbor & Finch: $44,000 a year, full health insurance, 4% 401(k) match.\n\nWhat do you compare first?",
            },
          ],
          choices: [
            { id: "q1_total_comp", label: "Total value: salary plus what the benefits are worth", outcomeNarrative: "Good start. Benefits are part of your pay — they just don't show up on the paycheck.", financialQualityScore: 5 },
            { id: "q1_base_salary", label: "Just the salaries", outcomeNarrative: "Salary matters, but it leaves out insurance and the 401(k) match.", financialQualityScore: 3 },
            { id: "q1_sounds_better", label: "Whichever one sounds better", outcomeNarrative: "$52,000 sounds better. That doesn't mean it is.", financialQualityScore: 2 },
          ],
        },
        {
          id: "job_offer_q2_insurance",
          icon: "briefcase",
          variants: [
            { id: "v1", narrative: "Meridian has no health insurance. Buying your own plan costs about $300 a month. How do you handle that?" },
          ],
          choices: [
            { id: "q2_skip_it", label: "Skip it — I'm young and healthy", outcomeNarrative: "Most months you'd be fine. One accident could cost thousands.", financialQualityScore: 2, statEffects: { stress: 1 } },
            { id: "q2_price_a_plan", label: "Look up a real plan price and subtract it from Meridian's pay", outcomeNarrative: "$300 × 12 = $3,600 a year. Meridian's $8,000 lead just got a lot smaller.", financialQualityScore: 5 },
            { id: "q2_guess", label: "Guess it's a few hundred a month", outcomeNarrative: "Close enough this time — but it was a guess.", financialQualityScore: 3 },
          ],
        },
        {
          id: "job_offer_q3_match",
          icon: "briefcase",
          mathChallenge: { prompt: "Harbor & Finch matches 4% of $44,000. How much free money is that per year?", answer: 1760, unit: "$" },
          variants: [
            { id: "v1", narrative: "Harbor & Finch adds 4% of your salary to your retirement account if you save too. Meridian adds nothing. How do you count that?" },
          ],
          choices: [
            { id: "q3_note_it", label: "Nice bonus, but I won't count it", outcomeNarrative: "It's real money even if you can't spend it today.", financialQualityScore: 3 },
            { id: "q3_ignore_it", label: "Ignore it — retirement is forever away", outcomeNarrative: "Money saved at 22 has the most years to grow. Skipping it costs the most.", financialQualityScore: 2 },
            { id: "q3_calculate_it", label: "Count it as about $1,760 a year of extra pay", outcomeNarrative: "Right. Now the two offers are much closer than they looked.", financialQualityScore: 5 },
          ],
        },
        {
          id: "job_offer_q4_bonus",
          icon: "briefcase",
          variants: [{ id: "v1", narrative: "Meridian offers a $2,000 signing bonus. How much should it matter?" }],
          choices: [
            { id: "q4_one_time", label: "Count it once — it won't come back next year", outcomeNarrative: "Exactly. Benefits repeat every year; the bonus doesn't.", financialQualityScore: 5 },
            { id: "q4_tip_scales", label: "A lot — $2,000 is a lot of money", outcomeNarrative: "It is, once. Over a few years the benefits win.", financialQualityScore: 3 },
            { id: "q4_same_money", label: "Treat it like part of the yearly salary", outcomeNarrative: "That makes Meridian look $2,000 better every year. It isn't.", financialQualityScore: 2, statEffects: { stress: 1 } },
          ],
        },
        {
          id: "job_offer_q5_negotiate",
          icon: "briefcase",
          variants: [{ id: "v1", narrative: "Neither offer says it's final. Do you ask for more?" }],
          choices: [
            { id: "q5_no_ask", label: "No, I don't want to seem greedy", outcomeNarrative: "Asking politely almost never costs you the offer. Not asking can cost you money.", financialQualityScore: 2 },
            { id: "q5_soft_mention", label: "Hint that I have another offer", outcomeNarrative: "A vague hint gets a vague answer. Nothing changes.", financialQualityScore: 3 },
            { id: "q5_specific_ask", label: "Ask Harbor & Finch for a $1,000 signing bonus", outcomeNarrative: "A clear, specific ask. They say they'll see what they can do.", financialQualityScore: 5, sets: ["asked_bonus"] },
          ],
        },
        {
          id: "job_offer_q8_final_call",
          icon: "briefcase",
          variants: [{ id: "v1", narrative: "Time to choose. Which job do you take?" }],
          choices: [
            { id: "q8_exciting", label: "Meridian — bigger paycheck", outcomeNarrative: "You take Meridian. Bigger checks, but no insurance and no match. That will matter later.", financialQualityScore: 2, statEffects: { stress: 1 }, sets: ["job_meridian"] },
            { id: "q8_first_instinct", label: "Harbor & Finch — it just feels right", outcomeNarrative: "You take Harbor & Finch. Good pick, even if it was a gut call.", financialQualityScore: 3, sets: ["job_harbor"] },
            { id: "q8_the_numbers", label: "Harbor & Finch — it wins once benefits are counted", outcomeNarrative: "You take Harbor & Finch, and you can explain exactly why.", financialQualityScore: 5, sets: ["job_harbor"] },
          ],
        },
      ],
      nextChapterId: "housing_decision",
    },

    promotion_offer: {
      id: "promotion_offer",
      title: "A raise or a startup?",
      icon: "rocket",
      isMirrorChoice: true,
      mirrorOf: "job_offer",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 24 · Two years into your job",
        situation:
          "You've been at your job two years. In the same week, two things happen: your boss offers a $6,000 raise to stay in the same role, and a 12-person startup offers you a job with a small piece of ownership (equity).",
        goal: "Weigh a sure thing against a risky one — and use having two offers to your advantage.",
        terms: [
          { term: "Equity", meaning: "A small share of a company. Worth a lot if the company succeeds, $0 if it fails." },
          { term: "Runway", meaning: "How many months a startup can keep paying people before its money runs out." },
          { term: "Leverage", meaning: "Having another real option, which makes it easier to ask for more." },
          { term: "Lifestyle creep", meaning: "When your spending rises every time your pay does, so you never get ahead." },
        ],
        trend: "Most startups don't survive their first several years, so most startup equity ends up worth little or nothing.",
      },
      economy: { paycheck: 5900, payByFlag: { job_meridian: 1000 }, bills: 3900 },
      consequences: [
        { id: "promo_tire", text: "Life happens: a flat tire and a cracked phone screen", chance: 0.5, statEffects: { cash: -280 } },
        { id: "cheap_fix_broke", text: "Because you got the cheap patch job, the car broke down again — the real repair cost", ifAll: ["cheap_fix"], statEffects: { cash: -900, stress: 2 } },
        { id: "brakes_ignored", text: "Because you ignored the brakes, they wore down and damaged the rotors", ifAll: ["skip_maintenance"], statEffects: { cash: -650, stress: 1 } },
        { id: "brakes_funded", text: "Because you saved for car costs, the $300 brake job came out of your car fund", ifAll: ["car_fund"], statEffects: { savings: -300 } },
      ],
      questions: [
        {
          id: "promo_q1_first_look",
          icon: "rocket",
          variants: [
            { id: "v1", narrative: "Option 1: a $6,000 raise, same job.\nOption 2: a startup job with 1% equity and 8 months of runway.\n\nWhat do you look at first?" },
          ],
          choices: [
            { id: "p1_raise_amount", label: "The raise — it's the clearest number", outcomeNarrative: "It's clear, but it's only half the comparison.", financialQualityScore: 3 },
            { id: "p1_discount_equity", label: "What the equity is realistically worth, given the risk", outcomeNarrative: "Smart. 1% of a company that probably fails is worth a lot less than it sounds.", financialQualityScore: 5 },
            { id: "p1_exciting", label: "Which one sounds cooler", outcomeNarrative: "The startup sounds cooler. That's not a financial reason.", financialQualityScore: 2 },
          ],
        },
        {
          id: "promo_q2_runway",
          icon: "rocket",
          variants: [{ id: "v1", narrative: "The startup has about 8 months of money left. What do you do with that info?" }],
          choices: [
            { id: "p2_assume_fine", label: "Assume they wouldn't hire if they were in trouble", outcomeNarrative: "Startups often hire while still hoping to raise more money.", financialQualityScore: 2, statEffects: { stress: 1 } },
            { id: "p2_note_short", label: "Note it seems short and move on", outcomeNarrative: "It is short. You don't know their plan for month nine.", financialQualityScore: 3 },
            { id: "p2_ask_directly", label: "Ask what happens if they can't raise more money", outcomeNarrative: "Their answer tells you how risky this really is.", financialQualityScore: 5 },
          ],
        },
        {
          id: "promo_q3_equity_value",
          icon: "rocket",
          variants: [{ id: "v1", narrative: "They offer \"1% equity.\" What do you ask?" }],
          choices: [
            { id: "p3_ask_percentage", label: "How much I'd own after they raise more money", outcomeNarrative: "Good question. New investors usually shrink your slice.", financialQualityScore: 5 },
            { id: "p3_assume_meaningful", label: "Nothing — equity is probably worth something", outcomeNarrative: "Maybe. You're guessing.", financialQualityScore: 3 },
            { id: "p3_dont_ask", label: "Nothing — it feels awkward to ask", outcomeNarrative: "It's a normal question. Not asking leaves you blind.", financialQualityScore: 2 },
          ],
        },
        {
          id: "promo_q4_ceiling",
          icon: "rocket",
          variants: [{ id: "v1", narrative: "The raise keeps you in the same role with no path up. How do you read that?" }],
          choices: [
            { id: "p4_face_value", label: "More money is more money", outcomeNarrative: "True for now. You didn't ask about later.", financialQualityScore: 3 },
            { id: "p4_ask_manager", label: "Ask my boss what it takes to get promoted", outcomeNarrative: "Now you know whether this job has a future.", financialQualityScore: 5 },
            { id: "p4_assume_moves", label: "Assume a promotion will come eventually", outcomeNarrative: "Promotions rarely just happen. Usually you have to ask.", financialQualityScore: 2 },
          ],
        },
        {
          id: "promo_q5_negotiate",
          icon: "rocket",
          variants: [{ id: "v1", narrative: "You decide to stay. Do you use the startup offer to ask for more?" }],
          choices: [
            { id: "p5_use_leverage", label: "Yes — tell my boss about it and ask for $8,500", outcomeNarrative: "They agree to $8,500. Every paycheck from now on is bigger.", financialQualityScore: 5, sets: ["raise_big"] },
            { id: "p5_soft_mention", label: "Mention it, but don't name a number", outcomeNarrative: "They bump it a little, to $6,800.", financialQualityScore: 3, sets: ["raise_mid"] },
            { id: "p5_no_mention", label: "No — just take the $6,000", outcomeNarrative: "You had leverage and didn't use it. $6,000 it is.", financialQualityScore: 2, statEffects: { stress: 1 }, sets: ["raise_base"] },
          ],
        },
        {
          id: "promo_q8_final_call",
          icon: "rocket",
          variants: [{ id: "v1", narrative: "Looking back at how you made this decision — what drove it?" }],
          choices: [
            { id: "p8_weigh_and_act", label: "What I found out, compared to my own savings", outcomeNarrative: "A decision you can explain. That's the goal.", financialQualityScore: 5 },
            { id: "p8_feels_safer", label: "Whatever felt safer", outcomeNarrative: "Safe isn't wrong, but it's not the same as informed.", financialQualityScore: 3 },
            { id: "p8_friend_pick", label: "What a friend said they'd do", outcomeNarrative: "Your friend has different money and different goals.", financialQualityScore: 2 },
          ],
        },
        {
          id: "promo_q9_raise_spending",
          icon: "piggy-bank",
          menuStyle: true,
          randomEvent: { id: "promo_wedding", chance: 0.3, bannerText: "A friend's wedding: gift, outfit and gas cost you $350.", statEffects: { cash: -350 } },
          variants: [{ id: "v1", narrative: "Your raise starts next paycheck. What happens to the extra money?" }],
          choices: [
            { id: "p9_let_it_creep", label: "Nothing special — just spend it", outcomeNarrative: "It disappears into takeout and shopping. From now on, you spend more every month.", financialQualityScore: 2, statEffects: { stress: 1 }, amount: 0, tone: "negative", sets: ["lifestyle_creep"] },
            { id: "p9_split_it", label: "Save half, enjoy half", outcomeNarrative: "From now on, half the raise goes to savings automatically.", financialQualityScore: 3, amount: 350, tone: "neutral", sets: ["raise_half"] },
            { id: "p9_bank_it", label: "Auto-save all of it", outcomeNarrative: "You never get used to the extra money, so you never miss it. Watch your savings climb.", financialQualityScore: 5, amount: 700, tone: "positive", sets: ["raise_saved"] },
          ],
        },
      ],
      nextChapterId: "startup_fork",
    },

    // The Y in the road. Not a measurement chapter, so it can branch freely.
    startup_fork: {
      id: "startup_fork",
      title: "The fork in the road",
      icon: "rocket",
      narrative: "",
      choices: [],
      briefing: {
        when: "Age 24 · The same week",
        situation:
          "You got your raise. But the startup calls back: the offer still stands. Stay, and you get steady pay plus your company's stock plan. Join, and you take a pay cut for a slice of a company that could be worth millions — or nothing. This choice changes the rest of your story.",
        goal: "Pick a path you can afford — and if you take the risk, take it smart.",
        terms: [
          { term: "Stock options / equity", meaning: "The right to own part of the company. If it's bought or goes public, your share can be worth a lot. If it fails, $0." },
          { term: "Acquisition", meaning: "When a bigger company buys a startup. That's usually when employees' equity turns into real money." },
          { term: "Employee stock purchase plan (ESPP)", meaning: "A benefit where you buy your own company's stock at a discount from your paycheck." },
        ],
        trend: "Most startups fail, but a few employees at the ones that succeed end up with life-changing payouts. Having savings first is what lets you take that shot.",
      },
      questions: [
        {
          id: "fork_q1_path",
          icon: "rocket",
          variants: [{ id: "v1", narrative: "Final answer: which path do you take?" }],
          narrativeIf: [
            { ifAny: ["auto_save", "raise_saved"], narrative: "Final answer: which path do you take? (Your auto-savings means you'd have a cushion if the startup struggles.)" },
          ],
          choices: [
            { id: "fork_stay", label: "Stay — take the raise and the stock plan", outcomeNarrative: "Steady and solid. Your company's stock plan opens up for you.", financialQualityScore: 4, sets: ["path_corp"] },
            { id: "fork_join_smart", label: "Join the startup — but negotiate 2x the equity first", outcomeNarrative: "They agree to double your equity. Lower pay, real upside.", financialQualityScore: 5, sets: ["path_startup", "startup_negotiated"] },
            { id: "fork_join_rush", label: "Join the startup right away — it's exciting", outcomeNarrative: "You're in, with whatever equity they first offered.", financialQualityScore: 2, statEffects: { stress: 1 }, sets: ["path_startup"] },
          ],
        },
      ],
      nextChapterId: "credit_decision",
    },

    ending: {
      id: "ending",
      title: "Age 32",
      icon: "trophy",
      isEnding: true,
      narrative: "Ten years after your first job offer.",
      choices: [],
      consequences: [
        // Startup path — earned + luck. Negotiating and extra equity raise the odds and the payout.
        { id: "su_jackpot_more", text: "Your startup got acquired! Because you negotiated AND took extra equity, your share paid out $2.1M (after taxes)", ifAll: ["path_startup", "startup_negotiated", "more_equity"], chance: 0.45, statEffects: { savings: 2100000 }, sets: ["su_done"] },
        { id: "su_jackpot", text: "Your startup got acquired! Because you negotiated more equity, your share paid out $1.4M (after taxes)", ifAll: ["path_startup", "startup_negotiated"], ifNone: ["su_done"], chance: 0.4, statEffects: { savings: 1400000 }, sets: ["su_done"] },
        { id: "su_lucky", text: "Your startup got acquired — but you never negotiated, so your small share paid $350K (after taxes)", ifAll: ["path_startup"], ifNone: ["su_done", "startup_negotiated"], chance: 0.15, statEffects: { savings: 350000 }, sets: ["su_done"] },
        { id: "su_small", text: "Your startup was sold for a modest price. Your equity paid $40K", ifAll: ["path_startup"], ifNone: ["su_done"], chance: 0.3, statEffects: { savings: 40000 }, sets: ["su_done"] },
        { id: "su_zero", text: "Your startup shut down. The equity is worth $0 — that's the risk of startups", ifAll: ["path_startup"], ifNone: ["su_done"], sets: ["su_done"] },
        // Company stock (corporate path)
        { id: "espp_boom", text: "Your company's stock soared 10x — and you'd put everything in it. It paid off: +$250K", ifAll: ["espp_allin"], chance: 0.2, statEffects: { savings: 250000 }, sets: ["espp_done"] },
        { id: "espp_bust", text: "Because you held only your company's stock, a bad year cut it 60%", ifAll: ["espp_allin"], ifNone: ["espp_done"], statEffects: { savings: -12000, stress: 2 }, sets: ["espp_done"] },
        { id: "espp_steady", text: "Because you used the stock plan and sold to diversify, you banked steady gains", ifAll: ["espp_smart"], statEffects: { savings: 40000 } },
        { id: "espp_smart_boom", text: "Your company's stock also took off — the shares you kept added more", ifAll: ["espp_smart"], chance: 0.2, statEffects: { savings: 80000 } },
        // The business
        { id: "biz_chain", text: "A regional chain bought your coffee business for $1.5M — because you priced right, built a cushion, and grew carefully ($1.2M after taxes)", ifAll: ["biz_profit_high", "biz_cushion", "biz_loan_good"], ifNone: ["off_books", "biz_sold"], chance: 0.45, statEffects: { savings: 1200000 }, sets: ["biz_done"] },
        { id: "biz_chain_ok", text: "Your two coffee carts sold to a local buyer for a solid profit", ifAll: ["biz_expanded"], ifNone: ["biz_done", "off_books"], chance: 0.25, statEffects: { savings: 250000 }, sets: ["biz_done"] },
        { id: "end_index", text: "Because you chose an index fund, it kept growing with the market", ifAll: ["index_fund"], statEffects: { savings: 900 } },
        { id: "end_roth", text: "Because you opened a Roth IRA, it grew tax-free", ifAll: ["roth_ira"], statEffects: { savings: 600 } },
        { id: "end_margin", text: "Because you borrowed to invest, a market dip forced you to sell at a loss", ifAll: ["margin"], statEffects: { savings: -600, stress: 2 } },
        { id: "end_held_loser", text: "Because you held the losing stock, it fell another 50%", ifAll: ["held_loser"], statEffects: { savings: -250 } },
        { id: "end_influencer", text: "Because you followed the influencer's pick, it went to almost zero", ifAll: ["influencer_bet"], statEffects: { savings: -380 } },
      ],
      endingVariants: [
        {
          id: "high",
          minAvgQualityScore: 4,
          headline: "On track to retire at 58",
          narrative:
            "Ten years after that first offer, your money works for you. Your savings and investments keep growing, you pay your card in full every month, and surprises don't scare you anymore.",
        },
        {
          id: "mixed",
          minAvgQualityScore: 2.8,
          headline: "On track to retire at 64",
          narrative: "You're doing fine — steady income, some savings — but you can point to a few choices that would have put you way ahead.",
        },
        {
          id: "lower",
          minAvgQualityScore: 0,
          headline: "On track to retire at 68",
          narrative:
            "You're getting by, but small choices added up. Debt and interest still eat part of every paycheck. The good news: it's never too late to change the pattern.",
        },
      ],
    },
  },
};
