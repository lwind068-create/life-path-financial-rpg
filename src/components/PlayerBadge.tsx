interface PlayerBadgeProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = { sm: "h-9 w-9 text-xs", md: "h-12 w-12 text-sm", lg: "h-16 w-16 text-lg" };

/** Identity badge: the player's initial on their chosen color. No avatar/face. */
export function PlayerBadge({ name, size = "md" }: PlayerBadgeProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`font-display flex shrink-0 items-center justify-center rounded-full font-bold ${SIZE_CLASSES[size]}`}
      style={{
        background: "linear-gradient(135deg, var(--accent), var(--accent-deep))",
        color: "var(--accent-ink)",
        boxShadow: "0 0 0 2px color-mix(in srgb, var(--accent) 55%, transparent)",
      }}
    >
      {initial}
    </div>
  );
}
