// Player color options - presentational only, not arc content. Kept
// separate from arc files because the chosen color is reused by every arc
// (it persists across the whole Life-Path series, same as the player's
// name). There's no avatar/face picker - identity in the UI is just the
// name and this color, shown as an initial badge (see PlayerBadge.tsx).

export interface AccentOption {
  id: string;
  label: string;
  /** Primary brand color - buttons, progress fill, badge ring. */
  primary: string;
  /** Lighter companion, used for gradients. */
  secondary: string;
  /** Deep companion, used for card-background gradients. */
  deep: string;
  /** Text color that reads well on `primary`. */
  onPrimary: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: "emerald", label: "Emerald", primary: "#10b981", secondary: "#6ee7b7", deep: "#065f46", onPrimary: "#022c22" },
  { id: "violet", label: "Violet", primary: "#8b5cf6", secondary: "#c4b5fd", deep: "#4c1d95", onPrimary: "#1e1033" },
  { id: "amber", label: "Amber", primary: "#f59e0b", secondary: "#fcd34d", deep: "#78350f", onPrimary: "#2b1500" },
  { id: "rose", label: "Rose", primary: "#f43f5e", secondary: "#fda4af", deep: "#881337", onPrimary: "#2b0511" },
  { id: "sky", label: "Sky", primary: "#0ea5e9", secondary: "#7dd3fc", deep: "#0c4a6e", onPrimary: "#03181f" },
];

export const DEFAULT_ACCENT_ID = ACCENT_OPTIONS[0].id;

export function getAccent(id: string | null | undefined): AccentOption {
  return (
    ACCENT_OPTIONS.find((a) => a.id === id) ??
    UNLOCKABLE_ACCENTS.find((a) => a.id === id) ??
    ACCENT_OPTIONS[0]
  );
}

export interface UnlockableAccent extends AccentOption {
  /** Life Points cost to unlock this color permanently. */
  cost: number;
}

/**
 * Extra colors NOT offered at character creation - unlocked by spending
 * Life Points on the Character page (see routes/Character.tsx). Kept
 * separate from ACCENT_OPTIONS so the starter picker never shows a locked
 * swatch.
 */
export const UNLOCKABLE_ACCENTS: UnlockableAccent[] = [
  { id: "teal", label: "Teal", primary: "#14b8a6", secondary: "#5eead4", deep: "#134e4a", onPrimary: "#022c22", cost: 80 },
  { id: "crimson", label: "Crimson", primary: "#e11d48", secondary: "#fb7185", deep: "#4c0519", onPrimary: "#2b0511", cost: 150 },
  { id: "gold", label: "Gold", primary: "#eab308", secondary: "#fde047", deep: "#713f12", onPrimary: "#2b1c00", cost: 220 },
  { id: "ice", label: "Ice", primary: "#38bdf8", secondary: "#bae6fd", deep: "#0c4a6e", onPrimary: "#02131f", cost: 300 },
  { id: "magenta", label: "Magenta", primary: "#d946ef", secondary: "#f0abfc", deep: "#701a75", onPrimary: "#2b0630", cost: 400 },
];

// ---------------------------------------------------------------------------
// Titles - purely cosmetic flair text, unlocked with Life Points and shown
// next to the player's name on the Character page. No gameplay effect.
// ---------------------------------------------------------------------------

export interface Title {
  id: string;
  label: string;
  cost: number;
}

/** Always available, free, equipped by default - clears any purchased title. */
export const STARTER_TITLE: Title = { id: "none", label: "No title", cost: 0 };

export const UNLOCKABLE_TITLES: Title[] = [
  { id: "budget-boss", label: "Budget Boss", cost: 60 },
  { id: "risk-taker", label: "Risk Taker", cost: 120 },
  { id: "frugal-legend", label: "Frugal Legend", cost: 180 },
  { id: "market-mogul", label: "Market Mogul", cost: 260 },
  { id: "money-whisperer", label: "Money Whisperer", cost: 350 },
];

export function getTitle(id: string | null | undefined): Title {
  return UNLOCKABLE_TITLES.find((t) => t.id === id) ?? STARTER_TITLE;
}

// ---------------------------------------------------------------------------
// Badge frames - a decorative ring/glow around PlayerBadge, unlocked with
// Life Points. Purely cosmetic, layered on top of the accent-color ring.
// ---------------------------------------------------------------------------

export interface Frame {
  id: string;
  label: string;
  cost: number;
  /** Extra CSS box-shadow layer(s) drawn around the badge, on top of the accent ring. */
  ring: string;
}

/** Always available, free, equipped by default - clears any purchased frame. */
export const STARTER_FRAME: Frame = { id: "none", label: "No frame", cost: 0, ring: "" };

export const UNLOCKABLE_FRAMES: Frame[] = [
  { id: "halo", label: "Halo", cost: 90, ring: "0 0 0 3px #fde047, 0 0 16px 2px rgba(253,224,71,0.5)" },
  { id: "frost", label: "Frost", cost: 160, ring: "0 0 0 3px #bae6fd, 0 0 16px 2px rgba(186,230,253,0.5)" },
  { id: "ember", label: "Ember", cost: 240, ring: "0 0 0 3px #fb7185, 0 0 16px 2px rgba(251,113,133,0.5)" },
  { id: "royal", label: "Royal", cost: 320, ring: "0 0 0 3px #c4b5fd, 0 0 16px 2px rgba(196,181,253,0.5)" },
];

export function getFrame(id: string | null | undefined): Frame {
  return UNLOCKABLE_FRAMES.find((f) => f.id === id) ?? STARTER_FRAME;
}

