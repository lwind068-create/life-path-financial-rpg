import type { CSSProperties, ReactNode } from "react";
import { useGame } from "../engine/GameContext";
import { getAccent } from "../content/characterOptions";

/** Applies the player's chosen accent color as CSS custom properties to everything below it. */
export function AccentTheme({ children }: { children: ReactNode }) {
  const { profile } = useGame();
  const accent = getAccent(profile.accentId);

  return (
    <div
      style={
        {
          "--accent": accent.primary,
          "--accent-soft": accent.secondary,
          "--accent-deep": accent.deep,
          "--accent-ink": accent.onPrimary,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
