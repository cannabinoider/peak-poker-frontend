import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/styles";

type ChipProps = Omit<ComponentProps<"svg">, "color"> & {
  /** Outer diameter in px. Flutter `_BetChip` uses 16. */
  size?: number;
  /** Disc color (any CSS color). Default: gold. */
  color?: string;
  /** Rim color. Default: white. */
  rimColor?: string;
};

/**
 * A single poker chip as drawn in the Flutter app's bet badge: a solid gold disc with
 * a 2px white rim (the border is 2px at 16px and scales with `size`).
 */
export const Chip = ({
  size = 16,
  color = "rgb(var(--gold))",
  rimColor = "#fff",
  className,
  ...props
}: ChipProps) => (
  <svg
    aria-hidden
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={cn("shrink-0", className)}
    {...props}>
    <circle cx="8" cy="8" r="7" fill={color} stroke={rimColor} strokeWidth="2" />
  </svg>
);
