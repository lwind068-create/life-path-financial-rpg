import { motion } from "framer-motion";

export function About() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col gap-6 px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5"
      >
        <h1 className="text-2xl font-bold text-white sm:text-3xl">About Life-Path</h1>
        <p className="text-base leading-relaxed text-white/80">
          Life-Path is one continuous interactive story about the money moments everyone runs
          into after they're out on their own — a first paycheck, a surprise bill, a business of
          your own, a market that won't sit still.
        </p>
        <p className="text-base leading-relaxed text-white/80">
          It's told in six chapters, one flowing straight into the next: you build a character
          and live out years of decisions from your first job all the way to playing the stock
          market. Every choice is yours, your savings carry forward the whole way, and every
          playthrough tells a different story.
        </p>
        <p className="text-sm text-white/50">More chapters are on the way.</p>
      </motion.div>
    </div>
  );
}
