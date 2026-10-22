import { useState } from "react";
import { Loader2 } from "lucide-react";
import { logInWithEmail, sendReset } from "../engine/account";

/** Email + password login for players who already saved their account. */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const err = await logInWithEmail(email, password);
    setBusy(false);
    if (err) setMessage({ text: err, ok: false });
  };

  const reset = async () => {
    if (!email) return setMessage({ text: "Type your email first.", ok: false });
    const err = await sendReset(email);
    setMessage(err ? { text: err, ok: false } : { text: "Password reset email sent.", ok: true });
  };

  const field = "rounded-xl border px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] focus:outline-none";
  const fieldStyle = { borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5">
      <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={field} style={fieldStyle} />
      <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={field} style={fieldStyle} />
      <button type="submit" disabled={busy} className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
        {busy && <Loader2 size={15} className="animate-spin" />}
        Log in
      </button>
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={reset} className="text-xs font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)]">
          Forgot password?
        </button>
        {message && <span className="text-xs" style={{ color: message.ok ? "var(--stat-savings)" : "var(--stat-debt)" }}>{message.text}</span>}
      </div>
    </form>
  );
}
