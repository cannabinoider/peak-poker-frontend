import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/styles";

import { Chip } from "./chip";

type ChipStackProps = ComponentProps<"span"> & {
  /** Number of chips drawn (clamped to 1..10). */
  count?: number;
  /** Chip diameter in px. */
  size?: number;
  /** Vertical step between chips in px. Default: a quarter of `size`. */
  step?: number;
  /** Disc color for every chip (any CSS color). Default: gold. */
  color?: string;
};

/**
 * A short vertical stack of the app's gold chips. The Flutter app has no stack widget
 * (it always shows a single chip); this composes `Chip` for larger pots.
 */
export const ChipStack = ({
  count = 3,
  size = 16,
  step,
  color,
  className,
  style,
  ...props
}: ChipStackProps) => {
  const n = Math.min(10, Math.max(1, Math.round(count)));
  const dy = step ?? size / 4;
  return (
    <span
      aria-hidden
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size + dy * (n - 1), ...style }}
      {...props}>
      {Array.from({ length: n }, (_, i) => (
        <Chip
          key={i}
          size={size}
          color={color}
          className="absolute left-0"
          style={{ bottom: i * dy }}
        />
      ))}
    </span>
  );
};
