// Two analytics layers, both optional and best-effort:
//
// 1. Vercel Web Analytics (<Analytics /> in App.tsx) counts page views,
//    visitors, referrers, countries and devices. No code needed here.
// 2. Google Analytics for Firebase — funnel events (start clicked, chapter
//    finished, game finished, ending shared). Only runs when
//    VITE_FIREBASE_MEASUREMENT_ID is set; otherwise every call no-ops.
//
// Plus first-touch traffic source: the utm_source / utm_campaign on the
// link someone first arrived through (or the referring site), saved in
// localStorage and attached to their players/{sessionId} summary so
// `npm run stats` can report players and completion rate per channel.
// Never throws, never blocks gameplay.
import type { Analytics } from "firebase/analytics";
import { analyticsConfigured, firebaseApp } from "./firebaseClient";

export type FunnelEvent =
  | "start_clicked"
  | "chapter_completed"
  | "game_completed"
  | "ending_shared";

let analyticsPromise: Promise<Analytics | null> | null = null;

function getGa(): Promise<Analytics | null> {
  if (!analyticsConfigured || !firebaseApp) return Promise.resolve(null);
  if (!analyticsPromise) {
    analyticsPromise = import("firebase/analytics")
      .then(async ({ getAnalytics, isSupported }) =>
        (await isSupported()) ? getAnalytics(firebaseApp!) : null,
      )
      .catch(() => null);
  }
  return analyticsPromise;
}

export function track(event: FunnelEvent, params: Record<string, string | number | boolean> = {}): void {
  const source = getTrafficSource();
  void getGa()
    .then(async (ga) => {
      if (!ga) return;
      const { logEvent } = await import("firebase/analytics");
      logEvent(ga, event, { ...params, traffic_source: source.source, traffic_campaign: source.campaign });
    })
    .catch(() => {});
}

// ---------- traffic source (first touch) ----------

const SOURCE_KEY = "lifepath:trafficSource";

export interface TrafficSource {
  source: string;
  campaign: string;
  /** When this browser first opened the site (ms since epoch). */
  firstSeenAt?: number;
}

function clean(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40);
}

function detectSource(): TrafficSource {
  const params = new URLSearchParams(window.location.search);
  const utmSource = clean(params.get("utm_source") ?? params.get("ref"));
  const utmCampaign = clean(params.get("utm_campaign"));
  if (utmSource) return { source: utmSource, campaign: utmCampaign, firstSeenAt: Date.now() };

  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "");
      if (host && host !== window.location.hostname.replace(/^www\./, "")) {
        return { source: clean(host), campaign: "", firstSeenAt: Date.now() };
      }
    }
  } catch {
    // unparsable referrer — treat as direct
  }
  return { source: "direct", campaign: "", firstSeenAt: Date.now() };
}

/** First-touch source for this browser. Captured once, then remembered. */
export function getTrafficSource(): TrafficSource {
  try {
    const saved = window.localStorage.getItem(SOURCE_KEY);
    if (saved) return JSON.parse(saved) as TrafficSource;
    const fresh = detectSource();
    window.localStorage.setItem(SOURCE_KEY, JSON.stringify(fresh));
    return fresh;
  } catch {
    return detectSource();
  }
}
