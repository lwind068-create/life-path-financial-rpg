import { useEffect, useRef, useState, type CSSProperties } from "react";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  durationMs?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Count-up/count-down number ticker — the "number moving" dopamine hook
 * used on every stat change. Pure CSS/rAF, no backend involved.
 */
export function AnimatedNumber({
  value,
  prefix = "",
  durationMs = 800,
  className,
  style,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      // ease-out cubic
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const negative = displayValue < 0;
  const magnitude = Math.abs(displayValue).toLocaleString();

  return (
    <span className={`tabular-nums transition-colors duration-300 ${className ?? ""}`} style={style}>
      {negative ? "-" : ""}
      {prefix}
      {magnitude}
    </span>
  );
}
