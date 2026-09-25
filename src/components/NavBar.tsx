import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Menu, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { useGame } from "../engine/GameContext";
import { PlayerBadge } from "./PlayerBadge";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { profile, resetStoryProgress, resetEverything } = useGame();
  const navigate = useNavigate();
  const hasStory = Boolean(profile.characterName);

  const close = () => setOpen(false);

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur"
      style={{
        borderColor: "var(--hairline)",
        background: "color-mix(in srgb, var(--bg-void) 88%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3 sm:px-8">
        <Link
          to="/"
          onClick={close}
          className="flex items-center gap-2 text-sm font-bold tracking-tight text-[var(--ink)]"
        >
          <Compass size={18} style={{ color: "var(--accent)" }} strokeWidth={2.25} />
          Life-Path
        </Link>

        <div className="flex items-center gap-3">
          {profile.characterName && (
            <Link to="/character" aria-label="Upgrade character">
              <PlayerBadge name={profile.characterName} size="sm" />
            </Link>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={open}
              className="flex h-9 w-9 items-center justify-center rounded-lg border text-[var(--ink)] transition-colors hover:bg-white/10"
              style={{ borderColor: "var(--hairline)" }}
            >
              <Menu size={18} strokeWidth={2} />
            </button>

            <AnimatePresence>
              {open && (
                <>
                  <button
                    type="button"
                    aria-hidden="true"
                    tabIndex={-1}
                    onClick={close}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 z-20 flex w-56 flex-col overflow-hidden rounded-xl border shadow-2xl shadow-black/40"
                    style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}
                  >
                    <Link
                      to="/"
                      onClick={close}
                      className="px-4 py-3 text-sm text-[var(--ink)] transition-colors hover:bg-white/5"
                    >
                      Home
                    </Link>
                    <Link
                      to="/play"
                      onClick={close}
                      className="px-4 py-3 text-sm text-[var(--ink)] transition-colors hover:bg-white/5"
                    >
                      {hasStory ? "Continue story" : "Play"}
                    </Link>
                    {hasStory && (
                      <Link
                        to="/character"
                        onClick={close}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--ink)] transition-colors hover:bg-white/5"
                      >
                        <Sparkles size={14} strokeWidth={2} style={{ color: "var(--accent)" }} />
                        Upgrade character
                      </Link>
                    )}
                    <Link
                      to="/about"
                      onClick={close}
                      className="px-4 py-3 text-sm text-[var(--ink)] transition-colors hover:bg-white/5"
                    >
                      About
                    </Link>
                    {hasStory && (
                      <button
                        type="button"
                        onClick={() => {
                          close();
                          resetStoryProgress();
                          navigate("/");
                        }}
                        className="flex items-center gap-2 border-t px-4 py-3 text-left text-sm text-[var(--ink-dim)] transition-colors hover:bg-white/5"
                        style={{ borderColor: "var(--hairline)" }}
                      >
                        <RotateCcw size={14} strokeWidth={2} />
                        Restart the story
                      </button>
                    )}
                    {hasStory && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!window.confirm("Reset everything? This clears your name, color, and story progress.")) return;
                          close();
                          resetEverything();
                          navigate("/");
                        }}
                        className="flex items-center gap-2 border-t px-4 py-3 text-left text-sm transition-colors hover:bg-white/5"
                        style={{ borderColor: "var(--hairline)", color: "var(--stat-debt)" }}
                      >
                        <Trash2 size={14} strokeWidth={2} />
                        Reset everything
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
