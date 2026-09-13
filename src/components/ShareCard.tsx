import { forwardRef } from "react";
import { Flag } from "lucide-react";
import { getAccent } from "../content/characterOptions";

interface ShareCardProps {
  characterName: string;
  accentId?: string | null;
  headline: string;
  socialProofLine: string;
}

/** The visual card captured by html-to-image for download/share. */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ characterName, accentId, headline, socialProofLine }, ref) {
    const accent = getAccent(accentId);
    const initial = characterName.trim().charAt(0).toUpperCase() || "?";

    return (
      <div
        ref={ref}
        className="flex w-[420px] flex-col gap-6 rounded-2xl p-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${accent.primary}, ${accent.deep} 65%, var(--bg-void))`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/70">
            Life-Path
          </span>
          <Flag className="h-3.5 w-3.5 text-white/70" strokeWidth={2.5} />
        </div>

        <div className="flex items-center gap-4">
          <div
            className="font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold"
            style={{ background: "rgba(0,0,0,0.25)" }}
          >
            {initial}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-white/80">{characterName}'s path</span>
            <span className="text-2xl font-bold leading-snug">{headline}</span>
          </div>
        </div>

        <div className="rounded-lg bg-black/25 px-4 py-3 text-sm text-white/90">
          {socialProofLine}
        </div>

        <span className="text-xs text-white/60">Play your own path — link in bio</span>
      </div>
    );
  },
);
