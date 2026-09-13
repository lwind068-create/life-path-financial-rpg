// Unlisted, dev-only decision log viewer. Never linked from player-facing
// UI. This is where the raw data behind the embedded assessment (see
// engine/scoring.ts for the ethical framing) is inspectable in full —
// nothing collected here is hidden from oversight, it's just not surfaced
// mid-game to the player.
import { useState } from "react";
import { lifePathArc } from "../content/arcs";
import { getDecisionLog, clearDecisionLog } from "../engine/logDecision";
import { computeAverageQualityScore, computeKnowledgeGain } from "../engine/scoring";

export function Debug() {
  const [log, setLog] = useState(() => getDecisionLog());

  const gainResults = computeKnowledgeGain(log, lifePathArc);
  const avgScore = computeAverageQualityScore(log, lifePathArc.id);

  const handleClear = () => {
    clearDecisionLog();
    setLog([]);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(log, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "decision-log.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-10 font-mono text-sm text-white">
      <div>
        <h1 className="text-xl font-bold">Debug: decision log</h1>
        <p className="mt-1 text-white/60">
          Internal-only view of every logged DecisionLogEntry, plus the computed
          baseline→mirror knowledge-gain signal for each pair in the story. Not linked from the game UI.
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold text-emerald-400">Knowledge gain (life_path)</h2>
        {gainResults.map((r) => (
          <div key={r.baselineChapterId} className="rounded border border-white/10 p-3">
            <div>baseline ({r.baselineChapterId}): {r.baselineScore ?? "—"}</div>
            <div>mirror ({r.mirrorChapterId}): {r.mirrorScore ?? "—"}</div>
            <div>gain: {r.gain ?? "—"}</div>
          </div>
        ))}
        <div>average quality score across whole story: {avgScore ?? "—"}</div>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-emerald-400">Raw log ({log.length} entries)</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="rounded border border-white/20 px-3 py-1 hover:bg-white/10"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded border border-red-400/40 px-3 py-1 text-red-300 hover:bg-red-400/10"
            >
              Clear log
            </button>
          </div>
        </div>
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/5">
              <tr>
                <th className="px-3 py-2">chapter</th>
                <th className="px-3 py-2">choice</th>
                <th className="px-3 py-2">score</th>
                <th className="px-3 py-2">timestamp</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="px-3 py-2">{entry.chapterId}</td>
                  <td className="px-3 py-2">{entry.choiceId}</td>
                  <td className="px-3 py-2">{entry.financialQualityScore}</td>
                  <td className="px-3 py-2">{new Date(entry.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
