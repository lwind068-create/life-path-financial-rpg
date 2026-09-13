// Short, randomized "time passes" flavor lines shown under every outcome,
// picked fresh each time a choice resolves. Purely a replay-variety/mood
// layer — never tied to a specific choice's content, so it needs no
// per-choice authoring, and never touches financialQualityScore rendering
// (the tier below is a coarse quality bucket, not the raw internal score).
const GREAT = [
  "That one quietly pays you back for months.",
  "You don't think about it again — which is exactly the point.",
  "It becomes the kind of habit that compounds without any more effort from you.",
  "A while later, it's just how you do things now.",
  "Nobody notices. That's usually how the good calls go.",
];

const OKAY = [
  "It works out, mostly — you get a little lucky on top of it.",
  "It's fine. Not great, not a disaster. Just fine.",
  "A while later, you can't quite remember why you didn't think harder about it.",
  "It holds up, for now.",
  "You'll probably revisit this one eventually.",
];

const ROUGH = [
  "That gap catches up with you a while later.",
  "It's a small thing that ends up costing more than it looked like at the time.",
  "You feel this one again the next time money's tight.",
  "It doesn't blow up — it just quietly adds friction.",
  "A while later, it's the kind of call you'd take back.",
];

export function pickAftermath(financialQualityScore: number): string {
  const pool = financialQualityScore >= 5 ? GREAT : financialQualityScore >= 3 ? OKAY : ROUGH;
  return pool[Math.floor(Math.random() * pool.length)];
}
