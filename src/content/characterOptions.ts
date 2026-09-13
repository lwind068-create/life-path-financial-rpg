// Player color options — presentational only, not arc content. Kept
// separate from arc files because the chosen color is reused by every arc
// (it persists across the whole Life-Path series, same as the player's
// name). There's no avatar/face picker — identity in the UI is just the
// name and this color, shown as an initial badge (see PlayerBadge.tsx).

export interface AccentOption {
  id: string;
  label: string;
  /** Primary brand color — buttons, progress fill, badge ring. */
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
  return ACCENT_OPTIONS.find((a) => a.id === id) ?? ACCENT_OPTIONS[0];
}
