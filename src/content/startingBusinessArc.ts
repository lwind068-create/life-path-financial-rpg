// "Starting a Business" story arc — content only. No game-engine logic
// lives here.
//
// Three chapters per playthrough: funding_choice (baseline) -> growth_offer
// (mirror) -> biz_ending. See src/engine/scoring.ts for how the baseline
// and mirror chapters are compared, and that file's header comment for the
// ethical framing. The character (name and color) carries over from
// whichever arc the player built it in.
//
// As in firstJobArc.ts, the position of the score-5 choice is rotated
// across A/B/C per question on purpose — don't let it settle into a fixed
// slot, and vary each choice's opening phrasing so no lexical tic gives it
// away either.
import type { StoryArc } from "./types";

export const startingBusinessArc: StoryArc = {
  id: "starting_business",
  title: "Starting a Business",
  blurb: "Turn the side idea into something real — or don't.",
  nextArcTeaser: "Your story keeps going. More chapters on the way.",
  startChapterId: "funding_choice",
  pathLength: 3,
  chapters: {
    funding_choice: {
      id: "funding_choice",
      title: "Getting it off the ground",
      icon: "piggy-bank",
      isBaselineChoice: true,
      narrative: "",
      choices: [],
      questions: [
        {
          id: "fund_q1_how_much",
          icon: "piggy-bank",
          randomEvent: {
            id: "preorder_surprise",
            chance: 0.2,
            bannerText: "A friend spots what you're building on your phone and hands you $20 on the spot to pre-order one, before you've even opened.",
            statEffects: { savings: 20 },
          },
          variants: [
            { id: "v1", narrative: "A couple of years into your first job, the business idea won't leave you alone — a coffee cart, equipment and a first batch of inventory, a permit or two, and some cushion for the slow early weeks everyone warns you about. Before asking anyone for money, do you figure out exactly how much that adds up to, or just round up to a number that sounds right?" },
            { id: "v2", narrative: "The coffee cart idea that's been circling back for months finally needs real money: equipment, inventory, permits, a cushion for the slow weeks. $8,000 is the number floating in your head. Where did it actually come from?" },
            { id: "v3", narrative: "You're finally doing it — building the coffee cart you've been sketching for months. Equipment, a first batch of inventory, a permit or two, some breathing room for a slow start. Everyone says starting a business costs 'about this much,' somewhere around $8,000. Do you check what yours actually costs?" },
          ],
          choices: [
            { id: "f1_line_item", label: "Build a real line-item list of startup costs before settling on a number.", outcomeNarrative: "The real total comes out lower than the round number you started with.", financialQualityScore: 5, statEffects: { savings: 875, stress: 0 } },
            { id: "f1_round_up", label: "Round up from a rough guess to give yourself some cushion.", outcomeNarrative: "The cushion feels safe. It's also money borrowed without a specific reason.", financialQualityScore: 3, statEffects: { savings: -160, stress: 0 } },
            { id: "f1_ask_around", label: "Ask around for what other people needed to start something similar and use that.", outcomeNarrative: "Their business isn't yours. Their number isn't necessarily yours either.", financialQualityScore: 2, statEffects: { savings: -875, stress: 1 } },
          ],
        },
        {
          id: "fund_q2_compare_sources",
          icon: "piggy-bank",
          variants: [
            { id: "v1", narrative: "Family, a 9% bank loan, your own savings — do you check what each one would actually cost you?" },
            { id: "v2", narrative: "There's more than one way to raise $5,000. Do you compare them, or just take the first one offered?" },
            { id: "v3", narrative: "The same $5,000 from three different places behaves three different ways. Do you find out how?" },
          ],
          choices: [
            { id: "f2_first_that_comes", label: "Go with whichever source comes to mind first without comparing.", outcomeNarrative: "It might be the best option. You didn't actually check.", financialQualityScore: 3, statEffects: { savings: -100, stress: 0 } },
            { id: "f2_lay_out_tradeoffs", label: "Lay out what each funding source would actually cost — in interest, in favors owed, in flexibility lost.", outcomeNarrative: "Now you're choosing based on real tradeoffs instead of which idea occurred to you first.", financialQualityScore: 5, statEffects: { savings: 550, stress: 0 } },
            { id: "f2_fastest", label: "Take whichever source is fastest to access, since time feels like the priority.", outcomeNarrative: "Fast money is sometimes the most expensive money.", financialQualityScore: 2, statEffects: { savings: -550, stress: 1 } },
          ],
        },
        {
          id: "fund_q3_rate_shopping",
          icon: "piggy-bank",
          variants: [
            { id: "v1", narrative: "The first lender quotes 11% APR on a $5,000 loan. Do you take it, or shop for a better rate?" },
            { id: "v2", narrative: "One lender quoted 11%. On $5,000 over three years, a 4-point lower rate saves you real money. Is 11% the only quote you'll get?" },
            { id: "v3", narrative: "Loan rates on the same $5,000 can swing from 7% to 15% between lenders. Do you check?" },
          ],
          choices: [
            { id: "f3_first_lender", label: "Take the first lender's rate since applying multiple places feels like a hassle.", outcomeNarrative: "It's probably not the best rate available. You didn't find out.", financialQualityScore: 2, statEffects: { savings: -550, stress: 1 } },
            { id: "f3_one_more", label: "Ask one more place, informally, without a real comparison.", outcomeNarrative: "A little more information. Not quite enough to know if it's a good deal.", financialQualityScore: 3, statEffects: { savings: -100, stress: 0 } },
            { id: "f3_get_quotes", label: "Get quotes from at least two lenders and compare the actual APR, not just the headline rate.", outcomeNarrative: "You know the real cost of the money, not just what it was advertised as.", financialQualityScore: 5, statEffects: { savings: 550, stress: 0 } },
          ],
        },
        {
          id: "fund_q4_guarantee",
          icon: "piggy-bank",
          variants: [
            { id: "v1", narrative: "A $5,000 small-business loan might ask for a personal guarantee — meaning your own money covers it if the business can't. Do you understand that before signing?" },
            { id: "v2", narrative: "Some loans put your own savings on the line, dollar for dollar, if the business can't pay the $5,000 back. Do you check which kind this is?" },
            { id: "v3", narrative: "'Personal guarantee' on a $5,000 loan is buried in the paperwork. Do you read that part?" },
          ],
          choices: [
            { id: "f4_ask_directly", label: "Ask directly whether the loan requires a personal guarantee and what that puts at risk.", outcomeNarrative: "You know exactly what you're putting up, instead of finding out if the business struggles.", financialQualityScore: 5, statEffects: { savings: 550, stress: 0 } },
            { id: "f4_assume_standard", label: "Assume it's standard paperwork language and not worth worrying about.", outcomeNarrative: "It's standard. It's also not nothing.", financialQualityScore: 3, statEffects: { savings: -100, stress: 0 } },
            { id: "f4_skip_section", label: "Skip past that section since it's dense and the rest of the terms seem fine.", outcomeNarrative: "The rest of the terms being fine doesn't make that section not matter.", financialQualityScore: 2, statEffects: { savings: -550, stress: 1 } },
          ],
        },
        {
          id: "fund_q5_family_terms",
          icon: "piggy-bank",
          variants: [
            { id: "v1", narrative: "If your parents are lending you the full $8,000, do you put anything in writing?" },
            { id: "v2", narrative: "An informal $8,000 loan from people who love you — does that mean no terms at all?" },
            { id: "v3", narrative: "No bank would lend $8,000 without terms. Does that logic apply to family too?" },
          ],
          choices: [
            { id: "f5_stay_informal", label: "Keep it fully informal — writing anything down feels awkward with family.", outcomeNarrative: "It stays comfortable right up until someone's not sure what was actually agreed to.", financialQualityScore: 2, statEffects: { savings: -875, stress: 1 } },
            { id: "f5_verbal_rough", label: "Agree verbally on a rough amount and rough timeline, nothing written.", outcomeNarrative: "It's more than nothing. It's still easy to misremember six months from now.", financialQualityScore: 3, statEffects: { savings: -160, stress: 0 } },
            { id: "f5_write_it_down", label: "Write down the amount and a repayment plan, even informally, so everyone's on the same page.", outcomeNarrative: "A simple written note prevents the awkward conversation later about what was actually promised.", financialQualityScore: 5, statEffects: { savings: 875, stress: 0 } },
          ],
        },
        {
          id: "fund_q6_card_terms",
          icon: "piggy-bank",
          variants: [
            { id: "v1", narrative: "If a credit card covers part of the $8,000, do you check whether it's 19% APR or 27% APR first?" },
            { id: "v2", narrative: "Business credit cards for the same $8,000 balance can carry rates anywhere from 18% to 29%. Do you compare before applying?" },
            { id: "v3", narrative: "A card offering $8,000 in credit is easy to get approved for. Is the rate on it easy to understand?" },
          ],
          choices: [
            { id: "f6_whatever_bank", label: "Apply for whichever card your bank already offers, since it's convenient.", outcomeNarrative: "Convenient. Possibly not the best rate available to you.", financialQualityScore: 3, statEffects: { savings: -160, stress: 0 } },
            { id: "f6_compare_apr", label: "Compare the APR and any annual fee across a couple of business card options first.", outcomeNarrative: "A few minutes of comparison saves real money if you end up carrying any balance.", financialQualityScore: 5, statEffects: { savings: 875, stress: 0 } },
            { id: "f6_signup_bonus", label: "Apply for the card with the best sign-up bonus without checking the ongoing rate.", outcomeNarrative: "The bonus is a one-time number. The rate is the one that actually matters long-term.", financialQualityScore: 2, statEffects: { savings: -875, stress: 1 } },
          ],
        },
        {
          id: "fund_q7_savings_boundary",
          icon: "piggy-bank",
          variants: [
            { id: "v1", narrative: "You've got about $6,000 in personal savings. How much of it, if any, goes into this?" },
            { id: "v2", narrative: "Do you set a hard line — say, $3,000 max — on how much of that $6,000 cushion you're willing to risk?" },
            { id: "v3", narrative: "Your $6,000 in savings can fund a business. Should all $6,000 of it?" },
          ],
          choices: [
            { id: "f7_set_max", label: "Decide in advance on a maximum amount of personal savings you're willing to put in, and stick to it.", outcomeNarrative: "When the business asks for more later, you already have an answer instead of deciding under pressure.", financialQualityScore: 5, statEffects: { savings: 650, stress: 0 } },
            { id: "f7_as_needed", label: "Plan to use savings as needed without a specific cap in mind.", outcomeNarrative: "'As needed' has a way of becoming 'more than planned.'", financialQualityScore: 3, statEffects: { savings: -120, stress: 0 } },
            { id: "f7_whatever_it_takes", label: "Be ready to put in whatever it takes, since you believe in the idea.", outcomeNarrative: "Belief is real. It's also not a budget.", financialQualityScore: 2, statEffects: { savings: -650, stress: 1 } },
          ],
        },
        {
          id: "fund_q8_final_mix",
          icon: "piggy-bank",
          variants: [
            { id: "v1", narrative: "Time to actually fund this thing. What's the move?" },
            { id: "v2", narrative: "All the pieces are on the table. How do you actually put the money together?" },
            { id: "v3", narrative: "Decision time on how this gets funded." },
          ],
          choices: [
            { id: "f8_credit_card_all", label: "Put the whole $8,000 on a credit card — it's the fastest way to get moving, and revenue will cover it soon enough.", outcomeNarrative: "The card gets you open two weeks earlier than the other options would have. Interest starts compounding before your first sale does, and 'soon enough' turns out to be four months longer than you budgeted for.", financialQualityScore: 2, statEffects: { debt: 8000, stress: 2 } },
            { id: "f8_plan_and_loan", label: "Split it deliberately — savings plus a small loan with real terms, sized to what you actually need.", outcomeNarrative: "You come out needing less than you assumed — $5,200, not $8,000 — split between savings and a small loan with a fixed rate and a real payoff date.", financialQualityScore: 5, statEffects: { savings: -3200, debt: 2000, stress: 0 } },
            { id: "f8_family_loan", label: "Take the informal loan from your parents — it's the path of least resistance and they already said yes.", outcomeNarrative: "It's a genuine gift, and with no amount or timeline actually agreed on, you're never quite sure what you owe them at any given point.", financialQualityScore: 3, statEffects: { savings: -400, stress: 1 } },
          ],
        },
      ],
      nextChapterId: "growth_offer",
    },

    growth_offer: {
      id: "growth_offer",
      title: "Grow or get bought",
      icon: "building-2",
      isMirrorChoice: true,
      mirrorOf: "funding_choice",
      narrative: "",
      choices: [],
      questions: [
        {
          id: "grow_q1_valuation",
          icon: "building-2",
          variants: [
            { id: "v1", narrative: "Two years into running the coffee cart, a local coffee chain offers you $45,000 for it, outright. Do you know what the cart's actually worth before hearing their number?" },
            { id: "v2", narrative: "The coffee cart's grown into a real, profitable thing. Now a chain is offering $45,000 for it. Before agreeing to that number, do you value it yourself first?" },
            { id: "v3", narrative: "A chain wants to buy the coffee cart for $45,000. They named the number. Do you have your own to compare it to?" },
          ],
          choices: [
            { id: "g1_value_yourself", label: "Value the business yourself using your actual revenue, profit, and growth trend before hearing their offer.", outcomeNarrative: "Now you know if their number is fair before you're negotiating from a position of not knowing.", financialQualityScore: 5, statEffects: { savings: 2200, stress: 0 } },
            { id: "g1_rough_estimate", label: "Get a rough sense of value from a general online estimate.", outcomeNarrative: "It's a starting point. It's also generic, not built from your actual numbers.", financialQualityScore: 3, statEffects: { savings: -400, stress: 0 } },
            { id: "g1_trust_their_offer", label: "Trust that their offer is fair since they do this kind of deal regularly.", outcomeNarrative: "They do this regularly. That's exactly why they have more information than you do walking in.", financialQualityScore: 2, statEffects: { savings: -2200, stress: 1 } },
          ],
        },
        {
          id: "grow_q2_loan_terms",
          icon: "building-2",
          variants: [
            { id: "v1", narrative: "The bank's $20,000 expansion loan has its own terms — a different rate than your first one. Do you read them as closely as you did the first time?" },
            { id: "v2", narrative: "A second, bigger loan at $20,000, presumably easier since you've done this before. Does that mean less scrutiny?" },
            { id: "v3", narrative: "Experience with the first $5,200 loan — does it make you check the second $20,000 one less?" },
          ],
          choices: [
            { id: "g2_assume_similar", label: "Assume the terms are similar to last time without actually comparing them.", outcomeNarrative: "They might be. Assuming isn't the same as checking.", financialQualityScore: 3, statEffects: { savings: -400, stress: 0 } },
            { id: "g2_compare_terms", label: "Compare this loan's terms against your first one, and against at least one other lender.", outcomeNarrative: "Familiarity with the process doesn't mean this specific offer is automatically as good as the last one.", financialQualityScore: 5, statEffects: { savings: 2200, stress: 0 } },
            { id: "g2_skip_comparing", label: "Skip comparing rates this time since you're more experienced now and trust your gut.", outcomeNarrative: "Experience helps with judgment. It doesn't replace checking the actual numbers.", financialQualityScore: 2, statEffects: { savings: -2200, stress: 1 } },
          ],
        },
        {
          id: "grow_q3_risk_exposure",
          icon: "building-2",
          variants: [
            { id: "v1", narrative: "A second location means a second $20,000 loan payment either way. Do you check what happens to you personally if it underperforms?" },
            { id: "v2", narrative: "More risk this time — $20,000 on the line instead of $5,200. Do you size up what you personally could lose?" },
            { id: "v3", narrative: "The stakes nearly quadrupled the second time around. Does your risk check match that?" },
          ],
          choices: [
            { id: "g3_assume_similar", label: "Assume it'll work out about as well as the first location did.", outcomeNarrative: "The first time worked. That's not a guarantee about a different location with different variables.", financialQualityScore: 2, statEffects: { savings: -2200, stress: 1 } },
            { id: "g3_vague_sense", label: "Have a vague sense that it's riskier without putting a number on it.", outcomeNarrative: "Vague is better than nothing. It's not the same as knowing your actual exposure.", financialQualityScore: 3, statEffects: { savings: -400, stress: 0 } },
            { id: "g3_calculate_cost", label: "Calculate specifically what a slow first year at the second location would cost you personally.", outcomeNarrative: "The risk has a real number attached now, not just a feeling that it's 'more.'", financialQualityScore: 5, statEffects: { savings: 2200, stress: 0 } },
          ],
        },
        {
          id: "grow_q4_mentor",
          icon: "building-2",
          variants: [
            { id: "v1", narrative: "A $45,000-versus-$20,000 decision this size — do you talk it through with anyone who's done something similar before deciding?" },
            { id: "v2", narrative: "A decision worth tens of thousands of dollars — do you get an outside perspective, or decide solo?" },
            { id: "v3", narrative: "You've built real experience running one location. Is there still value in someone else's, on a $20,000 bet?" },
          ],
          choices: [
            { id: "g4_casual_friend", label: "Mention it to a friend in passing and get a casual opinion.", outcomeNarrative: "A casual opinion is something. It's not really a considered one.", financialQualityScore: 3, statEffects: { savings: -400, stress: 0 } },
            { id: "g4_ask_mentor", label: "Ask a mentor or advisor who's actually scaled a business to look over both offers with you.", outcomeNarrative: "Someone who's been through this exact fork in the road catches things you wouldn't have thought to check.", financialQualityScore: 5, statEffects: { savings: 2200, stress: 0 } },
            { id: "g4_decide_alone", label: "Decide entirely on your own — you know the business better than anyone else could.", outcomeNarrative: "You do know the business best. You don't necessarily know what a second location or a buyout deal typically looks like.", financialQualityScore: 2, statEffects: { savings: -2200, stress: 1 } },
          ],
        },
        {
          id: "grow_q5_leverage",
          icon: "building-2",
          variants: [
            { id: "v1", narrative: "A $45,000 buyout and a $20,000 loan, both real. Do you use having two offers to negotiate either one, or take whichever as given?" },
            { id: "v2", narrative: "Two offers worth $65,000 combined on the table is leverage. Do you spend it?" },
            { id: "v3", narrative: "Negotiating from having a $45,000 alternative in your pocket — do you actually do it?" },
          ],
          choices: [
            { id: "g5_mention_passing", label: "Mention the other offer in passing without really pushing on either number.", outcomeNarrative: "A soft mention. A soft response to match.", financialQualityScore: 3, statEffects: { savings: -400, stress: 0 } },
            { id: "g5_take_as_presented", label: "Take whichever offer as presented without negotiating at all.", outcomeNarrative: "You had two real offers and negotiated neither.", financialQualityScore: 2, statEffects: { savings: -2200, stress: 1 } },
            { id: "g5_use_as_leverage", label: "Use the buyout offer as leverage to push for better terms on the loan, or vice versa.", outcomeNarrative: "Having a genuine alternative is exactly the moment negotiating actually works.", financialQualityScore: 5, statEffects: { savings: 2200, stress: 0 } },
          ],
        },
        {
          id: "grow_q6_timeline",
          icon: "building-2",
          variants: [
            { id: "v1", narrative: "Both the $45,000 offer and the $20,000 loan have a deadline. Do you rush, or make time to actually think?" },
            { id: "v2", narrative: "A time-limited $45,000 offer creates pressure. Does that change how carefully you decide?" },
            { id: "v3", narrative: "Deadlines push people toward faster decisions on $65,000 combined worth of offers. Do you let this one?" },
          ],
          choices: [
            { id: "g6_ask_for_time", label: "Ask both parties for the maximum time they can realistically give you, and use every bit of it.", outcomeNarrative: "A few extra days of real analysis is worth more than the urgency of a self-imposed deadline.", financialQualityScore: 5, statEffects: { savings: 2200, stress: 0 } },
            { id: "g6_decide_in_window", label: "Decide within the timeline given without asking if there's flexibility.", outcomeNarrative: "The timeline might have had more give in it than you assumed.", financialQualityScore: 3, statEffects: { savings: -400, stress: 0 } },
            { id: "g6_rush_it", label: "Rush the decision because the pressure feels like it's real and non-negotiable.", outcomeNarrative: "Some deadlines are firmer than others. You didn't find out which kind this was.", financialQualityScore: 2, statEffects: { savings: -2200, stress: 1 } },
          ],
        },
        {
          id: "grow_q7_personal_impact",
          icon: "building-2",
          variants: [
            { id: "v1", narrative: "A $20,000 second location or a $45,000 exit both change your life, not just the business. Do you talk it through with the people it affects?" },
            { id: "v2", narrative: "This decision touches more than spreadsheets, even at $45,000 on the table. Do you loop in the people close to you?" },
            { id: "v3", narrative: "A $20,000 loan payment has personal consequences too. Do you account for that?" },
          ],
          choices: [
            { id: "g7_after_decided", label: "Mention the decision to family after you've basically already made up your mind.", outcomeNarrative: "They hear about it. They don't really get to weigh in on it.", financialQualityScore: 3, statEffects: { savings: -400, stress: 0 } },
            { id: "g7_talk_through", label: "Talk through what either path means for your time, stress, and finances with the people it actually affects.", outcomeNarrative: "You go into the decision knowing what it costs beyond the business itself, not just in dollars.", financialQualityScore: 5, statEffects: { savings: 2200, stress: 0 } },
            { id: "g7_keep_to_self", label: "Keep it entirely to yourself since it's your business and your call.", outcomeNarrative: "It is your call. It also affects people who'd probably want to know before it's final.", financialQualityScore: 2, statEffects: { savings: -2200, stress: 1 } },
          ],
        },
        {
          id: "grow_q8_final_call",
          icon: "building-2",
          variants: [
            { id: "v1", narrative: "Time to actually decide: $45,000 guaranteed, or a $20,000 bet on a bigger future. What tips it?" },
            { id: "v2", narrative: "You've gathered what you can. What's the deciding factor between $45,000 now and a shot at doubling revenue?" },
            { id: "v3", narrative: "Final call — take the $45,000, or borrow $20,000 to go bigger?" },
          ],
          choices: [
            { id: "g8_model_and_negotiate", label: "Model both outcomes against your real numbers — what the buyout is worth over ten years versus what the loan costs if the second location underperforms — and negotiate from whichever answer holds up.", outcomeNarrative: "The math surprises you, and you use it to negotiate a better price instead of walking away from the table — a decision built on numbers, not on which offer felt more exciting.", financialQualityScore: 5, statEffects: { savings: 2200, stress: 0 } },
            { id: "g8_take_buyout", label: "Take the buyout — it's the number you can actually count on, and you don't spend long weighing what a second location might have done.", outcomeNarrative: "You take the guaranteed payout. Part of you will always wonder what the second location would have turned into — you just never ran the numbers to find out.", financialQualityScore: 3, statEffects: { savings: -400, stress: 0 } },
            { id: "g8_take_loan", label: "Take the expansion loan — you've made it this far on instinct, and betting on yourself again feels right.", outcomeNarrative: "You sign the loan on momentum more than analysis, without really stress-testing whether the second location can cover its payment if the first one has a slow quarter.", financialQualityScore: 2, statEffects: { savings: -2200, stress: 1 } },
          ],
        },
        {
          id: "grow_q9_payout_spending",
          icon: "piggy-bank",
          menuStyle: true,
          variants: [
            { id: "v1", narrative: "However it shook out, $4,000 lands in your account that wasn't there before — the first real lump sum this business has ever handed you personally. What do you do with it?" },
            { id: "v2", narrative: "$4,000, sitting in checking, the first real personal payout this business has produced. Where does it go?" },
            { id: "v3", narrative: "The business finally paid you back — $4,000 at once. What's the move?" },
          ],
          choices: [
            { id: "g9_spend_to_celebrate", label: "Put a real chunk of it toward celebrating — you've earned a night to not think about spreadsheets.", outcomeNarrative: "You earned the night. You also earned the smaller number left over the next morning.", financialQualityScore: 3, statEffects: { savings: 800, stress: 0 }, amount: 800, tone: "neutral" },
            { id: "g9_pay_down_then_save", label: "Pay off anything you floated on a card during the deal first, then bank whatever's left.", outcomeNarrative: "The float disappears before it can quietly cost you interest, and the rest goes somewhere that actually holds onto it.", financialQualityScore: 5, statEffects: { savings: 2800, stress: 0 }, amount: 2800, tone: "positive" },
            { id: "g9_let_it_sit", label: "Leave it in checking with no plan and let everyday spending creep up now that there's a cushion.", outcomeNarrative: "Six months later you couldn't point to where most of it went.", financialQualityScore: 2, statEffects: { savings: 200, stress: 1 }, amount: 200, tone: "negative" },
          ],
        },
      ],
      nextChapterId: "hiring_decision",
    },

    biz_ending: {
      id: "biz_ending",
      title: "Where it lands",
      icon: "trophy",
      isEnding: true,
      narrative: "Where it lands.",
      choices: [],
      endingVariants: [
        {
          id: "high",
          minAvgQualityScore: 4,
          headline: "Two locations, no debt hanging over you",
          narrative:
            "A few years out, the business supports you and the people who work for you, you've paid down what you borrowed, and you make decisions from a plan instead of from panic.",
        },
        {
          id: "mixed",
          minAvgQualityScore: 2.8,
          headline: "One location, steady, still catching your breath",
          narrative:
            "A few years out, the business is still standing and mostly steady, but you can point to a few calls — a loan term, a hire, a slow month — that you'd handle differently now that you know better.",
        },
        {
          id: "lower",
          minAvgQualityScore: 0,
          headline: "Still open, still untangling the money",
          narrative:
            "A few years out, the doors are still open, but personal and business money got tangled early on, and you're still working out exactly what you owe and to whom.",
        },
      ],
    },
  },
};
