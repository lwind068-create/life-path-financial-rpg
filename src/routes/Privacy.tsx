import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="mt-2 text-base font-bold text-[var(--ink)]">{children}</h2>;
const P = ({ children }: { children: React.ReactNode }) => <p className="text-sm leading-relaxed text-[var(--ink-dim)]">{children}</p>;

export function Privacy() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col gap-3 px-5 py-10 sm:py-14">
      <Link to="/" className="mb-2 flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)]">
        <ArrowLeft size={16} strokeWidth={2.5} /> Home
      </Link>
      <h1 className="text-2xl font-extrabold text-[var(--ink)]">Privacy &amp; how data is used</h1>
      <P>Life-Path is a free game built by a high school student to help people learn about money. Here's exactly what it collects and why.</P>

      <H2>What we collect</H2>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-[var(--ink-dim)]">
        <li><strong className="text-[var(--ink)]">Your username</strong> — shown on the public leaderboard with your points and in-game net worth.</li>
        <li><strong className="text-[var(--ink)]">Your game choices and scores</strong> — which options you pick, chapters finished, points, quests and Arcade scores.</li>
        <li><strong className="text-[var(--ink)]">How you found the site</strong> — e.g. "tiktok" or "direct", from the link you clicked.</li>
        <li><strong className="text-[var(--ink)]">Basic site visits</strong> — page views counted by Vercel Web Analytics, which doesn't use cookies.</li>
        <li><strong className="text-[var(--ink)]">Email (optional, 13+ only)</strong> — only if you choose to save your account. Used only to log in and reset your password.</li>
      </ul>

      <H2>What we don't collect</H2>
      <P>No real names (please don't use yours as a username), no birthdays, no location, no photos, no contacts. We never sell or share your data, and there are no ads.</P>

      <H2>Why</H2>
      <P>To run the game (saving progress, the leaderboard) and to learn whether it actually helps people make better money decisions. Results may be shared publicly — for example in a student research paper — but only as totals and averages (like "200 players, average improvement of X"). No individual player is ever identified.</P>

      <H2>Kids under 13</H2>
      <P>Players under 13 can play with just a username — we never ask them for an email or any other personal information.</P>

      <H2>Deleting your data</H2>
      <P>Want your username, scores or account deleted? Have a parent or guardian (or you, if you're 13+) email <a className="underline" href="mailto:lwind068@gmail.com">lwind068@gmail.com</a> with your username, and it will be removed.</P>

      <p className="mt-4 text-xs text-[var(--ink-faint)]">Last updated October 2026.</p>
    </div>
  );
}
