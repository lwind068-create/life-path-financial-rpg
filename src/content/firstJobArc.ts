// "First Job" story arc — content only. No game-engine logic lives here.
//
// Three chapters per playthrough: job_offer (baseline) -> promotion_offer
// (mirror) -> ending. See src/engine/scoring.ts for how the baseline and
// mirror chapters are compared, and that file's header comment for the
// ethical framing.
//
// The position of the highest-quality choice (score 5) is deliberately
// rotated across A/B/C from question to question — never let it settle
// into a fixed slot (e.g. "always the third option"): that's a pattern a
// player can learn and exploit without doing any real financial
// reasoning. Vary each choice's opening phrasing too, so no lexical tic
// (e.g. always starting the smart option with "Actually...") becomes a
// giveaway on its own.
import type { StoryArc } from "./types";

export const firstJobArc: StoryArc = {
  id: "first_job",
  title: "First Job",
  blurb: "Graduate. Get a job. Make the calls that shape your twenties.",
  nextArcTeaser: "Your story keeps going. More chapters on the way.",
  startChapterId: "job_offer",
  pathLength: 3,
  chapters: {
    job_offer: {
      id: "job_offer",
      title: "Two offers",
      icon: "briefcase",
      isBaselineChoice: true,
      narrative: "",
      choices: [],
      questions: [
        {
          id: "job_offer_q1_first_look",
          icon: "briefcase",
          randomEvent: {
            id: "welcome_bonus",
            chance: 0.2,
            bannerText: "Your new bank throws in a $25 welcome bonus just for opening an account. Small, but it made you smile.",
            statEffects: { savings: 25 },
          },
          variants: [
            { id: "v1", narrative: "Diploma in hand, a few months out of school — two offer letters land in your inbox. Meridian Logistics: $52,000/year, no health insurance, no 401(k) match. Harbor & Finch: $44,000/year, full health coverage, 4% match. Before anything else, what do you actually look at first?" },
            { id: "v2", narrative: "Fresh out of school, staring at two real offers: Meridian Logistics at $52,000 with no benefits, Harbor & Finch at $44,000 with full health coverage and a 401(k) match — an $8,000 gap in salary alone. Where does your eye go first when you open both letters?" },
            { id: "v3", narrative: "Diploma barely framed, and already two names to choose between: Meridian Logistics — $52k, no insurance, no match. Harbor & Finch — $44k, full coverage, 4% match. What's the first thing you actually check?" },
          ],
          choices: [
            { id: "q1_total_comp", label: "Total compensation — salary plus what the benefits are actually worth in dollars.", outcomeNarrative: "You start with the number that actually matters, not just the biggest one.", financialQualityScore: 5, statEffects: { savings: 875, stress: 0 } },
            { id: "q1_base_salary", label: "The base salary, since that's what hits your account every two weeks.", outcomeNarrative: "It's the number you'll feel first, but not the whole picture.", financialQualityScore: 3, statEffects: { savings: -160, stress: 0 } },
            { id: "q1_sounds_better", label: "Whichever one sounds better when you say it out loud.", outcomeNarrative: "$52k sounds better. It also isn't the whole story.", financialQualityScore: 2, statEffects: { savings: -875, stress: 1 } },
          ],
        },
        {
          id: "job_offer_q2_insurance",
          icon: "briefcase",
          variants: [
            { id: "v1", narrative: "Meridian's health plan: $0, because there isn't one. Harbor & Finch's: fully covered. How do you actually weigh that gap?" },
            { id: "v2", narrative: "One offer includes health coverage. The other leaves you buying your own — easily $250-350 a month on the open market. How do you size up the difference?" },
            { id: "v3", narrative: "No insurance at Meridian means a single ER visit — average bill north of $2,000 — lands entirely on you. How do you factor that in?" },
          ],
          choices: [
            { id: "q2_skip_it", label: "Assume you're healthy and skip the math — insurance is a 'later' problem.", outcomeNarrative: "You're probably fine. 'Probably' is doing a lot of work in that sentence.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
            { id: "q2_price_a_plan", label: "Price an actual marketplace plan and subtract that monthly cost from Meridian's edge.", outcomeNarrative: "The real number is smaller than the sticker-price gap suggested.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
            { id: "q2_guess", label: "Guess it's 'a few hundred bucks a month' without checking a real quote.", outcomeNarrative: "Your estimate is in the right neighborhood, more by luck than by checking.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
          ],
        },
        {
          id: "job_offer_q3_match",
          icon: "briefcase",
          variants: [
            { id: "v1", narrative: "Harbor & Finch matches 4% of your 401(k) — on $44,000, that's about $1,760 a year in free money. Meridian offers nothing. Does that change anything for you?" },
            { id: "v2", narrative: "A 4% match is basically a guaranteed raise if you take it — roughly $1,760 a year here. How do you treat it?" },
            { id: "v3", narrative: "One job hands you an extra ~$1,760 a year for showing up. The other doesn't. How much weight does that get?" },
          ],
          choices: [
            { id: "q3_note_it", label: "Note it as a nice-to-have and move on without running a number on it.", outcomeNarrative: "You register it. You don't really weigh it.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "q3_ignore_it", label: "Ignore it — retirement is decades away and doesn't feel real yet.", outcomeNarrative: "It doesn't feel real. The math on missed matches is real anyway.", financialQualityScore: 2, statEffects: { savings: -190, stress: 1 } },
            { id: "q3_calculate_it", label: "Calculate roughly what a 4% match is worth in raw dollars over the next year alone.", outcomeNarrative: "Once it's a real number instead of a vague benefit, it's harder to wave off.", financialQualityScore: 5, statEffects: { savings: 190, stress: 0 } },
          ],
        },
        {
          id: "job_offer_q4_bonus",
          icon: "briefcase",
          variants: [
            { id: "v1", narrative: "Meridian's $2,000 signing bonus is real cash, fast. How do you factor it in?" },
            { id: "v2", narrative: "A $2,000 bonus if you start within two weeks. Tempting, right up until you weigh it against a full year." },
            { id: "v3", narrative: "$2,000 up front versus a $200 gift card. The gap is obvious. Is it the whole story?" },
          ],
          choices: [
            { id: "q4_one_time", label: "Treat it as a one-time number — worth exactly $2,000 once, not a reason to ignore the annual gap.", outcomeNarrative: "You put it in its place: real, but small next to a full year of pay.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
            { id: "q4_tip_scales", label: "Let it tip the scales more than a one-time payment probably should.", outcomeNarrative: "It's $2,000. It's also one-eighteenth of a year's salary, tops.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "q4_same_money", label: "Treat the bonus and the year-one salary as basically the same kind of money.", outcomeNarrative: "A one-time bonus and a recurring salary don't behave the same way over five years.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
          ],
        },
        {
          id: "job_offer_q5_negotiate",
          icon: "briefcase",
          variants: [
            { id: "v1", narrative: "You have 48 hours and a $200 gift-card bonus that could easily be a $1,000 check instead. Do you try to negotiate either offer before deciding?" },
            { id: "v2", narrative: "Neither company said $52k or $44k was final. Do you ask for even $2,000 more?" },
            { id: "v3", narrative: "48 hours isn't much time, but it might be enough to ask for another $1,000 on the table." },
          ],
          choices: [
            { id: "q5_no_ask", label: "No — asking feels risky for a first job, so you just pick one.", outcomeNarrative: "You take a number no one pressure-tested but you.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
            { id: "q5_soft_mention", label: "Mention you have another offer, vaguely, and see if anything moves.", outcomeNarrative: "It's a soft ask. It gets a soft answer.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "q5_specific_ask", label: "Ask Harbor & Finch directly if there's flexibility on the signing bonus, since salary is the real gap.", outcomeNarrative: "The worst answer is no, and you asked a specific, answerable question.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
          ],
        },
        {
          id: "job_offer_q6_commute",
          icon: "briefcase",
          variants: [
            { id: "v1", narrative: "Meridian's office is 15 minutes closer. Over a year, that gap is worth real gas money. Does that change the math?" },
            { id: "v2", narrative: "One job costs you an extra $35-50 a month in gas and time. Do you put a number on that?" },
            { id: "v3", narrative: "Fifteen extra minutes each way, five days a week — call it $500 a year in gas and time. Worth counting?" },
          ],
          choices: [
            { id: "q6_shrug", label: "Notice it, shrug, and figure it'll be fine.", outcomeNarrative: "It probably will be. You didn't actually check what 'fine' costs.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
            { id: "q6_estimate", label: "Estimate the extra gas and time cost per month and fold it into the comparison.", outcomeNarrative: "It's a small number, but now it's a known one instead of a guess.", financialQualityScore: 5, statEffects: { savings: 60, stress: 0 } },
            { id: "q6_ignore", label: "Ignore commute entirely — a job's a job.", outcomeNarrative: "A job's a job. A commute is also, quietly, a monthly expense.", financialQualityScore: 2, statEffects: { savings: -60, stress: 1 } },
          ],
        },
        {
          id: "job_offer_q7_deadline",
          icon: "briefcase",
          variants: [
            { id: "v1", narrative: "The clock's ticking on 48 hours — and an $8,000-a-year decision deserves more than a coin flip. How do you actually spend that time?" },
            { id: "v2", narrative: "Two days to decide something worth thousands of dollars a year, every year. What's your process?" },
            { id: "v3", narrative: "48 hours sounds like plenty until you're 40 hours in, still unsure, and that $8,000 gap is still just a feeling." },
          ],
          choices: [
            { id: "q7_set_time", label: "Set aside a real hour to run the numbers, rather than deciding in bits and pieces.", outcomeNarrative: "One focused hour beats two days of half-thinking about it in the shower.", financialQualityScore: 5, statEffects: { savings: 875, stress: 0 } },
            { id: "q7_on_and_off", label: "Think about it on and off, and decide whenever it starts to feel obvious.", outcomeNarrative: "It eventually feels obvious. You're not fully sure why.", financialQualityScore: 3, statEffects: { savings: -160, stress: 0 } },
            { id: "q7_last_minute", label: "Wait until the last few hours and decide under pressure.", outcomeNarrative: "You decide. The deadline did more of the deciding than you did.", financialQualityScore: 2, statEffects: { savings: -875, stress: 1 } },
          ],
        },
        {
          id: "job_offer_q8_final_call",
          icon: "briefcase",
          variants: [
            { id: "v1", narrative: "Numbers aside, it's time to actually pick — and lock in a salary for the next year at least. What tips it?" },
            { id: "v2", narrative: "You've thought it through. Now you have to choose between $52,000 and $44,000-plus-benefits. What's the deciding factor?" },
            { id: "v3", narrative: "Last call on an $8,000-a-year fork in the road — how do you make the final decision?" },
          ],
          choices: [
            { id: "q8_exciting", label: "Go with whichever offer feels more exciting in the moment — Meridian's bigger check.", outcomeNarrative: "Excitement is a real signal. It's not the same as evidence. You take Meridian, bonus and all.", financialQualityScore: 2, statEffects: { savings: -875, stress: 1 } },
            { id: "q8_first_instinct", label: "Go with your first instinct from when you opened the emails — Harbor & Finch, benefits felt right.", outcomeNarrative: "First instincts are sometimes right. This time it's a coin flip whether it was. You take Harbor & Finch anyway.", financialQualityScore: 3, statEffects: { savings: -160, stress: 0 } },
            { id: "q8_the_numbers", label: "Go with whichever offer won on the numbers you actually worked out — Harbor & Finch, clearly.", outcomeNarrative: "You decide based on what you found, not just how you felt when you started, and take Harbor & Finch for a reason you can point to.", financialQualityScore: 5, statEffects: { savings: 875, stress: 0 } },
          ],
        },
      ],
      nextChapterId: "housing_decision",
    },

    promotion_offer: {
      id: "promotion_offer",
      title: "Two pulls",
      icon: "rocket",
      isMirrorChoice: true,
      mirrorOf: "job_offer",
      narrative: "",
      choices: [],
      questions: [
        {
          id: "promo_q1_first_look",
          icon: "rocket",
          variants: [
            { id: "v1", narrative: "A couple of years into that first job — rent handled, the car finally sorted — two pulls land in the same week: a guaranteed raise, or a real bet on a startup. What's the first thing you actually weigh?" },
            { id: "v2", narrative: "Life's settled into a rhythm since that first offer. Then, out of nowhere: $6,000 more for certain, or equity in something that might not survive. Where does your attention go first?" },
            { id: "v3", narrative: "You've been at it a while now — first apartment, first car repair, the ordinary stuff of being on your own. Then a raise and a startup offer land the same week. What's the first number you look at?" },
          ],
          choices: [
            { id: "p1_raise_amount", label: "The raise amount, since it's the most concrete number on the table.", outcomeNarrative: "It's concrete. It's also not the only number that matters here.", financialQualityScore: 3, statEffects: { savings: -120, stress: 0 } },
            { id: "p1_discount_equity", label: "What the startup equity could realistically be worth if it succeeds, discounted by how likely that actually is.", outcomeNarrative: "You start with the harder number instead of the easy one, which is exactly the number that needs the most scrutiny.", financialQualityScore: 5, statEffects: { savings: 650, stress: 0 } },
            { id: "p1_exciting", label: "Whichever offer sounds more exciting to tell people about.", outcomeNarrative: "The startup sounds better at a party. That's not the same as being the better call.", financialQualityScore: 2, statEffects: { savings: -650, stress: 1 } },
          ],
        },
        {
          id: "promo_q2_runway",
          icon: "rocket",
          variants: [
            { id: "v1", narrative: "Eight months of runway left at the startup, on roughly $40,000 in the bank. Does that number change how you see the offer?" },
            { id: "v2", narrative: "'Runway' means how long before the money runs out — here, about eight months. Do you find out if that's actually accurate?" },
            { id: "v3", narrative: "A startup with eight months of cash left is a real risk. Do you size it up?" },
          ],
          choices: [
            { id: "p2_assume_fine", label: "Assume the founder wouldn't offer you a job if they were about to run out of money.", outcomeNarrative: "That's not really how it works — founders often hire while they're still trying to raise more.", financialQualityScore: 2, statEffects: { savings: -500, stress: 1 } },
            { id: "p2_note_short", label: "Note that eight months feels short but don't dig into what happens after.", outcomeNarrative: "Eight months feels short because it is. You didn't find out what the plan is for month nine.", financialQualityScore: 3, statEffects: { savings: -90, stress: 0 } },
            { id: "p2_ask_directly", label: "Ask directly about their next funding round and what happens if it doesn't close.", outcomeNarrative: "The answer tells you more about the real risk than the pitch deck did.", financialQualityScore: 5, statEffects: { savings: 500, stress: 0 } },
          ],
        },
        {
          id: "promo_q3_equity_value",
          icon: "rocket",
          variants: [
            { id: "v1", narrative: "Real equity, they said — maybe 1% of a company that could be worth $10M, or could be worth $0. Do you find out which?" },
            { id: "v2", narrative: "Equity sounds valuable. 1% of $10M is $100,000. 1% of $0 is $0. Is it the first case here, or the second?" },
            { id: "v3", narrative: "'A real say in what gets built' is part of the pitch. Is the equity percentage part of it real too?" },
          ],
          choices: [
            { id: "p3_ask_percentage", label: "Ask what percentage you'd actually own and what it would be diluted to after the next funding round.", outcomeNarrative: "A vague 'equity' turns into a specific, evaluable number instead of a nice-sounding word.", financialQualityScore: 5, statEffects: { savings: 500, stress: 0 } },
            { id: "p3_assume_meaningful", label: "Assume equity at a startup this size is worth something meaningful without checking.", outcomeNarrative: "It might be. 'Might' is a big word to build a decision on.", financialQualityScore: 3, statEffects: { savings: -90, stress: 0 } },
            { id: "p3_dont_ask", label: "Don't ask, since it feels awkward to grill them on percentages this early.", outcomeNarrative: "It's a fair question to ask before making a career decision. The awkwardness is worth it.", financialQualityScore: 2, statEffects: { savings: -500, stress: 1 } },
          ],
        },
        {
          id: "promo_q4_ceiling",
          icon: "rocket",
          variants: [
            { id: "v1", narrative: "The $6,000 raise keeps you in the same role, same ceiling. Does that framing bother you?" },
            { id: "v2", narrative: "'Same responsibilities, same ceiling,' plus $6,000 — is that a red flag or just an honest description?" },
            { id: "v3", narrative: "$6,000 more with no real change in what's next. How do you read that?" },
          ],
          choices: [
            { id: "p4_face_value", label: "Take it at face value — more money for the same job is still a win.", outcomeNarrative: "It is a win, in the short term. The ceiling part is the part you didn't weigh.", financialQualityScore: 3, statEffects: { savings: -120, stress: 0 } },
            { id: "p4_ask_manager", label: "Ask your manager directly what it would actually take to move past that ceiling.", outcomeNarrative: "Now you know if the raise is a step toward something, or the whole staircase.", financialQualityScore: 5, statEffects: { savings: 650, stress: 0 } },
            { id: "p4_assume_moves", label: "Assume the ceiling will probably move on its own eventually.", outcomeNarrative: "Ceilings that move on their own are rare. Usually someone has to ask.", financialQualityScore: 2, statEffects: { savings: -650, stress: 1 } },
          ],
        },
        {
          id: "promo_q5_negotiate",
          icon: "rocket",
          variants: [
            { id: "v1", narrative: "Do you try to negotiate either offer, or take one of them as given?" },
            { id: "v2", narrative: "Neither offer said it was final. Do you push on either one?" },
            { id: "v3", narrative: "You've got leverage from having two real offers. Do you use it?" },
          ],
          choices: [
            { id: "p5_use_leverage", label: "Use the startup offer as real leverage to ask for more than the initial $6,000 raise.", outcomeNarrative: "Having a genuine alternative is exactly when negotiating actually works — they come back at $8,500.", financialQualityScore: 5, statEffects: { savings: 8500, stress: 0 } },
            { id: "p5_soft_mention", label: "Mention the startup offer vaguely without really pushing for a specific number.", outcomeNarrative: "A soft mention gets you, at best, a soft response — they bump it to $6,800.", financialQualityScore: 3, statEffects: { savings: 6800, stress: 0 } },
            { id: "p5_no_mention", label: "Take the raise as offered without mentioning the other option at all.", outcomeNarrative: "You had leverage and didn't spend it. The $6,000 lands exactly as offered.", financialQualityScore: 2, statEffects: { savings: 6000, stress: 1 } },
          ],
        },
        {
          id: "promo_q6_reference_check",
          icon: "rocket",
          variants: [
            { id: "v1", narrative: "Twelve people, roughly $40,000 left in the bank. Do you talk to anyone who's actually worked there before deciding?" },
            { id: "v2", narrative: "The founder's pitch is one perspective on that $40,000 runway. Do you get a second one?" },
            { id: "v3", narrative: "Twelve people work there already, watching that same $40,000 tick down. Do you talk to any of them?" },
          ],
          choices: [
            { id: "p6_founders_word", label: "Take the founder's word for how things are going internally.", outcomeNarrative: "Founders are, understandably, the most optimistic person in any room about their own company.", financialQualityScore: 2, statEffects: { savings: -500, stress: 1 } },
            { id: "p6_look_up_news", label: "Look up the company online for funding news without talking to anyone directly.", outcomeNarrative: "Public information helps. It's not the same as an honest conversation.", financialQualityScore: 3, statEffects: { savings: -90, stress: 0 } },
            { id: "p6_talk_to_employee", label: "Ask to talk to one of the current employees about what it's actually like day to day.", outcomeNarrative: "You get a perspective the pitch deck was never going to give you.", financialQualityScore: 5, statEffects: { savings: 500, stress: 0 } },
          ],
        },
        {
          id: "promo_q7_cushion",
          icon: "rocket",
          variants: [
            { id: "v1", narrative: "If the startup folded in eight months, three months of expenses — call it $4,500 — would be the difference between comfortable and scrambling. Do you check you have it?" },
            { id: "v2", narrative: "Betting on yourself means having a plan if the bet doesn't pay off — roughly $4,500 for three months of runway of your own. Do you make one?" },
            { id: "v3", narrative: "The risk is real. Do you find out whether $4,500 in savings actually exists, or just the idea of it?" },
          ],
          choices: [
            { id: "p7_figure_it_out", label: "Assume you'd figure it out if it happened.", outcomeNarrative: "You probably would. Figuring it out under pressure costs more than planning ahead does.", financialQualityScore: 3, statEffects: { savings: -90, stress: 0 } },
            { id: "p7_calculate_months", label: "Calculate how many months of expenses you'd need saved to job-hunt comfortably if it folded.", outcomeNarrative: "Now the risk has an actual size instead of just a feeling.", financialQualityScore: 5, statEffects: { savings: 500, stress: 0 } },
            { id: "p7_doesnt_matter", label: "Decide the risk doesn't matter since you're young and can always start over.", outcomeNarrative: "You can. Starting over is easier with three months of expenses saved than with none.", financialQualityScore: 2, statEffects: { savings: -500, stress: 1 } },
          ],
        },
        {
          id: "promo_q8_final_call",
          icon: "rocket",
          variants: [
            { id: "v1", narrative: "Decision time. $6,000 guaranteed, or a shot at $100,000+ if the equity actually pays off. What tips it?" },
            { id: "v2", narrative: "You've gathered what you can. Now you choose between a sure $6,000 and a real chance at nothing. What's the deciding factor?" },
            { id: "v3", narrative: "Last call on the two pulls — one number is certain, one could be ten times bigger or zero. How do you decide?" },
          ],
          choices: [
            { id: "p8_weigh_and_act", label: "Weigh what you found against your own runway, and either take the leap deliberately or negotiate the raise up.", outcomeNarrative: "Either way, it's a decision you can actually explain, not just one you landed on.", financialQualityScore: 5, statEffects: { savings: 650, stress: 0 } },
            { id: "p8_feels_safer", label: "Go with whichever option feels safer in the moment without revisiting what you found.", outcomeNarrative: "Safer isn't wrong. It's also not the same as informed.", financialQualityScore: 3, statEffects: { savings: -120, stress: 0 } },
            { id: "p8_friend_pick", label: "Go with whichever option a friend says they'd pick if it were them.", outcomeNarrative: "It's not them. It's you, with your own numbers.", financialQualityScore: 2, statEffects: { savings: -650, stress: 1 } },
          ],
        },
        {
          id: "promo_q9_raise_spending",
          icon: "piggy-bank",
          menuStyle: true,
          variants: [
            { id: "v1", narrative: "A few months in, roughly $200 extra is landing in your account every paycheck that didn't used to be there. What do you actually do with it?" },
            { id: "v2", narrative: "The new number on your paycheck settles in. About $200 a paycheck more than before. Where does it go?" },
            { id: "v3", narrative: "It's been a few months — the raise is real now, not just a number from an offer letter. An extra $200 a paycheck. What happens to it?" },
          ],
          choices: [
            { id: "p9_let_it_creep", label: "Let everyday spending drift up to match it — you're not really tracking where the extra goes.", outcomeNarrative: "By month six, the extra $200 has a home. You just can't say where.", financialQualityScore: 2, statEffects: { savings: -20, stress: 1 }, amount: 0, tone: "negative" },
            { id: "p9_split_it", label: "Split it — a little more breathing room day to day, the rest into savings.", outcomeNarrative: "Some of it disappears into life. Half of it, on purpose, doesn't.", financialQualityScore: 3, statEffects: { savings: 600, stress: 0 }, amount: 600, tone: "neutral" },
            { id: "p9_bank_it", label: "Route the whole extra $200 into savings automatically before you get used to seeing it in checking.", outcomeNarrative: "You never see the money long enough to miss it — and six months later, it's added up to something real.", financialQualityScore: 5, statEffects: { savings: 1200, stress: 0 }, amount: 1200, tone: "positive" },
          ],
        },
      ],
      nextChapterId: "credit_decision",
    },

    ending: {
      id: "ending",
      title: "Five years out",
      icon: "trophy",
      isEnding: true,
      narrative: "Five years out, your story continues.",
      choices: [],
      endingVariants: [
        {
          id: "high",
          minAvgQualityScore: 4,
          headline: "You'd retire at 58 with $2.1M",
          narrative:
            "Five years out, you own a home you can actually afford, your investments have started compounding in a way that surprises you when you check them, and you've never once had to put an emergency on a credit card.",
        },
        {
          id: "mixed",
          minAvgQualityScore: 2.8,
          headline: "You'd retire at 64 with $890K",
          narrative:
            "Five years out, you're doing fine — steady job, decent savings — but you can point to two or three moments where a different call would've put you in a noticeably stronger spot.",
        },
        {
          id: "lower",
          minAvgQualityScore: 0,
          headline: "You'd retire at 68 with $310K",
          narrative:
            "Five years out, you're keeping your head above water, but a string of short-term decisions means you're still catching up on debt from things that felt small at the time.",
        },
      ],
    },
  },
};
