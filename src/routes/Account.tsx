import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, ArrowLeft, BarChart3, CheckCircle2, Cloud, Loader2, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useGame } from "../engine/GameContext";
import { addEmailToAccount, logOut, refreshAuthUser, resendVerification, useAuthInfo } from "../engine/account";
import { LoginForm } from "../components/LoginForm";

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border p-5 sm:p-6" style={{ borderColor: "var(--hairline)", background: "var(--bg-panel-solid)" }}>
      {children}
    </div>
  );
}

export function Account() {
  const { profile } = useGame();
  const info = useAuthInfo();
  const [age13, setAge13] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [confirmAnonSignOut, setConfirmAnonSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { hash } = useLocation();
  const signOutRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLDivElement>(null);

  // The menu's "Sign out" links here with #signout.
  useEffect(() => {
    if (hash === "#signout") signOutRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [hash]);

  const doSignOut = async () => {
    setSigningOut(true);
    await logOut();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const err = await addEmailToAccount(email, password);
    setBusy(false);
    setMsg(err ? { text: err, ok: false } : { text: "Saved! Check your email to verify it.", ok: true });
  };

  const field = "rounded-xl border px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent)] focus:outline-none";
  const fieldStyle = { borderColor: "var(--hairline)", background: "var(--bg-panel-raised)" };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col gap-6 px-5 py-10 sm:py-14">
      <Link to="/" className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--ink-dim)] hover:text-[var(--ink)]">
        <ArrowLeft size={16} strokeWidth={2.5} /> Home
      </Link>

      <Panel>
        <div className="flex items-center gap-3">
          <UserRound size={22} style={{ color: "var(--accent)" }} />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-[var(--ink)]">{profile.username || "No username yet"}</span>
            <span className="text-xs text-[var(--ink-faint)]">
              {info.isAnonymous ? "Saved on this device" : info.email}
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-2xl px-4 py-3 text-xs leading-relaxed text-[var(--ink-dim)]" style={{ background: "var(--bg-panel-raised)" }}>
          <Cloud size={15} className="mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
          Your progress is backed up automatically. {info.isAnonymous
            ? "To play on another device or keep it if you clear your browser, add an email below (13+)."
            : "Log in with your email on any device to pick up where you left off."}
        </div>
      </Panel>

      {info.isAnonymous && (
        <div ref={saveRef}>
        <Panel>
          <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ink)]">
            <Mail size={17} style={{ color: "var(--accent)" }} /> Save my account with email
          </h2>
          <label className="flex items-start gap-2.5 text-sm text-[var(--ink)]">
            <input type="checkbox" checked={age13} onChange={(e) => setAge13(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
            I'm 13 or older.
          </label>
          {!age13 && (
            <p className="text-xs leading-relaxed text-[var(--ink-faint)]">
              Under 13? No problem — keep playing with just your username. Your progress stays on this device.
            </p>
          )}
          {age13 && (
            <form onSubmit={save} className="flex flex-col gap-2.5">
              <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={field} style={fieldStyle} />
              <input type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (6+ characters)" className={field} style={fieldStyle} />
              <button type="submit" disabled={busy} className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                {busy && <Loader2 size={15} className="animate-spin" />}
                Save account
              </button>
              <p className="text-[11px] leading-relaxed text-[var(--ink-faint)]">
                We only use your email to log you in and reset your password. No newsletters, never shared. <Link to="/privacy" className="underline">Privacy</Link>
              </p>
            </form>
          )}
          {msg && <span className="text-sm" style={{ color: msg.ok ? "var(--stat-savings)" : "var(--stat-debt)" }}>{msg.text}</span>}
          <div className="border-t pt-4" style={{ borderColor: "var(--hairline)" }}>
            {!showLogin ? (
              <button type="button" onClick={() => setShowLogin(true)} className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                Already saved an account on another device? Log in
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-[var(--ink-faint)]">Logging in replaces this device's progress with your saved account.</p>
                <LoginForm />
              </div>
            )}
          </div>
        </Panel>
        </div>
      )}

      {!info.isAnonymous && (
        <Panel>
          <div className="flex items-center gap-2 text-sm">
            {info.emailVerified ? (
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--stat-savings)" }}>
                <CheckCircle2 size={16} /> Email verified
              </span>
            ) : (
              <span className="flex flex-wrap items-center gap-2 text-[var(--ink-dim)]">
                Check your inbox to verify your email.
                <button type="button" onClick={() => void resendVerification().then(() => setMsg({ text: "Verification email sent.", ok: true }))} className="font-semibold" style={{ color: "var(--accent)" }}>
                  Resend
                </button>
                <button type="button" onClick={() => void refreshAuthUser().then(() => window.location.reload())} className="font-semibold" style={{ color: "var(--accent)" }}>
                  I verified it
                </button>
              </span>
            )}
          </div>
          {msg && <span className="text-sm" style={{ color: msg.ok ? "var(--stat-savings)" : "var(--stat-debt)" }}>{msg.text}</span>}
          {info.isAdmin && (
            <Link to="/admin" className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-white/5" style={{ borderColor: "var(--hairline)" }}>
              <BarChart3 size={16} style={{ color: "var(--accent)" }} /> Stats dashboard →
            </Link>
          )}
        </Panel>
      )}

      {/* Sign out */}
      <div ref={signOutRef}>
        <Panel>
          <h2 className="flex items-center gap-2 text-base font-bold text-[var(--ink)]">
            <LogOut size={17} style={{ color: "var(--accent)" }} /> Sign out
          </h2>
          {!info.isAnonymous ? (
            <>
              <p className="text-sm text-[var(--ink-dim)]">
                Your progress is saved to {info.email}. Sign back in any time with your email and password.
              </p>
              <button type="button" onClick={() => void doSignOut()} disabled={signingOut} className="flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-white/5 disabled:opacity-50" style={{ borderColor: "var(--hairline)" }}>
                {signingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />} Sign out of this device
              </button>
            </>
          ) : !confirmAnonSignOut ? (
            <>
              <p className="text-sm text-[var(--ink-dim)]">
                You haven't saved your account with an email yet, so signing out can't be undone.
              </p>
              <button type="button" onClick={() => setConfirmAnonSignOut(true)} className="flex w-fit items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-white/5" style={{ borderColor: "var(--hairline)" }}>
                <LogOut size={15} /> Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 rounded-2xl border p-4" style={{ borderColor: "color-mix(in srgb, var(--stat-debt) 50%, transparent)", background: "color-mix(in srgb, var(--stat-debt) 8%, transparent)" }}>
              <p className="flex items-start gap-2 text-sm text-[var(--ink)]">
                <AlertTriangle size={17} className="mt-0.5 shrink-0" style={{ color: "var(--stat-debt)" }} />
                <span>
                  If you sign out now, you'll lose <strong>{profile.username || "your username"}</strong>, your Life Points and your progress for good — and nobody can use that username again, including you.
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { setConfirmAnonSignOut(false); saveRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="rounded-xl px-4 py-2.5 text-sm font-bold" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>
                  Save my account first
                </button>
                <button type="button" onClick={() => void doSignOut()} disabled={signingOut} className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--stat-debt)", color: "var(--stat-debt)" }}>
                  {signingOut && <Loader2 size={15} className="animate-spin" />} Sign out anyway
                </button>
                <button type="button" onClick={() => setConfirmAnonSignOut(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--ink-dim)]">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Panel>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-[var(--ink-faint)]">
        <ShieldCheck size={13} /> <Link to="/privacy" className="underline">How Life-Path uses data</Link>
      </p>
    </div>
  );
}
