import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AtSign, Check, Compass, Loader2, X } from "lucide-react";
import { useGame } from "../engine/GameContext";
import {
  USERNAME_MAX,
  claimUsername,
  fetchMyUsername,
  isUsernameAvailable,
  validateUsername,
} from "../engine/username";

/** First thing anyone sees: pick a unique username (shown on the leaderboard). */
export function UsernameScreen() {
  const { profile, setUsername } = useGame();
  const [draft, setDraft] = useState(() => (profile.characterName || "").replace(/[^A-Za-z0-9_]/g, "").slice(0, USERNAME_MAX));
  const [status, setStatus] = useState<"idle" | "checking" | "free" | "taken">("idle");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // If this browser already owns a username (e.g. site data was cleared), restore it.
  useEffect(() => {
    void fetchMyUsername().then((name) => {
      if (name) setUsername(name);
    });
  }, [setUsername]);

  const invalid = draft.length > 0 ? validateUsername(draft) : null;

  // Live availability check, debounced.
  useEffect(() => {
    if (!draft || invalid) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const t = window.setTimeout(() => {
      void isUsernameAvailable(draft).then((free) => setStatus(free === false ? "taken" : free ? "free" : "idle"));
    }, 400);
    return () => window.clearTimeout(t);
  }, [draft, invalid]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalid || saving) return;
    setSaving(true);
    setError(null);
    const result = await claimUsername(draft);
    setSaving(false);
    if (result.ok) setUsername(result.username);
    else {
      setError(result.message);
      if (result.reason === "taken") setStatus("taken");
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center gap-6 px-5 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 text-center">
        <Compass size={36} style={{ color: "var(--accent)" }} strokeWidth={2} />
        <h1 className="text-3xl font-extrabold text-[var(--ink)]">
          Welcome to Life<span style={{ color: "var(--accent)" }}>-Path</span>
        </h1>
        <p className="text-sm text-[var(--ink-dim)]">Pick a username. It's yours alone — it shows on the leaderboard.</p>
      </motion.div>

      <form
        onSubmit={submit}
        className="flex flex-col gap-3 rounded-3xl border p-6 shadow-2xl shadow-black/40"
        style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}
      >
        <label className="flex items-center gap-2 rounded-xl border px-3 py-3 focus-within:border-[var(--accent)]" style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" }}>
          <AtSign size={18} className="shrink-0 text-[var(--ink-faint)]" />
          <input
            autoFocus
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value.replace(/\s/g, "").slice(0, USERNAME_MAX));
              setError(null);
            }}
            placeholder="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none"
          />
          {status === "checking" && <Loader2 size={18} className="animate-spin text-[var(--ink-faint)]" />}
          {status === "free" && <Check size={18} style={{ color: "var(--stat-savings)" }} strokeWidth={3} />}
          {status === "taken" && <X size={18} style={{ color: "var(--stat-debt)" }} strokeWidth={3} />}
        </label>
        <p className="min-h-5 text-xs" style={{ color: error || invalid || status === "taken" ? "var(--stat-debt)" : status === "free" ? "var(--stat-savings)" : "var(--ink-faint)" }}>
          {error ?? invalid ?? (status === "taken" ? "That username is taken." : status === "free" ? "Available!" : `3–${USERNAME_MAX} letters, numbers or _`)}
        </p>
        <button
          type="submit"
          disabled={!draft || Boolean(invalid) || status === "taken" || saving}
          className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition-opacity disabled:opacity-40"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          Claim username
        </button>
        <p className="text-center text-[11px] leading-relaxed text-[var(--ink-faint)]">
          Don't use your real full name. Your username is saved to this browser.
        </p>
      </form>
    </div>
  );
}
