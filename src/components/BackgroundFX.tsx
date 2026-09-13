/**
 * Purely decorative, fixed behind everything: two drifting blurred blobs
 * (player accent + a fixed jewel tone, so the scene never goes monochrome)
 * plus a faint grid to read as "arcade cabinet," not "gradient mesh SaaS bg."
 */
export function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: "var(--bg-void)" }}>
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <div
        className="bg-blob-a absolute -top-32 -left-32 h-[32rem] w-[32rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="bg-blob-b absolute -bottom-40 -right-24 h-[36rem] w-[36rem] rounded-full opacity-[0.18] blur-3xl"
        style={{ background: "var(--stat-stress)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--bg-void)_78%)]" />
    </div>
  );
}
