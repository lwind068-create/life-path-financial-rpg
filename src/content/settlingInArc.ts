// "Settling In" story arc — content only. No game-engine logic lives here.
//
// Three chapters per playthrough: housing_decision -> car_repair_decision
// -> ending. Neither chapter is flagged as a baseline/mirror pair — this
// arc doesn't carry its own pre/post measurement, it's a standalone pair
// of early-independence money scenes. The ending narrative still branches
// on the average financialQualityScore across both chapters (see
// src/engine/scoring.ts), same as every other arc.
//
// The position of the highest-quality choice (score 5) is deliberately
// rotated across A/B/C from question to question — don't let it settle
// into a fixed slot, and vary each choice's opening phrasing so no lexical
// tic gives it away either.
import type { StoryArc } from "./types";

export const settlingInArc: StoryArc = {
  id: "settling_in",
  title: "Settling In",
  blurb: "Rent, roommates, and the car that picks the worst week to break.",
  nextArcTeaser: "Your story keeps going. More chapters on the way.",
  startChapterId: "housing_decision",
  pathLength: 3,
  chapters: {
    housing_decision: {
      id: "housing_decision",
      title: "Building the base",
      icon: "home",
      narrative: "",
      choices: [],
      questions: [
        {
          id: "housing_q1_budget_cap",
          icon: "home",
          sliderStyle: true,
          variants: [
            { id: "v1", narrative: "Before you even look at listings — with take-home pay around $1,510 every two weeks — do you set a hard cap on rent?" },
            { id: "v2", narrative: "Apartment hunting usually starts with browsing. On a $44,000 salary, does it start with a number for you instead?" },
            { id: "v3", narrative: "A budget cap before the first listing, or after you've already fallen for the $1,200 one-bedroom with the rooftop?" },
          ],
          choices: [
            { id: "h1_firm_cap", label: "Set a firm rent ceiling based on your actual take-home pay before browsing anything.", outcomeNarrative: "Nothing you look at afterward is a decision made in the moment — the number was set before the temptation was.", financialQualityScore: 5, statEffects: { savings: 170, stress: 0 } },
            { id: "h1_rough_number", label: "Have a rough number in mind, loose enough to bend for the right place.", outcomeNarrative: "The number bends more than you expected the first time a place you love shows up.", financialQualityScore: 3, statEffects: { savings: -30, stress: 1 } },
            { id: "h1_see_as_you_go", label: "Start browsing and see what feels affordable as you go.", outcomeNarrative: "Everything feels affordable until you add it all up.", financialQualityScore: 2, statEffects: { savings: -170, stress: 2 } },
          ],
        },
        {
          id: "housing_q2_roommate",
          icon: "home",
          mathChallenge: {
            prompt: "$1,050 alone versus $700 split. How much does that monthly gap add up to over a full year?",
            answer: 4200,
            unit: "$",
          },
          variants: [
            { id: "v1", narrative: "$1,050 alone, $700 split with a friend, $550 in a shared house. How much does the roommate question actually weigh?" },
            { id: "v2", narrative: "Living alone costs $350 more a month than splitting a two-bedroom. Does that $4,200-a-year gap get compared honestly?" },
            { id: "v3", narrative: "Solo living sounds appealing at $1,050 a month. Does the actual $4,200-a-year gap get checked before deciding?" },
          ],
          choices: [
            { id: "h2_sounds_nice", label: "Lean toward living alone because it sounds nice, without pricing the difference.", outcomeNarrative: "It is nice. It's also a specific, checkable number you didn't check.", financialQualityScore: 3, statEffects: { savings: -80, stress: 1 } },
            { id: "h2_price_the_gap", label: "Price the exact monthly gap between solo and shared, then decide if it's worth it to you.", outcomeNarrative: "Now it's a real tradeoff you're choosing, not a vibe you're following.", financialQualityScore: 5, statEffects: { savings: 450, stress: 0 } },
            { id: "h2_rule_out", label: "Assume roommates are more hassle than they're worth and rule it out immediately.", outcomeNarrative: "Maybe. You ruled it out before finding out what it would've saved you.", financialQualityScore: 2, statEffects: { savings: -450, stress: 1 } },
          ],
        },
        {
          id: "housing_q3_lease_length",
          icon: "home",
          variants: [
            { id: "v1", narrative: "A 12-month lease at $700, or month-to-month at $850. Which do you take?" },
            { id: "v2", narrative: "Locking in a year saves $150 a month — $1,800 a year. Staying flexible costs that much more. How do you decide?" },
            { id: "v3", narrative: "A full year at $700, or the freedom to leave anytime for $150 extra a month?" },
          ],
          choices: [
            { id: "h3_month_to_month", label: "Take month-to-month without pricing the premium — flexibility feels worth it.", outcomeNarrative: "Flexibility is worth something. You didn't check if it was worth that much.", financialQualityScore: 2, statEffects: { savings: -200, stress: 2 } },
            { id: "h3_default_year", label: "Take the 12-month lease because everyone says that's what you're supposed to do.", outcomeNarrative: "It's usually the right call. You didn't actually verify it was this time.", financialQualityScore: 3, statEffects: { savings: -40, stress: 1 } },
            { id: "h3_compare_total", label: "Compare the total year-one cost of both options against how likely you are to move.", outcomeNarrative: "You know exactly what flexibility costs you, and you're choosing it on purpose or skipping it on purpose.", financialQualityScore: 5, statEffects: { savings: 200, stress: 0 } },
          ],
        },
        {
          id: "housing_q4_furnishing",
          icon: "home",
          variants: [
            { id: "v1", narrative: "Empty apartment, first paycheck already spent on rent. A full new furniture set runs about $2,000. How do you furnish it?" },
            { id: "v2", narrative: "A bed, a couch, a table — new for $2,000, or secondhand for a few hundred?" },
            { id: "v3", narrative: "Furnishing a first place adds up fast — easily $500 to $2,000 depending on the route. What's the plan?" },
          ],
          choices: [
            { id: "h4_only_what_needed", label: "Buy only what you truly need now, secondhand where you can, and fill in the rest over months.", outcomeNarrative: "The apartment looks a little sparse for a while. Your savings cushion doesn't disappear into a credit card.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
            { id: "h4_financed_set", label: "Buy a reasonable starter set from one store, financed over a few months since they offered.", outcomeNarrative: "It's furnished fast. You're paying a little interest on a couch for a while.", financialQualityScore: 3, statEffects: { debt: 200, stress: 1 } },
            { id: "h4_all_at_once", label: "Furnish it all at once, brand new, because a fresh start deserves nice things.", outcomeNarrative: "It looks great. It also ate the savings cushion you were building.", financialQualityScore: 2, statEffects: { savings: -500, stress: 1 } },
          ],
        },
        {
          id: "housing_q5_utilities",
          icon: "home",
          variants: [
            { id: "v1", narrative: "Electric, water, internet — easily $150-200 a month combined. How do you set them up?" },
            { id: "v2", narrative: "Internet plans in your area run anywhere from $40 to $80 a month for the same speed. Someone has to pick. How do you?" },
            { id: "v3", narrative: "Setting up service in your name for the first time, with a $40 spread between the cheapest and priciest internet plan — do you shop around?" },
          ],
          choices: [
            { id: "h5_leasing_office", label: "Sign up for whatever the leasing office recommends without comparing.", outcomeNarrative: "It works fine. You never found out if 'fine' was also 'cheapest.'", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
            { id: "h5_put_it_off", label: "Put it off for a few weeks since nothing's urgent yet.", outcomeNarrative: "Nothing's urgent until the power company calls about a deposit for a late setup.", financialQualityScore: 2, statEffects: { savings: -15, stress: 1 } },
            { id: "h5_compare_providers", label: "Spend twenty minutes comparing at least two providers before signing up.", outcomeNarrative: "Twenty minutes saves you a few dollars a month for the next year — a good trade.", financialQualityScore: 5, statEffects: { savings: 15, stress: 0 } },
          ],
        },
        {
          id: "housing_q6_renters_insurance",
          icon: "home",
          variants: [
            { id: "v1", narrative: "Renter's insurance is optional and runs about $15 a month. Do you get it?" },
            { id: "v2", narrative: "$15 a month protects thousands of dollars of stuff you own. Worth it?" },
            { id: "v3", narrative: "Nobody makes you spend $15 a month on renter's insurance. Do you anyway?" },
          ],
          choices: [
            { id: "h6_skip", label: "Skip it — nothing bad has happened to your stuff before.", outcomeNarrative: "Nothing bad has happened yet. That's not quite the same as nothing bad happening.", financialQualityScore: 2, statEffects: { savings: -90, stress: 2 } },
            { id: "h6_get_basic", label: "Get a basic policy — it's a few dollars a month for real protection on everything you own.", outcomeNarrative: "It's easy to forget it exists, right up until the one month you're glad you have it.", financialQualityScore: 5, statEffects: { savings: 90, stress: 0 } },
            { id: "h6_mean_to", label: "Mean to get it, keep meaning to, and never quite get around to it.", outcomeNarrative: "You'll get to it. Most people who say that do, eventually.", financialQualityScore: 3, statEffects: { savings: -15, stress: 1 } },
          ],
        },
        {
          id: "housing_q7_moving_costs",
          icon: "home",
          variants: [
            { id: "v1", narrative: "Boxes, a truck, maybe some help. Full-service movers want $600. How do you handle the actual move?" },
            { id: "v2", narrative: "Moving costs real money even when nothing you own is worth much yet — $600 for movers versus maybe $60 for a truck rental. What's the plan?" },
            { id: "v3", narrative: "Hiring movers for $600, or a $60 truck rental and some pizza — how do you decide?" },
          ],
          choices: [
            { id: "h7_truck_and_friends", label: "Get quotes for a small truck rental and rope in friends with pizza instead of paying full movers.", outcomeNarrative: "It costs you a tank of gas and a large pizza. The math works out well for a first apartment's worth of stuff.", financialQualityScore: 5, statEffects: { savings: 70, stress: 0 } },
            { id: "h7_hire_movers", label: "Hire movers without pricing alternatives, since it's one less thing to think about.", outcomeNarrative: "It's easy. It's also more than the truck-and-friends version would've been.", financialQualityScore: 3, statEffects: { savings: -10, stress: 1 } },
            { id: "h7_credit_card_move", label: "Put the move on a credit card and figure out logistics as you go.", outcomeNarrative: "The move happens. So does a balance you didn't need to carry.", financialQualityScore: 2, statEffects: { debt: 200, stress: 1 } },
          ],
        },
        {
          id: "housing_q8_first_month",
          icon: "home",
          variants: [
            { id: "v1", narrative: "First month's rent ($700) plus a deposit ($1,100), due before you even move in. $1,800 total. How do you cover it?" },
            { id: "v2", narrative: "Two payments at once — $700 rent, $1,100 deposit — right as you're starting a new job. What's the move?" },
            { id: "v3", narrative: "The $1,800 deposit-plus-rent number is bigger than either alone. How do you handle it?" },
          ],
          choices: [
            { id: "h8_credit_card", label: "Put it on a credit card since the paycheck hasn't cleared yet.", outcomeNarrative: "It's covered. It's also the first debt of your independent life, for something that didn't have to be debt.", financialQualityScore: 2, statEffects: { debt: 1800, stress: 2 } },
            { id: "h8_family_front", label: "Ask family to front it and pay them back over the first couple of months.", outcomeNarrative: "It works, and it's a favor you're aware you owe, even if nobody's counting.", financialQualityScore: 3, statEffects: { savings: -40, stress: 1 } },
            { id: "h8_saved_ahead", label: "Save toward it in the weeks before move-in so it's already covered when it's due.", outcomeNarrative: "The bill lands exactly like you planned for it to — because you planned for it.", financialQualityScore: 5, statEffects: { savings: -1800, stress: 0 } },
          ],
        },
      ],
      nextChapterId: "car_repair_decision",
    },

    car_repair_decision: {
      id: "car_repair_decision",
      title: "Playing it steady",
      icon: "wrench",
      narrative: "",
      choices: [],
      questions: [
        {
          id: "car_q1_quotes",
          icon: "wrench",
          randomEvent: {
            id: "loyalty_discount",
            chance: 0.2,
            bannerText: "One shop remembers you from an oil change last year and knocks $40 off just for being a returning customer.",
            statEffects: { savings: 40 },
          },
          variants: [
            { id: "v1", narrative: "The noise won't stop. The first quote is $800. Do you get more than one before committing to a shop?" },
            { id: "v2", narrative: "One mechanic already quoted $800. Do you call a second — even if it just saves you $100?" },
            { id: "v3", narrative: "An $800 repair quote showed up fast. Is it the only one you'll get?" },
          ],
          choices: [
            { id: "c1_two_more_quotes", label: "Call two more shops for quotes before deciding where to go.", outcomeNarrative: "The first quote wasn't the cheapest. Now you know that instead of guessing.", financialQualityScore: 5, statEffects: { savings: 90, stress: 0 } },
            { id: "c1_first_shop", label: "Go with the first shop that called back, since waiting on more calls feels like a hassle.", outcomeNarrative: "It's probably a fair price. 'Probably' again.", financialQualityScore: 3, statEffects: { savings: -15, stress: 0 } },
            { id: "c1_closest_shop", label: "Go with whichever shop is closest to home.", outcomeNarrative: "Convenient isn't the same as cheap, and this time it wasn't.", financialQualityScore: 2, statEffects: { savings: -90, stress: 1 } },
          ],
        },
        {
          id: "car_q2_diagnose",
          icon: "wrench",
          variants: [
            { id: "v1", narrative: "The shop says it needs an $800 fix. Do you ask what's actually wrong before agreeing?" },
            { id: "v2", narrative: "'It needs work, $800' isn't a diagnosis. Do you push for the specifics?" },
            { id: "v3", narrative: "Before handing over $800, do you actually understand what's broken?" },
          ],
          choices: [
            { id: "c2_take_their_word", label: "Take their word for it without asking for specifics.", outcomeNarrative: "They're probably right. You have no way to check.", financialQualityScore: 3, statEffects: { savings: -15, stress: 0 } },
            { id: "c2_agree_quickly", label: "Agree to the fix quickly so you can get your car back faster.", outcomeNarrative: "Fast doesn't always mean informed.", financialQualityScore: 2, statEffects: { savings: -90, stress: 1 } },
            { id: "c2_ask_why", label: "Ask them to explain exactly what's wrong and why it needs the fix they're proposing.", outcomeNarrative: "You understand the bill instead of just paying it.", financialQualityScore: 5, statEffects: { savings: 90, stress: 0 } },
          ],
        },
        {
          id: "car_q3_choosing_shop",
          icon: "wrench",
          variants: [
            { id: "v1", narrative: "Dealer shop wants $800. The independent place down the street quotes $620 for the same fix. Which do you pick?" },
            { id: "v2", narrative: "The dealer costs $180 more for the identical repair. Does that matter to you?" },
            { id: "v3", narrative: "Brand-name service at $800, or a trusted local place at $620?" },
          ],
          choices: [
            { id: "c3_go_dealer", label: "Go to the dealer because it feels more official.", outcomeNarrative: "It feels official. It also costs noticeably more for the same part.", financialQualityScore: 2, statEffects: { savings: -90, stress: 1 } },
            { id: "c3_check_independent", label: "Check reviews for a local independent shop and compare their price to the dealer's.", outcomeNarrative: "The independent shop does the same job for less, and now you know that's usually true.", financialQualityScore: 5, statEffects: { savings: 90, stress: 0 } },
            { id: "c3_friend_mention", label: "Go wherever a friend mentioned once, without checking reviews yourself.", outcomeNarrative: "It works out. You got lucky rather than informed.", financialQualityScore: 3, statEffects: { savings: -15, stress: 0 } },
          ],
        },
        {
          id: "car_q4_financing",
          icon: "wrench",
          variants: [
            { id: "v1", narrative: "$800 is more than you've got sitting loose right now. How do you cover it?" },
            { id: "v2", narrative: "The bill's bigger than your checking account balance. What's the plan?" },
            { id: "v3", narrative: "You need the fix today. The money isn't quite there. Now what?" },
          ],
          choices: [
            { id: "c4_emergency_fund", label: "Pull from the emergency fund you started building the day your first paycheck cleared.", outcomeNarrative: "It stings to watch the number drop, but nothing goes on a card.", financialQualityScore: 5, statEffects: { savings: -800, stress: 0 } },
            { id: "c4_credit_card", label: "Put it on a credit card and pay it off as soon as you can.", outcomeNarrative: "It gets paid off eventually. 'Eventually' costs a little in interest.", financialQualityScore: 3, statEffects: { debt: 800, stress: 1 } },
            { id: "c4_cheapest_fix", label: "Take the cheapest possible fix instead of the real one, to keep the number smaller.", outcomeNarrative: "The number's smaller today. The real fix is still waiting, and costing more later.", financialQualityScore: 2, statEffects: { savings: -90, stress: 2 } },
          ],
        },
        {
          id: "car_q5_warranty",
          icon: "wrench",
          variants: [
            { id: "v1", narrative: "The shop offers a 90-day warranty on the $800 repair. Does that change anything?" },
            { id: "v2", narrative: "A warranty on $800 worth of work — do you ask what it actually covers?" },
            { id: "v3", narrative: "90 days of coverage on an $800 repair. Worth understanding the fine print?" },
          ],
          choices: [
            { id: "c5_assume_covers", label: "Assume it covers everything and don't ask further.", outcomeNarrative: "It covers some things. You find out which ones the hard way, or you don't.", financialQualityScore: 2, statEffects: { savings: -90, stress: 1 } },
            { id: "c5_skim_it", label: "Skim the paper they hand you without really reading it.", outcomeNarrative: "You have a general sense of it. Not a specific one.", financialQualityScore: 3, statEffects: { savings: -15, stress: 0 } },
            { id: "c5_ask_specifics", label: "Ask exactly what the warranty covers and for how long, in plain terms.", outcomeNarrative: "You know precisely what you're covered for, which is worth more than the warranty itself sometimes.", financialQualityScore: 5, statEffects: { savings: 90, stress: 0 } },
          ],
        },
        {
          id: "car_q6_maintenance",
          icon: "wrench",
          variants: [
            { id: "v1", narrative: "The shop mentions you're due for a $300 brake job in a few months. Do you plan for it now?" },
            { id: "v2", narrative: "This $800 repair won't be the last one this car needs. Do you get ahead of the next $300-500 bill?" },
            { id: "v3", narrative: "Cars need upkeep on a schedule, usually $300-600 a year. Do you start tracking yours?" },
          ],
          choices: [
            { id: "c6_deal_later", label: "Nod along and figure you'll deal with it whenever it comes up.", outcomeNarrative: "You'll deal with it. Probably at the least convenient moment.", financialQualityScore: 3, statEffects: { savings: -15, stress: 1 } },
            { id: "c6_maintenance_fund", label: "Start a small separate fund specifically for expected car maintenance going forward.", outcomeNarrative: "The next repair doesn't blindside your budget the way this one did.", financialQualityScore: 5, statEffects: { savings: 90, stress: 0 } },
            { id: "c6_stop_thinking", label: "Decide the car's fine and stop thinking about maintenance until something breaks again.", outcomeNarrative: "Something will break again. You'll be exactly as unprepared as this time.", financialQualityScore: 2, statEffects: { savings: -90, stress: 2 } },
          ],
        },
        {
          id: "car_q7_roadside",
          icon: "wrench",
          variants: [
            { id: "v1", narrative: "Roadside assistance runs about $7 a month — $84 a year. Do you add it?" },
            { id: "v2", narrative: "A single tow costs $150-250. A year of roadside coverage costs $84. Do you sign up?" },
            { id: "v3", narrative: "You just found out car trouble costs $800. Does that change your mind about $84-a-year coverage?" },
          ],
          choices: [
            { id: "c7_add_now", label: "Add roadside assistance now, while the cost of not having it is fresh in mind.", outcomeNarrative: "It's a few dollars a month. The one time you need a tow, it pays for years of premiums.", financialQualityScore: 5, statEffects: { savings: 90, stress: 0 } },
            { id: "c7_eventually", label: "Mean to add it eventually, once things settle down.", outcomeNarrative: "Things rarely settle down on schedule.", financialQualityScore: 3, statEffects: { savings: -15, stress: 0 } },
            { id: "c7_skip_it", label: "Skip it — you just paid for a repair, why spend more right now.", outcomeNarrative: "The logic feels right in the moment. It's backwards for what roadside assistance is actually for.", financialQualityScore: 2, statEffects: { savings: -90, stress: 1 } },
          ],
        },
        {
          id: "car_q8_addons",
          icon: "wrench",
          variants: [
            { id: "v1", narrative: "While you're at the shop, they offer a $120 add-on inspection. Do you say yes?" },
            { id: "v2", narrative: "A $120 add-on inspection is on the table. Worth it, or an upsell?" },
            { id: "v3", narrative: "They're already under the hood and want $120 more to look at everything else. Do you let them?" },
          ],
          choices: [
            { id: "c8_yes_to_all", label: "Say yes to everything they suggest, since they're the experts.", outcomeNarrative: "Some of it was worth doing. Some of it wasn't, and you couldn't tell the difference.", financialQualityScore: 2, statEffects: { savings: -15, stress: 1 } },
            { id: "c8_no_to_all", label: "Say no to everything reflexively, assuming it's all upselling.", outcomeNarrative: "Some of it probably was upselling. Some of it might not have been.", financialQualityScore: 3, statEffects: { savings: -5, stress: 0 } },
            { id: "c8_ask_relevant", label: "Ask which specific checks are actually relevant to your car's mileage and skip the rest.", outcomeNarrative: "You get the one or two checks that actually matter and skip paying for the rest.", financialQualityScore: 5, statEffects: { savings: 15, stress: 0 } },
          ],
        },
      ],
      nextChapterId: "promotion_offer",
    },

    settling_ending: {
      id: "settling_ending",
      title: "A few years in",
      icon: "trophy",
      isEnding: true,
      narrative: "A few years in, your story continues.",
      choices: [],
      endingVariants: [
        {
          id: "high",
          minAvgQualityScore: 4,
          headline: "A home base that never rattles you",
          narrative:
            "A few years out, your rent and your car both run like clockwork — no scrambling when a bill or a breakdown hits, because you built room for both from the start.",
        },
        {
          id: "mixed",
          minAvgQualityScore: 2.8,
          headline: "Steady, mostly",
          narrative:
            "A few years out, you've got a decent place and a car that mostly behaves, but a rough month here or there reminds you how close to the edge a couple of those early calls left you.",
        },
        {
          id: "lower",
          minAvgQualityScore: 0,
          headline: "Still patching things together",
          narrative:
            "A few years out, the rent gets paid and the car gets fixed, but always a little later and a little more expensively than it needed to, because of a few corners cut early on.",
        },
      ],
    },
  },
};
