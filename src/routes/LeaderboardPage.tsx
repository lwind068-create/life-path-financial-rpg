import { Link } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { useGame } from "../engine/GameContext";
import { Leaderboard } from "../components/Leaderboard";

export function LeaderboardPage() {
  const { profile } = useGame();
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col gap-6 px-5 py-10 sm:py-14">
      <Link to="/" className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)]">
        <ArrowLeft size={16} strokeWidth={2.5} /> Home
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-[var(--ink)]">
          <Trophy size={24} style={{ color: "var(--accent)" }} /> Leaderboard
        </h1>
        <p className="text-sm text-[var(--ink-dim)]">
          Top 50 players by Life Points. Earn more by making smart choices, finishing quests and winning Arcade games.
        </p>
      </div>
      <Leaderboard
        playerName={profile.username || profile.characterName}
        playerNetWorth={profile.cumulativeStats.savings - profile.cumulativeStats.debt}
        playerLifePoints={profile.totalLifePointsEarned}
        size={50}
      />
    </div>
  );
}
