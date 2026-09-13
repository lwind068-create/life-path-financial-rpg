// "Running the Show" story arc — content only. No game-engine logic lives
// here.
//
// Three chapters per playthrough: hiring_decision -> cashflow_decision ->
// ending. Both scenes are business-operations vignettes — hiring your
// first person, surviving a slow month — without needing a baseline/mirror
// pair. The ending narrative still branches on the average
// financialQualityScore across both chapters (see src/engine/scoring.ts).
//
// The position of the highest-quality choice (score 5) is deliberately
// rotated across A/B/C from question to question — don't let it settle
// into a fixed slot, and vary each choice's opening phrasing so no lexical
// tic gives it away either.
import type { StoryArc } from "./types";

export const runningTheShowArc: StoryArc = {
  id: "running_the_show",
  title: "Running the Show",
  blurb: "Hire right, survive a slow month — the parts nobody warns you about.",
  nextArcTeaser: "Your story keeps going. More chapters on the way.",
  startChapterId: "hiring_decision",
  pathLength: 3,
  chapters: {
    hiring_decision: {
      id: "hiring_decision",
      title: "You can't do this alone anymore",
      icon: "users",
      narrative: "",
      choices: [],
      questions: [
        {
          id: "hire_q1_classification",
          icon: "users",
          variants: [
            { id: "v1", narrative: "The coffee cart is finally busy enough that you can't run it alone anymore. Before anyone starts at $15/hour, do you figure out if they're legally an employee or a contractor?" },
            { id: "v2", narrative: "Business at the cart is good — good enough that you're turning away customers during the morning rush and need your first hire. 'Employee' and 'contractor' aren't just labels on a $15/hour role — they come with different tax rules. Do you check which one applies?" },
            { id: "v3", narrative: "You've been running the coffee cart solo for a while, and it's finally outgrown you. How you classify your first $15/hour hire matters more than it sounds. Do you look into it?" },
          ],
          choices: [
            { id: "hi1_whatever_simpler", label: "Just call them whatever sounds simpler and move on.", outcomeNarrative: "The label you pick isn't actually up to preference — the rules are pickier than that.", financialQualityScore: 2, statEffects: { savings: -70, stress: 1 } },
            { id: "hi1_assume_contractor", label: "Assume contractor, since that's what most small businesses seem to do.", outcomeNarrative: "It's common. Common doesn't mean it's correct for your specific situation.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
            { id: "hi1_look_up_criteria", label: "Look up the actual criteria that separate an employee from a contractor before deciding.", outcomeNarrative: "Now the classification is based on the real rules, not on what sounded easiest.", financialQualityScore: 5, statEffects: { savings: 70, stress: 0 } },
          ],
        },
        {
          id: "hire_q2_wage",
          icon: "users",
          mathChallenge: {
            prompt: "At $15/hour for 15 hours a week, how much is that per week before taxes?",
            answer: 225,
            unit: "$",
          },
          variants: [
            { id: "v1", narrative: "$12 an hour? $15? $18? What do you actually pay them, and how do you land on a number?" },
            { id: "v2", narrative: "A $15/hour wage needs to cover the work and still leave you a margin. Do you check both sides?" },
            { id: "v3", narrative: "$12 an hour risks losing them. $20 an hour risks the business. How do you balance it?" },
          ],
          choices: [
            { id: "hi2_research_market", label: "Research what similar roles typically pay locally, and check it against what the business can actually sustain.", outcomeNarrative: "The number is grounded in both what's fair and what's realistic — not just one or the other.", financialQualityScore: 5, statEffects: { savings: 70, stress: 0 } },
            { id: "hi2_feels_fair", label: "Offer a number that feels fair without checking market rates either way.", outcomeNarrative: "It might be fair. You're guessing on both sides of that.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
            { id: "hi2_lowest_accept", label: "Offer the lowest amount you think they'll accept.", outcomeNarrative: "It saves money right up until they realize what the role's actually worth and leave.", financialQualityScore: 2, statEffects: { savings: -70, stress: 1 } },
          ],
        },
        {
          id: "hire_q3_vetting",
          icon: "users",
          variants: [
            { id: "v1", narrative: "They're a friend, so do you still run a real interview, or skip straight to yes?" },
            { id: "v2", narrative: "Hiring a friend feels different from hiring a stranger. Should the process be different too?" },
            { id: "v3", narrative: "Do you vet a friend the way you'd vet anyone else?" },
          ],
          choices: [
            { id: "hi3_casual_coffee", label: "Have a casual conversation about it over coffee and call it settled.", outcomeNarrative: "It's comfortable. It's also not really a hiring process.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
            { id: "hi3_real_conversation", label: "Have a real conversation about expectations, hours, and pay, even though you already know them.", outcomeNarrative: "Clarity now saves an awkward friendship conversation later.", financialQualityScore: 5, statEffects: { savings: 70, stress: 0 } },
            { id: "hi3_skip_it", label: "Skip any real conversation — you already know them, so what's there to ask?", outcomeNarrative: "Knowing someone socially isn't the same as knowing how they'll be to work with.", financialQualityScore: 2, statEffects: { savings: -70, stress: 1 } },
          ],
        },
        {
          id: "hire_q4_trial_period",
          icon: "users",
          variants: [
            { id: "v1", narrative: "Do you start with a trial period, or commit to a longer arrangement right away?" },
            { id: "v2", narrative: "A trial run protects both of you if it's not a fit. Do you set one up?" },
            { id: "v3", narrative: "Committing long-term from day one, or easing in?" },
          ],
          choices: [
            { id: "hi4_commit_indefinite", label: "Commit to a set schedule indefinitely from the very first day.", outcomeNarrative: "It's confident. It also leaves no easy off-ramp if it's not working out for either of you.", financialQualityScore: 2, statEffects: { savings: -70, stress: 1 } },
            { id: "hi4_vague_trial", label: "Mention it might be 'trial-ish' without actually defining what that means or how long.", outcomeNarrative: "A vague trial isn't really a trial — nobody knows when it ends or what happens next.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
            { id: "hi4_defined_trial", label: "Set a defined trial period with a specific check-in date to see how it's going.", outcomeNarrative: "Both of you know exactly when and how to evaluate whether this is working.", financialQualityScore: 5, statEffects: { savings: 70, stress: 0 } },
          ],
        },
        {
          id: "hire_q5_scheduling",
          icon: "users",
          variants: [
            { id: "v1", narrative: "15 hours a week at $15/hour is $225. How do you land on their actual hours and schedule?" },
            { id: "v2", narrative: "The gap between 10 hours ($150) and 20 hours ($300) a week is real money for both of you. Do you nail it down?" },
            { id: "v3", narrative: "'Come in when it's busy' sounds flexible. Does it turn into a $150 week or a $300 one?" },
          ],
          choices: [
            { id: "hi5_rough_hours", label: "Agree on a rough number of hours per week without specifying which days.", outcomeNarrative: "It's a start. The specifics get negotiated awkwardly, week by week.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
            { id: "hi5_specific_days", label: "Set specific days and hours in writing, even if it's simple and informal.", outcomeNarrative: "Neither of you has to guess or renegotiate what was agreed to.", financialQualityScore: 5, statEffects: { savings: 30, stress: 0 } },
            { id: "hi5_open_ended", label: "Keep it totally open-ended — come in whenever it's busy.", outcomeNarrative: "It's flexible. It's also unpredictable for both your schedules and their paycheck.", financialQualityScore: 2, statEffects: { savings: -30, stress: 1 } },
          ],
        },
        {
          id: "hire_q6_training",
          icon: "users",
          variants: [
            { id: "v1", narrative: "A few hours of paid training at $15/hour costs you $45-60 upfront. Do you spend it, or have them learn as they go?" },
            { id: "v2", narrative: "$60 of training time now. Does it save more than that later in mistakes avoided?" },
            { id: "v3", narrative: "'They'll pick it up' saves $60 in training pay today. Is that a plan, or a hope?" },
          ],
          choices: [
            { id: "hi6_block_training", label: "Block out real time upfront to actually train them properly before they're on their own.", outcomeNarrative: "It costs you a slower first week. It saves you the mistakes an undertrained hire makes for months.", financialQualityScore: 5, statEffects: { savings: 10, stress: 0 } },
            { id: "hi6_quick_overview", label: "Give a quick overview and let them figure out the rest as they go.", outcomeNarrative: "Some of it sticks. Some of it gets learned the hard way, on a customer.", financialQualityScore: 3, statEffects: { savings: -5, stress: 0 } },
            { id: "hi6_assume_smart", label: "Assume they're smart enough to figure it out without much guidance.", outcomeNarrative: "Smart doesn't replace knowing what you actually need them to know.", financialQualityScore: 2, statEffects: { savings: -10, stress: 1 } },
          ],
        },
        {
          id: "hire_q7_paying_on_time",
          icon: "users",
          variants: [
            { id: "v1", narrative: "That $225 a week needs to actually land in their account on time. How do you make sure it does?" },
            { id: "v2", narrative: "A payroll system for $225 a week, or just an app transfer whenever you remember?" },
            { id: "v3", narrative: "Getting that $225 reliably matters to them even if you're both easygoing about everything else." },
          ],
          choices: [
            { id: "hi7_whenever", label: "Pay them whenever you get around to it, since it's informal anyway.", outcomeNarrative: "It's informal until it's the reason they start looking for something more reliable.", financialQualityScore: 2, statEffects: { savings: -20, stress: 1 } },
            { id: "hi7_rough_payday", label: "Set a rough payday and mostly stick to it.", outcomeNarrative: "Mostly is good. The gaps are the part that erodes trust.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
            { id: "hi7_fixed_system", label: "Set a fixed, recurring payday and actually use a simple system to track it.", outcomeNarrative: "Reliable pay is one of the easiest ways to keep good people, and it costs you almost nothing to get right.", financialQualityScore: 5, statEffects: { savings: 20, stress: 0 } },
          ],
        },
        {
          id: "hire_q8_final_call",
          icon: "users",
          variants: [
            { id: "v1", narrative: "Time to actually bring them on at $15/hour. How do you finalize it?" },
            { id: "v2", narrative: "Last step before they start earning that $225 a week. What's the approach?" },
            { id: "v3", narrative: "Final call on how you hire them onto the payroll." },
          ],
          choices: [
            { id: "hi8_do_it_right", label: "Look into what actually separates an employee from a contractor, and set up payroll or a real contract correctly before their first shift.", outcomeNarrative: "It costs you an afternoon and some pride. It also means nothing about how you hired anyone can quietly turn into a problem eight months from now.", financialQualityScore: 5, statEffects: { savings: 20, stress: 0 } },
            { id: "hi8_figure_it_out", label: "Bring them on properly, more or less, and sort out the paperwork as you go instead of before you start.", outcomeNarrative: "You hire the right way in spirit. A couple of required forms get filed a few weeks late, and nothing catches up with you this time.", financialQualityScore: 3, statEffects: { savings: -10, stress: 1 } },
            { id: "hi8_cash_off_books", label: "Pay your friend in cash, off the books, to keep the whole thing simple for both of you.", outcomeNarrative: "It works fine for a few months. Then tax season arrives, and you realize you have no record of what you actually paid out.", financialQualityScore: 2, statEffects: { savings: -20, stress: 2 } },
          ],
        },
      ],
      nextChapterId: "cashflow_decision",
    },

    cashflow_decision: {
      id: "cashflow_decision",
      title: "A slow month",
      icon: "cloud-rain",
      narrative: "",
      choices: [],
      questions: [
        {
          id: "cash_q1_tracking",
          icon: "cloud-rain",
          variants: [
            { id: "v1", narrative: "The coffee cart's revenue is down $1,400 this month — a slow stretch, nothing catastrophic. Do you actually know where every dollar of its expenses is going?" },
            { id: "v2", narrative: "Before deciding what to cut to close a $1,400 gap at the cart, do you know what you're even spending on?" },
            { id: "v3", narrative: "A $1,400 shortfall at the cart means every expense matters more. Do you have a clear list of them?" },
          ],
          choices: [
            { id: "ca1_rough_sense", label: "Have a rough sense of the big expenses without listing the smaller ones.", outcomeNarrative: "The big ones are covered. The small ones add up more than expected.", financialQualityScore: 3, statEffects: { savings: -30, stress: 0 } },
            { id: "ca1_pull_all", label: "Pull up every recurring and one-time expense for the month before deciding anything.", outcomeNarrative: "You're cutting from a real list, not guessing at what might help.", financialQualityScore: 5, statEffects: { savings: 150, stress: 0 } },
            { id: "ca1_skip_review", label: "Skip the review — you'll just handle bills as they come due.", outcomeNarrative: "Handling bills as they come is a plan for reacting, not for getting ahead of it.", financialQualityScore: 2, statEffects: { savings: -150, stress: 1 } },
          ],
        },
        {
          id: "cash_q2_prioritize",
          icon: "cloud-rain",
          variants: [
            { id: "v1", narrative: "$900 rent, $400 supplier invoice, your own $300 draw — not everything can be paid on time this month. Do you decide what comes first?" },
            { id: "v2", narrative: "Priority matters when you're $1,400 short. Do you actually rank your bills?" },
            { id: "v3", narrative: "The $900 rent matters more to pay on time than some bills. Do you know which ones can wait?" },
          ],
          choices: [
            { id: "ca2_first_arrive", label: "Pay whichever bills arrive first, in the order they show up.", outcomeNarrative: "It's a system. It's not necessarily the right one.", financialQualityScore: 3, statEffects: { savings: -30, stress: 0 } },
            { id: "ca2_own_draw_first", label: "Pay your own draw first, since you need to eat too.", outcomeNarrative: "Fair instinct. It can also leave the business itself short on what keeps it running.", financialQualityScore: 2, statEffects: { savings: -150, stress: 1 } },
            { id: "ca2_rank_protect", label: "Rank bills by what actually protects the business most — rent, key suppliers — and pay in that order.", outcomeNarrative: "The things that would hurt most to lose get protected first.", financialQualityScore: 5, statEffects: { savings: 150, stress: 0 } },
          ],
        },
        {
          id: "cash_q3_vendor_comms",
          icon: "cloud-rain",
          variants: [
            { id: "v1", narrative: "A $400 supplier payment is due and tight this month. Do you say anything to them?" },
            { id: "v2", narrative: "Silence or a heads-up on that $400 — which do you give your vendor?" },
            { id: "v3", narrative: "Being late on $400 without warning versus with a warning. Does it matter?" },
          ],
          choices: [
            { id: "ca3_say_nothing", label: "Say nothing and just pay a few days late without explanation.", outcomeNarrative: "A few days late without warning reads differently than a few days late with one.", financialQualityScore: 2, statEffects: { savings: -40, stress: 1 } },
            { id: "ca3_ask_ahead", label: "Reach out before the due date and ask if a short delay is workable.", outcomeNarrative: "Most vendors appreciate the heads-up, and some will actually work with you on it.", financialQualityScore: 5, statEffects: { savings: 40, stress: 0 } },
            { id: "ca3_mention_after", label: "Mention it briefly after the fact, once the payment's already late.", outcomeNarrative: "It's honest, just later than it needed to be.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
          ],
        },
        {
          id: "cash_q4_line_of_credit",
          icon: "cloud-rain",
          variants: [
            { id: "v1", narrative: "You have access to a $3,000 business line of credit. Do you use it to cover this $1,400 gap?" },
            { id: "v2", narrative: "A $3,000 line of credit exists for exactly this kind of month. Do you tap $1,400 of it, or avoid it on principle?" },
            { id: "v3", narrative: "Using $1,400 of available credit versus avoiding debt entirely — how do you decide?" },
          ],
          choices: [
            { id: "ca4_specific_amount", label: "Use a small, specific amount from the line of credit, sized to exactly what the gap requires.", outcomeNarrative: "It's debt, used deliberately, for exactly the problem it exists to solve.", financialQualityScore: 5, statEffects: { debt: 600, stress: 0 } },
            { id: "ca4_avoid_principle", label: "Avoid it entirely on principle, even though it would solve the immediate problem cleanly.", outcomeNarrative: "The principle's reasonable. It also leaves you solving the same problem a harder way.", financialQualityScore: 3, statEffects: { savings: -60, stress: 1 } },
            { id: "ca4_max_out", label: "Max out what's available since you're already using it, just in case.", outcomeNarrative: "'Just in case' turns a small planned use into a bigger balance than the actual gap needed.", financialQualityScore: 2, statEffects: { debt: 1500, stress: 1 } },
          ],
        },
        {
          id: "cash_q5_cutting_costs",
          icon: "cloud-rain",
          variants: [
            { id: "v1", narrative: "Cutting the $200 marketing budget and $150 of extra inventory could close a third of the $1,400 gap. Do you look for cuts, or leave spending as-is and wait it out?" },
            { id: "v2", narrative: "A slow month is temporary. Should a $350 cost cut be too?" },
            { id: "v3", narrative: "Cutting $350 now — permanent changes, or a short-term dial-down?" },
          ],
          choices: [
            { id: "ca5_leave_as_is", label: "Leave everything as-is and just absorb the shortfall.", outcomeNarrative: "It's simple. It's also not actually addressing anything.", financialQualityScore: 2, statEffects: { savings: -150, stress: 1 } },
            { id: "ca5_easiest_cut", label: "Cut whatever feels easiest to cut without checking if it actually matters.", outcomeNarrative: "Something got cut. Whether it was the right thing is unclear.", financialQualityScore: 3, statEffects: { savings: -30, stress: 0 } },
            { id: "ca5_identify_pause", label: "Identify specific non-essential costs to pause just for this month, then resume when revenue recovers.", outcomeNarrative: "You get real relief now without permanently damaging things that were working.", financialQualityScore: 5, statEffects: { savings: 150, stress: 0 } },
          ],
        },
        {
          id: "cash_q6_negotiate_terms",
          icon: "cloud-rain",
          variants: [
            { id: "v1", narrative: "Do you ask your $400-a-month supplier for better payment terms going forward, not just this month?" },
            { id: "v2", narrative: "Net-30 vs net-60 on a $400 invoice makes a real difference in a slow month. Do you ask for it?" },
            { id: "v3", narrative: "That $400 payment term is often more negotiable than people assume. Do you find out?" },
          ],
          choices: [
            { id: "ca6_keep_current", label: "Keep the current terms as they are, since renegotiating feels like a hassle.", outcomeNarrative: "It's one less conversation. It's also one less lever you could've used.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
            { id: "ca6_ask_supplier", label: "Ask your main supplier if longer payment terms are possible going forward.", outcomeNarrative: "They say yes to a longer window, giving you real breathing room on future slow months too.", financialQualityScore: 5, statEffects: { savings: 40, stress: 0 } },
            { id: "ca6_assume_no", label: "Assume vendors won't budge and don't bother asking.", outcomeNarrative: "Some wouldn't. You don't find out which ones might have.", financialQualityScore: 2, statEffects: { savings: -40, stress: 1 } },
          ],
        },
        {
          id: "cash_q7_rebuild_buffer",
          icon: "cloud-rain",
          variants: [
            { id: "v1", narrative: "Once the slow month passes, do you rebuild the $600 cushion you used, or move on?" },
            { id: "v2", narrative: "The dip is over. Does the plan include replacing the $600 it cost?" },
            { id: "v3", narrative: "Recovery isn't just revenue coming back — is it also rebuilding the $600 you spent?" },
          ],
          choices: [
            { id: "ca7_set_aside_rebuild", label: "Set aside a specific amount from the next few good months to rebuild exactly what the slow month used.", outcomeNarrative: "The next slow month doesn't start from zero, because this one didn't end there either.", financialQualityScore: 5, statEffects: { savings: 70, stress: 0 } },
            { id: "ca7_assume_even_out", label: "Assume things will naturally even back out without a specific plan.", outcomeNarrative: "Revenue might even out. The buffer doesn't rebuild itself without a decision to do it.", financialQualityScore: 3, statEffects: { savings: -10, stress: 0 } },
            { id: "ca7_spend_as_normal", label: "Treat the recovered revenue as normal income and spend it as such.", outcomeNarrative: "It feels normal. It's actually money that has a job already — replacing what the slow month cost.", financialQualityScore: 2, statEffects: { savings: -70, stress: 1 } },
          ],
        },
        {
          id: "cash_q8_final_response",
          icon: "cloud-rain",
          variants: [
            { id: "v1", narrative: "Stepping back — the $1,400 gap is real. How do you actually close it?" },
            { id: "v2", narrative: "The month's numbers are in: $1,400 short. What's your real move?" },
            { id: "v3", narrative: "Final call on how you cover this $1,400 slow stretch." },
          ],
          choices: [
            { id: "ca8_personal_savings", label: "Pull whatever you need from your personal savings without tracking exactly how much or noting it anywhere.", outcomeNarrative: "The bills get paid, and the immediate problem disappears. You've blurred your personal and business money together in a way that'll take a real afternoon to untangle later.", financialQualityScore: 2, statEffects: { savings: -600, stress: 2 } },
            { id: "ca8_business_card", label: "Put the gap on the business credit card and plan to pay it down as soon as next month picks back up.", outcomeNarrative: "It covers the shortfall without much drama. Next month is decent but not as strong as you hoped, so the balance sticks around a little longer than planned, stacked on what you already owe.", financialQualityScore: 3, statEffects: { debt: 600, stress: 1 } },
            { id: "ca8_emergency_fund", label: "Pull from the business emergency fund you sized off your worst-case month before you ever opened, exactly for a gap like this one.", outcomeNarrative: "This is precisely what the fund was built for. The dip gets covered without touching your personal accounts and without adding a cent of new debt.", financialQualityScore: 5, statEffects: { savings: -600, stress: 0 } },
          ],
        },
        {
          id: "cash_q9_rebound_spending",
          icon: "cloud-rain",
          menuStyle: true,
          variants: [
            { id: "v1", narrative: "The next month rebounds hard — revenue comes in $800 over a normal month. What do you do with the extra?" },
            { id: "v2", narrative: "Business swings back, $800 ahead of a typical month. Where does that surplus go?" },
            { id: "v3", narrative: "The slow stretch passes and $800 in extra revenue shows up. What's the plan for it?" },
          ],
          choices: [
            { id: "ca9_let_it_relax", label: "Treat it as a sign things are fine now and let spending loosen up across the board.", outcomeNarrative: "It feels fine, right up until the next slow month arrives and the cushion isn't back where it was.", financialQualityScore: 2, statEffects: { savings: 100, stress: 1 }, amount: 100, tone: "negative" },
            { id: "ca9_refill_fund_first", label: "Put it straight back into refilling the emergency fund to what it was before the shortfall.", outcomeNarrative: "The fund's whole again, ready for the next slow month before it even shows up.", financialQualityScore: 5, statEffects: { savings: 800, stress: 0 }, amount: 800, tone: "positive" },
            { id: "ca9_split_it", label: "Split it — partially refill the fund, keep some as breathing room.", outcomeNarrative: "The fund's healthier than it was. Not all the way back, but closer.", financialQualityScore: 3, statEffects: { savings: 400, stress: 0 }, amount: 400, tone: "neutral" },
          ],
        },
      ],
      nextChapterId: "opening_account",
    },

    running_show_ending: {
      id: "running_show_ending",
      title: "A few years in",
      icon: "trophy",
      isEnding: true,
      narrative: "A few years in, your story continues.",
      choices: [],
      endingVariants: [
        {
          id: "high",
          minAvgQualityScore: 4,
          headline: "A business that runs without you holding your breath",
          narrative:
            "A few years out, the people you hired are paid on time, the books are clean, and a slow month is a blip, not a crisis — because you built the systems for both before you needed them.",
        },
        {
          id: "mixed",
          minAvgQualityScore: 2.8,
          headline: "Standing, mostly steady",
          narrative:
            "A few years out, the business is still running and mostly stable, but you can point to a hire or a slow month you'd handle differently now that you know better.",
        },
        {
          id: "lower",
          minAvgQualityScore: 0,
          headline: "Still running on patches",
          narrative:
            "A few years out, the doors are still open, but payroll and cash flow both still feel like they're held together with good intentions instead of a real system.",
        },
      ],
    },
  },
};
