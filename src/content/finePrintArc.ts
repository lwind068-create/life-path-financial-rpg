// "Reading the Fine Print" story arc — content only. No game-engine logic
// lives here.
//
// Three chapters per playthrough: credit_decision -> pricing_decision ->
// ending. Both scenes share a theme — the numbers nobody double-checks
// before committing to them — without needing a baseline/mirror pair.
// The ending narrative still branches on the average financialQualityScore
// across both chapters (see src/engine/scoring.ts).
//
// The position of the highest-quality choice (score 5) is deliberately
// rotated across A/B/C from question to question — don't let it settle
// into a fixed slot, and vary each choice's opening phrasing so no lexical
// tic gives it away either.
import type { StoryArc } from "./types";

export const finePrintArc: StoryArc = {
  id: "fine_print",
  title: "Reading the Fine Print",
  blurb: "Credit cards and cost calculations — the numbers nobody double-checks.",
  nextArcTeaser: "Your story keeps going. More chapters on the way.",
  startChapterId: "credit_decision",
  pathLength: 3,
  chapters: {
    credit_decision: {
      id: "credit_decision",
      title: "No net",
      icon: "credit-card",
      narrative: "",
      choices: [],
      questions: [
        {
          id: "credit_q1_store_card",
          icon: "credit-card",
          variants: [
            { id: "v1", narrative: "A cashier at the store where you shop offers 20% off today if you open their store card — ninety seconds, no waiting. Do you take it?" },
            { id: "v2", narrative: "A cashier hands you a discount card application. Is it a good deal?" },
            { id: "v3", narrative: "20% off today for opening a card. What's your read?" },
          ],
          choices: [
            { id: "cr1_sign_up", label: "Sign up on the spot for the discount — 20% off is real money.", outcomeNarrative: "You save $18 today. The card's actual APR is the real cost, and it's not small.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
            { id: "cr1_ask_apr", label: "Ask what the card's APR is before signing anything, and skip it if it's high.", outcomeNarrative: "A 27% APR turns a one-time discount into a bad trade the moment you carry a balance.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
            { id: "cr1_pay_off_plan", label: "Sign up but tell yourself you'll pay it off immediately so the rate won't matter.", outcomeNarrative: "That's the plan. Plans about future you don't always hold up.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
          ],
        },
        {
          id: "credit_q2_limit",
          icon: "credit-card",
          variants: [
            { id: "v1", narrative: "A separate 0% APR card also shows up, offering up to $5,000 in credit. Do you request a specific limit, or take whatever they offer?" },
            { id: "v2", narrative: "They ask how much credit you want — up to $5,000 available. What do you say?" },
            { id: "v3", narrative: "A blank field for 'requested limit,' capped at $5,000, sits in the application. What do you put?" },
          ],
          choices: [
            { id: "cr2_whatever_offered", label: "Take whatever limit they offer automatically.", outcomeNarrative: "It's usually reasonable. You didn't actually think about what you needed.", financialQualityScore: 3, statEffects: { savings: -100, stress: 0 } },
            { id: "cr2_highest", label: "Request the highest limit they'll give you, just in case.", outcomeNarrative: "More available credit sounds safe. It's also more room to spend more than planned.", financialQualityScore: 2, statEffects: { savings: -550, stress: 1 } },
            { id: "cr2_what_you_need", label: "Request a limit close to what you'd actually need for planned purchases, not the max available.", outcomeNarrative: "A smaller limit means less temptation to treat available credit like income.", financialQualityScore: 5, statEffects: { savings: 550, stress: 0 } },
          ],
        },
        {
          id: "credit_q3_autopay",
          icon: "credit-card",
          variants: [
            { id: "v1", narrative: "The 0% card is approved with a $25 minimum payment due each month. Do you set up autopay?" },
            { id: "v2", narrative: "Missing one $25 minimum payment could end the 0% promo early and trigger the 24.99% rate. Do you automate it?" },
            { id: "v3", narrative: "A single missed $25 payment can undo the whole point of a 0% card. What's your setup?" },
          ],
          choices: [
            { id: "cr3_autopay_plus_reminder", label: "Set up autopay for at least the minimum, plus a calendar reminder to pay more when you can.", outcomeNarrative: "A missed payment can't quietly sabotage the deal you worked to get.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
            { id: "cr3_manual", label: "Plan to pay manually each month since you're usually on top of things.", outcomeNarrative: "Usually isn't always. One busy month is all it takes.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "cr3_skip_autopay", label: "Skip autopay — you'll remember, and it's one less thing connected to your bank account.", outcomeNarrative: "You'll remember, until the one month you don't.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
          ],
        },
        {
          id: "credit_q4_emergency_fund",
          icon: "credit-card",
          variants: [
            { id: "v1", narrative: "Do you start an emergency fund, or lean on the 0% card if something comes up?" },
            { id: "v2", narrative: "Do you build a cushion of your own, or plan to use credit instead?" },
            { id: "v3", narrative: "Something will eventually go wrong. Card or cash — which is your actual plan?" },
          ],
          choices: [
            { id: "cr4_card_as_cushion", label: "Plan to use the 0% card as your emergency fund, since it's already there.", outcomeNarrative: "It works until the 0% period ends and the 'emergency fund' starts charging you interest.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "cr4_start_saving", label: "Start setting aside a small amount specifically as cash savings, separate from the card.", outcomeNarrative: "When something breaks, you're not relying on a promotional rate with an expiration date.", financialQualityScore: 5, statEffects: { savings: 100, stress: 0 } },
            { id: "cr4_dont_think", label: "Don't think about it until something actually goes wrong.", outcomeNarrative: "Something goes wrong eventually. You'll be deciding under pressure instead of ahead of time.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
          ],
        },
        {
          id: "credit_q5_fine_print",
          icon: "credit-card",
          variants: [
            { id: "v1", narrative: "The 0% card's terms run a few pages — buried in there is a jump to 24.99% APR after month twelve. Do you actually read them?" },
            { id: "v2", narrative: "Fine print sits between you and knowing your rate jumps to 24.99% eventually. Do you skip it?" },
            { id: "v3", narrative: "Somewhere in the terms is a $0 annual fee and a 24.99% after-rate. Worth finding both?" },
          ],
          choices: [
            { id: "cr5_find_after_rate", label: "Read the terms enough to find the after-promo rate and any annual fee.", outcomeNarrative: "You know exactly what happens after month twelve, instead of finding out live.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
            { id: "cr5_skim_alarming", label: "Skim for anything that looks alarming and assume the rest is standard.", outcomeNarrative: "Most of it probably is standard. You're guessing on the part that matters.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "cr5_skip_entirely", label: "Skip it entirely — everyone just clicks agree.", outcomeNarrative: "Everyone does. Not everyone gets surprised by it later, but some do.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
          ],
        },
        {
          id: "credit_q6_first_purchase",
          icon: "credit-card",
          variants: [
            { id: "v1", narrative: "First real purchase on the new card. What do you buy with it?" },
            { id: "v2", narrative: "A 0% rate makes almost anything feel free for now. What's the first thing you charge?" },
            { id: "v3", narrative: "The card's active. What's the first purchase?" },
          ],
          choices: [
            { id: "cr6_wanted_item", label: "Something you've wanted but couldn't previously justify, since it's 'free' for a year.", outcomeNarrative: "It's not free. It's a bill with a delay on it.", financialQualityScore: 2, statEffects: { debt: 200, stress: 1 } },
            { id: "cr6_planned_expense", label: "A planned expense you were going to make anyway, like new work clothes.", outcomeNarrative: "Reasonable use. Still worth tracking against the eventual bill.", financialQualityScore: 3, statEffects: { debt: 100, stress: 0 } },
            { id: "cr6_essential_only", label: "Only the essential expense you already needed to make, and nothing extra because the rate is 0%.", outcomeNarrative: "The 0% rate doesn't change what you actually needed — it just changes when you pay for it.", financialQualityScore: 5, statEffects: { debt: 50, stress: 0 } },
          ],
        },
        {
          id: "credit_q7_statement",
          icon: "credit-card",
          variants: [
            { id: "v1", narrative: "The first statement arrives: $180 balance, $25 minimum due. What do you actually do with it?" },
            { id: "v2", narrative: "A $180 bill shows up in the mail for the first time. Read every line, or pay the $25 minimum and move on?" },
            { id: "v3", narrative: "First statement — $180 owed — first real look at how this card behaves. What do you check?" },
          ],
          choices: [
            { id: "cr7_minimum_only", label: "Pay the minimum due and move on without reading closely.", outcomeNarrative: "The minimum keeps you current. It doesn't tell you if anything's off.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
            { id: "cr7_check_charges", label: "Check every charge against what you actually remember spending.", outcomeNarrative: "You catch a small error before it becomes a habit of not checking.", financialQualityScore: 5, statEffects: { savings: 20, stress: 0 } },
            { id: "cr7_set_aside", label: "Set it aside to deal with later since nothing's due yet.", outcomeNarrative: "Nothing's due yet. That's exactly when it's easiest to lose track.", financialQualityScore: 2, statEffects: { savings: -20, stress: 1 } },
          ],
        },
        {
          id: "credit_q8_private_insurance",
          icon: "credit-card",
          variants: [
            { id: "v1", narrative: "A gap you've been meaning to close — health coverage, at $250-350 a month on the open market — is starting to feel risky to keep putting off. Do you finally shop for a plan?" },
            { id: "v2", narrative: "The coverage gap you've been living with hasn't gone away — still no protection against a $2,000+ ER bill. Do you close it now?" },
            { id: "v3", narrative: "Still uncovered, still one bad week from a four-figure bill. Time to get insured, or keep waiting?" },
          ],
          choices: [
            { id: "cr8_compare_and_enroll", label: "Compare a few marketplace plans against what you're actually spending on healthcare now, and enroll in one that fits.", outcomeNarrative: "You close the gap you knew was there, on your own terms instead of an emergency's.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
            { id: "cr8_cheapest_plan", label: "Get the cheapest plan available without really comparing what it covers.", outcomeNarrative: "You're covered, technically. What exactly you're covered for is less clear.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "cr8_keep_waiting", label: "Keep putting it off since nothing's gone wrong yet.", outcomeNarrative: "Nothing's gone wrong yet is doing the same job it always does — buying time you might not actually have.", financialQualityScore: 2, statEffects: { savings: -225, stress: 2 } },
          ],
        },
      ],
      nextChapterId: "pricing_decision",
    },

    pricing_decision: {
      id: "pricing_decision",
      title: "What do you charge?",
      icon: "tags",
      narrative: "",
      choices: [],
      questions: [
        {
          id: "price_q1_initial_approach",
          icon: "tags",
          randomEvent: {
            id: "generous_tip",
            chance: 0.2,
            bannerText: "Your first-ever customer rounds up and leaves a $5 tip on a $4.50 cup, just because they like what you're doing.",
            statEffects: { savings: 5 },
          },
          variants: [
            { id: "v1", narrative: "A few years after sorting out that first credit card, you've finally opened the coffee cart you'd been planning. Your cup of coffee needs a price tag. $3? $4? $5? How do you land on a number?" },
            { id: "v2", narrative: "The coffee cart is real now — years in the making. Before your first sale, that cup needs a number. Where does it come from?" },
            { id: "v3", narrative: "Cart built, beans ordered, first customers on the way. $3.50 feels safe. $5 feels bold. Pricing feels like it should be obvious. Is it?" },
          ],
          choices: [
            { id: "pr1_feels_right", label: "Look at what feels 'about right' for something like this.", outcomeNarrative: "It might be close. You won't know until you check.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "pr1_cost_per_unit", label: "Calculate your actual cost per unit — materials, time, overhead — before picking a price.", outcomeNarrative: "You start from what it actually costs you, not from a guess.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
            { id: "pr1_price_low", label: "Price it low to make sure people actually buy.", outcomeNarrative: "People buy. Whether you make money on each sale is a separate question you haven't answered.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
          ],
        },
        {
          id: "price_q2_competitor_research",
          icon: "tags",
          variants: [
            { id: "v1", narrative: "A friend says your $3.50 coffee is priced low compared to competitors. Do you actually check?" },
            { id: "v2", narrative: "Competitors are charging $4.50-5.00 for the same cup. Do you look at their prices before or after setting yours?" },
            { id: "v3", narrative: "'Everyone else charges $5' — is that true, or assumed?" },
          ],
          choices: [
            { id: "pr2_assume_friend", label: "Assume your friend's right without checking yourself.", outcomeNarrative: "They might be right. You still don't know your actual numbers either way.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
            { id: "pr2_glance_one", label: "Glance at one competitor's price and leave it at that.", outcomeNarrative: "One data point isn't really a comparison.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "pr2_check_several", label: "Check three or four comparable businesses' pricing and note where you actually land.", outcomeNarrative: "Now 'too high' or 'too low' is based on real numbers, not a feeling.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
          ],
        },
        {
          id: "price_q3_launch_discount",
          icon: "tags",
          mathChallenge: {
            prompt: "A $1-off cup that costs $1.20 to make loses you $0.20 each. Sell 500 of them during the launch week — what's the total loss?",
            answer: 100,
            unit: "$",
          },
          variants: [
            { id: "v1", narrative: "A launch discount — $1 off every cup for a week — could bring in early customers. Do you offer it?" },
            { id: "v2", narrative: "Everyone loves a grand-opening deal. A $1-off cup still needs to cover its $1.20 cost. Does the math love it too?" },
            { id: "v3", narrative: "A $1-off discount gets people in the door. Does it get you anything else?" },
          ],
          choices: [
            { id: "pr3_flat_20", label: "Offer a flat 20% off for the first month because it sounds generous.", outcomeNarrative: "It is generous. You picked the number before checking what it does to your margin.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "pr3_calc_discount", label: "Calculate what discount you can offer while still covering your actual costs, and cap it at that.", outcomeNarrative: "You get the early customers without quietly paying to serve them.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
            { id: "pr3_no_discount", label: "Skip discounting entirely — full price from day one, no exceptions.", outcomeNarrative: "It protects your margin completely. It might also cost you the early customers who'd have tried you for less.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
          ],
        },
        {
          id: "price_q4_refund_policy",
          icon: "tags",
          variants: [
            { id: "v1", narrative: "A customer wants their $4.50 back on a cup they didn't like. Do you set a clear refund policy before your first sale, or handle it case by case?" },
            { id: "v2", narrative: "Someone will eventually ask for that $4.50 back. Is there already a policy when they do?" },
            { id: "v3", narrative: "A single $4.50 refund is awkward to think about before you've sold anything. Worth doing anyway?" },
          ],
          choices: [
            { id: "pr4_write_policy", label: "Write a simple, clear policy before you need it, so you're not deciding under pressure later.", outcomeNarrative: "When the first refund request comes, you already know the answer instead of making it up on the spot.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
            { id: "pr4_case_by_case", label: "Plan to handle each request individually, based on how you feel about it.", outcomeNarrative: "It's flexible. It's also inconsistent in a way customers eventually notice.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "pr4_no_refunds", label: "Decide you won't do refunds at all, without really thinking through what that costs you in goodwill.", outcomeNarrative: "It protects your revenue today. It might cost you a customer's trust tomorrow.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
          ],
        },
        {
          id: "price_q5_changes_over_time",
          icon: "tags",
          variants: [
            { id: "v1", narrative: "Bean prices probably rise eventually — even a $0.20-per-pound jump eats into a $4.50 cup fast. Do you plan for that, or leave it until it's a problem?" },
            { id: "v2", narrative: "Costs rise. Does your pricing plan account for a $0.20 jump per pound of beans in advance?" },
            { id: "v3", narrative: "'We'll adjust when we need to' — is that actually a plan for a $0.20-per-pound cost increase?" },
          ],
          choices: [
            { id: "pr5_adjust_eventually", label: "Assume you'll adjust prices whenever it starts to feel necessary.", outcomeNarrative: "It usually feels necessary later than it should.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "pr5_fixed_prices", label: "Decide prices are fixed once set, to keep things simple for customers.", outcomeNarrative: "Simple for customers. Not simple for you if your costs go up and your prices don't.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
            { id: "pr5_scheduled_review", label: "Set a rough schedule to revisit pricing every few months against your actual costs.", outcomeNarrative: "Price changes become a routine check instead of a crisis reaction.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
          ],
        },
        {
          id: "price_q6_bundling",
          icon: "tags",
          variants: [
            { id: "v1", narrative: "Customers ask about a 10-cup punch card for $40 instead of $45 full price. Do you offer it?" },
            { id: "v2", narrative: "A $40 punch card for 10 cups moves more product. Does it move more profit?" },
            { id: "v3", narrative: "A $40-for-10-cups deal sounds appealing to customers. Is it appealing to your margin?" },
          ],
          choices: [
            { id: "pr6_sounds_good", label: "Offer a bundle discount that sounds good without checking what it does to your per-unit profit.", outcomeNarrative: "It sounds good. The math on it might not be.", financialQualityScore: 2, statEffects: { savings: -10, stress: 1 } },
            { id: "pr6_calc_bundle", label: "Calculate the bundle price based on your real margins, so it's a deal for them and still profitable for you.", outcomeNarrative: "Everyone wins, including the business — because you checked before offering it.", financialQualityScore: 5, statEffects: { savings: 10, stress: 0 } },
            { id: "pr6_skip_bundles", label: "Skip bundles entirely to avoid the complexity.", outcomeNarrative: "It's simpler. It's also revenue you're not capturing from customers who wanted to buy more.", financialQualityScore: 3, statEffects: { savings: -5, stress: 0 } },
          ],
        },
        {
          id: "price_q7_communicate_increase",
          icon: "tags",
          variants: [
            { id: "v1", narrative: "Costs have gone up enough that your $4.50 cup needs to become $4.75. Do you tell customers directly, or just quietly change the number?" },
            { id: "v2", narrative: "A $0.25 price increase is coming. How do you handle telling people?" },
            { id: "v3", narrative: "Nobody loves a $0.25 price increase. Does that mean you avoid announcing it?" },
          ],
          choices: [
            { id: "pr7_give_heads_up", label: "Give customers a heads-up before the increase takes effect, with a plain reason why.", outcomeNarrative: "A little advance notice turns a surprise into something customers can plan around, and most stay.", financialQualityScore: 5, statEffects: { savings: 225, stress: 0 } },
            { id: "pr7_change_quietly", label: "Just change the price quietly and deal with questions if they come up.", outcomeNarrative: "Some people notice right away and feel blindsided by it.", financialQualityScore: 3, statEffects: { savings: -40, stress: 0 } },
            { id: "pr7_delay_it", label: "Delay the increase as long as possible to avoid the awkward conversation.", outcomeNarrative: "The awkward conversation doesn't go away. It just gets paired with a bigger jump when you finally have it.", financialQualityScore: 2, statEffects: { savings: -225, stress: 1 } },
          ],
        },
        {
          id: "price_q8_final_call",
          icon: "tags",
          variants: [
            { id: "v1", narrative: "Time to actually set the price — $3.50, $4.50, or $5 — and stick with it. What guides the final call?" },
            { id: "v2", narrative: "You've thought it through. Where do you land between $3.50 and $5?" },
            { id: "v3", narrative: "Final pricing decision on the cup — what's the deciding factor?" },
          ],
          choices: [
            { id: "pr8_stay_low", label: "Keep prices low to build a customer base first — worry about margin later.", outcomeNarrative: "Customers love the prices, and you're busy every single day — barely breaking even once you total up your own time.", financialQualityScore: 2, statEffects: { savings: -225, stress: 2 } },
            { id: "pr8_bump_by_feel", label: "Bump prices up by a modest, round-feeling amount and see what happens.", outcomeNarrative: "A few customers grumble, most don't notice — a number that felt reasonable, not one you actually calculated.", financialQualityScore: 3, statEffects: { savings: -40, stress: 1 } },
            { id: "pr8_real_margin", label: "Set the price to the real margin you calculated, even if it lands above everyone else's.", outcomeNarrative: "Your price ends up the highest on the block, and what's left is a number that actually pays you for the work.", financialQualityScore: 5, statEffects: { savings: 300, stress: 0 } },
          ],
        },
        {
          id: "price_q9_first_profit_spending",
          icon: "tags",
          menuStyle: true,
          variants: [
            { id: "v1", narrative: "The cart just closed out its first genuinely profitable week — about $300 left over after every cost. What do you do with it?" },
            { id: "v2", narrative: "$300 in real profit, the first the cart has produced. Where does it actually go?" },
            { id: "v3", narrative: "First profitable week ever, $300 to show for it. What's the move?" },
          ],
          choices: [
            { id: "pr9_spend_on_self", label: "Pull it out and spend it on yourself right away — you earned it after weeks of work.", outcomeNarrative: "You did earn it. The cart still has nothing set aside for the week that isn't as good.", financialQualityScore: 2, statEffects: { savings: 30, stress: 1 }, amount: 30, tone: "negative" },
            { id: "pr9_set_aside_cushion", label: "Set it aside as the start of a real cushion for the business before touching any of it personally.", outcomeNarrative: "It's not exciting. It's also the first time the cart could survive a bad week without your help.", financialQualityScore: 5, statEffects: { savings: 300, stress: 0 }, amount: 300, tone: "positive" },
            { id: "pr9_split_it", label: "Split it — a small treat for yourself, the rest into the register float.", outcomeNarrative: "Some goes toward you, most goes back into keeping the cart steady.", financialQualityScore: 3, statEffects: { savings: 150, stress: 0 }, amount: 150, tone: "neutral" },
          ],
        },
      ],
      nextChapterId: "funding_choice",
    },

    fine_print_ending: {
      id: "fine_print_ending",
      title: "A few years in",
      icon: "trophy",
      isEnding: true,
      narrative: "A few years in, your story continues.",
      choices: [],
      endingVariants: [
        {
          id: "high",
          minAvgQualityScore: 4,
          headline: "You read every line before you signed",
          narrative:
            "A few years out, no card ever caught you off guard and no price you set ever quietly lost you money — because you did the math before committing, every time.",
        },
        {
          id: "mixed",
          minAvgQualityScore: 2.8,
          headline: "Mostly careful",
          narrative:
            "A few years out, you're doing alright, but you can point to a rate you didn't check or a price you didn't calculate that cost you more than it should have.",
        },
        {
          id: "lower",
          minAvgQualityScore: 0,
          headline: "Still finding out the hard way",
          narrative:
            "A few years out, you're still getting surprised by fine print and underpriced work more often than you'd like, because the numbers kept feeling like someone else's job to check.",
        },
      ],
    },
  },
};
